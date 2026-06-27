"use client";

import { CustomFieldDefinition, CustomFieldType } from "@/types/notes";
import {
  Type,
  List,
  Hash,
  Calendar,
  Clock,
  CheckSquare,
  Palette,
  Star,
  Link,
  Euro,
  Table,
} from "lucide-react";
import { PropertyValueEditor } from "./PropertyValueEditor";

interface DynamicPropertiesBannerProps {
  fields: CustomFieldDefinition[];
  metadata: Record<string, any>;
  onChange: (key: string, value: any) => void;
  noteId?: string;
}

const TYPE_ICONS: Record<CustomFieldType, React.ElementType> = {
  text: Type,
  textarea: List,
  number: Hash,
  currency: Euro,
  checkbox: CheckSquare,
  date: Calendar,
  time: Clock,
  select: List,
  color: Palette,
  rating: Star,
  url: Link,
  table: Table,
};

export function DynamicPropertiesBanner({
  fields,
  metadata,
  onChange,
  noteId,
}: DynamicPropertiesBannerProps) {
  if (!fields || fields.length === 0) return null;

  return (
    <div className="w-full mb-8 pt-4">
      <div className="flex flex-col gap-3">
        {fields.map((field) => (
          <PropertyRow
            key={field.id}
            field={field}
            value={metadata[field.id]}
            onChange={(val) => onChange(field.id, val)}
            noteId={noteId}
          />
        ))}
      </div>
    </div>
  );
}

function PropertyRow({
  field,
  value,
  onChange,
  noteId,
}: {
  field: CustomFieldDefinition;
  value: any;
  onChange: (val: any) => void;
  noteId?: string;
}) {
  const Icon = TYPE_ICONS[field.type] || Type;
  const isCheckbox = field.type === "checkbox";
  const isTable = field.type === "table";

  return (
    <div
      className={`group flex ${isTable ? "flex-col items-start" : "flex-col sm:flex-row sm:items-center"} gap-1 sm:gap-4 w-full`}
    >
      {/* Label / Key */}
      <div
        className={`flex items-center gap-2 shrink-0 text-gray-500 group-hover:text-amber-600 transition-colors cursor-default ${isTable ? "mb-1" : "sm:w-40"}`}
      >
        <Icon size={16} />
        <span className="text-sm font-medium">{field.name}</span>
      </div>

      {/* Value Editor */}
      <div className="flex-1 min-w-0 w-full">
        <PropertyValueEditor field={field} value={value} onChange={onChange} noteId={noteId} />
      </div>
    </div>
  );
}


