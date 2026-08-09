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
    return 0; // Ordre "personnalisé" (custom)
  });
};

export const extractEmojiAndName = (name: string): { emoji: string | null; label: string } => {
  const trimmed = name.trim();
  if (!trimmed) return { emoji: null, label: name };

  try {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const segments = Array.from(segmenter.segment(trimmed));
    if (segments.length === 0) return { emoji: null, label: name };
    
    const firstSegment = segments[0].segment;
    // Expression régulière vérifiant les caractéristiques d'un émoji (Extended_Pictographic ou Emoji_Presentation)
    // On ajoute \uFE0F (sélecteur de variation 16) pour supporter des caractères spécifiques
    const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u;
    
    if (emojiRegex.test(firstSegment)) {
      const rest = trimmed.substring(firstSegment.length).trim();
      return { emoji: firstSegment, label: rest }; // S'il n'y a que l'émoji, le libellé sera vide
    }
  } catch (e) {
    // Solution de repli pour les environnements où Intl.Segmenter n'est pas supporté (rare aujourd'hui)
    const match = trimmed.match(/^([\p{Extended_Pictographic}\p{Emoji_Presentation}]+)\s*(.*)/u);
    if (match) {
      return { emoji: match[1], label: match[2] };
    }
  }

  return { emoji: null, label: name };
};
