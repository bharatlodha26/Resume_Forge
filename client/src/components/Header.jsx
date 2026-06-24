import { useResume } from '../context/ResumeContext';

export default function Header() {
  const { activeTab, setActiveTab, compile, resume, compiling, saving } = useResume();

  return (
    <header className="app-header">
      <a href="#" className="logo">
        <div className="logo-icon">R</div>
        <span>ResumeForge</span>
      </a>

      <div className="header-tabs">
        <button
          className={`tab-btn ${activeTab === 'master' ? 'active' : ''}`}
          onClick={() => setActiveTab('master')}
        >
          📋 Master Resume
        </button>
        <button
          className={`tab-btn ${activeTab === 'tailor' ? 'active' : ''}`}
          onClick={() => setActiveTab('tailor')}
        >
          ✨ Tailor for JD
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="header-spacer" />

      <div className="header-actions">
        {saving && (
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            Saving…
          </span>
        )}
        <button
          className="btn btn-primary"
          onClick={() => compile()}
          disabled={compiling || !resume}
        >
          {compiling ? (
            <><div className="spinner" /> Compiling…</>
          ) : (
            <> Generate PDF</>
          )}
        </button>
      </div>
    </header>
  );
}
