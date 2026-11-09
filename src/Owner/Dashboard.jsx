import { Banknote, ClipboardList, Clock3, TrendingUp, XCircle } from "lucide-react";
import PageHeader from "../AdminPagesComponents/PageHeader";
import StatsCard from "../AdminPagesComponents/StatsCard";
import OrdersTable from "../AdminPagesComponents/OrdersTable";
import { formatPKR } from "../Arrays/Mockdata";
import useOwnerData from "../Logic/useOwnerData.js";
import useOrders, { toUiOrder } from "../Logic/useOrders.js";

export default function Dashboard({ onViewOrder }) {
  const { stats, salesByDay, loading } = useOwnerData();
  const { orders: rows } = useOrders();
  const orders = rows.map(toUiOrder);
  const recent = orders.slice(0, 6);
  const maxRevenue = Math.max(...salesByDay.map((day) => day.revenue), 1);

  if (loading) {
    return <p className="py-16 text-center text-sm text-slate-500">Loading dashboard...</p>;
  }

  return (
    <section>
      <PageHeader title="Owner Dashboard" subtitle="Sales, profit and live order snapshot for Clifton Flagship." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Sales" value={formatPKR(stats.totalSales)} hint="Last 30 days" icon={Banknote} />
        <StatsCard title="Estimated Profit" value={formatPKR(stats.profit || 0)} hint="After item cost" icon={TrendingUp} tone="emerald" />
        <StatsCard title="Total Orders" value={stats.totalOrders} hint="Last 30 days" icon={ClipboardList} tone="slate" />
        <StatsCard title="Cancelled Orders" value={stats.cancelledOrders} hint="Last 30 days" icon={XCircle} tone="red" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Sales overview</h2>
            <p className="text-xs text-slate-500">Last 7 days</p>
          </div>
          <div className="flex h-56 items-end gap-2 sm:gap-3">
            {salesByDay.map((day) => (
              <div key={day.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                <div
                  className="w-full max-w-12 rounded-t-lg bg-[#dc2626]"
                  style={{ height: `${Math.max((day.revenue / maxRevenue) * 100, 8)}%` }}
                  title={formatPKR(day.revenue)}
                />
                <p className="mt-2 text-xs font-medium text-slate-600">{day.label}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Today at a glance</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center justify-between rounded-xl bg-[var(--color-box)] px-3 py-2.5">
              <span className="text-slate-600">Completed</span>
              <span className="font-semibold text-slate-900">{stats.completedOrders}</span>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-[var(--color-box)] px-3 py-2.5">
              <span className="text-slate-600">Pending</span>
              <span className="font-semibold text-slate-900">{stats.pendingOrders}</span>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-[var(--color-box)] px-3 py-2.5">
              <span className="text-slate-600">Weekly Sales</span>
              <span className="font-semibold text-slate-900">{formatPKR(stats.weeklySales)}</span>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-[var(--color-box)] px-3 py-2.5">
              <span className="text-slate-600">Monthly Sales</span>
              <span className="font-semibold text-slate-900">{formatPKR(stats.monthlySales)}</span>
            </li>
          </ul>
        </article>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Recent orders</h2>
        <OrdersTable orders={recent} onView={onViewOrder} emptyMessage="No recent orders." />
      </div>
    </section>
  );
}
