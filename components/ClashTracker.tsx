import React from 'react';
import { motion } from 'framer-motion';

interface ClashTrackerProps {
  position: number; // -3 to 3, where 0 is center
  isFrozen: boolean;
}

const ClashTracker: React.FC<ClashTrackerProps> = ({ position, isFrozen }) => {
  const getSquareClass = (index: number) => {
    const baseClasses = "w-12 h-12 rounded-2xl border relative backdrop-blur-sm transition-all duration-200";
    
    if (index === 0) return `${baseClasses} border-white/10 bg-black/30`;
    if (index < 0) return `${baseClasses} border-rose-500/20 bg-rose-500/5`;
    return `${baseClasses} border-[#4169E1]/20 bg-[#4169E1]/5`;
  };

  const getMarkerClass = () => {
    const baseClasses = "absolute inset-0 m-auto rounded-xl";
    return isFrozen
      ? `${baseClasses} w-8 h-8 bg-purple-400 border border-purple-300/30`
      : `${baseClasses} w-7 h-7 bg-white`;
  };

  return (
    <div className="w-full max-w-[600px] mx-auto my-2">
      <div className="flex justify-center items-center gap-1">
        {/* Create 7 squares from -3 to 3 */}
        {Array.from({ length: 7 }, (_, i) => i - 3).map((index) => (
          <div
            key={index}
            className={`
              ${getSquareClass(index)}
              ${isFrozen && index === position ? 'border-purple-400/50 bg-purple-400/10' : ''}
            `}
          >
            {/* Show icons at the ends */}
            {(index === -3 || index === 3) && (
              <div className="absolute inset-0 flex items-center justify-center text-white/40">
                {index === -3 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
            {position === index && (
              <motion.div
                layoutId="marker"
                className={getMarkerClass()}
                animate={isFrozen ? {
                  scale: [1, 1.1, 1],
                  opacity: [1, 0.8, 1],
                } : {}}
                transition={isFrozen ? {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClashTracker;
