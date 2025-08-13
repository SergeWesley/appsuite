'use client';

import { useState, useEffect } from 'react';
import { Book, BookFormData, BookStatus } from '@/types/book';
import { Database } from '@/types/supabase';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './useAuth';

type BookRow = Database['public']['Tables']['books']['Row'];
type BookInsert = Database['public']['Tables']['books']['Insert'];
type BookUpdate = Database['public']['Tables']['books']['Update'];

// Fonction pour convertir les données de la base vers le type Book
function mapRowToBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    cover: row.cover || undefined,
    status: row.status as BookStatus,
    progress: row.progress,
    totalPages: row.total_pages || undefined,
    currentPage: row.current_page || undefined,
    rating: row.rating || undefined,
    notes: row.notes || undefined,
    dateAdded: new Date(row.date_added),
    dateStarted: row.date_started ? new Date(row.date_started) : undefined,
    dateCompleted: row.date_completed ? new Date(row.date_completed) : undefined,
    genre: row.genre || undefined,
    isbn: row.isbn || undefined,
    coverUrl: row.cover_url || undefined,
  };
}

// Fonction pour convertir BookFormData vers BookInsert
function mapFormDataToInsert(formData: BookFormData, userId: string): BookInsert {
  const now = new Date().toISOString();
  return {
    title: formData.title,
    author: formData.author,
    cover: formData.cover || null,
    status: formData.status,
    progress: formData.status === 'completed' ? 100 : 
              formData.currentPage && formData.totalPages ? 
              Math.round((formData.currentPage / formData.totalPages) * 100) : 0,
    total_pages: formData.totalPages || null,
    current_page: formData.currentPage || null,
    rating: formData.rating || null,
    notes: formData.notes || null,
    date_added: now,
    date_started: formData.status === 'reading' || formData.status === 'completed' ? now : null,
    date_completed: formData.status === 'completed' ? now : null,
    genre: formData.genre || null,
    isbn: formData.isbn || null,
    cover_url: formData.coverUrl || null,
    user_id: userId,
  };
}

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fonction pour migrer les données du localStorage vers Supabase
  const migrateFromLocalStorage = async () => {
    if (!user) return;

    try {
      const savedBooks = localStorage.getItem('books');
      if (!savedBooks) return;

      const parsedBooks = JSON.parse(savedBooks);
      if (!Array.isArray(parsedBooks) || parsedBooks.length === 0) return;

      console.log('Migration des livres depuis localStorage...');
      
      // Insérer chaque livre dans Supabase
      for (const localBook of parsedBooks) {
        const bookData: BookInsert = {
          title: localBook.title,
          author: localBook.author,
          cover: localBook.cover || null,
          status: localBook.status,
          progress: localBook.progress || 0,
          total_pages: localBook.totalPages || null,
          current_page: localBook.currentPage || null,
          rating: localBook.rating || null,
          notes: localBook.notes || null,
          date_added: localBook.dateAdded || new Date().toISOString(),
          date_started: localBook.dateStarted || null,
          date_completed: localBook.dateCompleted || null,
          genre: localBook.genre || null,
          isbn: localBook.isbn || null,
          cover_url: localBook.coverUrl || null,
          user_id: user.id,
        };

        const { error } = await supabase
          .from('books')
          .insert(bookData);

        if (error) {
          console.error('Erreur lors de la migration du livre:', error);
        }
      }

      // Supprimer les données du localStorage après migration réussie
      localStorage.removeItem('books');
      console.log('Migration terminée, données localStorage supprimées');
    } catch (error) {
      console.error('Erreur lors de la migration:', error);
    }
  };

  // Charger les livres depuis localStorage ou Supabase
  const loadBooks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);

      if (!isSupabaseConfigured) {
        // Mode localStorage
        const savedBooks = localStorage.getItem('books');
        if (savedBooks) {
          const parsedBooks = JSON.parse(savedBooks).map((book: any) => ({
            ...book,
            dateAdded: new Date(book.dateAdded),
            dateStarted: book.dateStarted ? new Date(book.dateStarted) : undefined,
            dateCompleted: book.dateCompleted ? new Date(book.dateCompleted) : undefined,
          }));
          setBooks(parsedBooks);
        }
        setLoading(false);
        return;
      }

      // Mode Supabase
      const { data, error } = await supabase!
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('date_added', { ascending: false });

      if (error) throw error;

      const mappedBooks = data.map(mapRowToBook);
      setBooks(mappedBooks);
    } catch (err) {
      console.error('Erreur lors du chargement des livres:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Vérifier s'il y a des données à migrer
      migrateFromLocalStorage().then(() => {
        loadBooks();
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  // Ajouter un nouveau livre
  const addBook = async (bookData: BookFormData): Promise<Book | null> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return null;
    }

    try {
      setError(null);
      const insertData = mapFormDataToInsert(bookData, user.id);

      const { data, error } = await supabase
        .from('books')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const newBook = mapRowToBook(data);
      setBooks(prev => [newBook, ...prev]);
      return newBook;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du livre:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    }
  };

  // Mettre à jour un livre
  const updateBook = async (id: string, updates: Partial<BookFormData>): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    try {
      setError(null);
      const updateData: BookUpdate = {};

      // Mapper les champs de mise à jour
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.author !== undefined) updateData.author = updates.author;
      if (updates.cover !== undefined) updateData.cover = updates.cover;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.totalPages !== undefined) updateData.total_pages = updates.totalPages;
      if (updates.currentPage !== undefined) updateData.current_page = updates.currentPage;
      if (updates.rating !== undefined) updateData.rating = updates.rating;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.genre !== undefined) updateData.genre = updates.genre;
      if (updates.isbn !== undefined) updateData.isbn = updates.isbn;
      if (updates.coverUrl !== undefined) updateData.cover_url = updates.coverUrl;

      // Calculer le progrès
      if (updates.status === 'completed') {
        updateData.progress = 100;
        updateData.date_completed = new Date().toISOString();
      } else if (updates.currentPage && updates.totalPages) {
        updateData.progress = Math.round((updates.currentPage / updates.totalPages) * 100);
      }

      // Mettre à jour la date de début
      if (updates.status === 'reading') {
        const currentBook = books.find(book => book.id === id);
        if (currentBook && !currentBook.dateStarted) {
          updateData.date_started = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from('books')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedBook = mapRowToBook(data);
      setBooks(prev => prev.map(book => book.id === id ? updatedBook : book));
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du livre:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  // Supprimer un livre
  const deleteBook = async (id: string): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    try {
      setError(null);
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setBooks(prev => prev.filter(book => book.id !== id));
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du livre:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  // Obtenir les livres par statut
  const getBooksByStatus = (status: BookStatus) => {
    return books.filter(book => book.status === status);
  };

  // Obtenir les statistiques
  const getStats = () => {
    const total = books.length;
    const reading = books.filter(book => book.status === 'reading').length;
    const completed = books.filter(book => book.status === 'completed').length;
    const toRead = books.filter(book => book.status === 'toread').length;
    const averageRating = books
      .filter(book => book.rating)
      .reduce((acc, book) => acc + (book.rating || 0), 0) / 
      books.filter(book => book.rating).length || 0;

    return { total, reading, completed, toRead, averageRating };
  };

  return {
    books,
    loading,
    error,
    addBook,
    updateBook,
    deleteBook,
    getBooksByStatus,
    getStats,
    refreshBooks: loadBooks,
  };
}
