import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem, ProductOffer } from "@src/types";
import { generateId } from "@src/utils/id";

interface CartState {
  items: CartItem[];
  checkoutOfferId: string | null; // buy-now path bypasses the cart list
}

const initialState: CartState = {
  items: [],
  checkoutOfferId: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<{ offer: ProductOffer; quantity?: number }>) {
      const existing = state.items.find((i) => i.offer.id === action.payload.offer.id);
      if (existing) {
        existing.quantity += action.payload.quantity ?? 1;
      } else {
        state.items.push({
          id: generateId("cart"),
          offer: action.payload.offer,
          quantity: action.payload.quantity ?? 1,
          addedAt: new Date().toISOString(),
        });
      }
    },
    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.quantity = Math.max(1, action.payload.quantity);
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
    setBuyNowOffer(state, action: PayloadAction<ProductOffer | null>) {
      if (action.payload) {
        const existing = state.items.find((i) => i.offer.id === action.payload!.id);
        if (!existing) {
          state.items.push({
            id: generateId("cart"),
            offer: action.payload,
            quantity: 1,
            addedAt: new Date().toISOString(),
          });
        }
        state.checkoutOfferId = action.payload.id;
      } else {
        state.checkoutOfferId = null;
      }
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart, setBuyNowOffer } =
  cartSlice.actions;
export default cartSlice.reducer;
