import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, isOwnerEmail } from '../lib/firebase';
import { useNavigation } from '../context/NavigationContext';
import { ShieldCheck, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, HelpCircle, KeyRound, CheckCircle2, UserCheck, MessageCircle } from 'lucide-react';
import { UserRole } from '../types';
import { UnauthorizedDomainModal } from '../components/UnauthorizedDomainModal';
import { BrandLogo } from '../components/BrandLogo';

export const LoginPage: React.FC = () => {
  const { navigate } = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const routeByRole = async (uid: string, userEmail: string | null) => {
    const isOwner = isOwnerEmail(userEmail);

    let role: UserRole = isOwner ? 'owner' : 'perusahaan';

    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        role = (data?.role as UserRole) || role;
        if (!data?.picName && userEmail) {
          await setDoc(userRef, { picName: userEmail }, { merge: true }).catch(() => {});
        }
      } else {
        // First-time doc creation (e.g. from Google login)
        await setDoc(userRef, {
          email: userEmail || '',
          picName: userEmail || '',
          role: isOwner ? 'owner' : 'perusahaan',
          namaPT: isOwner ? 'INTEGRITAS360 Admin' : 'Pengguna Baru',
          sektor: isOwner ? 'Dewan Pengawas' : 'Umum',
          alamat: '-',
          deskripsi: '-',
          danaTersedia: 0,
          saldo: 0,
          createdAt: serverTimestamp(),
        }).catch((err) => console.warn('Could not create initial user document:', err));
      }
    } catch (firestoreErr) {
      console.warn('Firestore doc read error on login, falling back to role:', firestoreErr);
    }

    if (isOwner) {
      role = 'owner';
    }

    if (role === 'owner') {
      navigate('/owner');
    } else if (role === 'admin_perusahaan') {
      navigate('/admin-perusahaan');
    } else if (role === 'auditor') {
      navigate('/auditor');
    } else {
      navigate('/perusahaan');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg('Harap masukkan email dan kata sandi.');
      return;
    }

    try {
      setLoading(true);
      const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
      await routeByRole(res.user.uid, res.user.email);
    } catch (err: any) {
      console.error('Login error:', err);
      const code = err.code || '';
      if (
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/invalid-login-credentials'
      ) {
        setErrorMsg('Email atau kata sandi tidak cocok. Jika butuh bantuan atau pendaftaran akun, silakan hubungi kami via WhatsApp.');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('Format alamat email tidak valid.');
      } else if (code === 'auth/user-disabled') {
        setErrorMsg('Akun ini telah dinonaktifkan oleh administrator.');
      } else if (code === 'auth/too-many-requests') {
        setErrorMsg('Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat atau atur ulang kata sandi.');
      } else if (code === 'auth/network-request-failed') {
        setErrorMsg('Koneksi internet bermasalah. Periksa jaringan Anda dan coba lagi.');
      } else {
        setErrorMsg(err.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      await routeByRole(res.user.uid, res.user.email);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setShowDomainModal(true);
        setErrorMsg('Domain web aplikasi ini belum didaftarkan di Firebase Authentication (auth/unauthorized-domain). Silakan gunakan login Email & Kata Sandi di atas (100% aktif), atau klik "Panduan Otorisasi Domain".');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Proses login Google dibatalkan.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignore duplicate popup
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Popup Google diblokir oleh browser. Harap izinkan popup untuk situs ini.');
      } else {
        setErrorMsg(err.message || 'Gagal masuk dengan akun Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    const targetEmail = resetEmail.trim() || email.trim();
    if (!targetEmail) {
      setResetError('Harap masukkan alamat email Anda.');
      return;
    }

    try {
      setResetLoading(true);
      await sendPasswordResetEmail(auth, targetEmail);
      setResetSuccess(`Link instruksi reset kata sandi telah dikirim ke ${targetEmail}. Periksa folder Kotak Masuk atau Spam Anda.`);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setResetError('Email ini belum terdaftar di sistem. Silakan lakukan pendaftaran akun.');
      } else if (err.code === 'auth/invalid-email') {
        setResetError('Format email tidak valid.');
      } else {
        setResetError(err.message || 'Gagal mengirim email reset kata sandi.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo size="lg" className="shadow-xl shadow-amber-500/20" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            Portal Masuk INTEGRITAS360
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Masuk ke Sistem</h2>
          <p className="text-xs text-slate-400">
            Gunakan akun email terdaftar atau akun Google Anda untuk mengakses portal.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
            {errorMsg.includes('unauthorized-domain') && (
              <button
                type="button"
                onClick={() => setShowDomainModal(true)}
                className="w-full mt-1 py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Buka Panduan Otorisasi Domain & Salin Alamat Web
              </button>
            )}
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Akun</label>
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Kata Sandi</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetError('');
                    setResetSuccess('');
                    setResetModalOpen(true);
                  }}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan kata sandi"
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

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider">Atau</span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {/* Google Login */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
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
            Masuk dengan Google
          </button>

          {/* Quick link for unauthorized domain guidance */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setShowDomainModal(true)}
              className="text-[11px] text-amber-400/80 hover:text-amber-300 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Info Otorisasi Domain Firebase (auth/unauthorized-domain)</span>
            </button>
          </div>
        </div>

        {/* Hubungi Kami WhatsApp (Tombol Daftar di-hide sementara) */}
        <div className="text-center text-xs text-slate-400 space-y-2">
          <p>Belum memiliki akun atau ingin mendaftar?</p>
          <a
            href="https://wa.me/6287879625033?text=Halo%20Admin%20Integritas360%2C%20saya%20ingin%20mendaftar%20atau%20konsultasi%20layanan"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 font-bold text-xs transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Hubungi Kami (WhatsApp: 0878-7962-5033)</span>
          </a>
        </div>

        {/* Unauthorized Domain Modal */}
        <UnauthorizedDomainModal
          isOpen={showDomainModal}
          onClose={() => setShowDomainModal(false)}
          onUseEmailAuth={() => {
            const submitBtn = document.getElementById('btn-login-submit');
            submitBtn?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Password Reset Modal */}
        {resetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Atur Ulang Kata Sandi</h3>
                  <p className="text-[11px] text-slate-400">Kami akan mengirim link reset ke email Anda</p>
                </div>
              </div>

              {resetError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                  {resetError}
                </div>
              )}

              {resetSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                  {resetSuccess}
                </div>
              )}

              <form onSubmit={handlePasswordReset} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Terdaftar</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors disabled:opacity-60"
                  >
                    {resetLoading ? 'Mengirim...' : 'Kirim Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

