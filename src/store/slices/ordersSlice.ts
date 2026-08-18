import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Order } from "@src/types";
import * as orderService from "@src/services/orderService";

interface OrdersState {
  items: Order[];
  status: "idle" | "loading" | "loaded" | "error";
  error?: string;
}

const initialState: OrdersState = {
  items: [],
  status: "idle",
};

export const loadOrders = createAsyncThunk("orders/load", async () => {
  return orderService.fetchOrders();
});

export const placeNewOrder = createAsyncThunk(
  "orders/place",
  async (input: orderService.PlaceOrderInput) => {
    return orderService.placeOrder(input);
  }
);

export const advanceOrder = createAsyncThunk("orders/advance", async (orderId: string) => {
  return orderService.advanceOrderStatus(orderId);
});

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadOrders.fulfilled, (state, action) => {
        state.status = "loaded";
        state.items = action.payload;
      })
      .addCase(loadOrders.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message;
      })
      .addCase(placeNewOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(advanceOrder.fulfilled, (state, action) => {
        if (!action.payload) return;
        const idx = state.items.findIndex((o) => o.id === action.payload!.id);
        if (idx >= 0) state.items[idx] = action.payload;
      });
  },
});

export default ordersSlice.reducer;
