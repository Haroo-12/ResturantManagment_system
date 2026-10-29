export const statuses = [
  { id: "pending", label: "Pending", chip: "bg-amber-100 text-amber-700", solid: "bg-amber-600" },
  { id: "confirmed", label: "Confirmed", chip: "bg-blue-100 text-blue-700", solid: "bg-blue-600" },
  { id: "preparing", label: "Preparing", chip: "bg-purple-100 text-purple-700", solid: "bg-purple-600" },
  { id: "delivered", label: "Delivered", chip: "bg-green-100 text-green-700", solid: "bg-green-600" },
  { id: "cancelled", label: "Cancelled", chip: "bg-red-100 text-red-700", solid: "bg-red-600" },
];

export const paymentLabel = { cod: "Cash on Delivery", online: "Online Payment" };

export const orderTotal = (o) => o.items.reduce((s, i) => s + i.price * i.qty, 0);

// Demo data (baad mein backend se aayega)
export const initialOrders = [
  { id: "ORD-1042", name: "Haroon Qureshi", phone: "03324778744", address: "Clifton Block 7, Karachi", payment: "cod", status: "pending", time: "2 min ago", hour: 21,
    items: [
      { name: "Spanish Latte", category: "Coffees", option: "Iced", qty: 2, price: 863 },
      { name: "Mocha Frappe", category: "Frappes", option: "Iced", qty: 1, price: 963 },
    ] },
  { id: "ORD-1041", name: "Ayesha Khan", phone: "03001234567", address: "DHA Phase 5, Karachi", payment: "online", status: "confirmed", time: "18 min ago", hour: 20,
    items: [{ name: "Cappuccino", category: "Coffees", option: "Hot", qty: 1, price: 763 }] },
  { id: "ORD-1040", name: "Bilal Ahmed", phone: "03211112222", address: "Gulshan-e-Iqbal, Karachi", payment: "cod", status: "preparing", time: "40 min ago", hour: 19,
    items: [{ name: "Mango Smoothie", category: "Smoothies", option: "Iced", qty: 3, price: 863 }] },
  { id: "ORD-1039", name: "Sana Malik", phone: "03455556666", address: "Saddar, Karachi", payment: "cod", status: "delivered", time: "2 hr ago", hour: 17,
    items: [
      { name: "Spanish Latte", category: "Coffees", option: "Hot", qty: 1, price: 763 },
      { name: "Kinder Frappe", category: "Frappes", option: "Iced", qty: 1, price: 1163 },
    ] },
  { id: "ORD-1038", name: "Usman Ali", phone: "03123334444", address: "Clifton, Karachi", payment: "online", status: "cancelled", time: "3 hr ago", hour: 16,
    items: [{ name: "Peach Ice Tea", category: "Ice Teas", option: "Iced", qty: 2, price: 563 }] },
];

// Demo menu (baad mein backend se aayega)
export const initialMenu = [
  { id: 1, name: "Americano", category: "Coffees", hotPrice: 663, icedPrice: 663, available: true },
  { id: 2, name: "Cappuccino", category: "Coffees", hotPrice: 763, icedPrice: null, available: true },
  { id: 3, name: "Spanish Latte", category: "Coffees", hotPrice: 763, icedPrice: 863, available: true },
  { id: 4, name: "Mocha Frappe", category: "Frappes", hotPrice: null, icedPrice: 963, available: true },
  { id: 5, name: "Kinder Frappe", category: "Frappes", hotPrice: null, icedPrice: 1163, available: false },
  { id: 6, name: "Organic Matcha", category: "Matcha", hotPrice: null, icedPrice: 763, available: true },
  { id: 7, name: "Mango Smoothie", category: "Smoothies", hotPrice: null, icedPrice: 863, available: true },
  { id: 8, name: "Peach Ice Tea", category: "Ice Teas", hotPrice: null, icedPrice: 563, available: true },
];