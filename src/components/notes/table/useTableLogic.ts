import { useState, useMemo, useEffect } from "react";
import { CustomFieldDefinition } from "@/types/notes";
import { useFilterPersistence } from "@/hooks/useFilterPersistence";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
  ColumnSizingState,
  RowSelectionState,
} from "@tanstack/react-table";

interface UseTableLogicProps {
  field: CustomFieldDefinition;
  value: any;
  onChange: (val: any) => void;
  noteId?: string;
  metadata?: Record<string, any>;
  onMetadataChange?: (key: string, val: any) => void;
}

export function useTableLogic({
  field,
  value,
  onChange,
  noteId,
  metadata,
  onMetadataChange,
}: UseTableLogicProps) {
  const dbSettings = useMemo(() => {
    return metadata?._tableSettings?.[field.id] || {};
  }, [metadata, field.id]);

  const safeStorageKey = `table-editor-${noteId ? `${noteId}-` : ""}${field.id}`;
  const { tableColumnSizing } = useFilterPersistence(safeStorageKey);

  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  
  const [sorting, setSorting] = useState<SortingState>(dbSettings.sorting || []);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(dbSettings.columnSizing || {});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Synchronize state when dbSettings changes
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
    
    let hasChanges = false;
    for (const key in newSettings) {
      if (JSON.stringify(newSettings[key]) !== JSON.stringify(fieldSettings[key])) {
        hasChanges = true;
        break;
      }
    }
    
    if (!hasChanges) return;

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

  // Génération automatique des ID manquants pour les lignes et sous-lignes existantes
  useEffect(() => {
    if (!field.columns || rows.length === 0) return;

    const fixAutoincrements = (cols: CustomFieldDefinition[], data: any[]): { fixedData: any[], changed: boolean } => {
      let changed = false;
      const newData = [...data];

      // Correction au niveau courant
      const autoCols = cols.filter(c => c.type === "autoincrement");
      autoCols.forEach(col => {
        const existingIds = newData
          .map(r => r?.[col.id])
          .map(v => parseInt(v, 10))
          .filter(v => !isNaN(v));
        
        let nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

        newData.forEach((row, i) => {
          if (!row) return;
          const val = parseInt(row[col.id], 10);
          if (isNaN(val) || val === null || val === undefined) {
            newData[i] = { ...newData[i], [col.id]: nextId };
            nextId++;
            changed = true;
          }
        });
      });

      // Parcours récursif des sous-tableaux
      const tableCols = cols.filter(c => c.type === "table" && c.columns && c.columns.length > 0);
      tableCols.forEach(tableCol => {
        newData.forEach((row, i) => {
          if (!row) return;
          const subData = Array.isArray(row[tableCol.id]) ? row[tableCol.id] : [];
          if (subData.length > 0) {
            const result = fixAutoincrements(tableCol.columns!, subData);
            if (result.changed) {
              newData[i] = { ...newData[i], [tableCol.id]: result.fixedData };
              changed = true;
            }
          }
        });
      });

      return { fixedData: newData, changed };
    };

    const result = fixAutoincrements(field.columns, rows);
    if (result.changed) {
      onChange(result.fixedData);
    }
  }, [field.columns, rows, onChange]);

  const updateRow = (rowIndex: number, colId: string, colValue: any) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [colId]: colValue };
    onChange(newRows);
  };

  const addRow = () => {
    const newRow: Record<string, any> = {};
    if (field.columns) {
      field.columns.forEach((col) => {
        if (col.type === "autoincrement") {
          const existingValues = rows
            .map((r) => r[col.id])
            .map((v) => parseInt(v, 10))
            .filter((v) => !isNaN(v));
          const max = existingValues.length > 0 ? Math.max(...existingValues) : 0;
          newRow[col.id] = max + 1;
        }
      });
    }
    onChange([...rows, newRow]);
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

    // We do NOT render the cell here, we only define the id "select" 
    // The rendering of the checkbox is handled in TableCoreUI
    cols.push({
      id: "select",
      header: () => null,
      size: 40,
      minSize: 40,
      enableResizing: false,
    });

    cols.push(
      ...field.columns.map((col) => {
        const isNumeric = col.type === "number" || col.type === "currency" || col.type === "autoincrement";
        return {
          accessorKey: col.id,
          id: col.id,
          header: col.name,
          size: 150,
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

  const resetColumnSizing = () => {
    setColumnSizing({});
    updateSettings({ columnSizing: {} });
  };

  return {
    table,
    rows,
    columns: field.columns || [],
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
  };
}
