import { useMemo, useState } from "react";
import { Banknote, Percent, ShoppingBag } from "lucide-react";
import PageHeader from "../AdminPagesComponents/PageHeader";
import StatsCard from "../AdminPagesComponents/StatsCard";
import { categorySales, formatPKR, salesByDay, salesByMonth, salesByWeek } from "../Arrays/Mockdata";

const ranges = {
  daily: salesByDay,
  weekly: salesByWeek,
  monthly: salesByMonth,
};

export default function SalesReports() {
  const [range, setRange] = useState("daily");
  const series = ranges[range];
  const maxRevenue = Math.max(...series.map((item) => item.revenue), 1);

  const totals = useMemo(
    () =>
      series.reduce(
        (acc, item) => ({
          revenue: acc.revenue + item.revenue,
          profit: acc.profit + item.profit,
          orders: acc.orders + item.orders,
        }),
        { revenue: 0, profit: 0, orders: 0 }
      ),
    [series]
  );

  const margin = totals.revenue ? Math.round((totals.profit / totals.revenue) * 100) : 0;

  return (
    <section>
      <PageHeader
        title="Sales Reports"
        subtitle="Compare revenue and estimated profit by period. Figures are demo data."
        actions={
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            {["daily", "weekly", "monthly"].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setRange(id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${
                  range === id ? "bg-[#dc2626] text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard title="Revenue" value={formatPKR(totals.revenue)} hint={`${series.length} periods`} icon={Banknote} />
        <StatsCard title="Estimated Profit" value={formatPKR(totals.profit)} hint={`${margin}% margin`} icon={Percent} tone="emerald" />
        <StatsCard title="Orders" value={totals.orders} hint="Completed volume" icon={ShoppingBag} tone="slate" />
      </div>

      <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Revenue chart</h2>
        <div className="flex h-64 items-end gap-2 sm:gap-3">
          {series.map((item) => (
            <div key={item.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
              <p className="mb-1 hidden text-[10px] text-slate-500 sm:block">{formatPKR(item.revenue)}</p>
              <div className="flex w-full max-w-14 items-end gap-1">
                <div
                  className="flex-1 rounded-t-md bg-[#dc2626]"
                  style={{ height: `${Math.max((item.revenue / maxRevenue) * 180, 12)}px` }}
                />
                <div
                  className="flex-1 rounded-t-md bg-slate-300"
                  style={{ height: `${Math.max((item.profit / maxRevenue) * 180, 8)}px` }}
                />
              </div>
              <p className="mt-2 text-xs font-medium text-slate-600">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#dc2626]" /> Revenue
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-300" /> Profit
          </span>
        </div>
      </article>

      <article className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Category breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[520px] w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <th className="px-4 py-3 text-left font-semibold">Revenue</th>
                <th className="px-4 py-3 text-left font-semibold">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categorySales.map((row) => (
                <tr key={row.category}>
                  <td className="px-4 py-3 font-medium text-slate-800">{row.category}</td>
                  <td className="px-4 py-3">{formatPKR(row.revenue)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-[#dc2626]" style={{ width: `${row.share}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{row.share}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
