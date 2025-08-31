import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Configuration avec valeurs par défaut pour le développement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://temp.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "temp-key-for-testing";

// Créer le client Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
