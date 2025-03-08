import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  value: number;
  title: string;
  isRevealed: boolean;
  isPlayable: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ value, title, isRevealed, isPlayable, onClick }) => {
  return (
    <motion.div
      whileHover={isPlayable ? { scale: 1.05 } : {}}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      className={`
        relative w-32 h-48 rounded-xl cursor-pointer
        ${isPlayable ? 'hover:shadow-lg hover:shadow-purple-300/20' : 'cursor-default'}
        transition-all duration-300 ease-in-out
      `}
      onClick={isPlayable ? onClick : undefined}
    >
      <div 
        className={`
          absolute inset-0 rounded-xl p-4
          ${isRevealed 
            ? 'bg-gradient-to-br from-purple-200 via-purple-600 to-[#9a7b46]' 
            : 'bg-gradient-to-br from-gray-100 to-gray-300'}
          flex flex-col items-center justify-between
          border-2 border-opacity-30 ${isRevealed ? 'border-[#dcc48d]' : 'border-gray-400'}
        `}
      >
        {isRevealed ? (
          <>
            <div className="text-white text-lg font-semibold drop-shadow-lg">{title}</div>
            <div className="text-[#dcc48d] text-4xl font-bold drop-shadow-lg">{value}</div>
            <div className="text-purple-200 text-sm opacity-90">Power</div>
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-gray-700 text-2xl font-serif">MS</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Card; 