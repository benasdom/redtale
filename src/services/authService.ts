import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import { User } from "@src/types";
import { USE_MOCKS, mockDelay } from "./apiClient";

// ---------------------------------------------------------------------------
// Google sign-in via Firebase Auth.
//
// Wiring notes for the real integration (kept here so it's a drop-in swap):
//   1. Add the Firebase config from .env to firebaseConfig below and call
//      `initializeApp(firebaseConfig)` once at app start.
//   2. Because this project has no @react-native-google-signin/google-signin
//      or expo-auth-session dependency, the production flow should open the
//      Google OAuth consent screen with `expo-web-browser`'s
//      `openAuthSessionAsync(authUrl, redirectUri)` against your backend's
//      `/auth/google/start` endpoint, which performs the OAuth exchange
//      server-side and redirects back with a short-lived Firebase custom
//      token. The app then calls `signInWithCustomToken` (firebase/auth) to
//      finish sign-in and receives a Firebase ID token to send as the
//      Authorization bearer token on all API requests.
//   3. Until that backend endpoint exists, `signInWithGoogle` below
//      simulates the round trip (including the WebBrowser hand-off) so the
//      rest of the app can be built against a real-shaped async flow.
// ---------------------------------------------------------------------------

const AUTH_STORAGE_KEY = "redtail.auth.user";
const AUTH_TOKEN_KEY = "redtail.auth.token";

export interface AuthResult {
  user: User;
  token: string;
}

const MOCK_USER: User = {
  id: "user_demo_1",
  fullName: "Chris Domfeh",
  email: "chris.domfeh@example.com",
  photoUrl: undefined,
  phone: undefined,
  createdAt: new Date().toISOString(),
  authProvider: "google",
  kycStatus: "unverified",
};

export async function signInWithGoogle(): Promise<AuthResult> {
  if (USE_MOCKS) {
    // Simulate the browser hand-off so navigation/loading states are real,
    // without requiring live OAuth credentials during development.
    try {
      await WebBrowser.warmUpAsync();
    } catch {
      // warmUpAsync is a no-op / unsupported on some platforms (e.g. web)
    }
    const result = await mockDelay({ user: MOCK_USER, token: "mock-token-abc123" }, 900);
    await persistSession(result);
    return result;
  }

  // TODO(backend): replace with real flow described above.
  throw new Error("Live Google sign-in is not wired up yet.");
}

export async function signOut(): Promise<void> {
  await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, AUTH_TOKEN_KEY]);
}

export async function restoreSession(): Promise<AuthResult | null> {
  const [userRaw, token] = await Promise.all([
    AsyncStorage.getItem(AUTH_STORAGE_KEY),
    AsyncStorage.getItem(AUTH_TOKEN_KEY),
  ]);
  if (!userRaw || !token) return null;
  try {
    const user = JSON.parse(userRaw) as User;
    return { user, token };
  } catch {
    return null;
  }
}

async function persistSession(result: AuthResult) {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result.user));
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, result.token);
}

export async function updateKycStatus(status: User["kycStatus"]): Promise<void> {
  const session = await restoreSession();
  if (!session) return;
  const updated = { ...session.user, kycStatus: status };
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
}
