import type { NextPage } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import NoteList from '@/components/NoteList';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui';

const Home: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loading size="lg" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Your Knowledge Graph
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Organize and connect your thoughts, ideas, and knowledge in a
            meaningful way.
          </p>
        </div>

        <NoteList />
      </div>
    </Layout>
  );
};

export default Home;
