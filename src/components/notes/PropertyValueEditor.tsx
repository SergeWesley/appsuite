import { useState } from "react";
import { CustomFieldDefinition } from "@/types/notes";
import { Star } from "lucide-react";
import { PropertyTableEditor } from "./PropertyTableEditor";

interface PropertyValueEditorProps {
  field: CustomFieldDefinition;
  value: any;
  onChange: (val: any) => void;
  noteId?: string;
}

export function PropertyValueEditor({
  field,
  value,
  onChange,
  noteId,
}: PropertyValueEditorProps) {
  const [hover, setHover] = useState(0); // pour "rating"

  switch (field.type) {
    case "text":
    case "url":
      return (
        <input
          type={field.type === "url" ? "url" : "text"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`...`}
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
          {field.type === "currency" && (
            <span className="absolute right-2 text-gray-400 pointer-events-none">
              €
            </span>
          )}
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

    case "time":
      return (
        <input
          type="time"
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
          <span className="text-xs text-gray-400 capitalize">
            {value || "#f59e0b"}
          </span>
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
                className={`transition-colors ${
                  (hover || value || 0) >= star
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      );

    case "table":
      return (
        <PropertyTableEditor
          field={field}
          value={value}
          onChange={onChange}
          noteId={noteId}
          renderEditor={(f, v, o) => (
            <PropertyValueEditor field={f} value={v} onChange={o} noteId={noteId} />
          )}
        />
      );

    default:
      return <div className="text-sm text-red-500">Non supporté</div>;
  }
}
