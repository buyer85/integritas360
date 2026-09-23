import React, { useState } from 'react';
import {
  Building2,
  Search,
  Lock,
  Unlock,
  PlusCircle,
  Download,
  Edit,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Coins,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../../types';

interface AdminPerusahaanTableProps {
  perusahaanList: UserProfile[];
  onOpenLockModal: (pt: UserProfile, action: 'lock' | 'unlock') => void;
  onOpenEditSaldoModal: (pt: UserProfile) => void;
  onOpenEditProfileModal: (pt: UserProfile) => void;
  onOpenPosterModal: (pt: UserProfile) => void;
  onDeleteUser: (pt: UserProfile) => void;
}

export const AdminPerusahaanTable: React.FC<AdminPerusahaanTableProps> = ({
  perusahaanList,
  onOpenLockModal,
  onOpenEditSaldoModal,
  onOpenEditProfileModal,
  onOpenPosterModal,
  onDeleteUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLockStatus, setFilterLockStatus] = useState<'semua' | 'terkunci' | 'terbuka'>('semua');

  const filteredList = perusahaanList.filter((pt) => {
    const isLocked = Boolean(pt.isLocked || (Number(pt.danaTerkunci || 0) > 0 && !pt.danaTersedia));

    if (filterLockStatus === 'terkunci' && !isLocked) return false;
    if (filterLockStatus === 'terbuka' && isLocked) return false;

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      pt.namaPT?.toLowerCase().includes(term) ||
      pt.email?.toLowerCase().includes(term) ||
      pt.sektor?.toLowerCase().includes(term) ||
      pt.picName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4">
      {/* Header & Search */}
      <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-950/40">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            Manajemen Perusahaan & Saldo (Lock / Terbuka)
          </h2>
          <p className="text-xs text-slate-400">
            Kelola saldo terbuka, saldo terkunci jaminan, hak akses, dan legalitas seluruh perusahaan ({perusahaanList.length} PT)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Status Lock */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterLockStatus('semua')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                filterLockStatus === 'semua'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua PT
            </button>
            <button
              onClick={() => setFilterLockStatus('terbuka')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                filterLockStatus === 'terbuka'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <Unlock className="w-3 h-3" /> Terbuka
            </button>
            <button
              onClick={() => setFilterLockStatus('terkunci')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                filterLockStatus === 'terkunci'
                  ? 'bg-red-500 text-white font-bold'
                  : 'text-red-400 hover:text-red-300'
              }`}
            >
              <Lock className="w-3 h-3" /> Terkunci
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama PT, email, sektor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {filteredList.length === 0 ? (
        <div className="py-16 text-center text-slate-500 space-y-3">
          <Building2 className="w-12 h-12 mx-auto text-slate-700" />
          <p className="text-sm font-medium">Tidak ada data perusahaan yang cocok dengan kriteria filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Perusahaan & Kontak</th>
                <th className="px-4 py-3.5">Status Saldo</th>
                <th className="px-4 py-3.5">Saldo Terbuka (Tersedia)</th>
                <th className="px-4 py-3.5">Saldo Terkunci (Lock)</th>
                <th className="px-4 py-3.5">Legalitas</th>
                <th className="px-5 py-3.5 text-right">Aksi Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredList.map((pt) => {
                const isLocked = Boolean(pt.isLocked || (Number(pt.danaTerkunci || 0) > 0 && !pt.danaTersedia));
                const danaTerbuka = Number(pt.danaTersedia || 0);
                const danaTerkunci = Number(pt.danaTerkunci || 0);

                return (
                  <tr key={pt.uid} className="hover:bg-slate-800/40 transition-colors">
                    {/* Perusahaan info */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-white text-sm">{pt.namaPT}</div>
                      <div className="text-[11px] text-slate-400">{pt.email}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="text-amber-400 font-medium">{pt.sektor}</span>
                        {pt.telepon && <span>• {pt.telepon}</span>}
                      </div>
                    </td>

                    {/* Status Lock/Terbuka */}
                    <td className="px-4 py-4">
                      {isLocked ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 text-[11px] font-bold">
                            <Lock className="w-3 h-3 text-red-400" />
                            TERKUNCI (LOCKED)
                          </span>
                          {pt.lockReason && (
                            <p className="text-[10px] text-red-300/80 italic max-w-xs truncate" title={pt.lockReason}>
                              {pt.lockReason}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold">
                          <Unlock className="w-3 h-3 text-emerald-400" />
                          TERBUKA (AKTIF)
                        </span>
                      )}
                    </td>

                    {/* Saldo Terbuka */}
                    <td className="px-4 py-4">
                      <span className="font-mono font-bold text-emerald-400 text-sm bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-lg inline-block">
                        Rp {danaTerbuka.toLocaleString('id-ID')}
                      </span>
                    </td>

                    {/* Saldo Terkunci */}
                    <td className="px-4 py-4">
                      <span className="font-mono font-bold text-red-400 text-sm bg-red-950/40 border border-red-800/40 px-2.5 py-1 rounded-lg inline-block">
                        Rp {danaTerkunci.toLocaleString('id-ID')}
                      </span>
                    </td>

                    {/* Status Dokumen */}
                    <td className="px-4 py-4">
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
                          ? 'Review'
                          : pt.statusVerifikasiDokumen === 'ditolak'
                          ? 'Ditolak'
                          : 'Belum Upload'}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Lock / Unlock Toggle Button */}
                        {isLocked ? (
                          <button
                            title="Buka Kunci Saldo (Unlock)"
                            onClick={() => onOpenLockModal(pt, 'unlock')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            Buka Saldo
                          </button>
                        ) : (
                          <button
                            title="Kunci Saldo (Lock)"
                            onClick={() => onOpenLockModal(pt, 'lock')}
                            className="px-2.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            Kunci Saldo
                          </button>
                        )}

                        {/* Kelola Saldo */}
                        <button
                          title="Tambah atau Edit Saldo"
                          onClick={() => onOpenEditSaldoModal(pt)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          Atur Saldo
                        </button>

                        {/* Edit Profil */}
                        <button
                          title="Edit Data Perusahaan"
                          onClick={() => onOpenEditProfileModal(pt)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Poster */}
                        <button
                          title="Download Poster QR"
                          onClick={() => onOpenPosterModal(pt)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          title="Hapus Entitas Perusahaan"
                          onClick={() => onDeleteUser(pt)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
