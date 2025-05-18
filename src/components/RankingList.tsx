import React from 'react';
import { RankingItem } from '../types';

interface RankingListProps {
  rankings: RankingItem[];
  isLoading: boolean;
}

export const RankingList: React.FC<RankingListProps> = ({ rankings, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-3xl text-gray-500">Carregando classificações...</div>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-3xl text-gray-500">Nenhuma pontuação registrada</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rankings.map((ranking, index) => (
        <div
          key={ranking.id}
          className={`card transition-all duration-200 ${
            index === 0 ? 'border-2 border-yellow-500 bg-yellow-50' : 'hover:shadow-xl'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={`text-2xl font-bold mb-2 truncate ${
                index === 0 ? 'text-yellow-600' :
                index === 1 ? 'text-gray-600' :
                index === 2 ? 'text-orange-600' : 'text-blue-600'
              }`}>{ranking.singer_name}</h3>
              <p className="text-xl text-gray-700 truncate">
                {ranking.title} • {ranking.artist}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`text-4xl font-bold ${
                index === 0 ? 'text-yellow-500' :
                index === 1 ? 'text-gray-500' :
                index === 2 ? 'text-orange-500' : 'text-blue-500'
              }`}>
                {ranking.score}
              </div>
              {index < 3 && (
                <div className="text-4xl">
                  {index === 0 && '🏆'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                </div>
              )}
            </div>
          </div>
          {index === 0 && (
            <div className="mt-4 pt-4 border-t border-yellow-200">
              <p className="text-yellow-700 font-semibold">
                Melhor pontuação até agora! 🎉
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}; 