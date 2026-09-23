import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import {
  Building2,
  Wallet,
  QrCode,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Download,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { UserProfile, WhistleblowingReport } from '../types';
import { PosterModal } from '../components/PosterModal';

export const PerusahaanDashboard: React.FC = () => {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const { navigate } = useNavigation();

  const [companyProfile, setCompanyProfile] = useState<UserProfile | null>(authProfile);
  const [reports, setReports] = useState<WhistleblowingReport[]>([]);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'laporan' | 'sop'>('overview');

  // Route protection
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Realtime onSnapshot doc users/{uid} as explicitly required
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeDoc = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setCompanyProfile({
            uid: user.uid,
            email: data.email || user.email || '',
            role: data.role || 'perusahaan',
            namaPT: data.namaPT || 'PT Tanpa Nama',
            sektor: data.sektor || 'Manufaktur & Bisnis',
            alamat: data.alamat || '-',
            deskripsi: data.deskripsi || '-',
            danaTersedia: Number(data.danaTersedia || 0),
            saldo: Number(data.saldo || 0),
            createdAt: data.createdAt,
          });
        }
      },
      (error) => {
        console.error('Error in onSnapshot users/{uid}:', error);
      }
    );

    // Also listen to whistleblowing reports for this company
    const qReports = query(collection(db, 'reports'), where('companyId', '==', user.uid));
    const unsubscribeReports = onSnapshot(
      qReports,
      (snapshot) => {
        const list: WhistleblowingReport[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            companyId: d.companyId,
            companyName: d.companyName,
            judul: d.judul || 'Laporan Dugaan Pelanggaran',
            kategori: d.kategori || 'Umum',
            deskripsi: d.deskripsi || '',
            tanggalKejadian: d.tanggalKejadian,
            lokasi: d.lokasi,
            status: d.status || 'baru',
            tokenAkses: d.tokenAkses || '',
            pelaporAnonim: d.pelaporAnonim !== false,
            buktiFiles: d.buktiFiles || [],
            isContoh: Boolean(d.isContoh),
            catatanAuditor: d.catatanAuditor,
            auditorName: d.auditorName,
            createdAt: d.createdAt,
          });
        });
        setReports(list);
      },
      (error) => {
        console.warn('Reports collection snapshot:', error);
      }
    );

    return () => {
      unsubscribeDoc();
      unsubscribeReports();
    };
  }, [user]);

  const namaPT = companyProfile?.namaPT || 'PT Anda';
  const danaTersedia = Number(companyProfile?.danaTersedia || 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Company Header Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                PORTAL RESMI PERUSAHAAN (PT)
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {namaPT}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Sektor: <span className="text-slate-200 font-semibold">{companyProfile?.sektor || '-'}</span> •{' '}
                Alamat: <span className="text-slate-300">{companyProfile?.alamat || '-'}</span>
              </p>
            </div>

            {/* Action: Generate Poster Whistleblowing */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="btn-generate-poster-pt"
                onClick={() => setIsPosterModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2.5 transition-all cursor-pointer"
              >
                <QrCode className="w-5 h-5 text-slate-950" />
                Generate Poster Whistleblowing
              </button>
            </div>
          </div>
        </div>

        {/* Realtime Dana Tersedia Highlight Card (Point 5 from prompt) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Dana Tersedia */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Wallet className="w-32 h-32 text-emerald-400" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Total Reward Tersedia (Realtime onSnapshot)
                  </h3>
                  <p className="text-[11px] text-slate-400">Alokasi Total Reward Whistleblowing & Integritas</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>

            <div className="py-2">
              <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white">
                Rp {danaTersedia.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Dana penjaminan ini dikelola dan ditambahkan oleh Dewan Owner Integritas360 atau dialokasikan dari saldo perusahaan untuk menjamin
                perlindungan saksi dan kelancaran investigasi auditor.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  Kelola Dompet (Deposit, Withdraw & Lock Dana) &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Quick QR Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Poster Whistleblowing
                </span>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                  1080 × 1920 HD
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Siap Tempel & Cetak</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Poster resmi dengan border keemasan dan QR Code aktif yang langsung membuka formulir laporan rahasia.
              </p>
            </div>

            <button
              onClick={() => setIsPosterModalOpen(true)}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Download Poster HD
            </button>
          </div>
        </div>

        {/* Laporan Whistleblowing Masuk untuk PT ini */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Laporan Whistleblowing Masuk ({reports.length})
              </h3>
              <p className="text-xs text-slate-400">
                Laporan pelanggaran yang masuk melalui pemindaian QR Code di poster perusahaan Anda
              </p>
            </div>
            <a
              href={`/lapor/${user?.uid}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              Buka Form Pelaporan Mandiri
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {reports.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/40" />
              <p className="text-sm font-medium text-slate-300">Belum ada laporan pelanggaran tercatat.</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Cetak dan tempel poster whistleblowing agar karyawan atau pemangku kepentingan dapat melaporkan
                apabila menemukan indikasi penyimpangan.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{report.judul}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {report.kategori}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        report.status === 'baru'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : report.status === 'proses'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : report.status === 'selesai'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}
                    >
                      Status: {report.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{report.deskripsi}</p>

                  {report.catatanAuditor && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/30 text-xs text-emerald-300">
                      <span className="font-semibold text-emerald-200">Catatan Auditor: </span>
                      {report.catatanAuditor}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>
                      Pelapor: {report.pelaporAnonim ? '100% Anonim' : 'Identitas Terproteksi'}
                    </span>
                    <span className="font-mono">Tiket: {report.tokenAkses}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SOP Penempelan Poster */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-3">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Info className="w-4 h-4 text-amber-400" />
            Panduan Kepatuhan Penempelan Poster Whistleblowing
          </div>
          <p className="text-slate-400 leading-relaxed">
            Untuk memenuhi regulasi Good Corporate Governance (GCG) dan ISO 37002:2021 Whistleblowing Management Systems,
            perusahaan disarankan mencetak poster yang telah di-generate pada ukuran A3 / A4 dengan laminasi dan
            menempatkannya di minimal 3 titik bebas CCTV pribadi untuk memastikan kenyamanan karyawan melapor.
          </p>
        </div>
      </div>

      {/* POSTER MODAL COMPONENT */}
      {user && (
        <PosterModal
          isOpen={isPosterModalOpen}
          onClose={() => setIsPosterModalOpen(false)}
          company={{
            uid: user.uid,
            namaPT: companyProfile?.namaPT || 'PT Anda',
            danaTersedia: companyProfile?.danaTersedia || 0,
            sektor: companyProfile?.sektor,
          }}
        />
      )}
    </div>
  );
};
