import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

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
          const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
          if (error) throw error;

          const profile = await fetchProfile(data.session.access_token);

          set({
            user: {
              id: data.user.id,
              email: data.user.email,
              name: profile?.name ?? null,
              weightUnit: profile?.weight_unit ?? 'lbs',
            },
            accessToken: data.session.access_token,
            isAuthenticated: true,
            isLoading: false,
          });

          supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'TOKEN_REFRESHED' && session) {
              set({ accessToken: session.access_token });
            }
            if (event === 'SIGNED_OUT') {
              set({ user: null, accessToken: null, isAuthenticated: false });
            }
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        await supabaseClient.auth.signOut();
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      refreshToken: async () => {
        const { data, error } = await supabaseClient.auth.refreshSession();
        if (error) {
          set({ user: null, accessToken: null, isAuthenticated: false });
          throw new Error('Session expired');
        }
        const token = data.session.access_token;
        set({ accessToken: token });
        return token;
      },

      updateUser: (partial) => set((state) => ({ user: { ...state.user, ...partial } })),
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

async function fetchProfile(accessToken) {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  try {
    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await res.json();
    return json.data?.user;
  } catch (_) {
    return null;
  }
}
