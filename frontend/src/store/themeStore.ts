import { create } from 'zustand';

export type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('rc_theme') as Theme | null;
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-bs-theme', saved);
      return saved;
    }
  }
  document.documentElement.setAttribute('data-bs-theme', 'dark');
  return 'dark';
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('rc_theme', next);
      document.documentElement.setAttribute('data-bs-theme', next);
    }
    set({ theme: next });
  },
  setTheme: (theme: Theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rc_theme', theme);
      document.documentElement.setAttribute('data-bs-theme', theme);
    }
    set({ theme });
  },
}));
