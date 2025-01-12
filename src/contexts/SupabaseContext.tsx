import { createContext, useContext, ReactNode } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import supabase from '@/lib/supabase';

const SupabaseContext = createContext<SupabaseClient<Database> | null>(null);

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
