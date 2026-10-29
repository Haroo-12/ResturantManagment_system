import { useState } from "react";
import PageHeader from "../AdminPagesComponents/PageHeader";
import StatusBadge from "../AdminPagesComponents/StatusBadge";
import Modal from "../AdminPagesComponents/Modal";
import { formatPKR } from "../Arrays/Mockdata";

export default function DailyClosingHistory({ records }) {
  const [selected, setSelected] = useState(null);

  return (
    <section>
      <PageHeader title="Daily Closing History" subtitle="Previous end-of-day records for review. Demo figures only." />

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
                      <p className="font-medium text-slate-900">{row.date}</p>
                      <p className="text-xs text-slate-500">{row.id}</p>
                    </td>
                    <td className="px-4 py-3">{row.orders}</td>
                    <td className="px-4 py-3 font-medium">{formatPKR(row.sales)}</td>
                    <td className="px-4 py-3">{formatPKR(row.cash)}</td>
                    <td className="px-4 py-3">{formatPKR(row.card)}</td>
                    <td className="px-4 py-3">{formatPKR(row.online)}</td>
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

      <Modal open={Boolean(selected)} title={selected ? selected.date : "Closing"} onClose={() => setSelected(null)}>
        {selected ? (
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Closed by</dt>
              <dd className="font-medium text-slate-900">{selected.closedBy}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Expected cash</dt>
              <dd className="font-medium text-slate-900">{formatPKR(selected.expectedCash)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Actual cash</dt>
              <dd className="font-medium text-slate-900">{formatPKR(selected.actualCash)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Expenses</dt>
              <dd className="font-medium text-slate-900">{formatPKR(selected.expenses)}</dd>
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
