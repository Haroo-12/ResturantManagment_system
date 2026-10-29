import { useMemo, useState } from "react";
import {
  ClipboardList,
  LayoutDashboard,
  Printer,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import Sidebar from "./AdminPagesComponents/Sidebar";
import Topbar from "./AdminPagesComponents/Topbar";
import Dashboard from "./Manager/Dashboard";
import OrdersManagement from "./Manager/OrdersManagement";
import POS from "./Manager/POS";
import KitchenPrinting from "./Manager/KitchenPrinting";
import Customers from "./Manager/Customers";
import DailyClosing from "./Manager/DailyClosing";
import {
  calcOrderTotals,
  cloneData,
  customers,
  enrichedOrders,
  managerProfile,
  menuItems,
} from "./Arrays/Mockdata";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders Management", icon: ClipboardList },
  { id: "pos", label: "POS", icon: ShoppingCart },
  { id: "kitchen", label: "Kitchen Printing", icon: Printer },
  { id: "customers", label: "Customers", icon: Users },
  { id: "closing", label: "Daily Closing", icon: Wallet },
];

export default function ManagerPanel() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState(() => cloneData(enrichedOrders));
  const [menu] = useState(() => cloneData(menuItems));
  const [people] = useState(() => cloneData(customers));
  const [closed, setClosed] = useState(false);

  const titles = useMemo(
    () => Object.fromEntries(navItems.map((item) => [item.id, item.label])),
    []
  );

  const updateStatus = (id, status) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)));
  };

  const checkout = (ticket) => {
    const totals = calcOrderTotals(ticket.items, ticket.discount);
    setOrders((prev) => {
      if (ticket.existingOrderId) {
        return prev.map((order) =>
          order.id === ticket.existingOrderId
            ? {
                ...order,
                items: ticket.items,
                discount: totals.discount,
                subtotal: totals.subtotal,
                tax: totals.tax,
                total: totals.total,
                cost: totals.cost,
                profit: totals.profit,
              }
            : order
        );
      }
      const maxId = Math.max(...prev.map((order) => Number(String(order.id).replace(/\D/g, "")) || 0), 1000);
      return [
        {
          id: `ORD-${maxId + 1}`,
          source: "pos",
          customerId: "c6",
          paymentStatus: "paid",
          status: "confirmed",
          createdAt: "21 Oct 2026, 09:15 AM",
          notes: "",
          ...ticket,
          ...totals,
        },
        ...prev,
      ];
    });
    setPage("orders");
  };

  return (
<div className="min-h-screen bg-[var(--color-box)] text-slate-900 lg:pl-[20%]">
      <Sidebar
        title="Manager Panel"
        items={navItems}
        activeId={page}
        onSelect={setPage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={titles[page]}
          onMenu={() => setSidebarOpen(true)}
          userName={managerProfile.name}
          role={managerProfile.role}
        />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
          {page === "dashboard" ? (
            <Dashboard orders={orders} onViewOrder={() => setPage("orders")} onNavigate={setPage} />
          ) : null}
          {page === "orders" ? <OrdersManagement orders={orders} onStatusChange={updateStatus} /> : null}
          {page === "pos" ? <POS items={menu} orders={orders} onCheckout={checkout} /> : null}
          {page === "kitchen" ? <KitchenPrinting orders={orders} /> : null}
          {page === "customers" ? <Customers customers={people} orders={orders} /> : null}
          {page === "closing" ? <DailyClosing orders={orders} closed={closed} onCloseDay={() => setClosed(true)} /> : null}
        </main>
      </div>
    </div>
  );
}
