import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VideoPlayer } from './components/VideoPlayer';
import { QueueList } from './components/QueueList';
import { RankingList } from './components/RankingList';
import { useQueue } from './hooks/useQueue';
import { useRankings } from './hooks/useRankings';
import { QueueSong } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
      <strong className="font-bold">Erro! </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );
}

function KaraokeApp() {
  const [currentSong, setCurrentSong] = useState<QueueSong | null>(null);
  const { queue, isLoading: isLoadingQueue, error: queueError } = useQueue();
  const { rankings, isLoading: isLoadingRankings, error: rankingsError } = useRankings();

  const handlePlaySong = (song: QueueSong) => {
    setCurrentSong(song);
  };

  const handleVideoEnd = () => {
    setCurrentSong(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 safe-area">
      <div className="container mx-auto px-4">
        <header className="py-8">
          <h1 className="text-5xl font-bold text-center text-gray-900">Karaokê TV</h1>
        </header>
        
        {(queueError || rankingsError) && (
          <div className="mb-8 space-y-4">
            {queueError && <ErrorMessage message="Erro ao carregar a fila de músicas. Tentando reconectar..." />}
            {rankingsError && <ErrorMessage message="Erro ao carregar as classificações. Tentando reconectar..." />}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seção do Player e Fila */}
          <div className="space-y-8">
            <section className="card">
              <h2 className="text-3xl font-bold mb-6">Reprodutor</h2>
              <VideoPlayer
                currentSong={currentSong}
                onVideoEnd={handleVideoEnd}
              />
            </section>

            <section className="card">
              <h2 className="text-3xl font-bold mb-6">Fila de Músicas</h2>
              {isLoadingQueue ? (
                <LoadingSpinner />
              ) : (
                <QueueList
                  songs={queue}
                  currentSong={currentSong}
                  onPlaySong={handlePlaySong}
                  isLoading={isLoadingQueue}
                />
              )}
            </section>
          </div>

          {/* Seção de Classificações */}
          <section className="card">
            <h2 className="text-3xl font-bold mb-6">Classificações</h2>
            {isLoadingRankings ? (
              <LoadingSpinner />
            ) : (
              <RankingList
                rankings={rankings}
                isLoading={isLoadingRankings}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <KaraokeApp />
    </QueryClientProvider>
  );
}
