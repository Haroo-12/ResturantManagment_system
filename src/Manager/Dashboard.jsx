import { useMemo, useState, useEffect } from "react";
import { Banknote, ClipboardList, Clock3, ShoppingCart, Printer, Users, XCircle } from "lucide-react";
import PageHeader from "../AdminPagesComponents/PageHeader";
import StatsCard from "../AdminPagesComponents/StatsCard";
import OrdersTable from "../AdminPagesComponents/OrdersTable";
// import OrderDetailsModal from "../AdminPagesComponents/OrderDetailsModal";
import { formatPKR } from "../Arrays/Mockdata";
import useOrders, { toUiOrder } from "../Logic/useOrders.js";
import OrderDetailsModal from "../AdminPagesComponents/OrderDetailsModal.jsx";
import { getOrdersForCurrentBusinessDay } from "../Logic/dailyClosing.js";

export default function Dashboard() {
  // Orders seedha Supabase se (naya order aate hi numbers khud badal jate hain)
  const { orders: rows, loading, refresh } = useOrders();
  const orders = useMemo(() => rows.map(toUiOrder), [rows]);
  const [selected, setSelected] = useState(null);
  const [currentBusinessDayOrders, setCurrentBusinessDayOrders] = useState([]);

  // Load current business day orders (after last closing)
  useEffect(() => {
    const loadCurrentBusinessDayOrders = async () => {
      try {
        const businessOrders = await getOrdersForCurrentBusinessDay();
        setCurrentBusinessDayOrders(businessOrders);
      } catch (err) {
        console.error("Error loading current business day orders:", err);
      }
    };

    loadCurrentBusinessDayOrders();

    // Reload when orders are refreshed
    const handleRefresh = () => {
      loadCurrentBusinessDayOrders();
    };

    window.addEventListener('orders-refresh', handleRefresh);
    return () => window.removeEventListener('orders-refresh', handleRefresh);
  }, [refresh]);

  // Convert current business day orders to UI format for display
  const currentBusinessDayUiOrders = useMemo(() => currentBusinessDayOrders.map(toUiOrder), [currentBusinessDayOrders]);

  const pending = currentBusinessDayOrders.filter((row) => ["pending", "confirmed", "preparing"].includes(row.status)).length;
  const cancelled = currentBusinessDayOrders.filter((row) => row.status === "cancelled").length;
  const todaySales = currentBusinessDayOrders.reduce((sum, row) => sum + (row.status === "cancelled" ? 0 : Number(row.total)), 0);
  // Cash on Delivery ke aaj ke orders (cancelled ke baghair)
  const expectedCash = currentBusinessDayOrders.reduce(
    (sum, row) => sum + (row.status !== "cancelled" && row.payment_method === "cod" ? Number(row.total) : 0),
    0
  );

  if (loading) {
    return <p className="py-16 text-center text-sm text-slate-500">Loading dashboard...</p>;
  }

  return (
    <section className="w-full min-w-0">
      <PageHeader title="Manager Dashboard" subtitle="Today's floor snapshot for Clifton Flagship." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Today's Sales" value={formatPKR(todaySales)} hint="Paid and unpaid tickets" icon={Banknote} />
        <StatsCard title="Today's Orders" value={currentBusinessDayOrders.length} hint="Website + POS" icon={ClipboardList} tone="slate" />
        <StatsCard title="Cancelled Orders" value={cancelled} hint="Today's cancelled" icon={XCircle} tone="red" />
        <StatsCard title="Expected Cash" value={formatPKR(expectedCash)} hint="Before closing" icon={Banknote} tone="emerald" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 ">
      <article className="min-w-0 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Recent orders</h2>
          <OrdersTable orders={currentBusinessDayUiOrders.slice(0, 5)} onView={setSelected} emptyMessage="No orders yet." />
        </article>


      </div>

      <OrderDetailsModal order={selected} onClose={() => setSelected(null)} />
    </section>
  );
}