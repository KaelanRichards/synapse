"use client";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-lg bg-red-50 p-8 text-center">
        <h2 className="mb-4 text-lg font-semibold text-red-800">
          Something went wrong:
        </h2>
        <p className="text-red-600">{error.message}</p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg text-gray-600">Loading...</div>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingFallback />}>
        <SessionContextProvider supabaseClient={supabase}>
          {children}
        </SessionContextProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
