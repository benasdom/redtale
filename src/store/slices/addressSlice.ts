import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Address } from "@src/types";
import * as addressService from "@src/services/addressService";

interface AddressState {
  items: Address[];
  status: "idle" | "loading" | "loaded" | "error";
}

const initialState: AddressState = {
  items: [],
  status: "idle",
};

export const loadAddresses = createAsyncThunk("address/load", async () => {
  return addressService.fetchAddresses();
});

export const addAddress = createAsyncThunk(
  "address/add",
  async (input: Omit<Address, "id">) => {
    return addressService.saveAddress(input);
  }
);

export const removeAddress = createAsyncThunk("address/remove", async (id: string) => {
  await addressService.deleteAddress(id);
  return id;
});

export const makeDefaultAddress = createAsyncThunk("address/makeDefault", async (id: string) => {
  return addressService.setDefaultAddress(id);
});

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadAddresses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadAddresses.fulfilled, (state, action) => {
        state.status = "loaded";
        state.items = action.payload;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(removeAddress.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload);
      })
      .addCase(makeDefaultAddress.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export default addressSlice.reducer;
