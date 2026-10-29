import { ShoppingBag, ArrowLeft } from "lucide-react";

// Checkout ka right hissa: cart ke items, total, promo aur Place Order button
const OrderSummary = ({
  cart,
  total,
  promo,
  onPromoChange,
  canOrder,
  placing,
  error,
  onPlaceOrder,
  onBack,
}) => (
  <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start shadow p-4 rounded-xl">
    {/* Items */}
    <div className="space-y-3 rounded-3xl border border-gray-100 bg-white p-3 shadow-sm">
      {cart.map((item) => (
        <div
          key={`${item.categoryId}-${item.id}-${item.selectedOption}`}
          className="flex items-center gap-3"
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
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-800">
              <span className="mr-1 text-sm font-semibold text-slate-500">{item.qty}x</span>
              {item.optionLabel} {item.name}
            </p>
            <p className="font-bold text-[var(--color-primary-600)]">
              Rs. {item.price * item.qty}
            </p>
          </div>
        </div>
      ))}
    </div>

    {/* Price summary (tax, delivery fee ya discount ki rows baad mein yahan add hongi) */}
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-lg font-extrabold text-slate-800">Grand Total</span>
        <span className="text-2xl font-extrabold text-[var(--color-primary-600)]">
          Rs. {total}
        </span>
      </div>
    </div>

    {/* Promo */}
    <div className="flex gap-2 rounded-2xl border border-gray-100 bg-white p-3">
      <input
        value={promo}
        onChange={(e) => onPromoChange(e.target.value)}
        placeholder="Enter Voucher / Promo code"
        className="h-12 min-w-0 flex-1 rounded-xl border border-gray-200 px-4 text-sm outline-none placeholder:text-gray-400 focus:border-[var(--color-primary-600)]"
      />
      <button
        type="button"
        className="rounded-xl px-5 font-bold text-white"
        style={{ background: "var(--gradient-primary)" }}
      >
        Apply
      </button>
    </div>

    {error && (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>
    )}

    {/* Place order */}
    <button
      type="button"
      disabled={!canOrder || placing}
      onClick={onPlaceOrder}
      className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl text-lg font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      style={{ background: "var(--gradient-primary)" }}
    >
      <ShoppingBag className="size-6" />
      {placing ? "Placing order..." : "Place Order"}
    </button>

    <button
      type="button"
      onClick={onBack}
      className="mx-auto flex items-center gap-2 font-bold text-[var(--color-primary-600)]"
    >
      <ArrowLeft className="size-5" />
      continue to add more items
    </button>
  </aside>
);

export default OrderSummary;