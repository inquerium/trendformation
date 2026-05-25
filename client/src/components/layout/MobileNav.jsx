import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Weight, Dumbbell, Salad, Moon } from 'lucide-react';

const ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/weight', icon: Weight, label: 'Weight' },
  { to: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { to: '/nutrition', icon: Salad, label: 'Nutrition' },
  { to: '/sleep', icon: Moon, label: 'Sleep' },
];

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-abyss border-t border-border z-40 flex">
      {ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-sans transition-colors ${
              isActive ? 'text-indigo-light' : 'text-text3'
            }`
          }
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
