import React, { useState } from 'react';
import { ExternalLink, Copy, Check, ShieldAlert, X, HelpCircle, ArrowRight } from 'lucide-react';

interface UnauthorizedDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseEmailAuth?: () => void;
  projectId?: string;
}

export const UnauthorizedDomainModal: React.FC<UnauthorizedDomainModalProps> = ({
  isOpen,
  onClose,
  onUseEmailAuth,
  projectId = 'empirical-aspect-fvxch',
}) => {
  const [copied, setCopied] = useState(false);
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseSettingsUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!currentHostname) return;
    navigator.clipboard.writeText(currentHostname);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Glow Header */}
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-transparent p-5 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Domain Belum Diizinkan di Firebase</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  auth/unauthorized-domain
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Fitur Google OAuth memerlukan domain web didaftarkan di Firebase Console.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm">
          {/* Quick Explanation */}
          <p className="text-xs text-slate-300 leading-relaxed">
            Firebase Authentication memblokir login Google karena domain aplikasi ini belum dimasukkan ke dalam daftar{' '}
            <strong className="text-amber-300 font-semibold">Authorized Domains (Domain Resmi)</strong> di Firebase Console proyek <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-400">{projectId}</code>.
          </p>

          {/* Domain Box */}
          <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Domain web yang perlu ditambahkan:</span>
              <span className="text-[11px] text-amber-400 font-medium">Domain Aktif Saat Ini</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-lg p-2 px-3">
              <code className="text-xs text-emerald-400 font-mono flex-1 truncate select-all">
                {currentHostname || 'ais-dev-...run.app'}
              </code>
              <button
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Domain</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Two Solutions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Solution A: Use Email/Password (Instant) */}
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                  <span>⚡ Opsi 1: Langsung Masuk (Instan)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Login & Registrasi dengan <strong>Email & Kata Sandi</strong> langsung aktif 100% tanpa batasan domain.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onUseEmailAuth) onUseEmailAuth();
                }}
                className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                Gunakan Email & Password
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Solution B: Add to Firebase Console */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Opsi 2: Daftarkan ke Firebase</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Buka tab <strong>Authorized domains</strong> di Firebase Console, lalu tambahkan domain di atas.
                </p>
              </div>
              <a
                href={firebaseSettingsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="w-full py-2 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-600 transition-colors"
              >
                Buka Firebase Console
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick steps accordion/note */}
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              Cara Menambahkan Domain di Firebase Console (Hanya butuh 30 detik):
            </div>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-400 ml-1">
              <li>Klik tautan <strong>Buka Firebase Console</strong> di atas.</li>
              <li>Pilih tab <strong>"Authorized domains" (Domain Resmi)</strong> di bagian atas.</li>
              <li>Klik tombol <strong>"Add domain" (Tambahkan domain)</strong>.</li>
              <li>Tempelkan domain: <strong className="text-amber-300 font-mono text-[10px]">{currentHostname}</strong> lalu klik <strong>Done / Simpan</strong>.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
