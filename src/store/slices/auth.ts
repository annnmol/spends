import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

//custom imports
import productConfig from "@root/src/lib/product";
import { zustandStorage } from "@root/src/store/storage-mmkv";

export const STORAGE_KEY = `${productConfig.identifier}-auth`;

type IAuthUser = {
  id: string;
  email: string;
  name: string;
};

interface StoreState {
  authSession: IAuthUser | null | undefined;
  setAuthSession: (authSession: IAuthUser | null) => void;

  authToken: string | null | undefined;
  setAuthToken: (authToken: string | null) => void;

  setAuthState: (
    authSession: IAuthUser | null,
    authToken: string | null,
  ) => void;

  removeAuthState: () => void;
}

export const useAuthStore = create(
  persist(
    (set) => ({
      authSession: null,
      setAuthSession: async (payload: IAuthUser | null) => {
        set({ authSession: payload });
      },

      authToken: null,
      setAuthToken: async (payload: string | null) => {
        set({ authToken: payload });
      },

      setAuthState: async (
        authSession: IAuthUser | null,
        authToken: string | null,
      ) => {
        set({ authSession, authToken });
      },

      // Clear all data
      removeAuthState: () =>
        set({
          authSession: null,
          authToken: null,
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state: StoreState) => ({
        authSession: state.authSession,
        authToken: state.authToken,
      }),
    },
  ),
);

export default useAuthStore;
