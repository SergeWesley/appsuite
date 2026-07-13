"use client";

import { Clock, BookOpen, Award } from "lucide-react";
import { TopBook } from "@/hooks/booker/useReadingAnalytics";

interface BookStatsCardProps {
  book: TopBook;
  rank: number;
}

export function BookStatsCard({ book, rank }: BookStatsCardProps) {
  // Fonction pour formater le temps
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`;
  };

  // Couleurs pour les rangs
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case 2:
        return "bg-gray-100 text-gray-700 border-gray-200";
      case 3:
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  // Icône pour le rang
  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Award size={12} />;
    }
    return null;
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      {/* Rang du livre */}
      <div className={`
        flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border-2
        ${getRankColor(rank)}
      `}>
        {getRankIcon(rank) || rank}
      </div>

      {/* Couverture du livre */}
      <div className="flex-shrink-0">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-12 h-16 object-cover rounded-md shadow-sm"
          />
        ) : (
          <div className="w-12 h-16 bg-gray-300 rounded-md flex items-center justify-center">
            <BookOpen size={16} className="text-gray-500" />
          </div>
        )}
      </div>

      {/* Informations du livre */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate" title={book.title}>
          {book.title}
        </div>
        <div className="text-sm text-gray-600 truncate" title={book.author}>
          {book.author}
        </div>
        
        {/* Statistiques de lecture */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <Clock size={12} />
            <span>{formatTime(book.totalReadingTime)}</span>
            <span className="text-gray-400">•</span>
            <span>{book.totalSessions} session{book.totalSessions > 1 ? 's' : ''}</span>
          </div>
          
          <div className="text-xs text-gray-500">
            Moyenne : {formatTime(book.averageSessionTime)} par session
          </div>
          
          {book.completionDate && (
            <div className="text-xs text-green-600">
              ✓ Terminé le {book.completionDate.toLocaleDateString("fr-FR")}
            </div>
          )}
        </div>
      </div>

      {/* Barre de progression visuelle */}
      <div className="flex-shrink-0 w-16">
        <div className="text-right text-xs text-gray-600 mb-1">
          {formatTime(book.totalReadingTime)}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`
              h-2 rounded-full transition-all duration-300
              ${rank === 1 ? "bg-yellow-500" : 
                rank === 2 ? "bg-gray-500" : 
                rank === 3 ? "bg-orange-500" : "bg-blue-500"}
            `}
            style={{
              width: "100%" // La barre est toujours pleine pour le livre avec le plus de temps
            }}
          />
        </div>
      </div>
    </div>
  );
}
