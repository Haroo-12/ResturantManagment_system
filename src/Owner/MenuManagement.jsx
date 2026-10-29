import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import PageHeader from "../AdminPagesComponents/PageHeader";
import StatusBadge from "../AdminPagesComponents/StatusBadge";
import Modal from "../AdminPagesComponents/Modal";
import { formatPKR } from "../Arrays/Mockdata";
import { supabase } from "../supabas.js"; // apna sahi path

// Cloudinary ki settings (yahan apni values daalo)
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Image Cloudinary par upload karke uska link wapas deta hai
const uploadImage = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: data,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Image upload nahi hui");
  return json.secure_url;
};

const emptyForm = {
  id: "",
  name: "",
  category_id: "",
  hot_price: "",
  iced_price: "",
  cost: "",
  image_url: "",
  available: true,
};

// Khali box = null (jaise Matcha ka hot price nahi hota)
const toNum = (v) => (v === "" || v == null ? null : Number(v));

// Item ka option DB ki prices se nikalta hai
const optionText = (i) =>
  i.hot_price != null && i.iced_price != null ? "Hot / Iced" : i.hot_price != null ? "Hot only" : "Iced only";

// items / onSave / onDelete ab props se nahi, seedha Supabase se aate hain
export default function MenuManagement() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all"); // category ki id (string)
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null); // nayi chuni hui image
  const [open, setOpen] = useState(false);
  const [removeId, setRemoveId] = useState(null);

  // Page khulte hi categories aur menu_items dono load
  useEffect(() => {
    Promise.all([
      supabase.from("categories").select("id, name").order("id"),
      supabase.from("menu_items").select("*").order("id"),
    ]).then(([c, m]) => {
      if (c.error || m.error) setError((c.error || m.error).message);
      setCategories(c.data || []);
      setItems(m.data || []);
      setLoading(false);
    });
  }, []);

  // Chuni hui image ka preview, warna purani saved image
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : form.image_url),
    [file, form.image_url]
  );
  useEffect(() => {
    return () => {
      if (file && preview) URL.revokeObjectURL(preview);
    };
  }, [file, preview]);

  // category id -> naam
  const categoryName = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery = !term || item.name.toLowerCase().includes(term);
      const matchesCategory = category === "all" || String(item.category_id) === category;
      return matchesQuery && matchesCategory;
    });
  }, [items, query, category]);

  // Add: jo category filter mein select hai wohi form mein pehle se chuni hoti hai
  const openCreate = () => {
    setFile(null);
    setForm({ ...emptyForm, category_id: category === "all" ? categories[0]?.id ?? "" : Number(category) });
    setOpen(true);
  };

  const openEdit = (item) => {
    setFile(null);
    setForm({
      id: item.id,
      name: item.name,
      category_id: item.category_id,
      hot_price: item.hot_price ?? "",
      iced_price: item.iced_price ?? "",
      cost: item.cost ?? "",
      image_url: item.image_url ?? "",
      available: item.is_available,
    });
    setOpen(true);
  };

  // Add + Edit: form.id ho to update (wohi row), warna naya insert. Duplicate nahi banta.
  const submit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.category_id) return;
    if (form.hot_price === "" && form.iced_price === "") {
      return setError("Hot ya Iced mein se ek price zaroori hai");
    }

    setSaving(true);
    setError("");

    // Nayi image chuni ho to pehle Cloudinary par upload, phir uska link
    let imageUrl = form.image_url || null;
    if (file) {
      try {
        imageUrl = await uploadImage(file);
      } catch (err) {
        setSaving(false);
        return setError(err.message);
      }
    }

    const row = {
      name: form.name.trim(),
      category_id: Number(form.category_id),
      hot_price: toNum(form.hot_price),
      iced_price: toNum(form.iced_price),
      cost: toNum(form.cost) ?? 0,
      image_url: imageUrl,
      is_available: form.available,
    };

    const query = form.id
      ? supabase.from("menu_items").update(row).eq("id", form.id)
      : supabase.from("menu_items").insert(row);
    const { data, error } = await query.select().single();

    setSaving(false);
    if (error) return setError(error.message); // admin/login na ho to yahan security ka error aata hai
    setItems((prev) => (form.id ? prev.map((i) => (i.id === data.id ? data : i)) : [...prev, data]));
    setOpen(false);
  };

  const remove = async () => {
    const { error } = await supabase.from("menu_items").delete().eq("id", removeId);
    if (error) setError(error.message);
    else setItems((prev) => prev.filter((i) => i.id !== removeId));
    setRemoveId(null);
  };

  return (
    <section>
      <PageHeader
        title="Menu Management"
        subtitle="Add, edit or hide items for every category."
        actions={
          <button
            type="button"
            onClick={openCreate}
            disabled={!categories.length}
            className="inline-flex items-center gap-2 rounded-xl bg-[#dc2626] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            <Plus size={16} />
            Add item
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search menu items"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#dc2626]"
          />
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={String(item.id)}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-[#dc2626]">{error}</p>}

      {loading || filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-500">
          {loading ? "Loading menu..." : "No menu items match this filter."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Item</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Cost</th>
                  <th className="px-4 py-3 text-left font-semibold">Availability</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            loading="lazy"
                            className="size-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="size-10 rounded-lg bg-slate-100" />
                        )}
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">{optionText(item)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{categoryName[item.category_id]}</td>
                    <td className="px-4 py-3">
                      {[
                        item.hot_price != null && `Hot ${formatPKR(item.hot_price)}`,
                        item.iced_price != null && `Iced ${formatPKR(item.iced_price)}`,
                      ].filter(Boolean).join(" · ")}
                    </td>
                    <td className="px-4 py-3">{formatPKR(item.cost)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.is_available ? "available" : "unavailable"} type="stock" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                          aria-label={`Edit ${item.name}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRemoveId(item.id)}
                          className="rounded-lg border border-red-200 p-2 text-[#dc2626] hover:bg-red-50"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={open}
        title={form.id ? "Edit menu item" : "Add menu item"}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              form="menu-form"
              disabled={saving}
              className="rounded-lg bg-[#dc2626] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        }
      >
        <form id="menu-form" onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2 text-sm">
            Name
            <input
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Category
            <select
              required
              value={form.category_id}
              onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Cost (PKR)
            <input
              type="number"
              min="0"
              value={form.cost}
              onChange={(event) => setForm((prev) => ({ ...prev, cost: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Hot price (PKR)
            <input
              type="number"
              min="0"
              value={form.hot_price}
              onChange={(event) => setForm((prev) => ({ ...prev, hot_price: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Iced price (PKR)
            <input
              type="number"
              min="0"
              value={form.iced_price}
              onChange={(event) => setForm((prev) => ({ ...prev, iced_price: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="sm:col-span-2 text-sm">
            Image
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files[0] || null)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
            />
            {preview && (
              <img src={preview} alt="Preview" className="mt-2 h-24 w-24 rounded-lg object-cover" />
            )}
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(event) => setForm((prev) => ({ ...prev, available: event.target.checked }))}
            />
            Available for sale
          </label>
        </form>
      </Modal>

      <Modal
        open={Boolean(removeId)}
        title="Remove item?"
        onClose={() => setRemoveId(null)}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRemoveId(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">
              Keep
            </button>
            <button type="button" onClick={remove} className="rounded-lg bg-[#dc2626] px-4 py-2 text-sm font-medium text-white">
              Remove
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">This item will be permanently deleted from the menu.</p>
      </Modal>
    </section>
  );
}