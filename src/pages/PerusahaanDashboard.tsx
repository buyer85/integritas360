import React, { useEffect, useState } from 'react';
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  updateDoc,
  addDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
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
  Coins,
  Scale,
  Award,
  Loader2,
  UserCheck,
  Lock,
  Unlock,
  AlertCircle,
  FileCheck,
  Send,
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
  const [reportFilter, setReportFilter] = useState<'all' | 'menunggu_ambil' | 'kasus_diambil' | 'selesai'>('all');

  // Reward & Sanksi Management State
  const [editingRewardReportId, setEditingRewardReportId] = useState<string | null>(null);
  const [rewardInputVal, setRewardInputVal] = useState<string>('');
  const [sanksiInputMap, setSanksiInputMap] = useState<Record<string, string>>({});
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Live Timer Ticker for 24h Countdown & Auto-Release
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Route protection
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Realtime onSnapshot doc users/{uid}
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
            danaTerkunci: data.danaTerkunci !== undefined ? Number(data.danaTerkunci) : Number(data.danaTersedia || 0),
            statusVerifikasiDokumen: data.statusVerifikasiDokumen,
            createdAt: data.createdAt,
          });
        }
      },
      (error) => {
        console.error('Error in onSnapshot users/{uid}:', error);
      }
    );

    // Listen to whistleblowing reports for this company
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
            tipePelanggaran: d.tipePelanggaran || (d.estimasiKerugian ? 'finansial' : 'etik'),
            estimasiKerugian: Number(d.estimasiKerugian || 0),
            rewardMinAmount: Number(d.rewardMinAmount || 0),
            rewardAmount: d.rewardAmount !== undefined ? Number(d.rewardAmount) : undefined,
            rewardStatusPerusahaan: d.rewardStatusPerusahaan || 'belum_ditentukan',
            rewardClaimed: Boolean(d.rewardClaimed),
            rewardClaimStatus: d.rewardClaimStatus,
            rewardClaimBank: d.rewardClaimBank,
            whatsappPelapor: d.whatsappPelapor,
            targetAuditorName: d.targetAuditorName,
            deskripsi: d.deskripsi || '',
            tanggalKejadian: d.tanggalKejadian,
            lokasi: d.lokasi,
            status: d.status || 'baru',
            tokenAkses: d.tokenAkses || '',
            pelaporAnonim: d.pelaporAnonim !== false,
            buktiFiles: d.buktiFiles || [],
            isContoh: Boolean(d.isContoh),
            catatanAuditor: d.catatanAuditor,
            auditorId: d.auditorId,
            auditorName: d.auditorName || d.targetAuditorName,
            biayaAuditor: Number(d.biayaAuditor || 150000),
            auditorVerified: Boolean(d.auditorVerified),
            auditorVerifiedAt: d.auditorVerifiedAt,
            companyCaseStatus: d.companyCaseStatus || (d.status === 'valid' ? 'menunggu_ambil' : d.status === 'selesai' ? 'selesai' : undefined),
            takenAt: d.takenAt,
            autoReleaseDeadline: d.autoReleaseDeadline,
            sanksiKaryawan: d.sanksiKaryawan,
            rewardReleased: Boolean(d.rewardReleased),
            rewardReleasedAt: d.rewardReleasedAt,
            rewardReleaseType: d.rewardReleaseType,
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
  const danaTerkunci = companyProfile?.danaTerkunci !== undefined ? Number(companyProfile.danaTerkunci) : danaTersedia;

  // Format Remaining Time Helper
  const formatRemainingTime = (deadlineIso?: string) => {
    if (!deadlineIso) return { text: '24:00:00', isExpired: false };
    const diff = new Date(deadlineIso).getTime() - now;
    if (diff <= 0) return { text: '00:00:00 (Sistem Merilis...)', isExpired: true };
    const totalSec = Math.floor(diff / 1000);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    const text = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return { text, isExpired: false };
  };

  // 1. Ambil Kasus Handler
  const handleTakeCase = async (report: WhistleblowingReport) => {
    if (!report.id || !user) return;

    try {
      setActionLoadingId(report.id);
      setActionFeedback(null);

      // Deadline 24 jam ke depan
      const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await updateDoc(doc(db, 'reports', report.id), {
        companyCaseStatus: 'kasus_diambil',
        takenAt: serverTimestamp(),
        autoReleaseDeadline: deadline
      });

      setActionFeedback({
        type: 'success',
        message: `Kasus "${report.judul}" berhasil diambil! Akses bukti dan uraian investigasi telah dibuka. Anda wajib mengenakan sanksi pada oknum dan merilis reward dalam 1x24 jam.`
      });
    } catch (err: any) {
      console.error('Error taking case:', err);
      setActionFeedback({
        type: 'error',
        message: 'Gagal mengambil kasus: ' + (err.message || 'Terjadi kesalahan sistem')
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // 2. Rilis Reward & Potong Saldo Lock (Manual atau Auto 1x24 Jam)
  const handleReleaseReward = async (report: WhistleblowingReport, isAuto = false) => {
    if (!user || !report.id) return;

    const kerugian = Number(report.estimasiKerugian || 0);
    const minReward = report.tipePelanggaran === 'finansial' ? Math.round(kerugian * 0.02) : 5000000;
    const nominalReward = report.rewardAmount !== undefined ? report.rewardAmount : (minReward || 5000000);
    const auditorFee = Number(report.biayaAuditor || 150000);
    const totalPotongan = nominalReward + auditorFee;

    try {
      setActionLoadingId(report.id);
      setActionFeedback(null);

      // 1. Potong Saldo Lock Perusahaan (danaTerkunci, danaTersedia, saldo)
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        danaTerkunci: increment(-totalPotongan),
        danaTersedia: increment(-totalPotongan),
        saldo: increment(-totalPotongan)
      });

      // 2. Masukkan Honorarium Fee ke Saldo Auditor jika ada auditorId
      if (report.auditorId) {
        try {
          await updateDoc(doc(db, 'users', report.auditorId), {
            saldo: increment(auditorFee)
          });
        } catch (auditorErr) {
          console.warn('Gagal update saldo auditor langsung:', auditorErr);
        }
      }

      // 3. Catat Mutasi Transaksi
      // a) Pemotongan saldo lock untuk reward pelapor
      await addDoc(collection(db, 'transactions'), {
        type: 'potong_lock_reward',
        amount: nominalReward,
        status: 'selesai',
        userId: user.uid,
        companyName: namaPT,
        claimReportToken: report.tokenAkses,
        claimReportId: report.id,
        keterangan: `Pencairan reward pelapor (${report.tipePelanggaran === 'finansial' ? 'Finansial' : 'Etik'}) tiket #${report.tokenAkses} [${
          isAuto ? 'AUTO 1x24 JAM SISTEM' : 'MANUAL OLEH PERUSAHAAN'
        }]`,
        whatsapp: report.whatsappPelapor || '',
        createdAt: serverTimestamp()
      });

      // b) Pemotongan saldo lock untuk biaya jasa auditor
      await addDoc(collection(db, 'transactions'), {
        type: 'potong_lock_auditor',
        amount: auditorFee,
        status: 'selesai',
        userId: user.uid,
        companyName: namaPT,
        claimReportToken: report.tokenAkses,
        claimReportId: report.id,
        keterangan: `Biaya jasa investigasi auditor (${report.auditorName || 'Auditor'}) untuk laporan #${report.tokenAkses}`,
        createdAt: serverTimestamp()
      });

      // c) Mutasi penerimaan fee auditor
      if (report.auditorId) {
        await addDoc(collection(db, 'transactions'), {
          type: 'fee_auditor_masuk',
          amount: auditorFee,
          status: 'selesai',
          userId: report.auditorId,
          companyName: namaPT,
          claimReportToken: report.tokenAkses,
          claimReportId: report.id,
          keterangan: `Penerimaan honorarium audit laporan #${report.tokenAkses} dari ${namaPT}`,
          createdAt: serverTimestamp()
        });
      }

      // 4. Update Dokumen Laporan
      const sanksiKeterangan =
        (sanksiInputMap[report.id] || '').trim() ||
        report.sanksiKaryawan ||
        'Karyawan pelanggar telah dikenakan sanksi disipliner tegas sesuai ketentuan dan regulasi perusahaan.';

      await updateDoc(doc(db, 'reports', report.id), {
        status: 'selesai',
        companyCaseStatus: 'selesai',
        rewardReleased: true,
        rewardReleasedAt: serverTimestamp(),
        rewardReleaseType: isAuto ? 'auto_sistem_24jam' : 'manual_perusahaan',
        sanksiKaryawan: sanksiKeterangan,
        rewardAmount: nominalReward,
        rewardStatusPerusahaan: 'disetujui',
        rewardClaimStatus: report.rewardClaimBank ? 'pending' : 'siap_diklaim'
      });

      setActionFeedback({
        type: 'success',
        message: isAuto
          ? `Batas waktu 1x24 jam telah tercapai: Sistem otomatis merilis reward Rp ${nominalReward.toLocaleString('id-ID')} dan biaya jasa auditor Rp ${auditorFee.toLocaleString('id-ID')}. Saldo lock perusahaan telah dipotong Rp ${totalPotongan.toLocaleString('id-ID')}.`
          : `Reward Rp ${nominalReward.toLocaleString('id-ID')} dan biaya auditor Rp ${auditorFee.toLocaleString('id-ID')} berhasil dirilis! Saldo lock perusahaan telah terpotong Rp ${totalPotongan.toLocaleString('id-ID')}. Sanksi karyawan berhasil dicatat.`
      });
    } catch (err: any) {
      console.error('Error releasing reward:', err);
      setActionFeedback({
        type: 'error',
        message: 'Gagal merilis reward: ' + (err.message || 'Terjadi kesalahan sistem')
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. Auto-Release Check (Effect triggered when 24h deadline expires)
  useEffect(() => {
    reports.forEach((rep) => {
      if (
        rep.id &&
        rep.companyCaseStatus === 'kasus_diambil' &&
        !rep.rewardReleased &&
        rep.autoReleaseDeadline
      ) {
        const deadlineTime = new Date(rep.autoReleaseDeadline).getTime();
        if (deadlineTime <= now && actionLoadingId !== rep.id) {
          console.log('1x24h Auto-Release executed for report:', rep.id);
          handleReleaseReward(rep, true);
        }
      }
    });
  }, [now, reports]);

  // Save Nominal Reward (Optional adjustment by company)
  const handleSaveReward = async (report: WhistleblowingReport) => {
    if (!report.id) return;
    const cleanAmount = Number(rewardInputVal.replace(/\D/g, '')) || 0;

    if (report.tipePelanggaran === 'finansial') {
      const min2Percent = Math.round((report.estimasiKerugian || 0) * 0.02);
      if (cleanAmount < min2Percent) {
        setActionFeedback({
          type: 'error',
          message: `Untuk pelanggaran finansial, reward minimal adalah 2% dari kerugian (minimal Rp ${min2Percent.toLocaleString('id-ID')}).`
        });
        return;
      }
    } else {
      if (cleanAmount <= 0) {
        setActionFeedback({
          type: 'error',
          message: 'Harap masukkan nominal reward yang valid.'
        });
        return;
      }
    }

    try {
      setActionLoadingId(report.id);
      setActionFeedback(null);
      await updateDoc(doc(db, 'reports', report.id), {
        rewardAmount: cleanAmount,
        rewardStatusPerusahaan: 'disetujui'
      });
      setEditingRewardReportId(null);
      setRewardInputVal('');
      setActionFeedback({
        type: 'success',
        message: `Besaran reward untuk laporan "${report.judul}" berhasil disesuaikan menjadi Rp ${cleanAmount.toLocaleString('id-ID')}.`
      });
    } catch (err: any) {
      console.error('Error saving reward:', err);
      setActionFeedback({
        type: 'error',
        message: 'Gagal memperbarui reward: ' + (err.message || 'Terjadi kesalahan')
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter reports
  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'all') return true;
    if (reportFilter === 'menunggu_ambil') {
      return r.companyCaseStatus === 'menunggu_ambil' || (r.status === 'valid' && !r.takenAt);
    }
    if (reportFilter === 'kasus_diambil') {
      return r.companyCaseStatus === 'kasus_diambil' && !r.rewardReleased;
    }
    if (reportFilter === 'selesai') {
      return r.rewardReleased === true || r.status === 'selesai';
    }
    return true;
  });

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
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {namaPT}
                </h1>
                {companyProfile?.statusVerifikasiDokumen === 'terverifikasi' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold shadow-sm shadow-emerald-500/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Terverifikasi
                  </span>
                )}
              </div>
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

        {/* Realtime Saldo & Dana Lock Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Saldo Lock & Dana Tersedia */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Wallet className="w-32 h-32 text-emerald-400" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Saldo Lock Penjaminan Whistleblowing
                  </h3>
                  <p className="text-[11px] text-slate-400">Dipakai untuk rilis reward pelapor & biaya jasa auditor</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync (onSnapshot)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30">
                <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider block">
                  Dana Lock Penjaminan
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mt-1">
                  Rp {danaTerkunci.toLocaleString('id-ID')}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Otomatis terpotong saat rilis reward + biaya auditor (Rp 150.000/kasus)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                  Total Dana Tersedia
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-300 mt-1">
                  Rp {danaTersedia.toLocaleString('id-ID')}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Ditampilkan pada poster resmi whistleblowing perusahaan
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <p className="text-slate-400 text-[11px] max-w-lg">
                Ketentuan: Saat kasus dinyatakan valid oleh auditor, perusahaan wajib klik <strong>"Ambil Kasus"</strong>. Setelah sanksi karyawan ditetapkan, klik <strong>"Rilis Reward"</strong>. Bila dalam 1x24 jam belum dirilis, sistem otomatis merilisnya.
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                Kelola Dompet & Saldo &rarr;
              </button>
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
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Laporan & Kasus Whistleblowing ({reports.length})
              </h3>
              <p className="text-xs text-slate-400">
                Alur: Diverifikasi Auditor &rarr; Perusahaan Ambil Kasus &rarr; Kenakan Sanksi &rarr; Rilis Reward (Auto 1x24 Jam)
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {[
                { id: 'all', label: `Semua (${reports.length})` },
                {
                  id: 'menunggu_ambil',
                  label: `Perlu Diambil (${reports.filter((r) => r.companyCaseStatus === 'menunggu_ambil' || (r.status === 'valid' && !r.takenAt)).length})`
                },
                {
                  id: 'kasus_diambil',
                  label: `Sedang Diinvestigasi (${reports.filter((r) => r.companyCaseStatus === 'kasus_diambil' && !r.rewardReleased).length})`
                },
                {
                  id: 'selesai',
                  label: `Selesai / Dirilis (${reports.filter((r) => r.rewardReleased || r.status === 'selesai').length})`
                }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setReportFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    reportFilter === tab.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {actionFeedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 animate-fadeIn ${
                actionFeedback.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/60 border-red-500/50 text-red-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {actionFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{actionFeedback.message}</span>
              </div>
              <button
                onClick={() => setActionFeedback(null)}
                className="text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}

          {filteredReports.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/40" />
              <p className="text-sm font-medium text-slate-300">Tidak ada kasus pada kategori ini.</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Laporan pelanggaran yang diverifikasi auditor akan muncul di sini untuk diambil kasusnya oleh perusahaan.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredReports.map((report) => {
                const isFinansial = report.tipePelanggaran === 'finansial';
                const kerugian = Number(report.estimasiKerugian || 0);
                const min2Persen = Math.round(kerugian * 0.02);
                const currentReward = report.rewardAmount !== undefined ? report.rewardAmount : (isFinansial ? min2Persen : 5000000);
                const auditorFee = Number(report.biayaAuditor || 150000);
                const totalPotongLock = currentReward + auditorFee;

                const isNeedsTake = report.companyCaseStatus === 'menunggu_ambil' || (report.status === 'valid' && !report.takenAt);
                const isTakenInProgress = report.companyCaseStatus === 'kasus_diambil' && !report.rewardReleased;
                const isReleased = report.rewardReleased === true || report.status === 'selesai';
                const isProcessing = actionLoadingId === report.id;
                const isEditingReward = editingRewardReportId === report.id;

                const timerInfo = formatRemainingTime(report.autoReleaseDeadline);

                return (
                  <div
                    key={report.id}
                    className={`p-6 rounded-2xl border transition-all space-y-5 shadow-xl ${
                      isNeedsTake
                        ? 'bg-slate-950/90 border-blue-500/40 ring-1 ring-blue-500/20'
                        : isTakenInProgress
                        ? 'bg-slate-950/90 border-amber-500/40 ring-1 ring-amber-500/20'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    {/* Header Baris 1: Judul, Status Verifikasi Auditor & Perusahaan */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-white">{report.judul}</span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                          {report.kategori}
                        </span>

                        {isFinansial ? (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
                            <Coins className="w-3 h-3 text-amber-400" />
                            Pelanggaran Finansial
                          </span>
                        ) : (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold flex items-center gap-1">
                            <Scale className="w-3 h-3 text-purple-400" />
                            Pelanggaran Etik
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-slate-400">
                          Tiket: #{report.tokenAkses}
                        </span>
                      </div>

                      {/* Status Workflow Tag */}
                      <div className="flex items-center gap-2">
                        {isNeedsTake ? (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
                            VALID DARI AUDITOR: Perlu Ambil Kasus
                          </span>
                        ) : isTakenInProgress ? (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                            KASUS DIAMBIL: Dalam Investigasi Sanksi
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            REWARD DIRILIS & SELESAI
                          </span>
                        )}
                      </div>
                    </div>

                    {/* TAHAP 1: KASUS BELUM DIAMBIL (HARUS KLIK AMBIL KASUS) */}
                    {isNeedsTake && (
                      <div className="p-5 rounded-2xl bg-blue-950/30 border border-blue-500/40 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                              Laporan Telah Dinyatakan VALID oleh Auditor Independen
                            </div>
                            <p className="text-xs text-slate-300">
                              Auditor penelaah: <strong className="text-emerald-400">{report.auditorName || 'Auditor Independen'}</strong> • Biaya Jasa: <strong className="text-emerald-400 font-mono">Rp {auditorFee.toLocaleString('id-ID')}</strong>
                            </p>
                          </div>

                          <button
                            disabled={isProcessing}
                            onClick={() => handleTakeCase(report)}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer shrink-0 transition-transform active:scale-95"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Unlock className="w-4 h-4" />
                            )}
                            Ambil Kasus & Buka Bukti
                          </button>
                        </div>

                        {/* Catatan Auditor */}
                        {report.catatanAuditor && (
                          <div className="p-3 bg-slate-900/90 rounded-xl border border-blue-500/20 text-xs text-slate-300">
                            <span className="text-[11px] font-semibold text-blue-300 block mb-0.5">Catatan Validasi Auditor:</span>
                            "{report.catatanAuditor}"
                          </div>
                        )}

                        {/* Locked Evidence Placeholder */}
                        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-2 text-xs text-slate-400">
                          <Lock className="w-6 h-6 text-slate-500 mx-auto" />
                          <p className="font-semibold text-slate-300">
                            Bukti Dokumen/Foto & Kronologi Lengkap Sedang Terkunci
                          </p>
                          <p className="text-[11px] max-w-lg mx-auto text-slate-400">
                            Sesuai SOP, perusahaan wajib mengklik tombol <strong>"Ambil Kasus & Buka Bukti"</strong> untuk membuka berkas laporan, melakukan tindakan disipliner pada oknum karyawan, dan memulai hitung mundur 1x24 jam rilis reward.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* TAHAP 2: KASUS SUDAH DIAMBIL ATAU SUDAH DIRILIS (BUKTI TERBUKA) */}
                    {!isNeedsTake && (
                      <div className="space-y-4">
                        {/* Deskripsi Laporan Lengkap */}
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-slate-400">Kronologi & Uraian Dugaan Pelanggaran:</span>
                          <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 whitespace-pre-wrap">
                            {report.deskripsi}
                          </p>
                        </div>

                        {/* Galeri Bukti Dokumen / Foto */}
                        {report.buktiFiles && report.buktiFiles.length > 0 && (
                          <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                              <FileCheck className="w-4 h-4 text-emerald-400" />
                              Berkas Bukti / Dokumen Investigasi ({report.buktiFiles.length} Berkas):
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                              {report.buktiFiles.map((bUrl, idx) => (
                                <a
                                  key={idx}
                                  href={bUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="group relative rounded-xl overflow-hidden border border-slate-700 hover:border-amber-400 bg-slate-950 block shadow"
                                >
                                  <img
                                    src={bUrl}
                                    alt={`Bukti ${idx + 1}`}
                                    className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-x-0 bottom-0 bg-slate-950/90 p-1 text-[10px] text-center text-slate-300 font-medium">
                                    Bukti #{idx + 1} (Klik Buka)
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Info Kerugian & Auditor */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {isFinansial && (
                            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-300/90 space-y-1">
                              <div className="font-semibold text-amber-200 flex items-center gap-1">
                                <Coins className="w-3.5 h-3.5 text-amber-400" />
                                Estimasi Nilai Kerugian:
                              </div>
                              <div className="text-base font-bold font-mono text-white">
                                Rp {kerugian.toLocaleString('id-ID')}
                              </div>
                              <div className="text-[11px] text-amber-400/90">
                                Aturan Regulasi: Minimal reward 2% = <strong>Rp {min2Persen.toLocaleString('id-ID')}</strong>
                              </div>
                            </div>
                          )}

                          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-300 space-y-1">
                            <div className="font-semibold text-slate-200 flex items-center gap-1 text-xs">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                              Auditor Independen Penelaah:
                            </div>
                            <div className="text-xs font-bold text-emerald-400">
                              {report.auditorName || 'Auditor Terpilih'} • Biaya Jasa: Rp {auditorFee.toLocaleString('id-ID')}
                            </div>
                            {report.catatanAuditor ? (
                              <p className="text-[11px] text-slate-300 italic pt-0.5">"{report.catatanAuditor}"</p>
                            ) : (
                              <p className="text-[11px] text-slate-500 italic pt-0.5">Verifikasi validitas telah terbit.</p>
                            )}
                          </div>
                        </div>

                        {/* TAHAP 2A: SEDANG DIINVESTIGASI OLEH PERUSAHAAN (1x24 JAM TIMER & FORM SANKSI) */}
                        {isTakenInProgress && (
                          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/40 space-y-4">
                            {/* Live Countdown Timer Widget */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/30">
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                                  Batas Waktu Rilis Reward (Maksimal 1x24 Jam)
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Jika perusahaan tidak merilis reward sebelum batas waktu, sistem otomatis mengeksekusi rilis reward & memotong saldo lock.
                                </p>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-lg sm:text-xl font-black font-mono text-amber-400 tracking-wider">
                                  {timerInfo.text}
                                </div>
                                <span className="text-[10px] text-slate-400 block">Sisa Waktu Otomatisasi</span>
                              </div>
                            </div>

                            {/* Form Input Sanksi Karyawan */}
                            <div className="space-y-2">
                              <label className="block text-xs font-semibold text-slate-200">
                                Keterangan Tindakan Sanksi Karyawan / Oknum Terlapor:
                              </label>
                              <textarea
                                rows={2}
                                placeholder="Contoh: Dikenakan sanksi Surat Peringatan III (SP3), pencopotan jabatan, dan pengembalian aset/kerugian perusahaan..."
                                value={sanksiInputMap[report.id!] || ''}
                                onChange={(e) =>
                                  setSanksiInputMap((prev) => ({
                                    ...prev,
                                    [report.id!]: e.target.value
                                  }))
                                }
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                              />
                            </div>

                            {/* Info Pemotongan Saldo Lock */}
                            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                              <div className="flex flex-wrap items-center justify-between text-slate-300">
                                <span>Nominal Reward Pelapor:</span>
                                <span className="font-mono font-bold text-amber-400">Rp {currentReward.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="flex flex-wrap items-center justify-between text-slate-300">
                                <span>Biaya Jasa Auditor Independen:</span>
                                <span className="font-mono font-bold text-emerald-400">Rp {auditorFee.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="flex flex-wrap items-center justify-between font-bold text-white pt-1 border-t border-slate-800">
                                <span>Total Pemotongan Saldo Lock:</span>
                                <span className="font-mono text-emerald-300">Rp {totalPotongLock.toLocaleString('id-ID')}</span>
                              </div>
                            </div>

                            {/* Tombol Rilis Reward */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                              <div className="text-[11px] text-slate-400">
                                Saldo Lock Penjaminan Anda: <strong className="text-white">Rp {danaTerkunci.toLocaleString('id-ID')}</strong>
                              </div>

                              <button
                                disabled={isProcessing}
                                onClick={() => handleReleaseReward(report, false)}
                                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950 cursor-pointer transition-transform active:scale-95"
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                                Rilis Reward & Terapkan Sanksi (Rp {totalPotongLock.toLocaleString('id-ID')})
                              </button>
                            </div>
                          </div>
                        )}

                        {/* TAHAP 2B: REWARD TELAH DIRILIS (SELESAI) */}
                        {isReleased && (
                          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-3 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>
                                  Reward Berhasil Dirilis ({report.rewardReleaseType === 'auto_sistem_24jam' ? 'Otomatis oleh Sistem 1x24 Jam' : 'Oleh Perusahaan'})
                                </span>
                              </div>
                              <span className="text-[11px] text-emerald-400 font-mono">
                                Total Potong Saldo Lock: Rp {totalPotongLock.toLocaleString('id-ID')}
                              </span>
                            </div>

                            {report.sanksiKaryawan && (
                              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-emerald-500/20 text-slate-300">
                                <span className="text-[11px] font-semibold text-emerald-300 block mb-0.5">Sanksi Karyawan Diterapkan:</span>
                                {report.sanksiKaryawan}
                              </div>
                            )}

                            {/* Rekening Tujuan Pelapor jika sudah diklaim */}
                            {report.rewardClaimBank ? (
                              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                <span>Tujuan Transfer: <strong>{report.rewardClaimBank.bankName}</strong> ({report.rewardClaimBank.accountNumber} a/n {report.rewardClaimBank.holderName})</span>
                                {report.whatsappPelapor && <span className="text-emerald-400">WA: {report.whatsappPelapor}</span>}
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 italic">
                                Pelapor dapat mencairkan reward kapan saja ke rekening bank / e-wallet menggunakan Nomor Tiket Rahasia (#{report.tokenAkses}).
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer Info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>
                        Pelapor: {report.pelaporAnonim ? '100% Anonim' : 'Identitas Terproteksi'}
                        {report.whatsappPelapor && ` • WA Notif: ${report.whatsappPelapor}`}
                      </span>
                      <span className="text-slate-500 italic">Kerahasiaan Pelapor Terjamin Mutlak</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SOP Penempelan Poster */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-3">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Info className="w-4 h-4 text-amber-400" />
            Panduan Kepatuhan Penempelan Poster Whistleblowing
          </div>
          <p className="leading-relaxed">
            Perusahaan yang telah menempelkan poster resmi integritas wajib mematuhi alur penanganan laporan. Ketika auditor independen menelaah berkas dan menyatakan valid, manajemen perusahaan diberikan akses investigasi penuh setelah mengklik <strong>"Ambil Kasus"</strong>. Penetapan sanksi terhadap karyawan pelanggar serta rilis reward harus diselesaikan dalam kurun waktu <strong>1x24 jam</strong>.
          </p>
        </div>
      </div>

      {/* Poster HD Modal Component */}
      <PosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        company={{
          uid: user?.uid || '',
          namaPT: companyProfile?.namaPT || 'PT Anda',
          danaTersedia: Number(companyProfile?.danaTersedia || 0),
          sektor: companyProfile?.sektor,
        }}
      />
    </div>
  );
};
