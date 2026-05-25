import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarOpen: true,
  voiceModalOpen: false,
  quickLogOpen: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openVoiceModal: () => set({ voiceModalOpen: true }),
  closeVoiceModal: () => set({ voiceModalOpen: false }),
  openQuickLog: () => set({ quickLogOpen: true }),
  closeQuickLog: () => set({ quickLogOpen: false }),
}));
