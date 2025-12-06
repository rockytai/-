export interface Unit {
  id: number;
  title: string;
  content: string[];
}

export interface LevelProps {
  unit: Unit;
  onComplete: (score: number) => void;
  onBack: () => void;
  addCoins: (amount: number, combo: number) => void;
}

export type GameState = 
  | 'LOBBY' 
  | 'LEVEL_SELECT' 
  | 'PLAY_L1' 
  | 'PLAY_L2' 
  | 'PLAY_L3' 
  | 'PLAY_L4';

export interface LevelScores {
  l1: number;
  l2: number;
  l3: number;
  l4: number;
}

export interface UnitScores {
  [unitId: number]: LevelScores;
}

export interface CompletedStatus {
  [unitId: number]: {
    l1?: boolean;
    l2?: boolean;
    l3?: boolean;
    l4?: boolean;
  };
}