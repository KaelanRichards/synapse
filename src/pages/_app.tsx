import type { AppProps } from 'next/app';
import { AuthProvider, ProtectedRoute } from '@/features/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '@/features/layout/components/Layout';
import { CommandPaletteProvider } from '@/features/command-palette';
import { ToastProviderPrimitive as ToastProvider } from '@/features/toast/components/Toast';
import '@/styles/globals.css';
import { SupabaseProvider } from '@/features/supabase/contexts/SupabaseContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // Consider data stale after 1 minute
      cacheTime: 1000 * 60 * 5, // Keep unused data in cache for 5 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 2,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <AuthProvider>
          <CommandPaletteProvider>
            <ToastProvider>
              <ProtectedRoute>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </ProtectedRoute>
            </ToastProvider>
          </CommandPaletteProvider>
        </AuthProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  );
}
