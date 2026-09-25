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
  Save,
  PlusCircle,
  Phone,
  CreditCard,
  ShieldCheck,
  ExternalLink,
  QrCode,
  Sliders,
  DollarSign,
  MessageCircle,
  CheckCircle2,
  Clock
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
  const [status, setStatus] = useState<WhistleblowingReport['status']>('baru');
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
              <option value="investigasi">Sedang Investigasi Menyeluruh</option>
              <option value="proses">Dalam Proses Penyelidikan</option>
              <option value="valid">✅ Valid Terverifikasi</option>
              <option value="terbukti">🎉 Terbukti Sah & Reward Dirilis</option>
              <option value="selesai">Selesai (Kasus Ditutup)</option>
              <option value="palsu_hoax">❌ Laporan Palsu / Hoax (Tidak Terbukti)</option>
              <option value="ditolak">Ditolak</option>
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

// ==========================================
// 7. TAMBAH PERUSAHAAN BARU (ADD PERUSAHAAN)
// ==========================================
export interface NewPerusahaanData {
  namaPT: string;
  email: string;
  sektor: string;
  alamat: string;
  telepon: string;
  picName: string;
  npwp: string;
  danaTersedia: number;
  danaTerkunci: number;
  saldo: number;
  statusVerifikasiDokumen: 'pending' | 'terverifikasi' | 'belum_upload';
  namaBank: string;
  nomorRekening: string;
  pemilikRekening: string;
  kebijakanReward: {
    rewardKasusEtik: number;
    persenFinansial: number;
    minPersenFinansial: number;
  };
}

interface AddPerusahaanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewPerusahaanData) => Promise<void>;
}

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
  'Konsultan & Jasa Lainnya',
  'Lainnya'
];

const BANK_OPTIONS = ['BCA', 'Mandiri', 'BRI', 'BNI', 'BSI', 'CIMB Niaga', 'Permata', 'Danamon'];

export const AddPerusahaanModal: React.FC<AddPerusahaanModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [namaPT, setNamaPT] = useState('');
  const [email, setEmail] = useState('');
  const [sektor, setSektor] = useState('Manufaktur & Pabrikasi');
  const [alamat, setAlamat] = useState('');
  const [telepon, setTelepon] = useState('');
  const [picName, setPicName] = useState('');
  const [npwp, setNpwp] = useState('');
  const [danaTersedia, setDanaTersedia] = useState<number>(5000000);
  const [danaTerkunci, setDanaTerkunci] = useState<number>(0);
  const [rewardKasusEtik, setRewardKasusEtik] = useState<number>(2500000);
  const [persenFinansial, setPersenFinansial] = useState<number>(2);
  const [namaBank, setNamaBank] = useState('BCA');
  const [nomorRekening, setNomorRekening] = useState('');
  const [pemilikRekening, setPemilikRekening] = useState('');
  const [statusVerifikasi, setStatusVerifikasi] = useState<'pending' | 'terverifikasi' | 'belum_upload'>('terverifikasi');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!namaPT.trim()) {
      setErrorMsg('Nama Perusahaan wajib diisi.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Email perusahaan tidak valid.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        namaPT: namaPT.trim(),
        email: email.trim().toLowerCase(),
        sektor,
        alamat: alamat.trim(),
        telepon: telepon.trim(),
        picName: picName.trim(),
        npwp: npwp.trim(),
        danaTersedia: Number(danaTersedia) || 0,
        danaTerkunci: Number(danaTerkunci) || 0,
        saldo: Number(danaTersedia) || 0,
        statusVerifikasiDokumen: statusVerifikasi,
        namaBank,
        nomorRekening: nomorRekening.trim(),
        pemilikRekening: pemilikRekening.trim() || namaPT.trim(),
        kebijakanReward: {
          rewardKasusEtik: Number(rewardKasusEtik) || 2500000,
          persenFinansial: Math.max(2, Number(persenFinansial) || 2),
          minPersenFinansial: 2
        }
      });
      // Reset form
      setNamaPT('');
      setEmail('');
      setAlamat('');
      setTelepon('');
      setPicName('');
      setNpwp('');
      setNomorRekening('');
      setPemilikRekening('');
      onClose();
    } catch (err: any) {
      console.error('Error adding company:', err);
      setErrorMsg(err.message || 'Gagal menambahkan data perusahaan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tambah Perusahaan Baru</h3>
              <p className="text-xs text-slate-400">Daftarkan entitas perusahaan ke dalam sistem Integritas360</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs cursor-pointer p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Profil Legal & Identitas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              1. Identitas Perusahaan & Kontak
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nama Resmi Perusahaan (PT / CV) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Sumber Alam Makmur"
                  value={namaPT}
                  onChange={(e) => setNamaPT(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Email Akun Perusahaan *
                </label>
                <input
                  type="email"
                  required
                  placeholder="compliance@pt-sumberalam.co.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Sektor Industri *
                </label>
                <select
                  value={sektor}
                  onChange={(e) => setSektor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {SEKTOR_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  NPWP / NIB Perusahaan
                </label>
                <input
                  type="text"
                  placeholder="01.234.567.8-901.000"
                  value={npwp}
                  onChange={(e) => setNpwp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nama PIC / Compliance Officer
                </label>
                <input
                  type="text"
                  placeholder="Nama Penanggung Jawab"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Telepon / WhatsApp Resmi
                </label>
                <input
                  type="text"
                  placeholder="0812-xxxx-xxxx"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Alamat Kantor Pusat / Operasional
              </label>
              <textarea
                rows={2}
                placeholder="Jl. Jend. Sudirman Kav. 52, Jakarta Selatan"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Section 2: Saldo & Keuangan Awal */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" />
              2. Saldo Awal & Pengaturan Escrow
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Saldo Kas Bebas Awal (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  step={500000}
                  value={danaTersedia}
                  onChange={(e) => setDanaTersedia(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Dana Terkunci Escrow (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  step={500000}
                  value={danaTerkunci}
                  onChange={(e) => setDanaTerkunci(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-red-400 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Status Verifikasi Legalitas
                </label>
                <select
                  value={statusVerifikasi}
                  onChange={(e) => setStatusVerifikasi(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="terverifikasi">Terverifikasi Langsung</option>
                  <option value="pending">Menunggu Review (Pending)</option>
                  <option value="belum_upload">Belum Unggah Dokumen</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Kebijakan Reward Pelapor */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              3. Kebijakan Reward Pelapor (ISO 37002)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nominal Reward Kasus Etik (Rp)
                </label>
                <input
                  type="number"
                  min={500000}
                  step={500000}
                  value={rewardKasusEtik}
                  onChange={(e) => setRewardKasusEtik(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Default: Rp 2.500.000 per aduan etik valid</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Persentase Reward Kasus Finansial (%)
                </label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  step={0.5}
                  value={persenFinansial}
                  onChange={(e) => setPersenFinansial(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Minimal 2% dari nilai kerugian terbukti</span>
              </div>
            </div>
          </div>

          {/* Section 4: Rekening Bank Perusahaan */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              4. Rekening Bank Perusahaan (Untuk Penarikan)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Bank</label>
                <select
                  value={namaBank}
                  onChange={(e) => setNamaBank(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {BANK_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  placeholder="Contoh: 1234567890"
                  value={nomorRekening}
                  onChange={(e) => setNomorRekening(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Pemilik Rekening</label>
                <input
                  type="text"
                  placeholder="Sesuai buku tabungan"
                  value={pemilikRekening}
                  onChange={(e) => setPemilikRekening(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Mendaftarkan Perusahaan...' : 'Daftarkan Perusahaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 8. DETAIL & KELOLA LENGKAP PERUSAHAAN MODAL
// ==========================================
interface DetailPerusahaanModalProps {
  isOpen: boolean;
  onClose: () => void;
  perusahaan: UserProfile | null;
  onOpenLockModal: (pt: UserProfile, action: 'lock' | 'unlock') => void;
  onOpenEditSaldoModal: (pt: UserProfile) => void;
  onOpenEditProfileModal: (pt: UserProfile) => void;
  onOpenPosterModal: (pt: UserProfile) => void;
  onDeleteUser: (pt: UserProfile) => void;
}

export const DetailPerusahaanModal: React.FC<DetailPerusahaanModalProps> = ({
  isOpen,
  onClose,
  perusahaan,
  onOpenLockModal,
  onOpenEditSaldoModal,
  onOpenEditProfileModal,
  onOpenPosterModal,
  onDeleteUser
}) => {
  if (!isOpen || !perusahaan) return null;

  const isLocked = Boolean(perusahaan.isLocked || (Number(perusahaan.danaTerkunci || 0) > 0 && !perusahaan.danaTersedia));
  const danaTerbuka = Number(perusahaan.danaTersedia || 0);
  const danaTerkunci = Number(perusahaan.danaTerkunci || 0);
  const totalAset = danaTerbuka + danaTerkunci;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{perusahaan.namaPT}</h3>
                {perusahaan.statusVerifikasiDokumen === 'terverifikasi' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="text-amber-400 font-medium">{perusahaan.sektor || 'Manufaktur'}</span>
                <span>•</span>
                <span className="font-mono">{perusahaan.email}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs cursor-pointer p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Financial Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Total Aset Entitas</span>
            <div className="text-lg font-mono font-bold text-white mt-1">
              Rp {totalAset.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-800/40">
            <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider">Saldo Terbuka (Liquid)</span>
            <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
              Rp {danaTerbuka.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-red-800/40">
            <span className="text-[10px] text-red-400 uppercase font-mono tracking-wider">Dana Terkunci Escrow</span>
            <div className="text-lg font-mono font-bold text-red-400 mt-1">
              Rp {danaTerkunci.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Status Lock Banner */}
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          isLocked
            ? 'bg-red-500/10 border-red-500/30 text-red-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            {isLocked ? <Lock className="w-4 h-4 text-red-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
            <span>Status Saldo: <strong>{isLocked ? 'TERKUNCI (LOCKED)' : 'TERBUKA (AKTIF)'}</strong></span>
            {perusahaan.lockReason && <span className="text-slate-400 italic">({perusahaan.lockReason})</span>}
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenLockModal(perusahaan, isLocked ? 'unlock' : 'lock');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isLocked
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                : 'bg-red-500 hover:bg-red-400 text-white'
            }`}
          >
            {isLocked ? 'Buka Kunci (Unlock)' : 'Kunci Saldo (Lock)'}
          </button>
        </div>

        {/* Detailed Information Tabs / Grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Box 1: Kontak & Legalitas */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-slate-800/80 pb-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" /> Kontak & Legalitas
            </h4>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">PIC Kepatuhan:</span>
                <span className="font-semibold text-white">{perusahaan.picName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Telepon / WA:</span>
                <span className="font-mono text-emerald-400 font-semibold">{perusahaan.telepon || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">NPWP / NIB:</span>
                <span className="font-mono">{perusahaan.npwp || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Legalitas:</span>
                <span className="font-semibold capitalize text-amber-300">
                  {perusahaan.statusVerifikasiDokumen || 'Belum Upload'}
                </span>
              </div>
              <div className="pt-1 text-[11px] text-slate-400">
                <span>Alamat: </span>
                <span className="text-slate-300">{perusahaan.alamat || '-'}</span>
              </div>
            </div>
          </div>

          {/* Box 2: Kebijakan Reward & Rekening Bank */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-slate-800/80 pb-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Kebijakan & Rekening
            </h4>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Reward Kasus Etik:</span>
                <span className="font-mono font-bold text-amber-400">
                  Rp {(perusahaan.kebijakanReward?.rewardKasusEtik || 2500000).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reward Kasus Finansial:</span>
                <span className="font-mono font-bold text-blue-400">
                  {perusahaan.kebijakanReward?.persenFinansial || 2}% kerugian
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bank Penarikan:</span>
                <span>{perusahaan.namaBank || perusahaan.rekeningBank?.bankName || 'BCA'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nomor Rekening:</span>
                <span className="font-mono text-white">
                  {perusahaan.nomorRekening || perusahaan.rekeningBank?.accountNumber || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Atas Nama:</span>
                <span className="text-white truncate max-w-[150px]">
                  {perusahaan.pemilikRekening || perusahaan.rekeningBank?.holderName || perusahaan.namaPT}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onDeleteUser(perusahaan);
              }}
              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Hapus Perusahaan
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenPosterModal(perusahaan);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" /> Unduh Poster QR
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenEditSaldoModal(perusahaan);
              }}
              className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" /> Atur Saldo
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenEditProfileModal(perusahaan);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" /> Edit Profil Lengkap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 10. ADD ADMIN PERUSAHAAN MODAL
// ==========================================
export interface NewAdminPerusahaanData {
  nama: string;
  email: string;
  password?: string;
  perusahaanId: string;
  perusahaanName: string;
  jabatan: string;
  departemen: string;
  telepon: string;
}

interface AddAdminPerusahaanModalProps {
  isOpen: boolean;
  onClose: () => void;
  perusahaanList: UserProfile[];
  onSubmit: (data: NewAdminPerusahaanData) => Promise<void>;
}

export const AddAdminPerusahaanModal: React.FC<AddAdminPerusahaanModalProps> = ({
  isOpen,
  onClose,
  perusahaanList,
  onSubmit
}) => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPTId, setSelectedPTId] = useState('');
  const [jabatan, setJabatan] = useState('Admin Kepatuhan & Investigator');
  const [departemen, setDepartemen] = useState('Divisi Kepatuhan & Investigasi Internal');
  const [telepon, setTelepon] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNama('');
      setEmail('');
      setPassword('');
      setJabatan('Admin Kepatuhan & Investigator');
      setDepartemen('Divisi Kepatuhan & Investigasi Internal');
      setTelepon('');
      setErrorMsg('');
      if (perusahaanList.length > 0) {
        setSelectedPTId(perusahaanList[0].uid);
      }
    }
  }, [isOpen, perusahaanList]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nama.trim() || !email.trim()) {
      setErrorMsg('Nama dan email admin wajib diisi.');
      return;
    }

    if (!selectedPTId) {
      setErrorMsg('Pilih perusahaan yang akan diawasi oleh admin ini.');
      return;
    }

    const assignedPT = perusahaanList.find((p) => p.uid === selectedPTId);
    const assignedPTName = assignedPT ? assignedPT.namaPT : 'PT Terkait';

    try {
      setLoading(true);
      await onSubmit({
        nama: nama.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim() || 'Integritas@2025',
        perusahaanId: selectedPTId,
        perusahaanName: assignedPTName,
        jabatan: jabatan.trim(),
        departemen: departemen.trim(),
        telepon: telepon.trim()
      });
      onClose();
    } catch (err: any) {
      console.error('Error adding admin perusahaan:', err);
      setErrorMsg(err.message || 'Gagal menambahkan admin perusahaan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Tambah Admin Perusahaan Baru</h3>
              <p className="text-[11px] text-slate-400">
                Buat akun petugas kepatuhan internal untuk investigasi laporan di dashboard PT
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Perusahaan Assignment */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Tugaskan ke Perusahaan <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedPTId}
              onChange={(e) => setSelectedPTId(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {perusahaanList.length === 0 ? (
                <option value="">Belum ada perusahaan terdaftar</option>
              ) : (
                perusahaanList.map((pt) => (
                  <option key={pt.uid} value={pt.uid}>
                    {pt.namaPT} ({pt.sektor || 'Umum'})
                  </option>
                ))
              )}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              Admin ini hanya akan memiliki akses investigasi dan dashboard laporan dari PT yang dipilih.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nama Admin */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Nama Lengkap Petugas <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Santoso, S.H."
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Email Admin */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Alamat Email Login <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="admin.kepatuhan@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Kata Sandi Awal */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Kata Sandi Awal Akun
              </label>
              <input
                type="text"
                placeholder="Default: Integritas@2025"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* WhatsApp / Telepon */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                No. WhatsApp / Telepon
              </label>
              <input
                type="tel"
                placeholder="081234567890"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Jabatan */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Jabatan Struktural
              </label>
              <input
                type="text"
                placeholder="Contoh: Compliance Officer"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Departemen */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Divisi / Departemen
              </label>
              <input
                type="text"
                placeholder="Contoh: Internal Audit & GCG"
                value={departemen}
                onChange={(e) => setDepartemen(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Menyimpan...' : 'Simpan & Daftarkan Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 11. EDIT ADMIN PERUSAHAAN MODAL
// ==========================================
interface EditAdminPerusahaanModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: UserProfile | null;
  perusahaanList: UserProfile[];
  onSave: (uid: string, updates: Partial<UserProfile>) => Promise<void>;
}

export const EditAdminPerusahaanModal: React.FC<EditAdminPerusahaanModalProps> = ({
  isOpen,
  onClose,
  adminUser,
  perusahaanList,
  onSave
}) => {
  const [nama, setNama] = useState('');
  const [selectedPTId, setSelectedPTId] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [departemen, setDepartemen] = useState('');
  const [telepon, setTelepon] = useState('');
  const [statusAkun, setStatusAkun] = useState<'aktif' | 'nonaktif'>('aktif');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (adminUser) {
      setNama(adminUser.picName || '');
      setSelectedPTId(adminUser.perusahaanId || '');
      setJabatan(adminUser.jabatan || 'Admin Kepatuhan');
      setDepartemen(adminUser.departemen || 'Divisi Kepatuhan Internal');
      setTelepon(adminUser.telepon || '');
      setStatusAkun((adminUser.statusAkun as any) || (adminUser.isLocked ? 'nonaktif' : 'aktif'));
      setErrorMsg('');
    }
  }, [adminUser]);

  if (!isOpen || !adminUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nama.trim()) {
      setErrorMsg('Nama admin tidak boleh kosong.');
      return;
    }

    const assignedPT = perusahaanList.find((p) => p.uid === selectedPTId);
    const assignedPTName = assignedPT ? assignedPT.namaPT : adminUser.perusahaanName || 'PT Terkait';

    try {
      setLoading(true);
      await onSave(adminUser.uid, {
        picName: nama.trim(),
        perusahaanId: selectedPTId,
        perusahaanName: assignedPTName,
        jabatan: jabatan.trim(),
        departemen: departemen.trim(),
        telepon: telepon.trim(),
        statusAkun,
        isLocked: statusAkun === 'nonaktif'
      });
      onClose();
    } catch (err: any) {
      console.error('Error updating admin perusahaan:', err);
      setErrorMsg(err.message || 'Gagal memperbarui admin perusahaan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Kelola & Edit Admin Perusahaan</h3>
              <p className="text-[11px] text-slate-400">{adminUser.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Perusahaan Assignment */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Perusahaan yang Ditugaskan
            </label>
            <select
              value={selectedPTId}
              onChange={(e) => setSelectedPTId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {perusahaanList.map((pt) => (
                <option key={pt.uid} value={pt.uid}>
                  {pt.namaPT} ({pt.sektor || 'Umum'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nama Admin */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Nama Lengkap Petugas
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Status Akun */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Status Akun
              </label>
              <select
                value={statusAkun}
                onChange={(e) => setStatusAkun(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="aktif">Aktif (Dapat Login & Investigasi)</option>
                <option value="nonaktif">Nonaktif (Akses Ditutup Sementara)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Jabatan */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Jabatan
              </label>
              <input
                type="text"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Departemen */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Departemen
              </label>
              <input
                type="text"
                value={departemen}
                onChange={(e) => setDepartemen(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Telepon */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Nomor WhatsApp / Telepon
            </label>
            <input
              type="tel"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Menyimpan...' : 'Perbarui Data Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


