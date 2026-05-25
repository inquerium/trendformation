import { useAuthStore } from '../store/authStore.js';

export function useAuth() {
  return useAuthStore((s) => ({
    user: s.user,
    isAuthenticated: s.isAuthenticated,
    isLoading: s.isLoading,
    login: s.login,
    logout: s.logout,
    updateUser: s.updateUser,
  }));
}
