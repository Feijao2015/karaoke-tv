import { createClient } from '@supabase/supabase-js';

// URL do projeto Supabase
const supabaseUrl = 'https://drufkqjxtgexpbwkwbti.supabase.co';

// Chave anônima do Supabase (deve vir do .env)
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase anon key. Please check your .env file.');
}

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Constantes para nomes das tabelas
export const TABLES = {
  QUEUE: 'queue',
  RANKINGS: 'ranking',
} as const;

// Tipos para as tabelas do Supabase
export type Database = {
  public: {
    Tables: {
      queue: {
        Row: {
          id: string;
          song_id: string;
          singer_name: string;
          queue_position: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['queue']['Row'], 'id' | 'created_at'>;
      };
      ranking: {
        Row: {
          id: string;
          song_id: string;
          singer_name: string;
          score: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ranking']['Row'], 'id' | 'created_at'>;
      };
    };
  };
}; 