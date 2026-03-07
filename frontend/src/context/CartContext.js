import { createContext, useContext, useReducer, useEffect } from "react";

// ── Action Types ──────────────────────────────────────────────────────────────
const ACTIONS = {
  ADD_ITEM:    "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  UPDATE_QTY:  "UPDATE_QTY",
  CLEAR_CART:  "CLEAR_CART",
  LOAD_CART:   "LOAD_CART",
};

// ── Reducer ───────────────────────────────────────────────────────────────────
const cartReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_CART:
      return action.payload;

    case ACTIONS.ADD_ITEM: {
      const { product, quantity = 1, color, size } = action.payload;
      const key = `${product._id}-${color || ""}-${size || ""}`;
      const exists = state.find((i) => i.key === key);

      if (exists) {
        // Increase quantity if already in cart
        return state.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...state, { key, product, quantity, color, size }];
    }

    case ACTIONS.REMOVE_ITEM:
      return state.filter((i) => i.key !== action.payload);

    case ACTIONS.UPDATE_QTY:
      return state
        .map((i) =>
          i.key === action.payload.key
            ? { ...i, quantity: Math.max(1, action.payload.quantity) }
            : i
        )
        .filter((i) => i.quantity > 0);

    case ACTIONS.CLEAR_CART:
      return [];

    default:
      return state;
  }
};

// ── Context ───────────────────────────────────────────────────────────────────
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, dispatch] = useReducer(cartReducer, []);

  // ── Load cart from localStorage on mount ─────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (saved) {
        dispatch({ type: ACTIONS.LOAD_CART, payload: JSON.parse(saved) });
      }
    } catch (e) {
      console.error("Failed to load cart from storage", e);
    }
  }, []);

  // ── Persist cart to localStorage on every change ──────────────────────────
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ── Derived values ────────────────────────────────────────────────────────
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);

  // ── Actions ───────────────────────────────────────────────────────────────
  const addToCart    = (product, quantity, color, size) =>
    dispatch({ type: ACTIONS.ADD_ITEM, payload: { product, quantity, color, size } });

  const removeFromCart = (key) =>
    dispatch({ type: ACTIONS.REMOVE_ITEM, payload: key });

  const updateQuantity = (key, quantity) =>
    dispatch({ type: ACTIONS.UPDATE_QTY, payload: { key, quantity } });

  const clearCart = () =>
    dispatch({ type: ACTIONS.CLEAR_CART });

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ── Custom hook for easy consumption ─────────────────────────────────────────
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};

export default CartContext;
