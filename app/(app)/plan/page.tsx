
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import ScreenHeader from '@/components/ScreenHeader';
import ItineraryList from '@/components/ItineraryList';
import ShareMissionModal from '@/components/ShareMissionModal';
import { Plus, Share2, Settings, Users } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function PlanPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlanContent />
    </Suspense>
  );
}

import { useSearchParams } from 'next/navigation';

function PlanContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get('tripId');
  const [trip, setTrip] = useState<any>(null);
  const [tripLoading, setTripLoading] = useState(!!tripId);
  const [tripError, setTripError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const client = supabase;
    if (tripId && isSupabaseConfigured && client) {
      setTripLoading(true);
      setTripError(null);
      const fetchTrip = async () => {
        const { data, error } = await client
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .single();
        if (error || !data) {
          setTripError('Mission not found or access denied.');
        } else {
          setTrip(data);
        }
        setTripLoading(false);
      };
      fetchTrip();
    } else {
      setTripLoading(false);
    }
  }, [tripId]);

  if (tripLoading) {
    return (
      <div className="min-h-screen bg-rhine-bg flex items-center justify-center text-rhine-gold">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-rhine-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono tracking-widest">RETRIEVING MISSION DATA...</p>
        </div>
      </div>
    );
  }

  if (tripError) {
    return (
      <div className="min-h-screen bg-rhine-bg flex items-center justify-center text-slate-400 p-6">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-display text-red-400 mb-2">MISSION NOT FOUND</h2>
          <p className="text-xs font-mono mb-2">{tripError}</p>
          <p className="text-xs text-slate-500 mb-6">If someone shared this link with you, ask them to add your username in the Invite Explorers panel first.</p>
          <Link href="/trips" className="px-4 py-2 border border-rhine-gold text-rhine-gold text-xs font-bold uppercase tracking-wider hover:bg-rhine-gold hover:text-rhine-navy transition-all">
            Open Mission Log
          </Link>
        </div>
      </div>
    );
  }

  if (!tripId) {
    return (
      <div className="min-h-screen bg-rhine-bg flex items-center justify-center text-slate-400">
        <div className="text-center">
          <h2 className="text-xl font-display text-white mb-2">NO MISSION SELECTED</h2>
          <p className="text-xs font-mono mb-6">Please select a mission from the log to view plan.</p>
          <Link href="/trips" className="px-4 py-2 border border-rhine-gold text-rhine-gold text-xs font-bold uppercase tracking-wider hover:bg-rhine-gold hover:text-rhine-navy transition-all">
            Open Mission Log
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rhine-bg text-slate-100 relative">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-[radial-gradient(circle,rgba(197,160,89,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-30 z-0"></div>

      {showShareModal && tripId && (
        <ShareMissionModal tripId={tripId} onClose={() => setShowShareModal(false)} />
      )}

      <ScreenHeader 
        title={trip.title} 
        subtitle={trip.destination} 
        showBack 
        rightElement={
          <div className="flex items-center gap-2">
            {tripId && (
              <>
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="p-2 text-rhine-gold hover:bg-rhine-gold/10 rounded border border-transparent hover:border-rhine-gold/30 transition-all"
                >
                  <Users size={18} />
                </button>
                <Link href={`/trips/${tripId}/edit`} className="p-2 text-rhine-gold hover:bg-rhine-gold/10 rounded border border-transparent hover:border-rhine-gold/30 transition-all">
                  <Settings size={18} />
                </Link>
              </>
            )}
            <div className="flex items-center gap-2 px-2 py-1 rounded border border-rhine-gold/30 bg-rhine-navy-light/50">
              <div className="h-1.5 w-1.5 rounded-full bg-rhine-gold animate-[pulse_3s_infinite]"></div>
              <span className="text-[10px] font-bold text-rhine-gold tracking-widest">SYNC</span>
            </div>
          </div>
        }
      />

      {/* Map Placeholder Area */}
      <div className="relative w-full aspect-[16/9] bg-rhine-navy overflow-hidden border-b border-rhine-gold/40 z-10 group">
        <Image 
          src="https://picsum.photos/id/1033/800/450" 
          alt="Orbital view" 
          fill
          className="object-cover opacity-40 mix-blend-luminosity contrast-125" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050814] via-transparent to-transparent"></div>
        
        {/* Map Overlays */}
        <div className="absolute top-3 left-3 flex flex-col gap-0.5">
          <div className="text-[10px] text-rhine-gold font-mono tracking-widest border-l-2 border-rhine-gold pl-2">LAT: 32.992 // N</div>
          <div className="text-[10px] text-rhine-gold font-mono tracking-widest border-l-2 border-rhine-gold/50 pl-2">LNG: 112.441 // E</div>
        </div>
        
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Mission coordinates copied to clipboard!');
            }}
            className="h-8 w-8 flex items-center justify-center bg-rhine-navy/80 text-rhine-gold border border-rhine-gold/50 rounded-sm hover:bg-rhine-gold hover:text-rhine-navy transition-all duration-300 shadow-[0_0_10px_rgba(197,160,89,0.2)]"
          >
            <Share2 size={18} />
          </button>
        </div>

        {/* Central Reticle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative h-16 w-16 border border-rhine-gold/60 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
            <div className="absolute top-0 h-2 w-0.5 bg-rhine-gold"></div>
            <div className="absolute bottom-0 h-2 w-0.5 bg-rhine-gold"></div>
            <div className="absolute left-0 h-0.5 w-2 bg-rhine-gold"></div>
            <div className="absolute right-0 h-0.5 w-2 bg-rhine-gold"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-1 w-1 bg-rhine-accent rounded-full shadow-[0_0_8px_#D64933]"></div>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col relative z-10">
        {/* Timeline Grid */}
        <div className="px-4 pb-24 pt-6 grid grid-cols-[48px_1fr] gap-x-0">
          {/* Timeline Line */}
          <div className="relative flex flex-col items-center h-full">
            <div className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-rhine-gold/50 to-transparent"></div>
          </div>
          
          {/* Items */}
          <ItineraryList tripId={tripId} tripStart={trip?.start_date} />
          
          {/* End of Day */}
          <div className="col-start-2 flex items-center gap-4 mt-4 opacity-40 pl-4">
            <div className="h-px bg-rhine-gold w-full"></div>
            <span className="text-[9px] whitespace-nowrap font-mono text-rhine-gold tracking-[0.2em] uppercase">End of Mission</span>
            <div className="h-px bg-rhine-gold w-full"></div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <Link href={`/plan/new${tripId ? `?tripId=${tripId}` : ''}`} className="fixed bottom-24 right-6 h-14 w-14 bg-rhine-navy text-rhine-gold rounded-sm shadow-[0_0_20px_rgba(197,160,89,0.3)] flex items-center justify-center hover:bg-rhine-gold hover:text-rhine-navy hover:scale-105 transition-all z-30 border border-rhine-gold/50 group">
        <div className="absolute inset-0 border border-rhine-gold transform scale-110 opacity-0 group-hover:scale-125 group-hover:opacity-100 transition-all duration-500 rounded-sm"></div>
        <Plus size={30} />
      </Link>
    </div>
  );
}
