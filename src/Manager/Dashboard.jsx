import { useMemo, useState } from "react";
import { Banknote, ClipboardList, Clock3, ShoppingCart, Printer, Users } from "lucide-react";
import PageHeader from "../AdminPagesComponents/PageHeader";
import StatsCard from "../AdminPagesComponents/StatsCard";
import OrdersTable from "../AdminPagesComponents/OrdersTable";
// import OrderDetailsModal from "../AdminPagesComponents/OrderDetailsModal";
import { formatPKR } from "../Arrays/Mockdata";
import useOrders, { toUiOrder } from "../Logic/useOrders.js";
import OrderDetailsModal from "../AdminPagesComponents/OrderDetailsModal.jsx";

export default function Dashboard() {
  // Orders seedha Supabase se (naya order aate hi numbers khud badal jate hain)
  const { orders: rows, loading } = useOrders();
  const orders = useMemo(() => rows.map(toUiOrder), [rows]);
  const [selected, setSelected] = useState(null);

  // Aaj ke orders (asli date se)
  const today = new Date().toDateString();
  const todayRows = rows.filter((row) => new Date(row.created_at).toDateString() === today);

  const pending = orders.filter((order) => ["pending", "confirmed", "preparing"].includes(order.status)).length;
  const todaySales = todayRows.reduce((sum, row) => sum + (row.status === "cancelled" ? 0 : Number(row.total)), 0);
  // Cash on Delivery ke aaj ke orders (cancelled ke baghair)
  const expectedCash = todayRows.reduce(
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
        <StatsCard title="Today's Orders" value={todayRows.length} hint="Website + POS" icon={ClipboardList} tone="slate" />
        <StatsCard title="In Progress" value={pending} hint="Pending, confirmed, preparing" icon={Clock3} tone="amber" />
        <StatsCard title="Expected Cash" value={formatPKR(expectedCash)} hint="Before closing" icon={Banknote} tone="emerald" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 ">
      <article className="min-w-0 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Recent orders</h2>
          <OrdersTable orders={orders.slice(0, 5)} onView={setSelected} emptyMessage="No orders yet." />
        </article>

  
      </div>

      <OrderDetailsModal order={selected} onClose={() => setSelected(null)} />
    </section>
  );
}