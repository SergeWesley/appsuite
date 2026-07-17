"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, BookFormData, BookStatus } from "@/types/book";
import { IsbnScanner } from "./IsbnScanner";
import {
  X,
  BookOpen,
  Star,
  User,
  FileText,
  Hash,
  Trash2,
  Camera,
} from "lucide-react";

interface BookFormProps {
  book?: Book;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookFormData) => void;
  onDelete?: (id: string) => void;
}

interface BookSuggestion {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  number_of_pages_median?: number;
  cover_i?: number; // ID de la couverture
}

export function BookForm({
  book,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
}: BookFormProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    status: "toread",
    totalPages: undefined,
    currentPage: undefined,
    rating: undefined,
    notes: "",
    genre: "",
    isbn: "",
    coverUrl: "",
  });
  const [titleSuggestions, setTitleSuggestions] = useState<BookSuggestion[]>(
    [],
  );
  const [authorSuggestions, setAuthorSuggestions] = useState<BookSuggestion[]>(
    [],
  );
  const [isSearchingTitle, setIsSearchingTitle] = useState(false);
  const [isSearchingAuthor, setIsSearchingAuthor] = useState(false);
  const [isSearchingIsbn, setIsSearchingIsbn] = useState(false);
  const googleBooksTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs pour les conteneurs de suggestions et inputs
  const titleSuggestionsRef = useRef<HTMLDivElement>(null);
  const authorSuggestionsRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const authorInputRef = useRef<HTMLInputElement>(null);
  const isbnInputRef = useRef<HTMLInputElement>(null);

  // Fonction pour fermer toutes les suggestions
  const clearAllSuggestions = () => {
    setTitleSuggestions([]);
    setAuthorSuggestions([]);
  };

   // Effet pour gérer les clics en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Vérifier si le clic est en dehors des suggestions de titre
      const isOutsideTitleSuggestions = titleSuggestionsRef.current && 
        !titleSuggestionsRef.current.contains(target) &&
        titleInputRef.current && !titleInputRef.current.contains(target) &&
        isbnInputRef.current && !isbnInputRef.current.contains(target);
      
      // Vérifier si le clic est en dehors des suggestions d'auteur
      const isOutsideAuthorSuggestions = authorSuggestionsRef.current && 
        !authorSuggestionsRef.current.contains(target) &&
        authorInputRef.current && !authorInputRef.current.contains(target);

      // Fermer les suggestions appropriées
      if (isOutsideTitleSuggestions && titleSuggestions.length > 0) {
        setTitleSuggestions([]);
      }
      if (isOutsideAuthorSuggestions && authorSuggestions.length > 0) {
        setAuthorSuggestions([]);
      }
    };

    // Ajouter l'écouteur d'événement seulement si le formulaire est ouvert
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Nettoyer l'écouteur
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, titleSuggestions.length, authorSuggestions.length]);


  const searchBooks = async (
    query: string,
    type: "title" | "author" | "isbn" = "title",
  ) => {
    if (query.length < 3 && type !== "isbn") {
      if (type === "title") {
        setTitleSuggestions([]);
      } else if (type === "author") {
        setAuthorSuggestions([]);
      }
      return;
    }

    if (type === "isbn" && query.length < 10) {
      // Pour l'ISBN, on vide les suggestions si moins de 10 caractères
      setTitleSuggestions([]);
      return;
    }

    if (type === "title") {
      setIsSearchingTitle(true);
    } else if (type === "author") {
      setIsSearchingAuthor(true);
    } else {
      setIsSearchingIsbn(true); // Pour l'ISBN, on utilise son propre état
    }

    try {
      // Annuler le timeout précédent pour Google Books s'il existe
      if (googleBooksTimeoutRef.current) {
        clearTimeout(googleBooksTimeoutRef.current);
        googleBooksTimeoutRef.current = null;
      }

      // Utiliser notre API route locale avec debouncing
      googleBooksTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}&type=${type}`);
          const result = await response.json();

          if (response.ok) {
            const bookData = result.data || [];

            if (type === "title" || type === "isbn") {
              setTitleSuggestions(bookData);
              setAuthorSuggestions([]);
            } else {
              setAuthorSuggestions(bookData);
              setTitleSuggestions([]);
            }
          } else {
            console.error("Erreur lors de la recherche:", result.error);
          }
        } catch (error) {
          console.error("Erreur lors de la recherche de livres:", error);
        } finally {
          if (type === "title") {
            setIsSearchingTitle(false);
          } else if (type === "author") {
            setIsSearchingAuthor(false);
          } else {
            setIsSearchingIsbn(false);
          }
        }
      }, 500); // Délai de 500ms avant de lancer la recherche


    } catch (error) {
      console.error("Erreur lors de la recherche de livres:", error);
    } finally {
      if (type === "title") {
        setIsSearchingTitle(false);
      } else if (type === "author") {
        setIsSearchingAuthor(false);
      } else {
        setIsSearchingIsbn(false);
      }
    }
  };

  const handleSuggestionSelect = (suggestion: BookSuggestion) => {
    setFormData((prev) => ({
      ...prev,
      title: suggestion.title,
      author: suggestion.author_name?.[0] || "",
      totalPages: suggestion.number_of_pages_median,
      isbn: suggestion.isbn?.[0] || "",
      coverUrl: suggestion.cover_i
        ? `https://covers.openlibrary.org/b/id/${suggestion.cover_i}-L.jpg`
        : suggestion.isbn?.[0]
          ? `https://covers.openlibrary.org/b/isbn/${suggestion.isbn[0]}-L.jpg`
          : "",
    }));
    setTitleSuggestions([]);
    setAuthorSuggestions([]);
  };

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        cover: book.cover,
        status: book.status,
        totalPages: book.totalPages,
        currentPage: book.currentPage,
        rating: book.rating,
        notes: book.notes || "",
        genre: book.genre || "",
        isbn: book.isbn || "",
      });
    } else {
      setFormData({
        title: "",
        author: "",
        status: "toread",
        totalPages: undefined,
        currentPage: undefined,
        rating: undefined,
        notes: "",
        genre: "",
        isbn: "",
      });
    }
  }, [book]);

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      status: "toread",
      totalPages: undefined,
      currentPage: undefined,
      rating: undefined,
      notes: "",
      genre: "",
      isbn: "",
    });
    
    clearAllSuggestions();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    resetForm();
    onClose();
  };

  const handleInputChange = (field: keyof BookFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = () => {
    if (book && onDelete) {
      onDelete(book.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isScanning ? (
        <IsbnScanner
          onScan={(isbn: string) => {
            handleInputChange("isbn", isbn);
            setIsScanning(false);
            // Rechercher automatiquement le livre avec l'ISBN
            searchBooks(isbn, "isbn");
          }}
          onClose={() => setIsScanning(false)}
        />
      ) : (
        isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {book ? "Modifier le livre" : "Ajouter un livre"}
                  </h2>
                  <div className="flex items-center gap-2">
                    {book && onDelete && (
                      <button
                        onClick={handleDelete}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        title="Supprimer le livre"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        resetForm();
                        onClose();
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Titre */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre *
                    </label>
                    <div className="relative">
                      <input
                        ref={titleInputRef}
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => {
                          handleInputChange("title", e.target.value);
                          searchBooks(e.target.value, "title");
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Titre du livre"
                      />
                      {isSearchingTitle && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent"></div>
                        </div>
                      )}
                    </div>

                    {/* Liste des suggestions de titre */}
                    {titleSuggestions.length > 0 && (
                      <div
                        ref={titleSuggestionsRef} 
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {titleSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.key}
                            type="button"
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                          >
                            <div className="font-medium text-gray-900">
                              {suggestion.title}
                            </div>
                            {suggestion.author_name && (
                              <div className="text-sm text-gray-600">
                                par {suggestion.author_name[0]}
                                {suggestion.first_publish_year &&
                                  ` (${suggestion.first_publish_year})`}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Auteur */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auteur *
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        ref={authorInputRef}
                        type="text"
                        required
                        value={formData.author}
                        onChange={(e) => {
                          handleInputChange("author", e.target.value);
                          searchBooks(e.target.value, "author");
                        }}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nom de l'auteur"
                      />
                      {isSearchingAuthor && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent"></div>
                        </div>
                      )}
                    </div>

                    {/* Liste des suggestions d'auteur */}
                    {authorSuggestions.length > 0 && (
                      <div 
                        ref={authorSuggestionsRef}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {authorSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.key}
                            type="button"
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                          >
                            <div className="font-medium text-gray-900">
                              {suggestion.author_name?.[0] || "Auteur inconnu"}
                            </div>
                            {suggestion.title && (
                              <div className="text-sm text-gray-600">
                                {suggestion.title}
                                {suggestion.first_publish_year &&
                                  ` (${suggestion.first_publish_year})`}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Statut */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        handleInputChange(
                          "status",
                          e.target.value as BookStatus,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="toread">À lire</option>
                      <option value="reading">En cours</option>
                      <option value="completed">Terminé</option>
                      <option value="wishlist">Souhait</option>
                    </select>
                  </div>

                  {/* Pages */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pages totales
                      </label>
                      <div className="relative">
                        <BookOpen
                          size={16}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="number"
                          value={formData.totalPages || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "totalPages",
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                            )
                          }
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page actuelle
                      </label>
                      <input
                        type="number"
                        value={formData.currentPage || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "currentPage",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => handleInputChange("rating", rating)}
                          className={`p-1 rounded transition-colors ${
                            formData.rating === rating
                              ? "text-yellow-500"
                              : "text-gray-300 hover:text-yellow-400"
                          }`}
                        >
                          <Star
                            size={20}
                            className={
                              formData.rating && formData.rating >= rating
                                ? "fill-current"
                                : ""
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Genre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Genre
                    </label>
                    <input
                      type="text"
                      value={formData.genre}
                      onChange={(e) =>
                        handleInputChange("genre", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Roman, Science-fiction, etc."
                    />
                  </div>

                  {/* ISBN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ISBN
                    </label>
                    <div className="relative">
                      <Hash
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        ref={isbnInputRef}
                        type="text"
                        value={formData.isbn}
                        onChange={(e) => {
                          handleInputChange("isbn", e.target.value);
                          searchBooks(e.target.value, "isbn");
                        }}
                        className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="978-0-000000-0-0"
                      />
                      {isSearchingIsbn && (
                        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent"></div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsScanning(true)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Scanner un code ISBN"
                      >
                        <Camera size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <div className="relative">
                      <FileText
                        size={16}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          handleInputChange("notes", e.target.value)
                        }
                        rows={3}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Vos notes sur ce livre..."
                      />
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        onClose();
                      }}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {book ? "Valider" : "Ajouter"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )
      )}
    </AnimatePresence>
  );
}
