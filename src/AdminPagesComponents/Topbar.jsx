import { Menu } from "lucide-react";

export default function Topbar({ title, onMenu, userName, role }) {
  const initials = (userName || "U")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">{title}</p>
          <p className="hidden text-xs text-slate-500 sm:block">Local demo data only. Nothing is saved to a server.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">{userName}</p>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dc2626] text-xs font-semibold text-white">
          {initials}
        </span>
      </div>
    </header>
  );
}
