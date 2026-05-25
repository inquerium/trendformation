import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { TopBar } from './TopBar.jsx';
import { MobileNav } from './MobileNav.jsx';
import { VoiceModal } from '../ui/VoiceModal.jsx';
import { useUiStore } from '../../store/uiStore.js';

export default function AppLayout() {
  const voiceModalOpen = useUiStore((s) => s.voiceModalOpen);
  const closeVoiceModal = useUiStore((s) => s.closeVoiceModal);

  return (
    <div className="flex h-screen bg-abyss overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <VoiceModal isOpen={voiceModalOpen} onClose={closeVoiceModal} />
    </div>
  );
}
