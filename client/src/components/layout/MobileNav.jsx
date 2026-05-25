import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Weight, Dumbbell, Salad,
  MoreHorizontal, Moon, Coffee, Flame, GitCompareArrows, Settings, X,
} from 'lucide-react';

const PRIMARY = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/weight', icon: Weight, label: 'Weight' },
  { to: '/workouts', icon: Dumbbell, label: 'Train' },
  { to: '/nutrition', icon: Salad, label: 'Nutrition' },
];

const MORE_ITEMS = [
  { to: '/sleep', icon: Moon, label: 'Sleep' },
  { to: '/caffeine', icon: Coffee, label: 'Caffeine' },
  { to: '/calories', icon: Flame, label: 'Calories' },
  { to: '/compare', icon: GitCompareArrows, label: 'Compare' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();

  function goTo(path) {
    setMoreOpen(false);
    navigate(path);
  }

  return (
    <>
      {/* More drawer overlay */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 bg-void/60 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              className="md:hidden fixed bottom-[56px] inset-x-0 bg-surface2 border-t border-border z-50 rounded-t-2xl p-5"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-text3 uppercase tracking-widest font-display">More</p>
                <button onClick={() => setMoreOpen(false)} className="text-text3 hover:text-text1 p-1">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {MORE_ITEMS.map(({ to, icon: Icon, label }) => (
                  <button
                    key={to}
                    onClick={() => goTo(to)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface3 hover:bg-border active:scale-95 transition-all"
                  >
                    <Icon size={22} className="text-text2" />
                    <span className="text-xs text-text2 font-sans">{label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom nav bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-abyss border-t border-border z-40 flex safe-bottom">
        {PRIMARY.map(({ to, icon: Icon, label }) => (
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
        <button
          onClick={() => setMoreOpen((v) => !v)}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-sans transition-colors ${
            moreOpen ? 'text-indigo-light' : 'text-text3'
          }`}
        >
          <MoreHorizontal size={20} />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
