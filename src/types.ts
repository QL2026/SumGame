export type GameMode = 'classic' | 'time';

export interface BlockData {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
}

export interface GameState {
  grid: (BlockData | null)[][];
  target: number;
  score: number;
  level: number;
  gameOver: boolean;
  selectedIds: string[];
  mode: GameMode;
  timeLeft: number;
  maxTime: number;
}

export const GRID_ROWS = 10;
export const GRID_COLS = 6;
export const INITIAL_ROWS = 4;
export const TARGET_MIN = 10;
export const TARGET_MAX = 20;
export const BLOCK_MIN = 1;
export const BLOCK_MAX = 9;
