import { useRouter } from 'next/router';
import { Button } from '@/shared/components/ui';
import { cn } from '@/shared/utils/';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Synapse</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Start organizing your thoughts and connecting ideas
        </p>
        <Button
          onClick={() => router.push('/notes/new')}
          className={cn(
            'px-6 py-3 bg-primary-500 text-white rounded-lg',
            'hover:bg-primary-600 transition-colors text-lg'
          )}
        >
          Create Your First Note
        </Button>
      </div>
    </div>
  );
}
