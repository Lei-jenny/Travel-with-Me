
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gold' | 'blue';
}

export default function GlassCard({ children, className, variant = 'default', ...props }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "relative backdrop-blur-md border shadow-lg transition-all duration-300 group",
        "bg-rhine-navy/60 border-rhine-gold/30 hover:bg-rhine-gold/5 hover:shadow-[0_0_20px_rgba(197,160,89,0.15)]",
        className
      )}
      {...props}
    >
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-rhine-gold opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-rhine-gold opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-rhine-gold opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-rhine-gold opacity-50 group-hover:opacity-100 transition-opacity"></div>
      
      {children}
    </div>
  );
}
