import { Eye } from "lucide-react";
import { formatPKR } from "../Arrays/Mockdata";
import StatusBadge from "./StatusBadge";

export default function OrdersTable({
  orders,
  onView,
  onStatusChange,
  onPaymentChange,
  showSource = true,
  emptyMessage = "No orders match the current filters.",
  statusOptions = [],
}) {
  if (!orders.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-sm font-medium text-slate-700">Nothing to show</p>
        <p className="mt-1 text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              {showSource ? <th className="px-4 py-3 font-semibold">Source</th> : null}
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{order.id}</p>
                  <p className="text-xs text-slate-500">{order.createdAt}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{order.customerName}</p>
                  <p className="text-xs text-slate-500">{order.phone}</p>
                </td>
                {showSource ? (
                  <td className="px-4 py-3 capitalize text-slate-700">{order.source}</td>
                ) : null}
                <td className="px-4 py-3 capitalize text-slate-700">{order.type}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{formatPKR(order.total)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1">
                    <StatusBadge status={order.paymentMethod} type="payment" />
                    {onPaymentChange ? (
                      <select
                        value={order.paymentStatus === "paid" ? "paid" : "unpaid"}
                        onChange={(event) => onPaymentChange(order.id, event.target.value)}
                        className={`rounded-lg border px-2 py-1 text-xs font-medium ${
                          order.paymentStatus === "paid"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                        }`}
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                      </select>
                    ) : (
                      <StatusBadge status={order.paymentStatus} type="payment" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {onStatusChange ? (
                    <select
                      value={order.status}
                      onChange={(event) => onStatusChange(order.id, event.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <StatusBadge status={order.status} />
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onView?.(order)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}