import { Bike, Check, Banknote, CreditCard } from "lucide-react";

// Form fields (span 2 = poori width)
const fields = [
  {
    name: "mobile",
    label: "Mobile Number",
    placeholder: "03XX-XXXXXXX",
    required: true,
    type: "tel",
  },
  {
    name: "landmark",
    label: "Nearest Landmark (Optional)",
    placeholder: "e.g. Near Meezan Bank",
  },
  {
    name: "instructions",
    label: "Delivery Instructions (Optional)",
    placeholder: "e.g. Call when you arrive",
    span: 2,
  },
];

const titles = ["Mr.", "Mrs.", "Ms."];

const paymentMethods = [
  { id: "cod", label: "Cash on Delivery", icon: Banknote },
];

const inputClass =
  "w-full h-12 sm:h-14 rounded-2xl border border-gray-200 bg-white px-4 text-sm sm:text-base text-slate-700 outline-none placeholder:text-gray-400 focus:border-[var(--color-primary-600)]";

const Required = () => (
  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-500">
    *Required
  </span>
);

// Reusable field (map ke andar use hota hai)
const Field = ({ f, form, onChange }) => (
  <div className={f.span === 2 ? "sm:col-span-2" : ""}>
    <div className="mb-2 flex items-center justify-between">
      <label className="font-bold text-slate-700">{f.label}</label>
      {f.required && <Required />}
    </div>
    <input
      type={f.type || "text"}
      name={f.name}
      value={form[f.name]}
      onChange={onChange}
      placeholder={f.placeholder}
      className={inputClass}
    />
  </div>
);

// Checkout ka left hissa: customer ki detail aur payment
const CheckoutForm = ({ form, onChange, payment, onPaymentChange }) => (
  <section className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-8 shadow-sm">
    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Checkout</h1>

    {/* Delivery banner */}
    <div className="mt-5 flex items-center gap-4 rounded-2xl border border-gray-100 p-4">
      <span className="grid size-12 sm:size-14 shrink-0 place-items-center rounded-full bg-gray-100">
        <Bike className="size-6 sm:size-7 text-[var(--color-primary-600)]" />
      </span>
      <div>
        <p className="text-base text-slate-500">
          This is a{" "}
          <span
            className="rounded-full px-3 py-2 text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            Delivery Order
          </span>
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Just a last step, please enter your details:
        </p>
      </div>
    </div>

    <hr className="my-6 border-gray-100" />

    <div className="grid gap-5 sm:grid-cols-2">
      {/* Title + Full Name */}
      <div className="sm:col-span-2 grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] gap-3 sm:gap-4">
        <div>
          <label className="mb-2 block font-bold text-slate-700">Title</label>
          <select name="title" value={form.title} onChange={onChange} className={inputClass}>
            {titles.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="font-bold text-slate-700">Full Name</label>
            <Required />
          </div>
          <input
            name="fullName"
            value={form.fullName}
            onChange={onChange}
            placeholder="Full Name"
            className={inputClass}
          />
        </div>
      </div>

      {/* Mobile, Landmark */}
      {fields.slice(0, 2).map((f) => (
        <Field key={f.name} f={f} form={form} onChange={onChange} />
      ))}

      {/* Delivery Address */}
      <div className="sm:col-span-2 rounded-2xl border border-gray-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <label className="font-bold text-slate-700">Delivery Address</label>
          <Required />
        </div>
        <div className="flex overflow-hidden rounded-2xl border border-gray-200">
          <input
            name="address"
            value={form.address}
            onChange={onChange}
            placeholder="Enter your complete address"
            className="h-12 sm:h-14 min-w-0 flex-1 px-4 text-sm sm:text-base outline-none placeholder:text-gray-400"
          />
          <span className="hidden sm:grid place-items-center border-l border-gray-200 bg-gray-50 px-5 text-sm font-bold text-slate-700">
            Abdullah Shah Ghazi
          </span>
        </div>
      </div>

      {/* Instructions */}
      {fields.slice(2).map((f) => (
        <Field key={f.name} f={f} form={form} onChange={onChange} />
      ))}
    </div>

    <hr className="my-6 border-gray-100" />

    {/* Payment */}
    <h2 className="text-lg sm:text-xl font-bold text-slate-700">Payment Information</h2>
    <div className="mt-4 flex flex-wrap gap-4">
      {paymentMethods.map(({ id, label, icon: Icon }) => {
        const active = payment === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onPaymentChange(id)}
            className={`relative grid h-32 w-36 sm:h-36 sm:w-40 place-items-center rounded-2xl border-2 p-3 text-center transition ${
              active
                ? "border-[var(--color-primary-600)] bg-red-50 shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {active && (
              <span
                className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full text-white"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Check className="size-4" strokeWidth={3} />
              </span>
            )}
            <Icon className="size-9 text-[var(--color-primary-600)]" />
            <span className="font-semibold text-slate-800">{label}</span>
          </button>
        );
      })}
    </div>
  </section>
);

export default CheckoutForm;