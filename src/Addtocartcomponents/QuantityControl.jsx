import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";

// Sirf dikhane wala reusable component: logic bahar se props mein aata hai.
// Cart, ProductItems aur Popular, teeno jagah yahi use hota hai.
const QuantityControl = ({
  onDecrease,
  onIncrease,
  onRemove,
  count,
  disabled = false, // update chal raha ho to buttons band (double click se bachao)
}) => {
  return (
    <div
      className={`flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 transition-opacity ${
        disabled ? "opacity-60" : ""
      }`}
    >
      {/* Decrease / Remove */}
      <button
        type="button"
        disabled={disabled}
        onClick={count === 1 ? onRemove : onDecrease}
        aria-label={count === 1 ? "Remove" : "Decrease"}
        className={`grid place-items-center size-9 md:size-10 rounded-full transition disabled:cursor-not-allowed ${
          count === 1
            ? "bg-red-100 text-[var(--color-primary-600)]"
            : "bg-white text-slate-700 shadow"
        }`}
      >
        {count === 1 ? (
          <Trash2 className="size-4" />
        ) : (
          <Minus className="size-4" />
        )}
      </button>

      {/* Quantity */}
      <span className="w-8 md:w-10 text-center font-bold text-slate-800">
        {count}
      </span>

      {/* Increase */}
      <button
        type="button"
        disabled={disabled}
        onClick={onIncrease}
        aria-label="Increase"
        className="grid place-items-center size-9 md:size-10 rounded-full text-white disabled:cursor-not-allowed"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
};

export default QuantityControl;