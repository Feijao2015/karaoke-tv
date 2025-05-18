-- Primeiro removemos as tabelas se existirem
DROP TABLE IF EXISTS public.queue CASCADE;
DROP TABLE IF EXISTS public.ranking CASCADE;

-- Habilita as extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Fila de Espera (queue)
CREATE TABLE public.queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    song_id TEXT NOT NULL,
    singer_name TEXT NOT NULL,
    queue_position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Validações
    CONSTRAINT unique_queue_position UNIQUE (queue_position)
);

-- Tabela de Ranking
CREATE TABLE public.ranking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    song_id TEXT NOT NULL,
    singer_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Validação da pontuação (0-100)
    CONSTRAINT valid_score CHECK (score >= 0 AND score <= 100)
);

-- Índices para otimização de performance
CREATE INDEX idx_queue_position ON public.queue(queue_position);
CREATE INDEX idx_queue_created_at ON public.queue(created_at);
CREATE INDEX idx_ranking_score ON public.ranking(score DESC, created_at DESC);
CREATE INDEX idx_ranking_singer ON public.ranking(singer_name);

-- Função para gerenciar a posição na fila automaticamente
CREATE OR REPLACE FUNCTION public.manage_queue_position()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Se não foi especificada uma posição, coloca no final da fila
        IF NEW.queue_position IS NULL THEN
            SELECT COALESCE(MAX(queue_position), 0) + 1
            INTO NEW.queue_position
            FROM public.queue;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        -- Atualiza as posições após uma remoção
        UPDATE public.queue
        SET queue_position = queue_position - 1
        WHERE queue_position > OLD.queue_position;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para gerenciar a fila
DROP TRIGGER IF EXISTS manage_queue_insert ON public.queue;
CREATE TRIGGER manage_queue_insert
    BEFORE INSERT ON public.queue
    FOR EACH ROW
    EXECUTE FUNCTION public.manage_queue_position();

DROP TRIGGER IF EXISTS manage_queue_delete ON public.queue;
CREATE TRIGGER manage_queue_delete
    AFTER DELETE ON public.queue
    FOR EACH ROW
    EXECUTE FUNCTION public.manage_queue_position();

-- Função para mover uma música na fila
CREATE OR REPLACE FUNCTION public.move_queue_item(
    p_song_id UUID,
    p_new_position INTEGER
)
RETURNS void AS $$
DECLARE
    v_old_position INTEGER;
BEGIN
    -- Obtém a posição atual
    SELECT queue_position INTO v_old_position
    FROM public.queue
    WHERE id = p_song_id;

    IF v_old_position IS NULL THEN
        RAISE EXCEPTION 'Música não encontrada na fila';
    END IF;

    IF p_new_position < 1 THEN
        RAISE EXCEPTION 'Nova posição deve ser maior que zero';
    END IF;

    -- Atualiza as posições dos outros itens
    IF p_new_position > v_old_position THEN
        UPDATE public.queue
        SET queue_position = queue_position - 1
        WHERE queue_position > v_old_position
        AND queue_position <= p_new_position;
    ELSE
        UPDATE public.queue
        SET queue_position = queue_position + 1
        WHERE queue_position >= p_new_position
        AND queue_position < v_old_position;
    END IF;

    -- Atualiza a posição do item movido
    UPDATE public.queue
    SET queue_position = p_new_position
    WHERE id = p_song_id;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular estatísticas do cantor
CREATE OR REPLACE FUNCTION public.get_singer_stats(p_singer_name TEXT)
RETURNS TABLE (
    total_songs BIGINT,
    average_score NUMERIC,
    highest_score INTEGER,
    lowest_score INTEGER,
    last_performance TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*),
        ROUND(AVG(score)::numeric, 2),
        MAX(score),
        MIN(score),
        MAX(created_at)
    FROM public.ranking
    WHERE singer_name = p_singer_name;
END;
$$ LANGUAGE plpgsql;

-- Habilita Row Level Security (RLS)
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking ENABLE ROW LEVEL SECURITY;

-- Remove políticas existentes
DROP POLICY IF EXISTS "Permitir leitura pública da fila" ON public.queue;
DROP POLICY IF EXISTS "Permitir inserção na fila" ON public.queue;
DROP POLICY IF EXISTS "Permitir atualização na fila" ON public.queue;
DROP POLICY IF EXISTS "Permitir remoção na fila" ON public.queue;
DROP POLICY IF EXISTS "Permitir leitura pública do ranking" ON public.ranking;
DROP POLICY IF EXISTS "Permitir inserção no ranking" ON public.ranking;

-- Políticas de segurança para queue
CREATE POLICY "Permitir leitura pública da fila"
    ON public.queue FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Permitir inserção na fila"
    ON public.queue FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Permitir atualização na fila"
    ON public.queue FOR UPDATE
    TO public
    USING (true);

CREATE POLICY "Permitir remoção na fila"
    ON public.queue FOR DELETE
    TO public
    USING (true);

-- Políticas de segurança para ranking
CREATE POLICY "Permitir leitura pública do ranking"
    ON public.ranking FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Permitir inserção no ranking"
    ON public.ranking FOR INSERT
    TO public
    WITH CHECK (true);

-- Dados iniciais de exemplo (opcional - remova em produção)
INSERT INTO public.queue (song_id, singer_name, queue_position) VALUES 
    ('song1', 'João', 1),
    ('song2', 'Maria', 2);

INSERT INTO public.ranking (song_id, singer_name, score) VALUES 
    ('song1', 'João', 85),
    ('song2', 'Maria', 92); 