export interface BrowserAppConfig {
  zoom?: number;
  customCss?: string;
  userAgent?: string;
  autoRefreshInterval?: number; // 0 = désactivé, sinon en secondes
  themeColor?: string;
}

export interface BrowserApp {
  id: string;
  user_id: string;
  name: string;
  url: string;
  icon_url: string | null;
  order_index: number;
  settings: BrowserAppConfig;
  created_at: string;
  updated_at: string;
}

export type BrowserAppFormData = Omit<BrowserApp, "id" | "user_id" | "created_at" | "updated_at">;
