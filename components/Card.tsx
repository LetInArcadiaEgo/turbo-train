import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CoinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
  </svg>
);

const PowerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
  </svg>
);

interface CardProps {
  value: number;
  cost: number;
  title: string;
  isRevealed: boolean;
  isPlayable: boolean;
  fromColor?: string;
  toColor?: string;
  onDragStart?: () => void;
  onDrag?: (event: any, info: { point: { x: number; y: number } }) => void;
  onDragEnd?: (event: MouseEvent | TouchEvent | PointerEvent) => void;
  canAfford?: boolean;
  isMobile?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  value, 
  cost,
  title, 
  isRevealed, 
  isPlayable,
  fromColor,
  toColor,
  onDragStart,
  onDrag,
  onDragEnd,
  canAfford = true,
  isMobile = false
}) => {
  const [shouldSnapBack, setShouldSnapBack] = useState(false);

  const baseClasses = `
    ${isMobile ? 'w-14 h-20' : 'w-20 h-28'} rounded-2xl
    ${isRevealed 
      ? `bg-gradient-to-br ${fromColor} ${toColor} shadow-lg shadow-black/30`
      : 'bg-gradient-to-br from-gray-700 to-gray-800 shadow-lg shadow-black/30'}
    flex flex-col items-center justify-between ${isMobile ? 'p-2' : 'p-3'}
    border ${isRevealed ? canAfford ? 'border-white/20' : 'border-red-500/50' : 'border-gray-600/30'}
    ${isPlayable ? 'cursor-grab active:cursor-grabbing hover:border-white/40' : 'cursor-default'}
    select-none touch-none
    relative
    transition-colors duration-200
    backdrop-blur-sm
  `;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent) => {
    // Call the parent's onDragEnd first
    onDragEnd?.(event);
    // Set shouldSnapBack to true after a short delay to ensure the card is removed if it was placed in a track
    setTimeout(() => {
      setShouldSnapBack(true);
    }, 50);
  };

  return (
    <motion.div
      drag={isPlayable}
      dragMomentum={false}
      dragSnapToOrigin={shouldSnapBack}
      dragElastic={0.3}
      whileHover={isPlayable ? { scale: 1.05, y: -5 } : {}}
      whileDrag={{ scale: 1.1, zIndex: 9999 }}
      initial={{ zIndex: 50 }}
      onDragStart={() => {
        setShouldSnapBack(false);
        onDragStart?.();
      }}
      onDrag={onDrag}
      onDragEnd={handleDragEnd}
      className={baseClasses}
      style={{
        WebkitTouchCallout: 'none',
        userDrag: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'none',
        position: 'relative'
      } as React.CSSProperties}
    >
      {isRevealed ? (
        <>
          <div className="absolute inset-x-0 top-0 px-2 md:px-3 pt-1 md:pt-2 flex justify-between items-center">
            <div className={`text-xs md:text-sm font-bold ${canAfford ? 'text-white' : 'text-red-400'} transition-colors duration-200 flex items-center gap-1`}>
              <CoinIcon />
              {cost}
            </div>
            <div className="text-xs md:text-sm font-bold text-white flex items-center gap-1">
              <PowerIcon />
              {value}
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 px-2 md:px-3 pb-1 md:pb-2">
            <div className="text-[8px] md:text-[10px] font-medium text-white/80 text-center leading-tight">
              {title}
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-400 text-[10px] md:text-xs">Card</span>
        </div>
      )}
    </motion.div>
  );
};

export default Card;