import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomFieldDefinition } from "@/types/notes";
import {
  Table,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Maximize2,
} from "lucide-react";

interface PropertyTableEditorProps {
  field: CustomFieldDefinition;
  value: any;
  onChange: (val: any) => void;
  renderEditor: (
    field: CustomFieldDefinition,
    value: any,
    onChange: (val: any) => void
  ) => React.ReactNode;
}

export function PropertyTableEditor({
  field,
  value,
  onChange,
  renderEditor,
}: PropertyTableEditorProps) {
  const [sortConfig, setSortConfig] = useState<{
    colId: string;
    dir: "asc" | "desc";
  } | null>(null);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  const rows = Array.isArray(value) ? value : [];

  const updateRow = (rowIndex: number, colId: string, colValue: any) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [colId]: colValue };
    onChange(newRows);
  };

  const addRow = () => {
    onChange([...rows, {}]);
  };

  const removeRow = (rowIndex: number) => {
    const newRows = [...rows];
    newRows.splice(rowIndex, 1);
    onChange(newRows);
  };

  const handleSort = (colId: string) => {
    const dir =
      sortConfig?.colId === colId && sortConfig.dir === "asc" ? "desc" : "asc";
    setSortConfig({ colId, dir });

    const newRows = [...rows].sort((a, b) => {
      const valA = String(a[colId] ?? "");
      const valB = String(b[colId] ?? "");
      
      const compareResult = valA.localeCompare(valB, undefined, { 
        numeric: true, 
        sensitivity: 'base' 
      });
      
      return dir === "asc" ? compareResult : -compareResult;
    });
    onChange(newRows);
  };

  if (!field.columns || field.columns.length === 0) {
    return (
      <div className="text-sm text-gray-400 italic">
        Aucune colonne définie.
      </div>
    );
  }

  const columns = field.columns;

  const renderTableUI = (expanded: boolean) => {
    const displayColumns = expanded ? columns : columns.slice(0, 3);
    const hasHiddenColumns = !expanded && columns.length > 3;

    return (
      <div className="mt-2 w-full rounded-lg border border-gray-200 bg-white overflow-hidden flex flex-col h-full">
        <div className="w-full overflow-auto flex-1 bg-white relative">
          {/* Mobile Card View (Only when expanded) */}
          {expanded && (
            <div className="md:hidden flex flex-col divide-y divide-gray-100 w-full">
              {rows.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400 italic">
                  Aucune donnée
                </div>
              ) : (
                rows.map((rowValue, rIndex) => (
                  <div
                    key={`card-${rIndex}`}
                    className="p-4 flex flex-col gap-3 relative group hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="absolute top-3 right-3 flex gap-1 z-10">
                      <button
                        onClick={() => setEditingRowIndex(rIndex)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors bg-white shadow-sm border border-gray-100"
                        title="Éditer la ligne complète"
                      >
                        <Maximize2 size={14} />
                      </button>
                      <button
                        onClick={() => removeRow(rIndex)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors bg-white shadow-sm border border-gray-100"
                        title="Supprimer la ligne"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 pr-16">
                      {displayColumns.map((col) => (
                        <div key={col.id} className="flex flex-col">
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            {col.name}
                          </span>
                          <div className="min-h-[32px] flex items-center bg-gray-50/50 rounded border border-transparent focus-within:border-amber-200 focus-within:bg-white transition-colors">
                            {renderEditor(col, rowValue[col.id] ?? "", (val) =>
                              updateRow(rIndex, col.id, val)
                            )}
                          </div>
                        </div>
                      ))}
                      {hasHiddenColumns && (
                        <button
                          onClick={() => setEditingRowIndex(rIndex)}
                          className="text-xs text-left text-amber-600 italic py-1 hover:text-amber-700 font-medium"
                        >
                          + {columns.length - 3} autres champs (éditer pour
                          voir)
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Table View */}
          <table
            className={`${
              expanded ? "hidden md:table" : ""
            } w-full text-left text-sm text-gray-600 min-w-full border-collapse relative`}
          >
            <thead className="bg-gray-50 uppercase text-xs font-semibold text-gray-500 sticky top-0 z-10 shadow-[0_1px_0_0_#e5e7eb]">
              <tr>
                {displayColumns.map((col) => (
                  <th key={col.id} className="px-3 py-2 whitespace-nowrap">
                    <div
                      className="group flex items-center gap-1 cursor-pointer hover:text-amber-600 transition-colors select-none"
                      onClick={() => handleSort(col.id)}
                    >
                      {col.name}
                      {sortConfig?.colId === col.id ? (
                        sortConfig.dir === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )
                      ) : (
                        <ChevronUp
                          size={14}
                          className="opacity-0 group-hover:opacity-100 text-gray-300"
                        />
                      )}
                    </div>
                  </th>
                ))}
                {hasHiddenColumns && (
                  <th className="px-3 py-2 whitespace-nowrap text-gray-400 italic font-normal">
                    + {columns.length - 3} autres
                  </th>
                )}
                <th className="px-2 py-2 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((rowValue, rIndex) => (
                <tr
                  key={rIndex}
                  className={`hover:bg-gray-50/50 ${
                    editingRowIndex === rIndex ? "bg-amber-50/30" : ""
                  }`}
                >
                  {displayColumns.map((col) => (
                    <td key={col.id} className="p-1 min-w-[120px] align-top">
                      {renderEditor(col, rowValue[col.id] ?? "", (val) =>
                        updateRow(rIndex, col.id, val)
                      )}
                    </td>
                  ))}
                  {hasHiddenColumns && (
                    <td className="p-1 align-middle text-center text-gray-300 italic">
                      ...
                    </td>
                  )}
                  <td className="p-1 align-middle text-right flex justify-end gap-1 mt-1">
                    <button
                      onClick={() => setEditingRowIndex(rIndex)}
                      className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                      title="Éditer la ligne complète"
                    >
                      <Maximize2 size={14} />
                    </button>
                    <button
                      onClick={() => removeRow(rIndex)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Supprimer la ligne"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-1 bg-gray-50 border-t border-gray-200 shrink-0 flex justify-between items-center">
          <button
            onClick={addRow}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors w-max"
          >
            <Plus size={14} />
            Ajouter une ligne
          </button>
          {!expanded && (
            <button
              onClick={() => setIsTableExpanded(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded transition-colors"
              title="Ouvrir en plein écran"
            >
              <Maximize2 size={14} />
              Plein écran
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderTableUI(false)}

      <AnimatePresence>
        {isTableExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 sm:p-8"
            onClick={() => setIsTableExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-amber-50 shrink-0">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Table size={20} className="text-amber-600" />
                  {field.name}
                </h3>
                <button
                  onClick={() => setIsTableExpanded(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-2 sm:p-4 flex-1 overflow-hidden flex flex-col relative w-full bg-gray-50/30 min-h-[50vh]">
                {renderTableUI(true)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </>
  );
}
