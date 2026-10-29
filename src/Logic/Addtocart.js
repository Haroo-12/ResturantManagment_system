// Ye file Logic/Addtocart.js ki jagah jati hai.
// Cart ka logic ab Supabase mein hai (cart.sql). Function ke naam aur arguments wahi purane hain,
// to QuantityControl aur baaki components ko pata bhi nahi chalega.
import { supabase } from "../supabas.js"; // apna sahi path

// Customer ke liye bina email/password ka anonymous session (har browser ki apni cart)
let pending = null;
const ensureSession = async () => {
  const { data } = await supabase.auth.getSession();
  if (data.session) return;
  if (!pending) {
    pending = supabase.auth.signInAnonymously().finally(() => {
      pending = null;
    });
  }
  const { error } = await pending;
  if (error) throw error;
};

// Database row -> wahi shape jo frontend ka cart pehle use karta tha
const toCartItem = (row) => {
  const m = row.menu_items;
  const isHot = row.option_key === "hot";
  return {
    id: m.id,
    name: m.name,
    image: m.image_url,
    hotPrice: m.hot_price,
    icedPrice: m.iced_price,
    categoryId: m.categories.slug,
    selectedOption: row.option_key,
    optionLabel: isHot ? "Hot" : "Iced",
    price: isHot ? m.hot_price : m.iced_price,
    qty: row.qty,
    note: row.note ?? "",
  };
};

// Cart database se laata hai
export const fetchCart = async () => {
  await ensureSession();
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      "id, qty, note, option_key, menu_items(id, name, image_url, hot_price, iced_price, categories(slug))"
    )
    .order("id");
  if (error) throw error;
  return data.filter((row) => row.menu_items).map(toCartItem);
};

// Database badalne ke baad cart aur count dobara set karta hai
const sync = async (setCart, setcount) => {
  const cart = await fetchCart();
  setCart(cart);
  setcount(cart.reduce((sum, c) => sum + c.qty, 0));
};

const run = async (fn, args, setCart, setcount) => {
  await ensureSession();
  const { error } = await supabase.rpc(fn, args);
  if (error) throw error;
  await sync(setCart, setcount);
};

export const onIncrease = async (item, setCart, setcount) => {
  try {
    await run("cart_increase", { p_item: item.id, p_option: item.selectedOption }, setCart, setcount);
  } catch (error) {
    console.error(error.message);
  }
};

export const onDecrease = async (item, setCart, setcount) => {
  if (item.qty <= 1) return;
  try {
    await run("cart_decrease", { p_item: item.id, p_option: item.selectedOption }, setCart, setcount);
  } catch (error) {
    console.error(error.message);
  }
};

export const onRemove = async (item, setCart, setcount) => {
  try {
    await run("cart_remove", { p_item: item.id, p_option: item.selectedOption }, setCart, setcount);
  } catch (error) {
    console.error(error.message);
  }
};

export const handleAddToCart = async ({
  item,
  categoryId, // ab zaroorat nahi (category item se khud aati hai), purane calls ke liye rakha hai
  current,
  qty,
  note,
  setCart,
  setcount,
  goBack,
}) => {
  try {
    await run(
      "cart_add",
      { p_item: item.id, p_option: String(current.key).toLowerCase(), p_qty: qty, p_note: note || null },
      setCart,
      setcount
    );
    goBack();
  } catch (error) {
    console.error(error.message);
    window.alert("Cart mein add nahi hua: " + error.message);
  }
};