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
  const getTrackColor = (track: Track) => {
    if (track.playerScore > track.computerScore) return 'bg-purple-500';
    if (track.computerScore > track.playerScore) return 'bg-rose-500';
    return 'bg-gray-500';
  };

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 shadow-lg border-2 border-[#dcc48d] border-opacity-20">
      <div className="flex items-center justify-center">
        <div className="flex gap-3">
          {tracks.map((track, index) => (
            <div
              key={index}
              className={`w-16 h-16 rounded-lg ${getTrackColor(track)} flex items-center justify-center transition-colors duration-300`}
            >
              <div className="text-white font-bold">
                {track.playerScore}-{track.computerScore}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreTracker; 