import React, { useState, useEffect } from 'react';
import Card from './Card';
import ScoreTracker from './ScoreTracker';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

interface GameCard {
  id: number;
  value: number;
  title: string;
}

const TITLES = [
  'Majority Leader',
  'Whip Vote',
  'Filibuster',
  'Committee Chair',
  'Bipartisan Deal',
  'Executive Order',
  'Veto Power',
  'Floor Vote',
  'Caucus Support',
  'Special Session'
];

const GameBoard: React.FC = () => {
  const [playerHand, setPlayerHand] = useState<GameCard[]>([]);
  const [playerCard, setPlayerCard] = useState<GameCard | null>(null);
  const [computerCard, setComputerCard] = useState<GameCard | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [round, setRound] = useState(1);
  const [isPlayerCardRevealed, setIsPlayerCardRevealed] = useState(false);
  const [isComputerCardRevealed, setIsComputerCardRevealed] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'round_end' | 'game_over'>('playing');

  const generateCard = (): GameCard => ({
    id: Math.random(),
    value: Math.floor(Math.random() * 10) + 1,
    title: TITLES[Math.floor(Math.random() * TITLES.length)]
  });

  const initializeGame = () => {
    const initialHand = Array(5).fill(null).map(generateCard);
    setPlayerHand(initialHand);
    setRound(1);
    setPlayerScore(0);
    setComputerScore(0);
    setGameStatus('playing');
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const playCard = (card: GameCard) => {
    if (gameStatus !== 'playing') return;
    
    setPlayerCard(card);
    setPlayerHand(playerHand.filter(c => c.id !== card.id));
    setIsPlayerCardRevealed(true);
    
    // Computer plays after a delay
    setTimeout(() => {
      const computerCard = generateCard();
      setComputerCard(computerCard);
      setTimeout(() => {
        setIsComputerCardRevealed(true);
        // Record both players' scores each round
        setPlayerScore(prev => prev + card.value);
        setComputerScore(prev => prev + computerCard.value);
        setGameStatus('round_end');
      }, 1000);
    }, 1500);
  };

  const nextRound = () => {
    if (round === 5) {
      setGameStatus('game_over');
      return;
    }
    
    setRound(prev => prev + 1);
    setPlayerCard(null);
    setComputerCard(null);
    setIsPlayerCardRevealed(false);
    setIsComputerCardRevealed(false);
    setGameStatus('playing');
    setPlayerHand(prev => [...prev, generateCard()]);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-12 px-4">
      {gameStatus === 'game_over' && playerScore > computerScore && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          colors={['#e9d5ff', '#fef3c7', '#ffffff']}
          numberOfPieces={200}
        />
      )}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Master the Senate</h1>
          <p className="text-gray-400">Round {round} of 5</p>
        </div>

        <ScoreTracker
          playerScore={playerScore}
          computerScore={computerScore}
          round={round}
        />

        <div className="mt-8 flex justify-center gap-8">
          <div className="text-center">
            <p className="text-gray-400 mb-2">Your Play</p>
            <AnimatePresence>
              {playerCard && (
                <Card
                  value={playerCard.value}
                  title={playerCard.title}
                  isRevealed={isPlayerCardRevealed}
                  isPlayable={false}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="text-center">
            <p className="text-gray-400 mb-2">Opponent's Play</p>
            <AnimatePresence>
              {computerCard && (
                <Card
                  value={computerCard.value}
                  title={computerCard.title}
                  isRevealed={isComputerCardRevealed}
                  isPlayable={false}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {gameStatus === 'round_end' && (
          <div className="text-center mt-8">
            <button
              onClick={nextRound}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
            >
              {round === 5 ? 'See Final Results' : 'Next Round'}
            </button>
          </div>
        )}

        {gameStatus === 'game_over' && (
          <div className="text-center mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              {playerScore > computerScore ? 'You Won!' : 
               playerScore < computerScore ? 'You Lost!' : 'It\'s a Tie!'}
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
              <Card
                key={card.id}
                value={card.value}
                title={card.title}
                isRevealed={true}
                isPlayable={gameStatus === 'playing'}
                onClick={() => playCard(card)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard; 