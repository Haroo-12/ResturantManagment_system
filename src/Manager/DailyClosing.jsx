import { useMemo, useState, useEffect, useRef } from "react";
import PageHeader from "../AdminPagesComponents/PageHeader";
import StatsCard from "../AdminPagesComponents/StatsCard";
import Modal from "../AdminPagesComponents/Modal";
import { Banknote, Wallet, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { formatPKR } from "../Arrays/Mockdata";
import useOrders from "../Logic/useOrders.js";
import {
  getCurrentBusinessDay,
  calculateClosingSummary,
  createDailyClosing,
  getDailyClosingsHistory,
  getMenuCosts,
  dayFromDate,
} from "../Logic/dailyClosing.js";

export default function DailyClosing() {
  const { orders: rows, refresh } = useOrders();
  const [expenses, setExpenses] = useState("");
  const [actualCash, setActualCash] = useState("");
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [dayInfo, setDayInfo] = useState(null);
  const [closingsHistory, setClosingsHistory] = useState([]);
  const [selectedClosingId, setSelectedClosingId] = useState(null);
  const [viewMode, setViewMode] = useState("current"); // "current" | "history"
  const [menuCosts, setMenuCosts] = useState(null);
  const firstRun = useRef(true);

  const closed = !!dayInfo?.closed;
  const selectedClosing = closingsHistory.find((c) => c.id === selectedClosingId) || null;
  const locked = closed || viewMode === "history";

  const fillForm = (closing) => {
    setExpenses(closing?.expenses?.toString() || "");
    setActualCash(closing?.actual_cash?.toString() || "");
    setNote(closing?.note || "");
  };

  const loadCurrentBusinessDay = async (resetForm = true) => {
    try {
      const info = await getCurrentBusinessDay();
      setDayInfo(info);
      if (resetForm) fillForm(info.closed ? info.lastClosing : null);
    } catch (err) {
      console.error("Error loading business day:", err);
    }
  };

  const loadClosingsHistory = async () => {
    try {
      setClosingsHistory(await getDailyClosingsHistory());
    } catch (err) {
      console.error("Error loading closings history:", err);
    }
  };

  useEffect(() => {
    loadCurrentBusinessDay(true);
    loadClosingsHistory();
    // cost_price NULL ho to menu_items.cost se profit fallback milta hai
    getMenuCosts()
      .then(setMenuCosts)
      .catch(() => setMenuCosts(new Map()));
  }, []);

  // Naye orders aayen to numbers update hon (typed form data na mitay)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    loadCurrentBusinessDay(false);
  }, [rows]);

  const live = useMemo(() => {
    const record = viewMode === "history" ? selectedClosing : null;

    if (record) {
      return {
        cash: Number(record.cash_sales || 0),
        card: Number(record.card_sales || 0),
        online: Number(record.online_sales || 0),
        sales: Number(record.total_sales || 0),
        profit: Number(record.total_profit || 0),
        orders: record.total_orders || 0,
        completed: record.completed_orders || 0,
        pending: record.pending_orders || 0,
        cancelled: record.cancelled_orders || 0,
        expectedCash: Number(record.expected_cash || 0),
      };
    }

    const s = calculateClosingSummary(dayInfo?.orders || [], menuCosts);
    return {
      cash: s.cashSales,
      card: s.cardSales,
      online: s.onlineSales,
      sales: s.totalSales,
      profit: s.totalProfit || 0,
      orders: s.totalOrders,
      completed: s.completedOrders,
      pending: s.pendingOrders,
      cancelled: s.cancelledOrders,
      expectedCash: s.cashSales - Number(expenses || 0),
    };
  }, [dayInfo, viewMode, selectedClosing, closed, expenses, menuCosts]);

  const difference = Number(actualCash || 0) - live.expectedCash;

  // Day hamesha date ka din hai
  const headerDate = viewMode === "history" ? selectedClosing?.business_date : dayInfo?.businessDate;
  const headerDay = headerDate ? dayFromDate(headerDate) : null;

  const handleCloseDay = async () => {
    try {
      setLoading(true);
      const info = await getCurrentBusinessDay();
      if (info.closed) {
        setMessage("This business day is already closed.");
        setConfirmOpen(false);
        return;
      }

      const summary = calculateClosingSummary(info.orders, menuCosts);
      await createDailyClosing(summary, expenses, actualCash, note, "Manager");

      setConfirmOpen(false);
      setMessage(`Day ${info.dayNumber} (${info.businessDate}) closed successfully. Summary saved to database.`);
      await loadCurrentBusinessDay(true);
      await loadClosingsHistory();
      await refresh();
    } catch (err) {
      console.error("Error closing day:", err);
      setMessage(`Error closing day: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClosing = (id) => {
    const closing = closingsHistory.find((c) => String(c.id) === String(id));
    if (!closing) return;
    setSelectedClosingId(closing.id);
    setViewMode("history");
    fillForm(closing);
  };

  const handleBackToCurrent = () => {
    setViewMode("current");
    setSelectedClosingId(null);
    loadCurrentBusinessDay(true);
  };

  const stepClosing = (direction) => {
    const index = closingsHistory.findIndex((c) => c.id === selectedClosingId);
    const next = closingsHistory[index + direction];
    if (next) handleSelectClosing(next.id);
  };

  return (
    <section>
      <PageHeader
        title="Daily Closing"
        subtitle={
          viewMode === "current"
            ? "Count the till and close the current business day."
            : "View previous business day closing summary."
        }
      />

      {message ? (
        <p
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            message.includes("Error")
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {message}
        </p>
      ) : null}

      {/* Day Selector */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center gap-2">
          {viewMode === "history" && (
            <button
              type="button"
              onClick={handleBackToCurrent}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Back to Current
            </button>
          )}
          <span className="text-sm font-medium text-slate-700">
            {viewMode === "current" ? "Current Business Day" : "Viewing"}
            {headerDay ? `: Day ${headerDay}` : ""}
            {headerDate ? ` (${headerDate})` : ""}
            {viewMode === "current" && closed ? " - closed" : ""}
          </span>
        </div>

        {closingsHistory.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => stepClosing(1)}
              disabled={viewMode === "current"}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <select
              value={selectedClosingId ?? ""}
              onChange={(e) => e.target.value && handleSelectClosing(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm"
            >
              <option value="">Select Business Day</option>
              {closingsHistory.map((closing) => (
                <option key={closing.id} value={closing.id}>
                  Day {dayFromDate(closing.business_date)} - {closing.business_date}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => stepClosing(-1)}
              disabled={viewMode === "current"}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard title="Business day sales" value={formatPKR(live.sales || 0)} icon={Wallet} />
        <StatsCard title="Cash collected" value={formatPKR(live.cash || 0)} icon={Banknote} tone="emerald" />
        <StatsCard title="Gross Profit" value={formatPKR(live.profit || 0)} icon={TrendingUp} tone="emerald" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Till worksheet</h2>
          <div className="mt-4 space-y-3 text-sm">
            <label className="block">
              Expenses (PKR)
              <input
                type="number"
                min="0"
                disabled={locked}
                value={expenses}
                onChange={(event) => setExpenses(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block">
              Actual cash in drawer (PKR)
              <input
                type="number"
                min="0"
                disabled={locked}
                value={actualCash}
                onChange={(event) => setActualCash(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block">
              Note
              <textarea
                disabled={locked}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Total Orders</dt>
              <dd>{live.orders}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Completed</dt>
              <dd>{live.completed || 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Pending</dt>
              <dd>{live.pending || 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Cancelled</dt>
              <dd>{live.cancelled || 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Gross Profit</dt>
              <dd className="font-semibold text-emerald-700">{formatPKR(live.profit || 0)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Expected cash</dt>
              <dd>{formatPKR(live.expectedCash)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Actual cash</dt>
              <dd>{formatPKR(actualCash)}</dd>
            </div>
            <div
              className={`flex justify-between font-semibold ${
                difference === 0 ? "text-emerald-700" : "text-[#dc2626]"
              }`}
            >
              <dt>Difference</dt>
              <dd>{formatPKR(difference)}</dd>
            </div>
          </dl>
          {viewMode === "current" && (
            <button
              type="button"
              disabled={closed || loading}
              onClick={() => setConfirmOpen(true)}
              className="mt-6 w-full rounded-xl bg-[#dc2626] py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              {loading ? "Processing..." : closed ? "Day already closed" : "Close day"}
            </button>
          )}
        </article>
      </div>

      <Modal
        open={confirmOpen}
        title={`Close Day ${dayInfo?.dayNumber ?? ""}?`}
        onClose={() => setConfirmOpen(false)}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCloseDay}
              disabled={loading}
              className="rounded-lg bg-[#dc2626] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              {loading ? "Processing..." : "Confirm close"}
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Expected cash {formatPKR(live.expectedCash)} versus counted cash {formatPKR(actualCash)}. This will save
          the closing summary to the database and start a new business day.
        </p>
      </Modal>
    </section>
  );
}