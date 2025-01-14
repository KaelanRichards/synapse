import { useState } from 'react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useRouter } from 'next/router';
import { Input, Button, Card, Alert } from '@/shared/components/ui';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-neutral-900">
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email-address"
              label="Email address"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
            />

            <div className="space-y-1">
              <Input
                id="password"
                label="Password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <div className="text-right">
                <Link
                  href="/reset-password"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <Alert variant="error" className="mt-4">
                {error}
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Sign in
            </Button>

            <p className="text-sm text-center text-neutral-600">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-800"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </Card>
    </div>
  );
}
