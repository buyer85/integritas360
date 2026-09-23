import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, OWNER_EMAIL } from '../lib/firebase';
import { useNavigation } from '../context/NavigationContext';
import { ShieldCheck, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { navigate } = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const routeByRole = async (uid: string, userEmail: string | null) => {
    const isOwnerEmail = userEmail?.toLowerCase() === OWNER_EMAIL.toLowerCase();

    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);

    let role: UserRole = 'perusahaan';

    if (snap.exists()) {
      role = snap.data()?.role as UserRole;
      if (!snap.data()?.picName && userEmail) {
        await setDoc(userRef, { picName: userEmail }, { merge: true });
      }
    } else {
      // First-time doc creation (e.g. from Google login)
      role = isOwnerEmail ? 'owner' : 'perusahaan';
      await setDoc(userRef, {
        email: userEmail || '',
        picName: userEmail || '', // Otomatis email menjadi nama PIC pada profile
        role,
        namaPT: isOwnerEmail ? 'INTEGRITAS360 Admin' : 'Pengguna Baru',
        sektor: isOwnerEmail ? 'Dewan Pengawas' : 'Umum',
        alamat: '-',
        deskripsi: '-',
        danaTersedia: 0,
        saldo: 0,
        createdAt: serverTimestamp(),
      });
    }

    if (isOwnerEmail) {
      role = 'owner';
    }

    if (role === 'owner') {
      navigate('/owner');
    } else if (role === 'perusahaan') {
      navigate('/perusahaan');
    } else if (role === 'auditor') {
      navigate('/auditor');
    } else {
      navigate('/perusahaan');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Harap masukkan email dan kata sandi.');
      return;
    }

    try {
      setLoading(true);
      const res = await signInWithEmailAndPassword(auth, email.trim(), password);
      await routeByRole(res.user.uid, res.user.email);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Email atau kata sandi tidak cocok. Jika belum memiliki akun, silakan daftar terlebih dahulu.');
      } else {
        setErrorMsg(err.message || 'Gagal masuk. Periksa koneksi atau kredensial Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      await routeByRole(res.user.uid, res.user.email);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('Login dengan Google dibatalkan atau terkendala.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto space-y-6">
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
            Portal Masuk INTEGRITAS360
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Masuk ke Sistem</h2>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMsg}</span>
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
        </div>

        {/* Link to Register */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>Belum memiliki akun?</p>
          <div className="flex items-center justify-center gap-3 font-semibold text-amber-400">
            <button onClick={() => navigate('/register?type=perusahaan')} className="hover:underline">
              Daftar Perusahaan (PT)
            </button>
            <span>•</span>
            <button onClick={() => navigate('/register?type=auditor')} className="hover:underline">
              Daftar Auditor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
