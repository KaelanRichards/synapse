import type { AppProps } from 'next/app';
import { SupabaseProvider } from '@/contexts/SupabaseContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import CommandPaletteProvider from '@/components/CommandPaletteProvider';
import '@/styles/globals.css';

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
            <ProtectedRoute>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </ProtectedRoute>
          </CommandPaletteProvider>
        </AuthProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  );
}
