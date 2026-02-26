
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ScreenHeader from '@/components/ScreenHeader';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Suspense } from 'react';
import { useAuth } from '@/components/AuthProvider';

export default function NewPlanPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPlanContent />
    </Suspense>
  );
}

function NewPlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get('tripId');
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    startTime: '',
    location: ''
  });

  useEffect(() => {
    if (!tripId) {
      alert('No mission selected. Redirecting to mission log.');
      router.push('/trips');
    }
  }, [tripId, router]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.startDate) return;
    
    if (!user) {
      alert('You must be logged in to add itinerary items.');
      return;
    }

    if (!tripId) {
      alert('Mission ID is missing.');
      return;
    }

    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      // Combine date and time
      const startDateTime = formData.startTime 
        ? `${formData.startDate}T${formData.startTime}:00`
        : `${formData.startDate}T09:00:00`;

      const { error } = await supabase
        .from('itinerary_items')
        .insert([
          {
            title: formData.title,
            location: formData.location,
            start_time: startDateTime,
            day_date: formData.startDate,
            position: 999, // Put at end
            trip_id: tripId
          }
        ]);

      if (error) {
        console.error('Error inserting:', error);
        alert('Failed to save: ' + error.message);
        setLoading(false);
        return;
      }
      
      router.refresh();
      router.push(`/plan?tripId=${tripId}`);
    } else {
      // Mock save
      console.log('Mock saving:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
      router.push('/plan');
    }
  };

  return (
    <div className="min-h-screen bg-rhine-bg text-slate-100 relative">
      <div className="fixed inset-0 bg-[radial-gradient(circle,rgba(197,160,89,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-30 z-0"></div>

      <ScreenHeader 
        title="New Expedition" 
        subtitle="Itinerary Creation" 
        showBack 
      />

      <main className="flex-1 p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-rhine-gold/80 pl-1">Activity Title</label>
            <div className="relative tech-border bg-rhine-panel/50 group focus-within:bg-rhine-panel transition-colors">
              <span className="tech-corner-tl"></span>
              <input 
                className="w-full bg-transparent border-0 text-white font-display text-lg px-4 py-4 focus:ring-0 placeholder-gray-600 focus:outline-none" 
                placeholder="ENTER TITLE" 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <span className="tech-corner-br"></span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-rhine-gold/80 pl-1 flex items-center gap-2">
                <Calendar size={12} /> Date
              </label>
              <div className="relative tech-border bg-rhine-panel/50">
                <span className="tech-corner-tl"></span>
                <input 
                  className="w-full bg-transparent border-0 text-white font-mono text-sm px-4 py-3 focus:ring-0 focus:outline-none" 
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
                <span className="tech-corner-br"></span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-rhine-gold/80 pl-1 flex items-center gap-2">
                <Clock size={12} /> Start Time
              </label>
              <div className="relative tech-border bg-rhine-panel/50">
                <span className="tech-corner-tl"></span>
                <input 
                  className="w-full bg-transparent border-0 text-white font-mono text-sm px-4 py-3 focus:ring-0 focus:outline-none" 
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                />
                <span className="tech-corner-br"></span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-rhine-gold/80 pl-1 flex items-center gap-2">
              <MapPin size={12} /> Location
            </label>
            <div className="relative tech-border bg-rhine-panel/50 group focus-within:bg-rhine-panel transition-colors">
              <span className="tech-corner-tl"></span>
              <input 
                className="w-full bg-transparent border-0 text-white font-mono text-sm px-4 py-3 focus:ring-0 placeholder-gray-600 focus:outline-none" 
                placeholder="SEARCH LOCATION" 
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
              <span className="tech-corner-br"></span>
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full group relative mt-8 h-14 cursor-pointer disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-rhine-gold hex-btn transition-all duration-300 group-hover:bg-white shadow-[0_0_15px_rgba(207,181,104,0.4)]"></div>
            <div className="absolute inset-[1px] bg-rhine-bg hex-btn flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-rhine-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 text-rhine-gold font-bold tracking-[0.2em] text-sm group-hover:text-white transition-colors flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={16} /> : 'INITIATE PROTOCOL'}
                {!loading && <ArrowRight size={16} />}
              </span>
            </div>
          </button>
        </motion.div>
      </main>
    </div>
  );
}
