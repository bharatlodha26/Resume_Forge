/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ResumeContext = createContext(null);

export function ResumeProvider({ children }) {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [compiling, setCompiling] = useState(false);
  const [compileError, setCompileError] = useState(null);
  const [activeTab, setActiveTab] = useState('master'); // 'master' | 'tailor' | 'settings'
  const [classFileContent, setClassFileContent] = useState('');
  const [loadingClassFile, setLoadingClassFile] = useState(false);
  const [savingClassFile, setSavingClassFile] = useState(false);

  useEffect(() => {
    fetch('/api/resume')
      .then(r => r.json())
      .then(data => { setResume(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const saveResume = useCallback(async (data) => {
    setSaving(true);
    try {
      await fetch('/api/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } finally {
      setSaving(false);
    }
  }, []);

  const updateResume = useCallback((updater) => {
    setResume(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      // Debounced save
      setTimeout(() => saveResume(next), 500);
      return next;
    });
  }, [saveResume]);

  const compile = useCallback(async (resumeData) => {
    setCompiling(true);
    setCompileError(null);
    setPdfUrl(null);
    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: resumeData || resume })
      });
      const data = await res.json();
      if (data.success) {
        setPdfUrl(data.pdfUrl + '?t=' + Date.now());
      } else {
        setCompileError(data.error || 'Compilation failed');
      }
    } catch (err) {
      setCompileError(err.message);
    } finally {
      setCompiling(false);
    }
  }, [resume]);

  const fetchClassFile = useCallback(async () => {
    setLoadingClassFile(true);
    try {
      const res = await fetch('/api/resume/class');
      const data = await res.json();
      setClassFileContent(data.content || '');
    } catch (err) {
      console.error('Failed to fetch class file:', err);
    } finally {
      setLoadingClassFile(false);
    }
  }, []);

  const saveClassFile = useCallback(async (content) => {
    setSavingClassFile(true);
    try {
      const res = await fetch('/api/resume/class', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (data.success) {
        setClassFileContent(content);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to save class file:', err);
      return false;
    } finally {
      setSavingClassFile(false);
    }
  }, []);

  return (
    <ResumeContext.Provider value={{
      resume, updateResume, loading, saving,
      pdfUrl, compiling, compileError, compile,
      activeTab, setActiveTab,
      classFileContent, setClassFileContent,
      loadingClassFile, savingClassFile,
      fetchClassFile, saveClassFile
    }}>
      {children}
    </ResumeContext.Provider>
  );
}

export const useResume = () => useContext(ResumeContext);
