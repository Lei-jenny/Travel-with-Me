'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';
import PlanetWidget from '@/components/PlanetWidget';
import { Calendar, Users, MapPin, Clock, Utensils, Plus, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export default function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [trip, setTrip] = useState<any>(null);
  const [itineraryItems, setItineraryItems] = useState<any[]>([]);
  const [nextStop, setNextStop] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Local variable to help TypeScript narrowing
      const client = supabase;
      
      if (!client) {
        setLoading(false);
        return;
      }
      
      // Get user
      const { data: { user } } = await client.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);

      // Get latest trip
      const { data: trips, error: tripError } = await client
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (tripError) {
        console.error('Error fetching trips:', tripError);
        setLoading(false);
        return;
      }

      if (trips && trips.length > 0) {
        const currentTrip = trips[0];
        setTrip(currentTrip);

        // Get itinerary items for this trip
        const { data: items, error: itemsError } = await client
          .from('itinerary_items')
          .select('*')
          .eq('trip_id', currentTrip.id)
          .order('start_time', { ascending: true });

        if (itemsError) {
          console.error('Error fetching itinerary:', itemsError);
        } else if (items) {
          setItineraryItems(items);
          
          // Find next stop (first item in the future or currently happening)
          const now = new Date();
          const next = items.find((item: any) => new Date(item.end_time) > now);
          setNextStop(next || items[0]); // Fallback to first item if all passed
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const formatDateRange = (start: string, end: string) => {
    if (!start || !end) return 'TBD';
    const s = new Date(start);
    const e = new Date(end);
    return `${format(s, 'MMM d')} - ${format(e, 'MMM d')}`.toUpperCase();
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '--:--';
    return format(new Date(timeStr), 'HH:mm');
  };

  return (
    <div className="min-h-screen bg-rhine-bg text-slate-100 relative overflow-hidden">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a2742_0%,#0a0c14_100%)] z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[size:50px_50px] opacity-10 pointer-events-none z-0"></div>
      
      {/* Header */}
      <header className="relative z-20 px-6 pt-12 pb-4 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1 opacity-70">
            <span className="h-[2px] w-6 bg-rhine-gold"></span>
            <span className="text-[10px] tracking-[0.2em] font-display text-rhine-gold-dim">
              TRIP STATUS: {trip ? 'ACTIVE' : 'STANDBY'}
            </span>
          </div>
          <h1 className="text-3xl font-display text-white tracking-wide drop-shadow-md">
            TRAVEL<span className="text-rhine-gold">W/ME</span>
          </h1>
          <p className="text-xs text-slate-400 tracking-wider font-sans mt-1">
            {trip ? `${trip.destination.toUpperCase()} // EXPEDITION` : 'NO ACTIVE MISSION'}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="w-10 h-10 rounded-full border border-rhine-gold/30 p-0.5 relative">
            <Image 
              src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'User'}`}
              alt="User Avatar" 
              width={40}
              height={40}
              className="w-full h-full rounded-full object-cover opacity-80 hover:opacity-100 transition-opacity" 
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-rhine-bg rounded-full"></div>
          </div>
          <span className="text-[10px] text-rhine-gold mt-1 font-mono">
            UID: {user?.user_metadata?.username || 'UNKNOWN'}
          </span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col px-4 pb-24 overflow-y-auto scrollbar-hide">
        {/* Planet Widget */}
        <div className="relative">
          <PlanetWidget 
            destination={trip?.destination} 
            nodes={itineraryItems.slice(0, 3)} 
          />
          
          {/* Floating Widgets - Only show if trip exists */}
          {trip && (
            <>
              <div className="absolute top-0 right-0 glass-panel p-2 rounded-bl-xl border-t-0 border-r-0">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 font-mono">WEATHER</span>
                  <span className="text-sm font-bold text-rhine-gold">--°C</span>
                </div>
              </div>
              <div className="absolute bottom-6 left-0 glass-panel p-2 rounded-tr-xl border-b-0 border-l-0">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-mono">COORDS</span>
                  <span className="text-xs font-mono text-rhine-gold tracking-tighter">--.--, --.--</span>
                </div>
              </div>
            </>
          )}
        </div>

        {!trip && !loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <GlassCard className="p-8 flex flex-col items-center gap-4 max-w-sm w-full">
              <div className="w-16 h-16 rounded-full bg-rhine-gold/10 flex items-center justify-center border border-rhine-gold/30">
                <Plus className="text-rhine-gold" size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">No Active Mission</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Initialize a new expedition to begin tracking your journey.
                </p>
                <Link href="/plan" className="inline-flex items-center gap-2 px-6 py-3 bg-rhine-gold text-black font-bold text-xs tracking-wider uppercase hover:bg-white transition-colors">
                  Create Mission <ArrowRight size={14} />
                </Link>
              </div>
            </GlassCard>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-rhine-gold" size={18} />
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timeline</h3>
                </div>
                <p className="text-xl font-display text-white">
                  {trip ? formatDateRange(trip.start_date, trip.end_date) : '--'}
                </p>
                <div className="w-full bg-slate-700 h-0.5 mt-3 relative overflow-hidden">
                  <div className="absolute left-0 top-0 h-full w-2/3 bg-rhine-gold shadow-[0_0_10px_#C6A664]"></div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="text-rhine-gold" size={18} />
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Travelers</h3>
                </div>
                <p className="text-xl font-display text-white">1 MEMBER</p>
                <div className="flex -space-x-2 mt-2">
                  <div className="w-5 h-5 rounded-full bg-slate-600 border border-rhine-bg flex items-center justify-center text-[8px] overflow-hidden">
                    <Image 
                      src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                      alt="User"
                      width={20}
                      height={20}
                    />
                  </div>
                  <div className="w-5 h-5 rounded-full bg-rhine-gold/50 border border-rhine-bg flex items-center justify-center text-[8px] text-black font-bold">+0</div>
                </div>
              </GlassCard>
            </div>

            {/* Next Stop */}
            {nextStop && (
              <GlassCard className="w-full relative mb-4 p-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rhine-gold/50 to-transparent"></div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-display font-bold text-white tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-rhine-gold rotate-45"></span>
                      NEXT STOP
                    </h2>
                    <span className="px-2 py-0.5 text-[9px] border border-rhine-gold text-rhine-gold bg-rhine-gold/10 font-bold tracking-wider">EN ROUTE</span>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 flex-shrink-0 border border-rhine-gold/30 bg-black/40 flex items-center justify-center">
                      <Utensils className="text-rhine-gold" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-slate-100 mb-1">{nextStop.title}</h3>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed mb-2">
                        {nextStop.location}
                      </p>
                      <div className="flex gap-3 text-[10px] font-mono text-rhine-gold-dim/70">
                        <span className="flex items-center gap-1"><MapPin size={10} /> -- KM</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {formatTime(nextStop.start_time)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Itinerary Sequence */}
            <div className="mt-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[1px] flex-1 bg-slate-800"></div>
                <span className="text-[10px] text-slate-500 font-display tracking-[0.2em] uppercase">Itinerary Sequence</span>
                <div className="h-[1px] flex-1 bg-slate-800"></div>
              </div>
              
              <div className="space-y-3">
                {itineraryItems.length > 0 ? (
                  itineraryItems.map((item: any, i: number) => (
                    <div key={item.id} className="flex items-center gap-4 group opacity-60 hover:opacity-100 transition-opacity">
                      <div className="text-xs font-mono text-rhine-gold w-12 text-right">{formatTime(item.start_time)}</div>
                      <div className="w-2 h-2 rounded-full border border-rhine-gold bg-transparent group-hover:bg-rhine-gold transition-colors"></div>
                      <div className="flex-1 border-b border-slate-800 pb-3 group-hover:border-rhine-gold/30 transition-colors">
                        <h4 className="text-sm text-slate-200">{item.title}</h4>
                        <p className="text-[10px] text-slate-500">{item.location}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-slate-500 py-4">No itinerary items yet.</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
