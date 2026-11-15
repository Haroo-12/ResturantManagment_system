import { createClient } from "@supabase/supabase-js";

// .env se URL aur key uthata hai
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
window.addEventListener("offline", () => supabase.auth.stopAutoRefresh());
window.addEventListener("online", () => supabase.auth.startAutoRefresh());

// Public pages (TopNavbor, CategoryItems, PopularItems) same categories/menu
// data use karti hain — session mein sirf ek query chalti hai, baaki cached
// promise reuse karti hain. Page refresh par cache dobara fetch hota hai.
const queryCache = new Map();

export function cachedQuery(key, fn) {
  if (!queryCache.has(key)) {
    queryCache.set(key, Promise.resolve().then(fn));
  }
  return queryCache.get(key);
}

// Canonical public-menu queries — teeno components yahi use karti hain
export const siteCategoriesQuery = () =>
  supabase
    .from("categories")
    .select("id, name, slug, banner_url")
    .eq("is_active", true)
    .order("id");

export const siteMenuItemsQuery = () =>
  supabase
    .from("menu_items")
    .select("id, name, hot_price, iced_price, image_url, category_id")
    .eq("is_available", true)
    .order("id");