import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase, TABLES } from '../config/supabase';
import React from 'react';
import { RankingItem } from '../types';

type RankingInsert = {
  song_id: string;
  singer_name: string;
  score: number;
};

export function useRankings() {
  const queryClient = useQueryClient();

  // Subscribe to real-time changes
  React.useEffect(() => {
    const subscription = supabase
      .channel('rankings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.RANKINGS,
        },
        () => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['rankings'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['rankings'],
    queryFn: async () => {
      const { data: rankingItems, error: rankingError } = await supabase
        .from(TABLES.RANKINGS)
        .select(`
          *,
          songs:song_id (
            id,
            number,
            title,
            artist,
            lyrics
          )
        `)
        .order('score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (rankingError) {
        throw new Error(`Error fetching rankings: ${rankingError.message}`);
      }

      // Transform the data to match our RankingItem type
      const rankingsWithInfo = rankingItems.map(item => ({
        ...item,
        number: item.songs.number,
        title: item.songs.title,
        artist: item.songs.artist,
        lyrics: item.songs.lyrics
      }));

      return rankingsWithInfo as RankingItem[];
    },
  });

  const addScore = useMutation({
    mutationFn: async (newScore: RankingInsert) => {
      const { data, error } = await supabase
        .from(TABLES.RANKINGS)
        .insert([newScore])
        .select()
        .single();

      if (error) {
        throw new Error(`Error adding score: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
    },
  });

  const getAverageScore = async (singerName: string) => {
    const { data, error } = await supabase
      .rpc('get_singer_average_score', { p_singer_name: singerName });

    if (error) {
      throw new Error(`Error getting average score: ${error.message}`);
    }

    return data[0];
  };

  return {
    rankings: data,
    isLoading,
    error,
    addScore,
    getAverageScore,
  };
} 