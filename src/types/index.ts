export { type Database } from '../config/supabase';

// Tipo base para uma música
export interface Song {
  id: string;
  number: string;
  title: string;
  artist: string;
  lyrics: string;
}

// Tipo para uma música na fila
export interface QueueSong {
  id: string;
  song_id: string;
  singer_name: string;
  queue_position: number;
  created_at: string;
  // Informações da música
  number: string;
  title: string;
  artist: string;
  lyrics: string;
}

// Tipo para um item no ranking
export interface RankingItem {
  id: string;
  song_id: string;
  singer_name: string;
  score: number;
  created_at: string;
  // Informações da música
  number: string;
  title: string;
  artist: string;
  lyrics: string;
}

// Tipo para animação de score
export interface ScoreAnimation {
  score: number;
  isVisible: boolean;
} 