import React, { useEffect, useState, useRef } from 'react';
import { collection, addDoc, updateDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  ShieldCheck,
  Building2,
  Lock,
  Send,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Search,
  Eye,
  Loader2,
  FileText,
  ShieldAlert,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  MessageCircle,
  Award,
  Check,
  ExternalLink,
  Info,
  CreditCard,
  Clock,
  Banknote
} from 'lucide-react';
import { WhistleblowingReport } from '../types';

interface CompanyOption {
  uid: string;
  namaPT: string;
  sektor?: string;
  danaTersedia?: number;
}

interface EvidenceSlot {
  id: string;
  label: string;
  isMandatory: boolean;
  fileDataUrl?: string;
  fileName?: string;
  fileSize?: string;
}

interface ReportFormSectionProps {
  initialCompanyId?: string;
  isContohMode?: boolean;
  isEmbedded?: boolean;
}

// Client-side helper to compress photos for efficient Firestore persistence
const processFile = (file: File): Promise<{ dataUrl: string; size: string; name: string }> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          name: file.name
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 960;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
          const approxBytes = Math.round((dataUrl.length * 3) / 4);
          resolve({
            dataUrl,
            size: `${(approxBytes / 1024).toFixed(1)} KB`,
            name: file.name
          });
        } else {
          resolve({
            dataUrl: e.target?.result as string,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            name: file.name
          });
        }
      };
      img.onerror = () => {
        resolve({
          dataUrl: e.target?.result as string,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          name: file.name
        });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const ReportFormSection: React.FC<ReportFormSectionProps> = ({
  initialCompanyId,
  isContohMode = false,
  isEmbedded = false
}) => {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(initialCompanyId || '');
  const [manualCompanyName, setManualCompanyName] = useState<string>('');
  const [targetCompanyData, setTargetCompanyData] = useState<CompanyOption | null>(null);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(true);

  const [mode, setMode] = useState<'lapor' | 'tracking'>('lapor');

  // Form State
  const [kategori, setKategori] = useState('Korupsi & Penyuapan');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [tanggalKejadian, setTanggalKejadian] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [pelaporAnonim, setPelaporAnonim] = useState(true);
  const [namaPelapor, setNamaPelapor] = useState('');
  const [kontakPelapor, setKontakPelapor] = useState('');

  // WhatsApp Notification (Optional for Reward claim)
  const [whatsappPelapor, setWhatsappPelapor] = useState('');

  // Mandatory 2 evidences + optional extra evidences
  const [evidences, setEvidences] = useState<EvidenceSlot[]>([
    { id: 'bukti-1', label: 'Bukti / Foto 1 (Wajib)', isMandatory: true },
    { id: 'bukti-2', label: 'Bukti / Foto 2 (Wajib)', isMandatory: true }
  ]);
  const [uploadingSlotId, setUploadingSlotId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittedToken, setSubmittedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Tracking State
  const [trackTokenInput, setTrackTokenInput] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackedReport, setTrackedReport] = useState<WhistleblowingReport | null>(null);
  const [trackingError, setTrackingError] = useState('');

  // Claim Reward State
  const [claimBank, setClaimBank] = useState('BCA');
  const [claimAccount, setClaimAccount] = useState('');
  const [claimHolder, setClaimHolder] = useState('');
  const [claimWhatsapp, setClaimWhatsapp] = useState('');
  const [claimingReward, setClaimingReward] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');
  const [claimError, setClaimError] = useState('');

  // Fetch registered companies or targeted company
  useEffect(() => {
    async function loadCompanies() {
      try {
        setLoadingCompanies(true);
        if (initialCompanyId) {
          const snap = await getDoc(doc(db, 'users', initialCompanyId));
          if (snap.exists()) {
            const data = snap.data();
            const co: CompanyOption = {
              uid: snap.id,
              namaPT: data.namaPT || 'Perusahaan Terkait',
              sektor: data.sektor || 'Kepatuhan & Integritas',
              danaTersedia: data.danaTersedia || 0
            };
            setCompanies([co]);
            setSelectedCompanyId(co.uid);
            setTargetCompanyData(co);
            setLoadingCompanies(false);
            return;
          }
        }

        const q = query(collection(db, 'users'), where('role', '==', 'perusahaan'));
        const snap = await getDocs(q);
        const list: CompanyOption[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            uid: d.id,
            namaPT: data.namaPT || 'PT Tanpa Nama',
            sektor: data.sektor || 'Umum',
            danaTersedia: data.danaTersedia || 0
          });
        });
        setCompanies(list);
        if (list.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(list[0].uid);
          setTargetCompanyData(list[0]);
        }
      } catch (err) {
        console.error('Error loading companies for report form:', err);
      } finally {
        setLoadingCompanies(false);
      }
    }

    loadCompanies();
  }, [initialCompanyId]);

  const handleCompanyChange = (uid: string) => {
    setSelectedCompanyId(uid);
    const found = companies.find((c) => c.uid === uid);
    setTargetCompanyData(found || null);
  };

  const getResolvedCompanyName = () => {
    if (selectedCompanyId === 'manual' || selectedCompanyId === '') {
      return manualCompanyName.trim() || 'Umum / Instansi Terkait';
    }
    const found = companies.find((c) => c.uid === selectedCompanyId);
    return found ? found.namaPT : manualCompanyName.trim() || 'Perusahaan Terkait';
  };

  // Add extra evidence slot
  const handleAddExtraEvidence = () => {
    const extraCount = evidences.filter((e) => !e.isMandatory).length + 1;
    const newSlot: EvidenceSlot = {
      id: `bukti-extra-${Date.now()}`,
      label: `Bukti Tambahan ${extraCount} (Opsional)`,
      isMandatory: false
    };
    setEvidences([...evidences, newSlot]);
  };

  // Remove extra evidence slot
  const handleRemoveEvidence = (id: string) => {
    setEvidences(evidences.filter((e) => e.id !== id));
  };

  // File upload handler per slot
  const handleFileChange = async (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      setUploadingSlotId(slotId);
      setSubmitError('');
      const processed = await processFile(file);
      setEvidences((prev) =>
        prev.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                fileDataUrl: processed.dataUrl,
                fileName: processed.name,
                fileSize: processed.size
              }
            : slot
        )
      );
    } catch (err) {
      console.error('Error processing file:', err);
      setSubmitError('Gagal memproses file. Silakan coba gunakan file gambar atau dokumen lain.');
    } finally {
      setUploadingSlotId(null);
    }
  };

  // Clear file in slot
  const handleClearFile = (slotId: string) => {
    setEvidences((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              fileDataUrl: undefined,
              fileName: undefined,
              fileSize: undefined
            }
          : slot
      )
    );
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!judul.trim() || !deskripsi.trim()) {
      setSubmitError('Harap lengkapi judul aduan dan uraian kronologis secara rinci.');
      return;
    }

    // MANDATORY 2 EVIDENCE CHECK
    const bukti1 = evidences[0]?.fileDataUrl;
    const bukti2 = evidences[1]?.fileDataUrl;

    if (!bukti1 || !bukti2) {
      setSubmitError('Wajib mengunggah minimal 2 bukti/foto pelanggaran (Bukti 1 dan Bukti 2) sebelum dapat mengirim laporan.');
      return;
    }

    // Collect all valid evidence data URLs
    const buktiFiles = evidences
      .filter((slot) => Boolean(slot.fileDataUrl))
      .map((slot) => slot.fileDataUrl as string);

    try {
      setSubmitting(true);
      const secretToken = `WB-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const targetCompany = getResolvedCompanyName();

      await addDoc(collection(db, 'reports'), {
        companyId: selectedCompanyId || 'general',
        companyName: targetCompany,
        judul: judul.trim(),
        kategori,
        deskripsi: deskripsi.trim(),
        tanggalKejadian: tanggalKejadian || null,
        lokasi: lokasi.trim() || null,
        pelaporAnonim,
        namaPelapor: pelaporAnonim ? null : namaPelapor.trim() || null,
        kontakPelapor: pelaporAnonim ? null : kontakPelapor.trim() || null,
        whatsappPelapor: whatsappPelapor.trim() || null,
        buktiFiles,
        isContoh: Boolean(isContohMode),
        status: 'baru',
        tokenAkses: secretToken,
        createdAt: serverTimestamp(),
      });

      setSubmittedToken(secretToken);
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setSubmitError('Terjadi kendala saat mengirim laporan. Silakan coba kembali.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTokenInput.trim()) return;

    try {
      setTrackingLoading(true);
      setTrackingError('');
      setTrackedReport(null);

      const q = query(
        collection(db, 'reports'),
        where('tokenAkses', '==', trackTokenInput.trim().toUpperCase())
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setTrackingError('Nomor tiket tidak ditemukan. Pastikan format token sudah benar.');
      } else {
        const d = snap.docs[0].data();
        setTrackedReport({
          id: snap.docs[0].id,
          companyId: d.companyId,
          companyName: d.companyName,
          judul: d.judul,
          kategori: d.kategori,
          deskripsi: d.deskripsi,
          tanggalKejadian: d.tanggalKejadian,
          lokasi: d.lokasi,
          status: d.status || 'baru',
          tokenAkses: d.tokenAkses,
          pelaporAnonim: d.pelaporAnonim !== false,
          catatanAuditor: d.catatanAuditor,
          auditorName: d.auditorName,
          buktiFiles: d.buktiFiles || [],
          whatsappPelapor: d.whatsappPelapor,
          isContoh: d.isContoh || false,
          rewardAmount: d.rewardAmount || 10000000,
          rewardClaimStatus: d.rewardClaimStatus,
          rewardClaimBank: d.rewardClaimBank
        });
        if (d.whatsappPelapor) {
          setClaimWhatsapp(d.whatsappPelapor);
        }
        setClaimSuccess('');
        setClaimError('');
      }
    } catch (err) {
      console.error('Error tracking report:', err);
      setTrackingError('Gagal memverifikasi tiket laporan.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleClaimRewardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackedReport || !claimAccount.trim() || !claimHolder.trim()) {
      setClaimError('Harap lengkapi nomor rekening dan nama pemilik rekening bank.');
      return;
    }

    try {
      setClaimingReward(true);
      setClaimError('');
      const rewardNominal = trackedReport.rewardAmount || 10000000;

      // 1. Simpan ke koleksi transactions dengan status pending untuk diverifikasi administrator
      await addDoc(collection(db, 'transactions'), {
        type: 'claim_reward',
        amount: rewardNominal,
        status: 'pending',
        claimReportToken: trackedReport.tokenAkses,
        claimReportId: trackedReport.id || '',
        companyName: trackedReport.companyName || 'Perusahaan Terlapor',
        keterangan: `Klaim reward pelapor untuk tiket #${trackedReport.tokenAkses} (${trackedReport.companyName || 'PT Terlapor'})`,
        whatsapp: claimWhatsapp.trim() || trackedReport.whatsappPelapor || '',
        bankDetails: {
          bankName: claimBank,
          accountNumber: claimAccount.trim(),
          holderName: claimHolder.trim()
        },
        createdAt: serverTimestamp()
      });

      // 2. Perbarui status klaim pada dokumen laporan
      if (trackedReport.id) {
        const reportRef = doc(db, 'reports', trackedReport.id);
        await updateDoc(reportRef, {
          rewardClaimStatus: 'pending',
          rewardClaimBank: {
            bankName: claimBank,
            accountNumber: claimAccount.trim(),
            holderName: claimHolder.trim()
          },
          whatsappPelapor: claimWhatsapp.trim() || trackedReport.whatsappPelapor || ''
        });
      }

      setTrackedReport((prev) =>
        prev
          ? {
              ...prev,
              rewardClaimStatus: 'pending',
              rewardClaimBank: {
                bankName: claimBank,
                accountNumber: claimAccount.trim(),
                holderName: claimHolder.trim()
              }
            }
          : null
      );

      setClaimSuccess(
        'Permintaan klaim reward berhasil dikirim! Dokumen dan nomor rekening akan diverifikasi oleh Administrator INTEGRITAS360 sebelum pencairan dana ditransfer.'
      );
    } catch (err: any) {
      console.error('Error submitting claim reward:', err);
      setClaimError('Gagal mengajukan klaim reward: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setClaimingReward(false);
    }
  };

  return (
    <div id="form-pelaporan-section" className="w-full max-w-4xl mx-auto space-y-6">
      {/* DIFFERENTIATE: EXAMPLE/SIMULATION MODE vs OFFICIAL GENERATED COMPANY PORTAL */}
      {isContohMode ? (
        /* CONTOH / SIMULASI MODE (HALAMAN UTAMA) */
        <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 p-5 sm:p-6 shadow-xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              MODE CONTOH / SIMULASI SISTEM (DEMO PRATINJAU)
            </div>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              Formulir Pratinjau Interaktif
            </span>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Contoh Formulir Pelaporan Anonim
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1">
              Formulir di bawah ini adalah <strong className="text-amber-400">contoh simulasi alur whistleblowing</strong> untuk
              menguji fitur pelaporan anonim, unggah minimal 2 bukti, input WhatsApp notifikasi reward, dan pengecekan tiket.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-amber-300">Perbedaan dengan Hasil Generate Perusahaan:</span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Untuk pelaporan <strong className="text-white">resmi berhadiah tunai</strong> yang terikat langsung ke PT tertentu,
                pelapor memindai <strong className="text-amber-400">QR Code dari poster resmi</strong> perusahaan (atau akses tautan resmi
                khusus PT seperti <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded font-mono">/lapor/[ID_PERUSAHAAN]</code>).
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* OFFICIAL VERIFIED COMPANY PORTAL (HASIL GENERATE / SCAN QR PERUSAHAAN) */
        <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 p-6 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              PORTAL RESMI PELAPORAN INTEGRITAS (TERIKAT DANA REWARD)
            </div>
            <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/40">
              Audit Independen Terverifikasi
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-8 space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Perusahaan Resmi Terlapor:
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {targetCompanyData ? targetCompanyData.namaPT : getResolvedCompanyName()}
              </h3>
              <p className="text-xs text-slate-300">
                Sektor Industri: <span className="text-white font-medium">{targetCompanyData?.sektor || 'Kepatuhan & Tata Kelola'}</span>
              </p>
            </div>

            <div className="md:col-span-4 p-4 rounded-xl bg-slate-950/90 border border-emerald-500/40 text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                TOTAL REWARD TERSEDIA
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-emerald-400">
                Rp {(targetCompanyData?.danaTersedia || 50000000).toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-emerald-300/80 block">
                Dijamin Rekening Penjaminan
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mode Switcher */}
      <div className="max-w-md mx-auto grid grid-cols-2 gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setMode('lapor')}
          className={`py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'lapor'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          {isContohMode ? 'Contoh Form Laporan' : 'Kirim Laporan Resmi'}
        </button>
        <button
          type="button"
          onClick={() => setMode('tracking')}
          className={`py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'tracking'
              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Pantau Status Tiket
        </button>
      </div>

      {mode === 'lapor' ? (
        submittedToken ? (
          /* Success Screen */
          <div className="bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {isContohMode ? 'Contoh Laporan Simulasi Berhasil Terkirim!' : 'Laporan Resmi Whistleblowing Berhasil Dikirim!'}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Laporan Anda lengkap dengan bukti-bukti terenkripsi telah masuk ke antrean telaah Tim Auditor Independen.
              </p>
            </div>

            {/* Secret Token Box */}
            <div className="max-w-md mx-auto p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Nomor Tiket Rahasia Anda (Simpan Baik-Baik):
              </span>
              <div className="text-2xl font-mono font-black text-amber-400 select-all tracking-wider">
                {submittedToken}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(submittedToken);
                  setCopiedToken(true);
                  setTimeout(() => setCopiedToken(false), 2000);
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                {copiedToken ? 'Tiket Disalin!' : 'Salin Nomor Tiket'}
              </button>
            </div>

            {whatsappPelapor && (
              <div className="max-w-md mx-auto p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-left text-xs text-emerald-300 flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Nomor WhatsApp <strong className="text-white">{whatsappPelapor}</strong> tercatat. Sistem akan mengirim notifikasi saat reward siap dicairkan.
                </span>
              </div>
            )}

            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Simpan nomor tiket di atas. Anda dapat menggunakan nomor tiket tersebut pada tombol &quot;Pantau Status Tiket&quot; untuk melihat
              tindak lanjut serta rekomendasi auditor tanpa perlu membuka identitas Anda.
            </p>

            <button
              type="button"
              onClick={() => {
                setSubmittedToken(null);
                setJudul('');
                setDeskripsi('');
                setTanggalKejadian('');
                setLokasi('');
                setWhatsappPelapor('');
                setEvidences([
                  { id: 'bukti-1', label: 'Bukti / Foto 1 (Wajib)', isMandatory: true },
                  { id: 'bukti-2', label: 'Bukti / Foto 2 (Wajib)', isMandatory: true }
                ]);
              }}
              className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
            >
              + Buat Laporan Tambahan Lain
            </button>
          </div>
        ) : (
          /* Submission Form */
          <form
            onSubmit={handleSubmitReport}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl"
          >
            {submitError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Target Perusahaan */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-200">
                  Perusahaan / Instansi Terkait Yang Dilaporkan *
                </label>
                {isContohMode && (
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Contoh Simulasi
                  </span>
                )}
              </div>

              {initialCompanyId && targetCompanyData ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">{targetCompanyData.namaPT}</div>
                      <div className="text-[11px] text-slate-400">{targetCompanyData.sektor || 'Industri'}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded">
                    Terverifikasi
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                  >
                    {loadingCompanies ? (
                      <option value="">Memuat daftar perusahaan...</option>
                    ) : (
                      <>
                        {companies.map((c) => (
                          <option key={c.uid} value={c.uid}>
                            {c.namaPT} ({c.sektor || 'Industri'})
                          </option>
                        ))}
                        <option value="manual">-- Tulis Nama Perusahaan / Instansi Lainnya --</option>
                      </>
                    )}
                  </select>

                  {selectedCompanyId === 'manual' && (
                    <input
                      type="text"
                      required
                      placeholder="Ketik nama PT atau instansi yang dilaporkan..."
                      value={manualCompanyName}
                      onChange={(e) => setManualCompanyName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Kategori Pelanggaran */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kategori Pelanggaran *
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="Korupsi & Penyuapan">Korupsi & Penyuapan (Bribery)</option>
                <option value="Kecurangan Finansial & Fraud">Kecurangan Finansial & Fraud</option>
                <option value="Pelecehan & Intimidasi">Pelecehan, Diskriminasi & Intimidasi</option>
                <option value="Pencurian & Penggelapan Aset">Pencurian & Penggelapan Aset</option>
                <option value="Pelanggaran K3 & Lingkungan">Pelanggaran K3 & Keselamatan Kerja</option>
                <option value="Benturan Kepentingan & Gratifikasi">Benturan Kepentingan & Gratifikasi</option>
                <option value="Penyalahgunaan Wewenang Jabatan">Penyalahgunaan Wewenang Jabatan</option>
                <option value="Pelanggaran Kode Etik Lainnya">Pelanggaran Kode Etik Lainnya</option>
              </select>
            </div>

            {/* Judul */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Judul Ringkas Aduan *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Dugaan manipulasi faktur pengadaan material di gudang logistik"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Tanggal & Lokasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tanggal Kejadian
                </label>
                <input
                  type="date"
                  value={tanggalKejadian}
                  onChange={(e) => setTanggalKejadian(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Lokasi / Divisi Terkait
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Gudang B, Divisi Keuangan, atau Kantor Cabang"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Deskripsi Kronologis */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Uraian Kronologis & Modus Pelanggaran *
              </label>
              <textarea
                rows={5}
                required
                placeholder="Jelaskan secara objektif siapa yang terlibat, bagaimana modus dugaan pelanggaran dilakukan, estimasi kerugian, serta bukti apa yang dapat diverifikasi oleh tim auditor..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
              />
            </div>

            {/* SECTION: WAJIB UPLOAD 2 BUKTI/FOTO + BUKTI TAMBAHAN */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Upload Bukti / Foto Pendukung</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                      Wajib Minimal 2 Bukti *
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Unggah minimal 2 foto/dokumen (tangkapan layar, nota, rekaman dokumen, foto fisik) sebagai bukti awal investigasi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddExtraEvidence}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  + Tambah Bukti Tambahan
                </button>
              </div>

              {/* Grid of Evidence Uploaders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {evidences.map((slot, index) => {
                  const isUploaded = Boolean(slot.fileDataUrl);
                  const isUploading = uploadingSlotId === slot.id;

                  return (
                    <div
                      key={slot.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isUploaded
                          ? 'bg-slate-900 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                          : slot.isMandatory
                          ? 'bg-slate-900/60 border-amber-500/40'
                          : 'bg-slate-900/40 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                          {slot.label}
                        </span>
                        <div className="flex items-center gap-2">
                          {isUploaded ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                              <Check className="w-3 h-3" />
                              Terunggah
                            </span>
                          ) : slot.isMandatory ? (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                              Wajib *
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemoveEvidence(slot.id)}
                              className="text-slate-500 hover:text-red-400 p-0.5"
                              title="Hapus slot bukti ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {isUploaded ? (
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-lg border border-slate-800">
                            <img
                              src={slot.fileDataUrl}
                              alt={slot.fileName || 'Pratinjau Bukti'}
                              className="w-12 h-12 object-cover rounded-md border border-slate-700 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-white truncate">
                                {slot.fileName || 'Foto Bukti'}
                              </div>
                              <div className="text-[10px] text-slate-400">{slot.fileSize || 'Ukuran Optimal'}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleClearFile(slot.id)}
                              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                              title="Ganti / Hapus Bukti"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="border border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-950/60 group">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileChange(slot.id, e)}
                            className="hidden"
                          />
                          {isUploading ? (
                            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold py-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Mengompresi file...
                            </div>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors mb-1.5" />
                              <span className="text-xs font-semibold text-slate-300 group-hover:text-white">
                                Klik untuk unggah foto / dokumen
                              </span>
                              <span className="text-[10px] text-slate-500 mt-0.5">
                                JPG, PNG, WEBP, atau PDF
                              </span>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION: NOMOR WHATSAPP (OPTIONAL UNTUK NOTIFIKASI REWARD) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-slate-950 to-slate-950 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-emerald-300 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  Nomor WhatsApp (Opsional — Notifikasi Pencairan Reward)
                </label>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Opsional
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Contoh: 08123456789 atau 628123456789"
                  value={whatsappPelapor}
                  onChange={(e) => setWhatsappPelapor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Nomor WhatsApp ini <strong className="text-emerald-300">bersifat opsional</strong>. Masukkan jika Anda ingin menerima notifikasi otomatis
                ketika laporan telah divalidasi oleh auditor dan reward tunai siap untuk dicairkan / diambil. Identitas pelapor tetap dijamin anonim dan nomor
                tidak akan pernah dibagikan kepada pihak yang dilaporkan.
              </p>
            </div>

            {/* Anonymity Switch */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pelaporAnonim}
                  onChange={(e) => setPelaporAnonim(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 bg-slate-900"
                />
                <span className="text-xs font-bold text-emerald-400">
                  Kirim sebagai Pelapor Anonim (100% Rahasia - Rekomendasi)
                </span>
              </label>
              <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
                Nama, email, nomor HP, IP address, dan identitas perangkat Anda tidak akan pernah direkam atau
                dibagikan kepada siapa pun.
              </p>

              {!pelaporAnonim && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nama (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Nama Anda"
                      value={namaPelapor}
                      onChange={(e) => setNamaPelapor(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Kontak Rahasia Lainnya (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Email rahasia"
                      value={kontakPelapor}
                      onChange={(e) => setKontakPelapor(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer ${
                isContohMode
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20'
                  : 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white shadow-red-600/20'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-current" />
                  Mengirim Berkas Terenkripsi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-current" />
                  {isContohMode ? 'Kirim Contoh Laporan (Mode Simulasi)' : 'Kirim Laporan Whistleblowing Resmi'}
                </>
              )}
            </button>
          </form>
        )
      ) : (
        /* Tracking Screen */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
          <form onSubmit={handleTrackReport} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Masukkan Nomor Tiket Rahasia Anda
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Contoh: WB-8A7F2D-812"
                value={trackTokenInput}
                onChange={(e) => setTrackTokenInput(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-amber-400 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={trackingLoading}
                className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {trackingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Cek Status
              </button>
            </div>
          </form>

          {trackingError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{trackingError}</span>
            </div>
          )}

          {trackedReport && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{trackedReport.judul}</span>
                    {trackedReport.isContoh && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-semibold">
                        Mode Simulasi
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 text-[11px] block">
                    Perusahaan Terkait:{' '}
                    <strong className="text-white">{trackedReport.companyName}</strong>
                  </span>
                </div>
                <span
                  className={`font-bold uppercase px-2.5 py-0.5 rounded-full text-[10px] border shrink-0 ${
                    trackedReport.status === 'baru'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : trackedReport.status === 'proses'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : trackedReport.status === 'selesai'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}
                >
                  Status: {trackedReport.status}
                </span>
              </div>

              {/* Bukti-Bukti Terunggah */}
              {trackedReport.buktiFiles && trackedReport.buktiFiles.length > 0 && (
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    Bukti-Bukti Yang Dilampirkan ({trackedReport.buktiFiles.length} Berkas):
                  </span>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {trackedReport.buktiFiles.map((bUrl, idx) => (
                      <a
                        key={idx}
                        href={bUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative rounded-lg overflow-hidden border border-slate-700 hover:border-amber-400 block"
                      >
                        <img
                          src={bUrl}
                          alt={`Bukti ${idx + 1}`}
                          className="w-16 h-16 object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] text-center text-slate-300 py-0.5">
                          Bukti {idx + 1}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Notif WhatsApp Status */}
              {trackedReport.whatsappPelapor && (
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 flex items-center gap-2 text-[11px]">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Notifikasi WhatsApp Aktif: <strong>{trackedReport.whatsappPelapor}</strong></span>
                </div>
              )}

              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 whitespace-pre-wrap leading-relaxed">
                {trackedReport.deskripsi}
              </div>

              {trackedReport.catatanAuditor ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 space-y-1.5">
                  <div className="font-bold text-emerald-200 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    Tanggapan & Rekomendasi Tim Auditor Independen:
                  </div>
                  <p className="leading-relaxed text-[11px]">{trackedReport.catatanAuditor}</p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">
                  Laporan sedang dalam tahap penelaahan fakta dan verifikasi awal oleh tim auditor independen.
                </p>
              )}

              {/* KLAIM REWARD JIKA STATUS LAPORAN = SELESAI / TERBUKTI */}
              {trackedReport.status === 'selesai' && (
                <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 p-5 sm:p-6 shadow-2xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                          Hak Pencairan Reward Tunai Pelapor
                        </h4>
                        <p className="text-[11px] text-amber-300/90 font-medium">
                          Laporan dinyatakan terbukti valid oleh auditor independen.
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                        Nominal Reward
                      </span>
                      <span className="text-base sm:text-lg font-mono font-bold text-amber-400">
                        Rp {(trackedReport.rewardAmount || 10000000).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* KETENTUAN UTAMA: TIDAK ADA BATASAN WAKTU & VERIFIKASI ADMINISTRATOR */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 flex items-start gap-2">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Tidak Ada Batasan Waktu:</strong> Anda berhak mengklaim reward ini kapan saja tanpa batas kedaluwarsa.
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Verifikasi Administrator:</strong> Permintaan klaim reward dan nomor rekening akan diverifikasi oleh Administrator sebelum dana ditransfer.
                      </div>
                    </div>
                  </div>

                  {/* Status Klaim Saat Ini */}
                  {trackedReport.rewardClaimStatus === 'selesai' && (
                    <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-bold text-white">Reward Telah Dicairkan & Ditransfer!</p>
                        <p className="text-[11px] text-emerald-400/80 mt-0.5">
                          Administrator telah memverifikasi dan mentransfer dana reward ke rekening Anda.
                        </p>
                      </div>
                    </div>
                  )}

                  {trackedReport.rewardClaimStatus === 'pending' && (
                    <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
                      <div>
                        <p className="font-bold text-white">Klaim Reward Sedang Diverifikasi oleh Administrator</p>
                        <p className="text-[11px] text-amber-300/80 mt-0.5">
                          Administrator sedang meninjau permintaan pencairan reward Anda. Dana akan segera ditransfer ke rekening bank tujuan.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Formulir Pengajuan Klaim Reward jika belum diklaim */}
                  {!trackedReport.rewardClaimStatus && (
                    <form onSubmit={handleClaimRewardSubmit} className="space-y-3.5 pt-2 border-t border-slate-800">
                      {claimSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{claimSuccess}</span>
                        </div>
                      )}

                      {claimError && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          <span>{claimError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Bank Tujuan
                          </label>
                          <select
                            value={claimBank}
                            onChange={(e) => setClaimBank(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          >
                            <option value="BCA">BCA (Bank Central Asia)</option>
                            <option value="Mandiri">Bank Mandiri</option>
                            <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                            <option value="BNI">BNI (Bank Negara Indonesia)</option>
                            <option value="CIMB Niaga">CIMB Niaga</option>
                            <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                            <option value="Permata">Bank Permata</option>
                            <option value="Danamon">Bank Danamon</option>
                            <option value="GoPay">GoPay (E-Wallet)</option>
                            <option value="OVO">OVO (E-Wallet)</option>
                            <option value="DANA">DANA (E-Wallet)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Nomor Rekening / No. HP E-Wallet
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: 1234567890"
                            value={claimAccount}
                            onChange={(e) => setClaimAccount(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Nama Pemilik Rekening
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Sesuai buku rekening"
                            value={claimHolder}
                            onChange={(e) => setClaimHolder(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Nomor WhatsApp Konfirmasi (Opsional)
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: 08123456789 (untuk notifikasi pengiriman dana)"
                          value={claimWhatsapp}
                          onChange={(e) => setClaimWhatsapp(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={claimingReward}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                        >
                          {claimingReward ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Mengirim Permintaan...
                            </>
                          ) : (
                            <>
                              <Banknote className="w-4 h-4" />
                              Ajukan Klaim Reward Tunai
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
