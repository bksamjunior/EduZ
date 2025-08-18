import { create } from 'zustand';

interface UserState {
  token: string | null;
  role: string | null;
  setToken: (token: string) => void;
  setRole: (role: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  token: localStorage.getItem('token'),
  role: null,
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  setRole: (role) => set({ role }),
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, role: null });
  },
}));
