import { useMemo, useState, useCallback, useEffect } from "react";
import { Search } from "lucide-react";
import PageHeader from "../AdminPagesComponents/PageHeader";
import OrdersTable from "../AdminPagesComponents/OrdersTable";
import OrderDetailsModal from "../AdminPagesComponents/OrderDetailsModal";
import useOrders, {
  toUiOrder,
  ORDER_STATUS_OPTIONS,
} from "../Logic/useOrders.js";
import { get, update } from "idb-keyval";
import { POS_ORDERS, POS_EVENT, startAutoSync } from "../Logic/posSync.js";

// Is status par order automatically "paid" ho jata hai.
// "confirmed" ya "delivered" likho, ya null likho to auto-paid band.
const AUTO_PAID_STATUS = "confirmed";

export default function OrdersManagement() {
  const {
    orders: rows,
    loading,
    error,
    updateStatus,
    updatePaymentStatus,
  } = useOrders();

  // Supabase is the source of truth for all synced orders.
  // toUiOrder marks synced POS orders (customer_title === "POS") as source "pos".
  const websiteOrders = useMemo(
    () => rows.map(toUiOrder),
    [rows]
  );

  const [localOrders, setLocalOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const [selected, setSelected] = useState(null);
  const [actionError, setActionError] = useState("");

  const loadLocalOrders = useCallback(async () => {
    try {
      const saved = (await get(POS_ORDERS)) || [];
      setLocalOrders(saved);
    } catch (err) {
      console.error("Could not load local POS orders:", err);
      setActionError("Could not load local POS orders.");
    }
  }, []);

  useEffect(() => {
    loadLocalOrders();

    // Keeps syncing offline POS orders even when the POS page is closed.
    const stopSync = startAutoSync();

    window.addEventListener("focus", loadLocalOrders);
    window.addEventListener(POS_EVENT, loadLocalOrders);

    return () => {
      stopSync();
      window.removeEventListener("focus", loadLocalOrders);
      window.removeEventListener(POS_EVENT, loadLocalOrders);
    };
  }, [loadLocalOrders]);

  // Only show local POS orders that have NOT synced to Supabase.
  // Synced POS orders are already included in websiteOrders from Supabase.
  const unsyncedPosOrders = useMemo(
    () =>
      localOrders
        .filter((order) => !order.supabaseId)
        .map((order) => ({
          ...order,
          dbId: null,
          id: order.displayId || `#${order.localId}`,
          customerName: order.customerName?.trim() || "Guest",
          source: "pos",
          createdAt: order.createdAt
            ? new Date(order.createdAt).toLocaleString()
            : "",
          paymentStatus:
            order.paymentStatus ||
            (order.paymentMethod === "cod" ? "unpaid" : "pending"),
          items: (order.items || []).map((item) => ({
            ...item,
            name: item.name,
            price: Number(item.price || 0),
            qty: Number(item.qty || 0),
          })),
        })),
    [localOrders]
  );

  const orders = useMemo(
    () => [...unsyncedPosOrders, ...websiteOrders],
    [unsyncedPosOrders, websiteOrders]
  );

  const onStatusChange = async (id, nextStatus) => {
    const order = orders.find((item) => item.id === id);
    if (!order) return;

    setActionError("");

    const autoPaid =
      AUTO_PAID_STATUS &&
      nextStatus === AUTO_PAID_STATUS &&
      order.paymentStatus !== "paid";
    const paidPatch = autoPaid ? { paymentStatus: "paid" } : {};

    // Synced POS and website orders both update the Supabase row.
    if (order.dbId != null) {
      const success = await updateStatus(
        order.dbId,
        nextStatus,
        autoPaid ? { payment_status: "paid" } : {}
      );

      if (!success) {
        setActionError(
          "Status update failed. Check the error message and Supabase permissions."
        );
        return;
      }

      setSelected((previous) =>
        previous && String(previous.dbId) === String(order.dbId)
          ? { ...previous, status: nextStatus, ...paidPatch }
          : previous
      );

      return;
    }

    // Unsynced/offline POS order: update local storage only.
    if (order.source === "pos") {
      try {
        // Atomic update so it cannot clash with a sync running at the same time.
        await update(POS_ORDERS, (all) =>
          (Array.isArray(all) ? all : []).map((item) =>
            item.localId === order.localId
              ? { ...item, status: nextStatus, ...paidPatch }
              : item
          )
        );

        await loadLocalOrders();

        setSelected((previous) =>
          previous?.localId === order.localId
            ? { ...previous, status: nextStatus, ...paidPatch }
            : previous
        );
      } catch (err) {
        console.error("Local POS status update failed:", err);
        setActionError("Could not save the local POS status.");
      }
    }
  };

  const onPaymentChange = async (id, nextPayment) => {
    const order = orders.find((item) => item.id === id);
    if (!order) return;

    setActionError("");

    if (order.dbId != null) {
      const success = await updatePaymentStatus(order.dbId, nextPayment);

      if (!success) {
        setActionError("Payment update failed. Check Supabase permissions.");
        return;
      }

      setSelected((previous) =>
        previous && String(previous.dbId) === String(order.dbId)
          ? { ...previous, paymentStatus: nextPayment }
          : previous
      );
      return;
    }

    try {
      await update(POS_ORDERS, (all) =>
        (Array.isArray(all) ? all : []).map((item) =>
          item.localId === order.localId
            ? { ...item, paymentStatus: nextPayment }
            : item
        )
      );

      await loadLocalOrders();

      setSelected((previous) =>
        previous?.localId === order.localId
          ? { ...previous, paymentStatus: nextPayment }
          : previous
      );
    } catch (err) {
      console.error("Local payment update failed:", err);
      setActionError("Could not save the local payment status.");
    }
  };

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesQuery =
        !term ||
        String(order.id || "").toLowerCase().includes(term) ||
        String(order.customerName || "").toLowerCase().includes(term);

      const matchesStatus =
        status === "all" || order.status === status;

      const matchesSource =
        source === "all" || order.source === source;

      return matchesQuery && matchesStatus && matchesSource;
    });
  }, [orders, query, status, source]);

  if (loading) {
    return (
      <p className="py-16 text-center text-sm text-slate-500">
        Loading orders...
      </p>
    );
  }

  return (
    <section>
      <PageHeader
        title="Orders Management"
        subtitle="Update order status and payment. Changes appear everywhere instantly."
      />

      {(error || actionError) && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-[#dc2626]">
          {actionError || error}
        </p>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search orders"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#dc2626]"
          />
        </label>

        <select
          value={source}
          onChange={(event) => setSource(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="all">All sources</option>
          <option value="website">Website</option>
          <option value="pos">POS</option>
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="all">All statuses</option>
          {ORDER_STATUS_OPTIONS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <OrdersTable
        orders={filtered}
        onView={setSelected}
        onStatusChange={onStatusChange}
        onPaymentChange={onPaymentChange}
        statusOptions={ORDER_STATUS_OPTIONS}
        emptyMessage="No orders match this search."
      />

      <OrderDetailsModal
        order={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}