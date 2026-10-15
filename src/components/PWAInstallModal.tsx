import React from 'react';
import { Download, X, Smartphone, CheckCircle2, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header with Brand Accent */}
        <div className="bg-red-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10"
            aria-label="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white text-red-700 font-black text-2xl flex items-center justify-center shadow-md">
              24
            </div>
            <div>
              <h3 className="font-extrabold font-devanagari-heading text-lg sm:text-xl text-white">
                सवेरा 24 न्यूज़ ऐप
              </h3>
              <p className="text-xs text-amber-200 font-devanagari-heading">
                सच की राह सवेरा के साथ
              </p>
            </div>
          </div>
          <p className="text-xs text-red-100 mt-2">
            अपने मोबाइल पर सीधे सवेरा 24 न्यूज़ इंस्टॉल करें और ताज़ा खबरें सबसे पहले पाएं।
          </p>
        </div>

        {/* Benefits */}
        <div className="p-6 space-y-3.5 text-xs text-slate-700">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>बिना प्ले स्टोर के डायरेक्ट इंस्टॉल:</strong> आपके फोन में बहुत कम स्पेस लेता है।</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>ऑफ़लाइन मोड:</strong> इंटरनेट न होने पर भी पहले से लोड की गई खबरें पढ़ें।</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>फास्ट लोडिंग:</strong> 2G/3G/4G/5G नेटवर्क पर सुपरफास्ट स्पीड।</span>
          </div>

          {/* iOS Safari Guide */}
          {isIOS && (
            <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <p className="font-bold flex items-center gap-1.5 mb-1.5">
                <Share className="w-3.5 h-3.5 text-amber-700" /> iPhone / iPad उपयोगकर्ता:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700">
                <li>Safari में नीचे <strong>Share</strong> (शेयर) बटन दबाएं।</li>
                <li>नीचे स्क्रॉल करके <strong>Add to Home Screen</strong> चुनें।</li>
              </ol>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold"
          >
            अभी नहीं
          </button>

          {isInstallable ? (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>ऐप इंस्टॉल करें</span>
            </button>
          ) : (
            <button
              onClick={() => {
                alert('ब्राउज़र मेनू (⋮) खोलें और "Add to Home Screen" या "ऐप इंस्टॉल करें" चुनें।');
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold active:scale-95 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>होम स्क्रीन पर जोड़ें</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
