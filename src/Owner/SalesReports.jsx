import { useMemo, useState, useEffect, useCallback } from "react";
import { Banknote, Percent, ShoppingBag } from "lucide-react";
import PageHeader from "../AdminPagesComponents/PageHeader";
import StatsCard from "../AdminPagesComponents/StatsCard";
import { formatPKR } from "../Arrays/Mockdata";
import { supabase } from "../supabas.js";
import {
  getDailyClosingsHistory,
  mapOrdersToBusinessDates,
  toLocalDateString,
} from "../Logic/dailyClosing.js";

export default function SalesReports() {
  const [range, setRange] = useState("daily");
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSalesData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (ordersError) throw ordersError;

      const validOrders = (orders || []).filter(o => o.status !== "cancelled");

      // Har order ko uski business date (session ki opening date) dena,
      // taake raat 12 ke baad ki sales opening wale din mein count hon.
      const closings = await getDailyClosingsHistory();
      const businessDates = mapOrdersToBusinessDates(orders || [], closings);

      if (range === "daily") {
        // Last 7 days
        const last7Days = [];
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = toLocalDateString(date);
          const dayOrders = validOrders.filter(o => businessDates.get(o.id) === dateStr);
          const daySales = dayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
          const dayCost = dayOrders.reduce((sum, o) => {
            return sum + (o.order_items?.reduce((itemSum, item) => itemSum + (Number(item.cost || 0) * Number(item.qty || 0)), 0) || 0);
          }, 0);
          last7Days.push({
            label: dayNames[date.getDay()],
            revenue: daySales,
            profit: daySales - dayCost,
            orders: dayOrders.length,
          });
        }
        setSeries(last7Days);
      } else if (range === "weekly") {
        // Last 4 weeks
        const weeks = [];
        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          const startStr = toLocalDateString(weekStart);
          const endStr = toLocalDateString(weekEnd);

          const weekOrders = validOrders.filter(o => {
            const bd = businessDates.get(o.id);
            return bd >= startStr && bd <= endStr;
          });

          const weekSales = weekOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
          const weekCost = weekOrders.reduce((sum, o) => {
            return sum + (o.order_items?.reduce((itemSum, item) => itemSum + (Number(item.cost || 0) * Number(item.qty || 0)), 0) || 0);
          }, 0);

          weeks.push({
            label: `W${4 - i}`,
            revenue: weekSales,
            profit: weekSales - weekCost,
            orders: weekOrders.length,
          });
        }
        setSeries(weeks);
      } else if (range === "monthly") {
        // Last 6 months
        const months = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          const startStr = toLocalDateString(monthStart);
          const endStr = toLocalDateString(monthEnd);

          const monthOrders = validOrders.filter(o => {
            const bd = businessDates.get(o.id);
            return bd >= startStr && bd <= endStr;
          });

          const monthSales = monthOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
          const monthCost = monthOrders.reduce((sum, o) => {
            return sum + (o.order_items?.reduce((itemSum, item) => itemSum + (Number(item.cost || 0) * Number(item.qty || 0)), 0) || 0);
          }, 0);

          months.push({
            label: monthNames[date.getMonth()],
            revenue: monthSales,
            profit: monthSales - monthCost,
            orders: monthOrders.length,
          });
        }
        setSeries(months);
      }
    } catch (err) {
      console.error("Error loading sales data:", err);
      setError(err.message || "Could not load sales data.");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    loadSalesData();
  }, [loadSalesData]);

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

  if (loading) {
    return <p className="py-16 text-center text-sm text-slate-500">Loading sales reports...</p>;
  }

  // Mock category sales (can be replaced with real data later)
  const categorySales = [
    { category: "Coffees", revenue: totals.revenue * 0.28, share: 28 },
    { category: "Flavoured Coffees", revenue: totals.revenue * 0.23, share: 23 },
    { category: "Frappes", revenue: totals.revenue * 0.18, share: 18 },
    { category: "Matcha", revenue: totals.revenue * 0.12, share: 12 },
    { category: "Smoothies & Protein", revenue: totals.revenue * 0.11, share: 11 },
    { category: "Others", revenue: totals.revenue * 0.08, share: 8 },
  ];

  return (
    <section>
      <PageHeader
        title="Sales Reports"
        subtitle="Compare revenue and estimated profit by period."
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