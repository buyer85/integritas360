import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db, OWNER_EMAIL } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Eye,
  Wallet,
  PlusCircle,
  Download,
  Search,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  FileText,
  ExternalLink,
  Clock,
  XCircle,
  AlertTriangle,
  CreditCard,
  ArrowDownLeft,
  Award,
  Banknote,
  Check,
  X,
  MessageCircle,
  Filter
} from 'lucide-react';
import { UserProfile } from '../types';
import { PosterModal } from '../components/PosterModal';
import { PosterOptions } from '../utils/posterGenerator';

interface AdminTransaction {
  id: string;
  userId?: string;
  type: 'deposit' | 'withdrawal' | 'lock' | 'unlock' | 'claim_reward';
  amount: number;
  status: 'pending' | 'selesai' | 'ditolak';
  keterangan?: string;
  method?: string;
  bankName?: string;
  accountNumber?: string;
  holderName?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    holderName: string;
  };
  claimReportToken?: string;
  claimReportId?: string;
  companyName?: string;
  whatsapp?: string;
  userEmail?: string;
  catatanAdmin?: string;
  createdAt?: any;
}

export const OwnerDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { navigate } = useNavigation();

  // Active Tab: 'entitas' | 'dokumen' | 'keuangan' | 'reward'
  const [activeTab, setActiveTab] = useState<'entitas' | 'dokumen' | 'keuangan' | 'reward'>('entitas');

  const [perusahaanList, setPerusahaanList] = useState<UserProfile[]>([]);
  const [auditorList, setAuditorList] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Top Up Modal State
  const [selectedPTForTopUp, setSelectedPTForTopUp] = useState<UserProfile | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<number>(10000000);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // Poster Modal State
  const [selectedPTForPoster, setSelectedPTForPoster] = useState<PosterOptions | null>(null);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  // Rejection Modal State
  const [rejectionTarget, setRejectionTarget] = useState<{
    type: 'dokumen' | 'transaksi' | 'reward';
    id: string;
    subId?: string;
    nominal?: number;
    userId?: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  // Filter states
  const [docFilter, setDocFilter] = useState<'semua' | 'pending' | 'terverifikasi' | 'ditolak'>('semua');
  const [txFilter, setTxFilter] = useState<'semua' | 'pending' | 'selesai' | 'ditolak'>('semua');

  // ProtectedRoute Check: only susidewiyuliyanti@gmail.com can access
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (user.email?.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
        navigate('/perusahaan');
      }
    }
  }, [user, authLoading, navigate]);

  // Realtime subscription for Perusahaan & Auditor
  useEffect(() => {
    if (!user || user.email?.toLowerCase() !== OWNER_EMAIL.toLowerCase()) return;

    // 1. Listen to Perusahaan
    const qPerusahaan = query(collection(db, 'users'), where('role', '==', 'perusahaan'));
    const unsubPerusahaan = onSnapshot(
      qPerusahaan,
      (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            uid: docSnap.id,
            email: data.email || '',
            role: 'perusahaan',
            namaPT: data.namaPT || 'PT Tanpa Nama',
            sektor: data.sektor || 'Umum',
            alamat: data.alamat || '-',
            deskripsi: data.deskripsi || '-',
            danaTersedia: Number(data.danaTersedia || 0),
            saldo: Number(data.saldo || 0),
            createdAt: data.createdAt,
            dokumenUrl: data.dokumenUrl,
            dokumenNama: data.dokumenNama,
            statusVerifikasiDokumen: data.statusVerifikasiDokumen || 'belum_upload',
            catatanVerifikasi: data.catatanVerifikasi || '',
            namaBank: data.namaBank,
            nomorRekening: data.nomorRekening,
            pemilikRekening: data.pemilikRekening
          });
        });
        setPerusahaanList(list);
      },
      (error) => {
        console.error('Error fetching perusahaan:', error);
      }
    );

    // 2. Listen to Auditor
    const qAuditor = query(collection(db, 'users'), where('role', '==', 'auditor'));
    const unsubAuditor = onSnapshot(
      qAuditor,
      (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            uid: docSnap.id,
            email: data.email || '',
            role: 'auditor',
            namaPT: data.namaPT || 'Auditor',
            sektor: data.sektor || 'Audit',
            alamat: data.alamat || '-',
            deskripsi: data.deskripsi || '-',
            danaTersedia: Number(data.danaTersedia || 0),
            saldo: Number(data.saldo || 0),
            createdAt: data.createdAt,
            dokumenUrl: data.dokumenUrl,
            dokumenNama: data.dokumenNama,
            statusVerifikasiDokumen: data.statusVerifikasiDokumen || 'belum_upload',
            catatanVerifikasi: data.catatanVerifikasi || '',
            namaBank: data.namaBank,
            nomorRekening: data.nomorRekening,
            pemilikRekening: data.pemilikRekening
          });
        });
        setAuditorList(list);
      },
      (error) => {
        console.error('Error fetching auditor:', error);
      }
    );

    // 3. Listen to Transactions
    const qTx = collection(db, 'transactions');
    const unsubTx = onSnapshot(
      qTx,
      (snapshot) => {
        const list: AdminTransaction[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            userId: d.userId,
            type: d.type,
            amount: Number(d.amount || 0),
            status: d.status || 'pending',
            keterangan: d.keterangan || '',
            method: d.method,
            bankName: d.bankName || d.bankDetails?.bankName,
            accountNumber: d.accountNumber || d.bankDetails?.accountNumber,
            holderName: d.holderName || d.bankDetails?.holderName,
            bankDetails: d.bankDetails,
            claimReportToken: d.claimReportToken,
            claimReportId: d.claimReportId,
            companyName: d.companyName,
            whatsapp: d.whatsapp,
            userEmail: d.userEmail,
            catatanAdmin: d.catatanAdmin,
            createdAt: d.createdAt
          });
        });
        // Sort newest first
        list.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        setTransactions(list);
      },
      (error) => {
        console.error('Error fetching transactions:', error);
      }
    );

    return () => {
      unsubPerusahaan();
      unsubAuditor();
      unsubTx();
    };
  }, [user]);

  // Combined entity list for Document verification
  const allEntitiesWithDocs = [...perusahaanList, ...auditorList].filter(
    (e) => e.dokumenUrl || (e.statusVerifikasiDokumen && e.statusVerifikasiDokumen !== 'belum_upload')
  );

  // Pending counts
  const pendingDocsCount = allEntitiesWithDocs.filter((e) => e.statusVerifikasiDokumen === 'pending').length;
  const pendingFinanceTxCount = transactions.filter(
    (t) => (t.type === 'deposit' || t.type === 'withdrawal') && t.status === 'pending'
  ).length;
  const pendingRewardsCount = transactions.filter(
    (t) => t.type === 'claim_reward' && t.status === 'pending'
  ).length;

  // Filtered companies
  const filteredPerusahaan = perusahaanList.filter(
    (pt) =>
      pt.namaPT.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pt.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pt.sektor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Top Up Handler using increment()
  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPTForTopUp || topUpAmount <= 0) return;

    try {
      setTopUpLoading(true);
      const userRef = doc(db, 'users', selectedPTForTopUp.uid);

      await updateDoc(userRef, {
        danaTersedia: increment(topUpAmount),
        saldo: increment(topUpAmount)
      });

      setTopUpSuccess(true);
      setTimeout(() => {
        setTopUpSuccess(false);
        setSelectedPTForTopUp(null);
      }, 1500);
    } catch (err) {
      console.error('Error updating dana via increment:', err);
    } finally {
      setTopUpLoading(false);
    }
  };

  const openPosterModal = (pt: UserProfile) => {
    setSelectedPTForPoster({
      uid: pt.uid,
      namaPT: pt.namaPT,
      danaTersedia: pt.danaTersedia,
      sektor: pt.sektor
    });
    setIsPosterModalOpen(true);
  };

  // 1. APPROVE DOCUMENT
  const handleApproveDocument = async (entity: UserProfile) => {
    try {
      setProcessingAction(true);
      const userRef = doc(db, 'users', entity.uid);
      await updateDoc(userRef, {
        statusVerifikasiDokumen: 'terverifikasi',
        catatanVerifikasi: 'Dokumen legalitas telah diverifikasi dan disetujui oleh Administrator INTEGRITAS360.'
      });
    } catch (err) {
      console.error('Error approving document:', err);
    } finally {
      setProcessingAction(false);
    }
  };

  // 2. APPROVE TRANSACTION (DEPOSIT / WITHDRAWAL)
  const handleApproveTransaction = async (tx: AdminTransaction) => {
    try {
      setProcessingAction(true);
      const txRef = doc(db, 'transactions', tx.id);

      if (tx.type === 'deposit') {
        // Approve deposit -> update tx status & increment user saldo & danaTersedia
        await updateDoc(txRef, {
          status: 'selesai',
          processedAt: serverTimestamp(),
          processedBy: user?.email || OWNER_EMAIL
        });

        if (tx.userId) {
          const userRef = doc(db, 'users', tx.userId);
          await updateDoc(userRef, {
            saldo: increment(tx.amount),
            danaTersedia: increment(tx.amount)
          });
        }
      } else if (tx.type === 'withdrawal') {
        // Approve withdrawal -> money already deducted on user side, just mark finished
        await updateDoc(txRef, {
          status: 'selesai',
          processedAt: serverTimestamp(),
          processedBy: user?.email || OWNER_EMAIL
        });
      }
    } catch (err) {
      console.error('Error approving transaction:', err);
    } finally {
      setProcessingAction(false);
    }
  };

  // 3. APPROVE CLAIM REWARD
  const handleApproveClaimReward = async (tx: AdminTransaction) => {
    try {
      setProcessingAction(true);
      const txRef = doc(db, 'transactions', tx.id);

      await updateDoc(txRef, {
        status: 'selesai',
        processedAt: serverTimestamp(),
        processedBy: user?.email || OWNER_EMAIL
      });

      // Update report doc if report ID or token is linked
      if (tx.claimReportId) {
        const reportRef = doc(db, 'reports', tx.claimReportId);
        await updateDoc(reportRef, {
          rewardClaimStatus: 'selesai',
          rewardClaimed: true
        });
      }
    } catch (err) {
      console.error('Error approving reward claim:', err);
    } finally {
      setProcessingAction(false);
    }
  };

  // 4. SUBMIT REJECTION
  const handleRejectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionTarget || !rejectionReason.trim()) return;

    try {
      setProcessingAction(true);

      if (rejectionTarget.type === 'dokumen') {
        const userRef = doc(db, 'users', rejectionTarget.id);
        await updateDoc(userRef, {
          statusVerifikasiDokumen: 'ditolak',
          catatanVerifikasi: rejectionReason.trim()
        });
      } else if (rejectionTarget.type === 'transaksi') {
        const txRef = doc(db, 'transactions', rejectionTarget.id);
        await updateDoc(txRef, {
          status: 'ditolak',
          catatanAdmin: rejectionReason.trim(),
          processedAt: serverTimestamp(),
          processedBy: user?.email || OWNER_EMAIL
        });

        // If it was a withdrawal that got rejected, refund user's balance
        if (rejectionTarget.subId === 'withdrawal' && rejectionTarget.userId && rejectionTarget.nominal) {
          const userRef = doc(db, 'users', rejectionTarget.userId);
          await updateDoc(userRef, {
            saldo: increment(rejectionTarget.nominal)
          });
        }
      } else if (rejectionTarget.type === 'reward') {
        const txRef = doc(db, 'transactions', rejectionTarget.id);
        await updateDoc(txRef, {
          status: 'ditolak',
          catatanAdmin: rejectionReason.trim(),
          processedAt: serverTimestamp(),
          processedBy: user?.email || OWNER_EMAIL
        });

        if (rejectionTarget.subId) {
          const reportRef = doc(db, 'reports', rejectionTarget.subId);
          await updateDoc(reportRef, {
            rewardClaimStatus: 'ditolak'
          });
        }
      }

      setRejectionTarget(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Error rejecting:', err);
    } finally {
      setProcessingAction(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mr-2" />
        Memeriksa Otoritas Administrator...
      </div>
    );
  }

  // Filtered Document entities
  const filteredDocEntities = allEntitiesWithDocs.filter((e) => {
    if (docFilter === 'semua') return true;
    return e.statusVerifikasiDokumen === docFilter;
  });

  // Filtered Financial transactions
  const filteredFinanceTx = transactions
    .filter((t) => t.type === 'deposit' || t.type === 'withdrawal')
    .filter((t) => {
      if (txFilter === 'semua') return true;
      return t.status === txFilter;
    });

  // Reward claim transactions
  const rewardClaimTx = transactions.filter((t) => t.type === 'claim_reward');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              PANEL ADMINISTRATOR PUSAT
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Pusat Kendali & Verifikasi Integritas360
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Administrator Resmi:{' '}
              <span className="font-mono text-red-300 font-bold">{OWNER_EMAIL}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Database Realtime Verifikasi Aktif
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS WITH PENDING BADGES */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('entitas')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'entitas'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Ringkasan & Entitas</span>
          </button>

          <button
            onClick={() => setActiveTab('dokumen')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer relative ${
              activeTab === 'dokumen'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Verifikasi Dokumen Legalitas</span>
            {pendingDocsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold">
                {pendingDocsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('keuangan')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer relative ${
              activeTab === 'keuangan'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Verifikasi Deposit & Penarikan</span>
            {pendingFinanceTxCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold">
                {pendingFinanceTxCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reward')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer relative ${
              activeTab === 'reward'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Verifikasi Klaim Reward</span>
            {pendingRewardsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold">
                {pendingRewardsCount}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: RINGKASAN & ENTITAS */}
        {activeTab === 'entitas' && (
          <div className="space-y-8">
            {/* STATISTIK: Total Perusahaan, Total Auditor, Total Dana */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Total Perusahaan */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Total Perusahaan
                    </p>
                    <h3 className="text-3xl font-extrabold text-white mt-1.5 font-mono">
                      {perusahaanList.length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-slate-400">
                  <span className="text-blue-400 font-medium mr-1.5">PT Terdaftar</span>
                  di sistem pengawasan whistleblowing
                </div>
              </div>

              {/* Total Auditor */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Total Auditor
                    </p>
                    <h3 className="text-3xl font-extrabold text-white mt-1.5 font-mono">
                      {auditorList.length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Eye className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-slate-400">
                  <span className="text-emerald-400 font-medium mr-1.5">Pihak Independen</span>
                  siap melakukan telaah dan validasi
                </div>
              </div>

              {/* Total Dana */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Total Dana Kepatuhan
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1.5 font-mono">
                      Rp {perusahaanList.reduce((acc, curr) => acc + (curr.danaTersedia || 0), 0).toLocaleString('id-ID')}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Wallet className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-slate-400">
                  <span className="text-emerald-400 font-medium mr-1.5">Akumulasi Saldo</span>
                  seluruh entitas perusahaan aktif
                </div>
              </div>
            </div>

            {/* TABEL DAFTAR PERUSAHAAN */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-950/40">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    Daftar Perusahaan (PT) Terdaftar
                  </h2>
                  <p className="text-xs text-slate-400">
                    Sinkronisasi realtime Firestore ({perusahaanList.length} entitas aktif)
                  </p>
                </div>

                {/* Search */}
                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama PT, email, sektor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {filteredPerusahaan.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-3">
                  <Building2 className="w-12 h-12 mx-auto text-slate-700" />
                  <p className="text-sm font-medium">Belum ada perusahaan yang terdaftar.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5">Nama Perusahaan</th>
                        <th className="px-5 py-3.5">Sektor Industri</th>
                        <th className="px-5 py-3.5">Status Dokumen</th>
                        <th className="px-5 py-3.5">Dana Tersedia</th>
                        <th className="px-5 py-3.5 text-right">Aksi Kelola</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredPerusahaan.map((pt) => (
                        <tr key={pt.uid} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-white text-sm">{pt.namaPT}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">{pt.email}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-block px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium text-[11px]">
                              {pt.sektor}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                                pt.statusVerifikasiDokumen === 'terverifikasi'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : pt.statusVerifikasiDokumen === 'pending'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : pt.statusVerifikasiDokumen === 'ditolak'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {pt.statusVerifikasiDokumen === 'terverifikasi'
                                ? 'Terverifikasi'
                                : pt.statusVerifikasiDokumen === 'pending'
                                ? 'Menunggu Review'
                                : pt.statusVerifikasiDokumen === 'ditolak'
                                ? 'Ditolak'
                                : 'Belum Unggah'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-mono font-bold text-emerald-400 text-sm bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-lg inline-block">
                              Rp {Number(pt.danaTersedia || 0).toLocaleString('id-ID')}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              id={`btn-tambah-dana-${pt.uid}`}
                              onClick={() => {
                                setSelectedPTForTopUp(pt);
                                setTopUpAmount(10000000);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              Tambah Dana
                            </button>

                            <button
                              id={`btn-download-poster-${pt.uid}`}
                              onClick={() => openPosterModal(pt)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Poster QR
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* AUDITOR LIST SECTION */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-emerald-400" />
                    Auditor & Investigator Independen ({auditorList.length})
                  </h2>
                  <p className="text-xs text-slate-400">Daftar auditor independen yang berwenang menelaah laporan</p>
                </div>
              </div>

              {auditorList.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Belum ada auditor terdaftar.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {auditorList.map((auditor) => (
                    <div key={auditor.uid} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{auditor.namaPT}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            auditor.statusVerifikasiDokumen === 'terverifikasi'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : auditor.statusVerifikasiDokumen === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {auditor.statusVerifikasiDokumen === 'terverifikasi'
                            ? 'Terverifikasi'
                            : auditor.statusVerifikasiDokumen === 'pending'
                            ? 'Menunggu Review'
                            : 'Belum Upload'}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400">{auditor.email}</p>
                      <div className="text-[11px] text-slate-500">Spesialisasi: {auditor.sektor}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: VERIFIKASI DOKUMEN LEGALITAS */}
        {activeTab === 'dokumen' && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Verifikasi Legalitas Entitas & Kredensial Auditor</h3>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Dokumen legalitas perusahaan (NIB/SIUP/NPWP/Akta) dan sertifikasi auditor (SKKNI/ACFE/KTP)
                  harus diverifikasi secara langsung oleh Administrator sebelum status terverifikasi disetujui.
                </p>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold mr-2">
                <Filter className="w-3.5 h-3.5" /> Filter Status:
              </span>
              {(['semua', 'pending', 'terverifikasi', 'ditolak'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setDocFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    docFilter === st
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {filteredDocEntities.length === 0 ? (
              <div className="py-16 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
                <FileCheck className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-sm font-medium">Tidak ada dokumen dengan status '{docFilter}'.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocEntities.map((entitas) => (
                  <div
                    key={entitas.uid}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {entitas.role === 'perusahaan' ? 'Perusahaan (PT)' : 'Auditor Independen'}
                        </span>
                        <h4 className="text-base font-bold text-white mt-1">{entitas.namaPT}</h4>
                        <p className="text-xs font-mono text-slate-400">{entitas.email}</p>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                          entitas.statusVerifikasiDokumen === 'terverifikasi'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : entitas.statusVerifikasiDokumen === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                            : entitas.statusVerifikasiDokumen === 'ditolak'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {entitas.statusVerifikasiDokumen === 'terverifikasi'
                          ? 'Terverifikasi'
                          : entitas.statusVerifikasiDokumen === 'pending'
                          ? 'Menunggu Review'
                          : entitas.statusVerifikasiDokumen === 'ditolak'
                          ? 'Ditolak'
                          : 'Belum Upload'}
                      </span>
                    </div>

                    {/* Document detail preview */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate text-slate-200">
                          {entitas.dokumenNama || 'Berkas Dokumen'}
                        </span>
                      </div>

                      {entitas.dokumenUrl ? (
                        <a
                          href={entitas.dokumenUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Buka Dokumen
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Belum ada file</span>
                      )}
                    </div>

                    {entitas.catatanVerifikasi && (
                      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">Catatan: </span>
                        {entitas.catatanVerifikasi}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      {entitas.statusVerifikasiDokumen !== 'ditolak' && (
                        <button
                          disabled={processingAction}
                          onClick={() => {
                            setRejectionTarget({
                              type: 'dokumen',
                              id: entitas.uid
                            });
                            setRejectionReason('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Tolak Dokumen
                        </button>
                      )}

                      {entitas.statusVerifikasiDokumen !== 'terverifikasi' && (
                        <button
                          disabled={processingAction}
                          onClick={() => handleApproveDocument(entitas)}
                          className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Setujui Dokumen
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VERIFIKASI DEPOSIT & PENARIKAN */}
        {activeTab === 'keuangan' && (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Verifikasi Mutasi Transaksi Keuangan</h3>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Permintaan deposit saldo aktif dan penarikan dana (withdrawal) harus diverifikasi dan disetujui oleh Administrator.
                  Setelah deposit disetujui, saldo entitas akan otomatis ditambahkan ke sistem.
                </p>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold mr-2">
                <Filter className="w-3.5 h-3.5" /> Filter Status:
              </span>
              {(['semua', 'pending', 'selesai', 'ditolak'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setTxFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    txFilter === st
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {filteredFinanceTx.length === 0 ? (
              <div className="py-16 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
                <CreditCard className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-sm font-medium">Tidak ada transaksi keuangan dengan status '{txFilter}'.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFinanceTx.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1 ${
                            tx.type === 'deposit'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {tx.type === 'deposit' ? (
                            <>
                              <ArrowDownLeft className="w-3 h-3" /> Deposit
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3" /> Penarikan
                            </>
                          )}
                        </span>

                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            tx.status === 'selesai'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : tx.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {tx.status === 'selesai'
                            ? 'Selesai / Terverifikasi'
                            : tx.status === 'pending'
                            ? 'Menunggu Review'
                            : 'Ditolak'}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-white">
                        {tx.keterangan || (tx.type === 'deposit' ? 'Permintaan Deposit' : 'Permintaan Penarikan Dana')}
                      </div>

                      {/* Bank / Method Info */}
                      <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                        {tx.method && <span>Metode: <strong className="text-slate-200">{tx.method}</strong></span>}
                        {tx.bankName && <span>Bank: <strong className="text-slate-200">{tx.bankName}</strong></span>}
                        {tx.accountNumber && (
                          <span>
                            Rekening: <strong className="text-slate-200 font-mono">{tx.accountNumber}</strong> ({tx.holderName})
                          </span>
                        )}
                      </div>

                      {tx.catatanAdmin && (
                        <p className="text-[11px] text-red-300 bg-red-950/40 border border-red-800/40 p-1.5 rounded-lg">
                          Catatan Admin: {tx.catatanAdmin}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                          Nominal
                        </span>
                        <span
                          className={`text-lg sm:text-xl font-bold font-mono ${
                            tx.type === 'deposit' ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {tx.type === 'deposit' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                        </span>
                      </div>

                      {tx.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            disabled={processingAction}
                            onClick={() => {
                              setRejectionTarget({
                                type: 'transaksi',
                                id: tx.id,
                                subId: tx.type,
                                nominal: tx.amount,
                                userId: tx.userId
                              });
                              setRejectionReason('');
                            }}
                            className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Tolak
                          </button>

                          <button
                            disabled={processingAction}
                            onClick={() => handleApproveTransaction(tx)}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            {tx.type === 'deposit' ? 'Setujui & Tambah Saldo' : 'Setujui & Konfirmasi Transfer'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: VERIFIKASI KLAIM REWARD PELAPOR */}
        {activeTab === 'reward' && (
          <div className="space-y-6">
            {/* MANDATORY NOTICE: TIDAK ADA BATASAN WAKTU UNTUK KLAIM REWARD */}
            <div className="p-5 bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 rounded-2xl border-2 border-amber-500/40 space-y-2">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">
                  Regulasi Whistleblower Reward Integritas360
                </h3>
              </div>
              <p className="text-xs text-amber-200/95 leading-relaxed">
                <strong>Ketentuan Wajib:</strong> Tidak ada batasan waktu untuk klaim reward. Pelapor yang laporannya dinyatakan valid
                dan terbukti berhak mengklaim hadiah tunai kapan saja tanpa tanggal kedaluwarsa.
                Setiap klaim reward akan diverifikasi secara teliti oleh Administrator sebelum dana ditransfer ke rekening bank pelapor.
              </p>
            </div>

            {rewardClaimTx.length === 0 ? (
              <div className="py-16 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
                <Award className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-sm font-medium">Belum ada pengajuan klaim reward dari pelapor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rewardClaimTx.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Tiket #{tx.claimReportToken || 'ANONIM'}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              tx.status === 'selesai'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : tx.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                                : 'bg-red-500/10 text-red-400 border-red-500/30'
                            }`}
                          >
                            {tx.status === 'selesai'
                              ? 'Selesai / Ditransfer'
                              : tx.status === 'pending'
                              ? 'Menunggu Review Admin'
                              : 'Ditolak'}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1.5">
                          {tx.keterangan || 'Klaim Reward Pelapor'}
                        </h4>
                        {tx.companyName && (
                          <p className="text-xs text-slate-400">
                            Entitas Terlapor: <strong className="text-slate-200">{tx.companyName}</strong>
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                          Nominal Reward
                        </span>
                        <span className="text-xl font-bold font-mono text-amber-400">
                          Rp {tx.amount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Bank Details & WhatsApp */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Rekening Pencairan:</span>
                        <p className="font-bold text-white">
                          {tx.bankName} - <span className="font-mono text-amber-400">{tx.accountNumber}</span>
                        </p>
                        <p className="text-slate-300">a.n. {tx.holderName}</p>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-0.5">Notifikasi WhatsApp:</span>
                        {tx.whatsapp ? (
                          <p className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                            <MessageCircle className="w-3.5 h-3.5" />
                            {tx.whatsapp}
                          </p>
                        ) : (
                          <p className="text-slate-500 italic">Tidak mencantumkan nomor</p>
                        )}
                      </div>
                    </div>

                    {tx.catatanAdmin && (
                      <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-800/40 text-xs text-red-300">
                        <strong>Catatan Administrator:</strong> {tx.catatanAdmin}
                      </div>
                    )}

                    {/* Actions */}
                    {tx.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          disabled={processingAction}
                          onClick={() => {
                            setRejectionTarget({
                              type: 'reward',
                              id: tx.id,
                              subId: tx.claimReportId
                            });
                            setRejectionReason('');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Tolak Klaim
                        </button>

                        <button
                          disabled={processingAction}
                          onClick={() => handleApproveClaimReward(tx)}
                          className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Setujui & Selesaikan Pencairan Reward
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* TOP UP SALDO MODAL */}
      {selectedPTForTopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                Tambah Dana Kepatuhan
              </h3>
              <button
                onClick={() => setSelectedPTForTopUp(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="text-slate-400">Target Perusahaan:</div>
              <div className="text-sm font-bold text-white">{selectedPTForTopUp.namaPT}</div>
              <div className="text-slate-400 pt-1">
                Saldo Saat Ini:{' '}
                <span className="font-mono text-emerald-400 font-bold">
                  Rp {Number(selectedPTForTopUp.danaTersedia || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {topUpSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Dana Berhasil Ditambahkan dengan increment()!
              </div>
            ) : (
              <form onSubmit={handleTopUpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nominal Penambahan Dana (Rupiah)
                  </label>
                  <input
                    type="number"
                    min={100000}
                    step={100000}
                    required
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-3 gap-2">
                  {[5000000, 10000000, 25000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmount(amt)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-colors border cursor-pointer ${
                        topUpAmount === amt
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      +{amt / 1000000} Jt
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPTForTopUp(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-confirm-topup"
                    type="submit"
                    disabled={topUpLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 cursor-pointer"
                  >
                    {topUpLoading ? 'Menyimpan...' : 'Konfirmasi Tambah Dana'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Alasan Penolakan Administrator
              </h3>
              <button
                onClick={() => setRejectionTarget(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRejectionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Berikan Catatan atau Alasan Penolakan:
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Contoh: Dokumen buram, nomor rekening tidak sesuai, atau bukti belum memenuhi syarat..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectionTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processingAction}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all disabled:opacity-60 cursor-pointer"
                >
                  {processingAction ? 'Memproses...' : 'Konfirmasi Tolak'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POSTER MODAL COMPONENT */}
      {selectedPTForPoster && (
        <PosterModal
          isOpen={isPosterModalOpen}
          onClose={() => {
            setIsPosterModalOpen(false);
            setSelectedPTForPoster(null);
          }}
          company={selectedPTForPoster}
        />
      )}
    </div>
  );
};
