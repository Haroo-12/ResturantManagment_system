import { useEffect, useRef } from "react";
import { Check } from "lucide-react";

const REDIRECT_DELAY = 3000; // 3 second, yahan se badal sakte ho

// Order hone ke baad checkout page ke upar popup
const OrderSuccess = ({ order, onDone }) => {
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  // Kuch der baad khud home par bhej do
  useEffect(() => {
    const timer = setTimeout(() => doneRef.current(), REDIRECT_DELAY);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Order successful"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-green-500 text-white">
          <Check className="size-10" strokeWidth={3} />
        </span>

        <p className="mt-5 text-2xl font-extrabold text-slate-800">
          Your order is successful!
        </p>

        <p className="mt-2 text-slate-500">
          Order number{" "}
          <span className="font-bold text-slate-800">#{order.id}</span>
        </p>
        <p className="mt-1 text-slate-500">
          Total:{" "}
          <span className="font-bold text-[var(--color-primary-600)]">
            Rs. {order.total}
          </span>
        </p>

        <p className="mt-5 text-sm text-gray-400">Redirecting to home...</p>
      </div>
    </div>
  );
};

export default OrderSuccess;