import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { AddtocartContexts } from "../AddtocartContext/Addtocartcontext";
import { supabase } from "../supabas.js"; // apna sahi path
import Navbor from "../HomeComponents/Navbor.jsx";
import Footer from "./footer.jsx";
import CheckoutForm from "../CheckoutComponent/CheckoutForm.jsx";
import OrderSummary from "../CheckoutComponent/OrderSummary.jsx";
import OrderSuccess from "../CheckoutComponent/OrderSuccess.jsx";

const Checkout = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const { cart, setCart, setcount, cartLoading } = useContext(AddtocartContexts);

  const [form, setForm] = useState({
    title: "Mr.",
    fullName: "",
    mobile: "",
    altMobile: "",
    address: "",
    landmark: "",
    email: "",
    instructions: "",
  });
  const [payment, setPayment] = useState("cod");
  const [promo, setPromo] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [placed, setPlaced] = useState(null); // order ho jaye to { id, total }

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const grandTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const canOrder =
    cart.length > 0 &&
    form.fullName.trim() &&
    form.mobile.replace(/\D/g, "").length >= 10 &&
    form.address.trim();

  // Order database mein save hota hai (total aur items server cart se khud banata hai)
  const handlePlaceOrder = async () => {
    if (placing) return;
    setPlacing(true);
    setOrderError("");

    const { data, error } = await supabase.rpc("place_order", {
      p_title: form.title,
      p_name: form.fullName,
      p_mobile: form.mobile,
      p_landmark: form.landmark,
      p_address: form.address,
      p_instructions: form.instructions,
      p_payment: payment,
    });

    setPlacing(false);
    if (error) return setOrderError(error.message);

    setPlaced({ id: data, total: grandTotal });
    setCart([]);
    setcount(0);
  };

  // Cart database se load ho rahi hai (refresh par "empty" na dikhe)
  if (cartLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 text-sm text-slate-500">
        Loading your cart...
      </div>
    );
  }

  // Order ho gaya
  if (placed) {
    return <OrderSuccess order={placed} onDone={() => navigate("/")} />;
  }

  // Cart khali
  if (cart.length === 0) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 p-4">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-lg">
          <ShoppingBag className="mx-auto size-14 text-gray-300" />
          <p className="mt-3 text-lg font-bold text-slate-800">Your cart is empty</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-5 rounded-full px-6 py-3 font-bold text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            Browse menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-6 sm:py-8">
      <Navbor />
      <div className="mx-auto grid w-full max-w-[1200px] gap-6 lg:grid-cols-[1fr_400px] pt-12">
        <CheckoutForm
          form={form}
          onChange={handleChange}
          payment={payment}
          onPaymentChange={setPayment}
        />
        <OrderSummary
          cart={cart}
          total={grandTotal}
          promo={promo}
          onPromoChange={setPromo}
          canOrder={canOrder}
          placing={placing}
          error={orderError}
          onPlaceOrder={handlePlaceOrder}
          onBack={() => navigate(-1)}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;