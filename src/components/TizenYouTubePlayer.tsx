import React, { useEffect, useRef, useState } from 'react';

interface TizenYouTubePlayerProps {
  videoId: string;
  onEnd?: () => void;
}

const TizenYouTubePlayer: React.FC<TizenYouTubePlayerProps> = ({ videoId, onEnd }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Simple approach using direct iframe
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&enablejsapi=0&rel=0&showinfo=0`;
    
    if (iframeRef.current) {
      iframeRef.current.src = embedUrl;
    }

    // Basic message handling for video end
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'videoEnded') {
        onEnd?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [videoId, onEnd]);

  return (
    <div className="relative w-full h-full bg-black">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-80">
          <p>{error}</p>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        className="w-full h-full"
        frameBorder="0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        onError={() => setError('Error loading video. Please try again.')}
        onLoad={() => setIsReady(true)}
      />
    </div>
  );
};

export default TizenYouTubePlayer; 