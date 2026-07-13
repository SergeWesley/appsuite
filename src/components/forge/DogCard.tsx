import React from 'react';

interface DogCardProps {
  data?: {
    imageUrl?: string;
  };
}

export function DogCard({ data }: DogCardProps) {
  if (!data?.imageUrl) return null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 w-full max-w-sm overflow-hidden transition-all group shadow-sm mx-auto">
      <div className="relative w-full h-64 rounded-xl overflow-hidden bg-gray-100">
        <img 
          src={data.imageUrl} 
          alt="Un chien aléatoire" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-4 text-center">
        <h3 className="font-bold text-lg text-gray-900 leading-tight">
          Woof woof! 🐶
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Un adorable toutou généré aléatoirement.
        </p>
      </div>
    </div>
  );
}
