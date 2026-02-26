
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import ScreenHeader from '@/components/ScreenHeader';
import { LogOut, User, Shield, Map, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-rhine-bg flex items-center justify-center text-rhine-gold">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rhine-bg text-slate-100 relative">
      <div className="fixed inset-0 bg-[radial-gradient(circle,rgba(197,160,89,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-30 z-0"></div>

      <ScreenHeader 
        title="Explorer Profile" 
        subtitle="Personnel File" 
        showBack 
      />

      <main className="p-6 relative z-10 max-w-md mx-auto space-y-8">
        {/* ID Card */}
        <div className="bg-rhine-navy/80 border border-rhine-gold/30 p-6 rounded-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-50">
             <Shield size={64} className="text-rhine-gold/10" />
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-rhine-gold/20 border-2 border-rhine-gold flex items-center justify-center shadow-[0_0_15px_rgba(197,160,89,0.3)]">
              <User size={32} className="text-rhine-gold" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display text-white tracking-wide">{profile?.username || 'Unknown Explorer'}</h2>
              <p className="text-xs font-mono text-rhine-gold uppercase tracking-widest">ID: {user.id.slice(0, 8)}</p>
              <div className="mt-2 inline-block px-2 py-0.5 bg-rhine-gold/20 border border-rhine-gold/50 rounded text-[10px] font-bold text-rhine-gold uppercase">
                {profile?.rank || 'ROOKIE'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
            <div className="text-center p-2 bg-white/5 rounded">
              <div className="text-2xl font-bold font-display text-white">{profile?.trips_count || 0}</div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
                <Map size={10} /> Missions
              </div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded">
              <div className="text-2xl font-bold font-display text-white">{profile?.countries_count || 0}</div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
                <Award size={10} /> Badges
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button 
            onClick={handleSignOut}
            disabled={loading}
            className="w-full py-3 border border-red-500/50 text-red-400 font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 rounded-sm"
          >
            <LogOut size={18} />
            {loading ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
      </main>
    </div>
  );
}
