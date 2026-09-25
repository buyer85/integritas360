import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, OWNER_EMAIL, isOwnerEmail } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  role: UserRole | null;
  isOwner: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  role: null,
  isOwner: false,
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const uid = currentUser.uid;
      const userRef = doc(db, 'users', uid);
      const isOwnerUser = isOwnerEmail(currentUser.email);
      const defaultRole: UserRole = isOwnerUser ? 'owner' : 'perusahaan';

      // Provide immediate fallback profile so the app remains fully functional even if offline
      setProfile((prev) => prev || {
        uid,
        email: currentUser.email || '',
        picName: currentUser.email || '',
        role: defaultRole,
        namaPT: currentUser.displayName || (isOwnerUser ? 'INTEGRITAS360 Admin' : 'PT'),
        sektor: isOwnerUser ? 'Dewan Pengawas' : '-',
        alamat: 'Indonesia',
        deskripsi: isOwnerUser ? 'Super Admin Integritas360' : '-',
        danaTersedia: 0,
        saldo: 0,
        createdAt: undefined,
      });

      // Realtime listener for active user profile with offline tolerance
      unsubscribeDoc = onSnapshot(
        userRef,
        async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            let effectiveRole: UserRole = (data.role as UserRole) || defaultRole;
            if (isOwnerEmail(currentUser.email)) {
              effectiveRole = 'owner';
            }
            setProfile({
              uid,
              email: data.email || currentUser.email || '',
              role: effectiveRole,
              namaPT: data.namaPT || 'PT',
              picName: data.picName || currentUser.email || '',
              sektor: data.sektor || '-',
              alamat: data.alamat || '-',
              deskripsi: data.deskripsi || '-',
              danaTersedia: Number(data.danaTersedia || 0),
              saldo: Number(data.saldo || 0),
              createdAt: data.createdAt,
              statusVerifikasiDokumen: data.statusVerifikasiDokumen,
              spesialisasiAudit: data.spesialisasiAudit,
              gelarProfesi: data.gelarProfesi,
              nomorLisensi: data.nomorLisensi,
              biayaJasaPerKasus: data.biayaJasaPerKasus || data.biayaJasaInvestigasi,
              kebijakanReward: data.kebijakanReward,
              danaTerkunci: data.danaTerkunci,
              photoURL: data.photoURL,
              perusahaanId: data.perusahaanId,
              perusahaanName: data.perusahaanName,
              jabatan: data.jabatan,
              departemen: data.departemen,
              statusAkun: data.statusAkun || 'aktif',
              namaBank: data.namaBank || data.bankName,
              nomorRekening: data.nomorRekening,
              pemilikRekening: data.pemilikRekening || data.namaPemilikRekening,
            });

            // Ensure owner role is synchronized if needed
            if (isOwnerUser && data.role !== 'owner') {
              setDoc(userRef, { role: 'owner' }, { merge: true }).catch(() => {});
            }
          } else {
            // First time login doc initialization
            const initialData: UserProfile = {
              uid,
              email: currentUser.email || '',
              picName: currentUser.email || '',
              role: defaultRole,
              namaPT: currentUser.displayName || (isOwnerUser ? 'INTEGRITAS360 Admin' : 'PT Baru Terdaftar'),
              sektor: isOwnerUser ? 'Dewan Integritas & Pengawasan' : 'Manufaktur & Bisnis',
              alamat: 'Indonesia',
              deskripsi: isOwnerUser ? 'Super Admin Integritas360' : 'Perusahaan Kepatuhan Integritas360',
              danaTersedia: 0,
              saldo: 0,
              createdAt: serverTimestamp(),
            };
            setDoc(userRef, initialData, { merge: true }).catch((err) => {
              console.warn('Background user doc creation pending sync:', err);
            });
          }
          setLoading(false);
        },
        (error) => {
          // If offline or permission error, keep fallback profile and mark loaded
          console.warn('Realtime profile listener fallback (offline or pending):', error.message);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
    setUser(null);
  };

  const isOwner = user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() || profile?.role === 'owner';
  const role = isOwner ? 'owner' : profile?.role || null;

  return (
    <AuthContext.Provider value={{ user, profile, loading, role, isOwner, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
