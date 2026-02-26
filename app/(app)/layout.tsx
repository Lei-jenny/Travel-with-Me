'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/components/AuthProvider';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && isSupabaseConfigured) {
      const currentUrl = pathname + window.location.search;
      router.replace(`/?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-rhine-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-rhine-gold" size={32} />
      </div>
    );
  }

  if (!user && isSupabaseConfigured) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl bg-rhine-bg border-x border-rhine-blue/50 pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
