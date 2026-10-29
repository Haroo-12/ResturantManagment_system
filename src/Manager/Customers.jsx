
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import PageHeader from "../AdminPagesComponents/PageHeader";
import Modal from "../AdminPagesComponents/Modal";
import StatusBadge from "../AdminPagesComponents/StatusBadge";
import { formatPKR } from "../Arrays/Mockdata";
import useOrders, { toUiOrder } from "../Logic/useOrders.js";

export default function Customers() {
  const { orders: rows, loading, error } = useOrders();
  const orders = useMemo(() => rows.map(toUiOrder), [rows]);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  // Real customers orders se generate honge.
  const customers = useMemo(() => {
    const customerMap = new Map();

    rows.forEach((row) => {
      const name = [row.customer_title, row.customer_name]
        .filter(Boolean)
        .join(" ")
        .trim();

      const phone = String(row.mobile || "").trim();
      const email = String(row.email || "").trim();

      // Name ya phone ke baghair customer ko identify nahi kar sakte.
      if (!name && !phone) return;

      const key = phone || name.toLowerCase();

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          name: name || "Unknown Customer",
          phone: phone || "—",
          email: email || "—",
          visits: 0,
          spent: 0,
          lastVisit: row.created_at,
        });
      }

      const customer = customerMap.get(key);

      customer.visits += 1;

      // Sirf delivered orders ko spent mein count karna.
      if (row.status === "delivered") {
        customer.spent += Number(row.total || 0);
      }

      if (
        row.created_at &&
        (!customer.lastVisit ||
          new Date(row.created_at) > new Date(customer.lastVisit))
      ) {
        customer.lastVisit = row.created_at;
      }

      if (customer.email === "—" && email) {
        customer.email = email;
      }

      if (customer.name === "Unknown Customer" && name) {
        customer.name = name;
      }
    });

    return Array.from(customerMap.values()).map((customer) => ({
      ...customer,
      lastVisit: customer.lastVisit
        ? new Date(customer.lastVisit).toLocaleDateString()
        : "—",
    }));
  }, [rows]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return customers.filter(
      (customer) =>
        !term ||
        customer.name.toLowerCase().includes(term) ||
        customer.phone.toLowerCase().includes(term)
    );
  }, [customers, query]);

  const history = useMemo(() => {
    if (!selected) return [];

    return orders.filter((order) => {
      const row = rows.find(
        (item) => String(item.id) === String(order.dbId)
      );

      const phone = String(row?.mobile || "").trim();
      const name = [row?.customer_title, row?.customer_name]
        .filter(Boolean)
        .join(" ")
        .trim();

      return (
        (selected.phone !== "—" &&
          phone === selected.phone) ||
        (selected.phone === "—" &&
          name.toLowerCase() === selected.name.toLowerCase())
      );
    });
  }, [selected, orders, rows]);

  return (
    <section>
      <PageHeader
        title="Customers"
        subtitle="Real customers, contact details and order history."
      />

      <label className="relative mb-4 block">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or phone"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#dc2626]"
        />
      </label>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          Loading customers...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center text-sm text-red-600">
          Failed to load customers: {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-500">
          No customers found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[680px] w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold">Visits</th>
                  <th className="px-4 py-3 text-left font-semibold">Spent</th>
                  <th className="px-4 py-3 text-left font-semibold">Last visit</th>
                  <th className="px-4 py-3 text-right font-semibold">History</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {customer.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {customer.email}
                      </p>
                    </td>

                    <td className="px-4 py-3">{customer.phone}</td>
                    <td className="px-4 py-3">{customer.visits}</td>
                    <td className="px-4 py-3">
                      {formatPKR(customer.spent)}
                    </td>
                    <td className="px-4 py-3">{customer.lastVisit}</td>

                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(customer)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        title={selected ? selected.name : "Customer"}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <p>
              {selected.phone} · {selected.email}
            </p>

            {history.length === 0 ? (
              <p className="rounded-xl bg-[var(--color-box)] px-3 py-6 text-center text-slate-500">
                No orders found for this customer.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {history.map((order) => (
                  <li
                    key={order.dbId ?? order.id}
                    className="flex items-center justify-between gap-3 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-xs text-slate-500">
                        {order.createdAt}
                      </p>
                    </div>

                    <div className="text-right">
                      <StatusBadge status={order.status} />
                      <p className="mt-1 font-medium">
                        {formatPKR(order.total)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}
