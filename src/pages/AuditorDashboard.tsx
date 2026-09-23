import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import {
  Eye,
  ShieldCheck,
  FileSearch,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Building2,
  Award,
  Filter,
  Image as ImageIcon,
  MessageCircle
} from 'lucide-react';
import { WhistleblowingReport } from '../types';

export const AuditorDashboard: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { navigate } = useNavigation();

  const [reports, setReports] = useState<WhistleblowingReport[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<WhistleblowingReport | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [statusInput, setStatusInput] = useState<'baru' | 'proses' | 'selesai' | 'ditolak'>('proses');
  const [savingNote, setSavingNote] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Route protection
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Realtime subscription to whistleblowing reports
  useEffect(() => {
    if (!user) return;

    const reportsRef = collection(db, 'reports');
    const unsub = onSnapshot(
      reportsRef,
      (snapshot) => {
        const list: WhistleblowingReport[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            companyId: d.companyId,
            companyName: d.companyName || 'Perusahaan Terlapor',
            judul: d.judul || 'Dugaan Pelanggaran',
            kategori: d.kategori || 'Umum',
            deskripsi: d.deskripsi || '',
            tanggalKejadian: d.tanggalKejadian,
            lokasi: d.lokasi,
            status: d.status || 'baru',
            tokenAkses: d.tokenAkses || '',
            pelaporAnonim: d.pelaporAnonim !== false,
            namaPelapor: d.namaPelapor,
            kontakPelapor: d.kontakPelapor,
            whatsappPelapor: d.whatsappPelapor,
            buktiFiles: d.buktiFiles || [],
            isContoh: Boolean(d.isContoh),
            catatanAuditor: d.catatanAuditor,
            auditorId: d.auditorId,
            auditorName: d.auditorName,
            createdAt: d.createdAt,
          });
        });
        setReports(list);
      },
      (error) => {
        console.error('Error in auditor reports snapshot:', error);
      }
    );

    return () => unsub();
  }, [user]);

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const handleOpenReview = (report: WhistleblowingReport) => {
    setSelectedReport(report);
    setNotesInput(report.catatanAuditor || '');
    setStatusInput(report.status);
    setSuccessMsg('');
  };

  const handleSaveAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport?.id) return;

    try {
      setSavingNote(true);
      const reportDoc = doc(db, 'reports', selectedReport.id);
      await updateDoc(reportDoc, {
        status: statusInput,
        catatanAuditor: notesInput.trim(),
        auditorId: user?.uid,
        auditorName: profile?.namaPT || 'Auditor Independen',
      });

      setSuccessMsg('Hasil audit & rekomendasi berhasil diperbarui secara realtime!');
      setTimeout(() => {
        setSuccessMsg('');
        setSelectedReport(null);
      }, 1500);
    } catch (err) {
      console.error('Error saving audit note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Auditor Header Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Eye className="w-3.5 h-3.5" />
                PORTAL AUDITOR INDEPENDEN & INVESTIGATOR
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {profile?.namaPT || 'Auditor Independen'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Spesialisasi: <span className="text-emerald-400 font-semibold">{profile?.sektor || 'Audit Kepatuhan'}</span> •{' '}
                Akun Terverifikasi: <span className="text-slate-300 font-mono">{user?.email}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Independensi & Lisensi Aktif</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="text-xs text-slate-400 uppercase font-semibold">Total Berkas Masuk</div>
            <div className="text-2xl font-black font-mono text-white mt-1">{reports.length}</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="text-xs text-blue-400 uppercase font-semibold">Laporan Baru</div>
            <div className="text-2xl font-black font-mono text-blue-400 mt-1">
              {reports.filter((r) => r.status === 'baru').length}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="text-xs text-amber-400 uppercase font-semibold">Dalam Investigasi</div>
            <div className="text-2xl font-black font-mono text-amber-400 mt-1">
              {reports.filter((r) => r.status === 'proses').length}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="text-xs text-emerald-400 uppercase font-semibold">Kasus Selesai</div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {reports.filter((r) => r.status === 'selesai').length}
            </div>
          </div>
        </div>

        {/* Investigation Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-950/40">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-emerald-400" />
                Daftar Berkas Whistleblowing untuk Ditelaah
              </h2>
              <p className="text-xs text-slate-400">
                Pemeriksaan bukti dugaan pelanggaran secara objektif tanpa intervensi pihak mana pun
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
              {[
                { id: 'all', label: 'Semua' },
                { id: 'baru', label: 'Baru' },
                { id: 'proses', label: 'Proses' },
                { id: 'selesai', label: 'Selesai' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filterStatus === tab.id
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-slate-700" />
              <p className="text-sm font-medium">Tidak ada laporan dengan status ini.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">{report.judul}</span>
                      {report.isContoh ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          Contoh / Simulasi
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                          Resmi PT
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {report.kategori}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-blue-400" />
                        {report.companyName}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {report.deskripsi}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span>Lokasi: {report.lokasi || 'Tidak disebutkan'}</span>
                      <span>Tanggal: {report.tanggalKejadian || 'Terkini'}</span>
                      <span className="font-mono text-amber-400/80">Tiket: {report.tokenAkses}</span>
                      {report.buktiFiles && report.buktiFiles.length > 0 && (
                        <span className="text-amber-300 flex items-center gap-1 font-semibold">
                          <ImageIcon className="w-3 h-3 text-amber-400" />
                          {report.buktiFiles.length} Bukti Terlampir
                        </span>
                      )}
                      {report.whatsappPelapor && (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <MessageCircle className="w-3 h-3 text-emerald-400" />
                          WA Notif Reward: {report.whatsappPelapor}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-bold uppercase px-3 py-1 rounded-lg border ${
                        report.status === 'baru'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : report.status === 'proses'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : report.status === 'selesai'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}
                    >
                      {report.status}
                    </span>

                    <button
                      onClick={() => handleOpenReview(report)}
                      className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Audit & Tindak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AUDIT REVIEW MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 my-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-emerald-400" />
                  Telaah & Catatan Audit Independen
                </h3>
                <p className="text-xs text-slate-400 font-mono">Tiket: {selectedReport.tokenAkses}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {/* Report Detail Preview */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Perusahaan Terlapor:</span>
                <span className="font-bold text-white">{selectedReport.companyName}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Kategori Pelanggaran:</span>
                <span className="text-amber-400 font-semibold">{selectedReport.kategori}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1 font-semibold">Judul Laporan:</span>
                <p className="text-white font-medium">{selectedReport.judul}</p>
              </div>
              <div>
                <span className="text-slate-400 block mb-1 font-semibold">Kronologi / Keterangan:</span>
                <p className="text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
                  {selectedReport.deskripsi}
                </p>
              </div>

              {/* Uploaded Evidence Gallery */}
              {selectedReport.buktiFiles && selectedReport.buktiFiles.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    Berkas Bukti / Foto Investigasi ({selectedReport.buktiFiles.length} Berkas):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    {selectedReport.buktiFiles.map((bUrl, idx) => (
                      <a
                        key={idx}
                        href={bUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative rounded-xl overflow-hidden border border-slate-700 hover:border-amber-400 bg-slate-900 block"
                      >
                        <img
                          src={bUrl}
                          alt={`Bukti ${idx + 1}`}
                          className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 text-[10px] text-center text-slate-300 font-medium">
                          Bukti #{idx + 1} (Klik Buka)
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* WhatsApp Reward Notification */}
              {selectedReport.whatsappPelapor ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">WhatsApp Notifikasi Reward:</span>
                      <span className="font-mono text-emerald-300 text-xs">{selectedReport.whatsappPelapor}</span>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${selectedReport.whatsappPelapor.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-[11px] inline-flex items-center gap-1"
                  >
                    Kirim Notif WA
                  </a>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic">
                  Pelapor tidak menyertakan nomor WhatsApp (Kerahasiaan 100% tanpa notifikasi langsung).
                </div>
              )}
            </div>

            {successMsg ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {successMsg}
              </div>
            ) : (
              <form onSubmit={handleSaveAudit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Ubah Status Investigasi
                  </label>
                  <select
                    value={statusInput}
                    onChange={(e: any) => setStatusInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="baru">Baru Diterima (Belum Ditelaah)</option>
                    <option value="proses">Dalam Proses Investigasi Bukti</option>
                    <option value="selesai">Investigasi Selesai (Rekomendasi Terbit)</option>
                    <option value="ditolak">Ditolak / Bukti Tidak Cukup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Catatan Audit & Rekomendasi Auditor Independen
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Masukkan hasil telaah fakta, klarifikasi data, atau instruksi tindak lanjut perbaikan kepatuhan..."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={savingNote}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 cursor-pointer"
                  >
                    {savingNote ? 'Menyimpan...' : 'Simpan Rekomendasi Audit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
