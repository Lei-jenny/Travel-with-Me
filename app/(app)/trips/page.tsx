
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ScreenHeader from '@/components/ScreenHeader';
import GlassCard from '@/components/GlassCard';
import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowRight, Plus, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTrips = async () => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
      const { data, error } = await client
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching trips:', error);
        setError(error.message);
      } else if (data) {
        setTrips(data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDeleteTrip = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Confirmation is handled by the button state now
    
    // Optimistic update
    setTrips(trips.filter(t => t.id !== id));

    const client = supabase;
    if (isSupabaseConfigured && client) {
      const { error } = await client
        .from('trips')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Failed to delete mission: ' + error.message);
        // Revert optimistic update
        fetchTrips();
      }
    }
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-rhine-bg text-slate-100 relative pb-24">
      <div className="fixed inset-0 bg-[radial-gradient(circle,rgba(197,160,89,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-30 z-0"></div>

      <ScreenHeader 
        title="Expedition Log" 
        subtitle="Mission Archives" 
      />

      <main className="flex-1 p-6 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold text-rhine-gold uppercase tracking-widest">Active Missions</h2>
          <Link href="/trips/new" className="flex items-center gap-2 px-3 py-1.5 border border-rhine-gold text-rhine-gold text-xs font-bold uppercase tracking-wider hover:bg-rhine-gold hover:text-rhine-navy transition-all">
            <Plus size={14} />
            <span>New Mission</span>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-500/50 bg-red-500/10 rounded-lg text-red-400 text-xs font-mono">
            ERROR: {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-rhine-gold" />
          </div>
        ) : (
          <div className="space-y-4">
            {trips.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-700 rounded-lg">
                <p className="text-xs text-slate-500 font-mono">NO MISSIONS FOUND</p>
                <Link href="/trips/new" className="mt-4 inline-block text-rhine-gold text-xs underline">Initialize First Mission</Link>
              </div>
            ) : (
              trips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <Link href={`/plan?tripId=${trip.id}`} className="block">
                    <GlassCard className="p-4 hover:border-rhine-gold/60 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-white font-display tracking-wide mb-1 group-hover:text-rhine-gold transition-colors">{trip.title}</h3>
                          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono uppercase tracking-widest">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {trip.destination || 'Unknown'}</span>
                            <span className="flex items-center gap-1"><Calendar size={12} /> {trip.start_date || 'TBD'}</span>
                          </div>
                        </div>
                        <ArrowRight className="text-rhine-gold opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </div>
                    </GlassCard>
                  </Link>
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Delete clicked for', trip.id);
                      
                      if (deletingId === trip.id) {
                        // Already in deleting state, perform delete
                        handleDeleteTrip(e, trip.id);
                      } else {
                        // Enter deleting state
                        setDeletingId(trip.id);
                        // Auto-reset after 3s
                        setTimeout(() => setDeletingId(null), 3000);
                      }
                    }}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all cursor-pointer z-50 shadow-lg border ${
                      deletingId === trip.id 
                        ? 'bg-red-500 text-white border-red-400 animate-pulse' 
                        : 'bg-rhine-navy/80 text-slate-400 border-slate-700 hover:text-red-400 hover:border-red-500/50'
                    }`}
                    title="Delete Mission"
                  >
                    {deletingId === trip.id ? <Trash2 size={16} /> : <Trash2 size={16} />}
                    {deletingId === trip.id && <span className="ml-2 text-xs font-bold">CONFIRM</span>}
                  </button>
                </motion.div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
