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
      staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
      cacheTime: 1000 * 60 * 30, // Keep unused data in cache for 30 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: 'always',
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('UNAUTHORIZED')) {
          return false; // Don't retry auth errors
        }
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false, // Don't retry mutations by default
      networkMode: 'always',
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
