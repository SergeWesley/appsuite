"use client";

import { useState, useEffect } from "react";
import { Media, MediaFormData, MediaStatus, MediaType } from "@/types/media";
import { Database } from "@/types/supabase";
import { supabase } from "@/lib/supabase";
import { useAuth } from "../useAuth";

type MediaRow = Database["public"]["Tables"]["medias"]["Row"];
type MediaInsert = Database["public"]["Tables"]["medias"]["Insert"];
type MediaUpdate = Database["public"]["Tables"]["medias"]["Update"];

// Fonction pour convertir les données de la base vers le type Media
function mapRowToMedia(row: MediaRow): Media {
  return {
    id: row.id,
    title: row.title,
    originalTitle: row.original_title || undefined,
    director: row.director || undefined,
    creator: row.creator || undefined,
    studio: row.studio || undefined,
    poster: row.poster || undefined,
    status: row.status as MediaStatus,
    progress: row.progress || 0,
    type: row.type as MediaType,
    duration: row.duration || undefined,
    totalEpisodes: row.total_episodes || undefined,
    currentEpisode: row.current_episode || undefined,
    totalSeasons: row.total_seasons || undefined,
    currentSeason: row.current_season || undefined,
    rating: row.rating || undefined,
    notes: row.notes || undefined,
    synopsis: row.synopsis || undefined,
    dateAdded: new Date(row.date_added),
    dateStarted: row.date_started ? new Date(row.date_started) : undefined,
    dateCompleted: row.date_completed
      ? new Date(row.date_completed)
      : undefined,
    genre: row.genre || undefined,
    year: row.year || undefined,
    country: row.country || undefined,
    language: row.language || undefined,
    posterUrl: row.poster_url || undefined,
    imdbId: row.imdb_id || undefined,
    tmdbId: row.tmdb_id || undefined,
  };
}

// Fonction pour convertir MediaFormData vers MediaInsert
function mapFormDataToInsert(
  formData: MediaFormData,
  userId: string,
): MediaInsert {
  const now = new Date().toISOString();

  return {
    title: formData.title,
    original_title: formData.originalTitle || null,
    type: formData.type,
    status: formData.status,
    director: formData.director || null,
    creator: formData.creator || null,
    studio: formData.studio || null,
    duration: formData.duration || null,
    year: formData.year || null,
    total_episodes: formData.totalEpisodes || null,
    current_episode: formData.currentEpisode || null,
    total_seasons: formData.totalSeasons || null,
    current_season: formData.currentSeason || null,
    rating: formData.rating || null,
    notes: formData.notes || null,
    synopsis: formData.synopsis || null,
    genre: formData.genre || null,
    country: formData.country || null,
    language: formData.language || null,
    poster: formData.poster || null,
    poster_url: formData.posterUrl || null,
    imdb_id: formData.imdbId || null,
    tmdb_id: formData.tmdbId || null,
    date_added: now,
    date_started:
      formData.status === "watching" || formData.status === "completed"
        ? now
        : null,
    date_completed: formData.status === "completed" ? now : null,
    user_id: userId,
  };
}

export function useMedias() {
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Charger les médias depuis Supabase
  const loadMedias = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from("medias")
        .select("*")
        .eq("user_id", user.id)
        .order("date_added", { ascending: false });

      if (error) throw error;

      const mappedMedias = data.map(mapRowToMedia);
      setMedias(mappedMedias);
    } catch (err) {
      console.error("Erreur lors du chargement des médias:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadMedias();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Ajouter un nouveau média
  const addMedia = async (mediaData: MediaFormData): Promise<Media | null> => {
    if (!user) {
      setError("Utilisateur non connecté");
      return null;
    }

    try {
      setError(null);

      const insertData = mapFormDataToInsert(mediaData, user.id);

      const { data, error } = await supabase
        .from("medias")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const newMedia = mapRowToMedia(data);
      setMedias((prev) => [newMedia, ...prev]);
      return newMedia;
    } catch (err) {
      console.error("Erreur lors de l'ajout du média:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return null;
    }
  };

  // Mettre à jour un média
  const updateMedia = async (
    id: string,
    updates: Partial<MediaFormData>,
  ): Promise<boolean> => {
    if (!user) {
      setError("Utilisateur non connecté");
      return false;
    }

    try {
      setError(null);

      const updateData: MediaUpdate = {};

      // Mapper les champs de mise à jour
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.originalTitle !== undefined) updateData.original_title = updates.originalTitle;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.director !== undefined) updateData.director = updates.director;
      if (updates.creator !== undefined) updateData.creator = updates.creator;
      if (updates.studio !== undefined) updateData.studio = updates.studio;
      if (updates.duration !== undefined) updateData.duration = updates.duration;
      if (updates.year !== undefined) updateData.year = updates.year;
      if (updates.totalEpisodes !== undefined) updateData.total_episodes = updates.totalEpisodes;
      if (updates.currentEpisode !== undefined) updateData.current_episode = updates.currentEpisode;
      if (updates.totalSeasons !== undefined) updateData.total_seasons = updates.totalSeasons;
      if (updates.currentSeason !== undefined) updateData.current_season = updates.currentSeason;
      if (updates.rating !== undefined) updateData.rating = updates.rating;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.synopsis !== undefined) updateData.synopsis = updates.synopsis;
      if (updates.genre !== undefined) updateData.genre = updates.genre;
      if (updates.country !== undefined) updateData.country = updates.country;
      if (updates.language !== undefined) updateData.language = updates.language;
      if (updates.poster !== undefined) updateData.poster = updates.poster;
      if (updates.posterUrl !== undefined) updateData.poster_url = updates.posterUrl;
      if (updates.imdbId !== undefined) updateData.imdb_id = updates.imdbId;
      if (updates.tmdbId !== undefined) updateData.tmdb_id = updates.tmdbId;

      const { data, error } = await supabase
        .from("medias")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedMedia = mapRowToMedia(data);
      setMedias((prev) =>
        prev.map((media) => (media.id === id ? updatedMedia : media)),
      );
      return true;
    } catch (err) {
      console.error("Erreur lors de la mise à jour du média:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return false;
    }
  };

  // Supprimer un média
  const deleteMedia = async (id: string): Promise<boolean> => {
    if (!user) {
      setError("Utilisateur non connecté");
      return false;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from("medias")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setMedias((prev) => prev.filter((media) => media.id !== id));
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression du média:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return false;
    }
  };

  // Obtenir les médias par statut
  const getMediasByStatus = (status: MediaStatus) => {
    return medias.filter((media) => media.status === status);
  };

  // Obtenir les médias par type
  const getMediasByType = (type: MediaType) => {
    return medias.filter((media) => media.type === type);
  };

  // Obtenir les statistiques
  const getStats = () => {
    const total = medias.length;
    const watching = medias.filter(
      (media) => media.status === "watching",
    ).length;
    const completed = medias.filter(
      (media) => media.status === "completed",
    ).length;
    const toWatch = medias.filter((media) => media.status === "towatch").length;
    const wishlist = medias.filter(
      (media) => media.status === "wishlist",
    ).length;
    const dropped = medias.filter((media) => media.status === "dropped").length;

    const movies = medias.filter((media) => media.type === "movie").length;
    const series = medias.filter((media) => media.type === "series").length;
    const anime = medias.filter((media) => media.type === "anime").length;
    const documentaries = medias.filter(
      (media) => media.type === "documentary",
    ).length;
    const shorts = medias.filter((media) => media.type === "short").length;

    const averageRating =
      medias
        .filter((media) => media.rating)
        .reduce((acc, media) => acc + (media.rating || 0), 0) /
        medias.filter((media) => media.rating).length || 0;

    // Calculer le temps total de visionnage (pour les films complétés)
    const totalWatchTime = medias
      .filter((media) => media.status === "completed" && media.duration)
      .reduce((acc, media) => acc + (media.duration || 0), 0);

    return {
      total,
      watching,
      completed,
      toWatch,
      wishlist,
      dropped,
      movies,
      series,
      anime,
      documentaries,
      shorts,
      averageRating,
      totalWatchTime,
    };
  };

  return {
    medias,
    loading,
    error,
    addMedia,
    updateMedia,
    deleteMedia,
    getMediasByStatus,
    getMediasByType,
    getStats,
    refreshMedias: loadMedias,
  };
}
