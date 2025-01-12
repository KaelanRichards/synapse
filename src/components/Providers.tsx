"use client";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useSupabase } from "@/hooks/useSupabase";

export function Providers({ children }: { children: React.ReactNode }) {
  const supabase = useSupabase();

  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
}
