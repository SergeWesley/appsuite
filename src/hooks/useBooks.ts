'use client';

import { useState, useEffect } from 'react';
import { Book, BookFormData, BookStatus } from '@/types/book';

// Fonction pour générer un ID unique compatible avec tous les navigateurs
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback pour les navigateurs qui ne supportent pas crypto.randomUUID
  return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les livres depuis localStorage
  useEffect(() => {
    const savedBooks = localStorage.getItem('books');
    if (savedBooks) {
      try {
        const parsedBooks = JSON.parse(savedBooks).map((book: any) => ({
          ...book,
          dateAdded: new Date(book.dateAdded),
          dateStarted: book.dateStarted ? new Date(book.dateStarted) : undefined,
          dateCompleted: book.dateCompleted ? new Date(book.dateCompleted) : undefined,
        }));
        setBooks(parsedBooks);
      } catch (error) {
        console.error('Erreur lors du chargement des livres:', error);
      }
    }
    setLoading(false);
  }, []);

  // Sauvegarder les livres dans localStorage
  const saveBooks = (newBooks: Book[]) => {
    localStorage.setItem('books', JSON.stringify(newBooks));
    setBooks(newBooks);
  };

  // Ajouter un nouveau livre
  const addBook = (bookData: BookFormData) => {
    const newBook: Book = {
      id: generateId(),
      ...bookData,
      progress: bookData.status === 'completed' ? 100 : 
                bookData.currentPage && bookData.totalPages ? 
                Math.round((bookData.currentPage / bookData.totalPages) * 100) : 0,
      dateAdded: new Date(),
      dateStarted: bookData.status === 'reading' || bookData.status === 'completed' ? new Date() : undefined,
      dateCompleted: bookData.status === 'completed' ? new Date() : undefined,
    };
    
    saveBooks([...books, newBook]);
    return newBook;
  };

  // Mettre à jour un livre
  const updateBook = (id: string, updates: Partial<BookFormData>) => {
    const updatedBooks = books.map(book => {
      if (book.id === id) {
        const updatedBook = { ...book, ...updates };
        
        // Calculer le progrès
        if (updates.status === 'completed') {
          updatedBook.progress = 100;
          updatedBook.dateCompleted = new Date();
        } else if (updates.currentPage && updates.totalPages) {
          updatedBook.progress = Math.round((updates.currentPage / updates.totalPages) * 100);
        }
        
        // Mettre à jour les dates
        if (updates.status === 'reading' && !book.dateStarted) {
          updatedBook.dateStarted = new Date();
        }
        
        return updatedBook;
      }
      return book;
    });
    
    saveBooks(updatedBooks);
  };

  // Supprimer un livre
  const deleteBook = (id: string) => {
    saveBooks(books.filter(book => book.id !== id));
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
    addBook,
    updateBook,
    deleteBook,
    getBooksByStatus,
    getStats,
  };
} 