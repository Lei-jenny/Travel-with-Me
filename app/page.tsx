
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Wifi, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/overview';
  const [explorerId, setExplorerId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      console.log("Simulating login");
      setTimeout(() => router.push(redirectTo), 1000);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: explorerId.trim(),
        password: passcode,
      });

      if (signInError) throw signInError;

      if (data.user) {
        router.push(redirectTo);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl bg-rhine-bg overflow-hidden border-x border-slate-800">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(43,76,126,0.4),transparent_70%)]"></div>
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black via-rhine-bg/80 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_20px_30px,#fff,rgba(0,0,0,0)),radial-gradient(1px_1px_at_40px_70px,#fff,rgba(0,0,0,0))] bg-[size:200px_200px] opacity-30"></div>
      </div>

      {/* Scan Line */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <div className="scan-line"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 flex justify-between items-center p-4 pt-6 text-[10px] tracking-[0.2em] font-mono text-rhine-gold/80">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 animate-pulse" />
          <span>SIGNAL: STABLE</span>
        </div>
        <div className="flex items-center gap-2">
          <span>SYS.VER 4.2</span>
          <span className="w-2 h-2 bg-rhine-gold rotate-45"></span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center p-6 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10 text-center relative group"
        >
          <div className="absolute -inset-4 bg-rhine-gold/5 blur-xl rounded-full group-hover:bg-rhine-gold/10 transition-all duration-500"></div>
          <div className="w-20 h-20 mx-auto mb-4 border-2 border-rhine-gold rotate-45 flex items-center justify-center relative shadow-[0_0_15px_rgba(207,181,104,0.3)] bg-rhine-panel/50 backdrop-blur-sm">
            <div className="w-16 h-16 border border-rhine-gold/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-rhine-gold -rotate-45 font-light">flight_takeoff</span>
            </div>
            {/* Decorative ticks */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-3 bg-rhine-gold"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-3 bg-rhine-gold"></div>
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-1 bg-rhine-gold"></div>
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-1 bg-rhine-gold"></div>
          </div>
          <h1 className="text-3xl font-bold tracking-widest text-white mt-8 uppercase font-display drop-shadow-md">TRAVEL WITH ME</h1>
          <p className="text-[10px] tracking-[0.3em] text-rhine-gold mt-1 font-mono uppercase">Travel Planning Terminal</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full relative bg-rhine-panel/40 backdrop-blur-md border-y border-rhine-gold/20 p-6 shadow-2xl"
        >
          {/* Corner Borders */}
          <div className="absolute top-0 left-0 w-2 h-8 border-l border-t border-rhine-gold"></div>
          <div className="absolute top-0 right-0 w-2 h-8 border-r border-t border-rhine-gold"></div>
          <div className="absolute bottom-0 left-0 w-2 h-8 border-l border-b border-rhine-gold"></div>
          <div className="absolute bottom-0 right-0 w-2 h-8 border-r border-b border-rhine-gold"></div>

          <form onSubmit={handleLogin} className="space-y-5 mt-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-rhine-gold/80 pl-1">Explorer ID</label>
              <div className="relative tech-border bg-rhine-bg/80 group focus-within:bg-rhine-bg transition-colors">
                <span className="tech-corner-tl"></span>
                <input 
                  className="w-full bg-transparent border-0 text-white font-mono text-sm px-4 py-3 focus:ring-0 placeholder-gray-600 focus:outline-none" 
                  placeholder="EX-000000" 
                  type="text"
                  value={explorerId}
                  onChange={(e) => setExplorerId(e.target.value)}
                />
                <span className="tech-corner-br group-focus-within:border-white transition-colors"></span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-rhine-gold/80 pl-1">Passcode</label>
              <div className="relative tech-border bg-rhine-bg/80 group focus-within:bg-rhine-bg transition-colors">
                <span className="tech-corner-tl"></span>
                <input 
                  className="w-full bg-transparent border-0 text-white font-mono text-sm px-4 py-3 focus:ring-0 placeholder-gray-600 focus:outline-none" 
                  placeholder="••••••••" 
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                />
                <span className="tech-corner-br"></span>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/30 p-2 rounded">
                ERROR: {error}
              </div>
            )}

            <div className="pt-4 flex flex-col gap-3">
              <button type="submit" disabled={loading} className="w-full group relative h-12 cursor-pointer disabled:opacity-50">
                <div className="absolute inset-0 bg-rhine-gold hex-btn transition-all duration-300 group-hover:bg-white shadow-[0_0_15px_rgba(207,181,104,0.4)]"></div>
                <div className="absolute inset-[1px] bg-rhine-bg hex-btn flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-rhine-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 text-rhine-gold font-bold tracking-[0.2em] text-sm group-hover:text-white transition-colors flex items-center gap-2">
                    {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
                    {!loading && <ArrowRight size={16} />}
                  </span>
                </div>
                <div className="absolute top-0 right-0 w-2 h-2 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4 h-4 border border-rhine-gold/50 bg-transparent flex items-center justify-center group-hover:border-rhine-gold transition-colors">
                    <div className="w-2 h-2 bg-rhine-gold opacity-0 group-hover:opacity-50"></div>
                  </div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide group-hover:text-white transition-colors">Remember Me</span>
                </label>
                
                <Link href="/register" className="group flex items-center gap-1 px-3 py-1.5 border border-rhine-gold/30 hover:border-rhine-gold/80 bg-rhine-gold/5 hover:bg-rhine-gold/10 transition-all rounded-sm">
                  <span className="text-[10px] font-bold text-rhine-gold group-hover:text-white tracking-wider uppercase">Register ID</span>
                </Link>
              </div>
            </div>
          </form>
        </motion.div>

        <div className="mt-8 flex flex-col items-center gap-2 opacity-60">
          <div className="w-px h-12 bg-gradient-to-b from-rhine-gold to-transparent"></div>
          <div className="text-[9px] text-center font-mono text-gray-500 uppercase tracking-widest leading-relaxed">
            Secure Travel Protocol<br/>
            Columbian Pioneer Association
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/5 bg-black/40 backdrop-blur-sm p-4">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] text-gray-500 font-mono uppercase">Network Status</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
              <span className="text-[10px] font-bold text-gray-300 tracking-wider">CONNECTED</span>
            </div>
          </div>
          <div className="flex items-center gap-3 opacity-50">
            <span className="material-symbols-outlined text-gray-600 text-lg">language</span>
            <span className="material-symbols-outlined text-gray-600 text-lg">help</span>
            <span className="material-symbols-outlined text-gray-600 text-lg">settings</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
