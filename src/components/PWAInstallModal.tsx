import React, { useState } from 'react';
import { Download, X, Smartphone, CheckCircle2, Share, PackageCheck, Github, ExternalLink, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isIOS, install } = usePWAInstall();
  const [activeMode, setActiveMode] = useState<'pwa' | 'apk'>('pwa');

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Brand Accent */}
        <div className="bg-red-700 text-white p-5 sm:p-6 relative">
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
                सवेरा 24 न्यूज़ पैकेज इंस्टॉलर
              </h3>
              <p className="text-xs text-amber-200 font-devanagari-heading">
                सच की राह सवेरा के साथ
              </p>
            </div>
          </div>
          <p className="text-xs text-red-100 mt-1">
            अपने मोबाइल पर सीधे सवेरा 24 न्यूज़ इंस्टॉल करें और ताज़ा खबरें सबसे पहले पाएं।
          </p>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-1.5 mt-4 bg-red-800/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveMode('pwa')}
              className={`py-2 px-3 rounded-lg text-center transition-all ${
                activeMode === 'pwa'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-red-100 hover:text-white'
              }`}
            >
              वेब ऐप (PWA)
            </button>
            <button
              onClick={() => setActiveMode('apk')}
              className={`py-2 px-3 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'apk'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-red-100 hover:text-white'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Android APK</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 text-xs text-slate-700 flex-1">
          {activeMode === 'pwa' ? (
            <>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>तुरंत इंस्टॉलेशन:</strong> बिना किसी अतिरिक्त डाउनलोड के सीधे होम स्क्रीन पर जुड़ता है।</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>ऑफ़लाइन मोड:</strong> इंटरनेट न होने पर भी कैश्ड समाचार पढ़ें।</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>हल्का और तेज़:</strong> केवल कुछ केबी स्पेस लेता है।</span>
              </div>

              {/* iOS Safari Guide */}
              {isIOS && (
                <div className="mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <p className="font-bold flex items-center gap-1.5 mb-1.5">
                    <Share className="w-3.5 h-3.5 text-amber-700" /> iPhone / iPad उपयोगकर्ता:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700">
                    <li>Safari में नीचे <strong>Share</strong> (शेयर) बटन दबाएं।</li>
                    <li>नीचे स्क्रॉल करके <strong>Add to Home Screen</strong> चुनें।</li>
                  </ol>
                </div>
              )}
            </>
          ) : (
            /* APK Mode */
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="font-bold text-red-800 text-xs mb-1 flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-red-600" />
                  GitHub Actions ऑटोमैटिक पैकेज बिल्डर:
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  यह प्रोजेक्ट Capacitor और GitHub Actions CI/CD वर्कफ़्लो (<code>.github/workflows/build-apk.yml</code>) से लैस है जो सीधे Android APK पैकेज जनरेट करता है।
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>सत्यापित एवं सुरक्षित:</strong> सीधे आपके अपने GitHub रिपॉजिटरी से बिल्ड होता है।</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Github className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                <span><strong>GitHub Releases:</strong> पुश करते ही ऑटोमैटिकली <code>Savera24News-Installer.apk</code> तैयार होता है।</span>
              </div>

              <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">APK इंस्टॉल करने के 3 आसान कदम:</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>GitHub Actions या Releases से APK डाउनलोड करें।</li>
                  <li>फ़ाइल पर टैप करके <strong>"Install"</strong> चुनें।</li>
                  <li>सवेरा 24 न्यूज़ का नेटिव Android अनुभव पाएं।</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Action Button Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold"
          >
            रद्द करें
          </button>

          {activeMode === 'pwa' ? (
            isInstallable ? (
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
            )
          ) : (
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold active:scale-95 transition-all"
            >
              <Github className="w-4 h-4" />
              <span>GitHub रिपोजिटरी गाइड</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
