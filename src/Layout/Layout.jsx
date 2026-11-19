
import { useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import FloatingCart from "../Addtocartcomponents/FloatingCart";
import CartDrawer from "../Addtocartcomponents/CartDrawer";
import { AddtocartContexts } from "../AddtocartContext/Addtocartcontext";

const Layout = () => {
  const location = useLocation();
const hideCart = location.pathname === "/checkout";
  const { cartOpen, setCartOpen } = useContext(AddtocartContexts);

  return (
    <>
      <Outlet />

      {!hideCart && (
        <FloatingCart onClick={() => setCartOpen(true)} />
      )}

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </>
  );
};

export default Layout;
