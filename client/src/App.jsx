import './index.css';
import { ResumeProvider, useResume } from './context/ResumeContext';
import Header from './components/Header';
import MasterPage from './components/MasterPage';
import TailorPage from './components/TailorPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import PdfPreview from './components/PdfPreview';

// Simple client-side router: show LoginPage for /login path
function AppContent() {
  const { activeTab } = useResume();
  const isLoginPath = window.location.pathname === '/login';

  if (isLoginPath) {
    return <LoginPage />;
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
