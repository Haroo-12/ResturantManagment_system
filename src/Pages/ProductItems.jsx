import React, { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, Share2, ArrowRight, Check } from "lucide-react";

import { supabase } from "../supabas.js"; // apna sahi path
import { AddtocartContexts } from "../AddtocartContext/Addtocartcontext";

import { handleAddToCart } from "../Logic/Addtocart.js";
import QuantityControl from "../Addtocartcomponents/QuantityControl.jsx";

const MAX_CHARS = 500;

const ProductItems = () => {
  const { categoryId, itemId } = useParams();
  const navigate = useNavigate();

  const { setCart, setcount } = useContext(AddtocartContexts);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // URL ki itemId ab database ki asli id hai
  useEffect(() => {
    let active = true;
    setLoading(true);

    supabase
      .from("menu_items")
      .select("id, name, hot_price, iced_price, image_url, categories(slug, banner_url)")
      .eq("id", itemId)
      .eq("is_available", true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        // Item usi category ka hona chahiye jo URL mein hai
        if (!error && data && data.categories?.slug === categoryId) {
          setItem({
            id: data.id,
            name: data.name,
            hotPrice: data.hot_price,
            icedPrice: data.iced_price,
            image: data.image_url,
            banner: data.categories.banner_url,
          });
        } else {
          setItem(null);
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [itemId, categoryId]);

  const options = useMemo(() => {
    if (!item) return [];

    return [
      { key: "hot", label: "Hot", price: item.hotPrice },
      { key: "iced", label: "Iced", price: item.icedPrice },
    ].filter((option) => option.price !== null && option.price !== undefined);
  }, [item]);

  const [selected, setSelected] = useState();
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const goBack = () => navigate(-1);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-100 p-4 text-sm text-slate-500">
        Loading...
      </div>
    );
  }

  if (!item || options.length === 0) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-100 p-4">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-lg">
          <p className="text-lg font-bold text-slate-800">Item not found</p>

          <button
            onClick={goBack}
            className="mt-5 rounded-full px-6 py-3 font-bold text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const current = options.find((option) => option.key === selected) || options[0];

  const total = current.price * qty;
  const image = item.image || item.banner;

  // Quantity increase
  const onIncrease = () => {
    setQty((prev) => prev + 1);
  };

  // Quantity decrease
  const onDecrease = () => {
    setQty((prev) => Math.max(1, prev - 1));
  };

  // Close product modal
  const onRemove = () => {
    goBack();
  };

  // Add to cart (ab database mein save hota hai)
  const onAddToCart = async () => {
    if (adding) return;
    setAdding(true);
    await handleAddToCart({
      item,
      categoryId,
      current,
      qty,
      note,
      setCart,
      setcount,
      goBack,
    });
    setAdding(false);
  };

  // Share product
  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.name,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // Share cancelled
    }
  };

  const topBtn =
    "grid place-items-center size-10 sm:size-11 rounded-full text-white shadow-lg transition hover:scale-105 active:scale-95";

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/50 p-3 sm:p-6">
      <div className="relative flex h-[90dvh] max-h-[650px] w-full max-w-[900px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:flex-row">

        {/* Share + Close */}
        <div className="absolute right-3 top-3 z-20 flex gap-2 sm:right-4 sm:top-4 sm:gap-3">
          <button
            onClick={handleShare}
            aria-label="Share"
            className={topBtn}
            style={{ background: "var(--gradient-primary)" }}
          >
            <Share2 className="size-4 sm:size-5" />
          </button>

          <button
            onClick={goBack}
            aria-label="Close"
            className={topBtn}
            style={{ background: "var(--gradient-primary)" }}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Product Image */}
        <div className="relative h-[260px] shrink-0 bg-gradient-to-b from-white to-neutral-300 sm:h-[320px] md:h-full md:w-1/2">
          {image && (
            <img
              src={image}
              alt={item.name}
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

          <h1 className="absolute bottom-4 left-5 right-5 text-2xl font-extrabold text-white drop-shadow sm:text-3xl md:bottom-6 md:left-7 md:text-4xl">
            {item.name}
          </h1>
        </div>

        {/* Product Details */}
        <div className="flex min-h-0 flex-1 flex-col md:w-1/2">
          <div className="flex-1 overflow-y-auto px-5 pb-4 pt-5 md:px-8 md:pt-7">

            {/* Price */}
            <p
              className="pr-28 text-3xl font-extrabold md:text-4xl"
              style={{ color: "var(--color-primary-600)" }}
            >
              Rs. {current.price}
            </p>

            <div className="mt-4 border-t border-gray-100" />

            {/* Hot / Iced Options */}
            <h2 className="mt-5 text-sm font-bold uppercase tracking-wide text-slate-800 md:text-base">
              Choose an option
            </h2>

            <div className="mt-3 flex flex-wrap gap-3">
              {options.map((opt) => {
                const active = current.key === opt.key;

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSelected(opt.key)}
                    className={`flex min-w-[130px] flex-1 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition sm:w-[160px] sm:flex-none ${
                      active
                        ? "border-[var(--color-primary-600)] bg-red-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${
                        active
                          ? "border-[var(--color-primary-600)] bg-[var(--color-primary-600)] text-white"
                          : "border-gray-300"
                      }`}
                    >
                      {active && <Check className="size-3.5" strokeWidth={3} />}
                    </span>

                    <span>
                      <span className="block font-bold text-slate-800">{opt.label}</span>

                      <span
                        className="block text-sm font-bold"
                        style={{ color: "var(--color-primary-600)" }}
                      >
                        Rs. {opt.price}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Special Instructions */}
            <h2 className="mt-6 text-base font-bold text-slate-800 md:text-lg">
              Special Instructions
            </h2>

            <div className="relative mt-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Please enter instructions about this item"
                rows={4}
                className="w-full resize-none rounded-2xl border border-gray-200 p-4 pb-8 text-sm text-slate-700 outline-none placeholder:text-gray-400 focus:border-[var(--color-primary-600)] md:text-base"
              />

              <span className="absolute bottom-3 right-4 text-xs font-semibold text-gray-400 md:text-sm">
                {note.length}/{MAX_CHARS}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-gray-100 bg-white px-4 py-3 md:px-6 md:py-4">

            <QuantityControl
              count={qty}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
              onRemove={onRemove}
            />

            {/* Add To Cart */}
            <button
              type="button"
              onClick={onAddToCart}
              disabled={adding}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60 sm:gap-3 sm:text-base md:h-14"
              style={{ background: "var(--gradient-primary)" }}
            >
              <span>Rs. {total}</span>
              <span className="h-5 w-px bg-white/60" />
              <span>{adding ? "Adding..." : "Add to Cart"}</span>
              <ArrowRight className="size-4 sm:size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItems;