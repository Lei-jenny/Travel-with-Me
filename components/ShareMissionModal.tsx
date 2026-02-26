
'use client';

import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserPlus, Copy, Check } from 'lucide-react';

export default function ShareMissionModal({ tripId, onClose }: { tripId: string, onClose: () => void }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!isSupabaseConfigured || !supabase) {
      setMessage({ type: 'error', text: 'System offline' });
      setLoading(false);
      return;
    }

    // 1. Find user by username
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !users) {
      setMessage({ type: 'error', text: 'Explorer not found' });
      setLoading(false);
      return;
    }

    // 2. Add to trip_members
    const { error: memberError } = await supabase
      .from('trip_members')
      .insert({
        trip_id: tripId,
        user_id: users.id,
        role: 'editor'
      });

    if (memberError) {
      if (memberError.code === '23505') { // Unique violation
        setMessage({ type: 'error', text: 'Explorer already assigned' });
      } else {
        setMessage({ type: 'error', text: memberError.message });
      }
    } else {
      setMessage({ type: 'success', text: 'Explorer added to mission' });
      setUsername('');
    }
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-rhine-navy border border-rhine-gold/50 rounded-lg p-6 relative shadow-[0_0_30px_rgba(197,160,89,0.2)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
        
        <h3 className="text-xl font-bold font-display text-white mb-1">Invite Explorers</h3>
        <p className="text-xs font-mono text-rhine-gold uppercase tracking-widest mb-6">Grant Mission Access</p>

        <form onSubmit={handleInvite} className="space-y-4 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Explorer Username</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 bg-rhine-navy-light border border-rhine-gold/30 rounded p-2 text-white focus:border-rhine-gold outline-none"
                placeholder="Enter username"
              />
              <button 
                type="submit" 
                disabled={loading || !username}
                className="px-4 bg-rhine-gold text-rhine-navy font-bold uppercase tracking-wider rounded hover:bg-white transition-colors disabled:opacity-50"
              >
                {loading ? '...' : <UserPlus size={18} />}
              </button>
            </div>
          </div>
          {message && (
            <div className={`text-xs font-mono p-2 rounded ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {message.text}
            </div>
          )}
        </form>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mission Link</label>
          <div className="flex gap-2 items-center bg-rhine-navy-light border border-rhine-gold/30 rounded p-2">
            <span className="flex-1 text-xs text-slate-300 truncate font-mono">{typeof window !== 'undefined' ? window.location.href : ''}</span>
            <button onClick={copyLink} className="text-rhine-gold hover:text-white">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
