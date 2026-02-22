import { useState, useEffect, useCallback, useRef } from 'react';
import { BlockData, GameMode, GameState, GRID_COLS, GRID_ROWS, INITIAL_ROWS, TARGET_MAX, TARGET_MIN, BLOCK_MAX, BLOCK_MIN } from '../types';
import confetti from 'canvas-confetti';

const generateId = () => Math.random().toString(36).substr(2, 9);

const generateValue = () => Math.floor(Math.random() * (BLOCK_MAX - BLOCK_MIN + 1)) + BLOCK_MIN;

const createEmptyGrid = () => Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null));

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>({
    grid: createEmptyGrid(),
    target: 10,
    score: 0,
    level: 1,
    gameOver: false,
    selectedIds: [],
    mode: 'classic',
    timeLeft: 10,
    maxTime: 10,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateTarget = useCallback(() => {
    return Math.floor(Math.random() * (TARGET_MAX - TARGET_MIN + 1)) + TARGET_MIN;
  }, []);

  const initGame = useCallback((mode: GameMode) => {
    const newGrid = createEmptyGrid();
    // Fill initial rows from bottom
    for (let r = GRID_ROWS - 1; r >= GRID_ROWS - INITIAL_ROWS; r--) {
      for (let c = 0; c < GRID_COLS; c++) {
        newGrid[r][c] = {
          id: generateId(),
          value: generateValue(),
          row: r,
          col: c,
        };
      }
    }

    setGameState({
      grid: newGrid,
      target: Math.floor(Math.random() * (TARGET_MAX - TARGET_MIN + 1)) + TARGET_MIN,
      score: 0,
      level: 1,
      gameOver: false,
      selectedIds: [],
      mode,
      timeLeft: 10,
      maxTime: 10,
    });
  }, []);

  const addNewRow = useCallback(() => {
    setGameState(prev => {
      // Check if top row has blocks
      if (prev.grid[0].some(cell => cell !== null)) {
        return { ...prev, gameOver: true };
      }

      const newGrid = prev.grid.map((row, r) => {
        if (r === 0) return Array(GRID_COLS).fill(null);
        return prev.grid[r - 1].map(cell => cell ? { ...cell, row: r } : null);
      });

      // Add new row at bottom
      const bottomRow = GRID_ROWS - 1;
      for (let c = 0; c < GRID_COLS; c++) {
        newGrid[bottomRow][c] = {
          id: generateId(),
          value: generateValue(),
          row: bottomRow,
          col: c,
          isNew: true,
        };
      }

      return { ...prev, grid: newGrid };
    });
  }, []);

  const handleBlockClick = (id: string) => {
    if (gameState.gameOver) return;

    setGameState(prev => {
      const isSelected = prev.selectedIds.includes(id);
      let newSelectedIds: string[];

      if (isSelected) {
        newSelectedIds = prev.selectedIds.filter(sid => sid !== id);
      } else {
        newSelectedIds = [...prev.selectedIds, id];
      }

      // Calculate sum
      const sum = newSelectedIds.reduce((acc, sid) => {
        const block = prev.grid.flat().find(b => b?.id === sid);
        return acc + (block?.value || 0);
      }, 0);

      if (sum === prev.target) {
        // Success!
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7']
        });

        const newGrid = prev.grid.map(row => 
          row.map(cell => cell && newSelectedIds.includes(cell.id) ? null : cell)
        );

        // Apply gravity
        for (let c = 0; c < GRID_COLS; c++) {
          let emptyRow = GRID_ROWS - 1;
          for (let r = GRID_ROWS - 1; r >= 0; r--) {
            if (newGrid[r][c]) {
              const block = newGrid[r][c]!;
              newGrid[r][c] = null;
              newGrid[emptyRow][c] = { ...block, row: emptyRow };
              emptyRow--;
            }
          }
        }

        const newScore = prev.score + (newSelectedIds.length * 10);
        const newTarget = Math.floor(Math.random() * (TARGET_MAX - TARGET_MIN + 1)) + TARGET_MIN;
        
        // In classic mode, add a row on success
        if (prev.mode === 'classic') {
          setTimeout(addNewRow, 300);
        }

        return {
          ...prev,
          grid: newGrid,
          selectedIds: [],
          score: newScore,
          target: newTarget,
          timeLeft: prev.maxTime, // Reset timer in time mode
        };
      } else if (sum > prev.target) {
        // Over sum, reset selection
        return { ...prev, selectedIds: [] };
      }

      return { ...prev, selectedIds: newSelectedIds };
    });
  };

  // Timer logic for Time Mode
  useEffect(() => {
    if (gameState.mode === 'time' && !gameState.gameOver) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 0) {
            addNewRow();
            return { ...prev, timeLeft: prev.maxTime };
          }
          return { ...prev, timeLeft: prev.timeLeft - 0.1 };
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.mode, gameState.gameOver, addNewRow]);

  return {
    gameState,
    initGame,
    handleBlockClick,
    addNewRow,
  };
}
