
export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0B1026] text-[#Cfb568]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#Cfb568] border-t-transparent"></div>
        <p className="font-mono text-sm tracking-widest animate-pulse">INITIALIZING...</p>
      </div>
    </div>
  );
}
