import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 z-40 max-w-sm mx-auto bg-slate-900 text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 animate-fadeIn">
      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
        <WifiOff className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold font-devanagari-heading text-amber-300">
          ऑफ़लाइन मोड (Offline Mode)
        </p>
        <p className="text-[11px] text-slate-300 truncate">
          कैश्ड समाचार प्रदर्शित हो रहे हैं।
        </p>
      </div>
    </div>
  );
};
