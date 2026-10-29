import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabas.js";
import { POS_EVENT } from "./posSync.js";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export const ORDER_STATUS_OPTIONS = ORDER_STATUSES.map((id) => ({
  id,
  label: id.replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase()),
}));

const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    // Offline: keep whatever we already have, no error banner.
    if (!navigator.onLine) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: loadError } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(200);

      if (loadError) throw loadError;

      setOrders(data || []);
      setError("");
    } catch (err) {
      console.error("Could not load orders:", err);
      // If the connection dropped during the request, stay quiet.
      if (navigator.onLine) {
        setError(err.message || "Could not load orders.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    let channel = null;

    // Realtime is only connected while online. Offline, the socket would
    // retry forever and spam the console with WebSocket errors.
    const subscribe = () => {
      if (channel || !navigator.onLine) return;
      channel = supabase
        .channel("orders-management")
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

    // Reload when internet comes back, and after a POS order finishes syncing
    // (its items are inserted after the orders row).
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", unsubscribe);
    window.addEventListener(POS_EVENT, load);

    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", unsubscribe);
      window.removeEventListener(POS_EVENT, load);
    };
  }, [load]);

  // `extra` lets the caller update more columns in the same request
  // (e.g. { payment_status: "paid" }).
  const updateStatus = useCallback(async (id, status, extra = {}) => {
    try {
      setError("");

      const { data, error: updateError } = await supabase
        .from("orders")
        .update({ status, ...extra })
        .eq("id", id)
        .select("id,status,payment_status")
        .single();

      if (updateError) throw updateError;

      if (!data) {
        throw new Error(
          "Order status was not updated. Check your Supabase RLS permissions."
        );
      }

      setOrders((previous) =>
        previous.map((order) =>
          String(order.id) === String(data.id)
            ? {
                ...order,
                status: data.status,
                payment_status: data.payment_status,
              }
            : order
        )
      );

      return true;
    } catch (err) {
      console.error("Order status update failed:", err);
      setError(err.message || "Order status update failed.");
      return false;
    }
  }, []);

  const updatePaymentStatus = useCallback(async (id, paymentStatus) => {
    try {
      setError("");

      const { data, error: updateError } = await supabase
        .from("orders")
        .update({ payment_status: paymentStatus })
        .eq("id", id)
        .select("id,payment_status")
        .single();

      if (updateError) throw updateError;

      setOrders((previous) =>
        previous.map((order) =>
          String(order.id) === String(data.id)
            ? { ...order, payment_status: data.payment_status }
            : order
        )
      );

      return true;
    } catch (err) {
      console.error("Payment status update failed:", err);
      setError(err.message || "Payment status update failed.");
      return false;
    }
  }, []);

  return {
    orders,
    loading,
    error,
    refresh: load,
    updateStatus,
    updatePaymentStatus,
  };
};

export default useOrders;

export const toUiOrder = (row) => {
  const isPosOrder = row.customer_title === "POS";

  return {
    dbId: row.id,
    id: `#${row.id}`,
    customerName: [
      isPosOrder ? "" : row.customer_title,
      row.customer_name || (isPosOrder ? "Guest" : ""),
    ]
      .filter(Boolean)
      .join(" "),
    phone: row.mobile || "",
    address: row.address || "",
    landmark: row.landmark || "",
    instructions: row.instructions || "",
    status: row.status,
    source: isPosOrder ? "pos" : "website",
    paymentStatus:
      row.payment_status || (row.payment_method === "cod" ? "unpaid" : "pending"),
    type: isPosOrder ? "Dine-in" : "Delivery",
    createdAt: row.created_at
      ? new Date(row.created_at).toLocaleString()
      : "",
    paymentMethod: row.payment_method || "",
    items: (row.order_items || []).map((item) => ({
      id: item.id,
      menuItemId: item.menu_item_id,
      name: `${item.item_name || ""}${
        item.option_label ? ` (${item.option_label})` : ""
      }`.trim(),
      qty: Number(item.qty || 0),
      price: Number(item.unit_price || 0),
      note: item.note || "",
    })),
    subtotal: Number(row.total || 0),
    discount: 0,
    tax: 0,
    total: Number(row.total || 0),
  };
};