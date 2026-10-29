import React, { useContext, useEffect } from "react";
import { ShoppingBag, X, Plus } from "lucide-react";
import { AddtocartContexts } from "../AddtocartContext/Addtocartcontext";
import CartQuantityControl from "./CartQuantityControl.jsx";
import { useNavigate } from "react-router-dom";

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart, count } = useContext(AddtocartContexts);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div
      className={`fixed inset-0 z-[70] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 flex h-full w-full sm:w-[420px] flex-col bg-gray-50 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="size-6" />
            <h2 className="text-lg sm:text-xl font-bold">Your Cart</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="grid place-items-center size-10 rounded-full bg-white/20 transition hover:bg-white/30"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <ShoppingBag className="mx-auto size-14 text-gray-300" />
                <p className="mt-3 font-bold text-slate-700">Your cart is empty</p>
                <button
                  onClick={onClose}
                  className="mt-4 rounded-full px-6 py-2.5 text-sm font-bold text-white"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Browse menu
                </button>
              </div>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={`${item.categoryId}-${item.id}-${item.selectedOption}`}
                  className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3"
                >
                  <div className="size-16 sm:size-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-[#F5F5EF]">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain p-1"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-slate-800">{item.name}</h3>
                    <span className="mt-1 inline-block rounded-full bg-red-50 px-3 py-0.5 text-xs font-semibold text-[var(--color-primary-600)]">
                      {item.optionLabel}
                    </span>
                    <p className="mt-1 text-sm font-bold text-[var(--color-primary-600)]">
                      Rs. {item.price * item.qty}
                    </p>
                  </div>

                  {/* Reusable quantity control (database se jura hua) */}
                  <CartQuantityControl cartItem={item} />
                </div>
              ))}

              {/* Add more items */}
              <button
                onClick={() => {
                  onClose();
                  navigate("/");
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-red-300 py-4 font-bold text-[var(--color-primary-600)] transition hover:bg-red-50"
              >
                <Plus className="size-5" />
                Add more items
              </button>
            </>
          )}
        </div>

        {/* Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between text-sm sm:text-base">
              <span className="font-semibold text-slate-500">
                Total ({count} {count === 1 ? "item" : "items"})
              </span>
              <span className="text-lg font-extrabold text-slate-800">Rs. {total}</span>
            </div>
            <button
              onClick={() => {
                onClose(); // pehle drawer band
                navigate("/checkout"); // phir checkout page
              }}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-lg font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
              style={{ background: "var(--gradient-primary)" }}
            >
              Checkout →
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;