-- Habilita a extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenta habilitar a extensão pg_cron (pode não estar disponível em todos os planos do Supabase)
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "pg_cron";
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Não foi possível habilitar pg_cron. O agendamento automático não estará disponível.';
END $$;

-- Tabela de músicas na fila
CREATE TABLE IF NOT EXISTS public.queue_songs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    singer_name TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    queue_position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Validações
    CONSTRAINT valid_youtube_url CHECK (youtube_url ~* '^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$'),
    CONSTRAINT unique_queue_position UNIQUE (queue_position)
);

-- Tabela de classificações
CREATE TABLE IF NOT EXISTS public.rankings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    singer_name TEXT NOT NULL,
    song_title TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Validações
    CONSTRAINT valid_score CHECK (score >= 0 AND score <= 100)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_queue_songs_position ON public.queue_songs(queue_position);
CREATE INDEX IF NOT EXISTS idx_queue_songs_created_at ON public.queue_songs(created_at);
CREATE INDEX IF NOT EXISTS idx_rankings_score ON public.rankings(score DESC);
CREATE INDEX IF NOT EXISTS idx_rankings_singer_name ON public.rankings(singer_name);

-- Habilita Row Level Security (RLS)
ALTER TABLE public.queue_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- Remove políticas existentes
DROP POLICY IF EXISTS "Permitir leitura pública da fila" ON public.queue_songs;
DROP POLICY IF EXISTS "Permitir inserção na fila" ON public.queue_songs;
DROP POLICY IF EXISTS "Permitir deleção na fila" ON public.queue_songs;
DROP POLICY IF EXISTS "Permitir leitura pública das classificações" ON public.rankings;
DROP POLICY IF EXISTS "Permitir inserção nas classificações" ON public.rankings;

-- Políticas de segurança para queue_songs
CREATE POLICY "Permitir leitura pública da fila"
    ON public.queue_songs
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Permitir inserção na fila"
    ON public.queue_songs
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Permitir deleção na fila"
    ON public.queue_songs
    FOR DELETE
    TO public
    USING (true);

-- Políticas de segurança para rankings
CREATE POLICY "Permitir leitura pública das classificações"
    ON public.rankings
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Permitir inserção nas classificações"
    ON public.rankings
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Função para limpar músicas antigas da fila (mais de 24 horas)
CREATE OR REPLACE FUNCTION public.cleanup_old_queue_songs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.queue_songs
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Função para calcular a média de pontuação por cantor
CREATE OR REPLACE FUNCTION public.get_singer_average_score(p_singer_name TEXT)
RETURNS TABLE (
    singer_name TEXT,
    average_score NUMERIC,
    total_songs BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.singer_name,
        ROUND(AVG(r.score)::numeric, 2) as average_score,
        COUNT(*) as total_songs
    FROM public.rankings r
    WHERE r.singer_name = p_singer_name
    GROUP BY r.singer_name;
END;
$$;

-- Função para obter o ranking geral
CREATE OR REPLACE FUNCTION public.get_overall_ranking()
RETURNS TABLE (
    singer_name TEXT,
    total_songs BIGINT,
    average_score NUMERIC,
    highest_score INTEGER,
    lowest_score INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.singer_name,
        COUNT(*) as total_songs,
        ROUND(AVG(r.score)::numeric, 2) as average_score,
        MAX(r.score) as highest_score,
        MIN(r.score) as lowest_score
    FROM public.rankings r
    GROUP BY r.singer_name
    ORDER BY average_score DESC;
END;
$$;

-- Limpa dados existentes (opcional - remova estas linhas se quiser manter os dados)
TRUNCATE public.queue_songs CASCADE;
TRUNCATE public.rankings CASCADE;

-- Inserir alguns dados de exemplo
INSERT INTO public.queue_songs (title, singer_name, youtube_url)
VALUES 
    ('Evidências', 'Chitãozinho & Xororó', 'https://www.youtube.com/watch?v=ePjtnSPFWK8'),
    ('Garçom', 'Reginaldo Rossi', 'https://www.youtube.com/watch?v=xk2dKAZoZqk');

INSERT INTO public.rankings (singer_name, song_title, score)
VALUES 
    ('João', 'Evidências', 85),
    ('Maria', 'Garçom', 92); 