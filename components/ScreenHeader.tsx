
import { ArrowLeft, Settings, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showSettings?: boolean;
  rightElement?: React.ReactNode;
}

export default function ScreenHeader({ 
  title, 
  subtitle, 
  showBack = false, 
  showSettings = false,
  rightElement 
}: ScreenHeaderProps) {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between p-4 border-b border-rhine-gold/20 bg-rhine-navy/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="w-10 flex justify-center">
        {showBack && (
          <Link href="/trips" className="flex items-center justify-center h-8 w-8 rounded-sm hover:bg-rhine-gold/20 transition-colors border border-transparent hover:border-rhine-gold/50">
            <ArrowLeft className="text-rhine-gold" size={20} />
          </Link>
        )}
      </div>
      
      <div className="flex flex-col items-center">
        {subtitle && (
          <h1 className="text-[10px] font-bold tracking-[0.2em] text-rhine-gold/60 uppercase font-display mb-0.5">
            {subtitle}
          </h1>
        )}
        <h2 className="text-lg font-bold tracking-tight text-white uppercase font-display drop-shadow-[0_0_5px_rgba(197,160,89,0.5)]">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {rightElement}
        
        {user ? (
          <div className="flex items-center gap-2">
            <Link href="/profile" className="flex items-center gap-2 px-2 py-1 rounded border border-rhine-gold/30 hover:bg-rhine-gold/10 transition-colors">
              <div className="w-6 h-6 rounded-full bg-rhine-gold/20 flex items-center justify-center border border-rhine-gold/50">
                <User size={14} className="text-rhine-gold" />
              </div>
              <span className="text-[10px] font-bold text-rhine-gold hidden sm:block">
                {profile?.username || 'EXPLORER'}
              </span>
            </Link>
          </div>
        ) : (
          showSettings && (
            <button className="flex items-center justify-center h-8 w-8 rounded-sm hover:bg-rhine-gold/20 transition-colors border border-transparent hover:border-rhine-gold/50">
              <Settings className="text-rhine-gold" size={20} />
            </button>
          )
        )}
      </div>
    </header>
  );
}
