import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Ensure environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "Supabase URL and Anon Key are required. Please check your .env file."
    );
  }
}

export const supabase = createClient<Database>(
  supabaseUrl || "",
  supabaseAnonKey || "",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin operations"
    );
  }

  return createClient<Database>(supabaseUrl || "", serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
