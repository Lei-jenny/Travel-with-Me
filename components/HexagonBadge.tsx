
import { cn } from '@/lib/utils';

interface HexagonBadgeProps {
  icon: React.ReactNode;
  label: string;
  color?: 'gold' | 'blue' | 'green' | 'gray';
  active?: boolean;
}

export default function HexagonBadge({ icon, label, color = 'gray', active = true }: HexagonBadgeProps) {
  const colorMap = {
    gold: 'text-rhine-gold shadow-[0_0_15px_rgba(197,160,89,0.3)]',
    blue: 'text-rhine-blue shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    green: 'text-rhine-accent shadow-[0_0_15px_rgba(79,240,172,0.3)]',
    gray: 'text-slate-500',
  };

  return (
    <div className={cn("flex flex-col items-center gap-1 group cursor-pointer", !active && "opacity-50")}>
      <div className="w-14 h-14 relative flex items-center justify-center">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 hex-btn border border-slate-600 transition-all duration-300",
          active && "group-hover:shadow-lg",
          active && color === 'gold' && "group-hover:shadow-[0_0_15px_rgba(197,160,89,0.3)]",
          active && color === 'blue' && "group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]",
          active && color === 'green' && "group-hover:shadow-[0_0_15px_rgba(79,240,172,0.3)]"
        )}></div>
        <div className={cn("relative z-10 transition-transform group-hover:scale-110", colorMap[color])}>
          {icon}
        </div>
      </div>
      <span className="text-[8px] font-bold uppercase text-slate-500">{label}</span>
    </div>
  );
}
