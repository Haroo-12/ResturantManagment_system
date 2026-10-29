import { useCallback, useEffect, useMemo, useState } from "react";
import { get, set } from "idb-keyval";
import {
  ChefHat,
  Globe,
  Package,
  Printer,
  Receipt,
  RefreshCw,
  Store,
  Trash2,
} from "lucide-react";
import PageHeader from "../AdminPagesComponents/PageHeader";
import StatusBadge from "../AdminPagesComponents/StatusBadge";
import { formatPKR } from "../Arrays/Mockdata";
import useOrders, {
  toUiOrder,
  ORDER_STATUS_OPTIONS,
} from "../Logic/useOrders.js";

const POS_ORDERS = "pos-orders";
const HIDDEN_KITCHEN_ORDERS = "hidden-kitchen-orders";

const getKitchenOrderKey = (order) =>
  `${order.source}-${order.dbId || order.id}`;

const sourceLabel = (source) =>
  source === "website" ? "Website Order" : "POS Order";

const selectClass =
  "h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#dc2626] focus:ring-2 focus:ring-red-100";

export default function KitchenPrinting() {
  const {
    orders: rows,
    loading,
    error,
    refresh,
    updateStatus,
    updatePaymentStatus,
  } = useOrders();

  const [localOrders, setLocalOrders] = useState([]);
  const [status, setStatus] = useState("confirmed");
  const [source, setSource] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const [mode, setMode] = useState("kot");
  const [printSnapshot, setPrintSnapshot] = useState(null);
  const [hiddenOrderKeys, setHiddenOrderKeys] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HIDDEN_KITCHEN_ORDERS) || "[]");
    } catch {
      return [];
    }
  });

  const removeFromKitchenView = (order) => {
    const key = getKitchenOrderKey(order);
    const updated = [...new Set([...hiddenOrderKeys, key])];

    try {
      localStorage.setItem(HIDDEN_KITCHEN_ORDERS, JSON.stringify(updated));
      setHiddenOrderKeys(updated);
      if (selectedId === order.id) setSelectedId("");
    } catch (err) {
      console.error("Could not hide kitchen order:", err);
      window.alert("Could not remove this order from the kitchen view.");
    }
  };

  const loadLocalOrders = useCallback(async () => {
    try {
      const saved = (await get(POS_ORDERS)) || [];
      setLocalOrders(saved);
    } catch (err) {
      console.error("Could not load local POS orders:", err);
    }
  }, []);

  useEffect(() => {
    loadLocalOrders();

    const handleFocus = () => loadLocalOrders();
    const handleStorage = () => loadLocalOrders();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, [loadLocalOrders]);

  const websiteOrders = useMemo(
    () => rows.map(toUiOrder),
    [rows]
  );

  const posOrders = useMemo(
    () =>
      localOrders.map((order) => ({
        ...order,
        dbId: order.supabaseId || order.localId,
        id: order.supabaseId ? `#${order.supabaseId}` : order.displayId || `#${order.localId}`,
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
          printedQty: Number(item.printedQty || 0),
        })),
      })),
    [localOrders]
  );

  const allOrders = useMemo(() => {
    // Supabase ko tabhi source of truth maante hain jab data sach mein load ho chuka ho
    const dbReady = navigator.onLine && !loading && !error;

    // Supabase ke sirf POS rows (website orders se id collision na ho)
    const dbPosById = new Map(
      websiteOrders
        .filter((o) => o.source === "pos")
        .map((o) => [String(o.dbId), o])
    );

    const matchedDbIds = new Set();
    const localList = [];

    posOrders.forEach((local) => {
      // 1) Abhi sync nahi hua (offline order): hamesha dikhao
      if (!local.supabaseId) {
        localList.push(local);
        return;
      }

      const dbOrder = dbPosById.get(String(local.supabaseId));

      // 2) Synced aur Supabase mein maujood: local items (printedQty) + Supabase ka status
      if (dbOrder) {
        matchedDbIds.add(String(local.supabaseId));
        localList.push({
          ...local,
          status: dbOrder.status,
          paymentStatus: dbOrder.paymentStatus,
        });
        return;
      }

      // 3) Synced lekin Supabase mein nahi mila:
      //    online ho to deleted hai (chhupao), offline ho to verify nahi ho sakta (dikhao)
      if (!dbReady) localList.push(local);
    });

    // Baqi Supabase orders (website + woh POS jinki local copy is device par nahi)
    const remote = websiteOrders.filter(
      (o) => !(o.source === "pos" && matchedDbIds.has(String(o.dbId)))
    );

    return [...localList, ...remote];
  }, [posOrders, websiteOrders, loading, error]);

  const printable = useMemo(
    () =>
      allOrders.filter((order) => {
        const notCancelled = order.status !== "cancelled";
        const matchesStatus =
          status === "all" || order.status === status;
        const matchesSource =
          source === "all" || order.source === source;
        const isHidden = hiddenOrderKeys.includes(getKitchenOrderKey(order));

        return notCancelled && matchesStatus && matchesSource && !isHidden;
      }),
    [allOrders, status, source, hiddenOrderKeys]
  );

  const selected = useMemo(
    () =>
      printable.find((order) => order.id === selectedId) ||
      printable[0] ||
      null,
    [printable, selectedId]
  );

  // field: "status" ya "paymentStatus"
  const changeField = async (field, value) => {
    if (!selected) return;

    const isUnsyncedLocal = selected.localId && !selected.supabaseId;

    if (isUnsyncedLocal) {
      // Abhi Supabase mein nahi gaya: device par save karo, sync ke waqt chala jayega
      const updated = localOrders.map((order) =>
        order.localId === selected.localId ? { ...order, [field]: value } : order
      );
      try {
        await set(POS_ORDERS, updated);
        setLocalOrders(updated);
      } catch (err) {
        console.error("Could not update local order:", err);
        window.alert("Could not save the change on this device.");
      }
      return;
    }

    const dbId = selected.supabaseId ?? selected.dbId;
    if (field === "status") await updateStatus(dbId, value);
    else await updatePaymentStatus(dbId, value);
  };

  const printTicket = async (nextMode) => {
    if (!selected) return;

    let snapshot = {
      ...selected,
      items: (selected.items || []).map((item) => ({ ...item })),
    };

    if (nextMode === "kot" && selected.source === "pos") {
      const newItems = snapshot.items
        .map((item) => ({
          ...item,
          qty: Math.max(
            0,
            Number(item.qty || 0) - Number(item.printedQty || 0)
          ),
        }))
        .filter((item) => item.qty > 0);

      // Naye items hon to sirf wohi print honge. Agar sab pehle print ho chuka
      // hai to poora order dobara print hoga (koi alert nahi).
      if (newItems.length) {
        snapshot.items = newItems;

        // Printed quantity save karo taake agli KOT mein yehi items dobara na aayen.
        const updated = localOrders.map((order) => {
          if (order.localId !== selected.localId) return order;

          return {
            ...order,
            items: order.items.map((item) => ({
              ...item,
              printedQty: Number(item.qty || 0),
            })),
          };
        });

        try {
          await set(POS_ORDERS, updated);
          setLocalOrders(updated);
        } catch (err) {
          // Save fail ho to bhi print chalne do, alert nahi.
          console.error("Could not save KOT print progress:", err);
        }
      }
    }

    setMode(nextMode);
    setPrintSnapshot(snapshot);

    // Allow React to render the selected print layout before opening print.
    window.setTimeout(() => window.print(), 150);
  };

  useEffect(() => {
    const handleAfterPrint = () => setPrintSnapshot(null);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  return (
    <section>
      <style>{`
        @page {
          size: 80mm auto;
          margin: 3mm;
        }

        @media print {
          body * {
            visibility: hidden !important;
          }

          .print-ticket,
          .print-ticket * {
            visibility: visible !important;
          }

          .print-ticket {
            display: block !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 74mm !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .ticket-card {
            border: 0 !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      <div className="no-print">
        <PageHeader
          title="Kitchen Printing"
          subtitle="Print KOT and customer receipts for website and POS orders."
        />

        {error && (
          <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-[#dc2626]">
            {error}
          </p>
        )}

        {/* Filters */}
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setSelectedId("");
            }}
            className={selectClass}
            aria-label="Filter by source"
          >
            <option value="all">All sources</option>
            <option value="website">Website</option>
            <option value="pos">POS</option>
          </select>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setSelectedId("");
            }}
            className={selectClass}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {ORDER_STATUS_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
            <option value="completed">Completed</option>
          </select>

          <button
            type="button"
            onClick={() => {
              refresh?.();
              loadLocalOrders();
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading orders..." : "Refresh orders"}
          </button>

          <p className="text-xs text-slate-500 sm:ml-auto">
            {printable.length} {printable.length === 1 ? "order" : "orders"}
          </p>
        </div>

        <p className="mb-5 text-xs text-slate-500">
          Orders are loaded from Supabase. POS orders not yet synced are shown from this device.
        </p>

        {printable.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <ChefHat size={26} />
            </span>
            <p className="mt-4 text-base font-semibold text-slate-800">
              No tickets to print
            </p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              No printable tickets for this filter. Try another status or source.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
            {/* Orders list */}
            <div className="space-y-2.5 lg:max-h-[75vh] lg:overflow-y-auto lg:pr-1">
              {printable.map((order) => {
                const isActive = selected?.id === order.id;
                const itemCount = (order.items || []).length;
                const SourceIcon = order.source === "website" ? Globe : Store;

                return (
                  <div key={getKitchenOrderKey(order)} className="group relative">
                    <button
                      type="button"
                      onClick={() => setSelectedId(order.id)}
                      className={`w-full rounded-2xl border px-4 py-3.5 pr-12 text-left transition ${
                        isActive
                          ? "border-[#dc2626] bg-red-50/70 shadow-sm ring-1 ring-[#dc2626]/20"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">
                          {order.id}
                        </p>
                        <StatusBadge status={order.status} />
                      </div>

                      <p className="mt-1.5 truncate text-sm text-slate-700">
                        {order.customerName || "Walk-in Guest"}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <SourceIcon size={12} />
                          {sourceLabel(order.source)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Package size={12} />
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                        </span>
                        {order.source === "pos" && order.type === "dine-in" && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-[#dc2626]">
                            Table {order.table}
                          </span>
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFromKitchenView(order)}
                      title="Remove from Kitchen Printing"
                      aria-label={`Remove ${order.id} from Kitchen Printing`}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-100 hover:text-[#dc2626] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Selected order */}
            {selected && (
              <div className="min-w-0 space-y-5">
                <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <button
                    type="button"
                    onClick={() => printTicket("kot")}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#dc2626] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#b91c1c] active:scale-[0.98]"
                  >
                    <Printer size={16} />
                    Print KOT
                  </button>

                  <button
                    type="button"
                    onClick={() => printTicket("receipt")}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                  >
                    <Receipt size={16} />
                    Print receipt
                  </button>

                  <div className="hidden h-6 w-px bg-slate-200 sm:block" />

                  <select
                    value={selected.status === "completed" ? "delivered" : selected.status}
                    onChange={(e) => changeField("status", e.target.value)}
                    className={selectClass}
                    aria-label="Order status"
                  >
                    {ORDER_STATUS_OPTIONS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selected.paymentStatus === "paid" ? "paid" : "unpaid"}
                    onChange={(e) => changeField("paymentStatus", e.target.value)}
                    aria-label="Payment status"
                    className={`h-10 rounded-xl border px-3 text-sm font-medium outline-none transition ${
                      selected.paymentStatus === "paid"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-600">
                      <ChefHat size={15} />
                      Kitchen copy
                    </p>
                    <TicketCard order={selected} variant="kot" />
                  </div>

                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-600">
                      <Receipt size={15} />
                      Customer copy
                    </p>
                    <TicketCard order={selected} variant="receipt" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {printSnapshot && (
        <div className="print-ticket hidden">
          <TicketCard order={printSnapshot} variant={mode} />
        </div>
      )}
    </section>
  );
}

function TicketCard({ order, variant }) {
  const isKot = variant === "kot";
  const items = order.items || [];
  const hasTable = order.table && order.table !== "—";

  return (
    <article className="ticket-card rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-800 shadow-sm">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-[#dc2626]">
        {isKot ? "Kitchen Order Ticket" : "Customer Receipt"}
      </p>

      <h3 className="mt-1 text-center text-2xl font-bold text-slate-900">
        {order.id}
      </h3>

      <p className="mt-1 text-center text-sm font-bold text-slate-900">
        {sourceLabel(order.source)}
      </p>

      <p className="mt-1 text-center text-xs text-slate-500">
        {order.createdAt}
      </p>

      <div className="my-4 border-t border-dashed border-slate-300" />

      <div className="space-y-1">
        <p>
          <span className="text-slate-500">Type:</span>{" "}
          {order.type || "Delivery"}
          {hasTable ? ` · Table ${order.table}` : ""}
        </p>

        <p>
          <span className="text-slate-500">Customer:</span>{" "}
          {order.customerName || "Walk-in Guest"}
          {order.phone ? ` · ${order.phone}` : ""}
        </p>

        {!isKot && order.address && (
          <p>
            <span className="text-slate-500">Address:</span> {order.address}
          </p>
        )}
      </div>

      <div className="my-4 border-t border-dashed border-slate-300" />

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={`${order.id}-${variant}-${item.id ?? index}`}
            className="flex justify-between gap-3"
          >
            <span className={isKot ? "text-base font-semibold text-slate-900" : ""}>
              {item.qty}× {item.name}
              {item.option ? ` (${item.option})` : ""}
            </span>

            {!isKot && (
              <span className="whitespace-nowrap">
                {formatPKR(Number(item.qty || 0) * Number(item.price || 0))}
              </span>
            )}
          </li>
        ))}
      </ul>

      {order.notes && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-[#b91c1c]">
          Note: {order.notes}
        </p>
      )}

      {!isKot ? (
        <>
          <div className="my-4 border-t border-dashed border-slate-300" />

          <div className="space-y-1">
            <p className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatPKR(order.subtotal ?? order.total ?? 0)}</span>
            </p>

            <p className="flex justify-between text-slate-600">
              <span>Discount</span>
              <span>{formatPKR(order.discount ?? 0)}</span>
            </p>

            <p className="flex justify-between text-slate-600">
              <span>Tax</span>
              <span>{formatPKR(order.tax ?? 0)}</span>
            </p>
          </div>

          <p className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatPKR(order.total ?? 0)}</span>
          </p>

          {order.paymentMethod && (
            <p className="mt-3 text-center text-xs capitalize text-slate-500">
              Payment: {order.paymentMethod}
              {order.paymentStatus ? ` · ${order.paymentStatus}` : ""}
            </p>
          )}
        </>
      ) : (
        <p className="mt-5 text-center text-xs text-slate-500">
          KOT · Order ID {order.id}
        </p>
      )}
    </article>
  );
}