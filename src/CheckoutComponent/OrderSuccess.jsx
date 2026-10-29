import { Check } from "lucide-react";

// Order ho jane ke baad ka screen
const OrderSuccess = ({ order, onDone }) => (
  <div className="min-h-screen grid place-items-center bg-gray-50 p-4">
    <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-lg">
      <span
        className="mx-auto grid size-16 place-items-center rounded-full text-white"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Check className="size-8" strokeWidth={3} />
      </span>
      <p className="mt-4 text-xl font-extrabold text-slate-800">Order placed!</p>
      <p className="mt-2 text-slate-500">
        Your order number is <span className="font-bold text-slate-800">#{order.id}</span>
      </p>
      <p className="mt-1 text-slate-500">
        Total:{" "}
        <span className="font-bold text-[var(--color-primary-600)]">Rs. {order.total}</span>
      </p>
      <button
        onClick={onDone}
        className="mt-6 rounded-full px-6 py-3 font-bold text-white"
        style={{ background: "var(--gradient-primary)" }}
      >
        Back to menu
      </button>
    </div>
  </div>
);

export default OrderSuccess;