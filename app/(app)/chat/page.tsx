
'use client';

import ScreenHeader from '@/components/ScreenHeader';
import ChatMessage from '@/components/ChatMessage';
import { Send, Plus } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-black text-slate-200 font-display antialiased flex flex-col">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(79,240,172,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(79,240,172,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>
      
      <ScreenHeader 
        title="Comms Terminal" 
        subtitle="Trip Channel" 
        showBack 
        showSettings
      />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-4 space-y-6 pt-4 scrollbar-hide">
          <ChatMessage 
            type="system" 
            time="10:42 AM" 
            content="ATTENTION: Departure time for Kyoto Station rendezvous has been advanced by 30 minutes. Please adjust readiness status." 
          />

          <div className="flex items-center justify-center gap-4 my-4 opacity-60 px-4">
            <div className="h-px bg-slate-800 flex-1"></div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border border-slate-800 px-2 py-0.5 bg-black">Today // 2024-10-24</span>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>

          <ChatMessage 
            type="other" 
            sender="Alex" 
            time="10:55 AM" 
            content="Checking tickets for the Shinkansen. Is everyone's pass active?" 
          />

          <ChatMessage 
            type="other" 
            sender="Sarah" 
            time="11:05 AM" 
            content="Mine is good. I'm packing the portable chargers now. We might need them for the long ride." 
          />

          <ChatMessage 
            type="me" 
            time="11:08 AM" 
            content="Roger that. I've marked the convenience store on the map. We can grab snacks there." 
          />

          <ChatMessage 
            type="other" 
            sender="Mike" 
            time="11:12 AM" 
            content="Snacks secured! Also found this cool detour." 
            attachment={{
              name: "Kyoto_Backstreet_Route.dat",
              size: "245 KB",
              type: "map"
            }}
          />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-rhine-bg border-t border-slate-800 z-20">
          <div className="flex gap-2 items-end">
            <button className="h-10 w-10 flex-shrink-0 flex items-center justify-center border border-slate-700 bg-rhine-panel text-slate-500 hover:text-rhine-accent hover:border-rhine-accent transition-all">
              <Plus size={20} />
            </button>
            <div className="flex-1 relative">
              <input 
                className="w-full h-10 bg-rhine-panel border border-slate-700 text-sm text-white placeholder-slate-600 focus:border-rhine-accent focus:ring-0 px-3 font-mono focus:outline-none" 
                placeholder="ENTER TRANSMISSION..." 
                type="text"
              />
              <div className="absolute right-0 bottom-0 w-2 h-2 border-b border-r border-slate-500 pointer-events-none"></div>
            </div>
            <button className="h-10 w-12 flex-shrink-0 flex items-center justify-center bg-rhine-accent text-black font-bold hover:bg-white transition-colors">
              <Send size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
