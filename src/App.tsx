/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  Play, 
  Timer, 
  Zap, 
  ChevronRight,
  Info,
  X
} from 'lucide-react';
import { useGameLogic } from './hooks/useGameLogic';
import { GRID_COLS, GRID_ROWS } from './types';
import { cn } from './utils';

export default function App() {
  const { gameState, initGame, handleBlockClick } = useGameLogic();
  const [showMenu, setShowMenu] = useState(true);
  const [showHowTo, setShowHowTo] = useState(false);

  const startGame = (mode: 'classic' | 'time') => {
    initGame(mode);
    setShowMenu(false);
  };

  const currentSum = gameState.selectedIds.reduce((acc, id) => {
    const block = gameState.grid.flat().find(b => b?.id === id);
    return acc + (block?.value || 0);
  }, 0);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0a0a] overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-20" />

      {/* Header */}
      {!showMenu && (
        <div className="w-full max-w-md mb-6 flex flex-col gap-4 z-10">
          <div className="flex justify-between items-center px-2">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Score</span>
              <span className="text-2xl font-bold font-mono text-emerald-500 tabular-nums">
                {gameState.score.toString().padStart(6, '0')}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Mode</span>
              <span className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                {gameState.mode}
              </span>
            </div>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 flex items-center justify-between shadow-2xl">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono mb-1">Target</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black font-mono text-white tracking-tighter">
                  {gameState.target}
                </span>
              </div>
            </div>

            <div className="h-16 w-px bg-zinc-800 mx-4" />

            <div className="flex flex-col items-end flex-1">
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono mb-1">Current Sum</span>
              <div className="flex items-center gap-3">
                <div className="flex flex-wrap gap-1 justify-end max-w-[120px]">
                  {gameState.selectedIds.map(id => {
                    const block = gameState.grid.flat().find(b => b?.id === id);
                    return (
                      <span key={id} className="text-xs font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        {block?.value}
                      </span>
                    );
                  })}
                </div>
                <span className={cn(
                  "text-4xl font-black font-mono tracking-tighter transition-colors",
                  currentSum > gameState.target ? "text-red-500" : "text-emerald-400"
                )}>
                  {currentSum}
                </span>
              </div>
            </div>
          </div>

          {gameState.mode === 'time' && (
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={false}
                animate={{ width: `${(gameState.timeLeft / gameState.maxTime) * 100}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
          )}
        </div>
      )}

      {/* Game Board */}
      {!showMenu && (
        <div 
          className="relative bg-zinc-900/50 border-2 border-zinc-800 rounded-xl p-2 shadow-inner z-10"
          style={{
            width: `calc(${GRID_COLS} * 3.5rem + 1rem)`,
            height: `calc(${GRID_ROWS} * 3.5rem + 1rem)`,
          }}
        >
          <div className="grid grid-cols-6 gap-1 h-full">
            {gameState.grid.map((row, r) => (
              row.map((block, c) => (
                <div 
                  key={`${r}-${c}`} 
                  className="w-14 h-14 rounded-lg border border-zinc-800/50 bg-zinc-950/30"
                >
                  <AnimatePresence mode="popLayout">
                    {block && (
                      <motion.button
                        layoutId={block.id}
                        initial={block.isNew ? { scale: 0, opacity: 0, y: 50 } : false}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBlockClick(block.id)}
                        className={cn(
                          "w-full h-full flex items-center justify-center rounded-lg text-xl font-bold font-mono transition-all duration-200 shadow-lg",
                          gameState.selectedIds.includes(block.id)
                            ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20"
                            : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                        )}
                        style={{
                          borderWidth: '1px',
                        }}
                      >
                        {block.value}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              ))
            ))}
          </div>

          {/* Danger Zone Indicator */}
          <div className="absolute top-0 left-0 w-full h-14 border-b border-red-500/20 bg-red-500/5 pointer-events-none rounded-t-xl" />
        </div>
      )}

      {/* Menu Overlay */}
      {showMenu && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-50 flex flex-col items-center text-center max-w-sm w-full"
        >
          <div className="mb-8 relative">
            <div className="absolute -inset-4 bg-emerald-500/20 blur-3xl rounded-full glow-effect" />
            <h1 className="text-6xl font-black font-mono tracking-tighter text-white relative">
              SUM<span className="text-emerald-500">STACK</span>
            </h1>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] mt-2">The Math Survival Game</p>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full">
            <button 
              onClick={() => startGame('classic')}
              className="group relative bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-left hover:border-emerald-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                  <Zap size={24} />
                </div>
                <ChevronRight className="text-zinc-700 group-hover:text-emerald-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white">Classic Mode</h3>
              <p className="text-sm text-zinc-500">Clear blocks to survive. New rows added on every success.</p>
            </button>

            <button 
              onClick={() => startGame('time')}
              className="group relative bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-left hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <Timer size={24} />
                </div>
                <ChevronRight className="text-zinc-700 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white">Time Mode</h3>
              <p className="text-sm text-zinc-500">Race against the clock. New rows added every 10 seconds.</p>
            </button>
          </div>

          <button 
            onClick={() => setShowHowTo(true)}
            className="mt-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-mono uppercase tracking-widest"
          >
            <Info size={16} />
            How to Play
          </button>
        </motion.div>
      )}

      {/* Game Over Overlay */}
      {gameState.gameOver && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
        >
          <div className="text-center max-w-xs w-full">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <Trophy size={40} />
            </div>
            <h2 className="text-4xl font-black font-mono text-white mb-2">GAME OVER</h2>
            <p className="text-zinc-500 mb-8">You reached the top! Your math skills were tested.</p>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
              <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono">Final Score</span>
              <div className="text-4xl font-black font-mono text-emerald-500 mt-1">
                {gameState.score}
              </div>
            </div>

            <button 
              onClick={() => setShowMenu(true)}
              className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
            >
              <RotateCcw size={20} />
              Try Again
            </button>
          </div>
        </motion.div>
      )}

      {/* How To Play Modal */}
      <AnimatePresence>
        {showHowTo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full relative"
            >
              <button 
                onClick={() => setShowHowTo(false)}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Info className="text-emerald-500" />
                How to Play
              </h2>

              <ul className="space-y-4 text-zinc-400">
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0 font-bold text-xs">1</div>
                  <p>Click blocks to select them. Their values will be added together.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0 font-bold text-xs">2</div>
                  <p>Match the <span className="text-white font-bold">Target Number</span> shown at the top to clear the selected blocks.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0 font-bold text-xs">3</div>
                  <p>Blocks don't need to be adjacent. Pick them from anywhere!</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center flex-shrink-0 font-bold text-xs">4</div>
                  <p>Don't let the blocks reach the <span className="text-red-500 font-bold">top row</span>, or it's game over.</p>
                </li>
              </ul>

              <button 
                onClick={() => setShowHowTo(false)}
                className="w-full mt-8 bg-zinc-800 text-white font-bold py-4 rounded-xl hover:bg-zinc-700 transition-colors"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Controls */}
      {!showMenu && !gameState.gameOver && (
        <div className="mt-8 flex items-center gap-4 z-10">
          <button 
            onClick={() => setShowMenu(true)}
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-colors"
            title="Back to Menu"
          >
            <RotateCcw size={20} />
          </button>
          <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
            Level {gameState.level}
          </div>
        </div>
      )}
    </div>
  );
}
