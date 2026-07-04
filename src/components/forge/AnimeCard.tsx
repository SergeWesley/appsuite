import React from 'react';
import { ExternalLink } from 'lucide-react';

interface AnimeCardProps {
  data: {
    mal_id: number;
    url: string;
    title: string;
    synopsis: string;
    images?: {
      jpg?: {
        image_url: string;
      }
    }
  };
}

export function AnimeCard({ data }: AnimeCardProps) {
  if (!data) return null;

  const imageUrl = data.images?.jpg?.image_url;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm w-full max-w-sm overflow-hidden transition-all hover:shadow-md group">
      {imageUrl && (
        <div className="relative w-full h-64 mb-4 rounded-xl overflow-hidden bg-gray-100 shrink-0">
          <img 
            src={imageUrl} 
            alt={data.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="font-bold text-lg text-gray-900 leading-tight">
          {data.title}
        </h3>
        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-md border border-indigo-100 shrink-0 mt-1 uppercase tracking-wider">
          MAL #{data.mal_id}
        </span>
      </div>

      <p className="text-gray-500 text-sm line-clamp-4 mb-5 leading-relaxed">
        {data.synopsis || "Aucun synopsis disponible."}
      </p>

      {data.url && (
        <a 
          href={data.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          Voir sur MyAnimeList
          <ExternalLink size={16} />
        </a>
      )}
    </div>
  );
}
