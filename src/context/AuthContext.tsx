import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, OWNER_EMAIL } from '../lib/firebase';
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

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
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

      try {
        const snap = await getDoc(userRef);
        const isOwnerEmail = currentUser.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

        if (!snap.exists()) {
          // If first-time login (e.g. Google Sign In)
          const defaultRole: UserRole = isOwnerEmail ? 'owner' : 'perusahaan';
          const initialData: UserProfile = {
            uid,
            email: currentUser.email || '',
            picName: currentUser.email || '',
            role: defaultRole,
            namaPT: currentUser.displayName || (isOwnerEmail ? 'INTEGRITAS360 Admin' : 'PT Baru Terdaftar'),
            sektor: isOwnerEmail ? 'Dewan Integritas & Pengawasan' : 'Manufaktur & Bisnis',
            alamat: 'Indonesia',
            deskripsi: isOwnerEmail ? 'Super Admin Integritas360' : 'Perusahaan Kepatuhan Integritas360',
            danaTersedia: 0,
            saldo: 0,
            createdAt: serverTimestamp(),
          };
          await setDoc(userRef, initialData);
        } else {
          if (isOwnerEmail && snap.data()?.role !== 'owner') {
            await setDoc(userRef, { role: 'owner' }, { merge: true });
          }
          if (!snap.data()?.picName && currentUser.email) {
            await setDoc(userRef, { picName: currentUser.email }, { merge: true });
          }
        }

        // Realtime listener for active user profile
        unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            let effectiveRole: UserRole = (data.role as UserRole) || 'perusahaan';
            if (currentUser.email?.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
              effectiveRole = 'owner';
            }
            setProfile({
              uid,
              email: data.email || currentUser.email || '',
              role: effectiveRole,
              namaPT: data.namaPT || 'PT Tanpa Nama',
              sektor: data.sektor || '-',
              alamat: data.alamat || '-',
              deskripsi: data.deskripsi || '-',
              danaTersedia: Number(data.danaTersedia || 0),
              saldo: Number(data.saldo || 0),
              createdAt: data.createdAt,
            });
          }
          setLoading(false);
        }, (error) => {
          console.error('Error listening to user doc:', error);
          setLoading(false);
        });
      } catch (err) {
        console.error('Error initializing user profile:', err);
        setLoading(false);
      }
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
