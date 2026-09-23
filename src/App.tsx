import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { PerusahaanDashboard } from './pages/PerusahaanDashboard';
import { AuditorDashboard } from './pages/AuditorDashboard';
import { PublicReportPage } from './pages/PublicReportPage';
import { ProfilePage } from './pages/ProfilePage';
import { StudiKasusPage } from './pages/StudiKasusPage';
import { OWNER_EMAIL } from './lib/firebase';

const RouterView: React.FC = () => {
  const { path, navigate } = useNavigation();
  const { user, isOwner, role } = useAuth();

  let content: React.ReactNode = <LandingPage />;

  if (path === '/login') {
    content = <LoginPage />;
  } else if (path.startsWith('/register')) {
    content = <RegisterPage />;
  } else if (path === '/owner') {
    content = <OwnerDashboard />;
  } else if (path === '/perusahaan') {
    content = <PerusahaanDashboard />;
  } else if (path === '/auditor') {
    content = <AuditorDashboard />;
  } else if (path === '/profile') {
    content = <ProfilePage />;
  } else if (path.startsWith('/lapor')) {
    content = <PublicReportPage />;
  } else if (path === '/studi-kasus') {
    content = <StudiKasusPage />;
  } else {
    content = <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      <div>
        <Navbar />
        <main>{content}</main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <NavigationProvider>
      <AuthProvider>
        <RouterView />
      </AuthProvider>
    </NavigationProvider>
  );
}
