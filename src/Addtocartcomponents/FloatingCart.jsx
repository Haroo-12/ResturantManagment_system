import { useContext } from "react";
import { ShoppingBag } from "lucide-react";
import { AddtocartContexts } from "../AddtocartContext/Addtocartcontext";

const FloatingCart = ({ onClick }) => {
  const { count } = useContext(AddtocartContexts);

  if (!count) return null;

  return (
  <div>
      <button
      type="button"
      onClick={onClick}
      aria-label="Open cart"
      className="fixed lg:top-25 top-10 right-5 z-50 grid place-items-center size-16 sm:size-[72px]"
    >
      <span className="pointer-events-none absolute -inset-2 rounded-full border-2 border-[var(--color-primary-600)]/30 animate-ping" />
      <span className="pointer-events-none absolute -inset-2 rounded-full border-2 border-[var(--color-primary-600)]/20" />

      <span
        className="relative grid place-items-center size-full rounded-full text-white shadow-xl"
        style={{ background: "var(--gradient-primary)" }}
      >
        <ShoppingBag className="size-7 sm:size-8" strokeWidth={2} />
      </span>

      <span className="absolute -top-1 -right-1 grid place-items-center min-w-6 h-6 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold ring-2 ring-white">
        {count}
      </span>
    </button>
  </div>
  );
};

export default FloatingCart;