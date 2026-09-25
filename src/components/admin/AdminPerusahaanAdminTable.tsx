import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  MessageCircle,
  ExternalLink,
  Lock,
  Unlock,
  KeyRound
} from 'lucide-react';
import { UserProfile } from '../../types';

interface AdminPerusahaanAdminTableProps {
  adminList: UserProfile[];
  perusahaanList: UserProfile[];
  onAddAdmin: () => void;
  onEditAdmin: (admin: UserProfile) => void;
  onToggleStatus: (admin: UserProfile) => void;
  onDeleteAdmin: (admin: UserProfile) => void;
}

export const AdminPerusahaanAdminTable: React.FC<AdminPerusahaanAdminTableProps> = ({
  adminList,
  perusahaanList,
  onAddAdmin,
  onEditAdmin,
  onToggleStatus,
  onDeleteAdmin
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'nonaktif'>('all');

  // Filter logic
  const filteredAdmins = adminList.filter((admin) => {
    // Search
    const searchMatch =
      (admin.picName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.namaPT || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.perusahaanName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.jabatan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.departemen || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.telepon || '').includes(searchTerm);

    // Company filter
    const companyMatch =
      companyFilter === 'all' ||
      admin.perusahaanId === companyFilter ||
      admin.perusahaanName === companyFilter;

    // Status filter
    const currentStatus = admin.statusAkun || (admin.isLocked ? 'nonaktif' : 'aktif');
    const statusMatch = statusFilter === 'all' || currentStatus === statusFilter;

    return searchMatch && companyMatch && statusMatch;
  });

  return (
    <div className="space-y-4">
      {/* Top Bar: Search, Filters & Add Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama admin, email, PT, jabatan, WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Filter Perusahaan */}
          <div className="flex items-center gap-2">
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Semua Perusahaan ({perusahaanList.length})</option>
              {perusahaanList.map((pt) => (
                <option key={pt.uid} value={pt.uid}>
                  {pt.namaPT}
                </option>
              ))}
            </select>

            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Action Button: Add Admin */}
        <button
          onClick={onAddAdmin}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Admin Perusahaan</span>
        </button>
      </div>

      {/* Admin Perusahaan Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Daftar Admin Perusahaan Terdaftar</h3>
              <p className="text-[11px] text-slate-400">
                Pengelola dan investigator kepatuhan internal yang ditugaskan di masing-masing perusahaan
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            {filteredAdmins.length} Admin
          </span>
        </div>

        {filteredAdmins.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-300">Belum Ada Admin Perusahaan</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tambahkan admin perusahaan untuk mengelola investigasi laporan dugaan pelanggaran di masing-masing entitas PT.
            </p>
            <button
              onClick={onAddAdmin}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Admin Perusahaan Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Nama Petugas Admin</th>
                  <th className="py-3.5 px-4">Perusahaan Ditugaskan</th>
                  <th className="py-3.5 px-4">Jabatan & Departemen</th>
                  <th className="py-3.5 px-4">Kontak / WhatsApp</th>
                  <th className="py-3.5 px-4">Status Akun</th>
                  <th className="py-3.5 px-4 text-right">Kelola & Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredAdmins.map((admin) => {
                  const isAktif = (admin.statusAkun || 'aktif') === 'aktif' && !admin.isLocked;
                  const assignedCompany =
                    perusahaanList.find((p) => p.uid === admin.perusahaanId) || null;
                  const companyDisplayName =
                    admin.perusahaanName || assignedCompany?.namaPT || 'PT Terkait';

                  return (
                    <tr key={admin.uid} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                            {(admin.picName || admin.email || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {admin.picName || 'Admin Perusahaan'}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span>{admin.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Company */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold text-xs">
                          <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{companyDisplayName}</span>
                        </div>
                        {assignedCompany?.sektor && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {assignedCompany.sektor}
                          </div>
                        )}
                      </td>

                      {/* Jabatan & Departemen */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">
                          {admin.jabatan || 'Investigator / Admin Kepatuhan'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {admin.departemen || 'Divisi Kepatuhan Internal'}
                        </div>
                      </td>

                      {/* Kontak */}
                      <td className="py-3.5 px-4">
                        {admin.telepon ? (
                          <a
                            href={`https://wa.me/${admin.telepon.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono transition-colors"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-400" />
                            <span>{admin.telepon}</span>
                          </a>
                        ) : (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isAktif
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-red-500/10 border-red-500/30 text-red-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAktif ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                            }`}
                          />
                          {isAktif ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Status */}
                          <button
                            onClick={() => onToggleStatus(admin)}
                            title={isAktif ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isAktif
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {isAktif ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => onEditAdmin(admin)}
                            title="Edit Data Admin & Penugasan"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Admin */}
                          <button
                            onClick={() => onDeleteAdmin(admin)}
                            title="Hapus Akun Admin"
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
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
    </div>
  );
};
