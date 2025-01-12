import { createClient } from "@supabase/supabase-js";
import { type Database } from "@/types/supabase";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a single supabase client for interacting with your database
const createBrowserClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "app-session",
      flowType: "pkce",
      storage: {
        getItem: (key) => {
          try {
            if (typeof window === "undefined") return null;
            const item = window.localStorage.getItem(key);
            if (!item) return null;
            // Also store in cookies for better persistence
            document.cookie = `${key}=${item};path=/;max-age=31536000;SameSite=Lax`;
            return item;
          } catch {
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            if (typeof window === "undefined") return;
            window.localStorage.setItem(key, value);
            // Also store in cookies for better persistence
            document.cookie = `${key}=${value};path=/;max-age=31536000;SameSite=Lax`;
          } catch {
            // Fail silently
          }
        },
        removeItem: (key) => {
          try {
            if (typeof window === "undefined") return;
            window.localStorage.removeItem(key);
            // Also remove from cookies
            document.cookie = `${key}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          } catch {
            // Fail silently
          }
        },
      },
    },
    db: {
      schema: "public",
    },
  });
};

// Singleton instance
let browserClient = createBrowserClient();

export const getSupabaseBrowserClient = () => browserClient;
