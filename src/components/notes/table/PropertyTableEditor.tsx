import { useRef, useState } from "react";
import { CustomFieldDefinition } from "@/types/notes";
import { Plus, CheckSquare, Search, X, Lock, Unlock, Zap, CalendarClock, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTableLogic } from "./useTableLogic";
import { runAutomations } from "./useTableAutomations";
import { AUTOMATIONS_REGISTRY } from "./automationsRegistry";
import { TableCoreUI } from "./TableCoreUI";
import { TableModals } from "./TableModals";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

interface PropertyTableEditorProps {
  field: CustomFieldDefinition;
  value: any;
  onChange: (val: any) => void;
  renderEditor: (
    field: CustomFieldDefinition,
    value: any,
    onChange: (val: any) => void
  ) => React.ReactNode;
  noteId?: string;
  metadata?: Record<string, any>;
  onMetadataChange?: (key: string, val: any) => void;
}

export function PropertyTableEditor({
  field,
  value,
  onChange,
  renderEditor,
  noteId,
  metadata,
  onMetadataChange,
}: PropertyTableEditorProps) {
  const {
    table,
    rows,
    editingRowIndex,
    setEditingRowIndex,
    isSelectionMode,
    setIsSelectionMode,
    isEditMode,
    setIsEditMode,
    newlyAddedRowIndices,
    rowSelection,
    setRowSelection,
    columnSizing,
    resetColumnSizing,
    addRow,
    removeRow,
    updateRow,
    handleSum,
    handleArchive,
    handleUnarchive,
    expandedArchives,
    setExpandedArchives,
    globalFilter,
    setGlobalFilter,
  } = useTableLogic({ field, value, onChange, noteId, metadata, onMetadataChange });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showAutomationsPopup, setShowAutomationsPopup] = useState(false);
  const activeAutomations = field.automations?.filter(a => a.enabled) || [];

  const handleForceRun = (automationId: string) => {
    const automationsState = metadata?._automationsState || {};
    const { updatedRows, updatedState, hasChanges } = runAutomations(field, rows, automationsState, automationId);

    if (hasChanges) {
      if (onMetadataChange) {
        onMetadataChange("_automationsState", updatedState);
      }
      onChange(updatedRows);
    }
  };

  useKeyboardShortcut([
    {
      key: "f",
      metaKey: true,
      action: (e) => {
        if (!containerRef.current) return;
        if (
          containerRef.current.contains(document.activeElement) ||
          containerRef.current.matches(":hover")
        ) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      },
    },
    {
      key: "f",
      ctrlKey: true,
      action: (e) => {
        if (!containerRef.current) return;
        if (
          containerRef.current.contains(document.activeElement) ||
          containerRef.current.matches(":hover")
        ) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      },
    },
  ]);

  return (
    <div ref={containerRef} className="h-full">
      <div className="mt-2 w-full rounded-lg border border-gray-200 bg-white overflow-hidden flex flex-col h-full">
        <div className="p-2 bg-gray-50 border-b border-gray-200 shrink-0 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
          <div className="flex gap-2 shrink-0 justify-start">
            <button
              onClick={() => {
                addRow();
                setTimeout(() => {
                  document.getElementById(`row-${rows.length}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 100);
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors flex-1 sm:flex-none sm:w-max"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Ajouter une ligne</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
            <button
              onClick={() => {
                if (isSelectionMode) setRowSelection({});
                setIsSelectionMode(!isSelectionMode);
              }}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors flex-1 sm:flex-none sm:w-max ${
                isSelectionMode
                  ? "text-amber-600 bg-amber-50"
                  : "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
              }`}
            >
              <CheckSquare size={14} />
              <span>Sélectionner</span>
            </button>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors flex-1 sm:flex-none sm:w-max ${
                isEditMode
                  ? "text-amber-600 bg-amber-50"
                  : "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
              }`}
            >
              {isEditMode ? <Unlock size={14} /> : <Lock size={14} />}
              <span className="hidden sm:inline">{isEditMode ? "Mode édition" : "Verrouillé"}</span>
              <span className="sm:hidden">{isEditMode ? "Éditer" : "Verrou"}</span>
            </button>
            {activeAutomations.length > 0 && (
              <button
                onClick={() => setShowAutomationsPopup(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors flex-1 sm:flex-none sm:w-max"
                title={`${activeAutomations.length} automatisation(s) active(s)`}
              >
                <Zap size={14} className="fill-purple-600" />
                <span className="hidden sm:inline">{activeAutomations.length} active(s)</span>
                <span className="sm:hidden">{activeAutomations.length}</span>
              </button>
            )}
          </div>
          
          <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs sm:ml-auto">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search size={14} className="text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-gray-700 transition-colors"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                title="Effacer la recherche"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        <TableCoreUI
          table={table}
          rows={rows}
          columns={field.columns || []}
          isSelectionMode={isSelectionMode}
          isEditMode={isEditMode}
          newlyAddedRowIndices={newlyAddedRowIndices}
          editingRowIndex={editingRowIndex}
          setEditingRowIndex={setEditingRowIndex}
          removeRow={removeRow}
          updateRow={updateRow}
          columnSizing={columnSizing}
          resetColumnSizing={resetColumnSizing}
          renderEditor={renderEditor}
          expandedArchives={expandedArchives}
          setExpandedArchives={setExpandedArchives}
          handleUnarchive={handleUnarchive}
        />

      </div>

      <TableModals
        field={field}
        rows={rows}
        editingRowIndex={editingRowIndex}
        setEditingRowIndex={setEditingRowIndex}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        handleSum={handleSum}
        handleArchive={handleArchive}
        renderEditor={renderEditor}
        updateRow={updateRow}
      />

      <AnimatePresence>
        {showAutomationsPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={() => setShowAutomationsPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-purple-100 flex items-center justify-between bg-purple-50 shrink-0">
                <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                  <Zap size={18} className="fill-purple-600 text-purple-600" />
                  Automatisations du tableau
                </h3>
                <button
                  onClick={() => setShowAutomationsPopup(false)}
                  className="p-2 text-purple-400 hover:text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {activeAutomations.map(auto => (
                  <div key={auto.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-gray-900">{AUTOMATIONS_REGISTRY[auto.type]?.name || auto.type}</div>
                      <button 
                        onClick={() => handleForceRun(auto.id)}
                        className="flex items-center gap-1 text-xs px-2 py-1 bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 rounded shadow-sm transition-colors"
                        title="Forcer l'exécution maintenant"
                      >
                        <Play size={12} />
                        Lancer
                      </button>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1.5">
                      <CalendarClock size={14} />
                      Exécution : {AUTOMATIONS_REGISTRY[auto.type]?.defaultSchedule === 'daily_midnight' ? 'À minuit' : (auto.schedule || 'À minuit')}
                    </div>
                    {metadata?._automationsState?.[auto.id] && (
                      <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
                        Dernière exécution : {new Date(metadata._automationsState[auto.id]).toLocaleString('fr-FR')}
                      </div>
                    )}
                  </div>
                ))}
                {activeAutomations.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Aucune automatisation active.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
