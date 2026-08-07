import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      isDark: false,

      toggleTheme: () => {
        const newTheme = !get().isDark;

        document.documentElement.classList.toggle("dark", newTheme);

        set({ isDark: newTheme });
      },
    }),
    {
      name: "theme-storage",

      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle(
            "dark",
            state.isDark
          );
        }
      },
    }
  )
);