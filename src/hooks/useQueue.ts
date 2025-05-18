import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase, TABLES } from '../config/supabase';
import React from 'react';
import { QueueSong } from '../types';

type QueueSongInsert = {
  song_id: string;
  singer_name: string;
  queue_position?: number;
};

export function useQueue() {
  const queryClient = useQueryClient();

  // Subscribe to real-time changes
  React.useEffect(() => {
    const subscription = supabase
      .channel('queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.QUEUE,
        },
        () => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['queue'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['queue'],
    queryFn: async () => {
      const { data: queueItems, error: queueError } = await supabase
        .from(TABLES.QUEUE)
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
        .order('queue_position', { ascending: true });

      if (queueError) {
        throw new Error(`Error fetching queue: ${queueError.message}`);
      }

      // Transform the data to match our QueueSong type
      const songsWithInfo = queueItems.map(item => ({
        ...item,
        number: item.songs.number,
        title: item.songs.title,
        artist: item.songs.artist,
        lyrics: item.songs.lyrics
      }));

      return songsWithInfo as QueueSong[];
    },
  });

  const addToQueue = useMutation({
    mutationFn: async (newSong: QueueSongInsert) => {
      const { data, error } = await supabase
        .from(TABLES.QUEUE)
        .insert([newSong])
        .select()
        .single();

      if (error) {
        throw new Error(`Error adding song to queue: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });

  return {
    queue: data,
    isLoading,
    error,
    addToQueue,
  };
} 