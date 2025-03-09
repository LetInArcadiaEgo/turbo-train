import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  value: number;
  title: string;
  isRevealed: boolean;
  isPlayable: boolean;
  isComputerCard?: boolean;
  fromColor?: string;
  toColor?: string;
  onDragStart?: () => void;
  onDrag?: (event: any, info: { point: { x: number; y: number } }) => void;
  onDragEnd?: (event: MouseEvent | TouchEvent | PointerEvent) => void;
}

const Card: React.FC<CardProps> = ({ 
  value, 
  title, 
  isRevealed, 
  isPlayable, 
  isComputerCard = false,
  fromColor,
  toColor,
  onDragStart,
  onDrag,
  onDragEnd
}) => {
  return (
    <motion.div
      drag={isPlayable}
      dragMomentum={false}
      dragSnapToOrigin={true}
      whileDrag={{ 
        scale: 1.1,
        zIndex: 100
      }}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      className={`
        w-16 h-24 rounded-lg 
        ${isRevealed 
          ? isComputerCard
            ? 'bg-gradient-to-b from-rose-800/90 to-rose-950/90'
            : `bg-gradient-to-b ${fromColor} ${toColor}`
          : 'bg-gradient-to-b from-gray-200 to-gray-300'}
        flex flex-col items-center justify-between p-2
        border border-opacity-30 ${isRevealed ? 'border-[#dcc48d]' : 'border-gray-400'}
        shadow-lg
        ${isPlayable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
        select-none touch-none
      `}
      style={{
        WebkitTouchCallout: 'none',
        userDrag: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'none'
      } as React.CSSProperties}
    >
      {isRevealed ? (
        <>
          <div className="text-[8px] text-white font-medium text-center leading-tight max-h-8 overflow-hidden w-full px-0.5">
            <span className="line-clamp-2 break-words hyphens-auto">{title}</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {value}
          </div>
          <div className="text-[8px] text-white font-medium opacity-70">
            Power
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-400 text-xs">Card</span>
        </div>
      )}
    </motion.div>
  );
};

export default Card; 