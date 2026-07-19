import { CustomFieldDefinition } from "@/types/notes";
import { Plus, Maximize2, CheckSquare } from "lucide-react";
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
