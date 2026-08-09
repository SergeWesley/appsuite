import { CustomFieldDefinition } from "@/types/notes";
import { AUTOMATIONS_REGISTRY } from "./automationsRegistry";

export interface AutomationsState {
  [automationId: string]: string; // Date ISO de dernière exécution
}

export function runAutomations(
  field: CustomFieldDefinition,
  rows: any[],
  automationsState: AutomationsState = {},
  forceAutomationId?: string
): { updatedRows: any[]; updatedState: AutomationsState; hasChanges: boolean } {
  if (!field.automations || field.automations.length === 0) {
    return { updatedRows: rows, updatedState: automationsState, hasChanges: false };
  }

  let currentRows = [...rows];
  const newState = { ...automationsState };
  let anyChanges = false;

  const now = new Date();
  const currentDateString = now.toISOString().split("T")[0]; // YYYY-MM-DD

  for (const automation of field.automations) {
    if (forceAutomationId && automation.id !== forceAutomationId) continue;
    if (!forceAutomationId && !automation.enabled) continue;

    const def = AUTOMATIONS_REGISTRY[automation.type];
    if (!def) continue;

    if (automation.schedule === "daily_midnight" || forceAutomationId === automation.id) {
      const lastRun = newState[automation.id];
      const lastRunDateString = lastRun ? new Date(lastRun).toISOString().split("T")[0] : null;

      // Si l'automatisation n'a pas tourné aujourd'hui, ou si on force l'exécution
      if (lastRunDateString !== currentDateString || forceAutomationId === automation.id) {
        
        const result = def.execute(field, currentRows, automation.config, automation.id);
        if (result.hasChanges) {
          currentRows = result.newRows;
          anyChanges = true;
        }

        // On met à jour la date d'exécution pour éviter les boucles (ou refléter le forcage)
        newState[automation.id] = now.toISOString();
        anyChanges = true;
      }
    }
  }

  return { updatedRows: currentRows, updatedState: newState, hasChanges: anyChanges };
}
