import React from 'react';
import { motion } from 'framer-motion';

interface ScoreTrackerProps {
  playerScore: number;
  computerScore: number;
  round: number;
}

const ScoreTracker: React.FC<ScoreTrackerProps> = ({
  playerScore,
  computerScore,
  round
}) => {
  const maxScore = Math.max(playerScore, computerScore);
  const getScoreWidth = (score: number) => {
    if (maxScore === 0) return '50%';
    return `${(score / maxScore) * 100}%`;
  };

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg border-2 border-[#dcc48d] border-opacity-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-semibold">Score Tracker</h2>
        <span className="text-purple-200">Round {round}/5</span>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-purple-200 mb-1">
            <span>You</span>
            <span>{playerScore} points</span>
          </div>
          <div className="h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: getScoreWidth(playerScore) }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-purple-400 to-[#dcc48d] rounded-full"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-purple-200 mb-1">
            <span>Opponent</span>
            <span>{computerScore} points</span>
          </div>
          <div className="h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: getScoreWidth(computerScore) }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-purple-600 to-purple-900 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreTracker; 