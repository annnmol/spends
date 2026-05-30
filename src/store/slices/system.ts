import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

//custom import
import productConfig from "@root/src/lib/product";
import { zustandStorage } from "@root/src/store/storage-mmkv";

const STORAGE_KEY = `${productConfig.identifier}-system`;

interface StoreState {
  colorScheme: "light" | "dark" | "system";
  setColorScheme: Dispatch<SetStateAction<"light" | "dark" | "system">>;
}

export const useSystemStore = create(
  persist(
    (set) => ({
      colorScheme: "light" as "light" | "dark" | "system",
      setColorScheme: (
        payload: React.SetStateAction<"light" | "dark" | "system">,
      ) => {
        set((state) => ({
          colorScheme:
            typeof payload === "function"
              ? payload(state.colorScheme)
              : payload,
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state: StoreState) => ({
        colorScheme: state.colorScheme,
      }),
    },
  ),
);

export default useSystemStore;
