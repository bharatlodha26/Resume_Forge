import { useState } from 'react';
import { useResume } from '../context/ResumeContext';

function getAllBullets(resume) {
  const bullets = [];
  for (const section of resume?.sections || []) {
    if (section.type === 'work') {
      for (const job of section.jobs || []) {
        for (const group of job.groups || []) {
          for (const bullet of group.bullets || []) {
            bullets.push({
              ...bullet,
              context: `${job.company} › ${group.label}`,
              sectionId: section.id, jobId: job.id, groupId: group.id
            });
          }
        }
      }
    } else if (section.type === 'simple') {
      for (const bullet of section.bullets || []) {
        bullets.push({
          ...bullet,
          context: section.title,
          sectionId: section.id
        });
      }
    }
  }
  return bullets;
}

function buildTailoredResume(resume, selectedIds) {
  const idSet = new Set(selectedIds);
  const tailored = JSON.parse(JSON.stringify(resume)); // deep clone

  tailored.sections = tailored.sections.map(section => {
    if (section.type === 'work') {
      return {
        ...section,
        jobs: section.jobs.map(job => ({
          ...job,
          groups: job.groups.map(group => ({
            ...group,
            bullets: group.bullets.filter(b => idSet.has(b.id))
          })).filter(g => g.bullets.length > 0)
        })).filter(j => j.groups.length > 0)
      };
    }
    if (section.type === 'simple') {
      return {
        ...section,
        bullets: section.bullets.filter(b => idSet.has(b.id))
      };
    }
    return section; // academic unchanged
  }).filter(s => {
    if (s.type === 'work') return s.jobs.length > 0;
    if (s.type === 'simple') return s.bullets.length > 0;
    return true;
  });

  return tailored;
}

export default function TailorPage() {
  const { resume, compile, compiling } = useResume();
  const [jd, setJd] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  const allBullets = getAllBullets(resume);

  const handleTailor = async () => {
    if (!jd.trim()) return;
    setLoading(true);
    setError(null);
    setSelectedIds(null);
    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jd, apiKey: apiKey || undefined })
      });
      const data = await res.json();
      if (data.selected) {
        setSelectedIds(new Set(data.selected));
        setIsDemo(!!data.demo);
      } else {
        setError(data.error || 'Failed to get selection');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleBullet = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCompileTailored = () => {
    const tailored = buildTailoredResume(resume, [...selectedIds]);
    compile(tailored);
  };

  return (
    <div className="jd-panel">
      {/* Left: JD Input */}
      <div className="jd-input-panel">
        <div className="editor-section-title">Tailor for a Job</div>
        <div className="editor-section-subtitle" style={{ marginBottom: 16 }}>
          Paste a job description and AI will select the most relevant bullets from your master resume.
        </div>

        <div className="form-group">
          <label className="form-label">Job Description</label>
          <textarea
            className="jd-textarea"
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder="Paste the full job description here…&#10;&#10;Include responsibilities, requirements, and any keywords you want to match."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Gemini API Key (optional)</label>
          <input
            className="form-input"
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="AIza… (leave blank for demo mode)"
          />
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Without a key, demo mode selects the first 10 bullets.
          </p>
        </div>

        {error && (
          <div style={{ padding: 12, background: 'rgba(196,64,64,0.15)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--color-danger)', marginBottom: 12 }}>
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={handleTailor}
          disabled={loading || !jd.trim() || !resume}
        >
          {loading ? <><div className="spinner" /> Analyzing JD…</> : '✨ Generate Tailored Resume'}
        </button>

        {selectedIds && (
          <>
            <div className="divider" style={{ margin: '20px 0' }} />
            {isDemo && (
              <div style={{ padding: 10, background: 'rgba(212,144,10,0.15)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--color-warning)', marginBottom: 12 }}>
                ⚠ Demo mode: showing first 10 bullets. Add a Gemini API key for real AI matching.
              </div>
            )}
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={handleCompileTailored}
              disabled={compiling || selectedIds.size === 0}
            >
              {compiling ? <><div className="spinner" /> Compiling…</> : `📄 Compile Tailored PDF (${selectedIds.size} bullets)`}
            </button>
          </>
        )}
      </div>

      {/* Right: Bullet Selection */}
      <div className="jd-result-panel">
        {!selectedIds ? (
          <div className="empty-state" style={{ marginTop: 60 }}>
            <div className="empty-icon">✨</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              AI Bullet Selection
            </p>
            <p className="empty-text">
              Paste a JD on the left and click Generate.<br />
              AI will highlight the most relevant bullets from your master resume.
            </p>
          </div>
        ) : (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div className="editor-section-title" style={{ margin: 0 }}>Selected Bullets</div>
              <div className="badge badge-accent">{selectedIds.size} selected</div>
              <div className="badge badge-neutral">{allBullets.length} total</div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              Click any bullet to include/exclude it from your tailored resume.
            </p>

            {allBullets.map(bullet => (
              <div
                key={bullet.id}
                className={`bullet-item ${selectedIds.has(bullet.id) ? 'selected' : ''}`}
                style={{ marginBottom: 6, cursor: 'pointer' }}
                onClick={() => toggleBullet(bullet.id)}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 4,
                  border: `2px solid ${selectedIds.has(bullet.id) ? 'var(--color-accent)' : 'var(--color-border-light)'}`,
                  background: selectedIds.has(bullet.id) ? 'var(--color-accent)' : 'transparent',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#fff'
                }}>
                  {selectedIds.has(bullet.id) ? '✓' : ''}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>
                    {bullet.context}
                  </div>
                  <div className="bullet-text">{bullet.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
