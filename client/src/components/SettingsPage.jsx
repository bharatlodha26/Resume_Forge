import { useEffect, useState } from 'react';
import { useResume } from '../context/ResumeContext';

export default function SettingsPage() {
  const {
    classFileContent,
    loadingClassFile,
    savingClassFile,
    fetchClassFile,
    saveClassFile,
    compile
  } = useResume();

  const [localContent, setLocalContent] = useState('');
  const [prevClassFileContent, setPrevClassFileContent] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    fetchClassFile();
  }, [fetchClassFile]);

  if (classFileContent !== prevClassFileContent) {
    setLocalContent(classFileContent);
    setPrevClassFileContent(classFileContent);
  }

  const handleSave = async () => {
    setSaveSuccess(false);
    setSaveError(null);
    const ok = await saveClassFile(localContent);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      // Auto-compile to show update in PDF preview
      compile();
    } else {
      setSaveError('Failed to save the class file. Please check server logs.');
    }
  };

  const isDirty = localContent !== classFileContent;

  if (loadingClassFile && !classFileContent) {
    return (
      <div className="settings-page-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)' }}>
        <div className="spinner" />
        <span style={{ marginTop: 12 }}>Loading class file…</span>
      </div>
    );
  }

  return (
    <div className="settings-page" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', overflowY: 'auto', background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}>
      <div className="settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚙️ Resume LaTeX Class Settings
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Customize the document class styling, layout margins, colors, and macros in <code>bharatresume.cls</code>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={savingClassFile || !isDirty}
            style={{ opacity: isDirty ? 1 : 0.6 }}
          >
            {savingClassFile ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ padding: '12px 16px', background: 'var(--color-success)', color: '#fff', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '13px', fontWeight: '500' }}>
          ✓ Class file saved successfully and compilation initiated!
        </div>
      )}

      {saveError && (
        <div style={{ padding: '12px 16px', background: 'var(--color-danger)', color: '#fff', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '13px', fontWeight: '500' }}>
          ⚠ {saveError}
        </div>
      )}

      <div className="editor-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderBottom: 'none', borderTopLeftRadius: 'var(--radius-md)', borderTopRightRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          <span>templates/bharatresume.cls</span>
          {isDirty && <span style={{ color: 'var(--color-warning)' }}>● Unsaved Changes</span>}
        </div>
        <textarea
          value={localContent}
          onChange={(e) => setLocalContent(e.target.value)}
          spellCheck="false"
          style={{
            flex: 1,
            width: '100%',
            padding: '16px',
            background: '#0a0a0d',
            color: '#c5c5d2',
            border: '1px solid var(--color-border)',
            borderBottomLeftRadius: 'var(--radius-md)',
            borderBottomRightRadius: 'var(--radius-md)',
            fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
            fontSize: '13px',
            lineHeight: '1.6',
            resize: 'none',
            outline: 'none',
            tabSize: 4
          }}
        />
      </div>
    </div>
  );
}
