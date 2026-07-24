import { flexRender, Table as TanStackTable } from "@tanstack/react-table";
import { ChevronUp, ChevronDown, Maximize2, X, RotateCcw, Plus } from "lucide-react";
import { CustomFieldDefinition } from "@/types/notes";
import { TYPE_CONFIGS } from "../FieldEditorSheet";

interface TableCoreUIProps {
  table: TanStackTable<any>;
  rows: any[];
  columns: CustomFieldDefinition[];
  isSelectionMode: boolean;
  editingRowIndex: number | null;
  setEditingRowIndex: (idx: number | null) => void;
  removeRow: (idx: number) => void;
  updateRow: (rowIndex: number, colId: string, val: any) => void;
  columnSizing: Record<string, number>;
  resetColumnSizing: () => void;
  renderEditor: (
    field: CustomFieldDefinition,
    value: any,
    onChange: (val: any) => void
  ) => React.ReactNode;
}

export function TableCoreUI({
  table,
  rows,
  columns,
  isSelectionMode,
  editingRowIndex,
  setEditingRowIndex,
  removeRow,
  updateRow,
  columnSizing,
  resetColumnSizing,
  renderEditor,
}: TableCoreUIProps) {
  return (
    <div className="w-full overflow-auto flex-1 bg-white relative">
      {/* Table View */}
      <table
        className="text-left text-sm text-gray-600 border-collapse relative table-fixed"
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
                      <span className="truncate flex items-center gap-1.5">
                        {header.column.id === "select" ? null : (
                          <>
                            {(() => {
                              const meta = header.column.columnDef.meta as any;
                              const colDef = meta?.colDef as CustomFieldDefinition;
                              if (colDef) {
                                const TypeIcon = TYPE_CONFIGS[colDef.type]?.icon;
                                return TypeIcon ? <TypeIcon size={14} className="text-gray-400 shrink-0" /> : null;
                              }
                              return null;
                            })()}
                            <span className="truncate">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>
                          </>
                        )}
                      </span>
                      {header.column.id !== "select" && (
                        <>
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
                        </>
                      )}
                    </div>
                    {/* Resizer Handle */}
                    {header.column.id !== "select" && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute right-0 top-0 bottom-0 w-3 flex justify-center cursor-col-resize z-10 transition-colors touch-none select-none ${
                          header.column.getIsResizing()
                            ? "bg-amber-400"
                            : "bg-transparent hover:bg-amber-400 group-hover/th:bg-gray-200"
                        }`}
                      >
                        <div className="w-[1px] h-full bg-gray-200 md:hidden" />
                      </div>
                    )}
                  </th>
                );
              })}
              <th className="px-2 py-2 w-16 text-center align-middle md:sticky md:right-0 md:bg-gray-50 md:z-20 md:shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] md:border-l md:border-gray-100">
                {Object.keys(columnSizing).length > 0 && (
                  <button
                    onClick={resetColumnSizing}
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
                        <div className="flex justify-center items-center h-full px-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                            checked={row.getIsSelected()}
                            disabled={!row.getCanSelect()}
                            onChange={row.getToggleSelectedHandler()}
                          />
                        </div>
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
                                        { ...scDef, name: scDef.name },
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
                                const newSubRow: Record<string, any> = {};
                                subCols.forEach((sc) => {
                                  if (sc.type === "autoincrement") {
                                    const existingValues = subTableData
                                      .map((r: any) => r[sc.id])
                                      .map((v: any) => parseInt(v, 10))
                                      .filter((v: any) => !isNaN(v));
                                    const max = existingValues.length > 0 ? Math.max(...existingValues) : 0;
                                    newSubRow[sc.id] = max + 1;
                                  }
                                });
                                const newSubData = [...subTableData, newSubRow];
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
  );
}
