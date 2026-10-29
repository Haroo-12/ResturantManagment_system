import { useMemo, useState } from "react";
import PageHeader from "../AdminPagesComponents/PageHeader";
import StatsCard from "../AdminPagesComponents/StatsCard";
import Modal from "../AdminPagesComponents/Modal";
import { Banknote, CreditCard, Wallet } from "lucide-react";
import { formatPKR, todayStats } from "../Arrays/Mockdata";
import useOrders, { toUiOrder } from "../Logic/useOrders.js";

export default function DailyClosing({ onCloseDay, closed }) {
  const { orders: rows } = useOrders();
  const orders = useMemo(() => rows.map(toUiOrder), [rows]);
  const [expenses, setExpenses] = useState(todayStats.expenses);
  const [actualCash, setActualCash] = useState(todayStats.expectedCash);
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState("");

  const live = useMemo(() => {
    const valid = orders.filter((order) => order.status !== "cancelled");
    const cash = valid.filter((order) => order.paymentMethod === "cash").reduce((sum, order) => sum + order.total, 0);
    const card = valid.filter((order) => order.paymentMethod === "card").reduce((sum, order) => sum + order.total, 0);
    const online = valid
      .filter((order) => ["online", "cod"].includes(order.paymentMethod) && order.paymentStatus === "paid")
      .reduce((sum, order) => sum + order.total, 0);
    const sales = valid.reduce((sum, order) => sum + order.total, 0);
    const expectedCash = Math.max(cash - Number(expenses || 0), 0);
    return { cash, card, online, sales, orders: valid.length, expectedCash };
  }, [orders, expenses]);

  const difference = Number(actualCash || 0) - live.expectedCash;

  const confirm = () => {
    onCloseDay?.({
      expenses: Number(expenses || 0),
      actualCash: Number(actualCash || 0),
      expectedCash: live.expectedCash,
      difference,
      note,
    });
    setConfirmOpen(false);
    setMessage("Day closed in this demo session only. Refreshing the page restores the original state.");
  };

  return (
    <section>
      <PageHeader title="Daily Closing" subtitle="Count the till and close the day for this demo session." />

      {message ? (
        <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard title="Today's sales" value={formatPKR(live.sales || todayStats.sales)} icon={Wallet} />
        <StatsCard title="Cash collected" value={formatPKR(live.cash || todayStats.cash)} icon={Banknote} tone="emerald" />
        <StatsCard title="Card / online" value={formatPKR((live.card || todayStats.card) + (live.online || todayStats.online))} icon={CreditCard} tone="slate" />
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
                disabled={closed}
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
                disabled={closed}
                value={actualCash}
                onChange={(event) => setActualCash(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block">
              Note
              <textarea
                disabled={closed}
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
              <dt className="text-slate-500">Orders</dt>
              <dd>{live.orders}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Expected cash</dt>
              <dd>{formatPKR(live.expectedCash)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Actual cash</dt>
              <dd>{formatPKR(actualCash)}</dd>
            </div>
            <div className={`flex justify-between font-semibold ${difference === 0 ? "text-emerald-700" : "text-[#dc2626]"}`}>
              <dt>Difference</dt>
              <dd>{formatPKR(difference)}</dd>
            </div>
          </dl>
          <button
            type="button"
            disabled={closed}
            onClick={() => setConfirmOpen(true)}
            className="mt-6 w-full rounded-xl bg-[#dc2626] py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {closed ? "Day already closed" : "Close day"}
          </button>
        </article>
      </div>

      <Modal
        open={confirmOpen}
        title="Close the day?"
        onClose={() => setConfirmOpen(false)}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setConfirmOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="button" onClick={confirm} className="rounded-lg bg-[#dc2626] px-4 py-2 text-sm font-medium text-white">
              Confirm close
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Expected cash {formatPKR(live.expectedCash)} versus counted cash {formatPKR(actualCash)}. This confirmation stays in the current UI session only.
        </p>
      </Modal>
    </section>
  );
}
