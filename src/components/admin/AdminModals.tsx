import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Coins,
  Building2,
  Eye,
  FileText,
  AlertTriangle,
  Trash2,
  X,
  Check,
  Save
} from 'lucide-react';
import { UserProfile, WhistleblowingReport } from '../../types';

// ==========================================
// 1. LOCK / UNLOCK MODAL
// ==========================================
interface LockModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: UserProfile | null;
  initialAction: 'lock' | 'unlock';
  onConfirm: (entityId: string, action: 'lock' | 'unlock', amount: number, reason: string) => Promise<void>;
}

export const LockModal: React.FC<LockModalProps> = ({
  isOpen,
  onClose,
  entity,
  initialAction,
  onConfirm
}) => {
  const [action, setAction] = useState<'lock' | 'unlock'>(initialAction);
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAction(initialAction);
    if (entity) {
      if (initialAction === 'lock') {
        setAmount(entity.danaTersedia || 5000000);
        setReason('Penguncian saldo oleh Administrator untuk penjaminan investigasi whistleblowing.');
      } else {
        setAmount(entity.danaTerkunci || 0);
        setReason('Pembukaan kunci saldo perusahaan telah disetujui Administrator.');
      }
    }
  }, [initialAction, entity]);

  if (!isOpen || !entity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    try {
      setLoading(true);
      await onConfirm(entity.uid, action, amount, reason.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {action === 'lock' ? (
              <Lock className="w-5 h-5 text-red-400" />
            ) : (
              <Unlock className="w-5 h-5 text-emerald-400" />
            )}
            {action === 'lock' ? 'Kunci Saldo Perusahaan (LOCK)' : 'Buka Kunci Saldo (UNLOCK)'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
          <div className="text-slate-400">Entitas Perusahaan:</div>
          <div className="text-sm font-bold text-white">{entity.namaPT}</div>
          <div className="flex justify-between pt-1 font-mono text-[11px]">
            <span className="text-slate-400">
              Saldo Terbuka: <strong className="text-emerald-400">Rp {Number(entity.danaTersedia || 0).toLocaleString('id-ID')}</strong>
            </span>
            <span className="text-slate-400">
              Saldo Terkunci: <strong className="text-red-400">Rp {Number(entity.danaTerkunci || 0).toLocaleString('id-ID')}</strong>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Pilihan Aksi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAction('lock')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  action === 'lock'
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" /> Kunci Saldo (Lock)
              </button>
              <button
                type="button"
                onClick={() => setAction('unlock')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  action === 'unlock'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Unlock className="w-3.5 h-3.5" /> Buka Kunci (Unlock)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nominal Dana yang Di-{action === 'lock' ? 'kunci' : 'buka'} (Rp)
            </label>
            <input
              type="number"
              min={0}
              step={100000}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Alasan Administrator (Tercatat di Riwayat Audit)
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              placeholder="Contoh: Penguncian saldo penjaminan saat audit investigasi dugaan pelanggaran..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
                action === 'lock'
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              {loading ? 'Memproses...' : action === 'lock' ? 'Konfirmasi Kunci Saldo' : 'Konfirmasi Buka Saldo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. KELOLA / EDIT SALDO PERUSAHAAN MODAL
// ==========================================
interface EditSaldoModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: UserProfile | null;
  onSave: (entityId: string, danaTersedia: number, saldo: number, danaTerkunci: number) => Promise<void>;
  onTopUp: (entityId: string, amount: number) => Promise<void>;
}

export const EditSaldoModal: React.FC<EditSaldoModalProps> = ({
  isOpen,
  onClose,
  entity,
  onSave,
  onTopUp
}) => {
  const [tab, setTab] = useState<'topup' | 'custom'>('topup');
  const [topUpAmount, setTopUpAmount] = useState<number>(10000000);
  const [danaTersedia, setDanaTersedia] = useState<number>(0);
  const [saldo, setSaldo] = useState<number>(0);
  const [danaTerkunci, setDanaTerkunci] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entity) {
      setDanaTersedia(Number(entity.danaTersedia || 0));
      setSaldo(Number(entity.saldo || 0));
      setDanaTerkunci(Number(entity.danaTerkunci || 0));
      setTopUpAmount(10000000);
    }
  }, [entity]);

  if (!isOpen || !entity) return null;

  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topUpAmount <= 0) return;
    try {
      setLoading(true);
      await onTopUp(entity.uid, topUpAmount);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSave(entity.uid, danaTersedia, saldo, danaTerkunci);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            Kelola Saldo Perusahaan
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <div className="font-bold text-white">{entity.namaPT}</div>
          <div className="text-slate-400 font-mono text-[11px]">{entity.email}</div>
        </div>

        {/* Tab switch: Top Up vs Custom Edit */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setTab('topup')}
            className={`py-1.5 rounded-lg font-bold cursor-pointer ${
              tab === 'topup' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            + Tambah Dana (Top Up)
          </button>
          <button
            type="button"
            onClick={() => setTab('custom')}
            className={`py-1.5 rounded-lg font-bold cursor-pointer ${
              tab === 'custom' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Koreksi Saldo Langsung
          </button>
        </div>

        {tab === 'topup' ? (
          <form onSubmit={handleTopUpSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
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

            <div className="grid grid-cols-3 gap-2">
              {[5000000, 10000000, 25000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-1 px-2 rounded-lg text-xs font-mono transition-colors border cursor-pointer ${
                    topUpAmount === amt
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  +{amt / 1000000} Jt
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {loading ? 'Menyimpan...' : 'Simpan Tambah Dana'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Saldo Terbuka / Tersedia (Rp)
              </label>
              <input
                type="number"
                min={0}
                required
                value={danaTersedia}
                onChange={(e) => setDanaTersedia(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Saldo Bebas Dompet (Rp)
              </label>
              <input
                type="number"
                min={0}
                required
                value={saldo}
                onChange={(e) => setSaldo(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Saldo Terkunci / Locked (Rp)
              </label>
              <input
                type="number"
                min={0}
                required
                value={danaTerkunci}
                onChange={(e) => setDanaTerkunci(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm font-mono font-bold text-red-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                {loading ? 'Menyimpan...' : 'Perbarui Nilai Saldo'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3. KELOLA / EDIT SALDO AUDITOR MODAL
// ==========================================
interface EditAuditorSaldoModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditor: UserProfile | null;
  onSave: (auditorId: string, saldoBaru: number) => Promise<void>;
  onTopUpFee: (auditorId: string, feeAmount: number) => Promise<void>;
}

export const EditAuditorSaldoModal: React.FC<EditAuditorSaldoModalProps> = ({
  isOpen,
  onClose,
  auditor,
  onSave,
  onTopUpFee
}) => {
  const [feeAmount, setFeeAmount] = useState<number>(2500000);
  const [saldoBaru, setSaldoBaru] = useState<number>(0);
  const [mode, setMode] = useState<'tambah' | 'koreksi'>('tambah');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auditor) {
      setSaldoBaru(Number(auditor.saldo || 0));
      setFeeAmount(2500000);
    }
  }, [auditor]);

  if (!isOpen || !auditor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (mode === 'tambah') {
        await onTopUpFee(auditor.uid, feeAmount);
      } else {
        await onSave(auditor.uid, saldoBaru);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-blue-400" />
            Atur Saldo Honorarium Auditor
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <div className="font-bold text-white">{auditor.namaPT}</div>
          <div className="text-slate-400 font-mono text-[11px]">{auditor.email}</div>
          <div className="text-slate-400 pt-1">
            Saldo Saat Ini:{' '}
            <span className="font-mono text-blue-400 font-bold">
              Rp {Number(auditor.saldo || 0).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setMode('tambah')}
            className={`py-1.5 rounded-lg font-bold cursor-pointer ${
              mode === 'tambah' ? 'bg-blue-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            + Tambah Fee Audit
          </button>
          <button
            type="button"
            onClick={() => setMode('koreksi')}
            className={`py-1.5 rounded-lg font-bold cursor-pointer ${
              mode === 'koreksi' ? 'bg-blue-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Koreksi Saldo Manual
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'tambah' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nominal Tambah Fee Audit (Rp)
              </label>
              <input
                type="number"
                min={100000}
                step={100000}
                required
                value={feeAmount}
                onChange={(e) => setFeeAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-base font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Saldo Honorarium Baru (Rp)
              </label>
              <input
                type="number"
                min={0}
                required
                value={saldoBaru}
                onChange={(e) => setSaldoBaru(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              {loading ? 'Menyimpan...' : 'Simpan Saldo Auditor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. EDIT PROFIL ENTITAS MODAL (PT / AUDITOR)
// ==========================================
interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: UserProfile | null;
  onSave: (entityId: string, updatedData: Partial<UserProfile>) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  entity,
  onSave
}) => {
  const [namaPT, setNamaPT] = useState('');
  const [sektor, setSektor] = useState('');
  const [alamat, setAlamat] = useState('');
  const [telepon, setTelepon] = useState('');
  const [npwp, setNpwp] = useState('');
  const [picName, setPicName] = useState('');
  const [namaBank, setNamaBank] = useState('');
  const [nomorRekening, setNomorRekening] = useState('');
  const [pemilikRekening, setPemilikRekening] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entity) {
      setNamaPT(entity.namaPT || '');
      setSektor(entity.sektor || '');
      setAlamat(entity.alamat || '');
      setTelepon(entity.telepon || '');
      setNpwp(entity.npwp || '');
      setPicName(entity.picName || '');
      setNamaBank(entity.namaBank || entity.rekeningBank?.bankName || '');
      setNomorRekening(entity.nomorRekening || entity.rekeningBank?.accountNumber || '');
      setPemilikRekening(entity.pemilikRekening || entity.rekeningBank?.holderName || '');
    }
  }, [entity]);

  if (!isOpen || !entity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSave(entity.uid, {
        namaPT,
        sektor,
        alamat,
        telepon,
        npwp,
        picName,
        namaBank,
        nomorRekening,
        pemilikRekening,
        rekeningBank: {
          bankName: namaBank,
          accountNumber: nomorRekening,
          holderName: pemilikRekening
        }
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            Edit Data Entitas ({entity.role === 'perusahaan' ? 'Perusahaan' : 'Auditor'})
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              {entity.role === 'perusahaan' ? 'Nama Perusahaan (PT)' : 'Nama Auditor / Lembaga'}
            </label>
            <input
              type="text"
              required
              value={namaPT}
              onChange={(e) => setNamaPT(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {entity.role === 'perusahaan' ? 'Sektor Industri' : 'Spesialisasi Audit'}
              </label>
              <input
                type="text"
                value={sektor}
                onChange={(e) => setSektor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Telepon / WhatsApp</label>
              <input
                type="text"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">PIC / Petugas Resmi</label>
              <input
                type="text"
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">NPWP / NIB / Sertifikasi</label>
              <input
                type="text"
                value={npwp}
                onChange={(e) => setNpwp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Alamat Resmi</label>
            <input
              type="text"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="font-bold text-slate-300 block mb-2">Informasi Rekening Bank:</span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Bank (BCA/Mandiri)"
                value={namaBank}
                onChange={(e) => setNamaBank(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
              />
              <input
                type="text"
                placeholder="No Rekening"
                value={nomorRekening}
                onChange={(e) => setNomorRekening(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono"
              />
              <input
                type="text"
                placeholder="Atas Nama"
                value={pemilikRekening}
                onChange={(e) => setPemilikRekening(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 5. EDIT LAPORAN WHISTLEBLOWING MODAL
// ==========================================
interface EditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: WhistleblowingReport | null;
  auditorList: UserProfile[];
  onSave: (reportId: string, updatedData: Partial<WhistleblowingReport>) => Promise<void>;
}

export const EditReportModal: React.FC<EditReportModalProps> = ({
  isOpen,
  onClose,
  report,
  auditorList,
  onSave
}) => {
  const [status, setStatus] = useState<'baru' | 'proses' | 'valid' | 'selesai' | 'ditolak'>('baru');
  const [rewardAmount, setRewardAmount] = useState<number>(0);
  const [estimasiKerugian, setEstimasiKerugian] = useState<number>(0);
  const [selectedAuditorId, setSelectedAuditorId] = useState<string>('');
  const [catatanAuditor, setCatatanAuditor] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (report) {
      setStatus(report.status || 'baru');
      setRewardAmount(report.rewardAmount || report.rewardMinAmount || 0);
      setEstimasiKerugian(report.estimasiKerugian || 0);
      setSelectedAuditorId(report.targetAuditorId || report.auditorId || '');
      setCatatanAuditor(report.catatanAuditor || '');
    }
  }, [report]);

  if (!isOpen || !report) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const matchedAuditor = auditorList.find((a) => a.uid === selectedAuditorId);

      await onSave(report.id!, {
        status,
        rewardAmount,
        estimasiKerugian,
        targetAuditorId: selectedAuditorId,
        targetAuditorName: matchedAuditor?.namaPT || report.targetAuditorName || '',
        catatanAuditor: catatanAuditor.trim()
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Kelola Laporan #{report.tokenAkses}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
          <div className="font-bold text-white text-sm">{report.judul}</div>
          <div className="text-slate-400">
            Perusahaan: <strong className="text-slate-200">{report.companyName}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Status Investigasi Laporan</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="baru">Laporan Baru (Menunggu Penelaahan)</option>
              <option value="proses">Sedang Dalam Investigasi</option>
              <option value="valid">✅ Valid Terverifikasi Auditor (Ke Dashboard PT)</option>
              <option value="selesai">Selesai (Pelanggaran Terbukti & Sah)</option>
              <option value="ditolak">Ditolak (Tidak Memenuhi Syarat / Tidak Terbukti)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Estimasi Kerugian (Rp)</label>
              <input
                type="number"
                min={0}
                value={estimasiKerugian}
                onChange={(e) => setEstimasiKerugian(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Besaran Reward Pelapor (Rp)</label>
              <input
                type="number"
                min={0}
                value={rewardAmount}
                onChange={(e) => setRewardAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Tugaskan Auditor Independen</label>
            <select
              value={selectedAuditorId}
              onChange={(e) => setSelectedAuditorId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Pilih Auditor --</option>
              {auditorList.map((a) => (
                <option key={a.uid} value={a.uid}>
                  {a.namaPT} ({a.sektor || 'Investigator'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Catatan Evaluasi Administrator / Auditor</label>
            <textarea
              rows={3}
              value={catatanAuditor}
              onChange={(e) => setCatatanAuditor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              placeholder="Berikan catatan pertimbangan hukum atau hasil evaluasi bukti..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {loading ? 'Menyimpan...' : 'Perbarui Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 6. CONFIRM DELETE MODAL
// ==========================================
interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: { type: 'user' | 'report' | 'transaksi'; id: string; name: string } | null;
  onConfirm: () => Promise<void>;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  target,
  onConfirm
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !target) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-red-400">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Konfirmasi Penghapusan</h3>
            <p className="text-xs text-red-400 font-semibold uppercase">{target.type}</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Apakah Anda yakin ingin menghapus data <strong className="text-white font-semibold">"{target.name}"</strong>?
          Tindakan ini permanen dan tidak dapat dibatalkan.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-500/20 cursor-pointer"
          >
            {loading ? 'Menghapus...' : 'Ya, Hapus Data'}
          </button>
        </div>
      </div>
    </div>
  );
};
