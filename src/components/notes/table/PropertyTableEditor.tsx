import { CustomFieldDefinition } from "@/types/notes";
import { Plus, CheckSquare, Search } from "lucide-react";
import { useTableLogic } from "./useTableLogic";
import { TableCoreUI } from "./TableCoreUI";
import { TableModals } from "./TableModals";

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
    rowSelection,
    setRowSelection,
    columnSizing,
    resetColumnSizing,
    addRow,
    removeRow,
    updateRow,
    handleSum,
    globalFilter,
    setGlobalFilter,
  } = useTableLogic({ field, value, onChange, noteId, metadata, onMetadataChange });

  return (
    <>
      <div className="mt-2 w-full rounded-lg border border-gray-200 bg-white overflow-hidden flex flex-col h-full">
        <TableCoreUI
          table={table}
          rows={rows}
          columns={field.columns || []}
          isSelectionMode={isSelectionMode}
          editingRowIndex={editingRowIndex}
          setEditingRowIndex={setEditingRowIndex}
          removeRow={removeRow}
          updateRow={updateRow}
          columnSizing={columnSizing}
          resetColumnSizing={resetColumnSizing}
          renderEditor={renderEditor}
        />
        <div className="p-1 bg-gray-50 border-t border-gray-200 shrink-0 flex justify-between items-center gap-2">
          <div className="flex gap-2 shrink-0">
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors w-max"
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
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors w-max ${
                isSelectionMode
                  ? "text-amber-600 bg-amber-50"
                  : "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
              }`}
            >
              <CheckSquare size={14} />
              <span className="hidden sm:inline">Sélectionner</span>
            </button>
          </div>
          
          <div className="relative flex-1 max-w-xs ml-auto">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search size={14} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-gray-700 transition-colors"
            />
          </div>
        </div>
      </div>

      <TableModals
        field={field}
        rows={rows}
        editingRowIndex={editingRowIndex}
        setEditingRowIndex={setEditingRowIndex}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        handleSum={handleSum}
        renderEditor={renderEditor}
        updateRow={updateRow}
      />
    </>
  );
}
