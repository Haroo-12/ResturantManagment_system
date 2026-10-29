
// import React, { useEffect, useState } from "react";
// import { LocateFixed, ChevronDown } from "lucide-react";

// // Order types
// const orderTypes = [
//   { id: "delivery", label: "Delivery" },
//   { id: "pickup", label: "Pick-Up" },
// ];

// // City -> locations
// const cityData = [

//   {
//     city: "Lahore",
//     locations: ["Gulberg", "DHA Phase 6", "Johar Town"],
//   },

// ];

// const selectClass =
//   "w-full h-11 sm:h-12 appearance-none rounded-2xl border-2 border-gray-200 bg-white px-4 pr-11 text-sm sm:text-base outline-none focus:border-[var(--color-primary-600)]";

// const OrderTypeModal = () => {
//   const [open, setOpen] = useState(true);
//   const [type, setType] = useState("delivery");
//   const [city, setCity] = useState("Lahore");
//   const [location, setLocation] = useState("");

//   const locations =
//     cityData.find((c) => c.city === city)?.locations || [];

//   // Modal open ho to page scroll band
//   useEffect(() => {
//     document.body.style.overflow = open ? "hidden" : "";

//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [open]);

//   const handleCityChange = (e) => {
//     setCity(e.target.value);
//     setLocation("");
//   };

//   const handleSelect = () => {
//     if (!location) return;

//     console.log({ type, city, location });
//     setOpen(false);
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 backdrop-blur-sm p-3">
//       {/* Modal */}
//       <div className="w-full max-w-[500px] max-h-[95dvh] overflow-y-auto rounded-3xl bg-white shadow-2xl">

//         {/* Header + Logo */}
//         <div
//           className="grid place-items-center py-3"
//           style={{ background: "var(--gradient-primary)" }}
//         >
//           <div className="grid size-16 sm:size-20 place-items-center rounded-2xl bg-white shadow-lg">
//             <div
//               className="grid size-14 sm:size-16 place-items-center rounded-full text-center text-white"
//               style={{ background: "var(--gradient-primary)" }}
//             >
//               <div>
//                 <p className="text-sm sm:text-base font-extrabold leading-none">
//                   COSTA
//                 </p>
//                 <p className="mt-0.5 text-[6px] sm:text-[7px] font-semibold tracking-[0.25em]">
//                   COFFEE
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Body */}
//         <div className="px-5 sm:px-7 pt-3 pb-2 text-center">
//           <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">
//             Select Your Order Type
//           </h2>

//           {/* Delivery / Pick-Up */}
//           <div className="mx-auto mt-2 flex w-fit gap-1 rounded-2xl border border-gray-200 bg-gray-100 p-1">
//             {orderTypes.map(({ id, label }) => {
//               const active = type === id;

//               return (
//                 <button
//                   key={id}
//                   type="button"
//                   onClick={() => setType(id)}
//                   style={
//                     active
//                       ? { background: "var(--gradient-primary)" }
//                       : undefined
//                   }
//                   className={`rounded-xl px-6 sm:px-8 py-2 text-sm sm:text-base font-bold transition ${
//                     active
//                       ? "text-white shadow-md"
//                       : "text-gray-500 hover:text-slate-800"
//                   }`}
//                 >
//                   {label}
//                 </button>
//               );
//             })}
//           </div>

//           <p className="mt-2 text-sm text-slate-500">
//             {type === "delivery"
//               ? "Please select your location"
//               : "Please select your outlet"}
//           </p>

//           {/* Use Current Location */}
//           {type === "delivery" && (
//             <button
//               type="button"
//               className="mt-2 inline-flex items-center gap-2 rounded-full border-2 border-red-200 bg-red-50 px-5 py-2 text-sm font-bold text-[var(--color-primary-600)] transition hover:bg-red-100"
//             >
//               <LocateFixed className="size-5" />
//               Use Current Location
//             </button>
//           )}

//           {/* City */}
//           <div className="mt-3 text-left">
//             <label className="mb-1 block text-sm font-bold text-slate-600">
//               Please Select City
//             </label>

//             <div className="relative">
//               <select
//                 value={city}
//                 onChange={handleCityChange}
//                 className={selectClass}
//               >
//                 {cityData.map((c) => (
//                   <option key={c.city} value={c.city}>
//                     {c.city}
//                   </option>
//                 ))}
//               </select>

//               <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
//             </div>
//           </div>

//           {/* Location */}
//           <div className="mt-2 text-left">
//             <label className="mb-1 block text-sm font-bold text-slate-600">
//               Please select your location
//             </label>

//             <div className="relative">
//               <select
//                 value={location}
//                 onChange={(e) => setLocation(e.target.value)}
//                 className={`${selectClass} ${
//                   location ? "text-slate-800" : "text-gray-400"
//                 }`}
//               >
//                 <option value="">Please select your location</option>

//                 {locations.map((loc) => (
//                   <option key={loc} value={loc}>
//                     {loc}
//                   </option>
//                 ))}
//               </select>

//               <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
//             </div>
//           </div>
//         </div>

//         {/* Select Button */}
//         <div className="border-t border-gray-100 px-5 sm:px-7 py-3">
//           <button
//             type="button"
//             disabled={!location}
//             onClick={handleSelect}
//             className="h-11 sm:h-12 w-full rounded-2xl text-base font-bold text-white transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
//             style={{ background: "var(--gradient-primary)" }}
//           >
//             Select
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderTypeModal;
