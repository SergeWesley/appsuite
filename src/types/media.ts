export type MediaType = "movie" | "series" | "anime" | "documentary" | "short";
export type MediaStatus =
  | "watching"
  | "completed"
  | "towatch"
  | "wishlist"
  | "dropped";

export interface Media {
  id: string;
  title: string;
  originalTitle?: string;
  director?: string;
  creator?: string; // Pour les séries
  studio?: string; // Pour les animés
  poster?: string;
  status: MediaStatus;
  progress: number; // 0-100
  type: MediaType;

  // Pour les films
  duration?: number; // en minutes

  // Pour les séries/animés
  totalEpisodes?: number;
  currentEpisode?: number;
  totalSeasons?: number;
  currentSeason?: number;

  rating?: number; // 1-10
  notes?: string;
  synopsis?: string;
  dateAdded: Date;
  dateStarted?: Date;
  dateCompleted?: Date;
  genre?: string;
  year?: number; // Année de sortie
  country?: string;
  language?: string;
  posterUrl?: string; // URL du poster
  imdbId?: string;
  tmdbId?: string; // The Movie Database ID
}

export interface MediaFormData {
  title: string;
  originalTitle?: string;
  director?: string;
  creator?: string;
  studio?: string;
  poster?: string;
  status: MediaStatus;
  type: MediaType;
  duration?: number;
  totalEpisodes?: number;
  currentEpisode?: number;
  totalSeasons?: number;
  currentSeason?: number;
  rating?: number;
  synopsis?: string;
  notes?: string;
  genre?: string;
  year?: number;
  country?: string;
  language?: string;
  posterUrl?: string;
  imdbId?: string;
  tmdbId?: string;
}

export interface MediaSuggestion {
  id: number;
  title: string;
  original_title?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  genre_ids?: number[];
  vote_average?: number;
  vote_count?: number;
  media_type?: "movie" | "tv";
  // For TV shows
  name?: string;
  original_name?: string;
  // Additional fields from search
  director?: string;
  creator?: string;
  genre_name?: string;
}
