import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import type { Player } from './GameArena';
import CharacterStages from './CharacterStages';

interface ShootingModalProps {
  players: Player[];
  currentPlayer: number;
  onShoot: (targetPlayer: number, cellIndex: number) => void;
  onClose: () => void;
}

const ShootingModal: React.FC<ShootingModalProps> = ({
  players,
  currentPlayer,
  onShoot,
  onClose,
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  const handleShoot = () => {
    if (selectedPlayer !== null && selectedCell !== null) {
      onShoot(selectedPlayer, selectedCell);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Choose Target</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6 mb-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Select Player:</label>
            <div className="grid grid-cols-2 gap-2">
              {players.map((player, index) => {
                if (index === currentPlayer) return null;
                return (
                  <button
                    key={player.id}
                    onClick={() => {
                      setSelectedPlayer(index);
                      setSelectedCell(null);
                    }}
                    className={`p-2 rounded ${
                      selectedPlayer === index
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {player.name}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedPlayer !== null && (
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Select Cell to Attack:</label>
              <div className="grid grid-cols-2 gap-4">
                {players[selectedPlayer].cells.map((cell, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCell(index)}
                    disabled={!cell.isActive}
                    className={`p-4 rounded min-h-[180px] relative ${
                      selectedCell === index
                        ? 'bg-red-500/30 ring-2 ring-red-500'
                        : cell.isActive
                        ? 'bg-gray-700/50 hover:bg-gray-600/50'
                        : 'bg-gray-800/30 cursor-not-allowed'
                    }`}
                  >
                    <div className="absolute top-2 left-2">
                      <span className="text-white">Cell {index + 1}</span>
                    </div>
                    <div className="flex items-center justify-center h-full">
                      {cell.isActive && (
                        <CharacterStages
                          stage={cell.stage}
                          isActive={cell.isActive}
                          bullets={cell.stage === 6 ? 5 : undefined}
                        />
                      )}
                    </div>
                    {cell.isActive && (
                      <div className="absolute bottom-2 right-2">
                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              selectedCell === index ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${(cell.stage / 6) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleShoot}
          disabled={selectedPlayer === null || selectedCell === null}
          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${
            selectedPlayer !== null && selectedCell !== null
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Target className="w-5 h-5" />
          Shoot Selected Cell
        </button>
      </div>
    </div>
  );
};

export default ShootingModal;