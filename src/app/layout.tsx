"use client";

import { useState } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase/client";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionContextProvider supabaseClient={supabase}>
          {children}
        </SessionContextProvider>
      </body>
    </html>
  );
}
