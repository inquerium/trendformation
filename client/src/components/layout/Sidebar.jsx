import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Weight,
  Dumbbell,
  Salad,
  Moon,
  Flame,
  Coffee,
  GitCompareArrows,
  Settings,
} from 'lucide-react';
import { Logo } from '../ui/Logo.jsx';
import { useUiStore } from '../../store/uiStore.js';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/weight', icon: Weight, label: 'Weight' },
  { to: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { to: '/nutrition', icon: Salad, label: 'Nutrition' },
  { to: '/sleep', icon: Moon, label: 'Sleep' },
  { to: '/calories', icon: Flame, label: 'Calories' },
  { to: '/caffeine', icon: Coffee, label: 'Caffeine' },
  { to: '/compare', icon: GitCompareArrows, label: 'Compare' },
];

export function Sidebar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  return (
    <aside
      className={`hidden md:flex flex-col bg-abyss border-r border-border transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-16'}`}
    >
      <div className={`p-4 border-b border-border ${sidebarOpen ? '' : 'flex justify-center'}`}>
        <Logo size={32} showWordmark={sidebarOpen} />
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-sans ${
                isActive
                  ? 'bg-indigo/10 text-indigo-light border-r-2 border-indigo'
                  : 'text-text2 hover:text-text1 hover:bg-surface'
              } ${!sidebarOpen ? 'justify-center' : ''}`
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 pb-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-sans ${
              isActive
                ? 'bg-indigo/10 text-indigo-light'
                : 'text-text2 hover:text-text1 hover:bg-surface'
            } ${!sidebarOpen ? 'justify-center' : ''}`
          }
          title={!sidebarOpen ? 'Settings' : undefined}
        >
          <Settings size={18} className="flex-shrink-0" />
          {sidebarOpen && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
}
