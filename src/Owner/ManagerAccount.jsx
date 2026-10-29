import { useState } from "react";
import { Pencil, Plus, UserRound } from "lucide-react";
import PageHeader from "../AdminPagesComponents/PageHeader";
import StatusBadge from "../AdminPagesComponents/StatusBadge";
import Modal from "../AdminPagesComponents/Modal";

const emptyForm = {
  id: "",
  name: "",
  role: "Branch Manager",
  email: "",
  phone: "",
  branch: "Clifton Flagship",
  shift: "07:00 AM – 04:00 PM",
  status: "active",
  joined: "21 Oct 2026",
};

export default function ManagerAccount({ managers, onSave }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const submit = (event) => {
    event.preventDefault();
    if (!form.name || !form.email) return;
    onSave({ ...form, id: form.id || `mgr-${Date.now()}` });
    setOpen(false);
  };

  return (
    <section>
      <PageHeader
        title="Manager Account"
        subtitle="Branch manager profiles for this demo. Changes stay in the current session."
        actions={
          <button
            type="button"
            onClick={() => {
              setForm(emptyForm);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#dc2626] px-4 py-2 text-sm font-medium text-white"
          >
            <Plus size={16} />
            Add manager
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {managers.map((manager) => (
          <article key={manager.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#dc2626]">
                  <UserRound size={22} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{manager.name}</h2>
                  <p className="text-sm text-slate-500">{manager.role}</p>
                </div>
              </div>
              <StatusBadge status={manager.status} type="stock" />
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-800">{manager.email}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd className="font-medium text-slate-800">{manager.phone}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Branch</dt>
                <dd className="font-medium text-slate-800">{manager.branch}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Shift</dt>
                <dd className="font-medium text-slate-800">{manager.shift}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => {
                setForm(manager);
                setOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Pencil size={14} />
              Edit
            </button>
          </article>
        ))}
      </div>

      <Modal
        open={open}
        title={form.id ? "Edit manager" : "Add manager"}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" form="manager-form" className="rounded-lg bg-[#dc2626] px-4 py-2 text-sm font-medium text-white">
              Save locally
            </button>
          </div>
        }
      >
        <form id="manager-form" onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            ["name", "Full name"],
            ["role", "Role"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["branch", "Branch"],
            ["shift", "Shift"],
          ].map(([key, label]) => (
            <label key={key} className="text-sm">
              {label}
              <input
                required={key === "name" || key === "email"}
                value={form[key]}
                onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
          ))}
          <label className="text-sm">
            Status
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </form>
      </Modal>
    </section>
  );
}
