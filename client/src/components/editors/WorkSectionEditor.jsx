import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useResume } from '../../context/ResumeContext';

function BulletItem({ bullet, onChange, onDelete }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="bullet-item">
      <div className="bullet-dot" />
      {editing ? (
        <textarea
          className="bullet-textarea"
          value={bullet.text}
          autoFocus
          onChange={e => onChange({ ...bullet, text: e.target.value })}
          onBlur={() => setEditing(false)}
          rows={Math.max(2, Math.ceil(bullet.text.length / 80))}
        />
      ) : (
        <div
          className="bullet-text"
          onClick={() => setEditing(true)}
          style={{ cursor: 'text' }}
        >
          {bullet.text || <span style={{ color: 'var(--color-text-muted)' }}>Click to add text…</span>}
        </div>
      )}
      <div className="bullet-actions">
        <button className="btn btn-icon btn-ghost" title="Edit" onClick={() => setEditing(true)}>✏️</button>
        <button className="btn btn-icon btn-danger" title="Delete" onClick={onDelete}>🗑</button>
      </div>
    </div>
  );
}

function GroupEditor({ group, onUpdate, onDelete }) {
  const [collapsed, setCollapsed] = useState(false);

  const updateBullet = (idx, updated) => {
    const bullets = group.bullets.map((b, i) => i === idx ? updated : b);
    onUpdate({ ...group, bullets });
  };

  const deleteBullet = (idx) => {
    onUpdate({ ...group, bullets: group.bullets.filter((_, i) => i !== idx) });
  };

  const addBullet = () => {
    onUpdate({ ...group, bullets: [...(group.bullets || []), { id: uuidv4(), text: '' }] });
  };

  return (
    <div className="group-card fade-in">
      <div className="group-label">
        <span
          style={{ cursor: 'pointer', flex: 1 }}
          onClick={() => setCollapsed(c => !c)}
        >
          {collapsed ? '▶' : '▼'} {group.label || 'Group'}
        </span>
        <input
          className="form-input"
          style={{ fontSize: 12, padding: '3px 8px', maxWidth: 200 }}
          value={group.label || ''}
          onChange={e => onUpdate({ ...group, label: e.target.value })}
          placeholder="Group label"
        />
        <button className="btn btn-icon btn-danger btn-sm" title="Delete group" onClick={onDelete}>✕</button>
      </div>

      {!collapsed && (
        <>
          <div className="bullet-list">
            {(group.bullets || []).map((bullet, idx) => (
              <BulletItem
                key={bullet.id}
                bullet={bullet}
                onChange={updated => updateBullet(idx, updated)}
                onDelete={() => deleteBullet(idx)}
              />
            ))}
          </div>
          <button className="add-section-btn" style={{ marginTop: 8 }} onClick={addBullet}>
            + Add Bullet
          </button>
        </>
      )}
    </div>
  );
}

function JobEditor({ job, onUpdate, onDelete }) {
  const [collapsed, setCollapsed] = useState(false);

  const updateGroup = (idx, updated) => {
    onUpdate({ ...job, groups: job.groups.map((g, i) => i === idx ? updated : g) });
  };

  const deleteGroup = (idx) => {
    onUpdate({ ...job, groups: job.groups.filter((_, i) => i !== idx) });
  };

  const addGroup = () => {
    onUpdate({ ...job, groups: [...(job.groups || []), { id: uuidv4(), label: 'New Area', bullets: [] }] });
  };

  return (
    <div className="job-card fade-in">
      <div className="job-card-header" onClick={() => setCollapsed(c => !c)}>
        <span style={{ fontSize: 16 }}>💼</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{job.company || 'Company'}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {job.role} · {job.duration}
          </div>
        </div>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{collapsed ? '▶' : '▼'}</span>
        <button className="btn btn-icon btn-danger btn-sm" onClick={e => { e.stopPropagation(); onDelete(); }}>🗑</button>
      </div>

      {!collapsed && (
        <div className="job-card-body slide-down">
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="form-input" value={job.company || ''} onChange={e => onUpdate({ ...job, company: e.target.value })} placeholder="Company name" />
            </div>
            <div className="form-group">
              <label className="form-label">Role / Title</label>
              <input className="form-input" value={job.role || ''} onChange={e => onUpdate({ ...job, role: e.target.value })} placeholder="Your role" />
            </div>
            <div className="form-group">
              <label className="form-label">Duration</label>
              <input className="form-input" value={job.duration || ''} onChange={e => onUpdate({ ...job, duration: e.target.value })} placeholder="Jan 2020 – Present" />
            </div>
          </div>

          <div className="divider" />

          <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Achievement Groups
          </div>

          {(job.groups || []).map((group, idx) => (
            <GroupEditor
              key={group.id}
              group={group}
              onUpdate={updated => updateGroup(idx, updated)}
              onDelete={() => deleteGroup(idx)}
            />
          ))}

          <button className="add-section-btn" onClick={addGroup}>+ Add Achievement Group</button>
        </div>
      )}
    </div>
  );
}

export default function WorkSectionEditor({ sectionId }) {
  const { resume, updateResume } = useResume();
  const section = resume?.sections?.find(s => s.id === sectionId);

  if (!section) return null;

  const updateSection = (updater) => {
    updateResume(r => ({
      ...r,
      sections: r.sections.map(s => s.id === sectionId ? (typeof updater === 'function' ? updater(s) : updater) : s)
    }));
  };

  const updateJob = (idx, updated) => {
    updateSection(s => ({ ...s, jobs: s.jobs.map((j, i) => i === idx ? updated : j) }));
  };

  const deleteJob = (idx) => {
    updateSection(s => ({ ...s, jobs: s.jobs.filter((_, i) => i !== idx) }));
  };

  const addJob = () => {
    updateSection(s => ({
      ...s,
      jobs: [...(s.jobs || []), {
        id: uuidv4(), company: 'New Company', role: 'Your Role',
        duration: 'Month Year – Present', groups: []
      }]
    }));
  };

  return (
    <div className="fade-in">
      <div className="editor-section-title">{section.title}</div>
      <div className="editor-section-subtitle">Add jobs and achievement groups with bullet points.</div>

      <div className="form-group" style={{ marginBottom: 16 }}>
        <label className="form-label">Section Title</label>
        <input
          className="form-input"
          value={section.title}
          onChange={e => updateSection(s => ({ ...s, title: e.target.value }))}
        />
      </div>

      {(section.jobs || []).map((job, idx) => (
        <JobEditor
          key={job.id}
          job={job}
          sectionId={sectionId}
          onUpdate={updated => updateJob(idx, updated)}
          onDelete={() => deleteJob(idx)}
        />
      ))}

      <button className="add-section-btn" onClick={addJob}>+ Add Job</button>
    </div>
  );
}
