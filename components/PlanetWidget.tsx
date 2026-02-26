
'use client';

import { motion } from 'motion/react';

interface PlanetWidgetProps {
  destination?: string;
  nodes?: { title: string }[];
}

export default function PlanetWidget({ destination, nodes = [] }: PlanetWidgetProps) {
  if (!destination) {
    return (
      <div className="relative w-full aspect-[4/3] mt-2 mb-6 group flex items-center justify-center overflow-hidden">
        {/* Central Planet - Inactive */}
        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-slate-800 to-black border border-slate-700/30 shadow-[0_0_30px_rgba(100,116,139,0.15)] relative overflow-hidden z-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
          <div className="text-center z-20">
            <div className="text-4xl text-slate-600 mb-1 opacity-80 material-symbols-outlined font-light">public_off</div>
            <div className="text-[10px] text-slate-500 tracking-widest font-display">NO ACTIVE MISSION</div>
          </div>
        </div>
        
        {/* Static Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-transparent via-slate-500/50 to-transparent"></div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[4/3] mt-2 mb-6 group flex items-center justify-center overflow-hidden">
      {/* Central Planet */}
      <div className="w-48 h-48 rounded-full bg-gradient-to-br from-rhine-blue to-black border border-rhine-gold/30 shadow-[0_0_30px_rgba(198,166,100,0.15)] relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(198,166,100,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(198,166,100,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-2">
          <div className="text-4xl text-rhine-gold mb-1 opacity-80 material-symbols-outlined font-light">temple_buddhist</div>
          <div className="text-[10px] text-rhine-gold tracking-widest font-display truncate w-full">TARGET: {destination.toUpperCase()}</div>
        </div>
      </div>

      {/* Orbit 1 */}
      {nodes.length > 0 && (
        <motion.div 
          className="absolute w-64 h-64 border border-rhine-gold/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-rhine-gold rounded-full shadow-[0_0_10px_#C6A664]">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-rhine-navy/80 px-2 py-0.5 rounded text-[8px] border border-rhine-gold/20 text-rhine-gold-dim transform -rotate-0 max-w-[100px] truncate">
              {nodes[0].title.toUpperCase()}
            </div>
          </div>
        </motion.div>
      )}

      {/* Orbit 2 (Reverse) */}
      {nodes.length > 1 && (
        <motion.div 
          className="absolute w-80 h-80 border border-dashed border-rhine-gold/10 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute bottom-1/4 left-[10%] w-2 h-2 bg-rhine-gold rounded-full shadow-[0_0_10px_#C6A664]">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-rhine-navy/80 px-2 py-0.5 rounded text-[8px] border border-rhine-gold/20 text-rhine-gold-dim max-w-[100px] truncate">
              {nodes[1].title.toUpperCase()}
            </div>
          </div>
        </motion.div>
      )}

      {/* Static Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-transparent via-rhine-gold/50 to-transparent"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-rhine-gold/50 to-transparent"></div>
      </div>
    </div>
  );
}
