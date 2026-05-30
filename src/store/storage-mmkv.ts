import { StateStorage } from "zustand/middleware";

// TODO: swap to react-native-mmkv once we run a prebuild / dev client.
// Until then we use an in-memory Map so the app keeps working in Expo Go.
// NOTE: in-memory storage does NOT persist across app restarts.
//
// import { MMKV } from "react-native-mmkv";
// import productConfig from "@root/src/lib/product";
// export const storageMMKV = new MMKV({
//   id: `${productConfig.identifier}-storage`,
//   // encryptionKey: "",
// });

const memoryStore = new Map<string, string>();

export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    memoryStore.set(name, value);
  },
  getItem: (name) => {
    return memoryStore.get(name) ?? null;
  },
  removeItem: (name) => {
    memoryStore.delete(name);
  },
};
