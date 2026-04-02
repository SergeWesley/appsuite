export interface NoteFolder {
  id: string;
  name: string;
  color: string;
  userId: string;
  noteCount?: number;
  dateCreated: Date;
  dateUpdated: Date;
}

export interface NoteFolderFormData {
  name: string;
  color: string;
}

export interface Note {
  id: string;
  folderId: string;
  title: string;
  content: string;
  userId: string;
  dateCreated: Date;
  dateUpdated: Date;
}

export interface NoteFormData {
  title: string;
  content: string;
}

export const FOLDER_COLORS = [
  { value: "#f59e0b", label: "Jaune", bg: "bg-amber-400" },
  { value: "#3b82f6", label: "Bleu", bg: "bg-blue-500" },
  { value: "#10b981", label: "Vert", bg: "bg-emerald-500" },
  { value: "#ef4444", label: "Rouge", bg: "bg-red-500" },
  { value: "#8b5cf6", label: "Violet", bg: "bg-violet-500" },
  { value: "#f97316", label: "Orange", bg: "bg-orange-500" },
  { value: "#ec4899", label: "Rose", bg: "bg-pink-500" },
  { value: "#6b7280", label: "Gris", bg: "bg-gray-500" },
];
