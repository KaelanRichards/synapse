"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, Session } from "@supabase/auth-helpers-react";
import QuickActions from "@/components/QuickActions";
import EmergingClusters from "@/components/EmergingClusters";
import RecentActivity from "@/components/RecentActivity";
import NoteSearch from "@/components/NoteSearch";

export default function Home() {
  const session: Session | null = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/signin");
    }
  }, [session, router]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Synapse
        </h1>
        <p className="text-lg text-gray-600">
          Your personal knowledge ecosystem for growing and connecting ideas.
        </p>
      </div>

      <div className="mb-8">
        <NoteSearch
          placeholder="Search your knowledge base..."
          className="max-w-2xl"
        />
      </div>

      <div className="space-y-12">
        <QuickActions />

        <EmergingClusters />

        <RecentActivity />
      </div>
    </main>
  );
}
