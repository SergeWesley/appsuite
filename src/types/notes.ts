export type CustomFieldType = 
  | "text"      // Texte court (ex: Nom, Titre)
  | "textarea"  // Texte long (ex: Description, Résumé)
  | "number"    // Nombre (ex: Temps, Quantité)
  | "currency"  // Monnaie (ex: Prix, Budget)
  | "checkbox"  // Vrai/Faux (ex: Urgent, Végétarien)
  | "date"      // Date (ex: Date limite, Date de création cible)
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
  parentId?: string | null; // Null si dossier racine
  customFields?: CustomFieldDefinition[]; // Configuration des champs dynamiques
  noteCount?: number;
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
  title: string;
  content: string;
  userId: string;
  metadata?: Record<string, any>; // Les valeurs stockées pour les champs dynamiques (clé: field_id, valeur: texte/nombre/etc)
  dateCreated: Date;
  dateUpdated: Date;
}

export interface NoteFormData {
  title: string;
  content: string;
  metadata?: Record<string, any>;
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

export interface NoteExportData {
  version: number;
  type: "appsuite_note_export";
  folder: {
    name: string;
    color: string;
    customFields?: CustomFieldDefinition[];
  };
  note: {
    title: string;
    content: string;
    metadata?: Record<string, any>;
  };
}
