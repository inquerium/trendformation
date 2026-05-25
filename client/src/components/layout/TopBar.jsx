import { Menu, Mic, Bell } from 'lucide-react';
import { useUiStore } from '../../store/uiStore.js';
import { useAuthStore } from '../../store/authStore.js';

export function TopBar() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const openVoiceModal = useUiStore((s) => s.openVoiceModal);
  const user = useAuthStore((s) => s.user);

  return (
    <header className="h-14 border-b border-border bg-abyss flex items-center justify-between px-4 gap-4 flex-shrink-0">
      <button
        onClick={toggleSidebar}
        className="text-text2 hover:text-text1 transition-colors p-1.5 rounded-lg hover:bg-surface hidden md:flex"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button
          onClick={openVoiceModal}
          className="flex items-center gap-2 bg-surface border border-border hover:border-indigo/50 text-text2 hover:text-indigo-light rounded-lg px-3 py-1.5 text-sm transition-all duration-150"
          aria-label="Voice input"
        >
          <Mic size={15} />
          <span className="hidden sm:inline font-sans text-xs">Voice log</span>
        </button>

        <button
          className="text-text2 hover:text-text1 transition-colors p-1.5 rounded-lg hover:bg-surface"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <div className="w-8 h-8 rounded-full bg-indigo-dim flex items-center justify-center text-indigo-light font-display font-bold text-sm flex-shrink-0">
          {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
        </div>
      </div>
    </header>
  );
}
