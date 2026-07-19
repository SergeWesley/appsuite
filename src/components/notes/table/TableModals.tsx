import { motion, AnimatePresence } from "framer-motion";
import { X, Table, Maximize2, Sigma } from "lucide-react";
import { CustomFieldDefinition } from "@/types/notes";
import { RowSelectionState } from "@tanstack/react-table";

interface TableModalsProps {
  field: CustomFieldDefinition;
  rows: any[];
  editingRowIndex: number | null;
  setEditingRowIndex: (idx: number | null) => void;
  rowSelection: RowSelectionState;
  setRowSelection: (val: RowSelectionState) => void;
  handleSum: () => void;
  renderEditor: (
    field: CustomFieldDefinition,
    value: any,
    onChange: (val: any) => void
  ) => React.ReactNode;
  updateRow: (rowIndex: number, colId: string, val: any) => void;
}

export function TableModals({
  field,
  rows,
  editingRowIndex,
  setEditingRowIndex,
  rowSelection,
  setRowSelection,
  handleSum,
  renderEditor,
  updateRow,
}: TableModalsProps) {
  const columns = field.columns || [];

  return (
    <>
      <AnimatePresence>
        {editingRowIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={() => setEditingRowIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-amber-50 shrink-0">
                <h3 className="font-semibold text-gray-900">
                  Édition de la ligne {editingRowIndex + 1}
                </h3>
                <button
                  onClick={() => setEditingRowIndex(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {columns.map((col) => (
                  <div key={col.id} className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      {col.name}
                    </label>
                    <div className="p-1 border border-gray-200 rounded-lg bg-gray-50/50">
                      {renderEditor(
                        col,
                        rows[editingRowIndex]
                          ? rows[editingRowIndex][col.id] ?? ""
                          : "",
                        (val) => updateRow(editingRowIndex, col.id, val)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {Object.keys(rowSelection).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4 z-[80]"
          >
            <span className="text-sm font-medium whitespace-nowrap">
              {Object.keys(rowSelection).length} ligne{Object.keys(rowSelection).length > 1 ? "s" : ""} sélectionnée{Object.keys(rowSelection).length > 1 ? "s" : ""}
            </span>
            <div className="w-px h-5 bg-gray-700" />
            <button
              onClick={handleSum}
              className="flex items-center gap-2 text-sm font-medium hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              <Sigma size={16} />
              Somme
            </button>
            <div className="w-px h-5 bg-gray-700" />
            <button
              onClick={() => setRowSelection({})}
              className="text-gray-400 hover:text-white transition-colors"
              title="Annuler la sélection"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
