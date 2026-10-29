const orderStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-sky-50 text-sky-700 border-sky-200",
  preparing: "bg-violet-50 text-violet-700 border-violet-200",
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-700 border-slate-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const paymentStyles = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  unpaid: "bg-amber-50 text-amber-700 border-amber-200",
  cash: "bg-slate-100 text-slate-700 border-slate-200",
  card: "bg-indigo-50 text-indigo-700 border-indigo-200",
  online: "bg-sky-50 text-sky-700 border-sky-200",
  cod: "bg-orange-50 text-orange-700 border-orange-200",
};

const closingStyles = {
  closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  open: "bg-amber-50 text-amber-700 border-amber-200",
  variance: "bg-red-50 text-red-700 border-red-200",
};

const stockStyles = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  unavailable: "bg-red-50 text-red-700 border-red-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
};

const maps = {
  order: orderStyles,
  payment: paymentStyles,
  closing: closingStyles,
  stock: stockStyles,
};

function labelize(value) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function StatusBadge({ status, type = "order", className = "" }) {
  const palette = maps[type] || orderStyles;
  const style = palette[status] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${style} ${className}`}
    >
      {labelize(status)}
    </span>
  );
}
