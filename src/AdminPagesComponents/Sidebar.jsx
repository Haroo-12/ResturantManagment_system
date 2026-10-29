import { X } from "lucide-react";

export default function Sidebar({
  brand = "Cafe Business",
  title,
  items,
  activeId,
  onSelect,
  open,
  onClose,
}) {
  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          aria-label="Close sidebar"
          onClick={onClose}
        />
      ) : null}

      <aside
className={`fixed inset-y-0 left-0 z-40 flex w-[20%] max-w-[85vw] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:z-40 lg:max-w-none lg:translate-x-0 ${
  open ? "translate-x-0" : "-translate-x-full"
}`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#dc2626]">{brand}</p>
            <h2 className="mt-0.5 text-lg font-semibold text-slate-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect(item.id);
                  onClose?.();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium ${
                  active
                    ? "bg-[#dc2626] text-white shadow-sm"
                    : "text-slate-600 hover:bg-[var(--color-box)] hover:text-slate-900"
                }`}
              >
                {Icon ? <Icon size={18} /> : null}
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
