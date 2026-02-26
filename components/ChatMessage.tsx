
import { cn } from '@/lib/utils';
import { User, CheckCheck, Download, FileText } from 'lucide-react';

interface ChatMessageProps {
  type: 'system' | 'other' | 'me';
  sender?: string;
  content: string;
  time: string;
  attachment?: {
    name: string;
    size: string;
    type: 'map' | 'file';
  };
}

export default function ChatMessage({ type, sender, content, time, attachment }: ChatMessageProps) {
  if (type === 'system') {
    return (
      <div className="mx-4 mt-4 mb-2">
        <div className="relative bg-gradient-to-r from-rhine-accent/10 to-transparent border border-rhine-accent/30 p-3">
          {/* Tech Corners */}
          <div className="absolute top-0 left-0 w-1 h-1 bg-rhine-accent"></div>
          <div className="absolute bottom-0 right-0 w-1 h-1 bg-rhine-accent"></div>
          
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-8 w-8 flex-shrink-0 flex items-center justify-center bg-rhine-accent/10 border border-rhine-accent text-rhine-accent">
              <span className="material-symbols-outlined text-lg">campaign</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[10px] font-mono font-bold text-rhine-accent uppercase tracking-wider">System Broadcast // Update</span>
                <span className="text-[10px] text-slate-500 font-mono">{time}</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-mono">
                {content}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isMe = type === 'me';

  return (
    <div className={cn("flex gap-3 group px-4", isMe ? "flex-row-reverse" : "")}>
      {/* Avatar */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        <div className={cn(
          "h-10 w-10 flex items-center justify-center overflow-hidden border",
          isMe ? "bg-rhine-accent/10 border-rhine-accent" : "bg-rhine-panel border-slate-700"
        )}>
          <User size={20} className={isMe ? "text-rhine-accent" : "text-slate-500"} />
        </div>
        <span className={cn(
          "text-[9px] font-mono uppercase tracking-tighter",
          isMe ? "text-rhine-accent" : "text-slate-500"
        )}>
          {sender || 'You'}
        </span>
      </div>

      {/* Message Bubble */}
      <div className={cn("flex flex-col gap-1 max-w-[80%]", isMe ? "items-end" : "items-start")}>
        <div className={cn(
          "relative p-3 border",
          isMe 
            ? "bg-rhine-accent/10 border-rhine-accent rounded-tl-lg rounded-bl-lg rounded-br-none" 
            : "bg-rhine-panel border-slate-700 rounded-tr-lg rounded-br-lg rounded-bl-none"
        )}>
          {/* Decorative Corner for Me */}
          {isMe && (
            <>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-rhine-accent"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-rhine-accent"></div>
            </>
          )}

          {/* Content */}
          <div className="text-sm text-gray-200">
            {content}
            
            {attachment && (
              <div className="mt-3 bg-black/40 p-2 flex items-center gap-3 border border-white/10">
                <div className="h-10 w-10 bg-slate-800 flex items-center justify-center">
                  <FileText className="text-slate-400" size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-gray-300 truncate">{attachment.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{attachment.size} {'//'} DATA</span>
                </div>
                <button className="ml-auto p-1 hover:text-rhine-accent transition-colors">
                  <Download size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Timestamp & Status */}
        <div className="flex items-center gap-1 mx-1">
          <span className={cn("text-[10px] font-mono", isMe ? "text-rhine-accent" : "text-slate-500")}>
            {time}
          </span>
          {isMe && <CheckCheck size={12} className="text-rhine-accent" />}
        </div>
      </div>
    </div>
  );
}
