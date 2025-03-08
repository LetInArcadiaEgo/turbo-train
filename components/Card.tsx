import React from 'react';
import { motion } from 'framer-motion';
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'] });

interface CardProps {
  value: number;
  title: string;
  isRevealed: boolean;
  isPlayable: boolean;
  isComputerCard?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ value, title, isRevealed, isPlayable, isComputerCard = false, onClick }) => {
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
            ? isComputerCard
              ? 'bg-gradient-to-b from-rose-800/90 to-rose-950/90'
              : 'bg-gradient-to-b from-purple-500/90 to-purple-900/90'
            : 'bg-gradient-to-b from-gray-200 to-gray-300'}
          flex flex-col items-center justify-between
          border-2 border-opacity-30 ${isRevealed ? 'border-[#dcc48d]' : 'border-gray-400'}
        `}
      >
        {isRevealed ? (
          <>
            <div className="text-white text-lg font-semibold drop-shadow-lg text-center">{title}</div>
            <div className="text-[#dcc48d] text-4xl font-bold drop-shadow-lg">{value}</div>
            <div className="text-purple-200 text-sm opacity-90">Power</div>
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className={`${cinzel.className} text-gray-700 text-xl`}>Partition</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Card; 