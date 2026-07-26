import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// Initialize theme class immediately on file load
const initialDark = localStorage.getItem('theme') === 'dark';
if (initialDark) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: initialDark,
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
