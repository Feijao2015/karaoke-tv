import React, { useEffect } from 'react';
import { ScoreAnimation as ScoreAnimationType } from '../types';

interface ScoreAnimationProps {
  score: ScoreAnimationType;
}

export const ScoreAnimation: React.FC<ScoreAnimationProps> = ({ score }) => {
  useEffect(() => {
    if (score.isVisible) {
      const timer = setTimeout(() => {
        score.isVisible = false;
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [score]);

  if (!score.isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="animate-bounce">
        <div className="text-8xl font-bold text-white">
          {score.score}
        </div>
      </div>
    </div>
  );
}; 