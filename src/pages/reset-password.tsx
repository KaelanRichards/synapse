import { useState } from 'react';
import { useRouter } from 'next/router';
import { Input, Button, Card, Alert } from '@/components/ui';
import Link from 'next/link';
import supabase from '@/lib/supabase';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md p-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-neutral-900">
              Check your email
            </h2>
            <p className="text-center text-neutral-600">
              We've sent you a password reset link. Please check your email and
              follow the instructions.
            </p>
            <Button onClick={() => router.push('/signin')} className="w-full">
              Return to Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-neutral-900">
            Reset your password
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

            {error && (
              <Alert variant="error" className="mt-4">
                {error}
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Send reset link
            </Button>

            <p className="text-sm text-center text-neutral-600">
              Remember your password?{' '}
              <Link
                href="/signin"
                className="text-blue-600 hover:text-blue-800"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </Card>
    </div>
  );
}
