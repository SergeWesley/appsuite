import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomFieldDefinition } from "@/types/notes";
import { useFilterPersistence } from "@/hooks/useFilterPersistence";
import {
  Table,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Maximize2,
  RotateCcw,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnSizingState,
} from "@tanstack/react-table";

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
}

export function PropertyTableEditor({
  field,
  value,
  onChange,
  renderEditor,
  noteId,
}: PropertyTableEditorProps) {
  // On combine l'ID de la note (s'il existe) avec l'ID du champ pour isoler la config par note
  const safeStorageKey = `table-editor-${noteId ? `${noteId}-` : ""}${field.id}`;
  const { tableColumnSizing, updateFilter } = useFilterPersistence(safeStorageKey);

  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  // Synchronisation au chargement : useFilterPersistence lit le LS de manière asynchrone
  // On met donc à jour notre sizing local seulement quand les données finissent d'arriver
  useEffect(() => {
    if (tableColumnSizing && Object.keys(tableColumnSizing).length > 0) {
      setColumnSizing((current) => 
        Object.keys(current).length === 0 ? tableColumnSizing : current
      );
    }
  }, [tableColumnSizing]);

  // Debounce the save to LocalStorage to avoid performance issues during drag
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(columnSizing).length > 0) {
        updateFilter("tableColumnSizing", columnSizing);
      }
    }, 500); // Save half a second after the user stops dragging
    return () => clearTimeout(timer);
  }, [columnSizing, updateFilter]);

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

  // Convert custom field columns to TanStack columns
  const tableColumns = useMemo<ColumnDef<any>[]>(() => {
    if (!field.columns) return [];
    return field.columns.map((col) => ({
      accessorKey: col.id, // access using column ID
      id: col.id,
      header: col.name,
      size: 150, // Base default size
      minSize: 60,
    }));
  }, [field.columns]);

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnSizing,
    },
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing,
  });

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
            } text-left text-sm text-gray-600 border-collapse relative table-fixed`}
            style={{
              width: "100%",
              minWidth: table.getTotalSize(),
            }}
          >
            <thead className="bg-gray-50 uppercase text-xs font-semibold text-gray-500 sticky top-0 z-10 shadow-[0_1px_0_0_#e5e7eb]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const colIndex = columns.findIndex((c) => c.id === header.column.id);
                    if (!expanded && colIndex >= 3) return null;

                    const sortDir = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        className="px-3 py-2 whitespace-nowrap relative border-r border-transparent hover:border-gray-200 group/th"
                        style={{
                          width: header.getSize(),
                        }}
                      >
                        <div
                          className="group flex items-center gap-1 cursor-pointer hover:text-amber-600 transition-colors select-none overflow-hidden"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span className="truncate">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {sortDir === "asc" ? (
                            <ChevronUp size={14} className="shrink-0" />
                          ) : sortDir === "desc" ? (
                            <ChevronDown size={14} className="shrink-0" />
                          ) : (
                            <ChevronUp
                              size={14}
                              className="opacity-0 group-hover:opacity-100 text-gray-300 shrink-0"
                            />
                          )}
                        </div>
                        {/* Resizer Handle */}
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`absolute right-0 top-0 bottom-0 w-3 flex justify-center cursor-col-resize z-10 transition-colors touch-none select-none ${
                            header.column.getIsResizing()
                              ? "bg-amber-400"
                              : "bg-transparent hover:bg-amber-400 group-hover/th:bg-gray-200"
                          }`}
                        >
                          {/* Trait fin visible uniquement sur mobile pour indiquer la zone de redimensionnement */}
                          <div className="w-[1px] h-full bg-gray-200 md:hidden" />
                        </div>
                      </th>
                    );
                  })}
                  {hasHiddenColumns && (
                    <th className="px-3 py-2 whitespace-nowrap text-gray-400 italic font-normal" style={{ width: 120 }}>
                      + {columns.length - 3} autres
                    </th>
                  )}
                  <th className="px-2 py-2 w-16 text-center align-middle">
                    {Object.keys(columnSizing).length > 0 && (
                      <button
                        onClick={() => {
                          setColumnSizing({});
                          updateFilter("tableColumnSizing", undefined);
                        }}
                        className="p-1 text-gray-300 hover:text-amber-600 transition-colors"
                        title="Réinitialiser la largeur des colonnes"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                  </th>
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.map((row) => {
                const rIndex = parseInt(row.id, 10);
                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-gray-50/50 ${
                      editingRowIndex === rIndex ? "bg-amber-50/30" : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const colIndex = columns.findIndex((c) => c.id === cell.column.id);
                      if (!expanded && colIndex >= 3) return null;

                      const colDef = columns[colIndex];

                      return (
                        <td
                          key={cell.id}
                          className="p-1 align-top border-r border-transparent"
                          style={{
                            width: cell.column.getSize(),
                          }}
                        >
                          <div className="w-full h-full overflow-hidden">
                            {renderEditor(
                              colDef,
                              row.original[colDef.id] ?? "",
                              (val) => updateRow(rIndex, colDef.id, val)
                            )}
                          </div>
                        </td>
                      );
                    })}
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
                );
              })}
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
