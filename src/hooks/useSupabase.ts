import { useCallback, useEffect, useMemo, useState } from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();

  // Initialize Supabase client - will throw if not configured properly
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.refresh();
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        setLoading(true);
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        router.refresh();
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const signOut = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.refresh();
    } catch (err) {
      setError(err as AuthError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (err) {
      setError(err as AuthError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePassword = useCallback(
    async (newPassword: string) => {
      try {
        setError(null);
        setLoading(true);
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) throw error;
        router.refresh();
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
}
