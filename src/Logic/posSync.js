// src/Logic/posSync.js
// Offline-first sync for POS orders.
// - POS orders are always saved in IndexedDB first ("pos-orders").
// - Whenever internet is available, pending orders are pushed to Supabase
//   `orders` + `order_items` (same tables the website uses).
// - Safe to call from many places: only one sync runs at a time.

import { get, update } from "idb-keyval";
import { supabase } from "../supabas.js";

export const POS_ORDERS = "pos-orders";
export const POS_EVENT = "pos-orders-updated";

const notify = () => window.dispatchEvent(new Event(POS_EVENT));

// An order still needs syncing if the orders row was never created,
// or the orders row exists but its items were not inserted yet.
// Open dine-in bills (billOpen) are skipped: they sync only after "Place order".
export const isPending = (order) =>
  !order.billOpen && (!order.supabaseId || order.itemsSynced === false);

// Insert or replace one POS order in IndexedDB (atomic read-modify-write,
// so it never overwrites changes made by the sync with stale React state).
export async function saveLocalOrder(order) {
  await update(POS_ORDERS, (all) => {
    const list = Array.isArray(all) ? all : [];
    const exists = list.some((o) => o.localId === order.localId);

    if (!exists) return [...list, order];

    return list.map((o) =>
      o.localId === order.localId
        ? {
            ...order,
            // never lose sync info that the sync process already stored
            supabaseId: o.supabaseId ?? order.supabaseId ?? null,
            itemsSynced: o.itemsSynced ?? order.itemsSynced,
            syncStatus: o.syncStatus ?? order.syncStatus,
          }
        : o
    );
  });
  notify();
}

async function patchLocalOrder(localId, patch) {
  await update(POS_ORDERS, (all) =>
    (Array.isArray(all) ? all : []).map((o) =>
      o.localId === localId ? { ...o, ...patch } : o
    )
  );
  notify();
}

// Database check constraints only allow these values.
const DB_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

// POS uses "completed" locally; the database calls it "delivered".
const toDbStatus = (status) => {
  if (status === "completed") return "delivered";
  return DB_STATUSES.includes(status) ? status : "confirmed";
};

const toDbPayment = (method) => (method === "online" ? "online" : "cod");

async function syncOne(order) {
  let supabaseId = order.supabaseId;

  // Step 1: create the row in `orders` (only if it was not created before).
  if (!supabaseId) {
    const { data, error } = await supabase
      .from("orders")
      .insert({
        // user_id is NOT sent: the column default auth.uid() fills it in.
        // useOrders.js (toUiOrder) detects POS orders by customer_title === "POS"
        customer_title: "POS",
        customer_name: order.customerName?.trim() || "Guest",
        mobile: order.phone || "",
        address: "",
        landmark: "",
        // marker so OrdersManagement can show this order as "POS"
        instructions: `[POS] ${order.type}${
          order.table && order.table !== "—" ? ` · ${order.table}` : ""
        }`,
        payment_method: toDbPayment(order.paymentMethod),
        payment_status: order.paymentStatus === "paid" ? "paid" : "unpaid",
        total: order.total,
        status: toDbStatus(order.status),
        created_at: order.createdAt, // keep the real time of offline orders
      })
      .select("id")
      .single();

    if (error) throw error;
    supabaseId = data.id;

    // Save the id immediately. If step 2 fails, the retry only inserts the
    // items and will NOT create a second order.
    await patchLocalOrder(order.localId, { supabaseId, itemsSynced: false });
  }

  // Step 2: insert the items.
  if (order.itemsSynced !== true) {
    const rows = (order.items || []).map((item) => ({
      order_id: supabaseId,
      menu_item_id: item.menuItemId ?? null,
      item_name: item.name,
      option_label: item.option || "",
      qty: item.qty,
      unit_price: item.price,
      note: item.note || "",
    }));

    if (rows.length) {
      const { error } = await supabase.from("order_items").insert(rows);
      if (error) throw error;
    }

    await patchLocalOrder(order.localId, {
      itemsSynced: true,
      syncStatus: "synced",
    });
  }
}

async function doSync() {
  const result = { synced: 0, failed: 0, needsLogin: false };

  try {
    if (!navigator.onLine) return result;

    const { data } = await supabase.auth.getSession();
    if (!data?.session) {
      result.needsLogin = true;
      return result;
    }

    const all = (await get(POS_ORDERS)) || [];
    const pending = all.filter((o) => o.source === "pos" && isPending(o));

    for (const order of pending) {
      try {
        await syncOne(order);
        result.synced += 1;
      } catch (error) {
        console.error("POS order sync failed:", order.localId, error);
        result.failed += 1;
      }
    }
  } catch (error) {
    console.error("POS sync crashed:", error);
  }

  return result;
}

let running = null;

// Call this any time. If a sync is already running, it waits and then runs again.
export function syncPendingOrders() {
  if (running) return running.then(() => syncPendingOrders());
  running = doSync().finally(() => {
    running = null;
  });
  return running;
}

// Starts: sync now, sync when internet comes back, and retry every 30 seconds.
// Returns a function that stops everything (use it in useEffect cleanup).
export function startAutoSync() {
  const run = () => {
    syncPendingOrders();
  };

  window.addEventListener("online", run);
  const timer = setInterval(run, 30000);
  run();

  return () => {
    window.removeEventListener("online", run);
    clearInterval(timer);
  };
}

// Converts a local (IndexedDB) POS order into the same shape toUiOrder()
// returns for database rows, so tables/cards can show both kinds together.
export const toUiLocalOrder = (order) => ({
  ...order,
  dbId: null,
  id: order.displayId || `#${order.localId}`,
  customerName: order.customerName?.trim() || "Guest",
  source: "pos",
  createdAt: order.createdAt ? new Date(order.createdAt).toLocaleString() : "",
  paymentStatus: order.paymentStatus || (order.paymentMethod === "cod" ? "unpaid" : "pending"),
  items: (order.items || []).map((item) => ({
    ...item,
    name: item.name,
    price: Number(item.price || 0),
    qty: Number(item.qty || 0),
  })),
});