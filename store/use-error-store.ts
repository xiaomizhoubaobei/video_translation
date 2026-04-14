import { produce } from "immer";
import { create } from "zustand";

interface ErrorStore {
  _hasHydrated: false;
  errorCode?: string;
}

interface ErrorActions {
  setErrorCode: (value: string) => void;
  clearErrorCode: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useErrorStore = create<ErrorStore & ErrorActions>()((set) => ({
  _hasHydrated: false,
  errorCode: undefined,
  setErrorCode: (value) =>
    set(
      produce((state) => {
        state.errorCode = value;
      }),
    ),

  clearErrorCode: () =>
    set(
      produce((state) => {
        state.errorCode = undefined;
      }),
    ),

  setHasHydrated: (value) =>
    set(
      produce((state) => {
        state._hasHydrated = value;
      }),
    ),
}));
