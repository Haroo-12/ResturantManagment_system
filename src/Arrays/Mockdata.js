export const TAX_RATE = 0.05;

export function formatPKR(amount) {
  const value = Number(amount) || 0;
  return `PKR ${value.toLocaleString("en-PK")}`;
}

export function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

export function calcOrderTotals(items, discount = 0, taxRate = TAX_RATE) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const safeDiscount = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
  const taxable = subtotal - safeDiscount;
  const tax = Math.round(taxable * taxRate);
  const total = taxable + tax;
  const cost = items.reduce((sum, item) => sum + (item.cost || 0) * item.qty, 0);
  return { subtotal, discount: safeDiscount, tax, total, cost, profit: total - cost };
}

export const menuCategories = [
  { id: "coffees", name: "Coffees" },
  { id: "flavoured-coffees", name: "Flavoured Coffees" },
  { id: "matcha", name: "Matcha" },
  { id: "frappes", name: "Frappes" },
  { id: "smoothies", name: "Smoothies & Protein" },
  { id: "chillers", name: "Chillers & Daiquiris" },
  { id: "v60s", name: "V60s" },
  { id: "ice-teas", name: "Ice Teas" },
];

export const menuItems = [
  { id: "m1", name: "Americano", category: "Coffees", price: 663, cost: 210, available: true, option: "Hot / Iced" },
  { id: "m2", name: "Cappuccino", category: "Coffees", price: 763, cost: 240, available: true, option: "Hot" },
  { id: "m3", name: "Latte", category: "Coffees", price: 763, cost: 245, available: true, option: "Hot / Iced" },
  { id: "m4", name: "Spanish Latte", category: "Flavoured Coffees", price: 863, cost: 290, available: true, option: "Iced" },
  { id: "m5", name: "Hazelnut Mocha", category: "Flavoured Coffees", price: 1063, cost: 360, available: true, option: "Hot / Iced" },
  { id: "m6", name: "Cookies & Cream Latte", category: "Flavoured Coffees", price: 1063, cost: 370, available: true, option: "Iced" },
  { id: "m7", name: "Organic Matcha", category: "Matcha", price: 763, cost: 280, available: true, option: "Iced" },
  { id: "m8", name: "Strawberry Rose Matcha", category: "Matcha", price: 863, cost: 320, available: true, option: "Iced" },
  { id: "m9", name: "Kinder Frappe", category: "Frappes", price: 1163, cost: 410, available: true, option: "Iced" },
  { id: "m10", name: "Lotus Frappe", category: "Frappes", price: 1163, cost: 420, available: false, option: "Iced" },
  { id: "m11", name: "Mango Banana Protein", category: "Smoothies & Protein", price: 1450, cost: 520, available: true, option: "Iced" },
  { id: "m12", name: "Strawberry Smoothie", category: "Smoothies & Protein", price: 863, cost: 300, available: true, option: "Iced" },
  { id: "m13", name: "Peach Daiquiri", category: "Chillers & Daiquiris", price: 663, cost: 190, available: true, option: "Iced" },
  { id: "m14", name: "V60 Original", category: "V60s", price: 863, cost: 250, available: true, option: "Hot / Iced" },
  { id: "m15", name: "Peach Ice Tea", category: "Ice Teas", price: 563, cost: 140, available: true, option: "Iced" },
  { id: "m16", name: "Blackberry Ice Tea", category: "Ice Teas", price: 563, cost: 145, available: true, option: "Iced" },
];

export const orderStatuses = [
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export const paymentMethods = [
  { id: "cash", label: "Cash" },
  { id: "card", label: "Card" },
  { id: "online", label: "Online" },
  { id: "cod", label: "Cash on Delivery" },
];

export const customers = [
  { id: "c1", name: "Ayesha Khan", phone: "0300-1234567", email: "ayesha.khan@email.com", visits: 14, spent: 18420, lastVisit: "21 Oct 2026" },
  { id: "c2", name: "Bilal Ahmed", phone: "0321-1112222", email: "bilal.ahmed@email.com", visits: 9, spent: 11280, lastVisit: "21 Oct 2026" },
  { id: "c3", name: "Sana Malik", phone: "0345-5556666", email: "sana.malik@email.com", visits: 21, spent: 27650, lastVisit: "20 Oct 2026" },
  { id: "c4", name: "Usman Ali", phone: "0312-3334444", email: "usman.ali@email.com", visits: 6, spent: 7340, lastVisit: "21 Oct 2026" },
  { id: "c5", name: "Haroon Qureshi", phone: "0332-4778744", email: "haroon.q@email.com", visits: 11, spent: 15890, lastVisit: "21 Oct 2026" },
  { id: "c6", name: "Walk-in Guest", phone: "—", email: "—", visits: 1, spent: 1526, lastVisit: "21 Oct 2026" },
];

export const orders = [
  {
    id: "ORD-1048",
    source: "website",
    type: "delivery",
    customerId: "c5",
    customerName: "Haroon Qureshi",
    phone: "0332-4778744",
    table: "—",
    status: "pending",
    paymentMethod: "cod",
    paymentStatus: "unpaid",
    createdAt: "21 Oct 2026, 08:42 AM",
    items: [
      { id: "m4", name: "Spanish Latte", qty: 2, price: 863, cost: 290, option: "Iced" },
      { id: "m9", name: "Kinder Frappe", qty: 1, price: 1163, cost: 410, option: "Iced" },
    ],
    discount: 0,
    notes: "Extra ice, please.",
  },
  {
    id: "ORD-1047",
    source: "pos",
    type: "dine-in",
    customerId: "c1",
    customerName: "Ayesha Khan",
    phone: "0300-1234567",
    table: "T-04",
    status: "preparing",
    paymentMethod: "card",
    paymentStatus: "paid",
    createdAt: "21 Oct 2026, 08:28 AM",
    items: [
      { id: "m2", name: "Cappuccino", qty: 1, price: 763, cost: 240, option: "Hot" },
      { id: "m12", name: "Strawberry Smoothie", qty: 1, price: 863, cost: 300, option: "Iced" },
    ],
    discount: 50,
    notes: "",
  },
  {
    id: "ORD-1046",
    source: "pos",
    type: "takeaway",
    customerId: "c2",
    customerName: "Bilal Ahmed",
    phone: "0321-1112222",
    table: "—",
    status: "ready",
    paymentMethod: "cash",
    paymentStatus: "paid",
    createdAt: "21 Oct 2026, 08:10 AM",
    items: [{ id: "m11", name: "Mango Banana Protein", qty: 2, price: 1450, cost: 520, option: "Iced" }],
    discount: 0,
    notes: "No straw.",
  },
  {
    id: "ORD-1045",
    source: "website",
    type: "delivery",
    customerId: "c3",
    customerName: "Sana Malik",
    phone: "0345-5556666",
    table: "—",
    status: "confirmed",
    paymentMethod: "online",
    paymentStatus: "paid",
    createdAt: "21 Oct 2026, 07:55 AM",
    items: [
      { id: "m7", name: "Organic Matcha", qty: 1, price: 763, cost: 280, option: "Iced" },
      { id: "m15", name: "Peach Ice Tea", qty: 2, price: 563, cost: 140, option: "Iced" },
    ],
    discount: 100,
    notes: "Leave at reception.",
  },
  {
    id: "ORD-1044",
    source: "pos",
    type: "walk-in",
    customerId: "c6",
    customerName: "Walk-in Guest",
    phone: "—",
    table: "—",
    status: "completed",
    paymentMethod: "cash",
    paymentStatus: "paid",
    createdAt: "21 Oct 2026, 07:40 AM",
    items: [{ id: "m1", name: "Americano", qty: 2, price: 663, cost: 210, option: "Hot" }],
    discount: 0,
    notes: "",
  },
  {
    id: "ORD-1043",
    source: "website",
    type: "delivery",
    customerId: "c4",
    customerName: "Usman Ali",
    phone: "0312-3334444",
    table: "—",
    status: "cancelled",
    paymentMethod: "cod",
    paymentStatus: "unpaid",
    createdAt: "21 Oct 2026, 07:18 AM",
    items: [{ id: "m10", name: "Lotus Frappe", qty: 1, price: 1163, cost: 420, option: "Iced" }],
    discount: 0,
    notes: "Customer cancelled.",
  },
  {
    id: "ORD-1042",
    source: "pos",
    type: "dine-in",
    customerId: "c5",
    customerName: "Haroon Qureshi",
    phone: "0332-4778744",
    table: "T-02",
    status: "completed",
    paymentMethod: "card",
    paymentStatus: "paid",
    createdAt: "20 Oct 2026, 09:12 PM",
    items: [
      { id: "m5", name: "Hazelnut Mocha", qty: 1, price: 1063, cost: 360, option: "Hot" },
      { id: "m13", name: "Peach Daiquiri", qty: 1, price: 663, cost: 190, option: "Iced" },
    ],
    discount: 0,
    notes: "",
  },
  {
    id: "ORD-1041",
    source: "website",
    type: "delivery",
    customerId: "c1",
    customerName: "Ayesha Khan",
    phone: "0300-1234567",
    table: "—",
    status: "completed",
    paymentMethod: "online",
    paymentStatus: "paid",
    createdAt: "20 Oct 2026, 06:40 PM",
    items: [{ id: "m6", name: "Cookies & Cream Latte", qty: 2, price: 1063, cost: 370, option: "Iced" }],
    discount: 80,
    notes: "",
  },
  {
    id: "ORD-1040",
    source: "pos",
    type: "takeaway",
    customerId: "c2",
    customerName: "Bilal Ahmed",
    phone: "0321-1112222",
    table: "—",
    status: "completed",
    paymentMethod: "cash",
    paymentStatus: "paid",
    createdAt: "20 Oct 2026, 04:05 PM",
    items: [
      { id: "m8", name: "Strawberry Rose Matcha", qty: 1, price: 863, cost: 320, option: "Iced" },
      { id: "m16", name: "Blackberry Ice Tea", qty: 1, price: 563, cost: 145, option: "Iced" },
    ],
    discount: 0,
    notes: "",
  },
  {
    id: "ORD-1039",
    source: "pos",
    type: "dine-in",
    customerId: "c3",
    customerName: "Sana Malik",
    phone: "0345-5556666",
    table: "T-07",
    status: "completed",
    paymentMethod: "card",
    paymentStatus: "paid",
    createdAt: "19 Oct 2026, 08:22 PM",
    items: [
      { id: "m9", name: "Kinder Frappe", qty: 2, price: 1163, cost: 410, option: "Iced" },
      { id: "m14", name: "V60 Original", qty: 1, price: 863, cost: 250, option: "Hot" },
    ],
    discount: 150,
    notes: "Birthday table.",
  },
];

export const enrichedOrders = orders.map((order) => {
  const totals = calcOrderTotals(order.items, order.discount);
  return { ...order, ...totals };
});

export const salesByDay = [
  { label: "Thu", revenue: 41250, profit: 16840, orders: 38 },
  { label: "Fri", revenue: 49820, profit: 20110, orders: 44 },
  { label: "Sat", revenue: 67340, profit: 27480, orders: 61 },
  { label: "Sun", revenue: 72110, profit: 29860, orders: 66 },
  { label: "Mon", revenue: 38420, profit: 15190, orders: 34 },
  { label: "Tue", revenue: 40180, profit: 16220, orders: 36 },
  { label: "Wed", revenue: 35690, profit: 14480, orders: 31 },
];

export const salesByWeek = [
  { label: "W1", revenue: 248600, profit: 99240, orders: 226 },
  { label: "W2", revenue: 271450, profit: 108820, orders: 248 },
  { label: "W3", revenue: 259880, profit: 103150, orders: 237 },
  { label: "W4", revenue: 284210, profit: 114670, orders: 259 },
];

export const salesByMonth = [
  { label: "May", revenue: 892400, profit: 356900, orders: 812 },
  { label: "Jun", revenue: 941220, profit: 378450, orders: 864 },
  { label: "Jul", revenue: 1018450, profit: 409880, orders: 921 },
  { label: "Aug", revenue: 978330, profit: 391200, orders: 889 },
  { label: "Sep", revenue: 1064120, profit: 428760, orders: 964 },
  { label: "Oct", revenue: 764140, profit: 305880, orders: 690 },
];

export const categorySales = [
  { category: "Coffees", revenue: 186400, share: 28 },
  { category: "Flavoured Coffees", revenue: 154220, share: 23 },
  { category: "Frappes", revenue: 121880, share: 18 },
  { category: "Matcha", revenue: 81240, share: 12 },
  { category: "Smoothies & Protein", revenue: 74890, share: 11 },
  { category: "Others", revenue: 55610, share: 8 },
];

export const ownerStats = {
  totalSales: 764140,
  revenue: 764140,
  profit: 305880,
  totalOrders: 690,
  pendingOrders: 3,
  avgTicket: 1107,
};

export const todayStats = {
  sales: 12846,
  orders: 6,
  pending: 3,
  completed: 2,
  cash: 4372,
  card: 3308,
  online: 1789,
  expenses: 1200,
  expectedCash: 3172,
};

export const dailyClosings = [
  {
    id: "CL-1021",
    date: "20 Oct 2026",
    openedBy: "Zara Hussain",
    closedBy: "Zara Hussain",
    orders: 66,
    sales: 72110,
    cash: 28420,
    card: 31250,
    online: 12440,
    expenses: 2100,
    expectedCash: 26320,
    actualCash: 26320,
    difference: 0,
    status: "closed",
    note: "Weekend rush handled smoothly.",
  },
  {
    id: "CL-1020",
    date: "19 Oct 2026",
    openedBy: "Zara Hussain",
    closedBy: "Zara Hussain",
    orders: 61,
    sales: 67340,
    cash: 25180,
    card: 29860,
    online: 12300,
    expenses: 1850,
    expectedCash: 23330,
    actualCash: 23280,
    difference: -50,
    status: "closed",
    note: "PKR 50 till variance.",
  },
  {
    id: "CL-1019",
    date: "18 Oct 2026",
    openedBy: "Ahmed Raza",
    closedBy: "Ahmed Raza",
    orders: 44,
    sales: 49820,
    cash: 19640,
    card: 22110,
    online: 8070,
    expenses: 1400,
    expectedCash: 18240,
    actualCash: 18240,
    difference: 0,
    status: "closed",
    note: "",
  },
  {
    id: "CL-1018",
    date: "17 Oct 2026",
    openedBy: "Zara Hussain",
    closedBy: "Zara Hussain",
    orders: 38,
    sales: 41250,
    cash: 16890,
    card: 17420,
    online: 6940,
    expenses: 900,
    expectedCash: 15990,
    actualCash: 16110,
    difference: 120,
    status: "closed",
    note: "Over by PKR 120.",
  },
  {
    id: "CL-1017",
    date: "16 Oct 2026",
    openedBy: "Ahmed Raza",
    closedBy: "Ahmed Raza",
    orders: 36,
    sales: 40180,
    cash: 15440,
    card: 18120,
    online: 6620,
    expenses: 1100,
    expectedCash: 14340,
    actualCash: 14340,
    difference: 0,
    status: "closed",
    note: "",
  },
];

export const managerAccounts = [
  {
    id: "mgr-1",
    name: "Zara Hussain",
    role: "Branch Manager",
    email: "zara.manager@cafebusiness.pk",
    phone: "0301-5552211",
    branch: "Clifton Flagship",
    shift: "07:00 AM – 04:00 PM",
    status: "active",
    joined: "12 Mar 2025",
  },
  {
    id: "mgr-2",
    name: "Ahmed Raza",
    role: "Evening Manager",
    email: "ahmed.manager@cafebusiness.pk",
    phone: "0322-8899001",
    branch: "Clifton Flagship",
    shift: "03:00 PM – 11:00 PM",
    status: "active",
    joined: "04 Jun 2025",
  },
];

export const ownerProfile = {
  name: "Cafe Business Owner",
  role: "Owner",
  branch: "Clifton Flagship",
};

export const managerProfile = {
  name: "Zara Hussain",
  role: "Manager",
  branch: "Clifton Flagship",
};

export const activityFeed = [
  { id: "a1", text: "POS checkout completed for ORD-1047", time: "08:28 AM" },
  { id: "a2", text: "Website order ORD-1048 received", time: "08:42 AM" },
  { id: "a3", text: "ORD-1046 marked ready for pickup", time: "08:35 AM" },
  { id: "a4", text: "Lotus Frappe marked unavailable", time: "07:50 AM" },
  { id: "a5", text: "Daily closing CL-1021 submitted", time: "Yesterday 11:08 PM" },
];
