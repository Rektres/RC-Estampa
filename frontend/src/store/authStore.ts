import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthStore {
  user: User | null;
  access: string | null;
  refresh: string | null;
  isAuthenticated: boolean;
  login: (user: User, access: string, refresh: string) => void;
  setUser: (user: User) => void;
  setAccess: (access: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      access: null,
      refresh: null,
      isAuthenticated: false,
      login: (user, access, refresh) => set({ user, access, refresh, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      setAccess: (access) => set({ access }),
      logout: () => set({ user: null, access: null, refresh: null, isAuthenticated: false }),
    }),
    { name: 'rc-estampa-auth' }
  )
);
