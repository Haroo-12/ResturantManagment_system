import { useCallback, useEffect, useMemo, useState } from "react";
import { get, set } from "idb-keyval";
import {
  Minus,
  Plus,
  Search,
  Settings2,
  ShoppingCart,
  Trash2,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import PageHeader from "../AdminPagesComponents/PageHeader";
import Modal from "../AdminPagesComponents/Modal";
import { calcOrderTotals, formatPKR, TAX_RATE } from "../Arrays/Mockdata";
import { supabase } from "../supabas.js";
import {
  POS_ORDERS,
  POS_EVENT,
  isPending,
  saveLocalOrder,
  startAutoSync,
  syncPendingOrders,
} from "../Logic/posSync.js";

const MENU_CACHE = "pos-menu-cache";
const TABLES_KEY = "pos-tables";

const orderTypes = [
  { id: "dine-in", label: "Dine-in" },
  { id: "takeaway", label: "Takeaway" },
  { id: "walk-in", label: "Walk-in" },
];

const getTables = () => {
  try {
    const saved = localStorage.getItem(TABLES_KEY);
    if (saved === null) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveTables = (tables) => {
  localStorage.setItem(TABLES_KEY, JSON.stringify(tables));
};

const generateTables = (count) => {
  const num = Number(count);
  if (!num || num < 1 || num > 100) return [];
  return Array.from({ length: num }, (_, i) => `T-${String(i + 1).padStart(2, "0")}`);
};

const getPriceVariants = (item, categoryName) => {
  const variants = [];

  if (item.hot_price != null) {
    variants.push({
      id: `${item.id}-hot`,
      menuItemId: item.id,
      name: item.name,
      option: "Hot",
      category: categoryName,
      price: Number(item.hot_price),
      cost: Number(item.cost || 0),
      available: item.is_available,
    });
  }

  if (item.iced_price != null) {
    variants.push({
      id: `${item.id}-iced`,
      menuItemId: item.id,
      name: item.name,
      option: "Iced",
      category: categoryName,
      price: Number(item.iced_price),
      cost: Number(item.cost || 0),
      available: item.is_available,
    });
  }

  if (!variants.length && item.price != null) {
    variants.push({
      id: String(item.id),
      menuItemId: item.id,
      name: item.name,
      option: item.option || "",
      category: categoryName,
      price: Number(item.price),
      cost: Number(item.cost || 0),
      available: item.is_available ?? item.available ?? true,
    });
  }

  return variants;
};

export default function POS({ items = [], orders = [], onCheckout }) {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [offline, setOffline] = useState(!navigator.onLine);

  const [tables, setTables] = useState(getTables);
  const [tableCount, setTableCount] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("dine-in");
  const [table, setTable] = useState(tables[0] || "");
  const [customerName, setCustomerName] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [existingOrderId, setExistingOrderId] = useState(null);
  const [localOrders, setLocalOrders] = useState([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  const loadMenu = useCallback(async () => {
    setMenuLoading(true);

    // Cached menu is immediately available when offline or loading.
    try {
      const cached = await get(MENU_CACHE);
      if (Array.isArray(cached)) setMenu(cached);
    } catch (error) {
      console.error("Could not read cached POS menu:", error);
    }

    if (!navigator.onLine) {
      setMenuLoading(false);
      return;
    }

    try {
      const [{ data: categoryRows, error: categoryError }, { data: menuRows, error: menuError }] =
        await Promise.all([
          supabase.from("categories").select("id,name,is_active"),
          supabase
            .from("menu_items")
            .select("id,category_id,name,hot_price,iced_price,cost,is_available")
            .eq("is_available", true),
        ]);

      if (categoryError) throw categoryError;
      if (menuError) throw menuError;

      const activeCategories = (categoryRows || []).filter(
        (item) => item.is_active !== false
      );

      const formatted = (menuRows || []).flatMap((item) => {
        const matchingCategory = activeCategories.find(
          (cat) => String(cat.id) === String(item.category_id)
        );

        if (!matchingCategory || item.is_available === false) return [];

        return getPriceVariants(item, matchingCategory.name);
      });

      setCategories(activeCategories);
      setMenu(formatted);
      await set(MENU_CACHE, formatted);
    } catch (error) {
      console.error("POS menu refresh failed:", error);
      setNotice("Menu refresh failed. Showing the last cached menu if available.");
    } finally {
      setMenuLoading(false);
    }
  }, []);

  const loadLocalOrders = useCallback(async () => {
    try {
      const saved = (await get(POS_ORDERS)) || [];
      setLocalOrders(saved);
      setOrdersLoaded(true);
    } catch (error) {
      console.error("Could not load local POS orders:", error);
    }
  }, []);

  useEffect(() => {
    loadMenu();
    loadLocalOrders();

    // Sync pending orders now, when internet returns, and every 30 seconds.
    const stopSync = startAutoSync();

    const updateConnection = () => {
      setOffline(!navigator.onLine);
      if (navigator.onLine) loadMenu();
    };

    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    // The sync module fires this event whenever local orders change.
    window.addEventListener(POS_EVENT, loadLocalOrders);

    return () => {
      stopSync();
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
      window.removeEventListener(POS_EVENT, loadLocalOrders);
    };
  }, [loadMenu, loadLocalOrders]);

  const pendingCount = useMemo(
    () => localOrders.filter((order) => order.source === "pos" && isPending(order)).length,
    [localOrders]
  );

  const available = useMemo(
    () => (menu.length ? menu : items).filter((item) => item.available !== false),
    [menu, items]
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return available.filter((item) => {
      const matchesQuery = !term || item.name.toLowerCase().includes(term);
      const matchesCategory = category === "all" || item.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [available, query, category]);

  const totals = calcOrderTotals(cart, discount, TAX_RATE);

  const addItem = (item) => {
    setCart((previous) => {
      const existing = previous.find((row) => String(row.id) === String(item.id));

      if (existing) {
        return previous.map((row) =>
          String(row.id) === String(item.id)
            ? { ...row, qty: row.qty + 1 }
            : row
        );
      }

      return [...previous, { ...item, qty: 1, printedQty: 0 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((previous) =>
      previous
        .map((row) =>
          String(row.id) === String(id)
            ? { ...row, qty: row.qty + delta }
            : row
        )
        .filter((row) => row.qty > 0)
    );
  };

  const resetTicket = () => {
    setCart([]);
    setCustomerName("");
    setDiscount(0);
    setIsUpdating(false);
    setExistingOrderId(null);
  };

  // Loads the open (saved, not yet placed) bill of a dine-in table, if any.
  const loadExistingOrder = (tableNumber, type = orderType, list = localOrders) => {
    if (type !== "dine-in") return resetTicket();

    const existing = [...list]
      .reverse()
      .find(
        (order) =>
          order.type === "dine-in" &&
          order.table === tableNumber &&
          order.billOpen === true
      );

    if (!existing) {
      resetTicket();
      setNotice("");
      return;
    }

    setCart(existing.items.map((item) => ({ ...item })));
    setCustomerName(existing.customerName || "");
    setDiscount(Number(existing.discount || 0));
    setPaymentMethod(existing.paymentMethod || "cod");
    setExistingOrderId(existing.localId);
    setIsUpdating(true);
    setNotice(`Loaded existing bill ${existing.displayId} for ${tableNumber}.`);
  };

  const handleTableChange = (nextTable) => {
    setTable(nextTable);
    loadExistingOrder(nextTable);
  };

  const applyTableConfiguration = () => {
    const num = Number(tableCount);
    if (!num || num < 1 || num > 100) {
      setNotice("Please enter a number between 1 and 100.");
      return;
    }

    const newTables = generateTables(num);
    setTables(newTables);
    saveTables(newTables);
    setTable(newTables[0] || "");
    setTableCount("");
    setNotice(`Created ${num} tables: ${newTables.join(", ")}`);
  };

  const removeTable = (tableName) => {
    if (
      localOrders.some(
        (order) => order.table === tableName && order.billOpen === true
      )
    ) {
      setNotice("This table has an open bill. Complete it before removing the table.");
      return;
    }

    const updated = tables.filter((item) => item !== tableName);
    setTables(updated);
    saveTables(updated);

    if (table === tableName) setTable(updated[0] || "");
  };

  // After a page refresh, show the open bill of the selected table (if it has one).
  useEffect(() => {
    if (ordersLoaded && orderType === "dine-in" && table) {
      loadExistingOrder(table);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersLoaded]);

  // mode "save"  -> dine-in bill stays open and can be updated later
  // mode "place" -> bill is closed/final and goes to Supabase
  const checkout = async (mode = "place") => {
    if (!cart.length) return;

    const now = new Date().toISOString();
    const localId = existingOrderId || `POS-${Date.now()}`;
    const existing = localOrders.find((order) => order.localId === localId);

    const nextItems = cart.map((item) => {
      const previousItem = existing?.items?.find(
        (old) => String(old.id) === String(item.id)
      );

      return {
        ...item,
        printedQty: Math.min(
          Number(previousItem?.printedQty || item.printedQty || 0),
          item.qty
        ),
      };
    });

    // Dine-in: "Save bill" keeps the table's bill open (can be updated later),
    // "Place order" closes it as completed. Other order types are final immediately.
    const isDineIn = orderType === "dine-in";
    const keepOpen = isDineIn && mode === "save";
    const finalStatus = isDineIn
      ? keepOpen
        ? existing?.status || "confirmed"
        : "completed"
      : existing?.status || "confirmed";

    const order = {
      ...(existing || {}),
      localId,
      displayId: existing?.displayId || `#${localId}`,
      customerName: customerName.trim(),
      phone: "",
      type: orderType,
      table: orderType === "dine-in" ? table : "—",
      paymentMethod,
      items: nextItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      status: finalStatus,
      source: "pos",
      billOpen: keepOpen,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      syncStatus: existing?.syncStatus || "pending",
      supabaseId: existing?.supabaseId || null,
    };

    try {
      // 1) Always save on this device first (works with or without internet).
      await saveLocalOrder(order);

      // 2) If internet is available, push to Supabase right now.
      let synced = false;
      if (!keepOpen && navigator.onLine) {
        await syncPendingOrders();
        const saved = ((await get(POS_ORDERS)) || []).find(
          (row) => row.localId === localId
        );
        synced = Boolean(saved?.supabaseId) && saved?.itemsSynced !== false;
      }

      if (keepOpen) {
        setNotice(
          `Bill ${order.displayId} saved for ${order.table}. You can add more items and save again anytime.`
        );
      } else if (synced) {
        setNotice(`POS order ${order.displayId} saved and synced to Supabase.`);
      } else {
        setNotice(
          `POS order ${order.displayId} saved on this device. It will sync automatically when internet is available.`
        );
      }

      // Preserve the existing parent callback integration.
      if (typeof onCheckout === "function") {
        onCheckout({
          ...order,
          id: order.displayId,
          existingOrderId: existing ? localId : undefined,
        });
      }

      setConfirmOpen(false);

      if (keepOpen) {
        // Keep the saved bill loaded so it can be updated further.
        setCart(nextItems.map((item) => ({ ...item })));
        setExistingOrderId(localId);
        setIsUpdating(true);
      } else {
        resetTicket();
      }
    } catch (error) {
      console.error("Could not save POS order:", error);
      setNotice("Order could not be saved locally. Please try again.");
    }
  };

  const displayedCategories = categories.length
    ? categories.map((item) => item.name)
    : [...new Set(available.map((item) => item.category).filter(Boolean))];

  // UI-only helpers
  const [showTableSetup, setShowTableSetup] = useState(false);

  const openTables = useMemo(
    () =>
      new Set(
        localOrders.filter((order) => order.billOpen === true).map((order) => order.table)
      ),
    [localOrders]
  );

  const cartQty = useMemo(() => {
    const map = new Map();
    cart.forEach((row) => map.set(String(row.id), row.qty));
    return map;
  }, [cart]);

  const itemCount = cart.reduce((sum, row) => sum + row.qty, 0);
  const noticeIsWarning = /fail|could not|please|open bill/i.test(notice);

  const tableSetup = (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="number"
          min="1"
          max="100"
          value={tableCount}
          onChange={(event) => setTableCount(event.target.value)}
          placeholder="How many tables? (1-100)"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#dc2626]"
        />
        <button
          type="button"
          onClick={applyTableConfiguration}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          {tables.length ? "Apply" : "Create tables"}
        </button>
      </div>
      {tables.length > 0 && (
        <button
          type="button"
          onClick={() => removeTable(table)}
          disabled={!table}
          className="inline-flex items-center gap-1.5 text-sm text-[#dc2626] disabled:opacity-40"
        >
          <Trash2 size={14} />
          Remove {table || "table"}
        </button>
      )}
    </div>
  );

  return (
    <section>
      <PageHeader
        title="Point of Sale"
        subtitle="Manage dine-in tables, takeaway and walk-in orders."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
            offline
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {offline ? <WifiOff size={13} /> : <Wifi size={13} />}
          {offline
            ? "Offline: using the saved menu, orders stay on this device"
            : "Online"}
        </span>

        {pendingCount > 0 && (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
            {pendingCount} {pendingCount > 1 ? "orders" : "order"} waiting to sync
          </span>
        )}
      </div>

      {notice && (
        <div
          className={`mb-4 flex items-start justify-between gap-3 rounded-lg border px-4 py-2.5 text-sm ${
            noticeIsWarning
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
            className="mt-0.5 shrink-0 opacity-60 hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* Menu */}
        <div className="xl:col-span-3">
          <label className="relative mb-3 block">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-[#dc2626]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </label>

          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {["all", ...displayedCategories].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCategory(name)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium ${
                  category === name
                    ? "bg-[#dc2626] text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {name === "all" ? "All" : name}
              </button>
            ))}
          </div>

          {menuLoading && available.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Loading the menu...
            </p>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-500">
              No products match your search. Try another name or category.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((item) => {
                const inCart = cartQty.get(String(item.id)) || 0;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addItem(item)}
                    className={`relative flex min-h-[104px] flex-col justify-between rounded-lg border bg-white p-3.5 text-left active:bg-slate-50 ${
                      inCart > 0
                        ? "border-[#dc2626]"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {inCart > 0 && (
                      <span className="absolute right-2 top-2 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-[#dc2626] px-1.5 text-xs font-semibold text-white">
                        {inCart}
                      </span>
                    )}

                    <div className="pr-6">
                      <p className="text-xs text-slate-500">{item.category}</p>
                      <p className="mt-0.5 text-sm font-semibold leading-snug text-slate-900">
                        {item.name}
                      </p>
                      {item.option && (
                        <span className="mt-1.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                          {item.option}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-sm font-semibold tabular-nums text-[#dc2626]">
                      {formatPKR(item.price)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bill */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 xl:sticky xl:top-4 xl:col-span-2 xl:self-start">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Current bill
              {itemCount > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-500">
                  {itemCount} {itemCount > 1 ? "items" : "item"}
                </span>
              )}
            </h2>
            {cart.length > 0 && !isUpdating && (
              <button
                type="button"
                onClick={resetTicket}
                className="text-sm text-slate-500 hover:text-[#dc2626]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
            {orderTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setOrderType(type.id);
                  resetTicket();
                  setNotice("");
                  if (type.id === "dine-in" && table) {
                    loadExistingOrder(table, "dine-in");
                  }
                }}
                className={`rounded-lg px-2 py-2 text-sm font-medium ${
                  orderType === type.id
                    ? "bg-[#dc2626] text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {orderType === "dine-in" && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">
                  Table{table ? ` ${table}` : ""}
                </p>
                {tables.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowTableSetup((value) => !value)}
                    className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
                  >
                    <Settings2 size={14} />
                    Manage tables
                  </button>
                )}
              </div>

              {tables.length > 0 ? (
                <>
                  <div className="grid max-h-36 grid-cols-4 gap-1.5 overflow-y-auto sm:grid-cols-6 xl:grid-cols-5">
                    {tables.map((name) => {
                      const selected = name === table;
                      const busy = openTables.has(name);

                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            if (!selected) handleTableChange(name);
                          }}
                          className={`rounded-md border px-1 py-2 text-sm font-medium ${
                            selected
                              ? "border-[#dc2626] bg-[#dc2626] text-white"
                              : busy
                              ? "border-amber-300 bg-amber-50 text-amber-800"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm border border-amber-300 bg-amber-50" />
                    Table has a saved bill
                  </p>

                  {showTableSetup && <div className="mt-3">{tableSetup}</div>}
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-3">
                  <p className="mb-2 text-sm text-slate-600">
                    No tables yet. Enter how many tables you have.
                  </p>
                  {tableSetup}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#dc2626]"
              placeholder="Customer name"
            />

            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#dc2626]"
            >
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>

          {isUpdating && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Updating saved bill {existingOrderId}
            </p>
          )}

          <div className="mt-4 max-h-64 space-y-2 overflow-y-auto xl:max-h-[34vh]">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center rounded-lg bg-slate-50 px-3 py-8 text-center">
                <ShoppingCart size={26} className="text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">
                  The bill is empty. Tap a product to add it.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 p-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {item.name}
                      {item.option ? ` (${item.option})` : ""}
                    </p>
                    <p className="text-xs tabular-nums text-slate-500">
                      {formatPKR(item.price)} each
                    </p>
                  </div>

                  <div className="flex items-center rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, -1)}
                      aria-label="Decrease quantity"
                      className="p-2 text-slate-600 hover:text-[#dc2626]"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center text-sm font-medium tabular-nums">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, 1)}
                      aria-label="Increase quantity"
                      className="p-2 text-slate-600 hover:text-[#dc2626]"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <p className="hidden w-20 text-right text-sm font-semibold tabular-nums text-slate-900 sm:block">
                    {formatPKR(item.price * item.qty)}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setCart((previous) =>
                        previous.filter((row) => row.id !== item.id)
                      )
                    }
                    aria-label="Remove item"
                    className="p-1.5 text-slate-400 hover:text-[#dc2626]"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 border-t border-slate-200 pt-3">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{formatPKR(totals.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <dt>
                  <label htmlFor="pos-discount">Discount (PKR)</label>
                </dt>
                <dd>
                  <input
                    id="pos-discount"
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(event) => setDiscount(Number(event.target.value) || 0)}
                    className="w-24 rounded-md border border-slate-200 px-2 py-1 text-right text-sm tabular-nums outline-none focus:border-[#dc2626]"
                  />
                </dd>
              </div>
              <div className="flex justify-between text-slate-600">
                <dt>Tax (5%)</dt>
                <dd className="tabular-nums">{formatPKR(totals.tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPKR(totals.total)}</dd>
              </div>
            </dl>

            <button
              type="button"
              disabled={!cart.length || (!table && orderType === "dine-in")}
              onClick={() => setConfirmOpen(true)}
              className="mt-4 w-full rounded-xl bg-[#dc2626] py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              {cart.length ? `Checkout, ${formatPKR(totals.total)}` : "Checkout"}
            </button>
          </div>
        </aside>
      </div>

      <Modal
        open={confirmOpen}
        title={isUpdating ? "Confirm bill update" : "Confirm checkout"}
        onClose={() => setConfirmOpen(false)}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            {orderType === "dine-in" ? (
              <button
                type="button"
                onClick={() => checkout("save")}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Save bill
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => checkout("place")}
              className="rounded-lg bg-[#dc2626] px-4 py-2 text-sm font-medium text-white"
            >
              Place order
            </button>
          </div>
        }
      >
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <div className="flex justify-between">
            <span>{orderTypes.find((type) => type.id === orderType)?.label}</span>
            <span>{orderType === "dine-in" ? table : "No table"}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>Items</span>
            <span className="tabular-nums">{itemCount}</span>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-600">
          {orderType === "dine-in"
            ? isUpdating
              ? `Bill ${existingOrderId} is open for ${table}. Save it to add more items later, or place the order to close it.`
              : `Save bill keeps ${table} open so you can add more items later. Place order closes the bill.`
            : "This order will be saved on this device and shown in Kitchen Printing."}
        </p>
        <p className="mt-3 text-lg font-semibold tabular-nums text-slate-900">
          {formatPKR(totals.total)} ({paymentMethod})
        </p>
      </Modal>
    </section>
  );
}