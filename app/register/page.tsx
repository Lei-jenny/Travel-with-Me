
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Wifi, ArrowRight, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [explorerId, setExplorerId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (passcode !== confirmPasscode) {
      setError("Passcodes do not match");
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      // Fallback for demo/simulation
      console.log("Simulating registration");
      setTimeout(() => router.push('/overview'), 1000);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: explorerId.trim(),
        password: passcode,
        options: {
          data: {
            username: username,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Successful registration
        router.push('/overview');
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl bg-rhine-bg overflow-hidden border-x border-slate-800">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(79,209,197,0.15),transparent_70%)]"></div>
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black via-rhine-bg/80 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_20px_30px,#fff,rgba(0,0,0,0)),radial-gradient(1px_1px_at_40px_70px,#fff,rgba(0,0,0,0))] bg-[size:200px_200px] opacity-30"></div>
      </div>

      {/* Scan Line */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <div className="scan-line bg-rhine-accent/50"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 flex justify-between items-center p-4 pt-6 text-[10px] tracking-[0.2em] font-mono text-rhine-accent/80">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 animate-pulse" />
          <span>SIGNAL: STABLE</span>
        </div>
        <div className="flex items-center gap-2">
          <span>SYS.VER 4.2</span>
          <span className="w-2 h-2 bg-rhine-accent rotate-45"></span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center p-6 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 text-center relative group"
        >
          <div className="absolute -inset-4 bg-rhine-accent/5 blur-xl rounded-full group-hover:bg-rhine-accent/10 transition-all duration-500"></div>
          <div className="w-20 h-20 mx-auto mb-4 border-2 border-rhine-accent rotate-45 flex items-center justify-center relative shadow-[0_0_15px_rgba(79,209,197,0.3)] bg-rhine-panel/50 backdrop-blur-sm">
            <div className="w-16 h-16 border border-rhine-accent/50 flex items-center justify-center">
              <UserPlus className="text-rhine-accent -rotate-45" size={32} />
            </div>
            {/* Decorative ticks */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-3 bg-rhine-accent"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-3 bg-rhine-accent"></div>
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-1 bg-rhine-accent"></div>
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-1 bg-rhine-accent"></div>
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-white mt-6 uppercase font-display drop-shadow-md">NEW PERSONNEL</h1>
          <p className="text-[10px] tracking-[0.3em] text-rhine-accent mt-1 font-mono uppercase">Registration Protocol</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full relative bg-rhine-panel/40 backdrop-blur-md border-y border-rhine-accent/20 p-6 shadow-2xl"
        >
          {/* Corner Borders */}
          <div className="absolute top-0 left-0 w-2 h-8 border-l border-t border-rhine-accent"></div>
          <div className="absolute top-0 right-0 w-2 h-8 border-r border-t border-rhine-accent"></div>
          <div className="absolute bottom-0 left-0 w-2 h-8 border-l border-b border-rhine-accent"></div>
          <div className="absolute bottom-0 right-0 w-2 h-8 border-r border-b border-rhine-accent"></div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-rhine-accent/80 pl-1">Codename (Username)</label>
              <div className="relative tech-border bg-rhine-bg/80 group focus-within:bg-rhine-bg transition-colors">
                <span className="tech-corner-tl !border-rhine-accent"></span>
                <input 
                  className="w-full bg-transparent border-0 text-white font-mono text-sm px-4 py-3 focus:ring-0 placeholder-gray-600 focus:outline-none" 
                  placeholder="ENTER CODENAME" 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <span className="tech-corner-br !border-rhine-accent group-focus-within:border-white transition-colors"></span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-rhine-accent/80 pl-1">Assign Explorer ID (Email)</label>
              <div className="relative tech-border bg-rhine-bg/80 group focus-within:bg-rhine-bg transition-colors">
                <span className="tech-corner-tl !border-rhine-accent"></span>
                <input 
                  className="w-full bg-transparent border-0 text-white font-mono text-sm px-4 py-3 focus:ring-0 placeholder-gray-600 focus:outline-none" 
                  placeholder="CHOOSE ID" 
                  type="text"
                  value={explorerId}
                  onChange={(e) => setExplorerId(e.target.value)}
                />
                <span className="tech-corner-br !border-rhine-accent group-focus-within:border-white transition-colors"></span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-rhine-accent/80 pl-1">Set Passcode</label>
              <div className="relative tech-border bg-rhine-bg/80 group focus-within:bg-rhine-bg transition-colors">
                <span className="tech-corner-tl !border-rhine-accent"></span>
                <input 
                  className="w-full bg-transparent border-0 text-white font-mono text-sm px-4 py-3 focus:ring-0 placeholder-gray-600 focus:outline-none" 
                  placeholder="••••••••" 
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                />
                <span className="tech-corner-br !border-rhine-accent"></span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-rhine-accent/80 pl-1">Confirm Passcode</label>
              <div className="relative tech-border bg-rhine-bg/80 group focus-within:bg-rhine-bg transition-colors">
                <span className="tech-corner-tl !border-rhine-accent"></span>
                <input 
                  className="w-full bg-transparent border-0 text-white font-mono text-sm px-4 py-3 focus:ring-0 placeholder-gray-600 focus:outline-none" 
                  placeholder="••••••••" 
                  type="password"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                />
                <span className="tech-corner-br !border-rhine-accent"></span>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/30 p-2 rounded">
                ERROR: {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full group relative mt-6 h-12 cursor-pointer disabled:opacity-50">
              <div className="absolute inset-0 bg-rhine-accent hex-btn transition-all duration-300 group-hover:bg-white shadow-[0_0_15px_rgba(79,209,197,0.4)]"></div>
              <div className="absolute inset-[1px] bg-rhine-bg hex-btn flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-rhine-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 text-rhine-accent font-bold tracking-[0.2em] text-sm group-hover:text-white transition-colors flex items-center gap-2">
                  {loading ? 'INITIALIZING...' : 'INITIALIZE'}
                  {!loading && <ArrowRight size={16} />}
                </span>
              </div>
            </button>
          </form>
        </motion.div>

        <div className="mt-6">
          <Link href="/" className="text-[10px] text-rhine-accent/60 hover:text-white transition-colors uppercase tracking-widest border-b border-transparent hover:border-rhine-accent">
            Return to Login
          </Link>
        </div>
      </main>
    </div>
  );
}
