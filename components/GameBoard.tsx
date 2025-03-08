import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
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

interface DragEvent {
  clientX: number;
  clientY: number;
}

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
  const boardRef = useRef<HTMLDivElement>(null);
  const [activeZone, setActiveZone] = useState<number | null>(null);
  const [draggedCard, setDraggedCard] = useState<GameCard | null>(null);

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
    
    // Play computer's turn and then automatically progress to next round
    computerPlay();
    
    // After computer plays, automatically set up next round
    setTimeout(() => {
      if (round === 5) {
        setGameStatus('game_over');
        const winner = determineGameWinner(updatedTracks);
        if (winner === 'player') {
          playWinSound();
        }
      } else {
        setRound(prev => prev + 1);
        setPlayerHand(prev => [...prev, generateCard()]);
        setComputerHand(prev => [...prev, generateCard()]);
        setGameStatus('playing');
      }
    }, 1500); // Increased delay slightly to ensure smooth transition
  };

  const handleDragStart = (card: GameCard) => {
    setDraggedCard(card);
  };

  const handleDragEnd = (e: any, card: GameCard) => {
    let clientX: number;
    let clientY: number;

    // Handle both mouse and touch events
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Get all elements at the drop point
    const elements = document.elementsFromPoint(clientX, clientY);
    // Find the first element with data-zone attribute
    const zone = elements.find(el => el.hasAttribute('data-zone'));
    
    if (zone) {
      const zoneIndex = parseInt(zone.getAttribute('data-zone') || '0');
      if (tracks[zoneIndex].playerCards.length < 4) {
        playCard(card, zoneIndex);
      }
    }
    setDraggedCard(null);
    setActiveZone(null);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-12 px-4 select-none [-webkit-user-select:none] [-moz-user-select:none] [-ms-user-select:none] [user-select:none]" ref={boardRef}>
      {gameStatus === 'game_over' && determineGameWinner(tracks) === 'player' && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          colors={['#e9d5ff', '#fef3c7', '#ffffff']}
          numberOfPieces={200}
        />
      )}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2 select-none">Partition</h1>
          <p className="text-gray-400 select-none">Round {round} of 5</p>
        </div>

        <div className="mt-4 flex flex-col gap-[5px]">
          {tracks.map((track, index) => (
            <motion.div
              key={index}
              className={`
                bg-[#1a1a1a]/50 p-2 rounded-xl border-2
                ${activeZone === index && track.playerCards.length < 4 
                  ? 'border-purple-500/50' 
                  : 'border-[#dcc48d] border-opacity-20'}
                relative overflow-hidden
                ${draggedCard ? 'hover:bg-purple-500/5' : ''}
                select-none [-webkit-user-select:none] [-moz-user-select:none] [-ms-user-select:none] [user-select:none]
                [-webkit-user-drag:none] [-webkit-tap-highlight-color:transparent]
                transition-all duration-200
              `}
              data-zone={index}
              onMouseEnter={() => draggedCard && track.playerCards.length < 4 && setActiveZone(index)}
              onMouseLeave={() => setActiveZone(null)}
              initial={false}
              animate={{
                backgroundColor: activeZone === index && track.playerCards.length < 4 
                  ? 'rgba(168, 85, 247, 0.1)' 
                  : draggedCard 
                    ? 'rgba(168, 85, 247, 0.03)'
                    : 'rgba(26, 26, 26, 0.5)',
                borderColor: activeZone === index && track.playerCards.length < 4
                  ? 'rgba(168, 85, 247, 0.8)'
                  : draggedCard
                    ? 'rgba(168, 85, 247, 0.3)'
                    : 'rgba(220, 196, 141, 0.2)',
                scale: activeZone === index && track.playerCards.length < 4 ? 1.01 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative h-32 flex items-center justify-between px-4">
                {/* Left side - Player's cards */}
                <div className="w-[400px] flex justify-center">
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <AnimatePresence mode="sync">
                      {track.playerCards.map((card, cardIndex) => (
                        <motion.div
                          key={card.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          layout={false}
                          className="flex justify-center"
                        >
                          <Card
                            value={card.value}
                            title={card.title}
                            isRevealed={true}
                            isPlayable={false}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Center - Score display */}
                <motion.div 
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                  layout={false}
                >
                  <motion.div
                    className={`
                      min-w-[5rem] h-16 px-4 rounded-xl flex items-center justify-center
                      bg-[#1a1a1a]/90 backdrop-blur-sm
                      border-2
                      ${track.playerScore > track.computerScore ? 'border-purple-500' : track.computerScore > track.playerScore ? 'border-rose-500' : 'border-gray-500'}
                      transition-all duration-300 shadow-lg
                    `}
                    animate={{
                      scale: activeZone === index && draggedCard && track.playerCards.length < 4 ? 1.15 : 1,
                      boxShadow: activeZone === index && draggedCard && track.playerCards.length < 4
                        ? '0 0 30px rgba(168, 85, 247, 0.5)'
                        : draggedCard
                          ? '0 0 20px rgba(168, 85, 247, 0.2)'
                          : '0 0 0px rgba(168, 85, 247, 0)'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="font-bold text-3xl flex items-center gap-3">
                      <span className="text-purple-500 tabular-nums w-8 text-right">{track.playerScore}</span>
                      <span className="text-gray-500 text-2xl">-</span>
                      <span className="text-rose-500 tabular-nums w-8 text-left">{track.computerScore}</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Right side - Computer's cards */}
                <div className="w-[400px] flex justify-center">
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <AnimatePresence mode="sync">
                      {track.computerCards.map((card, cardIndex) => (
                        <motion.div
                          key={card.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          layout={false}
                          className="flex justify-center"
                        >
                          <Card
                            value={card.value}
                            title={card.title}
                            isRevealed={true}
                            isPlayable={false}
                            isComputerCard={true}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Player's hand */}
        <motion.div className="mt-4" layout>
          <div className="flex justify-center">
            <div className="grid grid-cols-5 gap-2">
              <AnimatePresence mode="sync" presenceAffectsLayout={false}>
                {playerHand.map((card) => (
                  <motion.div
                    key={card.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex justify-center"
                  >
                    <Card
                      value={card.value}
                      title={card.title}
                      isRevealed={true}
                      isPlayable={gameStatus === 'playing'}
                      onDragStart={() => handleDragStart(card)}
                      onDragEnd={(e) => handleDragEnd(e, card)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Game controls */}
        <div className="mt-4 flex justify-center gap-4">
          {gameStatus === 'playing' && (
            <button
              onClick={confirmRound}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Confirm
            </button>
          )}
          {gameStatus === 'game_over' && (
            <button
              onClick={initializeGame}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoard; 