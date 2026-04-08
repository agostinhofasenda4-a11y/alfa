import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SpeakingOrbProps {
  isVisible: boolean;
  text: string;
}

export const SpeakingOrb: React.FC<SpeakingOrbProps> = ({ isVisible, text }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, x: '-50%', opacity: 0, scale: 0.5 }}
          animate={{ y: 0, x: '-50%', opacity: 1, scale: 1 }}
          exit={{ y: 100, x: '-50%', opacity: 0, scale: 0.5 }}
          className="fixed bottom-8 left-1/2 z-50 flex max-w-[90vw] items-center gap-4 rounded-full border-2 border-yellow-400/40 bg-slate-900/80 px-7 py-3.5 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex h-6 items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [6, 20, 6],
                }}
                transition={{
                  duration: 0.6 + i * 0.1,
                  repeat: Infinity,
                  delay: i * 0.07,
                  ease: "easeInOut"
                }}
                className="w-1 rounded-full bg-yellow-400"
              />
            ))}
          </div>
          <span className="truncate text-sm font-extrabold text-white/90 sm:text-base">
            {text.length > 48 ? text.substring(0, 46) + '...' : text}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
