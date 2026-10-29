import { createClient } from "@supabase/supabase-js";

// .env se URL aur key uthata hai
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
window.addEventListener("offline", () => supabase.auth.stopAutoRefresh());
window.addEventListener("online", () => supabase.auth.startAutoRefresh());