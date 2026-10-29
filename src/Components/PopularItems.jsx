import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddtocartContexts } from "../AddtocartContext/Addtocartcontext";
import CartQuantityControl from "../Addtocartcomponents/CartQuantityControl.jsx";
import { supabase } from "../supabas.js"; // apna sahi path

const PopularItems = () => {
  const { cart } = useContext(AddtocartContexts);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  // "popular" category ke items Supabase se
  useEffect(() => {
    supabase
      .from("menu_items")
      .select("id, name, hot_price, iced_price, image_url, categories!inner(slug)")
      .eq("categories.slug", "popular")
      .eq("is_available", true)
      .order("id")
      .then(({ data, error }) => {
        if (error) return console.error(error.message);
        setItems(
          data.map((i) => ({
            id: i.id,
            name: i.name,
            hotPrice: i.hot_price,
            icedPrice: i.iced_price,
            image: i.image_url,
          }))
        );
      });
  }, []);

  return (
    <div className="lg:pt-10 pt-7">
      <div className="lg:px-8 px-4 flex flex-col gap-2">
        <h1 className="lg:text-4xl text-2xl font-bold">🔥Popular Items</h1>
        <p className="text-sm lg:text-base">Most ordered right now</p>
      </div>

      <div className="w-full flex flex-wrap justify-center gap-5 lg:pt-10 pt-7">
        {items.map((item) => {
          const cartItem = cart.find(
            (c) => String(c.id) === String(item.id) && c.categoryId === "popular"
          );

          return (
            <div
              key={item.id}
              className="w-[46%] lg:w-[23%] overflow-hidden rounded-2xl bg-white"
            >
              {/* Product Image */}
              <div className="relative w-full aspect-square bg-white">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Add / Quantity Control */}
                {cartItem ? (
                  <div className="absolute bottom-3 right-3">
                    <CartQuantityControl cartItem={cartItem} />
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-label={`Add ${item.name}`}
                    onClick={() => navigate(`/allfood/popular/${item.id}`)}
                    className="absolute bottom-3 right-3 w-12 h-12 sm:w-[60px] sm:h-[60px] rounded-full flex items-center justify-center text-white text-4xl font-light shadow-xl hover:scale-105 transition-transform"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    +
                  </button>
                )}
              </div>

              {/* Product Details */}
              <div className="px-3 pt-3 pb-5">
                <h3 className="text-base sm:text-xl font-bold text-[#202938]">{item.name}</h3>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                  {item.hotPrice != null && (
                    <p
                      className="text-sm sm:text-lg text-transparent bg-clip-text"
                      style={{ backgroundImage: "var(--text-gradient-primary)" }}
                    >
                      Hot: <span className="font-bold">{item.hotPrice}</span>
                    </p>
                  )}

                  {item.icedPrice != null && (
                    <p
                      className="text-sm sm:text-lg text-transparent bg-clip-text"
                      style={{ backgroundImage: "var(--text-gradient-primary)" }}
                    >
                      Iced: <span className="font-bold">{item.icedPrice}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularItems;