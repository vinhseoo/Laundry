import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: localStorage.getItem('theme') === 'dark',
  toggleDarkMode: () => set((state) => {
    const nextVal = !state.isDarkMode;
    localStorage.setItem('theme', nextVal ? 'dark' : 'light');
    if (nextVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { isDarkMode: nextVal };
  }),
}));
