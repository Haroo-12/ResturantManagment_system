import React, { useContext, useState } from "react";
import { AddtocartContexts } from "../AddtocartContext/Addtocartcontext";
import QuantityControl from "./QuantityControl.jsx";
import { onIncrease, onDecrease, onRemove } from "../Logic/Addtocart.js";

// Cart mein maujood item ka quantity control (database se jura hua).
// CategoryItems aur PopularItems dono mein sirf ye ek line lagani hai:
//   <CartQuantityControl cartItem={cartItem} />
const CartQuantityControl = ({ cartItem }) => {
  const { setCart, setcount } = useContext(AddtocartContexts);
  const [busy, setBusy] = useState(false);

  const run = async (action) => {
    if (busy) return;
    setBusy(true);
    await action(cartItem, setCart, setcount);
    setBusy(false);
  };

  return (
    <QuantityControl
      count={cartItem.qty}
      disabled={busy}
      onIncrease={() => run(onIncrease)}
      onDecrease={() => run(onDecrease)}
      onRemove={() => run(onRemove)}
    />
  );
};

export default CartQuantityControl;