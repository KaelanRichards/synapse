import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { Input, Button, Card, Alert, Loading } from '@/components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import supabase from '@/lib/supabase';
import Settings from '@/components/Settings';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push('/signin');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      setSuccess(
        'Email updated successfully. Please check your new email for verification.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Email Address</h2>
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <Input
                  id="email"
                  label="Email address"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <Button type="submit">Update Email</Button>
              </form>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Change Password</h2>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <Input
                  id="current-password"
                  label="Current password"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
                <Input
                  id="new-password"
                  label="New password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <Input
                  id="confirm-new-password"
                  label="Confirm new password"
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                />
                <Button type="submit">Update Password</Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="editor">
            <Settings />
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="error" className="mt-4">
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mt-4">
            {success}
          </Alert>
        )}
      </div>
    </div>
  );
}
