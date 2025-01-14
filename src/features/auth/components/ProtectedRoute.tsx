import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const authPages = [
  '/signin',
  '/signup',
  '/reset-password',
  '/reset-password/confirm',
];

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const isAuthPage = authPages.includes(router.pathname);

  useEffect(() => {
    if (!loading) {
      if (!session && !isAuthPage) {
        router.push('/signin');
      } else if (session && isAuthPage) {
        router.push('/');
      }
    }
  }, [session, loading, router, isAuthPage]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session && !isAuthPage) {
    return null;
  }

  return <>{children}</>;
}
