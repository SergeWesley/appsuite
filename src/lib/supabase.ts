import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key_for_testing";

// Créer le client Supabase (avec gestion des valeurs de test)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Désactiver la persistance en mode test
  },
});
