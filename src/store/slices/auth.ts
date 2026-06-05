import * as Crypto from "expo-crypto";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

//custom imports
import productConfig from "@root/src/lib/product";
import { secureStorage } from "@root/src/store/storage-secure";

export const STORAGE_KEY = `${productConfig.identifier}-auth`;

export type AuthProvider = "google" | "apple";

export type IAuthUser = {
  id: string;
  email: string;
  name: string;
  provider: AuthProvider;
};

interface StoreState {
  /** False until the persisted session has rehydrated from secure storage. */
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  authSession: IAuthUser | null;
  authToken: string | null;

  /** Whether the signed-in user has finished the onboarding flow. Persisted. */
  onboarded: boolean;

  setAuthSession: (authSession: IAuthUser | null) => void;
  setAuthToken: (authToken: string | null) => void;
  setAuthState: (authSession: IAuthUser | null, authToken: string | null) => void;

  /**
   * Mock OAuth sign-in. Replace the body with a real Google/Apple flow
   * (e.g. expo-auth-session / @react-native-google-signin) — the rest of the
   * app only depends on `authSession` + `authToken` being set here.
   */
  signIn: (provider: AuthProvider) => Promise<void>;
  signOut: () => void;
  removeAuthState: () => void;

  /** Persist the onboarding outcome onto the logged-in user. */
  finishOnboarding: (name: string) => void;
  /** Re-arm onboarding (used by the dev "Reset Onboarding" action). */
  resetOnboarding: () => void;
}

const MOCK_PROFILE: Record<AuthProvider, { name: string; email: string }> = {
  google: { name: "Alberto Moedano", email: "alberto@gmail.com" },
  apple: { name: "Alberto Moedano", email: "alberto@privaterelay.appleid.com" },
};

export const useAuthStore = create(
  persist<StoreState>(
    (set) => ({
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      authSession: null,
      authToken: null,
      onboarded: false,

      setAuthSession: (authSession) => set({ authSession }),
      setAuthToken: (authToken) => set({ authToken }),
      setAuthState: (authSession, authToken) => set({ authSession, authToken }),

      signIn: async (provider) => {
        const profile = MOCK_PROFILE[provider];
        const session: IAuthUser = {
          id: Crypto.randomUUID(),
          email: profile.email,
          name: profile.name,
          provider,
        };
        const token = Crypto.randomUUID();
        set({ authSession: session, authToken: token });
      },

      // `onboarded: false` here fully resets onboarding on sign-out, so the
      // next sign-in replays the flow. Flip it to `true` (or drop the key) to
      // keep returning users out of onboarding. This single line is the toggle.
      signOut: () => set({ authSession: null, authToken: null, onboarded: false }),
      removeAuthState: () => set({ authSession: null, authToken: null, onboarded: false }),

      finishOnboarding: (name) =>
        set((state) => ({
          onboarded: true,
          authSession: state.authSession
            ? { ...state.authSession, name }
            : state.authSession,
        })),
      resetOnboarding: () => set({ onboarded: false }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) =>
        ({
          authSession: state.authSession,
          authToken: state.authToken,
          onboarded: state.onboarded,
        }) as StoreState,
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true });
      },
    },
  ),
);

export default useAuthStore;
