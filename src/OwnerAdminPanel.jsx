import { useMemo, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  History,
  LayoutDashboard,
  UserCog,
  UtensilsCrossed,
} from "lucide-react";
import Sidebar from "./AdminPagesComponents/Sidebar";
import Topbar from "./AdminPagesComponents/Topbar";
import Modal from "./AdminPagesComponents/Modal";
import StatusBadge from "./AdminPagesComponents/StatusBadge";
import Dashboard from "./Owner/Dashboard";
import SalesReports from "./Owner/SalesReports";
import AllOrders from "./Owner/AllOrders";
import MenuManagement from "./Owner/MenuManagement";
import DailyClosingHistory from "./Owner/DailyClosingHistory";
import ManagerAccount from "./Owner/ManagerAccount";
import {
  cloneData,
  dailyClosings,
  enrichedOrders,
  formatPKR,
  managerAccounts,
  menuItems,
  ownerProfile,
} from "./Arrays/Mockdata";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "sales", label: "Sales Reports", icon: BarChart3 },
  { id: "orders", label: "All Orders", icon: ClipboardList },
  { id: "menu", label: "Menu Management", icon: UtensilsCrossed },
  { id: "closing", label: "Daily Closing History", icon: History },
  { id: "manager", label: "Manager Account", icon: UserCog },
];

export default function OwnerAdminPanel() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders] = useState(() => cloneData(enrichedOrders));
  const [menu, setMenu] = useState(() => cloneData(menuItems));
  const [closings] = useState(() => cloneData(dailyClosings));
  const [managers, setManagers] = useState(() => cloneData(managerAccounts));
  const [selectedOrder, setSelectedOrder] = useState(null);

  const titles = useMemo(
    () => Object.fromEntries(navItems.map((item) => [item.id, item.label])),
    []
  );

  const saveMenuItem = (item) => {
    setMenu((prev) => {
      const exists = prev.some((row) => row.id === item.id);
      return exists ? prev.map((row) => (row.id === item.id ? item : row)) : [item, ...prev];
    });
  };

  const saveManager = (item) => {
    setManagers((prev) => {
      const exists = prev.some((row) => row.id === item.id);
      return exists ? prev.map((row) => (row.id === item.id ? item : row)) : [item, ...prev];
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-box)] text-slate-900 lg:pl-[20%]">
      <Sidebar
        title="Owner Admin"
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
          userName={ownerProfile.name}
          role={ownerProfile.role}
        />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
          {page === "dashboard" ? <Dashboard orders={orders} onViewOrder={setSelectedOrder} /> : null}
          {page === "sales" ? <SalesReports /> : null}
          {page === "orders" ? <AllOrders orders={orders} /> : null}
          {page === "menu" ? (
            <MenuManagement
              items={menu}
              onSave={saveMenuItem}
              onDelete={(id) => setMenu((prev) => prev.filter((item) => item.id !== id))}
            />
          ) : null}
          {page === "closing" ? <DailyClosingHistory records={closings} /> : null}
          {page === "manager" ? <ManagerAccount managers={managers} onSave={saveManager} /> : null}
        </main>
      </div>

      <Modal open={Boolean(selectedOrder)} title={selectedOrder ? selectedOrder.id : "Order"} onClose={() => setSelectedOrder(null)}>
        {selectedOrder ? (
          <div className="space-y-3 text-sm">
            <StatusBadge status={selectedOrder.status} />
            <p>
              {selectedOrder.customerName} · {selectedOrder.phone}
            </p>
            <p className="font-semibold">{formatPKR(selectedOrder.total)}</p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
