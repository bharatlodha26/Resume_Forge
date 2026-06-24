import './index.css';
import { ResumeProvider, useResume } from './context/ResumeContext';
import Header from './components/Header';
import MasterPage from './components/MasterPage';
import TailorPage from './components/TailorPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import PdfPreview from './components/PdfPreview';
import PrivacyPage from './components/PrivacyPage';
import TermsPage from './components/TermsPage';
import SupportPage from './components/SupportPage';

// Simple client-side router
function AppContent() {
  const { activeTab } = useResume();
  const path = window.location.pathname;

  if (path === '/login') {
    return <LoginPage />;
  }
  if (path === '/privacy') {
    return <PrivacyPage />;
  }
  if (path === '/terms') {
    return <TermsPage />;
  }
  if (path === '/support') {
    return <SupportPage />;
  }

  const renderContent = () => {
    if (activeTab === 'master') {
      return <MasterPage />;
    }
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gridColumn: '1/-1', overflow: 'hidden' }}>
        {activeTab === 'tailor' ? <TailorPage /> : <SettingsPage />}
        <PdfPreview />
      </div>
    );
  };

  return (
    <div className="app-shell">
      <Header />
      {renderContent()}
    </div>
  );
}

export default function App() {
  return (
    <ResumeProvider>
      <AppContent />
    </ResumeProvider>
  );
}
