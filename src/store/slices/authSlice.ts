import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@src/types";
import * as authService from "@src/services/authService";

interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "authenticated" | "error";
  error?: string;
  hasHydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: "idle",
  hasHydrated: false,
};

export const hydrateSession = createAsyncThunk("auth/hydrate", async () => {
  return authService.restoreSession();
});

export const googleSignIn = createAsyncThunk("auth/googleSignIn", async () => {
  return authService.signInWithGoogle();
});

export const signOutUser = createAsyncThunk("auth/signOut", async () => {
  await authService.signOut();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setKycStatus(state, action: PayloadAction<User["kycStatus"]>) {
      if (state.user) state.user.kycStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateSession.fulfilled, (state, action) => {
        state.hasHydrated = true;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.status = "authenticated";
        }
      })
      .addCase(hydrateSession.rejected, (state) => {
        state.hasHydrated = true;
      })
      .addCase(googleSignIn.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(googleSignIn.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message ?? "Sign-in failed. Please try again.";
      })
      .addCase(signOutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = "idle";
      });
  },
});

export const { setKycStatus } = authSlice.actions;
export default authSlice.reducer;
