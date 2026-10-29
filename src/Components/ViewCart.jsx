
import React, { useContext } from "react";
import { AddtocartContexts } from "../AddtocartContext/Addtocartcontext";

const ViewCart = () => {
  const { cart, count, setCartOpen } = useContext(AddtocartContexts);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  if (cart.length === 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-3">
      <div className="w-full max-w-[405px]">
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="animate-cart-float w-full h-[64px] sm:h-[76px] rounded-full flex items-center justify-between gap-2 px-4 sm:px-7 text-white shadow-xl"
          style={{ background: "var(--gradient-primary)" }}
        >
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#df2013] flex items-center justify-center font-bold text-base sm:text-lg shrink-0">
            {count}
          </span>

          <span className="text-base sm:text-xl font-bold whitespace-nowrap">
            View Cart
          </span>

          <span className="text-base sm:text-xl font-bold whitespace-nowrap">
            Rs. {total}
          </span>

          <span className="text-2xl sm:text-3xl font-light shrink-0">
            →
          </span>
        </button>
      </div>
    </div>
  );
};

export default ViewCart;