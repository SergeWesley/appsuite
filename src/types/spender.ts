export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  billing_date: number; // 1-31
  category: string;
  app_link?: string;
  color?: string; // Hex color or pre-defined tailwind base string
  created_at: string;
}

export interface SubscriptionFormData {
  name: string;
  amount: number;
  billing_date: number;
  category: string;
  app_link?: string;
  color?: string;
}

export const SUBSCRIPTION_CATEGORIES = [
  "Divertissement", // Entertainment (Netflix, Spotify)
  "Utilitaires",    // Utilities (Internet, Phone)
  "Logiciels",      // Software (Adobe, Notion)
  "Santé/Sport",    // Health/Fitness (Gym)
  "Autre"           // Other
];

export interface SubscriptionTemplate {
  id: string;
  name: string;
  category: string;
  app_link: string;
  color: string;
}

export const SUBSCRIPTION_TEMPLATES: SubscriptionTemplate[] = [
  {
    id: "netflix",
    name: "Netflix",
    category: "Divertissement",
    app_link: "https://www.netflix.com",
    color: "#E50914"
  },
  {
    id: "spotify",
    name: "Spotify",
    category: "Divertissement",
    app_link: "https://open.spotify.com",
    color: "#1DB954"
  },
  {
    id: "prime",
    name: "Amazon Prime",
    category: "Divertissement",
    app_link: "https://www.primevideo.com",
    color: "#00A8E1"
  },
  {
    id: "gym",
    name: "Basic-Fit",
    category: "Santé/Sport",
    app_link: "https://www.basic-fit.com",
    color: "#FF6600"
  },
  {
    id: "chatgpt",
    name: "ChatGPT Plus",
    category: "Utilitaires",
    app_link: "https://chat.openai.com",
    color: "#10A37F"
  },
];
