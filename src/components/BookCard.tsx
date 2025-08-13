'use client';

import { motion } from 'framer-motion';
import { Book, BookStatus } from '@/types/book';
import { ProgressCircle } from './ProgressCircle';
import { useTimer } from '@/hooks/useTimer';
import { BookOpen, Star, Calendar, User, Edit2, Trash2, Timer } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: BookStatus) => void;
  onOpenTimer: (book: Book) => void;
}

const statusConfig = {
  reading: { label: 'En cours', color: 'status-reading' },
  completed: { label: 'Terminé', color: 'status-completed' },
  toread: { label: 'À lire', color: 'status-toread' },
};

export function BookCard({ book, onEdit, onDelete, onStatusChange, onOpenTimer }: BookCardProps) {
  const status = statusConfig[book.status];
  const { isTimerActive, getFormattedTime } = useTimer();
  const hasActiveTimer = isTimerActive(book.id);
  const currentTime = getFormattedTime(book.id);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
    //   className="book-card p-6 cursor-pointer group"
      className={`book-card p-6 cursor-pointer group relative overflow-hidden ${
        hasActiveTimer ? 'ring-2 ring-green-500 ring-opacity-50' : ''
      }`}
      onClick={() => onEdit(book)}
    >

      {/* Indicateur de session active */}
      {hasActiveTimer && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 text-xs font-medium flex items-center gap-2 z-10"
        >
          <Timer size={12} className="animate-pulse" />
          <span>Session en cours: {currentTime}</span>
          <div className="ml-auto flex">
            <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-white rounded-full animate-pulse ml-1" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-1 h-1 bg-white rounded-full animate-pulse ml-1" style={{ animationDelay: '1s' }}></div>
          </div>
        </motion.div>
      )}
    
      <div className={hasActiveTimer ? 'pt-8' : ''}></div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 min-w-0">
            {/* Si on a une couverture */}
            {book.coverUrl && (
                <div className="mb-4">
                <img
                    src={book.coverUrl}
                    alt={`Couverture de ${book.title}`}
                    className="w-12 h-16 object-cover rounded-lg shadow-md flex-shrink-0"
                />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {book.title}
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <User size={14} />
                    {book.author}
                </p>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <span className={`status-badge ${status.color}`}>
        {status.label}
        </span>
        
        <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenTimer(book);
            }}
            className={`p-1 transition-colors ${
              hasActiveTimer
                ? 'text-green-500 hover:text-green-600'
                : 'text-gray-400 hover:text-green-500'
            }`}
            title={hasActiveTimer ? 'Gérer la session en cours' : 'Démarrer une session'}
          >
            <Timer size={16} className={hasActiveTimer ? 'animate-pulse' : ''} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(book);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => {
            e.stopPropagation();
            onDelete(book.id);
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
            {book.currentPage && book.totalPages && (
              <div className="flex items-center gap-1">
                <BookOpen size={14} />
                <span>{book.currentPage}/{book.totalPages}</span>
              </div>
            )}
            
            {book.rating && (
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span>{book.rating}/5</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(book.dateAdded)}</span>
            </div>
          </div>
          
          {book.genre && (
            <p className="text-xs text-gray-500 mt-2">
              {book.genre}
            </p>
          )}
        </div>
        
        <div className="ml-4">
          <ProgressCircle progress={book.progress} size={50} strokeWidth={3} />
        </div>
      </div>

      {book.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 line-clamp-2">
            {book.notes}
          </p>
        </div>
      )}
    </motion.div>
  );
}
