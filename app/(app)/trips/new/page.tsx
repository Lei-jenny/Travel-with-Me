
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ScreenHeader from '@/components/ScreenHeader';
import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function NewTripPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: ''
  });

  const handleSubmit = async () => {
    if (!formData.title) return;
    
    if (!user) {
      alert('You must be logged in to create a mission.');
      return;
    }

    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('trips')
        .insert([
          {
            title: formData.title,
            destination: formData.destination,
            start_date: formData.startDate || null,
            end_date: formData.endDate || null,
            created_by: user.id
          }
        ]);

      if (error) {
        console.error('Error creating trip:', error);
        alert('Failed to create mission: ' + error.message);
        setLoading(false);
        return;
      }
      
      router.refresh();
      router.push('/trips');
    } else {
      // Mock
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/trips');
    }
  };

  return (
    <div className="min-h-screen bg-rhine-bg text-slate-100 relative">
      <div className="fixed inset-0 bg-[radial-gradient(circle,rgba(197,160,89,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-30 z-0"></div>

      <ScreenHeader 
        title="New Mission" 
        subtitle="Initialize Protocol" 
        showBack 
      />

      <main className="flex-1 p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-rhine-gold/80 pl-1">Mission Title</label>
            <div className="relative tech-border bg-rhine-panel/50 group focus-within:bg-rhine-panel transition-colors">
              <span className="tech-corner-tl"></span>
              <input 
                className="w-full bg-transparent border-0 text-white font-display text-lg px-4 py-4 focus:ring-0 placeholder-gray-600 focus:outline-none" 
                placeholder="ENTER MISSION NAME" 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <span className="tech-corner-br"></span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-rhine-gold/80 pl-1 flex items-center gap-2">
              <MapPin size={12} /> Target Destination
            </label>
            <div className="relative tech-border bg-rhine-panel/50 group focus-within:bg-rhine-panel transition-colors">
              <span className="tech-corner-tl"></span>
              <input 
                className="w-full bg-transparent border-0 text-white font-mono text-sm px-4 py-3 focus:ring-0 placeholder-gray-600 focus:outline-none" 
                placeholder="SEARCH LOCATION" 
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({...formData, destination: e.target.value})}
              />
              <span className="tech-corner-br"></span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-rhine-gold/80 pl-1 flex items-center gap-2">
                <Calendar size={12} /> Start Date
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
                <Calendar size={12} /> End Date
              </label>
              <div className="relative tech-border bg-rhine-panel/50">
                <span className="tech-corner-tl"></span>
                <input 
                  className="w-full bg-transparent border-0 text-white font-mono text-sm px-4 py-3 focus:ring-0 focus:outline-none" 
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
                <span className="tech-corner-br"></span>
              </div>
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
                {loading ? <Loader2 className="animate-spin" size={16} /> : 'LAUNCH MISSION'}
                {!loading && <ArrowRight size={16} />}
              </span>
            </div>
          </button>
        </motion.div>
      </main>
    </div>
  );
}
