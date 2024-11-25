import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import PlayerColumn from './PlayerColumn';
import DiceRoller from './DiceRoller';
import ShootingModal from './ShootingModal';
import Leaderboard from './Leaderboard';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';

const GameArena: React.FC = () => {
  const { 
    currentRoom,
    socket,
    username,
    performGameAction
  } = useGameStore();

  const [showShootingModal, setShowShootingModal] = React.useState(false);
  const [selectedCell, setSelectedCell] = React.useState<number | null>(null);

  if (!currentRoom || !currentRoom.gameState) return null;

  const currentPlayerIndex = currentRoom.gameState.currentPlayer;
  const currentPlayer = currentRoom.gameState.players[currentPlayerIndex];
  const isMyTurn = currentRoom.players[currentPlayerIndex].username === username;
  
  const handleDiceRoll = (value: number) => {
    if (!isMyTurn) return;
    performGameAction('roll', { value });
  };

  const handleShoot = (targetPlayer: number, cellIndex: number) => {
    if (!isMyTurn || selectedCell === null) return;
    performGameAction('shoot', { 
      targetPlayer,
      targetCell: cellIndex,
      sourceCell: selectedCell 
    });
    setShowShootingModal(false);
    setSelectedCell(null);
  };

  const handleCellClick = (cellIndex: number) => {
    if (!isMyTurn) return;
    const cell = currentPlayer.cells[cellIndex];
    
    if (cell.stage === 6 && cell.bullets > 0) {
      setSelectedCell(cellIndex);
      setShowShootingModal(true);
    }
  };

  // Show toast when it's user's turn
  useEffect(() => {
    if (isMyTurn) {
      toast.success("It's your turn!");
    }
  }, [currentPlayerIndex, isMyTurn]);

  const winner = currentRoom.gameState.players.find(p => 
    !p.eliminated && currentRoom.gameState.players.filter(op => !op.eliminated).length === 1
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-8 shadow-2xl"
        >
          {winner && <Confetti />}
          
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Dice Battle Arena</h1>
            <div className="flex items-center justify-center gap-4">
              <p className="text-blue-200">
                Current Turn: <span className="font-bold">
                  {currentRoom.players[currentPlayerIndex].username}
                  {isMyTurn ? " (You)" : ""}
                </span>
              </p>
            </div>
          </div>

          <Leaderboard players={currentRoom.gameState.players} />

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(4, currentRoom.players.length)} gap-4 lg:gap-8`}>
            {currentRoom.gameState.players.map((player, index) => (
              <PlayerColumn
                key={player.id}
                player={player}
                isCurrentPlayer={currentPlayerIndex === index}
                onCellClick={handleCellClick}
                isMyTurn={isMyTurn}
              />
            ))}
          </div>

          {!winner && isMyTurn && (
            <div className="mt-8 flex justify-center">
              <DiceRoller
                onRoll={handleDiceRoll}
                disabled={showShootingModal || currentPlayer.eliminated}
                currentPlayer={currentPlayerIndex}
              />
            </div>
          )}

          <AnimatePresence>
            {showShootingModal && (
              <ShootingModal
                players={currentRoom.gameState.players}
                currentPlayer={currentPlayerIndex}
                onShoot={handleShoot}
                onClose={() => {
                  setShowShootingModal(false);
                  setSelectedCell(null);
                }}
                timeLeft={30}
              />
            )}
          </AnimatePresence>

          {winner && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                🎉 {winner.username} Wins! 🎉
              </h2>
              <p className="text-blue-200">
                {winner.username === username ? 
                  "Congratulations! You've dominated the Dice Battle Arena!" : 
                  `${winner.username} has dominated the Dice Battle Arena!`}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GameArena;