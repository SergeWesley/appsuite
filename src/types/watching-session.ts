export interface WatchingSession {
  id: string;
  mediaId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // Durée en secondes
  isActive: boolean;
  notes?: string;
  userId: string;
  episodeWatched?: number; // Numéro de l'épisode regardé
  seasonWatched?: number; // Numéro de la saison regardée
}

export interface WatchingSessionFormData {
  mediaId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  notes?: string;
  episodeWatched?: number;
  seasonWatched?: number;
}
