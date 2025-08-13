'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, CheckCircle, Clock, Search, Filter, LogOut, User } from 'lucide-react';
import { useAuthContext } from '@/components/AuthProvider';
import { useBooksWithSessions } from '@/hooks/useBooksWithSessions';
import { Book, BookStatus, BookFormData } from '@/types/book';
import { BookCard } from '@/components/BookCard';
import { BookForm } from '@/components/BookForm';
import { Stats } from '@/components/Stats';
import { ReadingTimer } from '@/components/ReadingTimer';

export default function Home() {
  const {
    books,
    loading,
    error,
    addBook,
    updateBook,
    deleteBook,
    getStats,
    refreshBooks,
    formatDuration,
    getBookStats,
    stopSession
  } = useBooksWithSessions();
  const { user, signOut } = useAuthContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<BookStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timerBook, setTimerBook] = useState<Book | undefined>(undefined);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const stats = getStats();

  const handleAddBook = (data: BookFormData) => {
    addBook(data);
  };

  const handleEditBook = (data: BookFormData) => {
    if (editingBook) {
      updateBook(editingBook.id, data);
    }
  };

  const handleDeleteBook = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
      deleteBook(id);
    }
  };

  const handleStatusChange = (id: string, status: BookStatus) => {
    updateBook(id, { status });
  };

  const openForm = (book?: Book) => {
    setEditingBook(book || undefined);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingBook(undefined);
  };

  const handleSubmit = (data: BookFormData) => {
    if (editingBook) {
      handleEditBook(data);
    } else {
      handleAddBook(data);
    }
  };

  const openTimer = (book: Book) => {
    setTimerBook(book);
    setIsTimerOpen(true);
  };

  const closeTimer = () => {
    setIsTimerOpen(false);
    setTimerBook(undefined);
  };

  const handleSessionStopped = async () => {
    // Rafraîchir les livres quand une session se termine
    console.log('🔄 Session terminée, rafraîchissement des livres...');
    console.log('📚 Livres avant rafraîchissement:', books.find(b => b.id === timerBook?.id));

    await refreshBooks();

    // Vérifier après rafraîchissement
    setTimeout(() => {
      console.log('📚 Livres après rafraîchissement:', books.find(b => b.id === timerBook?.id));
    }, 100);
  };

  // Filtrer les livres
  const filteredBooks = books.filter(book => {
    const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (book.genre && book.genre.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const statusFilters = [
    { value: 'all', label: 'Tous', icon: BookOpen },
    { value: 'reading', label: 'En cours', icon: Clock },
    { value: 'completed', label: 'Terminés', icon: CheckCircle },
    { value: 'toread', label: 'À lire', icon: BookOpen },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre bibliothèque...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de connexion</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Vérifiez votre configuration Supabase dans les variables d'environnement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Booker</h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => openForm()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Ajouter un livre
              </button>

              {/* Menu utilisateur */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <User size={20} />
                  <span className="hidden sm:block">
                    {user?.user_metadata?.name || user?.email || 'Utilisateur'}
                  </span>
                </button>

                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.user_metadata?.name || 'Utilisateur'}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={signOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <Stats {...stats} />

        {/* Filtres et recherche */}
        <div className="mb-8 space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par titre, auteur ou genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtres par statut */}
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value as BookStatus | 'all')}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === filter.value
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <filter.icon size={16} className="mr-2" />
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des livres */}
        <div className="space-y-6">
          {filteredBooks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {books.length === 0 ? 'Aucun livre dans votre bibliothèque' : 'Aucun livre trouvé'}
              </h3>
              <p className="mt-2 text-gray-600">
                {books.length === 0 
                  ? 'Commencez par ajouter votre premier livre !' 
                  : 'Essayez de modifier vos filtres de recherche'
                }
              </p>
              {books.length === 0 && (
                <button
                  onClick={() => openForm()}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  Ajouter un livre
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredBooks.map((book, index) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full" 
                  >
                    <BookCard
                      book={book}
                      onEdit={openForm}
                      onDelete={handleDeleteBook}
                      onStatusChange={handleStatusChange}
                      onOpenTimer={openTimer}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Bouton flottant pour mobile */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => openForm()}
        className="floating-action md:hidden inline-flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Plus size={24} />
      </motion.button>


      {/* Formulaire */}
      <BookForm
        book={editingBook}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onDelete={handleDeleteBook}
      />

          {/* Timer de lecture */}
      {timerBook && (
        <ReadingTimer
          book={timerBook}
          isOpen={isTimerOpen}
          onClose={closeTimer}
          formatDuration={formatDuration}
          getBookStats={getBookStats}
          stopSession={stopSession}
          onSessionStopped={handleSessionStopped}
        />
      )}
    </div>
  );
}
