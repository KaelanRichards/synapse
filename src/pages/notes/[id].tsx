import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSupabase } from '@/contexts/SupabaseContext';
import Layout from '@/components/Layout';
import NoteEditor from '@/components/NoteEditor';
import NoteGraph from '@/components/NoteGraph';
import ConnectionManager from '@/components/ConnectionManager';

const NotePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const supabase = useSupabase();
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState<{
    id: string;
    title: string;
    content: string;
    maturity_state: 'SEED' | 'SAPLING' | 'GROWTH' | 'MATURE' | 'EVOLVING';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'connections'>(
    'content'
  );

  // Fetch note data
  useEffect(() => {
    const fetchNote = async () => {
      if (typeof id !== 'string') return;

      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setNote(data);
      } catch (error) {
        console.error('Error fetching note:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [id, supabase]);

  if (isLoading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (!note) {
    return (
      <Layout>
        <div>Note not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                  {note.title}
                </h1>
                <span
                  className={`mt-2 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                    note.maturity_state === 'SEED'
                      ? 'bg-green-100 text-green-800'
                      : note.maturity_state === 'SAPLING'
                        ? 'bg-blue-100 text-blue-800'
                        : note.maturity_state === 'GROWTH'
                          ? 'bg-yellow-100 text-yellow-800'
                          : note.maturity_state === 'MATURE'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-red-100 text-red-800'
                  }`}
                >
                  {note.maturity_state.toLowerCase()}
                </span>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="mt-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`${
                    activeTab === 'content'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Content
                </button>
                <button
                  onClick={() => setActiveTab('connections')}
                  className={`${
                    activeTab === 'connections'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Connections
                </button>
              </nav>
            </div>

            {isEditing ? (
              <div className="mt-6">
                <NoteEditor initialNote={note} />
                <div className="mt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                {activeTab === 'content' ? (
                  <div className="prose prose-indigo max-w-none">
                    {note.content}
                  </div>
                ) : (
                  <ConnectionManager noteId={note.id} />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-neutral-900">
              Knowledge Graph
            </h2>
            <div className="mt-4 h-96">
              <NoteGraph noteId={note.id} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotePage;
