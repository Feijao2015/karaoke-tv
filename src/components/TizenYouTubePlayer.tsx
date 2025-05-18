import React, { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';

interface TizenYouTubePlayerProps {
  videoId: string;
  onEnd?: () => void;
}

const TizenYouTubePlayer: React.FC<TizenYouTubePlayerProps> = ({ videoId, onEnd }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<any>(null);

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      // Tizen-optimized parameters
      autoplay: 1,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      enablejsapi: 1,
      origin: window.location.origin,
    },
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error('Error destroying player:', e);
        }
      }
    };
  }, []);

  const handleReady = (event: any) => {
    playerRef.current = event.target;
    setIsReady(true);
    setError(null);
  };

  const handleError = (event: any) => {
    console.error('YouTube Player Error:', event);
    setError('Error loading video. Please try again.');
    setIsReady(false);
  };

  const handleEnd = () => {
    onEnd?.();
  };

  return (
    <div className="relative w-full h-full bg-black">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-80">
          <p>{error}</p>
        </div>
      )}
      
      {!isReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-4 border-white rounded-full animate-spin"></div>
        </div>
      )}

      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={handleReady}
        onError={handleError}
        onEnd={handleEnd}
        className={`w-full h-full ${isReady ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

export default TizenYouTubePlayer; 