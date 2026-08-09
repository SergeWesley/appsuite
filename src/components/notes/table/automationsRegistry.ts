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
      const groupByColumn = config?.groupByColumn;

      // Sépare les lignes de données des lignes de totaux précédemment générées
      const dataRows = rows.filter(row => row._sourceAutomationId !== automationId);
      const previousTotalRows = rows.filter(row => row._sourceAutomationId === automationId);
      
      if (dataRows.length === 0) {
        return { newRows: rows, hasChanges: false };
      }

      const numericCols = field.columns?.filter((c) => c.type === "number" || c.type === "currency") || [];
      if (numericCols.length === 0) {
        return { newRows: rows, hasChanges: false };
      }

      const textCols = field.columns?.filter((c) => c.type === "text" || c.type === "textarea" || c.type === "select") || [];
      
      // Grouper les lignes de données
      const groups: Record<string, number[]> = {};
      
      dataRows.forEach((row, idx) => {
        const groupKey = groupByColumn && row[groupByColumn] ? String(row[groupByColumn]) : "ALL";
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(idx);
      });

      // Garder les anciens totaux qui ne sont pas recalculés (car plus de données)
      const keptPreviousTotalRows = previousTotalRows.filter(row => {
        const rowGroupKey = groupByColumn && row[groupByColumn] ? String(row[groupByColumn]) : "ALL";
        return !(rowGroupKey in groups);
      });

      const newRows = [...dataRows, ...keptPreviousTotalRows];

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
            const val = dataRows[idx][col.id];
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
