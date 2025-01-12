import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Input, Button, Card, Alert } from '@/components/ui';
import supabase from '@/lib/supabase';

export default function ResetPasswordConfirm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we have the recovery token in the URL
    const hash = window.location.hash;
    if (!hash || !hash.includes('type=recovery')) {
      router.push('/signin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        router.push('/signin');
      }, 3000);
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
              Password Reset Successful
            </h2>
            <p className="text-center text-neutral-600">
              Your password has been reset successfully. You will be redirected
              to the sign in page shortly.
            </p>
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
            Set New Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="new-password"
              label="New password"
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />

            <Input
              id="confirm-password"
              label="Confirm password"
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />

            {error && (
              <Alert variant="error" className="mt-4">
                {error}
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
