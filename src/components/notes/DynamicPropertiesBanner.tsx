"use client";

import { CustomFieldDefinition, CustomFieldType } from "@/types/notes";
import { Type, List, Hash, Calendar, CheckSquare, Palette, Star, Link, Euro, Table, Plus, X, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

interface DynamicPropertiesBannerProps {
  fields: CustomFieldDefinition[];
  metadata: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const TYPE_ICONS: Record<CustomFieldType, React.ElementType> = {
  text: Type,
  textarea: List,
  number: Hash,
  currency: Euro,
  checkbox: CheckSquare,
  date: Calendar,
  select: List,
  color: Palette,
  rating: Star,
  url: Link,
  table: Table,
};

export function DynamicPropertiesBanner({ fields, metadata, onChange }: DynamicPropertiesBannerProps) {
  if (!fields || fields.length === 0) return null;

  return (
    <div className="w-full mb-8 pt-4">
      <div className="flex flex-col gap-3">
        {fields.map((field) => (
          <PropertyRow 
            key={field.id}
            field={field} 
            value={metadata[field.id] ?? ""} 
            onChange={(val) => onChange(field.id, val)} 
          />
        ))}
      </div>
    </div>
  );
}

function PropertyRow({ field, value, onChange }: { field: CustomFieldDefinition, value: any, onChange: (val: any) => void }) {
  const Icon = TYPE_ICONS[field.type] || Type;
  const isCheckbox = field.type === "checkbox";

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 w-full">
      {/* Label / Key */}
      <div className="flex items-center gap-2 sm:w-40 shrink-0 text-gray-500 group-hover:text-amber-600 transition-colors cursor-default">
        <Icon size={16} />
        <span className="text-sm font-medium">{field.name}</span>
      </div>

      {/* Value Editor */}
      <div className="flex-1 min-w-0">
        <PropertyValueEditor field={field} value={value} onChange={onChange} />
      </div>
    </div>
  );
}

function PropertyValueEditor({ field, value, onChange }: { field: CustomFieldDefinition, value: any, onChange: (val: any) => void }) {
  // Hooks for specific field types (must be at top level)
  const [hover, setHover] = useState(0); // pour "rating"
  const [sortConfig, setSortConfig] = useState<{colId: string, dir: 'asc'|'desc'} | null>(null); // pour "table"

  switch (field.type) {
    case "text":
    case "url":
      return (
        <input
          type={field.type === "url" ? "url" : "text"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Ail, Oignon, 250g...`}
          className="w-full px-2 py-1 -ml-2 text-sm text-gray-900 bg-transparent hover:bg-gray-50 focus:bg-white rounded-md border-transparent hover:border-gray-200 focus:border-amber-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300"
        />
      );

    case "textarea":
      return (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Détails supplémentaires..."
          rows={2}
          className="w-full px-2 py-1 -ml-2 text-sm text-gray-900 bg-transparent hover:bg-gray-50 focus:bg-white rounded-md border-transparent hover:border-gray-200 focus:border-amber-500 focus:ring-0 outline-none transition-all resize-none placeholder:text-gray-300"
        />
      );

    case "number":
    case "currency":
      return (
        <div className="relative flex items-center">
          <input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0"
            className="w-full px-2 py-1 -ml-2 text-sm text-gray-900 bg-transparent hover:bg-gray-50 focus:bg-white rounded-md border-transparent hover:border-gray-200 focus:border-amber-500 focus:ring-0 outline-none transition-all"
          />
          {field.type === "currency" && <span className="absolute right-2 text-gray-400 pointer-events-none">€</span>}
        </div>
      );

    case "date":
      return (
        <input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="px-2 py-1 -ml-2 text-sm text-gray-900 bg-transparent hover:bg-gray-50 focus:bg-white rounded-md border-transparent hover:border-gray-200 focus:border-amber-500 focus:ring-0 outline-none transition-all cursor-pointer"
        />
      );

    case "color":
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value || "#f59e0b"}
            onChange={(e) => onChange(e.target.value)}
            className="w-6 h-6 p-0 border-0 rounded overflow-hidden cursor-pointer bg-transparent"
          />
          <span className="text-xs text-gray-400 capitalize">{value || "#f59e0b"}</span>
        </div>
      );

    case "checkbox":
      return (
        <label className="flex items-center w-fit px-2 py-1 -ml-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
          />
          <span className="ml-2 text-sm text-gray-600 select-none">
            {value ? "Oui" : "Non"}
          </span>
        </label>
      );

    case "select":
      return (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full sm:max-w-xs px-2 py-1 -ml-2 text-sm text-gray-900 bg-transparent hover:bg-gray-50 focus:bg-white rounded-md border-transparent hover:border-gray-200 focus:border-amber-500 focus:ring-0 outline-none transition-all cursor-pointer"
        >
          <option value="">-- Sélectionner --</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case "rating":
      return (
        <div className="flex items-center gap-1 px-1 -ml-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none"
              onClick={() => onChange(star === value ? 0 : star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              <Star
                size={18}
                className={`transition-colors ${(hover || value || 0) >= star ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
              />
            </button>
          ))}
        </div>
      );

    case "table":
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
        const dir = (sortConfig?.colId === colId && sortConfig.dir === 'asc') ? 'desc' : 'asc';
        setSortConfig({ colId, dir });

        const newRows = [...rows].sort((a, b) => {
          const valA = a[colId] ?? "";
          const valB = b[colId] ?? "";
          const strA = typeof valA === 'string' ? valA.toLowerCase() : valA;
          const strB = typeof valB === 'string' ? valB.toLowerCase() : valB;
          
          if (strA < strB) return dir === 'asc' ? -1 : 1;
          if (strA > strB) return dir === 'asc' ? 1 : -1;
          return 0;
        });
        onChange(newRows);
      };

      if (!field.columns || field.columns.length === 0) {
        return <div className="text-sm text-gray-400 italic">Aucune colonne définie.</div>;
      }

      return (
        <div className="mt-2 w-full overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm text-gray-600 bg-white min-w-full">
            <thead className="bg-gray-50 uppercase text-xs font-semibold text-gray-500 border-b border-gray-200">
              <tr>
                {field.columns.map((col) => (
                  <th key={col.id} className="px-3 py-2 whitespace-nowrap">
                    <div 
                      className="group flex items-center gap-1 cursor-pointer hover:text-amber-600 transition-colors select-none"
                      onClick={() => handleSort(col.id)}
                    >
                      {col.name}
                      {sortConfig?.colId === col.id ? (
                        sortConfig.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      ) : (
                        <ChevronUp size={14} className="opacity-0 group-hover:opacity-100 text-gray-300" />
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-2 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((rowValue, rIndex) => (
                <tr key={rIndex} className="hover:bg-gray-50/50">
                  {field.columns!.map((col) => (
                    <td key={col.id} className="p-1 min-w-[120px] align-top">
                      <PropertyValueEditor 
                        field={col} 
                        value={rowValue[col.id] ?? ""} 
                        onChange={(val) => updateRow(rIndex, col.id, val)}
                      />
                    </td>
                  ))}
                  <td className="p-1 align-middle text-center">
                    <button
                      onClick={() => removeRow(rIndex)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-1 bg-gray-50 border-t border-gray-200">
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
            >
              <Plus size={14} />
              Ajouter une ligne
            </button>
          </div>
        </div>
      );

    default:
      return <div className="text-sm text-red-500">Non supporté</div>;
  }
}
