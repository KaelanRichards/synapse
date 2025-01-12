import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { Input, Button, Card, Alert } from '@/components/ui';

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

            <Input
              id="password"
              label="Password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            {error && (
              <Alert variant="error" className="mt-4">
                {error}
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
