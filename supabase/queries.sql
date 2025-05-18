-- Consulta para ver a fila de espera (queue)
SELECT 
    id,
    song_id,
    singer_name,
    queue_position,
    created_at
FROM public.queue
ORDER BY queue_position ASC;

-- Consulta para ver o ranking completo
SELECT 
    id,
    song_id,
    singer_name,
    score,
    created_at
FROM public.ranking
ORDER BY score DESC, created_at DESC;

-- Consulta para ver apenas o TOP 5 do ranking
SELECT 
    id,
    song_id,
    singer_name,
    score,
    created_at
FROM public.ranking
ORDER BY score DESC, created_at DESC
LIMIT 5;

-- Consulta para ver estatísticas por cantor
SELECT 
    singer_name,
    COUNT(*) as total_performances,
    ROUND(AVG(score)::numeric, 2) as media_pontuacao,
    MAX(score) as maior_pontuacao,
    MIN(score) as menor_pontuacao
FROM public.ranking
GROUP BY singer_name
ORDER BY media_pontuacao DESC; 