"use client";

import { Upload } from "lucide-react";
import { useRef } from "react";
import { NoteExportData } from "@/types/notes";

interface ImportNoteButtonProps {
  onImport: (data: NoteExportData) => void;
  disabled?: boolean;
}

export function ImportNoteButton({ onImport, disabled }: ImportNoteButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        if (data && data.type === "appsuite_note_export" && data.version >= 1) {
          onImport(data as NoteExportData);
        } else {
          alert("Fichier non valide ou version non supportée.");
        }
      } catch (err) {
        alert("Impossible de lire le fichier.");
        console.error(err);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <button
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors font-medium border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload size={18} />
        <span className="hidden sm:inline">Importer</span>
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,.appsuite"
        className="hidden"
      />
    </>
  );
}
