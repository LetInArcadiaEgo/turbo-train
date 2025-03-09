import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import useSound from 'use-sound';
import ClashTracker from './ClashTracker';
import { useMediaQuery } from 'react-responsive';

// Track colors for the three lanes
const TRACK_COLORS = [
  { from: 'from-amber-400/90', to: 'to-amber-600/90', border: 'border-amber-400', label: 'Economy' },
  { from: 'from-purple-400/90', to: 'to-purple-600/90', border: 'border-purple-400', label: 'Assembly' },
  { from: 'from-red-500/90', to: 'to-red-700/90', border: 'border-red-500', label: 'Mutiny' }
] as const;

// Fixed card values for each title
const CARD_VALUES: Record<string, { value: number, cost: number, trackIndex: number }> = {
  'Mountbatten Plan': { value: 8, cost: 5, trackIndex: 1 },
  'Radcliffe Line': { value: 7, cost: 4, trackIndex: 2 },
  'Direct Action Day': { value: 9, cost: 6, trackIndex: 0 },
  'Independence Act': { value: 8, cost: 5, trackIndex: 1 },
  'Muslim League': { value: 6, cost: 3, trackIndex: 2 },
  'Indian Congress': { value: 7, cost: 4, trackIndex: 0 },
  'Refugee Crisis': { value: 6, cost: 3, trackIndex: 1 },
  'Princely States': { value: 5, cost: 2, trackIndex: 2 },
  'Gandhi\'s Fast': { value: 4, cost: 2, trackIndex: 0 },
  'Freedom at Midnight': { value: 5, cost: 3, trackIndex: 1 }
};

interface GameCard {
  id: number;
  value: number;
  cost: number;
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

// Simplified coin icon component
const CoinIcon: React.FC<{ coins: number }> = ({ coins }) => (
  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-300/90 to-amber-600/90 shadow-lg
                  flex items-center justify-center border border-amber-200/30
                  transform hover:scale-105 transition-transform duration-200 backdrop-blur-sm">
    <span className="text-white font-bold text-2xl drop-shadow-md flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
      </svg>
      {coins}
    </span>
  </div>
);

const GameBoard: React.FC = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [playerHand, setPlayerHand] = useState<GameCard[]>([]);
  const [computerHand, setComputerHand] = useState<GameCard[]>([]);
  const [tracks, setTracks] = useState<Track[]>([
    { playerCards: [], computerCards: [], playerScore: 0, computerScore: 0, winner: null },
    { playerCards: [], computerCards: [], playerScore: 0, computerScore: 0, winner: null },
    { playerCards: [], computerCards: [], playerScore: 0, computerScore: 0, winner: null }
  ]);
  const [round, setRound] = useState(1);
  const [gameStatus, setGameStatus] = useState<'playing' | 'computer_turn' | 'round_end' | 'game_over'>('playing');
  const [markerPosition, setMarkerPosition] = useState(0);
  const [isMarkerFrozen, setIsMarkerFrozen] = useState(false);
  const [playWinSound] = useSound('/win.mp3', { volume: 1.0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const [draggedCard, setDraggedCard] = useState<GameCard | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [playerCoins, setPlayerCoins] = useState(4);
  const [computerCoins, setComputerCoins] = useState(4);

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
    const ties = tracks.filter(t => t.winner === 'tie').length;
    
    // Only declare a tie if ALL tracks are tied
    if (ties === 3) return 'tie';
    // Player wins if they have more wins OR if wins are equal (player advantage)
    if (playerWins >= computerWins) return 'player';
    // Computer only wins if they have strictly more wins
    return 'computer';
  };

  const generateCard = (): GameCard => {
    // Get a random card title from the CARD_VALUES keys
    const title = Object.keys(CARD_VALUES)[Math.floor(Math.random() * Object.keys(CARD_VALUES).length)];
    const { value, cost, trackIndex } = CARD_VALUES[title];
    
    return {
      id: Math.floor(Math.random() * 10000),
      value,
      cost,
      title,
      trackIndex
    };
  };

  const initializeGame = () => {
    const initialPlayerHand = Array(5).fill(null).map(generateCard);
    const initialComputerHand = Array(5).fill(null).map(generateCard);
    setPlayerHand(initialPlayerHand);
    setComputerHand(initialComputerHand);
    setPlayerCoins(4);
    setComputerCoins(4);
    setTracks([
      { playerCards: [], computerCards: [], playerScore: 0, computerScore: 0, winner: null },
      { playerCards: [], computerCards: [], playerScore: 0, computerScore: 0, winner: null },
      { playerCards: [], computerCards: [], playerScore: 0, computerScore: 0, winner: null }
    ]);
    setRound(1);
    setGameStatus('playing');
    setMarkerPosition(0);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const updateMarkerPosition = (tracks: Track[]): boolean => {
    const thirdTrackWinner = tracks[2].winner;
    const assemblyTrackWinner = tracks[1].winner;
    
    // Check if either player can freeze the marker using Assembly track
    const canFreeze = (
      // Player freeze: winning Assembly and losing Mutiny
      (assemblyTrackWinner === 'player' && thirdTrackWinner === 'computer') ||
      // Computer freeze: winning Assembly and losing Mutiny
      (assemblyTrackWinner === 'computer' && thirdTrackWinner === 'player')
    );
    setIsMarkerFrozen(canFreeze);
    
    // If frozen, don't move the marker at all
    if (canFreeze) {
      return false;
    }
    
    if (thirdTrackWinner === 'player') {
      const newPosition = markerPosition + 1;
      setMarkerPosition(newPosition);
      if (newPosition === 3) {
        setGameStatus('game_over');
        playWinSound();
        return true;
      }
    } else if (thirdTrackWinner === 'computer') {
      const newPosition = markerPosition - 1;
      setMarkerPosition(newPosition);
      if (newPosition === -3) {
        setGameStatus('game_over');
        return true;
      }
    }
    return false;
  };

  const playCard = (card: GameCard, trackIndex: number) => {
    if (gameStatus !== 'playing') return;
    if (playerCoins < card.cost) return;
    
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
    setPlayerCoins(prev => prev - card.cost);
  };

  const confirmRound = () => {
    const updatedTracks = calculateTrackScores(tracks);
    setTracks(updatedTracks);
    setGameStatus('computer_turn');
    
    // Economy is "use it or lose it" - players get 4 base coins + 1 per economy card they have
    const playerEconomyBonus = tracks[0].playerCards.length;
    const computerEconomyBonus = tracks[0].computerCards.length;
    
    // Coins reset each round - no accumulation
    const newComputerCoins = 4 + computerEconomyBonus;
    console.log(`[ECONOMY] Computer gets ${4} base + ${computerEconomyBonus} bonus = ${newComputerCoins} coins`);
    setComputerCoins(newComputerCoins);
    setPlayerCoins(4 + playerEconomyBonus);
    
    const gameEnded = computerPlay();
    
    if (!gameEnded) {
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
      }, 1500);
    }
  };

  const computerPlay = (): boolean => {
    const availableTracks = tracks
      .map((track, index) => ({ index, cardCount: track.computerCards.length }))
      .filter(track => track.cardCount < 4);

    if (availableTracks.length === 0 || computerHand.length === 0) {
      const updatedTracks = calculateTrackScores(tracks);
      setTracks(updatedTracks);
      
      const gameEnded = updateMarkerPosition(updatedTracks);
      if (gameEnded) {
        return true;
      }

      setTimeout(() => {
        if (round === 5) {
          setGameStatus('game_over');
        } else {
          setGameStatus('round_end');
          if (round === 1) {
            playWinSound();
          }
        }
      }, 1000);
      return false;
    }

    const newTracks = [...tracks];
    const cardsToRemove: GameCard[] = [];
    let totalCoins = 4 + tracks[0].computerCards.length; // Recalculate coins directly
    let remainingCoins = totalCoins;
    let remainingHand = [...computerHand];
    
    console.log(`[COMPUTER] Starting turn with ${totalCoins} coins and ${remainingHand.length} cards:`);
    remainingHand.forEach(card => {
      console.log(`- Card: ${card.title}, Cost: ${card.cost}, Value: ${card.value}, Track: ${card.trackIndex}`);
    });

    // Try to play the cheapest cards first to maximize number of plays
    const sortedCards = [...remainingHand].sort((a, b) => {
      // First sort by cost
      if (a.cost !== b.cost) return a.cost - b.cost;
      // If costs are equal, sort by value
      return b.value - a.value;
    });
    
    // Try to play cards in order
    for (const card of sortedCards) {
      if (remainingCoins >= card.cost && newTracks[card.trackIndex].computerCards.length < 4) {
        console.log(`[PLAY] Playing card ${card.title} (Cost: ${card.cost}, Value: ${card.value}) on track ${card.trackIndex}`);
        cardsToRemove.push(card);
        newTracks[card.trackIndex].computerCards.push(card);
        remainingCoins -= card.cost;
        console.log(`[STATUS] ${remainingCoins} coins remaining after play`);
      } else {
        console.log(`[SKIP] Cannot play ${card.title}: Cost ${card.cost} > ${remainingCoins} coins or track ${card.trackIndex} full`);
      }
    }
    
    const updatedTracks = calculateTrackScores(newTracks);
    setTracks(updatedTracks);
    setComputerHand(prevHand => prevHand.filter(card => !cardsToRemove.includes(card)));
    setComputerCoins(remainingCoins);
    
    console.log(`[SUMMARY] Computer played ${cardsToRemove.length} cards with ${totalCoins} starting coins, ${remainingCoins} remaining`);
    
    const gameEnded = updateMarkerPosition(updatedTracks);
    if (gameEnded) {
      return true;
    }
    
    setTimeout(() => {
      if (round === 5) {
        setGameStatus('game_over');
      } else {
        setGameStatus('round_end');
        if (round === 1) {
          playWinSound();
        }
      }
    }, 1000);
    
    return false;
  };

  const handleDrag = (_: any, info: { point: { x: number; y: number } }) => {
    // Use the point for absolute position
    setDragPosition(info.point);
  };

  const isOverTrack = (index: number): boolean => {
    if (!dragPosition || !trackRefs.current[index]) return false;
    const rect = trackRefs.current[index]?.getBoundingClientRect();
    if (!rect) return false;

    // Use a much larger margin (300px) around the entire track area
    const margin = 300;
    
    // Create an expanded rectangle for the drop zone
    const expandedRect = {
      left: rect.left - margin,
      right: rect.right + margin,
      top: rect.top - margin,
      bottom: rect.bottom + margin
    };
    
    // First check if we're actually over the track
    const isOver = dragPosition.x >= expandedRect.left && 
           dragPosition.x <= expandedRect.right &&
           dragPosition.y >= expandedRect.top && 
           dragPosition.y <= expandedRect.bottom;

    if (!isOver) return false;

    // Then check if the card can be played here
    return !!(draggedCard && 
           isValidTrack(draggedCard, index) && 
           canAffordCard(draggedCard) &&
           isOver);
  };

  const findTrackUnderDrag = (): number | null => {
    if (!dragPosition || !draggedCard) return null;
    
    // Check each track
    for (let i = 0; i < trackRefs.current.length; i++) {
      const rect = trackRefs.current[i]?.getBoundingClientRect();
      if (!rect) continue;
      
      // Only consider valid tracks where we can afford the card
      if (!isValidTrack(draggedCard, i) || !canAffordCard(draggedCard)) continue;
      
      // Use same expanded rectangle logic as isOverTrack
      const margin = 300;
      
      // Create an expanded rectangle for the drop zone
      const expandedRect = {
        left: rect.left - margin,
        right: rect.right + margin,
        top: rect.top - margin,
        bottom: rect.bottom + margin
      };
      
      // Check if the drag position is within this expanded rectangle
      if (dragPosition.x >= expandedRect.left && 
          dragPosition.x <= expandedRect.right &&
          dragPosition.y >= expandedRect.top && 
          dragPosition.y <= expandedRect.bottom) {
        return i;
      }
    }
    
    return null;
  };

  const handleDragStart = (card: GameCard) => {
    setDraggedCard(card);
  };

  const isValidTrack = (card: GameCard, trackIndex: number): boolean => {
    console.log(`Checking track validity: Card track ${card.trackIndex} vs Track index ${trackIndex}`);
    // Only check if the track type matches and there's space
    return card.trackIndex === trackIndex && 
           tracks[trackIndex].playerCards.length < 4;
  };

  const canAffordCard = (card: GameCard): boolean => {
    // Simple coin check
    return playerCoins >= card.cost;
  };

  const handleDragEnd = (e: any, card: GameCard) => {
    // Use our more reliable track detection method instead of elementsFromPoint
    const trackIndex = findTrackUnderDrag();
    
    if (trackIndex !== null) {
      // Check if the card can be played on this track
      const validTrack = isValidTrack(card, trackIndex);
      const canAfford = canAffordCard(card);
      
      if (validTrack && canAfford) {
        playCard(card, trackIndex);
      }
    }
    
    setDraggedCard(null);
    setDragPosition(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] py-4 px-2 md:px-4 flex flex-col overflow-hidden relative" ref={boardRef}>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />
      
      <div className="w-full max-w-[1200px] mx-auto flex flex-col relative">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4 md:mb-8 relative z-[5]">
          <h1 className="text-[2.5rem] md:text-[4.5rem] font-black text-white select-none tracking-[-0.03em] uppercase leading-none" style={{ fontFamily: 'var(--font-title)' }}>Partition</h1>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="inline-flex items-center justify-center h-10 md:h-12 px-3 md:px-6 rounded-2xl bg-gradient-to-br from-[#2a2a2a] to-black/80 border border-white/10 backdrop-blur-md shadow-xl">
              <p className="text-white/70 select-none text-xs md:text-sm font-medium">Round {round} of 5</p>
              <div className="w-px h-4 md:h-6 bg-white/10 mx-2 md:mx-4" />
              <div className="flex items-center gap-2">
                <div className="h-6 md:h-8 px-2 md:px-3 rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center border border-amber-200/30 shadow-lg shadow-amber-500/20 transform hover:scale-105 transition-all duration-200">
                  <span className="text-white text-sm md:text-lg font-bold tabular-nums drop-shadow-md flex items-center gap-1 md:gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                    </svg>
                    {playerCoins}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game outcome message */}
        {gameStatus === 'game_over' && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[60]">
            <div className="px-4 md:px-8 py-2 md:py-4 rounded-2xl bg-gradient-to-br from-black/80 to-black/40 border border-white/20 backdrop-blur-xl shadow-2xl">
              <p className="text-xl md:text-3xl font-black text-center tracking-tight" 
                 style={{ 
                   color: determineGameWinner(tracks) === 'player' ? '#4ade80' : 
                          determineGameWinner(tracks) === 'computer' ? '#f87171' : '#94a3b8',
                   textShadow: determineGameWinner(tracks) === 'player' ? '0 0 20px rgba(74, 222, 128, 0.5)' :
                              determineGameWinner(tracks) === 'computer' ? '0 0 20px rgba(248, 113, 113, 0.5)' :
                              '0 0 20px rgba(148, 163, 184, 0.5)'
                 }}>
                {determineGameWinner(tracks) === 'player' ? 'Victory!' : 
                 determineGameWinner(tracks) === 'computer' ? 'Defeat!' : 
                 'Stalemate!'}
              </p>
            </div>
          </div>
        )}

        {/* Confetti */}
        {gameStatus === 'game_over' && determineGameWinner(tracks) === 'player' && (
          <div className="absolute inset-0 z-[70]">
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              colors={['#e9d5ff', '#fef3c7', '#ffffff']}
              numberOfPieces={isMobile ? 100 : 200}
            />
          </div>
        )}

        <div className="w-full flex flex-col gap-1 md:gap-2 items-center justify-center flex-1">
          {tracks.map((track, index) => (
            <motion.div
              key={index}
              ref={(el) => {
                trackRefs.current[index] = el;
              }}
              className="relative flex flex-row items-center justify-center h-24 md:h-32 w-full"
              data-zone={index}
              style={{}}
            >
              {/* Player's side */}
              <div 
                className={`
                  bg-black/20 p-1 md:p-2 rounded-xl border w-[280px] md:w-[450px] h-[90px] md:h-[120px] backdrop-blur-sm relative
                    ${isOverTrack(index) ? [
                      index === 0 ? [
                        'border-amber-400/40',
                        'bg-gradient-to-br from-amber-500/10 to-transparent',
                        'shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                      ].join(' ') :
                      index === 1 ? [
                        'border-purple-400/40',
                        'bg-gradient-to-br from-purple-500/10 to-transparent',
                        'shadow-[0_0_15px_rgba(147,51,234,0.1)]'
                      ].join(' ') : [
                        'border-red-500/40',
                        'bg-gradient-to-br from-red-500/10 to-transparent',
                        'shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                      ].join(' '),
                      'transition-all duration-300 ease-out'
                    ].join(' ') : 'border-white/5'}
                `}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-1 md:gap-3 items-center">
                    <AnimatePresence mode="popLayout">
                      {track.playerCards.map((card) => (
                        <motion.div
                          key={card.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.1 }}
                          layout={false}
                          className="flex justify-center relative z-[100]"
                        >
                          <Card
                            value={card.value}
                            cost={card.cost}
                            title={card.title}
                            isRevealed={true}
                            isPlayable={false}
                            fromColor={TRACK_COLORS[card.trackIndex].from}
                            toColor={TRACK_COLORS[card.trackIndex].to}
                            isMobile={isMobile}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Score display */}
              <div className="mx-2 md:mx-4 relative">
                <div className="min-w-[5rem] md:min-w-[8rem] px-2 md:px-4 py-2 md:py-3 rounded-2xl flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm border border-white/10">
                  {/* Track Label */}
                  <div className="text-xs md:text-sm font-bold tracking-wide mb-1 md:mb-2" 
                       style={{ 
                         color: index === 0 ? 'rgb(251, 191, 36)' :  // Amber-400 for Economy
                                index === 1 ? 'rgb(167, 139, 250)' :  // Purple-400 for Assembly
                                'rgb(248, 113, 113)',                  // Red-400 for Mutiny
                         textShadow: `0 0 20px ${
                           index === 0 ? 'rgba(251, 191, 36, 0.3)' :
                           index === 1 ? 'rgba(167, 139, 250, 0.3)' :
                           'rgba(248, 113, 113, 0.3)'
                         }`
                       }}>
                    {TRACK_COLORS[index].label}
                  </div>
                  <div className="font-bold text-2xl md:text-4xl flex items-center justify-center gap-3 md:gap-6 w-full">
                    <span className="tabular-nums w-8 md:w-12 text-center text-[#4169E1]">{track.playerScore}</span>
                    <span className="text-white/30 text-xl md:text-2xl">vs</span>
                    <span className="tabular-nums w-8 md:w-12 text-center text-amber-400">{track.computerScore}</span>
                  </div>
                  {index === 2 && (
                    <div className="mt-2 md:mt-3 flex justify-center items-center gap-0.5 md:gap-1">
                      {Array.from({ length: 7 }, (_, i) => i - 3).map((markerIndex) => (
                        <div
                          key={markerIndex}
                          className={`
                            w-4 h-4 md:w-6 md:h-6 rounded-lg border relative backdrop-blur-sm transition-all duration-200
                            ${markerIndex === 0 ? 'border-white/40 bg-white/5' : 
                              markerIndex < 0 ? 'border-red-400/60 bg-red-500/10' : 
                              'border-[#4169E1]/60 bg-[#4169E1]/10'}
                            ${isMarkerFrozen && markerIndex === markerPosition ? 'border-purple-400/80 bg-purple-400/20' : ''}
                            hover:border-white/50 hover:bg-white/10
                          `}
                        >
                          {(markerIndex === -3 || markerIndex === 3) && (
                            <div className="absolute inset-0 flex items-center justify-center text-white/90">
                              {markerIndex === -3 ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2c-4.4 0-8 3.6-8 8 0 3.9 2.8 7.2 6.5 7.9-.1-.9-.1-2.3 0-2.7 0-.3.3-.6.6-.6h1.8c.3 0 .6.3.6.6.1.4.1 1.8 0 2.7 3.7-.7 6.5-4 6.5-7.9 0-4.4-3.6-8-8-8zm-4 8c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm4 5.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm4-5.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-[#4169E1]" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2c-4.4 0-8 3.6-8 8 0 3.9 2.8 7.2 6.5 7.9-.1-.9-.1-2.3 0-2.7 0-.3.3-.6.6-.6h1.8c.3 0 .6.3.6.6.1.4.1 1.8 0 2.7 3.7-.7 6.5-4 6.5-7.9 0-4.4-3.6-8-8-8zm-4 8c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm4 5.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm4-5.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
                                </svg>
                              )}
                            </div>
                          )}
                          {markerPosition === markerIndex && (
                            <motion.div
                              layoutId="marker"
                              className={`absolute inset-0 m-auto rounded-md ${isMarkerFrozen ? 'w-3 h-3 md:w-4 md:h-4 bg-purple-400 border border-purple-300/50 shadow-[0_0_10px_rgba(167,139,250,0.3)]' : 'w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}
                              animate={isMarkerFrozen ? {
                                scale: [1, 1.1, 1],
                                opacity: [1, 0.8, 1],
                              } : {}}
                              transition={isMarkerFrozen ? {
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              } : {
                                type: "spring",
                                stiffness: 300,
                                damping: 25
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Computer's side */}
              <div className="bg-black/20 p-1 md:p-2 rounded-xl border border-white/5 w-[280px] md:w-[450px] h-[90px] md:h-[120px] backdrop-blur-sm relative">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-1 md:gap-3 items-center">
                    <AnimatePresence mode="popLayout">
                      {track.computerCards.map((card) => (
                        <motion.div
                          key={card.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.1 }}
                          layout={false}
                          className="flex justify-center relative z-[100]"
                        >
                          <Card
                            value={card.value}
                            cost={card.cost}
                            title={card.title}
                            isRevealed={true}
                            isPlayable={false}
                            fromColor={TRACK_COLORS[card.trackIndex].from}
                            toColor={TRACK_COLORS[card.trackIndex].to}
                            isMobile={isMobile}
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

        <div className="flex flex-col items-center justify-center gap-2 mt-2 mb-4 relative z-[40]">
          <motion.div 
            className="h-[90px] md:h-[120px] w-full flex justify-center items-center overflow-x-auto overflow-y-visible px-2"
            layout={false}
          >
            <div className="flex gap-1 md:gap-2">
              <AnimatePresence mode="popLayout">
                {playerHand.map((card) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.4, 0.0, 0.2, 1]
                    }}
                    className="flex justify-center"
                    style={{ 
                      zIndex: draggedCard?.id === card.id ? 9999 : 1000,
                      position: 'relative'
                    }}
                  >
                    <Card
                      value={card.value}
                      cost={card.cost}
                      title={card.title}
                      isRevealed={true}
                      isPlayable={gameStatus === 'playing'}
                      fromColor={TRACK_COLORS[card.trackIndex].from}
                      toColor={TRACK_COLORS[card.trackIndex].to}
                      onDragStart={() => handleDragStart(card)}
                      onDrag={handleDrag}
                      onDragEnd={(e) => handleDragEnd(e, card)}
                      canAfford={canAffordCard(card)}
                      isMobile={isMobile}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="flex gap-4 relative z-[40]">
            {gameStatus === 'playing' && (
              <button
                onClick={confirmRound}
                className="px-4 md:px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg 
                         hover:from-amber-600 hover:to-amber-700 transition-all duration-200 font-medium text-sm md:text-base
                         shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
              >
                Confirm Round
              </button>
            )}
            {gameStatus === 'game_over' && (
              <button
                onClick={initializeGame}
                className="px-4 md:px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg 
                         hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium text-sm md:text-base
                         shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
              >
                Play Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard; 