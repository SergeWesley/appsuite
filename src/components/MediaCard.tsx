'use client';

import { motion } from 'framer-motion';
import { Media, MediaStatus } from '@/types/media';
import { ProgressCircle } from './ProgressCircle';
import { Film, Star, Calendar, User, Edit2, Trash2, Play, Tv, Camera, Clock, Hash } from 'lucide-react';

interface MediaCardProps {
  media: Media;
  onEdit: (media: Media) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: MediaStatus) => void;
  onOpenTimer: (media: Media) => void;
}

const statusConfig = {
  watching: { label: 'En cours', color: 'status-watching' },
  completed: { label: 'Terminé', color: 'status-completed' },
  towatch: { label: 'À voir', color: 'status-towatch' },
  wishlist: { label: 'Souhait', color: 'status-wishlist' },
  dropped: { label: 'Abandonné', color: 'status-dropped' },
};

const typeConfig = {
  movie: { label: 'Film', icon: Film, color: 'text-blue-600' },
  series: { label: 'Série', icon: Tv, color: 'text-green-600' },
  anime: { label: 'Animé', icon: Play, color: 'text-pink-600' },
  documentary: { label: 'Documentaire', icon: Camera, color: 'text-orange-600' },
  short: { label: 'Court-métrage', icon: Clock, color: 'text-purple-600' },
};

export function MediaCard({ media, onEdit, onDelete, onStatusChange, onOpenTimer }: MediaCardProps) {
  const status = statusConfig[media.status];
  const type = typeConfig[media.type];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''}`;
    }
    return `${remainingMinutes}min`;
  };

  const getProgressInfo = () => {
    if (media.type === 'movie') {
      return media.duration ? `${formatDuration(media.duration)}` : null;
    } else {
      // Pour les séries/animés
      let info = '';
      if (media.currentEpisode && media.totalEpisodes) {
        info = `Ép. ${media.currentEpisode}/${media.totalEpisodes}`;
      } else if (media.totalEpisodes) {
        info = `${media.totalEpisodes} épisodes`;
      }
      
      if (media.currentSeason && media.totalSeasons) {
        info += ` - S${media.currentSeason}/${media.totalSeasons}`;
      } else if (media.totalSeasons) {
        info += ` - ${media.totalSeasons} saisons`;
      }
      
      return info || null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className="media-card h-full p-6 cursor-pointer group relative overflow-hidden"
      onClick={() => onEdit(media)}
    >
      {/* Badge de type */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white shadow-sm ${type.color}`}>
          <type.icon size={12} className="mr-1" />
          {type.label}
        </span>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {/* Poster */}
          {media.posterUrl && (
            <div className="mb-4">
              <img
                src={media.posterUrl}
                alt={`Poster de ${media.title}`}
                className="w-16 h-24 object-cover rounded-lg shadow-md flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = '/fallback-poster.svg';
                }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
              {media.title}
            </h3>
            {media.originalTitle && media.originalTitle !== media.title && (
              <p className="text-sm text-gray-500 truncate mb-1">
                {media.originalTitle}
              </p>
            )}
            
            {/* Réalisateur/Créateur/Studio */}
            {(media.director || media.creator || media.studio) && (
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1 truncate">
                <User size={14} />
                {media.director || media.creator || media.studio}
              </p>
            )}
            
            {/* Année */}
            {media.year && (
              <p className="text-xs text-gray-500 mt-1">
                {media.year}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={`status-badge ${status.color}`}>
          {status.label}
        </span>
        
        <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenTimer(media);
            }}
            className="p-1 text-gray-400 hover:text-purple-500 transition-colors"
            title="Démarrer une session"
          >
            <Play size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(media);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(media.id);
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {/* Info de progression */}
            {getProgressInfo() && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{getProgressInfo()}</span>
              </div>
            )}
            
            {/* Note */}
            {media.rating && (
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span>{media.rating}/5</span>
              </div>
            )}
            
            {/* Date d'ajout */}
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(media.dateAdded)}</span>
            </div>
          </div>
          
          {/* Genre */}
          {media.genre && (
            <p className="text-xs text-gray-500 mt-2">
              {media.genre}
            </p>
          )}
          
          {/* IDs externes */}
          {(media.imdbId || media.tmdbId) && (
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
              {media.imdbId && (
                <span className="flex items-center gap-1">
                  <Hash size={10} />
                  IMDb: {media.imdbId}
                </span>
              )}
              {media.tmdbId && (
                <span className="flex items-center gap-1">
                  <Hash size={10} />
                  TMDB: {media.tmdbId}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="ml-4">
          <ProgressCircle progress={media.progress} size={50} strokeWidth={3} />
        </div>
      </div>

      {/* Notes */}
      {media.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 line-clamp-2">
            {media.notes}
          </p>
        </div>
      )}
    </motion.div>
  );
}
