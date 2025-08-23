export type BookStatus = "reading" | "completed" | "toread" | "wishlist";

export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  status: BookStatus;
  progress: number; // 0-100
  totalPages?: number;
  currentPage?: number;
  rating?: number; // 1-5
  notes?: string;
  dateAdded: Date;
  dateStarted?: Date;
  dateCompleted?: Date;
  genre?: string;
  isbn?: string;
  coverUrl?: string; // URL de la couverture
}

export interface BookFormData {
  title: string;
  author: string;
  cover?: string;
  status: BookStatus;
  totalPages?: number;
  currentPage?: number;
  rating?: number;
  notes?: string;
  genre?: string;
  isbn?: string;
  coverUrl?: string; // URL de la couverture
}
