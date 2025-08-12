export interface ReadingSession {
  id: string;
  bookId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // en secondes
  notes?: string;
  pagesRead?: number;
  isActive: boolean;
}

export interface ReadingSessionFormData {
  notes?: string;
  pagesRead?: number;
}

export interface BookReadingStats {
  totalSessions: number;
  totalReadingTime: number; // en secondes
  averageSessionTime: number; // en secondes
  totalPagesRead: number;
  lastSession?: Date;
}
