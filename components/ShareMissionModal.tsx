'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserPlus, Copy, Check, Users } from 'lucide-react';

interface Member {
  username: string;
  role: string;
}

export default function ShareMissionModal({ tripId, onClose }: { tripId: string, onClose: () => void }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  const fetchMembers = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    const { data } = await supabase
      .from('trip_members')
      .select('role, profiles(username)')
      .eq('trip_id', tripId);
    if (data) {
      setMembers(data.map((m: any) => ({
        username: m.profiles?.username || 'Unknown',
        role: m.role,
      })));
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [tripId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!isSupabaseConfigured || !supabase) {
      setMessage({ type: 'error', text: 'System offline' });
      setLoading(false);
      return;
    }

    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', username.trim())
      .single();

    if (userError || !users) {
      setMessage({ type: 'error', text: `Explorer "${username}" not found. Check the username and try again.` });
      setLoading(false);
      return;
    }

    const { data: inserted, error: memberError } = await supabase
      .from('trip_members')
      .insert({
        trip_id: tripId,
        user_id: users.id,
        role: 'editor'
      })
      .select();

    if (memberError) {
      if (memberError.code === '23505') {
        setMessage({ type: 'error', text: `${users.username} is already on this mission` });
      } else {
        setMessage({ type: 'error', text: `Failed to add: ${memberError.message}` });
      }
    } else if (!inserted || inserted.length === 0) {
      setMessage({ type: 'error', text: 'Permission denied. Only the mission creator can invite explorers.' });
    } else {
      setMessage({ type: 'success', text: `${users.username} added to mission!` });
      setUsername('');
      fetchMembers();
    }
    setLoading(false);
  };

  const shareLink = typeof window !== 'undefined'
    ? `${window.location.origin}/plan?tripId=${tripId}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-rhine-navy border border-rhine-gold/50 rounded-lg p-6 relative shadow-[0_0_30px_rgba(197,160,89,0.2)] max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
        
        <h3 className="text-xl font-bold font-display text-white mb-1">Invite Explorers</h3>
        <p className="text-xs font-mono text-rhine-gold uppercase tracking-widest mb-6">Grant Mission Access</p>

        <form onSubmit={handleInvite} className="space-y-4 mb-6">
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
                disabled={loading || !username.trim()}
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

        {members.length > 0 && (
          <div className="space-y-2 mb-6">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Users size={12} /> Mission Crew ({members.length})
            </label>
            <div className="space-y-1">
              {members.map((m) => (
                <div key={m.username} className="flex items-center justify-between text-xs font-mono px-2 py-1.5 rounded bg-rhine-navy-light/50 border border-rhine-gold/10">
                  <span className="text-slate-300">{m.username}</span>
                  <span className={`uppercase tracking-widest text-[10px] ${m.role === 'owner' ? 'text-rhine-gold' : 'text-slate-500'}`}>{m.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mission Link</label>
          <p className="text-[10px] text-slate-500 font-mono">Share this link after adding explorers by username above</p>
          <div className="flex gap-2 items-center bg-rhine-navy-light border border-rhine-gold/30 rounded p-2">
            <span className="flex-1 text-xs text-slate-300 truncate font-mono">{shareLink}</span>
            <button onClick={copyLink} className="text-rhine-gold hover:text-white">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
