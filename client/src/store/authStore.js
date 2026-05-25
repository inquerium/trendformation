import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const base = import.meta.env.VITE_API_URL || '/api';
const plain = axios.create({ baseURL: base, withCredentials: true });

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await plain.post('/auth/login', { email, password });
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await plain.post('/auth/logout');
        } catch (_) {
          // best-effort
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      refreshToken: async () => {
        const { data } = await plain.post('/auth/refresh');
        const token = data.data.accessToken;
        set({ accessToken: token });
        return token;
      },

      updateUser: (partial) => set((state) => ({ user: { ...state.user, ...partial } })),

      setAccessToken: (token) => set({ accessToken: token }),
    }),
    {
      name: 'tf-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
