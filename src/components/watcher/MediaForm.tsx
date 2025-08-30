"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Media, MediaFormData, MediaStatus, MediaType, MediaSuggestion } from "@/types/media";
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
    notes: "",
    genre: "",
    year: undefined,
    country: "",
    language: "",
    posterUrl: "",
    imdbId: "",
    tmdbId: "",
  });

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
      notes: "",
      genre: "",
      year: undefined,
      country: "",
      language: "",
      posterUrl: "",
      imdbId: "",
      tmdbId: "",
    });
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

          const response = await fetch(`/api/media/search?q=${encodeURIComponent(query)}&type=${type}&mediaType=${mediaTypeParam}`);
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
      notes: suggestion.overview || prev.notes,
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Titre de l'œuvre"
                    />
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
                  <div>
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
                          } else {
                            handleInputChange("director", e.target.value);
                          }
                        }}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={
                          formData.type === "anime"
                            ? "Studio d'animation"
                            : isSeriesType
                              ? "Créateur"
                              : "Réalisateur"
                        }
                      />
                    </div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Action, Drama, etc."
                    />
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
