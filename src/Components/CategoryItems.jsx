import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CategoryBanner from "./CategoryBanner";
import ViewCart from "./ViewCart.jsx";
import CartQuantityControl from "../Addtocartcomponents/CartQuantityControl.jsx";
import { AddtocartContexts } from "../AddtocartContext/Addtocartcontext";
import PopularItems from "./PopularItems.jsx";
import { supabase } from "../supabas.js"; // apna sahi path

// Database mein banner_url khali hai, to purane local banners yahan se aate hain
const bannerFallback = {
  coffees: "/images/coffees-banner.webp",
  "flavoured-coffees": "/images/flavoured-coffees-banner.webp",
  matcha: "/images/matcha-banner.webp",
  frappes: "/images/frappes-banner.webp",
  "smoothies-protein-shakes": "/images/smoothies-banner.webp",
  "chillers-daiquiris": "/images/chillers-banner.webp",
  v60s: "/images/v60s-banner.webp",
  "ice-teas": "/images/ice-teas-banner.webp",
};

// Skeleton: asli menu jaisi shakal, taake load hone par page na hile
const MenuSkeleton = () => (
  <div className="min-h-screen animate-pulse" aria-busy="true" aria-label="Loading menu">
    {/* Popular items ki jagah */}
    <div className="px-3 pt-4">
      <div className="h-6 w-40 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-28 rounded bg-gray-200" />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-gray-200" />
        ))}
      </div>
    </div>

    {/* Category banner ki jagah */}
    <div className="mx-auto mt-8 h-32 w-[96%] rounded-xl bg-gray-200 sm:h-44" />

    {/* Menu cards ki jagah */}
    <div className="flex flex-wrap items-center justify-center gap-4 px-2 pt-7 lg:pt-10">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex w-full gap-2 rounded-xl bg-gray-100 px-2 py-2 sm:px-3 lg:w-[32%]"
        >
          <div className="flex w-[65%] flex-col gap-3 px-1 sm:px-2">
            <div className="h-6 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
            <div className="h-4 w-2/3 rounded bg-gray-200" />
          </div>
          <div className="flex w-[35%] items-center pt-2">
            <div className="aspect-square w-full rounded-xl bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CategoryItems = () => {
  const { cart } = useContext(AddtocartContexts);
  const navigate = useNavigate();

  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Menu ab Supabase se aata hai, shape purani menuData jaisi hi banayi hai
  useEffect(() => {
    Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug, banner_url")
        .eq("is_active", true)
        .order("id"),
      supabase
        .from("menu_items")
        .select("id, name, hot_price, iced_price, image_url, category_id")
        .eq("is_available", true)
        .order("id"),
    ]).then(([c, m]) => {
      if (c.error || m.error) {
        console.error((c.error || m.error).message);
        setLoading(false);
        return;
      }
      setMenuData(
        c.data.map((cat) => ({
          id: cat.slug,
          title: cat.name,
          banner: cat.banner_url || bannerFallback[cat.slug],
          items: m.data
            .filter((i) => i.category_id === cat.id)
            .map((i) => ({
              id: i.id,
              name: i.name,
              hotPrice: i.hot_price,
              icedPrice: i.iced_price,
              image: i.image_url,
            })),
        }))
      );
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <MenuSkeleton />;
  }

  return (
    <div>
      <PopularItems />

      {menuData
        .filter((category) => category.id !== "popular")
        .map((category) => (
          <section key={category.id} id={category.id} className="scroll-mt-24">
            <CategoryBanner category={category} />

            <div className="w-full lg:pt-10 pt-7 flex justify-center items-center flex-wrap gap-4 px-2">
              {category.items.map((item) => {
                const cartItem = cart.find(
                  (c) => String(c.id) === String(item.id) && c.categoryId === category.id
                );

                return (
                  <div
                    key={item.id}
                    className="w-full lg:w-[32%] pt-2 pb-2 px-2 sm:px-3 flex justify-center shadow-2xl rounded-xl gap-2"
                    style={{ background: "var(--color-box)" }}
                  >
                    <div className="flex flex-col px-1 sm:px-2 gap-3 w-[65%] min-w-0">
                      <p className="font-bold text-lg sm:text-xl">{item.name}</p>

                      <p className="text-sm sm:text-base text-gray-600">
                        {item.hotPrice != null && item.icedPrice != null
                          ? "Available hot and iced."
                          : item.hotPrice != null
                          ? "Available hot."
                          : "Available iced."}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {item.hotPrice != null && (
                          <p
                            className="font-bold text-transparent bg-clip-text"
                            style={{ backgroundImage: "var(--text-gradient-primary)" }}
                          >
                            Hot Rs. {item.hotPrice}
                          </p>
                        )}

                        {item.icedPrice != null && (
                          <p
                            className="font-bold text-transparent bg-clip-text"
                            style={{ backgroundImage: "var(--text-gradient-primary)" }}
                          >
                            Iced Rs. {item.icedPrice}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="w-[35%] flex flex-col items-center pt-2 min-w-0">
                      <div className="aspect-square w-full overflow-hidden rounded-xl bg-amber-100">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            width="300"
                            height="300"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {cartItem ? (
                        <CartQuantityControl cartItem={cartItem} />
                      ) : (
                        <button
                          type="button"
                          aria-label={`Add ${item.name}`}
                          className="relative -mt-5 ml-auto mr-1 sm:mr-2 flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white shadow-md cursor-pointer"
                          style={{ background: "var(--gradient-primary)" }}
                          onClick={() => navigate(`/allfood/${category.id}/${item.id}`)}
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

      <ViewCart />
    </div>
  );
};

export default CategoryItems;