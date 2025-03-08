import React from 'react';

interface Track {
  playerCards: any[];
  computerCards: any[];
  playerScore: number;
  computerScore: number;
  winner: 'player' | 'computer' | 'tie' | null;
}

interface ScoreTrackerProps {
  tracks: Track[];
  round: number;
}

const ScoreTracker: React.FC<ScoreTrackerProps> = ({
  tracks,
  round
}) => {
  const totalPlayerScore = tracks.reduce((sum, track) => sum + track.playerScore, 0);
  const totalComputerScore = tracks.reduce((sum, track) => sum + track.computerScore, 0);
  const playerWins = tracks.filter(t => t.winner === 'player').length;
  const computerWins = tracks.filter(t => t.winner === 'computer').length;

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg border-2 border-[#dcc48d] border-opacity-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-semibold">Score Tracker</h2>
        <span className="text-purple-200">Round {round}/5</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-pink-400/20 rounded-lg p-4 text-center border-2 border-pink-400/30 shadow-lg backdrop-blur-sm">
          <div className="text-pink-200 text-lg mb-1">You</div>
          <div className="text-3xl font-bold text-white">{totalPlayerScore}</div>
          <div className="text-sm text-pink-200 mt-1">Tracks Won: {playerWins}</div>
        </div>

        <div className="bg-pink-400/20 rounded-lg p-4 text-center border-2 border-pink-400/30 shadow-lg backdrop-blur-sm">
          <div className="text-pink-200 text-lg mb-1">Opponent</div>
          <div className="text-3xl font-bold text-white">{totalComputerScore}</div>
          <div className="text-sm text-pink-200 mt-1">Tracks Won: {computerWins}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {tracks.map((track, index) => (
          <div key={index} className="bg-purple-400/10 rounded-lg p-2 text-center">
            <div className="text-purple-200 text-sm">Track {index + 1}</div>
            <div className="flex justify-center items-center gap-2 text-sm mt-1">
              <span className="text-purple-200">{track.playerScore}</span>
              <span className="text-gray-400">vs</span>
              <span className="text-rose-200">{track.computerScore}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreTracker; 