import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddtocartContexts } from "../AddtocartContext/Addtocartcontext";
import CartQuantityControl from "../Addtocartcomponents/CartQuantityControl.jsx";
import {
  cachedQuery,
  siteCategoriesQuery,
  siteMenuItemsQuery,
} from "../supabas.js";

// Asli cards jaisi hi size, taake data aane par page na hile
const PopularSkeleton = () => (
  <div
    className="w-full flex flex-wrap justify-center gap-5 lg:pt-10 pt-7 animate-pulse"
    aria-busy="true"
    aria-label="Loading popular items"
  >
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="w-[46%] lg:w-[23%] overflow-hidden rounded-2xl bg-white"
      >
        <div className="w-full aspect-square rounded-2xl bg-gray-200" />
        <div className="px-3 pt-3 pb-5">
          <div className="h-5 sm:h-7 w-3/4 rounded bg-gray-200" />
          <div className="mt-3 h-5 sm:h-7 w-1/2 rounded bg-gray-200" />
        </div>
      </div>
    ))}
  </div>
);

const PopularItems = () => {
  const { cart } = useContext(AddtocartContexts);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // "popular" category ke items — CategoryItems wali hi cached queries reuse
  useEffect(() => {
    Promise.all([
      cachedQuery("site-categories", siteCategoriesQuery),
      cachedQuery("site-menu-items", siteMenuItemsQuery),
    ]).then(([c, m]) => {
      if (c.error || m.error) {
        console.error((c.error || m.error).message);
        setLoading(false);
        return;
      }
      const slugByCatId = new Map(
        (c.data || []).map((cat) => [cat.id, cat.slug])
      );
      setItems(
        (m.data || [])
          .filter((i) => slugByCatId.get(i.category_id) === "popular")
          .map((i) => ({
            id: i.id,
            name: i.name,
            hotPrice: i.hot_price,
            icedPrice: i.iced_price,
            image: i.image_url,
          }))
      );
      setLoading(false);
    });
  }, []);

  return (
    <div className="lg:pt-10 pt-7">
      <div className="lg:px-8 px-4 flex flex-col gap-2">
        <h1 className="lg:text-4xl text-2xl font-bold">🔥Popular Items</h1>
        <p className="text-sm lg:text-base">Most ordered right now</p>
      </div>

      {loading ? (
        <PopularSkeleton />
      ) : (
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
                      decoding="async"
                      width="300"
                      height="300"
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
                  <h3 className="text-base sm:text-xl font-bold text-[#202938]">
                    {item.name}
                  </h3>

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
      )}
    </div>
  );
};

export default PopularItems;