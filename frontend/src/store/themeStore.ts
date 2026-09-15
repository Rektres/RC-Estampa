import { create } from 'zustand';

export type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = 'rc_theme_mode_v2';

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-bs-theme', saved);
      return saved;
    }
    // Limpiar caché heredada de sesiones previas para garantizar que el nuevo default 'light' tome efecto inmediato
    localStorage.removeItem('rc_theme');
  }
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-bs-theme', 'light');
  }
  return 'light';
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute('data-bs-theme', next);
    }
    set({ theme: next });
  },
  setTheme: (theme: Theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme);
      document.documentElement.setAttribute('data-bs-theme', theme);
    }
    set({ theme });
  },
}));
