import { create } from "zustand";

interface FeatureState {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}

const useFeatureStore = create<FeatureState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (value) => set({ sidebarOpen: value }),
}));

export default useFeatureStore;
