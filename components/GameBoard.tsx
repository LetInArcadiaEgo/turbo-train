import React, { useState, useEffect } from 'react';
import Card from './Card';
import ScoreTracker from './ScoreTracker';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import useSound from 'use-sound';

interface GameCard {
  id: number;
  value: number;
  title: string;
}

interface Track {
  playerCards: GameCard[];
  computerCards: GameCard[];
  playerScore: number;
  computerScore: number;
  winner: 'player' | 'computer' | 'tie' | null;
}

const TITLES = [
  'Mountbatten Plan',
  'Radcliffe Line',
  'Direct Action Day',
  'Independence Act',
  'Muslim League',
  'Indian Congress',
  'Refugee Crisis',
  'Princely States',
  'Gandhi\'s Fast',
  'Freedom at Midnight'
];

const GameBoard: React.FC = () => {
  const [playerHand, setPlayerHand] = useState<GameCard[]>([]);
  const [computerHand, setComputerHand] = useState<GameCard[]>([]);
  const [tracks, setTracks] = useState<Track[]>([
    { playerCards: [], computerCards: [], playerScore: 0, computerScore: 0, winner: null },
    { playerCards: [], computerCards: [], playerScore: 0, computerScore: 0, winner: null },
    { playerCards: [], computerCards: [], playerScore: 0, computerScore: 0, winner: null }
  ]);
  const [round, setRound] = useState(1);
  const [gameStatus, setGameStatus] = useState<'playing' | 'computer_turn' | 'round_end' | 'game_over'>('playing');
  const [playWinSound] = useSound('/win.mp3', { volume: 1.0 });

  const calculateTrackScores = (tracks: Track[]): Track[] => {
    return tracks.map(track => {
      const playerScore = track.playerCards.reduce((sum, card) => sum + card.value, 0);
      const computerScore = track.computerCards.reduce((sum, card) => sum + card.value, 0);
      let winner: 'player' | 'computer' | 'tie' | null = null;
      
      if (playerScore > computerScore) winner = 'player';
      else if (computerScore > playerScore) winner = 'computer';
      else if (playerScore === computerScore && playerScore > 0) winner = 'tie';
      
      return {
        ...track,
        playerScore,
        computerScore,
        winner
      };
    });
  };

  const determineGameWinner = (tracks: Track[]): 'player' | 'computer' | 'tie' => {
    const playerWins = tracks.filter(t => t.winner === 'player').length;
    const computerWins = tracks.filter(t => t.winner === 'computer').length;
    
    if (playerWins > computerWins) return 'player';
    if (computerWins > playerWins) return 'computer';
    return 'tie';
  };

  const generateCard = (): GameCard => ({
    id: Math.random(),
    value: Math.floor(Math.random() * 10) + 1,
    title: TITLES[Math.floor(Math.random() * TITLES.length)]
  });

  const initializeGame = () => {
    const initialPlayerHand = Array(5).fill(null).map(generateCard);
    const initialComputerHand = Array(5).fill(null).map(generateCard);
    setPlayerHand(initialPlayerHand);
    setComputerHand(initialComputerHand);
    setTracks([
      { playerCards: [], computerCards: [], playerScore: 0, computerScore: 0, winner: null },
      { playerCards: [], computerCards: [], playerScore: 0, computerScore: 0, winner: null },
      { playerCards: [], computerCards: [], playerScore: 0, computerScore: 0, winner: null }
    ]);
    setRound(1);
    setGameStatus('playing');
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const playCard = (card: GameCard, trackIndex: number) => {
    if (gameStatus !== 'playing') return;
    
    const updatedHand = playerHand.filter(c => c.id !== card.id);
    const updatedTracks = tracks.map((track, index) => {
      if (index === trackIndex) {
        return {
          ...track,
          playerCards: [...track.playerCards, card]
        };
      }
      return track;
    });
    
    setPlayerHand(updatedHand);
    setTracks(updatedTracks);
  };

  const computerPlay = () => {
    const availableTracks = [0, 1, 2];
    const cardsToPlay = Math.min(3, computerHand.length);
    
    const newTracks = [...tracks];
    const cardsToRemove: GameCard[] = [];
    
    for (let i = 0; i < cardsToPlay; i++) {
      const trackIndex = availableTracks[Math.floor(Math.random() * availableTracks.length)];
      const card = computerHand[i];
      cardsToRemove.push(card);
      newTracks[trackIndex].computerCards.push(card);
    }
    
    // Apply all changes at once
    const updatedTracks = calculateTrackScores(newTracks);
    setTracks(updatedTracks);
    setComputerHand(prevHand => prevHand.filter(card => !cardsToRemove.includes(card)));
    
    // Wait for state updates before checking game state
    setTimeout(() => {
      if (round === 5) {
        setGameStatus('game_over');
        const winner = determineGameWinner(updatedTracks);
        if (winner === 'player') {
          playWinSound();
        }
      } else {
        setGameStatus('round_end');
        // Test sound effect after round 1
        if (round === 1) {
          playWinSound();
        }
      }
    }, 1000);
  };

  const confirmRound = () => {
    const updatedTracks = calculateTrackScores(tracks);
    setTracks(updatedTracks);
    setGameStatus('computer_turn');
    computerPlay();
  };

  const nextRound = () => {
    if (round === 5) {
      setGameStatus('game_over');
      return;
    }
    
    setRound(prev => prev + 1);
    
    // Draw one new card for each player
    setPlayerHand(prev => [...prev, generateCard()]);
    setComputerHand(prev => [...prev, generateCard()]);
    setGameStatus('playing');
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-12 px-4">
      {gameStatus === 'game_over' && determineGameWinner(tracks) === 'player' && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          colors={['#e9d5ff', '#fef3c7', '#ffffff']}
          numberOfPieces={200}
        />
      )}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Partition</h1>
          <p className="text-gray-400">Round {round} of 5</p>
        </div>

        <ScoreTracker
          tracks={tracks}
          round={round}
        />

        <div className="mt-8 grid grid-cols-3 gap-8">
          {tracks.map((track, index) => (
            <div key={index} className="bg-[#1a1a1a]/50 p-4 rounded-xl border-2 border-[#dcc48d] border-opacity-20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-purple-200">Track {index + 1}</h3>
                <div className="text-sm">
                  <span className="text-purple-200">{track.playerScore}</span>
                  <span className="text-gray-400 mx-2">vs</span>
                  <span className="text-rose-200">{track.computerScore}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-2">
                  {track.computerCards.map(card => (
                    <Card
                      key={card.id}
                      value={card.value}
                      title={card.title}
                      isRevealed={true}
                      isPlayable={false}
                      isComputerCard={true}
                    />
                  ))}
                </div>
                <div className="border-t-2 border-[#dcc48d] border-opacity-20 my-4" />
                <div className="flex flex-col items-center gap-2">
                  {track.playerCards.map(card => (
                    <Card
                      key={card.id}
                      value={card.value}
                      title={card.title}
                      isRevealed={true}
                      isPlayable={false}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {gameStatus === 'playing' && (
          <div className="text-center mt-8">
            <button
              onClick={confirmRound}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
            >
              Confirm Round
            </button>
          </div>
        )}

        {gameStatus === 'computer_turn' && (
          <div className="text-center mt-8">
            <p className="text-purple-200 text-lg animate-pulse">Computer is playing...</p>
          </div>
        )}

        {gameStatus === 'round_end' && (
          <div className="text-center mt-8">
            <button
              onClick={nextRound}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
            >
              Next Round
            </button>
          </div>
        )}

        {gameStatus === 'game_over' && (
          <div className="text-center mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              {determineGameWinner(tracks) === 'player' ? 'You Won!' : 
               determineGameWinner(tracks) === 'computer' ? 'You Lost!' : 'It\'s a Tie!'}
            </h2>
            <button
              onClick={initializeGame}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
            >
              Play Again
            </button>
          </div>
        )}

        <div className="mt-12">
          <p className="text-gray-400 mb-4 text-center">Your Hand</p>
          <div className="flex justify-center gap-4 flex-wrap">
            {playerHand.map(card => (
              <div key={card.id} className="relative group">
                <Card
                  value={card.value}
                  title={card.title}
                  isRevealed={true}
                  isPlayable={gameStatus === 'playing'}
                />
                {gameStatus === 'playing' && (
                  <div className="absolute -top-2 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-2">
                    {[0, 1, 2].map(trackIndex => (
                      <button
                        key={trackIndex}
                        onClick={() => playCard(card, trackIndex)}
                        className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full hover:bg-purple-700"
                      >
                        {trackIndex + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard; 