import { supabase } from "../supabas.js";

const pad = (n) => String(n).padStart(2, "0");

/** Local (Pakistan) date as YYYY-MM-DD. toISOString() UTC deta hai, isliye use nahi kiya. */
export function toLocalDateString(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Purane imports ke liye (Owner panel ka useOwnerData.js yeh import karta hai).
 * Aaj ki local date deta hai.
 */
export function getBusinessDate() {
  return toLocalDateString();
}

/** "2026-11-04" -> 4 (date ka din = Day number) */
export const dayFromDate = (dateStr) => Number(String(dateStr).split("-")[2]);

/** Sabse aakhri closing (ya null) */
export async function getLastClosing() {
  const { data, error } = await supabase
    .from("daily_closings")
    .select("*")
    .order("closed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Current business day ke orders = aakhri closing ke baad ke orders.
 * lastClosing pass karo to dobara query nahi hoti.
 */
export async function getOrdersForCurrentBusinessDay(lastClosing) {
  const last = lastClosing === undefined ? await getLastClosing() : lastClosing;

  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (last) query = query.gt("created_at", last.closed_at);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Current business day ki info:
 *  - closed: aakhri closing ke baad koi order nahi aaya
 *  - businessDate: open ho to AAJ ki local date, closed ho to closing ki date
 *  - dayNumber: hamesha businessDate ka din (4 Nov -> Day 4)
 */
export async function getCurrentBusinessDay() {
  const lastClosing = await getLastClosing();
  const orders = await getOrdersForCurrentBusinessDay(lastClosing);

  if (lastClosing && orders.length === 0) {
    return {
      closed: true,
      dayNumber: dayFromDate(lastClosing.business_date),
      businessDate: lastClosing.business_date,
      lastClosing,
      orders: [],
    };
  }

  // Din ki date = jis date par din shuru hua (pehla order), band hone ki date nahi.
  // Agar abhi koi order nahi aaya to aaj ki date.
  let businessDate = toLocalDateString();
  if (orders.length > 0) {
    const firstOrderTime = Math.min(...orders.map((o) => new Date(o.created_at).getTime()));
    businessDate = toLocalDateString(new Date(firstOrderTime));
  }
  return {
    closed: false,
    dayNumber: dayFromDate(businessDate),
    businessDate,
    lastClosing,
    orders,
  };
}

export async function isCurrentBusinessDayClosed() {
  const info = await getCurrentBusinessDay();
  return info.closed;
}

/** Calendar date ke orders (local din ki hadood, UTC nahi) */
export async function getOrdersForBusinessDate(businessDate) {
  const start = new Date(`${businessDate}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function isBusinessDateClosed(businessDate) {
  const { data, error } = await supabase
    .from("daily_closings")
    .select("id")
    .eq("business_date", businessDate)
    .limit(1);
  if (error) throw error;
  return (data || []).length > 0;
}

/**
 * Har order ko uski business date dena (session ki opening date).
 * Session = do closings ke darmiyan ke orders.
 *  - Closed session: closing.business_date (jo Daily Closing History mein dikhti hai)
 *  - Abhi khuli session: uske pehle order ki local date
 * Returns Map(order.id -> "YYYY-MM-DD")
 */
export function mapOrdersToBusinessDates(orders, closings) {
  const sorted = [...(closings || [])]
    .filter((c) => c.closed_at)
    .sort((a, b) => new Date(a.closed_at) - new Date(b.closed_at));
  const closeTimes = sorted.map((c) => new Date(c.closed_at).getTime());

  const result = new Map();
  const openOrders = [];

  for (const order of orders || []) {
    const t = new Date(order.created_at).getTime();
    const idx = closeTimes.findIndex((closeTime) => t <= closeTime);
    if (idx !== -1) {
      result.set(order.id, sorted[idx].business_date);
    } else {
      openOrders.push(order);
    }
  }

  if (openOrders.length > 0) {
    const first = Math.min(...openOrders.map((o) => new Date(o.created_at).getTime()));
    const openDate = toLocalDateString(new Date(first));
    openOrders.forEach((o) => result.set(o.id, openDate));
  }

  return result;
}

export const PROFIT_STATUSES = ["confirmed", "delivered", "completed"];

// menu_items.id -> cost lookup. Purane orders mein order_items.cost_price
// NULL ho to menu_item_id se current cost mil jata hai.
export async function getMenuCosts() {
  const { data, error } = await supabase.from("menu_items").select("id,cost");
  if (error) throw error;
  const map = new Map();
  (data || []).forEach((m) => {
    map.set(String(m.id), m.cost == null ? null : Number(m.cost));
  });
  return map;
}

export function calculateOrderGrossProfit(order, costMap) {
  if (!order || !PROFIT_STATUSES.includes(order.status)) return 0;
  const missing = [];
  const profit = (order.order_items || order.items || []).reduce((sum, item) => {
    const unitPrice = Number(item.unit_price ?? item.price ?? 0);
    const menuCost =
      item.menu_item_id != null ? costMap?.get(String(item.menu_item_id)) : undefined;
    const costPrice = item.cost_price ?? menuCost ?? item.cost;
    const qty = Number(item.qty || 0);
    if (costPrice == null || Number.isNaN(Number(costPrice))) {
      // Cost kahin maujood nahi: guess nahi karte, item ko report karte hain.
      missing.push(
        `${order.id ?? order.localId ?? "?"}/${item.item_name || item.name || item.id || "?"}`
      );
      return sum;
    }
    return sum + (unitPrice - Number(costPrice)) * qty;
  }, 0);
  if (missing.length) {
    console.warn(
      `Gross profit: cost missing for ${missing.length} item(s), excluded:`,
      missing.join(", ")
    );
  }
  return profit;
}

export function calculateGrossProfit(orders, costMap) {
  return (orders || []).reduce(
    (sum, order) => sum + calculateOrderGrossProfit(order, costMap),
    0
  );
}

export function calculateClosingSummary(orders, costMap) {
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => ["delivered", "completed"].includes(o.status)).length;
  const pendingOrders = orders.filter((o) =>
    ["pending", "confirmed", "preparing", "out_for_delivery"].includes(o.status)
  ).length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const sumBy = (list) => list.reduce((sum, o) => sum + Number(o.total || 0), 0);

  const totalSales = sumBy(validOrders);
  const cashSales = sumBy(validOrders.filter((o) => o.payment_method === "cash"));
  const cardSales = sumBy(validOrders.filter((o) => o.payment_method === "card"));
  const onlineSales = sumBy(validOrders.filter((o) => o.payment_method === "online"));

  const totalProfit = calculateGrossProfit(orders, costMap);

  return {
    totalOrders,
    completedOrders,
    pendingOrders,
    cancelledOrders,
    totalSales,
    totalProfit,
    cashSales,
    cardSales,
    onlineSales,
  };
}

/** Closing save karta hai. business_date = aaj, day_number = aaj ka din. */
export async function createDailyClosing(summary, expenses, actualCash, note, closedBy) {
  const info = await getCurrentBusinessDay();
  if (info.closed) throw new Error("This business day is already closed.");

  const expectedCash = summary.cashSales - Number(expenses || 0);
  const difference = Number(actualCash || 0) - expectedCash;

  const { data, error } = await supabase
    .from("daily_closings")
    .insert({
      business_date: info.businessDate,
      day_number: dayFromDate(info.businessDate),
      total_orders: summary.totalOrders,
      completed_orders: summary.completedOrders,
      pending_orders: summary.pendingOrders,
      cancelled_orders: summary.cancelledOrders,
      total_sales: summary.totalSales,
      total_profit: summary.totalProfit,
      cash_sales: summary.cashSales,
      card_sales: summary.cardSales,
      online_sales: summary.onlineSales,
      expenses: Number(expenses || 0),
      expected_cash: expectedCash,
      actual_cash: Number(actualCash || 0),
      difference,
      note: note || null,
      closed_by: closedBy || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Saari closings, nayi pehle */
export async function getDailyClosingsHistory() {
  const { data, error } = await supabase
    .from("daily_closings")
    .select("*")
    .order("closed_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getDailyClosingByDate(businessDate) {
  const { data, error } = await supabase
    .from("daily_closings")
    .select("*")
    .eq("business_date", businessDate)
    .order("closed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}