import { NoteFolder } from "@/types/notes";

export type SortOrder = "custom" | "asc" | "desc";

export const getNextSortOrder = (currentSort: SortOrder): SortOrder => {
  if (currentSort === "custom") return "asc";
  if (currentSort === "asc") return "desc";
  return "custom";
};

export const sortFolders = (folders: NoteFolder[], sortOrder: SortOrder): NoteFolder[] => {
  return [...folders].sort((a, b) => {
    if (sortOrder === "asc") return a.name.localeCompare(b.name);
    if (sortOrder === "desc") return b.name.localeCompare(a.name);
    return 0; // "custom" order
  });
};
