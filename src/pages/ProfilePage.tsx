import React, { useEffect, useState } from 'react';
import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import {
  UserCircle,
  Building2,
  Wallet,
  Lock,
  Unlock,
  ArrowDownLeft,
  ArrowUpRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  ShieldCheck,
  Phone,
  FileText,
  BadgeCheck,
  RefreshCw,
  PlusCircle,
  Banknote,
  History,
  Upload,
  FileCheck,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { UserProfile, WalletTransaction, BankDetails } from '../types';

const SEKTOR_OPTIONS = [
  'Manufaktur & Pabrikasi',
  'Perbankan & Jasa Keuangan',
  'Pertambangan & Energi',
  'Perkebunan & Pertanian',
  'Konstruksi & Properti',
  'Transportasi & Logistik',
  'Teknologi Informasi & Digital',
  'Kesehatan & Farmasi',
  'Perhotelan & Pariwisata',
  'Pendidikan & Yayasan',
  'Pemerintahan & BUMN',
  'Konsultan & Audit Independen',
  'Lainnya',
];

const BANK_OPTIONS = ['BCA', 'Mandiri', 'BRI', 'BNI', 'BSI', 'CIMB Niaga', 'Permata', 'Danamon'];

export const ProfilePage: React.FC = () => {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const { navigate } = useNavigation();

  const [activeTab, setActiveTab] = useState<'profile' | 'keuangan' | 'riwayat'>('keuangan');
  const [profileData, setProfileData] = useState<UserProfile | null>(authProfile);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  // Form Edit Profile State
  const [namaPT, setNamaPT] = useState('');
  const [sektor, setSektor] = useState('');
  const [alamat, setAlamat] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [telepon, setTelepon] = useState('');
  const [npwp, setNpwp] = useState('');
  const [picName, setPicName] = useState('');
  const [bankName, setBankName] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [holderName, setHolderName] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Dokumen Legalitas & Verifikasi State
  const [dokumenNama, setDokumenNama] = useState('');
  const [dokumenUrl, setDokumenUrl] = useState('');
  const [statusVerifikasiDokumen, setStatusVerifikasiDokumen] = useState<'pending' | 'terverifikasi' | 'ditolak' | 'belum_upload'>('belum_upload');
  const [catatanVerifikasi, setCatatanVerifikasi] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docUploadMsg, setDocUploadMsg] = useState('');

  // Modal Keuangan States
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(5000000);
  const [depositMethod, setDepositMethod] = useState('BCA Virtual Account');
  const [processingDeposit, setProcessingDeposit] = useState(false);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(1000000);
  const [withdrawBank, setWithdrawBank] = useState('BCA');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawHolder, setWithdrawHolder] = useState('');
  const [processingWithdraw, setProcessingWithdraw] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  const [showLockModal, setShowLockModal] = useState(false);
  const [lockAmount, setLockAmount] = useState<number>(1000000);
  const [lockActionType, setLockActionType] = useState<'lock' | 'unlock'>('lock');
  const [processingLock, setProcessingLock] = useState(false);
  const [lockError, setLockError] = useState('');

  // Check login
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Realtime Profile Listener
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsub = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const d = docSnap.data();
          const p: UserProfile = {
            uid: user.uid,
            email: d.email || user.email || '',
            role: d.role || 'perusahaan',
            namaPT: d.namaPT || '',
            sektor: d.sektor || 'Manufaktur & Bisnis',
            alamat: d.alamat || '',
            deskripsi: d.deskripsi || '',
            telepon: d.telepon || '',
            npwp: d.npwp || '',
            picName: d.picName || d.email || user.email || '',
            danaTersedia: Number(d.danaTersedia || d.danaTerkunci || 0),
            saldo: Number(d.saldo || 0),
            danaTerkunci: Number(d.danaTerkunci || d.danaTersedia || 0),
            statusVerifikasiDokumen: d.statusVerifikasiDokumen || 'belum_upload',
            dokumenUrl: d.dokumenUrl || '',
            dokumenNama: d.dokumenNama || '',
            catatanVerifikasi: d.catatanVerifikasi || '',
            rekeningBank: d.rekeningBank || { bankName: 'BCA', accountNumber: '', holderName: '' },
            createdAt: d.createdAt,
          };
          setProfileData(p);
          setNamaPT(p.namaPT);
          setSektor(p.sektor);
          setAlamat(p.alamat);
          setDeskripsi(p.deskripsi);
          setTelepon(p.telepon || '');
          setNpwp(p.npwp || '');
          setPicName(p.picName || d.email || user.email || '');
          setDokumenNama(p.dokumenNama || '');
          setDokumenUrl(p.dokumenUrl || '');
          setStatusVerifikasiDokumen(p.statusVerifikasiDokumen || 'belum_upload');
          setCatatanVerifikasi(p.catatanVerifikasi || '');
          if (p.rekeningBank) {
            setBankName(p.rekeningBank.bankName || 'BCA');
            setAccountNumber(p.rekeningBank.accountNumber || '');
            setHolderName(p.rekeningBank.holderName || '');
            setWithdrawBank(p.rekeningBank.bankName || 'BCA');
            setWithdrawAccount(p.rekeningBank.accountNumber || '');
            setWithdrawHolder(p.rekeningBank.holderName || '');
          }
        }
      },
      (err) => console.error('Error listening to user profile:', err)
    );

    return () => unsub();
  }, [user]);

  // Realtime Transactions Listener
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'transactions'), where('userId', '==', user.uid));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: WalletTransaction[] = [];
        snapshot.forEach((snap) => {
          const d = snap.data();
          list.push({
            id: snap.id,
            userId: d.userId,
            type: d.type,
            amount: Number(d.amount || 0),
            status: d.status || 'selesai',
            keterangan: d.keterangan || '',
            metode: d.metode,
            bankDetails: d.bankDetails,
            createdAt: d.createdAt,
          });
        });
        // Sort descending by createdAt or local fallback
        list.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        setTransactions(list);
      },
      (err) => console.warn('Error fetching transactions:', err)
    );

    return () => unsub();
  }, [user]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSavingProfile(true);
      setProfileErrorMsg('');
      setProfileSuccessMsg('');

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        namaPT: namaPT.trim(),
        sektor: sektor.trim() || 'Lainnya',
        alamat: alamat.trim(),
        deskripsi: deskripsi.trim(),
        telepon: telepon.trim(),
        npwp: npwp.trim(),
        picName: picName.trim(),
        rekeningBank: {
          bankName,
          accountNumber: accountNumber.trim(),
          holderName: holderName.trim(),
        },
      });

      setProfileSuccessMsg('Data profil dan legalitas berhasil disimpan!');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setProfileErrorMsg(err.message || 'Gagal menyimpan perubahan profil.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Document Upload (Perusahaan / Auditor)
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingDoc(true);
      setDocUploadMsg('');

      // Convert to base64 with compression for images, or direct dataUrl
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const rawData = event.target?.result as string;
          let finalData = rawData;

          if (file.type.startsWith('image/')) {
            // Compress image to ensure fits well within document
            const img = new Image();
            img.src = rawData;
            await new Promise((res) => { img.onload = res; });
            const canvas = document.createElement('canvas');
            const maxDim = 1200;
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, w, h);
              finalData = canvas.toDataURL('image/jpeg', 0.75);
            }
          }

          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            dokumenUrl: finalData,
            dokumenNama: file.name,
            statusVerifikasiDokumen: 'pending',
            catatanVerifikasi: '',
          });

          setDokumenUrl(finalData);
          setDokumenNama(file.name);
          setStatusVerifikasiDokumen('pending');
          setDocUploadMsg('Dokumen berhasil diunggah! Dokumen akan diverifikasi oleh Administrator.');
          setTimeout(() => setDocUploadMsg(''), 5000);
        } catch (err: any) {
          console.error('Error saving document:', err);
          alert('Gagal mengunggah dokumen: ' + err.message);
        } finally {
          setUploadingDoc(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Error reading document:', err);
      setUploadingDoc(false);
    }
  };

  // Handle Deposit (Diverifikasi oleh Administrator)
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || depositAmount <= 0) return;

    try {
      setProcessingDeposit(true);

      // Catat transaksi dengan status 'pending' (akan diverifikasi oleh Administrator)
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        userName: profileData?.namaPT || user.email,
        type: 'deposit',
        amount: depositAmount,
        status: 'pending',
        keterangan: `Permintaan Deposit saldo via ${depositMethod} (Menunggu verifikasi Administrator)`,
        metode: depositMethod,
        createdAt: serverTimestamp(),
      });

      setShowDepositModal(false);
      setDepositAmount(5000000);
      alert(`Permintaan deposit Rp ${depositAmount.toLocaleString('id-ID')} berhasil diajukan! Administrator akan memverifikasi pembayaran Anda sebelum saldo aktif ditambahkan.`);
    } catch (err: any) {
      console.error('Error depositing:', err);
      alert('Gagal melakukan deposit: ' + err.message);
    } finally {
      setProcessingDeposit(false);
    }
  };

  // Handle Withdrawal (Diverifikasi oleh Administrator)
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    if (!user || withdrawAmount <= 0) return;

    const currentSaldo = profileData?.saldo || 0;
    if (withdrawAmount > currentSaldo) {
      setWithdrawError(`Saldo aktif Anda tidak mencukupi. Saldo tersedia: Rp ${currentSaldo.toLocaleString('id-ID')}`);
      return;
    }

    try {
      setProcessingWithdraw(true);
      const userRef = doc(db, 'users', user.uid);

      // Kurangi saldo aktif sementara untuk reservasi dana penarikan
      await updateDoc(userRef, {
        saldo: increment(-withdrawAmount),
      });

      // Catat transaksi dengan status 'pending' (akan diverifikasi & ditransfer Administrator)
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        userName: profileData?.namaPT || user.email,
        type: 'withdrawal',
        amount: withdrawAmount,
        status: 'pending',
        keterangan: `Penarikan dana ke rekening ${withdrawBank} ${withdrawAccount} a.n. ${withdrawHolder} (Menunggu verifikasi & transfer Administrator)`,
        bankDetails: {
          bankName: withdrawBank,
          accountNumber: withdrawAccount.trim(),
          holderName: withdrawHolder.trim(),
        },
        createdAt: serverTimestamp(),
      });

      setShowWithdrawModal(false);
      setWithdrawAmount(1000000);
      alert(`Permintaan penarikan Rp ${withdrawAmount.toLocaleString('id-ID')} berhasil diajukan! Administrator akan memverifikasi dan mentransfer dana ke rekening ${withdrawBank} Anda.`);
    } catch (err: any) {
      console.error('Error withdrawing:', err);
      setWithdrawError(err.message || 'Gagal melakukan penarikan dana.');
    } finally {
      setProcessingWithdraw(false);
    }
  };

  // Handle Lock / Unlock Dana
  const handleLockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLockError('');
    if (!user || lockAmount <= 0) return;

    const currentSaldo = profileData?.saldo || 0;
    const currentLocked = profileData?.danaTerkunci || profileData?.danaTersedia || 0;

    if (lockActionType === 'lock') {
      if (lockAmount > currentSaldo) {
        setLockError(`Saldo aktif tidak mencukupi untuk dikunci. Saldo aktif: Rp ${currentSaldo.toLocaleString('id-ID')}`);
        return;
      }
    } else {
      if (lockAmount > currentLocked) {
        setLockError(`Dana terkunci tidak mencukupi untuk dibuka. Dana terkunci saat ini: Rp ${currentLocked.toLocaleString('id-ID')}`);
        return;
      }
    }

    try {
      setProcessingLock(true);
      const userRef = doc(db, 'users', user.uid);

      if (lockActionType === 'lock') {
        // Pindahkan dari saldo aktif -> danaTerkunci & danaTersedia
        await updateDoc(userRef, {
          saldo: increment(-lockAmount),
          danaTerkunci: increment(lockAmount),
          danaTersedia: increment(lockAmount),
        });

        await addDoc(collection(db, 'transactions'), {
          userId: user.uid,
          type: 'lock',
          amount: lockAmount,
          status: 'selesai',
          keterangan: 'Kunci dana penjaminan whistleblowing (dialokasikan ke poster)',
          createdAt: serverTimestamp(),
        });
      } else {
        // Pindahkan dari danaTerkunci & danaTersedia -> saldo aktif
        await updateDoc(userRef, {
          saldo: increment(lockAmount),
          danaTerkunci: increment(-lockAmount),
          danaTersedia: increment(-lockAmount),
        });

        await addDoc(collection(db, 'transactions'), {
          userId: user.uid,
          type: 'unlock',
          amount: lockAmount,
          status: 'selesai',
          keterangan: 'Buka kunci dana penjaminan kembali ke saldo aktif',
          createdAt: serverTimestamp(),
        });
      }

      setShowLockModal(false);
      setLockAmount(1000000);
    } catch (err: any) {
      console.error('Error locking/unlocking dana:', err);
      setLockError(err.message || 'Gagal mengubah status kunci dana.');
    } finally {
      setProcessingLock(false);
    }
  };

  const currentSaldo = Number(profileData?.saldo || 0);
  const currentDanaTerkunci = Number(profileData?.danaTerkunci || profileData?.danaTersedia || 0);
  const totalAset = currentSaldo + currentDanaTerkunci;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Identity Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shrink-0 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <UserCircle className="w-9 h-9 text-amber-400" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    {profileData?.namaPT || 'Lengkapi Nama Anda'}
                  </h1>
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      profileData?.role === 'owner'
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : profileData?.role === 'perusahaan'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    Role: {profileData?.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                  <span>Sektor: <strong className="text-slate-300">{profileData?.sektor || '-'}</strong></span>
                  <span>•</span>
                  <span>PIC: <strong className="text-slate-300">{profileData?.picName || 'Belum diisi'}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Balance Status in Header */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Total Aset Integritas</p>
                <p className="text-xl sm:text-2xl font-mono font-bold text-amber-400">
                  Rp {totalAset.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Dana Terkunci</p>
                <p className="text-sm font-mono font-bold text-emerald-400">
                  Rp {currentDanaTerkunci.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs within Profile */}
          <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80 overflow-x-auto">
            <button
              onClick={() => setActiveTab('keuangan')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'keuangan'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Wallet className="w-4 h-4" />
              Dompet & Keuangan (Saldo, Deposit, Withdraw, Lock)
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              Edit Profil & Lengkapi Legalitas
            </button>

            <button
              onClick={() => setActiveTab('riwayat')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'riwayat'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              Riwayat Mutasi & Transaksi ({transactions.length})
            </button>
          </div>
        </div>

        {/* TAB 1: KEUANGAN (SALDO, DEPOSIT, WITHDRAWAL, LOCK DANA) */}
        {activeTab === 'keuangan' && (
          <div className="space-y-6">
            {/* Balance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Saldo Aktif */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Saldo Bebas (Aktif)
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Banknote className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white mb-2">
                  Rp {currentSaldo.toLocaleString('id-ID')}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Saldo yang dapat ditarik (*withdrawal*) kapan saja atau dipindahkan ke Lock Dana penjaminan.
                </p>

                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    Deposit Saldo
                  </button>
                  <button
                    onClick={() => {
                      setWithdrawError('');
                      setShowWithdrawModal(true);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                    Withdrawal
                  </button>
                </div>
              </div>

              {/* Card 2: Lock Dana (Dana Terkunci) */}
              <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Lock Dana (Dana Terkunci)
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mb-2">
                  Rp {currentDanaTerkunci.toLocaleString('id-ID')}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dana jaminan integritas whistleblowing (ISO 37002). Nominal ini otomatis tertera pada poster resmi PT.
                </p>

                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setLockActionType('lock');
                      setLockError('');
                      setShowLockModal(true);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Kunci Dana
                  </button>
                  <button
                    onClick={() => {
                      setLockActionType('unlock');
                      setLockError('');
                      setShowLockModal(true);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5 text-amber-400" />
                    Buka Kunci
                  </button>
                </div>
              </div>

              {/* Card 3: Rekening Bank Penarikan */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Rekening Penarikan
                    </span>
                    <CreditCard className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-base font-bold text-white mb-1">
                    {profileData?.rekeningBank?.bankName || 'Belum diatur'}
                  </div>
                  <div className="text-sm font-mono text-amber-400 font-semibold">
                    {profileData?.rekeningBank?.accountNumber || 'Nomor rekening kosong'}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    a.n. {profileData?.rekeningBank?.holderName || 'Pemilik rekening'}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('profile')}
                  className="mt-4 text-xs text-amber-400 hover:underline font-semibold text-left"
                >
                  Ubah data rekening pada tab Edit Profil &rarr;
                </button>
              </div>
            </div>

            {/* Information Box on Dana Kepatuhan */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                Mekanisme Penjaminan Integritas & Kepatuhan
              </div>
              <p className="text-slate-400 leading-relaxed">
                Setiap perusahaan peserta diwajibkan mengalokasikan <strong>Lock Dana</strong> sebagai wujud
                komitmen penjaminan perlindungan saksi, imbalan pelapor berintegritas, serta pembiayaan audit
                independen. Dana yang dikunci tidak dapat ditarik secara sepihak selama proses investigasi aduan
                whistleblowing sedang berlangsung.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: EDIT PROFILE & LENGKAPI PENDAFTARAN */}
        {activeTab === 'profile' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                Edit Profil Perusahaan / Entitas & Kelengkapan Data
              </h2>
              <p className="text-xs text-slate-400">
                Lengkapi identitas, penanggung jawab (PIC), dan rekening bank untuk keperluan pencetakan poster resmi dan verifikasi sistem.
              </p>
            </div>

            {profileSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {profileErrorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Bagian 1: Data Perusahaan */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  1. Informasi Perusahaan / Institusi
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nama Perusahaan / PT / Institusi *
                    </label>
                    <input
                      type="text"
                      required
                      value={namaPT}
                      onChange={(e) => setNamaPT(e.target.value)}
                      placeholder="Contoh: PT Sumber Integritas Nusantara"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Sektor Industri *
                    </label>
                    <select
                      value={sektor}
                      onChange={(e) => setSektor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {SEKTOR_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nomor Pokok Wajib Pajak (NPWP) / NIB
                    </label>
                    <input
                      type="text"
                      value={npwp}
                      onChange={(e) => setNpwp(e.target.value)}
                      placeholder="00.000.000.0-000.000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Akun (Terdaftar)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Alamat Lengkap Kantor / Pabrik *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Alamat kantor pusat, gedung, lantai, dan kota..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Deskripsi Singkat & Komitmen Kepatuhan
                  </label>
                  <textarea
                    rows={3}
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    placeholder="Jelaskan bidang usaha, jumlah karyawan, dan komitmen penegakan tata kelola perusahaan yang bersih..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Bagian 2: Kontak PIC */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  2. Kontak PIC / Pejabat Kepatuhan (Compliance Officer)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nama PIC / Pejabat Kepatuhan
                    </label>
                    <input
                      type="text"
                      value={picName}
                      onChange={(e) => setPicName(e.target.value)}
                      placeholder="Nama lengkap penanggung jawab"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nomor Telepon / WhatsApp Resmi
                    </label>
                    <input
                      type="text"
                      value={telepon}
                      onChange={(e) => setTelepon(e.target.value)}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 3: Rekening Bank Penarikan */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  3. Rekening Bank Utama (Untuk Penarikan / Withdrawal Saldo)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Bank</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {BANK_OPTIONS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Contoh: 1234567890"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nama Pemilik Rekening (Sesuai Buku Tabungan)
                    </label>
                    <input
                      type="text"
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      placeholder="Nama di rekening bank"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 4: Dokumen Legalitas & Verifikasi Administrator */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" />
                    4. Dokumen Legalitas & Verifikasi Administrator
                  </h3>
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      statusVerifikasiDokumen === 'terverifikasi'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : statusVerifikasiDokumen === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : statusVerifikasiDokumen === 'ditolak'
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {statusVerifikasiDokumen === 'terverifikasi'
                      ? 'Terverifikasi'
                      : statusVerifikasiDokumen === 'pending'
                      ? 'Menunggu Verifikasi'
                      : statusVerifikasiDokumen === 'ditolak'
                      ? 'Ditolak'
                      : 'Belum Unggah'}
                  </span>
                </div>

                <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Ketentuan Verifikasi:</strong> Dokumen perusahaan (NIB/SIUP/Akta) dan dokumen auditor (SKKNI/ACFE/KTP) akan diverifikasi secara langsung oleh Administrator INTEGRITAS360.
                  </div>
                </div>

                {/* Status Box */}
                {statusVerifikasiDokumen === 'terverifikasi' && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold text-white">Dokumen Terverifikasi oleh Administrator</p>
                      <p className="text-[11px] text-emerald-400/80">
                        Entitas Anda telah diakui sebagai entitas resmi dan tersertifikasi.
                      </p>
                    </div>
                  </div>
                )}

                {statusVerifikasiDokumen === 'pending' && (
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
                    <div>
                      <p className="font-bold text-white">Dokumen Sedang Diverifikasi oleh Administrator</p>
                      <p className="text-[11px] text-amber-400/80">
                        Administrator sedang meninjau keabsahan berkas yang Anda unggah.
                      </p>
                    </div>
                  </div>
                )}

                {statusVerifikasiDokumen === 'ditolak' && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">Dokumen Ditolak oleh Administrator</p>
                      <p className="text-[11px] text-red-300/80 mt-0.5">
                        {catatanVerifikasi || 'Dokumen buram atau tidak sesuai. Silakan unggah ulang dokumen resmi.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Upload Dokumen Input */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-200">
                        {profileData?.role === 'auditor'
                          ? 'Unggah Sertifikasi / Lisensi Auditor (IAPI / ACFE / SKKNI / KTP)'
                          : 'Unggah Berkas Legalitas Perusahaan (NIB / SIUP / NPWP / Akta)'}
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Format: JPG, PNG, atau PDF (maks. 5MB).
                      </p>
                    </div>

                    <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors border border-slate-700 shrink-0">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{uploadingDoc ? 'Mengunggah...' : 'Pilih Berkas'}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleDocumentUpload}
                        disabled={uploadingDoc}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {docUploadMsg && (
                    <p className="text-xs text-emerald-400 font-semibold">{docUploadMsg}</p>
                  )}

                  {dokumenNama && (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate">{dokumenNama}</span>
                      </div>
                      {dokumenUrl && (
                        <a
                          href={dokumenUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold text-[11px] shrink-0 ml-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Lihat Berkas
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {savingProfile ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Menyimpan Data...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Perubahan Profil
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: RIWAYAT MUTASI & TRANSAKSI */}
        {activeTab === 'riwayat' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-400" />
                  Riwayat Mutasi Saldo & Dana Kepatuhan
                </h3>
                <p className="text-xs text-slate-400">
                  Daftar transaksi deposit, penarikan, penguncian, dan pembukaan kunci saldo
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                Total: {transactions.length} Transaksi
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <History className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-sm font-medium">Belum ada riwayat transaksi.</p>
                <p className="text-xs text-slate-600">
                  Lakukan deposit atau kunci dana untuk memulai operasional whistleblowing.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {transactions.map((tx) => {
                  const isPositive = tx.type === 'deposit' || tx.type === 'unlock';
                  return (
                    <div
                      key={tx.id}
                      className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            tx.type === 'deposit'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : tx.type === 'withdrawal'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : tx.type === 'lock'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          }`}
                        >
                          {tx.type === 'deposit' && <ArrowDownLeft className="w-5 h-5" />}
                          {tx.type === 'withdrawal' && <ArrowUpRight className="w-5 h-5" />}
                          {tx.type === 'lock' && <Lock className="w-4 h-4" />}
                          {tx.type === 'unlock' && <Unlock className="w-4 h-4" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-white capitalize">
                              {tx.type === 'deposit'
                                ? 'Deposit Saldo Aktif'
                                : tx.type === 'withdrawal'
                                ? 'Penarikan Dana (Withdrawal)'
                                : tx.type === 'lock'
                                ? 'Kunci Dana (Lock Penjaminan)'
                                : 'Buka Kunci Dana (Unlock)'}
                            </span>
                            <span
                              className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                                tx.status === 'selesai'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : tx.status === 'pending'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : 'bg-red-500/10 text-red-400 border-red-500/30'
                              }`}
                            >
                              {tx.status === 'pending' && <Clock className="w-2.5 h-2.5 animate-pulse" />}
                              {tx.status === 'selesai' && <CheckCircle2 className="w-2.5 h-2.5" />}
                              {tx.status === 'pending'
                                ? 'Menunggu Verifikasi Admin'
                                : tx.status === 'selesai'
                                ? 'Selesai / Terverifikasi'
                                : 'Ditolak'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{tx.keterangan}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-sm sm:text-base font-bold font-mono ${
                            isPositive ? 'text-emerald-400' : 'text-slate-200'
                          }`}
                        >
                          {isPositive ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: DEPOSIT SALDO */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-blue-400" />
                Deposit Saldo Aktif
              </h3>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nominal Deposit (Rupiah)
                </label>
                <input
                  type="number"
                  min={500000}
                  step={500000}
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-3 gap-2">
                {[2000000, 5000000, 10000000, 25000000, 50000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-colors border cursor-pointer ${
                      depositAmount === amt
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    +{amt / 1000000} Jt
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Metode Pembayaran Deposit
                </label>
                <select
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="BCA Virtual Account">BCA Virtual Account (Otomatis)</option>
                  <option value="Mandiri Virtual Account">Mandiri Virtual Account</option>
                  <option value="BRI Virtual Account">BRI Virtual Account (BRIVA)</option>
                  <option value="BNI Virtual Account">BNI Virtual Account</option>
                  <option value="QRIS Integritas360">QRIS Dinamis (Semua E-Wallet & M-Banking)</option>
                  <option value="Transfer Manual Bank">Transfer Manual Bank Perusahaan</option>
                </select>
              </div>

              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[11px] text-amber-200/90 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verifikasi Administrator
                </div>
                <p>
                  Permintaan deposit akan diverifikasi dan disetujui oleh Administrator sebelum saldo aktif ditambahkan ke akun Anda.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processingDeposit}
                  className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60 cursor-pointer"
                >
                  {processingDeposit ? 'Memproses Deposit...' : 'Kirim Permintaan Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: WITHDRAWAL (PENARIKAN DANA) */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-amber-400" />
                Penarikan Dana (Withdrawal)
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400">Saldo Bebas Tersedia untuk Ditarik:</span>
              <div className="text-base font-bold font-mono text-white">
                Rp {currentSaldo.toLocaleString('id-ID')}
              </div>
            </div>

            {withdrawError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{withdrawError}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nominal Penarikan (Rupiah)
                </label>
                <input
                  type="number"
                  min={100000}
                  max={currentSaldo}
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bank Tujuan</label>
                  <select
                    value={withdrawBank}
                    onChange={(e) => setWithdrawBank(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {BANK_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nomor Rekening</label>
                  <input
                    type="text"
                    required
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    placeholder="Contoh: 1234567890"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Pemilik Rekening
                </label>
                <input
                  type="text"
                  required
                  value={withdrawHolder}
                  onChange={(e) => setWithdrawHolder(e.target.value)}
                  placeholder="Nama pemilik rekening bank"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[11px] text-amber-200/90 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verifikasi & Transfer Administrator
                </div>
                <p>
                  Permintaan penarikan diverifikasi oleh Administrator dan dana akan ditransfer langsung ke rekening bank Anda.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processingWithdraw || currentSaldo <= 0}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-60 cursor-pointer"
                >
                  {processingWithdraw ? 'Memproses Penarikan...' : 'Kirim Penarikan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LOCK / UNLOCK DANA */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {lockActionType === 'lock' ? (
                  <>
                    <Lock className="w-5 h-5 text-emerald-400" />
                    Kunci Dana (Lock Dana Penjaminan)
                  </>
                ) : (
                  <>
                    <Unlock className="w-5 h-5 text-amber-400" />
                    Buka Kunci Dana (Unlock Dana)
                  </>
                )}
              </h3>
              <button
                onClick={() => setShowLockModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Toggle Action */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setLockActionType('lock');
                  setLockError('');
                }}
                className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  lockActionType === 'lock'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Kunci Saldo Baru
              </button>
              <button
                type="button"
                onClick={() => {
                  setLockActionType('unlock');
                  setLockError('');
                }}
                className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  lockActionType === 'unlock'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Buka Kunci Saldo
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              {lockActionType === 'lock' ? (
                <>
                  <span className="text-slate-400">Saldo Bebas Tersedia untuk Dikunci:</span>
                  <div className="text-base font-bold font-mono text-white">
                    Rp {currentSaldo.toLocaleString('id-ID')}
                  </div>
                </>
              ) : (
                <>
                  <span className="text-slate-400">Dana Terkunci Saat Ini:</span>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    Rp {currentDanaTerkunci.toLocaleString('id-ID')}
                  </div>
                </>
              )}
            </div>

            {lockError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{lockError}</span>
              </div>
            )}

            <form onSubmit={handleLockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nominal {lockActionType === 'lock' ? 'yang Ingin Dikunci' : 'yang Ingin Dibuka'} (Rupiah)
                </label>
                <input
                  type="number"
                  min={500000}
                  max={lockActionType === 'lock' ? currentSaldo : currentDanaTerkunci}
                  step={500000}
                  required
                  value={lockAmount}
                  onChange={(e) => setLockAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                {lockActionType === 'lock'
                  ? 'Dana yang dikunci akan langsung disinkronkan ke nilai "Dana Tersedia" pada poster whistleblowing perusahaan Anda sebagai jaminan komitmen kepatuhan.'
                  : 'Membuka kunci dana akan mengembalikan saldo ke Saldo Bebas (Aktif) sehingga dapat ditarik (*withdrawal*) kapan saja.'}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLockModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processingLock}
                  className={`px-5 py-2 rounded-xl text-slate-950 text-xs font-bold transition-all shadow-lg disabled:opacity-60 cursor-pointer ${
                    lockActionType === 'lock'
                      ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
                      : 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20'
                  }`}
                >
                  {processingLock
                    ? 'Menyimpan...'
                    : lockActionType === 'lock'
                    ? 'Kunci Dana Sekarang'
                    : 'Buka Kunci Dana Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
