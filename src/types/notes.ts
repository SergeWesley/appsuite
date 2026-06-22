export type CustomFieldType = 
  | "text"      // Texte court (ex: Nom, Titre)
  | "textarea"  // Texte long (ex: Description, Résumé)
  | "number"    // Nombre (ex: Temps, Quantité)
  | "currency"  // Monnaie (ex: Prix, Budget)
  | "checkbox"  // Vrai/Faux (ex: Urgent, Végétarien)
  | "date"      // Date (ex: Date limite, Date de création cible)
  | "time"      // Heure (ex: Heure de début)
  | "select"    // Liste déroulante (ex: Catégorie, Priorité)
  | "color"     // Sélecteur de couleur
  | "rating"    // Note sur 5 étoiles
  | "url"       // Lien web (ex: Source, Référence)
  | "table";    // Tableau de données (ex: Liste d'ingrédients)

export interface CustomFieldDefinition {
  id: string;          // UUID du champ (généré à la création)
  name: string;        // Nom affiché à l'utilisateur
  type: CustomFieldType;
  options?: string[];  // Options, utilisé uniquement pour le type "select"
  columns?: CustomFieldDefinition[]; // Colonnes, utilisé uniquement pour le type "table"
  required?: boolean;  // Rendre la saisie obligatoire
  icon?: string;       // (Optionnel) nom d'icône pour l'UI, ex: lucide-react
}

export interface NoteFolder {
  id: string;
  name: string;
  color: string;
  userId: string;
  parentId?: string | null;
  customFields?: CustomFieldDefinition[]; // LEGACY — sera remplacé par les templates
  noteCount?: number;
  order_index?: number;
  dateCreated: Date;
  dateUpdated: Date;
}

export interface NoteTemplate {
  id: string;
  folderId: string;
  name: string;           // Ex: "Lieux à visiter", "Repas"
  fields: CustomFieldDefinition[];
  userId: string;
  dateCreated: Date;
  dateUpdated: Date;
}

export interface NoteFolderFormData {
  name: string;
  color: string;
  parentId?: string | null;
}

export interface Note {
  id: string;
  folderId: string;
  templateId?: string | null; // null = note libre
  title: string;
  content: string;
  userId: string;
  metadata?: Record<string, any>;
  dateCreated: Date;
  dateUpdated: Date;
}

export interface NoteFormData {
  title: string;
  content: string;
  templateId?: string | null;
  metadata?: Record<string, any>;
}

export const FOLDER_COLORS = [
  { value: "#f59e0b", label: "Ambre", bg: "bg-amber-500" },
  { value: "#ef4444", label: "Rouge", bg: "bg-red-500" },
  { value: "#f97316", label: "Orange", bg: "bg-orange-500" },
  { value: "#84cc16", label: "Citron vert", bg: "bg-lime-500" },
  { value: "#10b981", label: "Vert emeraude", bg: "bg-emerald-500" },
  { value: "#22c55e", label: "Vert", bg: "bg-green-500" },
  { value: "#14b8a6", label: "Sarcelle", bg: "bg-teal-500" },
  { value: "#06b6d4", label: "Cyan", bg: "bg-cyan-500" },
  { value: "#0ea5e9", label: "Ciel", bg: "bg-sky-500" },
  { value: "#3b82f6", label: "Bleu", bg: "bg-blue-500" },
  { value: "#6366f1", label: "Indigo", bg: "bg-indigo-500" },
  { value: "#8b5cf6", label: "Violet", bg: "bg-violet-500" },
  { value: "#a855f7", label: "Pourpre", bg: "bg-purple-500" },
  { value: "#d946ef", label: "Fuchsia", bg: "bg-fuchsia-500" },
  { value: "#ec4899", label: "Rose", bg: "bg-pink-500" },
  { value: "#f43f5e", label: "Rose vif", bg: "bg-rose-500" },
  { value: "#6b7280", label: "Gris", bg: "bg-gray-500" },
  { value: "#57534e", label: "Pierre", bg: "bg-stone-500" },
];

export interface NoteExportData {
  version: number;
  type: "appsuite_note_export";
  folder: {
    name: string;
    color: string;
    customFields?: CustomFieldDefinition[];
  };
  template?: {
    name: string;
    fields: CustomFieldDefinition[];
  };
  note: {
    title: string;
    content: string;
    metadata?: Record<string, any>;
  };
}
