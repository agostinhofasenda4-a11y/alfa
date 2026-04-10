export interface AlphaItem { l:string; n:string; e:string; c:string; tip:string; }
export interface NumberItem { n:number; w:string; e:string; c:string; }
export interface Mascot     { e:string; name:string; }
export type ExerciseType = 'word' | 'math' | 'sequence';
export interface ExerciseItem {
  type: ExerciseType;
  question?: string;
  answer: string;
  options: string[];
  emoji: string;
  word?: string;
  missingIndex?: number;
}
export type Page = 'home' | 'alphabet' | 'numbers' | 'quiz' | 'paint' | 'exercises';
