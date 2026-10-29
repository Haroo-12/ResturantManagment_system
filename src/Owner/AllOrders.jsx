import { useMemo, useState, useCallback, useEffect } from "react";
import { Search } from "lucide-react";
import PageHeader from "../AdminPagesComponents/PageHeader";
import OrdersTable from "../AdminPagesComponents/OrdersTable";
import OrderDetailsModal from "../AdminPagesComponents/OrderDetailsModal";
import useOrders, { toUiOrder, ORDER_STATUS_OPTIONS } from "../Logic/useOrders.js";
import { get } from "idb-keyval";

const PAGE_SIZE = 8;
const POS_ORDERS = "pos-orders";

// canEdit: true ho to table mein status badalne ka dropdown aata hai (manager ke liye)
export default function AllOrders({ canEdit = false }) {
  // Orders ab seedha Supabase se aate hain (props ya mock data ki zaroorat nahi)
  const { orders: rows, loading, error, updateStatus } = useOrders();
  const websiteOrders = useMemo(() => rows.map(toUiOrder), [rows]);

  const [localOrders, setLocalOrders] = useState([]);

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
        // POS: cod is unpaid until payment is received
        paymentStatus: order.paymentMethod === "cod" ? "unpaid" : "pending",
        items: (order.items || []).map((item) => ({
          ...item,
          name: item.name,
          price: Number(item.price || 0),
          qty: Number(item.qty || 0),
        })),
      })),
    [localOrders]
  );

  const orders = useMemo(() => {
    // Deduplicate: if a local POS order has a supabaseId that matches a website order,
    // only keep the website order (source of truth from Supabase)
    const syncedPosIds = new Set(
      posOrders
        .filter((o) => o.supabaseId)
        .map((o) => o.supabaseId)
    );

    const filteredWebsite = websiteOrders.filter(
      (o) => !syncedPosIds.has(o.dbId)
    );

    return [...posOrders, ...filteredWebsite];
  }, [posOrders, websiteOrders]);

  // Table ke dropdown se status badalna: table ki id "#12" hoti hai, database ko asli id chahiye
  const handleStatus = (id, next) => {
    const dbId = orders.find((o) => o.id === id)?.dbId;
    // Only update status for Supabase orders (numeric dbId)
    if (dbId && typeof dbId === "number") {
      updateStatus(dbId, next);
    }
  };

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesQuery =
        !term ||
        order.id.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.phone.toLowerCase().includes(term);
      const matchesStatus = status === "all" || order.status === status;
      const matchesSource = source === "all" || order.source === source;
      return matchesQuery && matchesStatus && matchesSource;
    });
  }, [orders, query, status, source]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  if (loading) {
    return <p className="py-16 text-center text-sm text-slate-500">Loading orders...</p>;
  }

  return (
    <section>
      <PageHeader title="All Orders" subtitle="Website and POS orders in one place." />

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-[#dc2626]">{error}</p>}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row">
        <label className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search by order ID, customer or phone"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#dc2626]"
          />
        </label>
        <select
          value={source}
          onChange={(event) => {
            setSource(event.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="all">All sources</option>
          <option value="website">Website</option>
          <option value="pos">POS</option>
        </select>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
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
        orders={visible}
        onView={setSelected}
        onStatusChange={canEdit ? handleStatus : undefined}
        statusOptions={ORDER_STATUS_OPTIONS}
        emptyMessage="Try another search or filter."
      />

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <p>
          Showing {visible.length} of {filtered.length}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={current <= 1}
            onClick={() => setPage((value) => value - 1)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={current >= pages}
            onClick={() => setPage((value) => value + 1)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
      <OrderDetailsModal order={selected} onClose={() => setSelected(null)} />
    </section>
  );
}