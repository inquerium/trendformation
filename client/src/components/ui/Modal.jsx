import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

const sheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
  exit: { y: '100%', transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
};

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.92, y: 16, transition: { duration: 0.18 } },
};

const SIZES = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl' };

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-50 flex ${isMobile ? 'items-end' : 'items-center justify-center p-4'}`}>
          <motion.div
            className="absolute inset-0 bg-void/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`relative bg-surface2 border border-border shadow-2xl w-full z-10 ${
              isMobile
                ? 'rounded-t-2xl border-b-0 p-5 overflow-y-auto'
                : `rounded-2xl p-6 ${SIZES[size] ?? SIZES.md}`
            }`}
            style={isMobile ? { maxHeight: '92dvh' } : undefined}
            variants={isMobile ? sheetVariants : dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {isMobile && (
              <div className="w-10 h-1 bg-border2 rounded-full mx-auto mb-4 shrink-0" />
            )}
            {title && (
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-base font-bold text-text1">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-text3 hover:text-text1 transition-colors p-1 rounded-lg hover:bg-surface3"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
