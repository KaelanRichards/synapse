import type { NextPage } from 'next';
import Layout from '@/components/Layout';
import NoteList from '@/components/NoteList';

const Home: NextPage = () => {
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
