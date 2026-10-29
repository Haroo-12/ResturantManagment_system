import React, { createContext, useEffect, useState } from "react";
import { fetchCart } from "../Logic/Addtocart.js";

export const AddtocartContexts = createContext();

const Addtocartcontext = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [count, setcount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(true); // cart database se aa rahi hai

  // App khulte hi cart database se load hoti hai (refresh par bhi cart bani rehti hai)
  useEffect(() => {
    fetchCart()
      .then((items) => {
        setCart(items);
        setcount(items.reduce((sum, c) => sum + c.qty, 0));
      })
      .catch((error) => console.error(error.message))
      .finally(() => setCartLoading(false));
  }, []);

  return (
    <AddtocartContexts.Provider value={{ cart, setCart, count, setcount, cartOpen, setCartOpen, cartLoading }}>
      {children}
    </AddtocartContexts.Provider>
  );
};

export default Addtocartcontext;