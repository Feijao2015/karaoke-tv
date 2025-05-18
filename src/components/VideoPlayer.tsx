import React, { useCallback, useEffect, useState } from 'react';
import { QueueSong } from '../types';
import { storageService } from '../services/storage';

// URL base do servidor de vídeos
const VIDEO_SERVER_URL = 'http://localhost:3001/videos';

interface VideoPlayerProps {
  currentSong: QueueSong | null;
  onVideoEnd: (score: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ currentSong, onVideoEnd }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Inicializa o serviço de storage quando o componente montar
    if (!storageService.isInitialized()) {
      storageService.initialize().catch(err => {
        console.error('Erro ao inicializar storage:', err);
        setError('Erro ao acessar os vídeos. Verifique se o dispositivo USB está conectado.');
      });
    }
  }, []);

  const handleVideoEnd = useCallback(() => {
    onVideoEnd(0); // Sem pontuação por enquanto
  }, [onVideoEnd]);

  const handleStop = useCallback(() => {
    onVideoEnd(0); // Sem pontuação por enquanto
  }, [onVideoEnd]);

  if (!currentSong) return null;

  // Formata o número da música com 5 dígitos (padding com zeros à esquerda)
  const videoFileName = currentSong.number.padStart(5, '0') + '.mp4';
  let videoPath;
  try {
    videoPath = storageService.getVideoPath(videoFileName);
  } catch (err) {
    console.error('Erro ao obter caminho do vídeo:', err);
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <p className="text-white text-xl text-center p-8">
          Erro ao carregar o vídeo. Verifique se o dispositivo USB está conectado.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <p className="text-white text-xl text-center p-8">{error}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <video
        src={videoPath}
        className="w-full h-full object-fill"
        autoPlay
        controls={false}
        onEnded={handleVideoEnd}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill'
        }}
      >
        <p className="text-white text-center p-4">
          Seu navegador não suporta a reprodução de vídeos.
        </p>
      </video>

      {/* Botão de parar flutuante */}
      <button
        onClick={handleStop}
        className="fixed top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center space-x-2 transition-colors duration-200"
        style={{ minWidth: '120px' }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M6 18L18 6M6 6l12 12" 
          />
        </svg>
        <span>Parar</span>
      </button>
    </div>
  );
}; 