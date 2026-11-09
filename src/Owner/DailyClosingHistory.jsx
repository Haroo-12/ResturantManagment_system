import { useState, useEffect, useCallback } from "react";
import PageHeader from "../AdminPagesComponents/PageHeader";
import StatusBadge from "../AdminPagesComponents/StatusBadge";
import Modal from "../AdminPagesComponents/Modal";
import { formatPKR } from "../Arrays/Mockdata";
import { getDailyClosingsHistory } from "../Logic/dailyClosing.js";

export default function DailyClosingHistory() {
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadClosings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getDailyClosingsHistory();
      setRecords(data);
    } catch (err) {
      console.error("Error loading closings:", err);
      setError(err.message || "Could not load closing history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClosings();
  }, [loadClosings]);

  if (loading) {
    return <p className="py-16 text-center text-sm text-slate-500">Loading closing history...</p>;
  }

  return (
    <section>
      <PageHeader title="Daily Closing History" subtitle="Previous end-of-day records for review." />

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-[#dc2626]">{error}</p>}

      {records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-500">
          No closing records yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Orders</th>
                  <th className="px-4 py-3 text-left font-semibold">Sales</th>
                  <th className="px-4 py-3 text-left font-semibold">Cash</th>
                  <th className="px-4 py-3 text-left font-semibold">Card</th>
                  <th className="px-4 py-3 text-left font-semibold">Online</th>
                  <th className="px-4 py-3 text-left font-semibold">Variance</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{row.business_date}</p>
                      <p className="text-xs text-slate-500">Day {row.day_number || "?"}</p>
                    </td>
                    <td className="px-4 py-3">{row.total_orders}</td>
                    <td className="px-4 py-3 font-medium">{formatPKR(row.total_sales)}</td>
                    <td className="px-4 py-3">{formatPKR(row.cash_sales)}</td>
                    <td className="px-4 py-3">{formatPKR(row.card_sales)}</td>
                    <td className="px-4 py-3">{formatPKR(row.online_sales)}</td>
                    <td className={`px-4 py-3 ${row.difference === 0 ? "text-emerald-700" : "text-[#dc2626]"}`}>
                      {formatPKR(row.difference)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.difference === 0 ? "closed" : "variance"} type="closing" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(row)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={Boolean(selected)} title={selected ? selected.business_date : "Closing"} onClose={() => setSelected(null)}>
        {selected ? (
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Day Number</dt>
              <dd className="font-medium text-slate-900">{selected.day_number || "?"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Closed by</dt>
              <dd className="font-medium text-slate-900">{selected.closed_by || "Unknown"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Total Orders</dt>
              <dd className="font-medium text-slate-900">{selected.total_orders}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Completed</dt>
              <dd className="font-medium text-slate-900">{selected.completed_orders}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Pending</dt>
              <dd className="font-medium text-slate-900">{selected.pending_orders}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Cancelled</dt>
              <dd className="font-medium text-slate-900">{selected.cancelled_orders}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Total Sales</dt>
              <dd className="font-medium text-slate-900">{formatPKR(selected.total_sales)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Total Profit</dt>
              <dd className="font-medium text-slate-900">{formatPKR(selected.total_profit || 0)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Expected cash</dt>
              <dd className="font-medium text-slate-900">{formatPKR(selected.expected_cash)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Actual cash</dt>
              <dd className="font-medium text-slate-900">{formatPKR(selected.actual_cash)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Expenses</dt>
              <dd className="font-medium text-slate-900">{formatPKR(selected.expenses)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Closed at</dt>
              <dd className="font-medium text-slate-900">{new Date(selected.closed_at).toLocaleString()}</dd>
            </div>
            <p className="sm:col-span-2 rounded-xl bg-[var(--color-box)] p-3 text-slate-600">
              {selected.note || "No note recorded."}
            </p>
          </dl>
        ) : null}
      </Modal>
    </section>
  );
}
