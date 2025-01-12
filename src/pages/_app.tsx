import type { AppProps } from 'next/app';
import { SupabaseProvider } from '@/contexts/SupabaseContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EditorProvider } from '@/contexts/EditorContext';
import Layout from '@/components/Layout';
import '@/styles/globals.css';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <AuthProvider>
          <EditorProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </EditorProvider>
        </AuthProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  );
}
