import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { useNavigation } from '../context/NavigationContext';
import { Building2, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, AlertCircle, Info } from 'lucide-react';
import { UserRole } from '../types';

const SEKTOR_OPTIONS = [
  'Manufaktur & Pabrikasi',
  'Perbankan, Finansial & Asuransi',
  'Teknologi Informasi & Telekomunikasi',
  'Kesehatan & Farmasi',
  'Konstruksi & Properti',
  'Pertambangan, Minyak & Gas',
  'Logistik & Transportasi',
  'Pendidikan & Yayasan',
  'BUMN & Badan Publik',
  'Jasa Profesional & Konsultan',
  'Lainnya',
];

export const RegisterPage: React.FC = () => {
  const { query, navigate } = useNavigation();
  const initialType: UserRole = query.type === 'auditor' ? 'auditor' : 'perusahaan';

  const [type, setType] = useState<UserRole>(initialType);
  const [namaPT, setNamaPT] = useState('');
  const [sektor, setSektor] = useState(SEKTOR_OPTIONS[0]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alamat, setAlamat] = useState('');
  const [deskripsi, setDeskripsi] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (query.type === 'auditor' || query.type === 'perusahaan') {
      setType(query.type as UserRole);
    }
  }, [query.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password || !namaPT) {
      setErrorMsg('Harap lengkapi semua bidang bertanda wajib (*)');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    try {
      setLoading(true);
      console.log("MULAI DAFTAR", email);

      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      console.log("AUTH SUKSES UID:", cred.user.uid);

      await setDoc(doc(db, "users", cred.user.uid), {
        email: email.trim(),
        role: email.trim().toLowerCase() === "susidewiyuliyanti@gmail.com" ? "owner" : type,
        namaPT: namaPT.trim(),
        sektor: sektor || 'Lainnya',
        alamat: alamat.trim() || '-',
        deskripsi: deskripsi.trim() || '-',
        danaTersedia: 0,
        saldo: 0,
        createdAt: serverTimestamp()
      });
      console.log("FIRESTORE SUKSES");

      try {
        alert("Daftar Berhasil!");
      } catch (alertErr) {
        console.warn("Alert blocked in iframe:", alertErr);
      }
      navigate("/login");

    } catch (error: any) {
      console.error("ERROR LENGKAP:", error?.code, error?.message);
      const errMsg = `GAGAL DAFTAR: ${error?.code || 'ERROR'}\n${error?.message || 'Terjadi kesalahan'}`;
      try {
        alert(errMsg);
      } catch (alertErr) {
        console.warn("Alert blocked in iframe:", alertErr);
      }
      setErrorMsg(`GAGAL DAFTAR: ${error?.code || 'UNKNOWN'} — ${error?.message || 'Terjadi kesalahan sistem'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setErrorMsg('');
    try {
      setLoading(true);
      console.log("MULAI DAFTAR DENGAN GOOGLE");
      const cred = await signInWithPopup(auth, googleProvider);
      console.log("AUTH GOOGLE SUKSES UID:", cred.user.uid);

      const userEmail = cred.user.email || '';
      await setDoc(doc(db, "users", cred.user.uid), {
        email: userEmail,
        picName: userEmail, // Otomatis email menjadi nama PIC pada profile
        role: userEmail.toLowerCase() === "susidewiyuliyanti@gmail.com" ? "owner" : type,
        namaPT: namaPT.trim() || cred.user.displayName || (type === 'perusahaan' ? 'Perusahaan Baru' : 'Auditor Baru'),
        sektor: sektor || 'Lainnya',
        alamat: alamat.trim() || '-',
        deskripsi: deskripsi.trim() || '-',
        danaTersedia: 0,
        saldo: 0,
        createdAt: serverTimestamp()
      }, { merge: true });
      console.log("FIRESTORE SUKSES GOOGLE");

      try {
        alert("Daftar dengan Google Berhasil!");
      } catch (alertErr) {
        console.warn("Alert blocked:", alertErr);
      }

      if (userEmail.toLowerCase() === "susidewiyuliyanti@gmail.com") {
        navigate("/owner");
      } else if (type === "perusahaan") {
        navigate("/perusahaan");
      } else {
        navigate("/auditor");
      }
    } catch (error: any) {
      console.error("ERROR LENGKAP GOOGLE:", error?.code, error?.message);
      const errMsg = `GAGAL DAFTAR GOOGLE: ${error?.code || 'ERROR'}\n${error?.message || 'Terjadi kesalahan'}`;
      try {
        alert(errMsg);
      } catch (alertErr) {
        console.warn("Alert blocked:", alertErr);
      }
      setErrorMsg(`GAGAL DAFTAR: ${error?.code || 'UNKNOWN'} — ${error?.message || 'Terjadi kesalahan'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-xl shadow-amber-500/20 overflow-hidden">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="INTEGRITAS360 Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            Pendaftaran Akun Terverifikasi
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {type === 'perusahaan' ? 'Registrasi Perusahaan (PT)' : 'Registrasi Auditor Independen'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Bergabung dengan ekosistem pelaporan pelanggaran etika dan kepatuhan hukum INTEGRITAS360.
          </p>
        </div>

        {/* NOTICE KHUSUS PELAPOR (TIDAK PERLU DAFTAR) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/40 border border-emerald-500/40 text-xs shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Pelapor Whistleblower Tidak Perlu Mendaftar</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Form pendaftaran ini hanya diperuntukkan bagi <strong>Perusahaan</strong> dan <strong>Auditor Independen</strong>. Pelapor dugaan pelanggaran <strong className="text-emerald-300">TIDAK PERLU</strong> memiliki akun atau login Google.
          </p>
          <button
            type="button"
            onClick={() => navigate('/lapor')}
            className="w-full mt-1 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>👉 Langsung Buat Laporan Anonim (Tanpa Registrasi)</span>
          </button>
        </div>

        {/* Role Type Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setType('perusahaan');
              navigate('/register?type=perusahaan');
            }}
            className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              type === 'perusahaan'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Daftar Perusahaan
          </button>
          <button
            type="button"
            onClick={() => {
              setType('auditor');
              navigate('/register?type=auditor');
            }}
            className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              type === 'auditor'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            Daftar Auditor
          </button>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          {/* Nama PT or Nama Auditor */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {type === 'perusahaan' ? 'Nama Perusahaan / PT *' : 'Nama Lengkap Auditor / Firma Audit *'}
            </label>
            <input
              type="text"
              required
              placeholder={type === 'perusahaan' ? 'Contoh: PT Sumber Berkah Nusantara' : 'Contoh: Bpk. Hendra, CPA / KAP Independen'}
              value={namaPT}
              onChange={(e) => setNamaPT(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Sektor Industri */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {type === 'perusahaan' ? 'Sektor Industri *' : 'Spesialisasi Bidang Audit *'}
            </label>
            <select
              value={sektor}
              onChange={(e) => setSektor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            >
              {SEKTOR_OPTIONS.map((item) => (
                <option key={item} value={item} className="bg-slate-900 text-white">
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Email Admin */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Resmi Admin *
            </label>
            <input
              type="email"
              required
              placeholder="admin@perusahaan.co.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Kata Sandi (Password) *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Alamat Lengkap Kantor / Domisili
            </label>
            <textarea
              rows={2}
              placeholder="Gedung Menara Kencana Lt. 12, Jl. Sudirman Kav. 45, Jakarta"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Deskripsi Singkat / Profil Kepatuhan
            </label>
            <textarea
              rows={2}
              placeholder="Keterangan singkat profil entitas dan komitmen kepatuhan whistleblowing..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Submit button */}
          <button
            id="btn-submit-register"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mendaftarkan Akun...
              </>
            ) : (
              <>
                Daftar Sekarang
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider">Atau Daftar Dengan</span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {/* Google Register */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleRegister}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-3 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Daftar Cepat dengan Google
          </button>
        </form>

        {/* Footer switch to login */}
        <div className="text-center text-xs text-slate-400">
          Sudah memiliki akun terdaftar?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-amber-400 font-semibold hover:underline"
          >
            Masuk ke Akun
          </button>
        </div>
      </div>
    </div>
  );
};
