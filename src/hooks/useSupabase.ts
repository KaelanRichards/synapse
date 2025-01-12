import { useMemo } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export function useSupabase() {
  const client = useMemo(() => {
    return createBrowserClient();
  }, []);

  return client;
}
