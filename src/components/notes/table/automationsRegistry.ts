import { CustomFieldDefinition } from "@/types/notes";

export interface AutomationConfigField {
  id: string;
  label: string;
  type: "column_select" | "text" | "number";
  description?: string;
}

export interface AutomationDefinition {
  id: string;
  name: string;
  description: string;
  defaultSchedule: "daily_midnight" | "weekly" | "monthly" | "on_change";
  configFields?: AutomationConfigField[];
  execute: (field: CustomFieldDefinition, rows: any[], config?: Record<string, any>, automationId?: string) => { newRows: any[]; hasChanges: boolean };
}

export const AUTOMATIONS_REGISTRY: Record<string, AutomationDefinition> = {
  daily_sum: {
    id: "daily_sum",
    name: "Somme (Groupée par clé)",
    description: "Fait la somme des colonnes numériques pour chaque groupe ayant la même valeur dans la colonne clé choisie.",
    defaultSchedule: "daily_midnight",
    configFields: [
      {
        id: "groupByColumn",
        label: "Colonne de regroupement (Optionnelle)",
        type: "column_select",
        description: "Laissez vide pour faire un total global sur tout le tableau."
      }
    ],
    execute: (field: CustomFieldDefinition, rows: any[], config?: Record<string, any>, automationId?: string) => {
      // 1. Supprimer les lignes précédemment générées par cette automatisation
      let currentRows = rows.filter(row => row._sourceAutomationId !== automationId);
      
      const indicesToSum: number[] = [];
      currentRows.forEach((row, idx) => {
        // On inclut toutes les lignes (même archivées) pour ne pas perdre les totaux du passé !
        indicesToSum.push(idx);
      });

      if (indicesToSum.length === 0) {
        return { newRows: rows, hasChanges: false }; // Note : on retourne les lignes d'origine s'il n'y a rien à sommer, pour éviter de supprimer les totaux par erreur si le tableau a été vidé.
      }

      const numericCols = field.columns?.filter((c) => c.type === "number" || c.type === "currency") || [];
      if (numericCols.length === 0) {
        return { newRows: currentRows, hasChanges: rows.length !== currentRows.length };
      }

      const textCols = field.columns?.filter((c) => c.type === "text" || c.type === "textarea" || c.type === "select") || [];
      
      const groupByColumn = config?.groupByColumn;

      // Grouper les lignes
      const groups: Record<string, number[]> = {};
      
      indicesToSum.forEach(idx => {
        const row = currentRows[idx];
        const groupKey = groupByColumn && row[groupByColumn] ? String(row[groupByColumn]) : "ALL";
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(idx);
      });

      const newRows = [...currentRows];

      // Pour chaque groupe, créer une ligne de total
      Object.entries(groups).forEach(([groupKey, indices]) => {
        const totalRow: any = {
          _sourceAutomationId: automationId // Marque la ligne comme générée par cette automatisation
        };
        
        if (groupByColumn) {
          totalRow[groupByColumn] = groupKey;
        }

        if (textCols.length > 0) {
          const targetTextCol = textCols.find(c => c.id !== groupByColumn) || textCols[0];
          totalRow[targetTextCol.id] = groupByColumn && groupKey !== "ALL" ? `Total (${groupKey})` : "Total";
        }

        numericCols.forEach((col) => {
          const sum = indices.reduce((acc, idx) => {
            const val = currentRows[idx][col.id];
            const num = parseFloat(val);
            return acc + (isNaN(num) ? 0 : num);
          }, 0);
          totalRow[col.id] = sum.toString();
        });

        newRows.push(totalRow);
      });

      return { newRows, hasChanges: true };
    }
  }
};
