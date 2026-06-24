import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';

export default function SimpleSectionEditor({ sectionId }) {
  const { resume, updateResume } = useResume();
  const section = resume?.sections?.find(s => s.id === sectionId);
  const [editing, setEditing] = useState(null);
  if (!section) return null;

  const updateSection = (updater) =>
    updateResume(r => ({
      ...r,
      sections: r.sections.map(s => s.id === sectionId ? (typeof updater === 'function' ? updater(s) : updater) : s)
    }));

  const updateBullet = (idx, text) =>
    updateSection(s => ({ ...s, bullets: s.bullets.map((b, i) => i === idx ? { ...b, text } : b) }));

  const deleteBullet = (idx) =>
    updateSection(s => ({ ...s, bullets: s.bullets.filter((_, i) => i !== idx) }));

  const addBullet = () =>
    updateSection(s => ({ ...s, bullets: [...(s.bullets || []), { id: uuidv4(), text: '' }] }));

  return (
    <div className="fade-in">
      <div className="editor-section-title">{section.title}</div>

      <div className="form-row" style={{ marginBottom: 16 }}>
        <div className="form-group">
          <label className="form-label">Section Title</label>
          <input className="form-input" value={section.title} onChange={e => updateSection(s => ({ ...s, title: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Row Label</label>
          <input className="form-input" value={section.label || ''} onChange={e => updateSection(s => ({ ...s, label: e.target.value }))} placeholder="Achievements" />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Bullet Points</div>
        </div>
        <div className="bullet-list">
          {(section.bullets || []).map((bullet, idx) => (
            <div key={bullet.id} className="bullet-item">
              <div className="bullet-dot" />
              {editing === idx ? (
                <textarea
                  className="bullet-textarea"
                  autoFocus
                  value={bullet.text || ''}
                  onChange={e => updateBullet(idx, e.target.value)}
                  onBlur={() => setEditing(null)}
                  rows={2}
                />
              ) : (
                <div className="bullet-text" onClick={() => setEditing(idx)} style={{ cursor: 'text' }}>
                  {bullet.text || <span style={{ color: 'var(--color-text-muted)' }}>Click to edit…</span>}
                </div>
              )}
              <div className="bullet-actions">
                <button className="btn btn-icon btn-ghost" onClick={() => setEditing(idx)}>✏️</button>
                <button className="btn btn-icon btn-danger" onClick={() => deleteBullet(idx)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
        <button className="add-section-btn" style={{ marginTop: 8 }} onClick={addBullet}>
          + Add Bullet
        </button>
      </div>
    </div>
  );
}
