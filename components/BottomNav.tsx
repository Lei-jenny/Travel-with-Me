
'use client';

import { Calendar, Map, MessageSquare, User, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-rhine-gold/20 bg-rhine-navy/95 backdrop-blur-xl px-2 pb-6 pt-3 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-end max-w-md mx-auto relative">
        
        {/* Left Group */}
        <Link 
          href="/trips"
          className={`flex flex-1 flex-col items-center justify-end gap-1.5 transition-all group ${
            pathname === '/trips' ? 'text-rhine-gold' : 'text-slate-500 hover:text-rhine-gold'
          }`}
        >
          <div className="p-2">
            <Calendar size={24} strokeWidth={pathname === '/trips' ? 2.5 : 2} />
          </div>
          <span className="text-[9px] font-display font-bold tracking-widest uppercase">Missions</span>
        </Link>

        <Link 
          href="/plan"
          className={`flex flex-1 flex-col items-center justify-end gap-1.5 transition-all group ${
            pathname === '/plan' ? 'text-rhine-gold' : 'text-slate-500 hover:text-rhine-gold'
          }`}
        >
          <div className="p-2">
            <Map size={24} strokeWidth={pathname === '/plan' ? 2.5 : 2} />
          </div>
          <span className="text-[9px] font-display font-bold tracking-widest uppercase">Plan</span>
        </Link>

        {/* Center Action Button */}
        <div className="flex-1 flex flex-col items-center justify-end -mt-8">
          <Link href="/plan/new" className="group relative">
            <div className="absolute inset-0 bg-rhine-gold blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
            <div className="relative h-14 w-14 bg-rhine-navy border border-rhine-gold text-rhine-gold rounded-xl rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(197,160,89,0.2)] group-hover:scale-105 transition-transform group-hover:bg-rhine-gold group-hover:text-rhine-navy">
              <Plus size={28} className="-rotate-45" />
            </div>
          </Link>
          <span className="text-[9px] font-display font-bold tracking-widest uppercase text-rhine-gold mt-2 opacity-80">New</span>
        </div>

        {/* Right Group */}
        <Link 
          href="/chat"
          className={`flex flex-1 flex-col items-center justify-end gap-1.5 transition-all group ${
            pathname === '/chat' ? 'text-rhine-gold' : 'text-slate-500 hover:text-rhine-gold'
          }`}
        >
          <div className="p-2">
            <MessageSquare size={24} strokeWidth={pathname === '/chat' ? 2.5 : 2} />
          </div>
          <span className="text-[9px] font-display font-bold tracking-widest uppercase">Comm</span>
        </Link>

        <Link 
          href="/profile"
          className={`flex flex-1 flex-col items-center justify-end gap-1.5 transition-all group ${
            pathname === '/profile' ? 'text-rhine-gold' : 'text-slate-500 hover:text-rhine-gold'
          }`}
        >
          <div className="p-2">
            <User size={24} strokeWidth={pathname === '/profile' ? 2.5 : 2} />
          </div>
          <span className="text-[9px] font-display font-bold tracking-widest uppercase">Profile</span>
        </Link>

      </div>
    </nav>
  );
}
