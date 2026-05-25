import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true, // true until initialize() resolves

      // Called once on app mount — recovers an existing Supabase session.
      initialize: async () => {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
          const profile = await fetchProfile(session.access_token);
          set({
            user: buildUser(session.user, profile),
            accessToken: session.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
          if (error) throw error;
          const profile = await fetchProfile(data.session.access_token);
          set({
            user: buildUser(data.user, profile),
            accessToken: data.session.access_token,
            isAuthenticated: true,
            isLoading: false,
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
      // isLoading is intentionally excluded — always recomputed on mount.
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Module-level listener — fires on token refresh and sign-out regardless of
// how the session changed (another tab, Supabase background refresh, etc.).
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED' && session) {
    useAuthStore.setState({ accessToken: session.access_token });
  }
  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
  }
});

function buildUser(authUser, profile) {
  return {
    id: authUser.id,
    email: authUser.email,
    name: profile?.name ?? null,
    weightUnit: profile?.weight_unit ?? 'lbs',
  };
}

async function fetchProfile(accessToken) {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await res.json();
    return json.data?.user ?? null;
  } catch (_) {
    return null;
  }
}
