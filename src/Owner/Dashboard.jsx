import { Banknote, ClipboardList, Clock3, TrendingUp } from "lucide-react";
import PageHeader from "../AdminPagesComponents/PageHeader";
import StatsCard from "../AdminPagesComponents/StatsCard";
import OrdersTable from "../AdminPagesComponents/OrdersTable";
import { formatPKR, ownerStats, salesByDay } from "../Arrays/Mockdata";

export default function Dashboard({ orders, onViewOrder }) {
  const pending = orders.filter((order) => order.status === "pending").length;
  const recent = orders.slice(0, 6);
  const maxRevenue = Math.max(...salesByDay.map((day) => day.revenue), 1);

  return (
    <section>
      <PageHeader title="Owner Dashboard" subtitle="Sales, profit and live order snapshot for Clifton Flagship." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Sales" value={formatPKR(ownerStats.totalSales)} hint="October to date" icon={Banknote} />
        <StatsCard title="Estimated Profit" value={formatPKR(ownerStats.profit)} hint="After item cost" icon={TrendingUp} tone="emerald" />
        <StatsCard title="Total Orders" value={ownerStats.totalOrders} hint={`Avg ticket ${formatPKR(ownerStats.avgTicket)}`} icon={ClipboardList} tone="slate" />
        <StatsCard title="Pending Orders" value={pending} hint="Need attention today" icon={Clock3} tone="amber" />
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
            {salesByDay.slice(-3).map((day) => (
              <li key={day.label} className="flex items-center justify-between rounded-xl bg-[var(--color-box)] px-3 py-2.5">
                <span className="text-slate-600">{day.label}</span>
                <span className="font-semibold text-slate-900">{formatPKR(day.revenue)}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Recent orders</h2>
        <OrdersTable orders={recent} onView={onViewOrder} emptyMessage="No recent orders in this demo session." />
      </div>
    </section>
  );
}
