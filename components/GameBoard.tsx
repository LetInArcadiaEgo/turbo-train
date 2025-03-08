import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import useSound from 'use-sound';

// Track colors for the three lanes
const TRACK_COLORS = [
  { from: 'from-cyan-400/90', to: 'to-cyan-600/90', border: 'border-cyan-400', highlight: 'rgba(34, 211, 238, 0.5)' },
  { from: 'from-[#6495ED]/90', to: 'to-[#4169E1]/90', border: 'border-[#6495ED]', highlight: 'rgba(100, 149, 237, 0.5)' },
  { from: 'from-[#4B50E5]/90', to: 'to-[#3B3FD9]/90', border: 'border-[#4B50E5]', highlight: 'rgba(75, 80, 229, 0.5)' }
] as const;

// Opponent track colors (warm palette)
const OPPONENT_COLORS = [
  { from: 'from-rose-500/90', to: 'to-rose-600/90', border: 'border-rose-500' },     // Lighter red
  { from: 'from-rose-600/90', to: 'to-rose-700/90', border: 'border-rose-600' },     // Medium red
  { from: 'from-rose-800/90', to: 'to-rose-950/90', border: 'border-rose-800' }      // Deep burgundy
] as const;

// Fixed card values for each title
const CARD_VALUES: Record<string, { value: number, trackIndex: number }> = {
  'Mountbatten Plan': { value: 8, trackIndex: 1 },
  'Radcliffe Line': { value: 7, trackIndex: 2 },
  'Direct Action Day': { value: 9, trackIndex: 0 },
  'Independence Act': { value: 8, trackIndex: 1 },
  'Muslim League': { value: 6, trackIndex: 2 },
  'Indian Congress': { value: 7, trackIndex: 0 },
  'Refugee Crisis': { value: 6, trackIndex: 1 },
  'Princely States': { value: 5, trackIndex: 2 },
  'Gandhi\'s Fast': { value: 4, trackIndex: 0 },
  'Freedom at Midnight': { value: 5, trackIndex: 1 }
};

interface GameCard {
  id: number;
  value: number;
  title: string;
  trackIndex: number;
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
  const [draggedCard, setDraggedCard] = useState<GameCard | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  const generateCard = (): GameCard => {
    const title = TITLES[Math.floor(Math.random() * TITLES.length)];
    const cardInfo = CARD_VALUES[title];
    return {
      id: Math.random(),
      value: cardInfo.value,
      title: title,
      trackIndex: cardInfo.trackIndex
    };
  };

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
    // Get tracks that have less than 4 computer cards
    const availableTracks = tracks
      .map((track, index) => ({ index, cardCount: track.computerCards.length }))
      .filter(track => track.cardCount < 4);

    // If no tracks available or no cards in hand, skip computer's turn
    if (availableTracks.length === 0 || computerHand.length === 0) {
      const updatedTracks = calculateTrackScores(tracks);
      setTracks(updatedTracks);
      
      setTimeout(() => {
        if (round === 5) {
          setGameStatus('game_over');
          const winner = determineGameWinner(updatedTracks);
          if (winner === 'player') {
            playWinSound();
          }
        } else {
          setGameStatus('round_end');
          if (round === 1) {
            playWinSound();
          }
        }
      }, 1000);
      return;
    }

    const newTracks = [...tracks];
    const cardsToRemove: GameCard[] = [];
    
    // Group cards by their track
    const cardsByTrack = computerHand.reduce((acc, card) => {
      if (!acc[card.trackIndex]) {
        acc[card.trackIndex] = [];
      }
      acc[card.trackIndex].push(card);
      return acc;
    }, {} as Record<number, GameCard[]>);

    // For each track that has space
    availableTracks.forEach(({ index: trackIndex }) => {
      // Get cards that can be played on this track
      const validCards = cardsByTrack[trackIndex] || [];
      if (validCards.length > 0) {
        // Play the first valid card
        const card = validCards[0];
        cardsToRemove.push(card);
        newTracks[trackIndex].computerCards.push(card);
        // Remove the card from cardsByTrack to avoid playing it again
        cardsByTrack[trackIndex] = cardsByTrack[trackIndex].filter(c => c.id !== card.id);
      }
    });
    
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

  const isOverTrack = (index: number): boolean => {
    if (!dragPosition || !trackRefs.current[index]) return false;
    const rect = trackRefs.current[index]?.getBoundingClientRect();
    if (!rect) return false;
    return (
      dragPosition.x >= rect.left &&
      dragPosition.x <= rect.right &&
      dragPosition.y >= rect.top &&
      dragPosition.y <= rect.bottom
    );
  };

  const handleDragStart = (card: GameCard) => {
    setDraggedCard(card);
  };

  const handleDrag = (_: any, info: { point: { x: number; y: number } }) => {
    setDragPosition(info.point);
  };

  const isValidTrack = (card: GameCard, trackIndex: number): boolean => {
    return card.trackIndex === trackIndex && tracks[trackIndex].playerCards.length < 4;
  };

  const handleDragEnd = (e: any, card: GameCard) => {
    const elements = document.elementsFromPoint(dragPosition?.x || 0, dragPosition?.y || 0);
    const zone = elements.find(el => el.hasAttribute('data-zone'));
    
    if (zone) {
      const zoneIndex = parseInt(zone.getAttribute('data-zone') || '0');
      if (isValidTrack(card, zoneIndex)) {
        playCard(card, zoneIndex);
      }
    }
    setDraggedCard(null);
    setDragPosition(null);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-12 flex flex-col items-center overflow-hidden" ref={boardRef}>
      {gameStatus === 'game_over' && determineGameWinner(tracks) === 'player' && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          colors={['#e9d5ff', '#fef3c7', '#ffffff']}
          numberOfPieces={200}
        />
      )}
      <div className="w-full max-w-[1000px] mx-auto px-4 flex flex-col items-center">
        <div className="text-center mb-12 relative">
          <h1 className="text-4xl font-bold text-white mb-2 select-none">Partition</h1>
          {gameStatus === 'game_over' && (
            <>
              {determineGameWinner(tracks) === 'computer' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute w-full text-2xl font-bold text-rose-500 top-[calc(100%_+_0.5rem)]"
                >
                  You Lose!
                </motion.p>
              )}
              {determineGameWinner(tracks) === 'player' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute w-full text-2xl font-bold text-emerald-500 top-[calc(100%_+_0.5rem)]"
                >
                  You Win!
                </motion.p>
              )}
              {determineGameWinner(tracks) === 'tie' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute w-full text-2xl font-bold text-amber-500 top-[calc(100%_+_0.5rem)]"
                >
                  You Tied!
                </motion.p>
              )}
            </>
          )}
          <p className="text-gray-400 select-none">Round {round} of 5</p>
        </div>

        <div className="w-full flex flex-col gap-[5px] items-center">
          {tracks.map((track, index) => (
            <motion.div
              key={index}
              ref={(el) => {
                trackRefs.current[index] = el;
              }}
              className="relative flex flex-row items-center justify-center h-32 mb-2 w-full"
            >
              {/* Left side - Player's area (can receive drops) */}
              <motion.div
                className={`
                  bg-[#1a1a1a]/50 p-2 rounded-xl border-2 w-[400px] h-full
                  ${draggedCard
                    ? isValidTrack(draggedCard, index)
                      ? `${TRACK_COLORS[draggedCard.trackIndex].border} ${
                          isOverTrack(index) 
                            ? draggedCard.trackIndex === 0
                              ? 'bg-cyan-400/20'
                              : draggedCard.trackIndex === 1
                                ? 'bg-[#6495ED]/20'
                                : 'bg-[#4B50E5]/20'
                            : ''
                        }`
                      : 'border-[#dcc48d] border-opacity-20'
                    : 'border-[#dcc48d] border-opacity-20'}
                  relative overflow-visible
                  transition-all duration-150
                `}
                data-zone={index}
                initial={false}
                animate={{
                  scale: isOverTrack(index) && draggedCard && isValidTrack(draggedCard, index) ? 1.02 : 1
                }}
                transition={{ duration: 0.15 }}
              >
                {/* Player's cards */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <AnimatePresence mode="popLayout">
                      {track.playerCards.map((card, cardIndex) => (
                        <motion.div
                          key={card.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.2 }}
                          layout={false}
                          className="flex justify-center"
                          style={{ zIndex: 1 }}
                        >
                          <Card
                            value={card.value}
                            title={card.title}
                            isRevealed={true}
                            isPlayable={false}
                            fromColor={TRACK_COLORS[card.trackIndex].from}
                            toColor={TRACK_COLORS[card.trackIndex].to}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              {/* Center - Score display */}
              <motion.div 
                className="mx-4 z-20"
                layout={false}
              >
                <motion.div
                  className={`
                    min-w-[5rem] h-16 px-4 rounded-xl flex items-center justify-center
                    bg-[#1a1a1a]/90 backdrop-blur-sm
                    border-2
                    ${track.playerScore > track.computerScore ? 'border-[#4169E1]' : track.computerScore > track.playerScore ? 'border-rose-500' : 'border-gray-500'}
                    transition-all duration-150
                    shadow-lg
                  `}
                  animate={{
                    scale: isOverTrack(index) && draggedCard && isValidTrack(draggedCard, index) ? 1.05 : 1,
                    boxShadow: isOverTrack(index) && draggedCard && isValidTrack(draggedCard, index)
                      ? `0 0 20px ${TRACK_COLORS[index].highlight}`
                      : 'none'
                  }}
                  transition={{ duration: 0.1 }}
                >
                  <div className="font-bold text-3xl flex items-center gap-3">
                    <span className="tabular-nums w-8 text-right text-[#4169E1]">{track.playerScore}</span>
                    <span className="text-gray-500 text-2xl">-</span>
                    <span className="text-rose-500 tabular-nums w-8 text-left">{track.computerScore}</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right side - Computer's area (cannot receive drops) */}
              <div className="bg-[#1a1a1a]/50 p-2 rounded-xl border-2 border-[#dcc48d] border-opacity-20 w-[400px] h-full relative overflow-visible">
                {/* Computer's cards */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <AnimatePresence mode="popLayout">
                      {track.computerCards.map((card, cardIndex) => (
                        <motion.div
                          key={card.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.2 }}
                          layout={false}
                          className="flex justify-center"
                          style={{ zIndex: 1 }}
                        >
                          <Card
                            value={card.value}
                            title={card.title}
                            isRevealed={true}
                            isPlayable={false}
                            isComputerCard={true}
                            fromColor={OPPONENT_COLORS[card.trackIndex].from}
                            toColor={OPPONENT_COLORS[card.trackIndex].to}
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
        <motion.div 
          className="mt-4 h-[120px] w-full flex justify-center items-center"
          layout={false}
          style={{ zIndex: 50 }}
        >
          <div className="flex gap-2">
            <AnimatePresence mode="popLayout">
              {playerHand.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    duration: 0.2,
                    ease: [0.4, 0.0, 0.2, 1],
                    layout: {
                      duration: 0.4,
                      ease: [0.4, 0.0, 0.2, 1]
                    }
                  }}
                  layout="position"
                  className="flex justify-center"
                >
                  <Card
                    value={card.value}
                    title={card.title}
                    isRevealed={true}
                    isPlayable={gameStatus === 'playing'}
                    fromColor={TRACK_COLORS[card.trackIndex].from}
                    toColor={TRACK_COLORS[card.trackIndex].to}
                    onDragStart={() => handleDragStart(card)}
                    onDrag={handleDrag}
                    onDragEnd={(e) => handleDragEnd(e, card)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Game controls */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
          {gameStatus === 'playing' && (
            <button
              onClick={confirmRound}
              className="px-6 py-2 bg-[#4169E1] text-white rounded-lg hover:bg-[#3658c7] transition-colors"
            >
              Confirm
            </button>
          )}
          {gameStatus === 'game_over' && (
            <button
              onClick={initializeGame}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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