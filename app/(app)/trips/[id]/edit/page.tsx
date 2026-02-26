
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ScreenHeader from '@/components/ScreenHeader';
import { ArrowLeft, Save, Trash2, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { use } from 'react';

export default function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    const fetchTrip = async () => {
      const client = supabase;
      if (isSupabaseConfigured && client) {
        const { data, error } = await client
          .from('trips')
          .select('*')
          .eq('id', id)
          .single();
        
        if (data && !error) {
          setFormData({
            title: data.title,
            destination: data.destination || '',
            start_date: data.start_date || '',
            end_date: data.end_date || ''
          });
        } else {
          alert('Failed to load mission data');
          router.push('/trips');
        }
      }
      setLoading(false);
    };

    fetchTrip();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const client = supabase;
    if (isSupabaseConfigured && client) {
      const { error } = await client
        .from('trips')
        .update({
          title: formData.title,
          destination: formData.destination,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null
        })
        .eq('id', id);

      if (error) {
        alert('Failed to update mission: ' + error.message);
      } else {
        router.push(`/plan?tripId=${id}`);
      }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to abort this mission? This action cannot be undone.')) return;
    
    setSaving(true);
    const client = supabase;
    if (isSupabaseConfigured && client) {
      // Delete items first (if no cascade)
      await client.from('itinerary_items').delete().eq('trip_id', id);
      
      const { error } = await client
        .from('trips')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Failed to delete mission: ' + error.message);
        setSaving(false);
      } else {
        router.push('/trips');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rhine-bg flex items-center justify-center text-rhine-gold">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rhine-bg text-slate-100 relative">
      <div className="fixed inset-0 bg-[radial-gradient(circle,rgba(197,160,89,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-30 z-0"></div>

      <ScreenHeader 
        title="Edit Mission" 
        subtitle="Update Parameters" 
        showBack 
      />

      <main className="p-6 relative z-10 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-rhine-gold uppercase tracking-widest">Mission Codename</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-rhine-navy/50 border border-rhine-gold/30 rounded p-3 text-white focus:border-rhine-gold outline-none transition-colors font-display tracking-wide"
              placeholder="e.g. Operation Dawn"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-rhine-gold uppercase tracking-widest">Target Sector</label>
            <input 
              type="text" 
              value={formData.destination}
              onChange={(e) => setFormData({...formData, destination: e.target.value})}
              className="w-full bg-rhine-navy/50 border border-rhine-gold/30 rounded p-3 text-white focus:border-rhine-gold outline-none transition-colors"
              placeholder="e.g. Lungmen"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-rhine-gold uppercase tracking-widest">Start Date</label>
              <input 
                type="date" 
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="w-full bg-rhine-navy/50 border border-rhine-gold/30 rounded p-3 text-white focus:border-rhine-gold outline-none transition-colors [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-rhine-gold uppercase tracking-widest">End Date</label>
              <input 
                type="date" 
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                className="w-full bg-rhine-navy/50 border border-rhine-gold/30 rounded p-3 text-white focus:border-rhine-gold outline-none transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 py-3 border border-red-500/50 text-red-400 font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 rounded-sm"
            >
              <Trash2 size={18} />
              Abort
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="flex-[2] py-3 bg-rhine-gold text-rhine-navy font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 rounded-sm shadow-[0_0_15px_rgba(197,160,89,0.3)]"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
              Update Mission
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
