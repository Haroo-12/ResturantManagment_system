import Modal from "./Modal";
import StatusBadge from "./StatusBadge";
import { formatPKR } from "../Arrays/Mockdata";

// Ek line (value na ho to dikhti hi nahi)
const Row = ({ label, children }) =>
  children ? (
    <p>
      <span className="text-slate-500">{label}:</span> {children}
    </p>
  ) : null;

// Order ki poori detail: Dashboard, All Orders aur Orders Management teeno isi ko use karte hain
export default function OrderDetailsModal({ order, onClose }) {
  return (
    <Modal
      open={Boolean(order)}
      title={order ? `Order ${order.id}` : "Order"}
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-[#dc2626] px-4 py-2 text-sm font-medium text-white"
        >
          Close
        </button>
      }
    >
      {order ? (
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.source} type="payment" />
            <StatusBadge status={order.paymentStatus} type="payment" />
          </div>

          <Row label="Customer">
            {order.customerName} · {order.phone}
          </Row>
          <Row label="Placed">{order.createdAt}</Row>
          <Row label="Type">
            {order.type}
            {order.table ? ` · Table ${order.table}` : ""}
          </Row>
          <Row label="Address">{order.address}</Row>
          <Row label="Landmark">{order.landmark}</Row>
          <Row label="Payment">
            {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
          </Row>
          <Row label="Instructions">{order.instructions}</Row>

          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {order.items.map((item) => (
              <li key={`${order.id}-${item.id}`} className="px-3 py-2">
                <div className="flex justify-between">
                  <span>
                    {item.qty}× {item.name}
                  </span>
                  <span>{formatPKR(item.qty * item.price)}</span>
                </div>
                {item.note && <p className="mt-0.5 text-xs text-slate-400">Note: {item.note}</p>}
              </li>
            ))}
          </ul>

          <p className="flex justify-between font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatPKR(order.total)}</span>
          </p>
        </div>
      ) : null}
    </Modal>
  );
}