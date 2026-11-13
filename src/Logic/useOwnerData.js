import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabas.js";
import {
  getBusinessDate,
  getDailyClosingsHistory,
  calculateGrossProfit,
  getMenuCosts,
  mapOrdersToBusinessDates,
  toLocalDateString,
} from "./dailyClosing.js";

const useOwnerData = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    profit: null,
    weeklySales: 0,
    monthlySales: 0,
  });
  const [salesByDay, setSalesByDay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!navigator.onLine) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Get today's business date
      const businessDate = getBusinessDate();

      // Get today's orders
      const { data: todayOrders } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .gte("created_at", `${businessDate}T00:00:00+00:00`)
        .lt("created_at", `${businessDate}T23:59:59+00:00`);

      // Get all orders for total stats (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: allOrders } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      // Get daily closings history (business date ke liye)
      const closings = await getDailyClosingsHistory();

      // Calculate total stats from all orders
      const validOrders = (allOrders || []).filter(o => o.status !== "cancelled");
      const totalSales = validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const totalOrdersCount = (allOrders || []).length;
      const completedOrders = validOrders.filter(o => ["delivered", "completed"].includes(o.status)).length;
      const pendingOrders = validOrders.filter(o => ["pending", "confirmed", "preparing", "out_for_delivery"].includes(o.status)).length;
      const cancelledOrders = (allOrders || []).filter(o => o.status === "cancelled").length;

      // Calculate gross profit using saved cost_price snapshots
      // (cost_price NULL ho to menu_items.cost se fallback)
      const costMap = await getMenuCosts().catch(() => new Map());
      const totalProfit = calculateGrossProfit(allOrders || [], costMap);

      // Calculate weekly sales (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const weeklyOrders = validOrders.filter(o => new Date(o.created_at) >= sevenDaysAgo);
      const weeklySales = weeklyOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

      // Calculate monthly sales (last 30 days)
      const monthlySales = totalSales;

      // Generate sales by day for last 7 days (business date ke hisab se,
      // taake raat 12 ke baad ki sales opening wale din mein count hon)
      const orderBusinessDates = mapOrdersToBusinessDates(allOrders || [], closings);
      const last7Days = [];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = toLocalDateString(date);
        const dayOrders = validOrders.filter(o => orderBusinessDates.get(o.id) === dateStr);
        const daySales = dayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        last7Days.push({
          label: dayNames[date.getDay()],
          revenue: daySales,
          profit: 0, // Can be calculated if cost data is available
          orders: dayOrders.length,
        });
      }

      setStats({
        totalSales,
        totalOrders: totalOrdersCount,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        profit: totalProfit,
        weeklySales,
        monthlySales,
      });

      setSalesByDay(last7Days);
    } catch (err) {
      console.error("Could not load owner data:", err);
      if (navigator.onLine) {
        setError(err.message || "Could not load owner data.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    let channel = null;

    const subscribe = () => {
      if (channel || !navigator.onLine) return;
      channel = supabase
        .channel("owner-dashboard")
       .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          () => {
            load();
          }
        )
        .subscribe();
    };

    const unsubscribe = () => {
      if (!channel) return;
      supabase.removeChannel(channel);
      channel = null;
    };

    const handleOnline = () => {
      subscribe();
      load();
    };

    subscribe();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", unsubscribe);

    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", unsubscribe);
    };
  }, [load]);

  return {
    stats,
    salesByDay,
    loading,
    error,
    refresh: load,
  };
};

export default useOwnerData;