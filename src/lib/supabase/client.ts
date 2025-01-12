import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

// This client should only be used in server-side operations
export const getServiceSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new SupabaseConfigError(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for admin operations"
    );
  }

  try {
    return createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: "public",
      },
    });
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    throw new Error(
      "Failed to initialize Supabase client. Please check your configuration."
    );
  }
};

// Client-side Supabase instance with auto-refresh token
export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new SupabaseConfigError(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required for client operations"
    );
  }

  try {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        storageKey: "app-session",
        storage: {
          getItem: (key) => {
            if (typeof window !== "undefined") {
              return localStorage.getItem(key);
            }
            return null;
          },
          setItem: (key, value) => {
            if (typeof window !== "undefined") {
              localStorage.setItem(key, value);
            }
          },
          removeItem: (key) => {
            if (typeof window !== "undefined") {
              localStorage.removeItem(key);
            }
          },
        },
      },
      db: {
        schema: "public",
      },
    });
  } catch (error) {
    console.error("Failed to initialize browser Supabase client:", error);
    throw new Error(
      "Failed to initialize Supabase client. Please check your configuration."
    );
  }
};
