import React from "react";
import { flexRender, Table as TanStackTable } from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronRight, Maximize2, X, RotateCcw, Plus, Archive } from "lucide-react";
import { CustomFieldDefinition } from "@/types/notes";
import { TYPE_CONFIGS } from "../FieldEditorSheet";

interface TableCoreUIProps {
  table: TanStackTable<any>;
  rows: any[];
  columns: CustomFieldDefinition[];
  isSelectionMode: boolean;
  isEditMode?: boolean;
  newlyAddedRowIndices?: Set<number>;
  expandedArchives?: Set<string>;
  setExpandedArchives?: (val: Set<string>) => void;
  handleUnarchive?: (groupId: string) => void;
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
  isMultiSortEnabled?: boolean;
}

export function TableCoreUI({
  table,
  rows,
  columns,
  isSelectionMode,
  isEditMode = true,
  newlyAddedRowIndices = new Set(),
  expandedArchives,
  setExpandedArchives,
  handleUnarchive,
  editingRowIndex,
  setEditingRowIndex,
  removeRow,
  updateRow,
  columnSizing,
  resetColumnSizing,
  renderEditor,
  isMultiSortEnabled = false,
}: TableCoreUIProps) {
  return (
    <div className="w-full overflow-auto flex-1 bg-white relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Vue du tableau */}
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
                    className="px-3 py-2 whitespace-nowrap relative border-r border-gray-200 group/th"
                    style={{
                      width: header.getSize(),
                    }}
                  >
                    <div
                      className="group flex items-center gap-1 cursor-pointer hover:text-amber-600 transition-colors select-none overflow-hidden"
                      onClick={(e) => {
                        const handler = header.column.getToggleSortingHandler();
                        if (handler) {
                          if (isMultiSortEnabled && !e.shiftKey) {
                            // Si le mode tri multiple est activé, on force l'ajout au tri plutôt que de remplacer l'existant
                            header.column.toggleSorting(undefined, true);
                          } else {
                            handler(e);
                          }
                        }
                      }}
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
                    {/* Poignée de redimensionnement */}
                    {header.column.id !== "select" && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute -right-1.5 top-0 bottom-0 w-3 cursor-col-resize z-10 transition-colors touch-none select-none ${
                          header.column.getIsResizing()
                            ? "bg-amber-400"
                            : "bg-transparent hover:bg-amber-400 group-hover/th:bg-gray-200"
                        }`}
                      />
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
        <tbody>
          {(() => {
            const renderedGroups = new Set<string>();
            return table.getRowModel().rows.map((row, index, array) => {
              const rIndex = parseInt(row.id, 10);
              const isRowLocked = !isEditMode && !newlyAddedRowIndices.has(rIndex);
              const archiveGroup = row.original._archiveGroup;
              
              const renderActualRow = () => (
                <tr
                  key={row.id}
                  id={`row-${rIndex}`}
                  onClick={(e) => {
                    if (isSelectionMode) {
                      if ((e.target as HTMLElement).tagName.toLowerCase() === 'input' && (e.target as HTMLInputElement).type === 'checkbox') {
                        return;
                      }
                      row.toggleSelected();
                    }
                  }}
                  className={`group hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-b-0 ${isSelectionMode ? "cursor-pointer" : ""} ${
                    row.getIsSelected() || editingRowIndex === rIndex ? "bg-amber-50/30" : 
                    newlyAddedRowIndices?.has(rIndex) ? "bg-green-50/30" : 
                    archiveGroup ? "bg-amber-50/15" : ""
                  }`}
                >
                {row.getVisibleCells().map((cell) => {
                  if (cell.column.id === "select") {
                    return (
                      <td
                        key={cell.id}
                        className="p-1 align-middle border-r border-gray-100"
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
                        <div className={`flex flex-col w-full h-full ${isSelectionMode || isRowLocked ? "pointer-events-none" : ""}`}>
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
                                const todayStr = new Date().toLocaleDateString("en-CA");
                                subCols.forEach((sc) => {
                                  if (sc.type === "autoincrement") {
                                    const existingValues = subTableData
                                      .map((r: any) => r[sc.id])
                                      .map((v: any) => parseInt(v, 10))
                                      .filter((v: any) => !isNaN(v));
                                    const max = existingValues.length > 0 ? Math.max(...existingValues) : 0;
                                    newSubRow[sc.id] = max + 1;
                                  } else if (sc.type === "date") {
                                    newSubRow[sc.id] = todayStr;
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
                      className="p-1 align-top border-r border-gray-100"
                      style={{
                        width: cell.column.getSize(),
                      }}
                    >
                      <div className={`w-full h-full overflow-hidden ${isSelectionMode || isRowLocked ? "pointer-events-none" : ""}`}>
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
                  <div className={`flex justify-end gap-1 mt-1 pr-1 ${isSelectionMode || isRowLocked ? "pointer-events-none opacity-50" : ""}`}>
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

              if (archiveGroup) {
                if (!renderedGroups.has(archiveGroup)) {
                  renderedGroups.add(archiveGroup);
                  const groupRows = array.filter(r => r.original._archiveGroup === archiveGroup);
                  const groupCount = groupRows.length;
                  const isExpanded = expandedArchives?.has(archiveGroup);
                  
                  const allSelected = groupRows.every(r => r.getIsSelected());
                  const someSelected = groupRows.some(r => r.getIsSelected());

                  const archiveHeader = (
                    <tr
                      key={`archive-${archiveGroup}`}
                      onClick={() => {
                        if (!setExpandedArchives || !expandedArchives) return;
                        const next = new Set(expandedArchives);
                        if (isExpanded) next.delete(archiveGroup);
                        else next.add(archiveGroup);
                        setExpandedArchives(next);
                      }}
                      className={`group/archive cursor-pointer transition-colors border-b last:border-b-0 ${
                        isExpanded
                          ? "bg-amber-50/50 hover:bg-amber-50/70 border-amber-200/70"
                          : "bg-gray-50/80 hover:bg-gray-100/80 border-gray-100"
                      }`}
                      title={isExpanded ? "Cliquer pour replier" : "Cliquer pour afficher les lignes archivées"}
                    >
                      {isSelectionMode && (
                        <td className="p-1 align-middle border-r border-gray-100 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center items-center h-full px-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                              checked={allSelected}
                              ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                              onChange={() => {
                                groupRows.forEach(r => {
                                  r.toggleSelected(!allSelected);
                                });
                              }}
                            />
                          </div>
                        </td>
                      )}
                      <td colSpan={columns.length + (isSelectionMode ? 1 : 1)} className="p-2 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors shadow-sm ${
                              isExpanded
                                ? "bg-amber-100/80 border-amber-300 text-amber-900"
                                : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            {isExpanded ? (
                              <ChevronDown size={14} className="text-amber-700 shrink-0" />
                            ) : (
                              <ChevronRight size={14} className="text-gray-500 shrink-0" />
                            )}
                            <Archive size={13} className={isExpanded ? "text-amber-700 shrink-0" : "text-gray-400 shrink-0"} />
                            <span>
                              {groupCount} ligne{groupCount > 1 ? "s" : ""} archivée{groupCount > 1 ? "s" : ""}
                            </span>
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ml-1 ${
                                isExpanded
                                  ? "bg-amber-200/90 text-amber-900"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {isExpanded ? "Déplié" : "Replié"}
                            </span>
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnarchive?.(archiveGroup);
                            }}
                            className="text-xs text-amber-600 hover:text-amber-700 hover:underline sm:opacity-0 sm:group-hover/archive:opacity-100 transition-opacity ml-2"
                          >
                            Désarchiver
                          </button>
                        </div>
                      </td>
                    </tr>
                  );

                  if (!isExpanded) {
                    return archiveHeader;
                  }

                  return (
                    <React.Fragment key={`${row.id}-frag`}>
                      {archiveHeader}
                      {renderActualRow()}
                    </React.Fragment>
                  );
                } else {
                  if (!expandedArchives?.has(archiveGroup)) {
                    return null;
                  }
                  return renderActualRow();
                }
              }

              return renderActualRow();
            });
          })()}
        </tbody>
      </table>
    </div>
  );
}
