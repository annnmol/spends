import { create } from "zustand";

/**
 * In-memory draft state for the multi-step onboarding flow.
 *
 * Intentionally NOT persisted: if the user quits mid-flow (e.g. on step 2),
 * a fresh launch starts onboarding from scratch. Only the *outcome* of
 * onboarding (the user's name + a "finished" flag) is saved, and that lives
 * with the logged-in user in the persisted auth store.
 */
interface StoreState {
  // One field per onboarding step.
  name: string;

  setName: (name: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<StoreState>((set) => ({
  name: "",
  setName: (name) => set({ name }),
  reset: () => set({ name: "" }),
}));

export default useOnboardingStore;
