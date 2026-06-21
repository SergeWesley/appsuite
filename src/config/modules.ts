import {
  BookOpen,
  Film,
  Activity,
  StickyNote,
  Wallet,
  Utensils,
  Globe,
  LucideIcon,
} from "lucide-react";

export interface AppTheme {
  text: string;
  textDark: string;
  bg: string;
  bgSoft: string; // Typiquement bg-[color]-100
  bgFaint: string; // Typiquement bg-[color]-50
  bgHoverLight: string; // Typiquement hover:bg-[color]-100
  bgSolidHover: string; // Typiquement hover:bg-[color]-600
  ring: string;
}

export type ModuleId =
  | "booker"
  | "tracker"
  | "watcher"
  | "notes"
  | "spender"
  | "cooker"
  | "browser";

export interface AppModule {
  id: ModuleId;
  name: string;
  path: string;
  icon: LucideIcon;
  description: string;
  theme: AppTheme;
}

export const appModules: AppModule[] = [
  {
    id: "booker",
    name: "Booker",
    path: "/booker",
    icon: BookOpen,
    description: "Gérez votre bibliothèque de livres",
    theme: {
      text: "text-blue-500",
      textDark: "text-blue-600",
      bg: "bg-blue-500",
      bgSoft: "bg-blue-100",
      bgFaint: "bg-blue-50",
      bgHoverLight: "hover:bg-blue-100",
      bgSolidHover: "hover:bg-blue-600",
      ring: "focus:ring-blue-500/20 focus:border-blue-500",
    },
  },
  {
    id: "tracker",
    name: "Tracker",
    path: "/tracker",
    icon: Activity,
    description: "Suivez vos séances de sport",
    theme: {
      text: "text-green-500",
      textDark: "text-green-600",
      bg: "bg-green-500",
      bgSoft: "bg-green-100",
      bgFaint: "bg-green-50",
      bgHoverLight: "hover:bg-green-100",
      bgSolidHover: "hover:bg-green-600",
      ring: "focus:ring-green-500/20 focus:border-green-500",
    },
  },
  {
    id: "watcher",
    name: "Watcher",
    path: "/watcher",
    icon: Film,
    description: "Suivez vos films et séries",
    theme: {
      text: "text-purple-500",
      textDark: "text-purple-600",
      bg: "bg-purple-500",
      bgSoft: "bg-purple-100",
      bgFaint: "bg-purple-50",
      bgHoverLight: "hover:bg-purple-100",
      bgSolidHover: "hover:bg-purple-600",
      ring: "focus:ring-purple-500/20 focus:border-purple-500",
    },
  },
  {
    id: "notes",
    name: "Notes",
    path: "/notes",
    icon: StickyNote,
    description: "Organisez vos notes et idées",
    theme: {
      text: "text-amber-500",
      textDark: "text-amber-600",
      bg: "bg-amber-500",
      bgSoft: "bg-amber-100",
      bgFaint: "bg-amber-50",
      bgHoverLight: "hover:bg-amber-100",
      bgSolidHover: "hover:bg-amber-600",
      ring: "focus:ring-amber-500/20 focus:border-amber-500",
    },
  },
  {
    id: "spender",
    name: "Spender",
    path: "/spender",
    icon: Wallet,
    description: "Gérez vos dépenses et abonnements",
    theme: {
      text: "text-red-500",
      textDark: "text-red-600",
      bg: "bg-red-500",
      bgSoft: "bg-red-100",
      bgFaint: "bg-red-50",
      bgHoverLight: "hover:bg-red-100",
      bgSolidHover: "hover:bg-red-600",
      ring: "focus:ring-red-500/20 focus:border-red-500",
    },
  },
  {
    id: "cooker",
    name: "Cooker",
    path: "/cooker",
    icon: Utensils,
    description: "Gérez vos ingrédients et générez des recettes originiales",
    theme: {
      text: "text-cyan-500",
      textDark: "text-cyan-600",
      bg: "bg-cyan-500",
      bgSoft: "bg-cyan-100",
      bgFaint: "bg-cyan-50",
      bgHoverLight: "hover:bg-cyan-100",
      bgSolidHover: "hover:bg-cyan-600",
      ring: "focus:ring-cyan-500/20 focus:border-cyan-500",
    },
  },
  {
    id: "browser",
    name: "Browser",
    path: "/browser",
    icon: Globe,
    description: "Accédez à vos sites web favoris en un clin d'œil",
    theme: {
      text: "text-teal-500",
      textDark: "text-teal-600",
      bg: "bg-teal-500",
      bgSoft: "bg-teal-100",
      bgFaint: "bg-teal-50",
      bgHoverLight: "hover:bg-teal-100",
      bgSolidHover: "hover:bg-teal-600",
      ring: "focus:ring-teal-500/20 focus:border-teal-500",
    },
  },
];

export const defaultTheme: AppTheme = {
  text: "text-indigo-500",
  textDark: "text-indigo-600",
  bg: "bg-indigo-500",
  bgSoft: "bg-indigo-100",
  bgFaint: "bg-indigo-50",
  bgHoverLight: "hover:bg-indigo-100",
  bgSolidHover: "hover:bg-indigo-600",
  ring: "focus:ring-indigo-500/20 focus:border-indigo-500",
};

/**
 * Retourne le module correspondant à l'URL courante,
 * ou undefined si on n'est dans aucun module spécifique (ex: Dashboard)
 */
export function getModuleByPath(pathname: string): AppModule | undefined {
  return appModules.find((m) => pathname.startsWith(m.path));
}
