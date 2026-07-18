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
  Sigma,
  CheckSquare,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnSizingState,
  RowSelectionState,
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
  const dbSettings = useMemo(() => {
    return metadata?._tableSettings?.[field.id] || {};
  }, [metadata, field.id]);

  const safeStorageKey = `table-editor-${noteId ? `${noteId}-` : ""}${field.id}`;
  const { tableColumnSizing } = useFilterPersistence(safeStorageKey);

  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  
  const [sorting, setSorting] = useState<SortingState>(dbSettings.sorting || []);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(dbSettings.columnSizing || {});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Synchronize state when dbSettings changes (e.g. late data loading or note switch)
  useEffect(() => {
    if (dbSettings.sorting) {
      setSorting((current) =>
        JSON.stringify(current) !== JSON.stringify(dbSettings.sorting)
          ? dbSettings.sorting
          : current
      );
    }
    if (dbSettings.columnSizing) {
      setColumnSizing((current) =>
        JSON.stringify(current) !== JSON.stringify(dbSettings.columnSizing)
          ? dbSettings.columnSizing
          : current
      );
    }
  }, [dbSettings.sorting, dbSettings.columnSizing]);

  useEffect(() => {
    if (Object.keys(dbSettings.columnSizing || {}).length === 0 && tableColumnSizing && Object.keys(tableColumnSizing).length > 0) {
      setColumnSizing((current) => 
        Object.keys(current).length === 0 ? tableColumnSizing : current
      );
    }
  }, [tableColumnSizing, dbSettings.columnSizing]);

  const updateSettings = (newSettings: any) => {
    if (!onMetadataChange) return;
    const currentTableSettings = metadata?._tableSettings || {};
    const fieldSettings = currentTableSettings[field.id] || {};
    
    onMetadataChange("_tableSettings", {
      ...currentTableSettings,
      [field.id]: {
        ...fieldSettings,
        ...newSettings
      }
    });
  };

  const handleSortingChange = (updaterOrValue: any) => {
    const newSorting = typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue;
    setSorting(newSorting);
    updateSettings({ sorting: newSorting });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(columnSizing).length > 0) {
        updateSettings({ columnSizing });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [columnSizing]);

  const rows = useMemo(() => (Array.isArray(value) ? value : []), [value]);

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
    const cols: ColumnDef<any>[] = [];
    if (!field.columns) return cols;

    cols.push({
      id: "select",
      header: () => null,
      cell: ({ row }) => (
        <div className="flex justify-center items-center h-full px-2">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        </div>
      ),
      size: 40,
      minSize: 40,
      enableResizing: false,
    });

    cols.push(
      ...field.columns.map((col) => {
        const isNumeric = col.type === "number" || col.type === "currency";
        return {
          accessorKey: col.id, // accès via l'ID de la colonne
          id: col.id,
          header: col.name,
          size: 150, // Taille par défaut de base
          minSize: 60,
          meta: { colDef: col },
          ...(isNumeric ? {
            sortingFn: (rowA: any, rowB: any, columnId: string) => {
              const a = parseFloat(rowA.getValue(columnId));
              const b = parseFloat(rowB.getValue(columnId));
              const numA = isNaN(a) ? -Infinity : a;
              const numB = isNaN(b) ? -Infinity : b;
              return numA < numB ? -1 : numA > numB ? 1 : 0;
            }
          } : {})
        };
      })
    );

    return cols;
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
      rowSelection,
      columnVisibility: {
        select: isSelectionMode,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    onColumnSizingChange: setColumnSizing,
  });

  if (!field.columns || field.columns.length === 0) {
    return (
      <div className="text-sm text-gray-400 italic">
        Aucune colonne définie.
      </div>
    );
  }

  const handleSum = () => {
    const selectedIndices = Object.keys(rowSelection).map(Number);
    if (selectedIndices.length === 0) return;

    const numericCols = field.columns?.filter((c) => c.type === "number" || c.type === "currency") || [];
    if (numericCols.length === 0) {
      setRowSelection({});
      return;
    }

    const newRow: any = {};
    const textCols = field.columns?.filter((c) => c.type === "text" || c.type === "textarea" || c.type === "select") || [];
    
    if (textCols.length > 0) {
      newRow[textCols[0].id] = "Total";
    }

    numericCols.forEach((col) => {
      const sum = selectedIndices.reduce((acc, idx) => {
        const val = rows[idx][col.id];
        const num = parseFloat(val);
        return acc + (isNaN(num) ? 0 : num);
      }, 0);
      newRow[col.id] = sum.toString();
    });

    onChange([...rows, newRow]);
    setRowSelection({});
  };

  const columns = field.columns;

  const renderTableUI = (expanded: boolean) => {
    const displayColumns = columns;

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
                rows.map((rowValue, rIndex) => {
                  const row = table.getRowModel().rows[rIndex];
                  return (
                    <div
                      key={`card-${rIndex}`}
                      className={`p-4 flex flex-col gap-3 relative group transition-colors ${row?.getIsSelected() ? "bg-amber-50/50" : "hover:bg-gray-50/50"}`}
                    >
                      {isSelectionMode && (
                        <div className="absolute top-4 left-4 flex gap-1 z-10">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                            checked={row?.getIsSelected() || false}
                            onChange={row?.getToggleSelectedHandler()}
                          />
                        </div>
                      )}
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
                      </div>
                    </div>
                  );
                })
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
                  <th className="px-2 py-2 w-16 text-center align-middle md:sticky md:right-0 md:bg-gray-50 md:z-20 md:shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] md:border-l md:border-gray-100">
                    {Object.keys(columnSizing).length > 0 && (
                      <button
                        onClick={() => {
                          setColumnSizing({});
                          updateSettings({ columnSizing: {} });
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
                    className={`group hover:bg-gray-50/50 ${
                      row.getIsSelected() || editingRowIndex === rIndex ? "bg-amber-50/30" : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => {
                      if (cell.column.id === "select") {
                        return (
                          <td
                            key={cell.id}
                            className="p-1 align-middle border-r border-transparent"
                            style={{ width: cell.column.getSize() }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      }

                      const meta = cell.column.columnDef.meta as any;
                      const colDef = meta?.colDef as CustomFieldDefinition;
                      if (!colDef) return null;

                      if (colDef.type === "table") {
                        const subCols = colDef.columns || [];
                        const subTableData = Array.isArray(row.original[colDef.id]) ? row.original[colDef.id] : [];
                        
                        return (
                          <td
                            key={cell.id}
                            className="p-1 align-top border-r border-gray-100"
                            style={{
                              width: cell.column.getSize(),
                            }}
                          >
                            <div className="flex flex-col w-full h-full">
                              {subTableData.length === 0 ? (
                                <div className="p-2 text-xs text-gray-400 italic">Aucune entrée</div>
                              ) : (
                                subTableData.map((subRow: any, subIndex: number) => (
                                  <div key={subIndex} className="flex flex-row border-b border-gray-100 last:border-b-0 w-full group/subrow relative">
                                    {subCols.map((scDef, scIdx) => (
                                      <div 
                                        key={scDef.id} 
                                        className={`flex-1 p-1 shrink-0 ${scIdx < subCols.length - 1 ? 'border-r border-gray-100' : 'pr-8'}`}
                                      >
                                        <div className="w-full h-full overflow-hidden">
                                          {renderEditor(
                                            { ...scDef, name: scDef.name }, // This is passed directly as field to PropertyValueEditor
                                            subRow[scDef.id] ?? "",
                                            (val) => {
                                              const newSubData = [...subTableData];
                                              newSubData[subIndex] = { ...newSubData[subIndex], [scDef.id]: val };
                                              updateRow(rIndex, colDef.id, newSubData);
                                            }
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                    {/* Bouton de suppression */}
                                    <div className="w-0 relative">
                                      <button 
                                        onClick={() => {
                                          const newSubData = [...subTableData];
                                          newSubData.splice(subIndex, 1);
                                          updateRow(rIndex, colDef.id, newSubData);
                                        }}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-60 md:opacity-0 md:group-hover/subrow:opacity-100 transition-opacity bg-white/90 shadow-sm border border-gray-100 rounded z-10"
                                        title="Supprimer la sous-ligne"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                              <div className="p-1">
                                <button
                                  onClick={() => {
                                    const newSubData = [...subTableData, {}];
                                    updateRow(rIndex, colDef.id, newSubData);
                                  }}
                                  className="text-gray-400 hover:text-amber-600 hover:bg-gray-50 rounded p-1 flex items-center justify-center transition-colors w-max"
                                  title={`Ajouter ${colDef.name}`}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          </td>
                        );
                      }

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
                    <td
                      className={`p-1 align-middle transition-colors md:sticky md:right-0 md:z-10 md:border-l md:border-gray-100 md:shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] ${
                        editingRowIndex === rIndex ? "bg-amber-50" : "md:bg-white md:group-hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-end gap-1 mt-1 pr-1">
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
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-1 bg-gray-50 border-t border-gray-200 shrink-0 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors w-max"
            >
              <Plus size={14} />
              Ajouter une ligne
            </button>
            <button
              onClick={() => {
                if (isSelectionMode) setRowSelection({});
                setIsSelectionMode(!isSelectionMode);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors w-max ${
                isSelectionMode
                  ? "text-amber-600 bg-amber-50"
                  : "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
              }`}
            >
              <CheckSquare size={14} />
              Sélectionner
            </button>
          </div>
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
