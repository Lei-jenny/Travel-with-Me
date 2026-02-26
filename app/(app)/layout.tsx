
import BottomNav from '@/components/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl bg-rhine-bg border-x border-rhine-blue/50 pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
