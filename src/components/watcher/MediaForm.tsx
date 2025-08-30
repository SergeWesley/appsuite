"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Media, MediaFormData, MediaStatus, MediaSuggestion, MediaType } from "@/types/media";
import {
  X,
  Film,
  Star,
  User,
  FileText,
  Hash,
  Trash2,
  Calendar,
  Clock,
  Tv,
  Play,
  Camera,
  AlignLeft,
} from "lucide-react";

interface MediaFormProps {
  media?: Media;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MediaFormData) => void;
  onDelete?: (id: string) => void;
}

export function MediaForm({
  media,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
}: MediaFormProps) {
  const [titleSuggestions, setTitleSuggestions] = useState<MediaSuggestion[]>([]);
  const [directorSuggestions, setDirectorSuggestions] = useState<MediaSuggestion[]>([]);
  const [creatorSuggestions, setCreatorSuggestions] = useState<MediaSuggestion[]>([]);
  const [genreSuggestions, setGenreSuggestions] = useState<MediaSuggestion[]>([]);
  const [isSearchingTitle, setIsSearchingTitle] = useState(false);
  const [isSearchingDirector, setIsSearchingDirector] = useState(false);
  const [isSearchingCreator, setIsSearchingCreator] = useState(false);
  const [isSearchingGenre, setIsSearchingGenre] = useState(false);
  const tmdbTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs pour les conteneurs de suggestions
  const titleSuggestionsRef = useRef<HTMLDivElement>(null);
  const directorSuggestionsRef = useRef<HTMLDivElement>(null);
  const creatorSuggestionsRef = useRef<HTMLDivElement>(null);
  const genreSuggestionsRef = useRef<HTMLDivElement>(null);

  // Refs pour les inputs
  const titleInputRef = useRef<HTMLInputElement>(null);
  const directorInputRef = useRef<HTMLInputElement>(null);
  const creatorInputRef = useRef<HTMLInputElement>(null);
  const genreInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<MediaFormData>({
    title: "",
    originalTitle: "",
    director: "",
    creator: "",
    studio: "",
    status: "towatch",
    type: "movie",
    duration: undefined,
    totalEpisodes: undefined,
    currentEpisode: undefined,
    totalSeasons: undefined,
    currentSeason: undefined,
    rating: undefined,
    synopsis: "",
    notes: "",
    genre: "",
    year: undefined,
    country: "",
    language: "",
    posterUrl: "",
    imdbId: "",
    tmdbId: "",
  });

  // Fonction pour fermer toutes les suggestions
  const clearAllSuggestions = () => {
    setTitleSuggestions([]);
    setDirectorSuggestions([]);
    setCreatorSuggestions([]);
    setGenreSuggestions([]);
  };

  // Effet pour gérer les clics en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Vérifier si le clic est en dehors de tous les conteneurs de suggestions et inputs
      const isOutsideTitleSuggestions = titleSuggestionsRef.current && 
        !titleSuggestionsRef.current.contains(target) &&
        titleInputRef.current && !titleInputRef.current.contains(target);
      
      const isOutsideDirectorSuggestions = directorSuggestionsRef.current && 
        !directorSuggestionsRef.current.contains(target) &&
        directorInputRef.current && !directorInputRef.current.contains(target);
      
      const isOutsideCreatorSuggestions = creatorSuggestionsRef.current && 
        !creatorSuggestionsRef.current.contains(target) &&
        creatorInputRef.current && !creatorInputRef.current.contains(target);
      
      const isOutsideGenreSuggestions = genreSuggestionsRef.current && 
        !genreSuggestionsRef.current.contains(target) &&
        genreInputRef.current && !genreInputRef.current.contains(target);

      // Fermer les suggestions appropriées
      if (isOutsideTitleSuggestions && titleSuggestions.length > 0) {
        setTitleSuggestions([]);
      }
      if (isOutsideDirectorSuggestions && directorSuggestions.length > 0) {
        setDirectorSuggestions([]);
      }
      if (isOutsideCreatorSuggestions && creatorSuggestions.length > 0) {
        setCreatorSuggestions([]);
      }
      if (isOutsideGenreSuggestions && genreSuggestions.length > 0) {
        setGenreSuggestions([]);
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
  }, [isOpen, titleSuggestions.length, directorSuggestions.length, creatorSuggestions.length, genreSuggestions.length]);


  useEffect(() => {
    if (media) {
      setFormData({
        title: media.title,
        originalTitle: media.originalTitle || "",
        director: media.director || "",
        creator: media.creator || "",
        studio: media.studio || "",
        poster: media.poster,
        status: media.status,
        type: media.type,
        duration: media.duration,
        totalEpisodes: media.totalEpisodes,
        currentEpisode: media.currentEpisode,
        totalSeasons: media.totalSeasons,
        currentSeason: media.currentSeason,
        rating: media.rating,
        synopsis: media.synopsis || "",
        notes: media.notes || "",
        genre: media.genre || "",
        year: media.year,
        country: media.country || "",
        language: media.language || "",
        posterUrl: media.posterUrl || "",
        imdbId: media.imdbId || "",
        tmdbId: media.tmdbId || "",
      });
    } else {
      setFormData({
        title: "",
        originalTitle: "",
        director: "",
        creator: "",
        studio: "",
        status: "towatch",
        type: "movie",
        duration: undefined,
        totalEpisodes: undefined,
        currentEpisode: undefined,
        totalSeasons: undefined,
        currentSeason: undefined,
        rating: undefined,
        synopsis: "",
        notes: "",
        genre: "",
        year: undefined,
        country: "",
        language: "",
        posterUrl: "",
        imdbId: "",
        tmdbId: "",
      });
    }
  }, [media]);

  const resetForm = () => {
    setFormData({
      title: "",
      originalTitle: "",
      director: "",
      creator: "",
      studio: "",
      status: "towatch",
      type: "movie",
      duration: undefined,
      totalEpisodes: undefined,
      currentEpisode: undefined,
      totalSeasons: undefined,
      currentSeason: undefined,
      rating: undefined,
      synopsis: "",
      notes: "",
      genre: "",
      year: undefined,
      country: "",
      language: "",
      posterUrl: "",
      imdbId: "",
      tmdbId: "",
    });

    clearAllSuggestions();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    resetForm();
    onClose();
  };

  const handleInputChange = (field: keyof MediaFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const searchMedia = async (
    query: string,
    type: "title" | "director" | "creator" | "genre" = "title",
  ) => {
    if (query.length < 3) {
      // Clear suggestions if query is too short
      switch (type) {
        case "title":
          setTitleSuggestions([]);
          break;
        case "director":
          setDirectorSuggestions([]);
          break;
        case "creator":
          setCreatorSuggestions([]);
          break;
        case "genre":
          setGenreSuggestions([]);
          break;
      }
      return;
    }

    // Set loading state
    switch (type) {
      case "title":
        setIsSearchingTitle(true);
        break;
      case "director":
        setIsSearchingDirector(true);
        break;
      case "creator":
        setIsSearchingCreator(true);
        break;
      case "genre":
        setIsSearchingGenre(true);
        break;
    }

    try {
      // Clear previous timeout
      if (tmdbTimeoutRef.current) {
        clearTimeout(tmdbTimeoutRef.current);
        tmdbTimeoutRef.current = null;
      }

      // Debounced search
      tmdbTimeoutRef.current = setTimeout(async () => {
        try {
          const mediaTypeParam = formData.type === "series" || formData.type === "anime" ? "tv" :
                                formData.type === "movie" || formData.type === "documentary" || formData.type === "short" ? "movie" : "all";

          const response = await fetch(`/api/medias/search?q=${encodeURIComponent(query)}&type=${type}&mediaType=${mediaTypeParam}`);
          const result = await response.json();

          if (response.ok) {
            const suggestions = result.data || [];

            switch (type) {
              case "title":
                setTitleSuggestions(suggestions);
                setDirectorSuggestions([]);
                setCreatorSuggestions([]);
                setGenreSuggestions([]);
                break;
              case "director":
                setDirectorSuggestions(suggestions);
                setTitleSuggestions([]);
                setCreatorSuggestions([]);
                setGenreSuggestions([]);
                break;
              case "creator":
                setCreatorSuggestions(suggestions);
                setTitleSuggestions([]);
                setDirectorSuggestions([]);
                setGenreSuggestions([]);
                break;
              case "genre":
                setGenreSuggestions(suggestions);
                setTitleSuggestions([]);
                setDirectorSuggestions([]);
                setCreatorSuggestions([]);
                break;
            }
          } else {
            console.error("Erreur lors de la recherche:", result.error);
          }
        } catch (error) {
          console.error("Erreur lors de la recherche TMDB:", error);
        } finally {
          // Clear loading states
          setIsSearchingTitle(false);
          setIsSearchingDirector(false);
          setIsSearchingCreator(false);
          setIsSearchingGenre(false);
        }
      }, 500); // 500ms debounce
    } catch (error) {
      console.error("Erreur lors de la recherche TMDB:", error);
      // Clear loading states
      setIsSearchingTitle(false);
      setIsSearchingDirector(false);
      setIsSearchingCreator(false);
      setIsSearchingGenre(false);
    }
  };

  const handleSuggestionSelect = (suggestion: MediaSuggestion) => {
    // Map TMDB data to form fields
    const year = suggestion.release_date
      ? new Date(suggestion.release_date).getFullYear()
      : undefined;

    const posterUrl = suggestion.poster_path
      ? `https://image.tmdb.org/t/p/w500${suggestion.poster_path}`
      : "";

    // Determine media type based on TMDB media_type
    let mediaType: MediaType = formData.type;
    if (suggestion.media_type === "movie") {
      mediaType = "movie";
    } else if (suggestion.media_type === "tv") {
      mediaType = "series";
    }

    setFormData((prev) => ({
      ...prev,
      title: suggestion.title,
      originalTitle: suggestion.original_title || "",
      director: suggestion.director || prev.director,
      creator: suggestion.creator || prev.creator,
      type: mediaType,
      year,
      posterUrl,
      tmdbId: suggestion.id.toString(),
      synopsis: suggestion.overview || prev.synopsis,
      rating: suggestion.vote_average ? Math.round(suggestion.vote_average / 2) : prev.rating, // Convert 10-scale to 5-scale
      genre: suggestion.genre_name || prev.genre,
    }));

    // Clear all suggestions
    setTitleSuggestions([]);
    setDirectorSuggestions([]);
    setCreatorSuggestions([]);
    setGenreSuggestions([]);
  };

  const handleDelete = () => {
    if (media && onDelete) {
      onDelete(media.id);
      onClose();
    }
  };

  const isSeriesType = formData.type === "series" || formData.type === "anime";

  return (
    <AnimatePresence>
      {isOpen && (
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
                  {media ? "Modifier l'œuvre" : "Ajouter une œuvre"}
                </h2>
                <div className="flex items-center gap-2">
                  {media && onDelete && (
                    <button
                      onClick={handleDelete}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      title="Supprimer l'œuvre"
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
                {/* Type d'œuvre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'œuvre *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {[
                      { value: "movie", label: "Film", icon: Film },
                      { value: "series", label: "Série", icon: Tv },
                      { value: "anime", label: "Animé", icon: Play },
                      {
                        value: "documentary",
                        label: "Documentaire",
                        icon: Camera,
                      },
                      { value: "short", label: "Court-métrage", icon: Clock },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          handleInputChange("type", type.value as MediaType)
                        }
                        className={`p-3 rounded-lg border transition-colors flex flex-col items-center gap-1 ${
                          formData.type === type.value
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <type.icon size={20} />
                        <span className="text-xs">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Titre */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          searchMedia(e.target.value, "title");
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Titre de l'œuvre"
                      />
                      {isSearchingTitle && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-5 w-5 border-2 border-purple-600 rounded-full border-t-transparent"></div>
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
                            key={`${suggestion.media_type}-${suggestion.id}`}
                            type="button"
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {suggestion.title}
                                </div>
                                {suggestion.original_title && suggestion.original_title !== suggestion.title && (
                                  <div className="text-sm text-gray-500">
                                    {suggestion.original_title}
                                  </div>
                                )}
                                <div className="text-sm text-gray-600">
                                  {suggestion.media_type === "tv" ? "Série" : "Film"}
                                  {suggestion.release_date && (
                                    ` • ${new Date(suggestion.release_date).getFullYear()}`
                                  )}
                                  {suggestion.vote_average && (
                                    ` • ⭐ ${suggestion.vote_average.toFixed(1)}`
                                  )}
                                </div>
                              </div>
                              {suggestion.poster_path && (
                                <img
                                  src={`https://image.tmdb.org/t/p/w92${suggestion.poster_path}`}
                                  alt={suggestion.title}
                                  className="w-8 h-12 object-cover rounded"
                                />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre original
                    </label>
                    <input
                      type="text"
                      value={formData.originalTitle}
                      onChange={(e) =>
                        handleInputChange("originalTitle", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Titre original"
                    />
                  </div>
                </div>

                {/* Créateur/Réalisateur/Studio */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.type === "anime"
                        ? "Studio"
                        : isSeriesType
                          ? "Créateur"
                          : "Réalisateur"}
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        ref={isSeriesType ? creatorInputRef : directorInputRef}
                        type="text"
                        value={
                          formData.type === "anime"
                            ? formData.studio
                            : isSeriesType
                              ? formData.creator
                              : formData.director
                        }
                        onChange={(e) => {
                          if (formData.type === "anime") {
                            handleInputChange("studio", e.target.value);
                          } else if (isSeriesType) {
                            handleInputChange("creator", e.target.value);
                            searchMedia(e.target.value, "creator");
                          } else {
                            handleInputChange("director", e.target.value);
                            searchMedia(e.target.value, "director");
                          }
                        }}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={
                          formData.type === "anime"
                            ? "Studio d'animation"
                            : isSeriesType
                              ? "Créateur"
                              : "Réalisateur"
                        }
                      />
                      {((isSeriesType && isSearchingCreator) || (!isSeriesType && formData.type !== "anime" && isSearchingDirector)) && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-5 w-5 border-2 border-purple-600 rounded-full border-t-transparent"></div>
                        </div>
                      )}
                    </div>

                    {/* Suggestions pour créateur */}
                    {isSeriesType && creatorSuggestions.length > 0 && (
                      <div 
                        ref={creatorSuggestionsRef}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {creatorSuggestions.map((suggestion) => (
                          <button
                            key={`creator-${suggestion.media_type}-${suggestion.id}`}
                            type="button"
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                          >
                            <div className="font-medium text-gray-900">
                              {suggestion.title}
                            </div>
                            <div className="text-sm text-gray-600">
                              {suggestion.creator && `par ${suggestion.creator}`}
                              {suggestion.release_date && (
                                ` • ${new Date(suggestion.release_date).getFullYear()}`
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Suggestions pour réalisateur */}
                    {!isSeriesType && formData.type !== "anime" && directorSuggestions.length > 0 && (
                      <div 
                        ref={directorSuggestionsRef}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {directorSuggestions.map((suggestion) => (
                          <button
                            key={`director-${suggestion.media_type}-${suggestion.id}`}
                            type="button"
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                          >
                            <div className="font-medium text-gray-900">
                              {suggestion.title}
                            </div>
                            <div className="text-sm text-gray-600">
                              {suggestion.director && `réalisé par ${suggestion.director}`}
                              {suggestion.release_date && (
                                ` • ${new Date(suggestion.release_date).getFullYear()}`
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Année
                    </label>
                    <div className="relative">
                      <Calendar
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 5}
                        value={formData.year || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "year",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="2024"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        handleInputChange(
                          "status",
                          e.target.value as MediaStatus,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="towatch">À voir</option>
                      <option value="watching">En cours</option>
                      <option value="completed">Terminé</option>
                      <option value="wishlist">Souhait</option>
                      <option value="dropped">Abandonné</option>
                    </select>
                  </div>
                </div>

                {/* Durée ou Episodes */}
                {formData.type === "movie" ||
                formData.type === "documentary" ||
                formData.type === "short" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée (en minutes)
                    </label>
                    <div className="relative">
                      <Clock
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="number"
                        value={formData.duration || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "duration",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="120"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Épisodes totaux
                      </label>
                      <input
                        type="number"
                        value={formData.totalEpisodes || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "totalEpisodes",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Épisode actuel
                      </label>
                      <input
                        type="number"
                        value={formData.currentEpisode || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "currentEpisode",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Saisons totales
                      </label>
                      <input
                        type="number"
                        value={formData.totalSeasons || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "totalSeasons",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Saison actuelle
                      </label>
                      <input
                        type="number"
                        value={formData.currentSeason || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "currentSeason",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="1"
                      />
                    </div>
                  </div>
                )}

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

                {/* Genre et informations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Genre
                    </label>
                    <div className="relative">
                      <input
                        ref={genreInputRef}
                        type="text"
                        value={formData.genre}
                        onChange={(e) => {
                          handleInputChange("genre", e.target.value);
                          searchMedia(e.target.value, "genre");
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Action, Drama, etc."
                      />
                      {isSearchingGenre && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-5 w-5 border-2 border-purple-600 rounded-full border-t-transparent"></div>
                        </div>
                      )}
                    </div>

                    {/* Suggestions de genre */}
                    {genreSuggestions.length > 0 && (
                      <div 
                        ref={genreSuggestionsRef}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {genreSuggestions.map((suggestion) => (
                          <button
                            key={`genre-${suggestion.media_type}-${suggestion.id}`}
                            type="button"
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                          >
                            <div className="font-medium text-gray-900">
                              {suggestion.title}
                            </div>
                            <div className="text-sm text-gray-600">
                              {suggestion.genre_name}
                              {suggestion.release_date && (
                                ` • ${new Date(suggestion.release_date).getFullYear()}`
                              )}
                              {suggestion.vote_average && (
                                ` • ⭐ ${suggestion.vote_average.toFixed(1)}`
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pays
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) =>
                        handleInputChange("country", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="France, États-Unis, Japon, etc."
                    />
                  </div>
                </div>

                {/* IDs externes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IMDb ID
                    </label>
                    <div className="relative">
                      <Hash
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={formData.imdbId}
                        onChange={(e) =>
                          handleInputChange("imdbId", e.target.value)
                        }
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="tt1234567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TMDB ID
                    </label>
                    <div className="relative">
                      <Hash
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={formData.tmdbId}
                        onChange={(e) =>
                          handleInputChange("tmdbId", e.target.value)
                        }
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="123456"
                      />
                    </div>
                  </div>
                </div>

                {/* URL du poster */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL du poster
                  </label>
                  <input
                    type="url"
                    value={formData.posterUrl}
                    onChange={(e) =>
                      handleInputChange("posterUrl", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                {/* Synopsis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Synopsis
                  </label>
                  <div className="relative">
                    <AlignLeft
                      size={16}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <textarea
                      value={formData.synopsis}
                      onChange={(e) =>
                        handleInputChange("synopsis", e.target.value)
                      }
                      rows={3}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Le synopsis de l'œuvre..."
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vos notes
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
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Vos notes sur cette œuvre..."
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
                    className="flex-1 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {media ? "Modifier" : "Ajouter"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
