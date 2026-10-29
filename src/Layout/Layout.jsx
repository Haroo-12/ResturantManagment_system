
import React, { useContext, lazy, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import FloatingCart from "../Addtocartcomponents/FloatingCart";
import CartDrawer from "../Addtocartcomponents/CartDrawer";
import { AddtocartContexts } from "../AddtocartContext/Addtocartcontext";
import Navbor from "../HomeComponents/Navbor";

const OrderTypeModal = lazy(() => import("../Pages/OrderTypeModal"));

const Layout = () => {
  const location = useLocation();
const hideCart = location.pathname === "/checkout";
  const { cartOpen, setCartOpen } = useContext(AddtocartContexts);


  // const hideCart = location.pathname === "/checkout";

  return (
    <>
      {/* <Navbor /> */}

      <Outlet />

   
        <>
         {!hideCart && (
  <FloatingCart onClick={() => setCartOpen(true)} />
)}

          <CartDrawer
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
          />
        </>
     
{/* 
      <Suspense fallback={null}>
        <OrderTypeModal />
      </Suspense> */}
    </>
  );
};

export default Layout;
