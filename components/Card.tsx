import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'] });

interface CardProps {
  value: number;
  title: string;
  isRevealed: boolean;
  isPlayable: boolean;
  isComputerCard?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (event: MouseEvent | TouchEvent | PointerEvent) => void;
}

const Card: React.FC<CardProps> = ({ 
  value, 
  title, 
  isRevealed, 
  isPlayable, 
  isComputerCard = false,
  onDragStart,
  onDragEnd
}) => {
  return (
    <motion.div
      drag={isPlayable}
      dragMomentum={false}
      dragElastic={0.1}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      whileHover={isPlayable ? { scale: 1.05, y: -5 } : {}}
      whileDrag={{ 
        scale: 1.1,
        cursor: 'grabbing',
        zIndex: 50
      }}
      className={`
        relative w-16 h-24 rounded-lg shrink-0
        ${isPlayable ? 'cursor-grab' : 'cursor-default'}
        transition-all duration-150 ease-out
        select-none
        [-webkit-user-select:none]
        [-moz-user-select:none]
        [-ms-user-select:none]
        [user-select:none]
        [-webkit-user-drag:none]
        [-webkit-tap-highlight-color:transparent]
      `}
      initial={false}
      layout
    >
      <motion.div 
        className={`
          absolute inset-0 rounded-lg p-2
          ${isRevealed 
            ? isComputerCard
              ? 'bg-gradient-to-b from-rose-800/90 to-rose-950/90'
              : 'bg-gradient-to-b from-purple-500/90 to-purple-900/90'
            : 'bg-gradient-to-b from-gray-200 to-gray-300'}
          flex flex-col items-center justify-between
          border border-opacity-30 ${isRevealed ? 'border-[#dcc48d]' : 'border-gray-400'}
          shadow-lg
          select-none
          [-webkit-user-select:none]
          [-moz-user-select:none]
          [-ms-user-select:none]
          [user-select:none]
          [-webkit-user-drag:none]
          [-webkit-tap-highlight-color:transparent]
        `}
        layout
      >
        {isRevealed ? (
          <>
            <div className="text-white text-[8px] font-semibold drop-shadow-lg text-center leading-tight select-none">{title}</div>
            <div className="text-[#dcc48d] text-xl font-bold drop-shadow-lg select-none">{value}</div>
            <div className="text-purple-200 text-[8px] opacity-90 select-none">Power</div>
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center select-none">
            <span className={`${cinzel.className} text-gray-700 text-sm select-none`}>Partition</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Card; 