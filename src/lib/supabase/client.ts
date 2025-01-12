import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { getEnvVar } from "../env";

export const supabase = createClient<Database>(
  getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
  getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export const getServiceSupabase = () => {
  return createClient<Database>(
    getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    getEnvVar("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
