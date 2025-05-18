import React from 'react';
import { QueueSong } from '../types';

interface QueueListProps {
  songs: QueueSong[];
  currentSong: QueueSong | null;
  onPlaySong: (song: QueueSong) => void;
  isLoading: boolean;
}

export const QueueList: React.FC<QueueListProps> = ({
  songs,
  currentSong,
  onPlaySong,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-3xl text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-3xl text-gray-500">Nenhuma música na fila</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {songs.map((song) => (
        <div
          key={song.id}
          className={`card transition-all duration-200 ${
            currentSong?.id === song.id
              ? 'border-2 border-blue-500 bg-blue-50'
              : 'hover:shadow-xl'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold mb-2 truncate text-blue-600">{song.singer_name}</h3>
              <p className="text-xl text-gray-700 truncate">
                {song.title} • {song.artist}
              </p>
            </div>
            <button
              onClick={() => onPlaySong(song)}
              disabled={currentSong?.id === song.id}
              className={`btn ml-4 ${
                currentSong?.id === song.id
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'btn-primary'
              }`}
              aria-label={`${song.singer_name} cantando ${song.title} - ${song.artist}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}; 