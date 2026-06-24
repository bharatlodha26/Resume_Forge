import { v4 as uuidv4 } from 'uuid';
import { useResume } from '../../context/ResumeContext';

export default function AcademicSectionEditor({ sectionId }) {
  const { resume, updateResume } = useResume();
  const section = resume?.sections?.find(s => s.id === sectionId);
  if (!section) return null;

  const updateSection = (updater) =>
    updateResume(r => ({
      ...r,
      sections: r.sections.map(s => s.id === sectionId ? (typeof updater === 'function' ? updater(s) : updater) : s)
    }));

  const updateRow = (idx, updated) =>
    updateSection(s => ({ ...s, rows: s.rows.map((r, i) => i === idx ? updated : r) }));

  const deleteRow = (idx) =>
    updateSection(s => ({ ...s, rows: s.rows.filter((_, i) => i !== idx) }));

  const addRow = () =>
    updateSection(s => ({
      ...s,
      rows: [...(s.rows || []), { id: uuidv4(), year: '', degree: '', institution: '' }]
    }));

  return (
    <div className="fade-in">
      <div className="editor-section-title">{section.title}</div>
      <div className="editor-section-subtitle">Degrees are shown in a 3-column table row.</div>

      <div className="form-group" style={{ marginBottom: 16 }}>
        <label className="form-label">Section Title</label>
        <input
          className="form-input"
          value={section.title}
          onChange={e => updateSection(s => ({ ...s, title: e.target.value }))}
        />
      </div>

      {(section.rows || []).map((row, idx) => (
        <div key={row.id} className="card fade-in">
          <div className="card-header">
            <div className="card-title">Degree {idx + 1}</div>
            <button className="btn btn-danger btn-sm" onClick={() => deleteRow(idx)}>Remove</button>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Year</label>
              <input className="form-input" value={row.year || ''} onChange={e => updateRow(idx, { ...row, year: e.target.value })} placeholder="2020" />
            </div>
            <div className="form-group">
              <label className="form-label">Degree / Program</label>
              <input className="form-input" value={row.degree || ''} onChange={e => updateRow(idx, { ...row, degree: e.target.value })} placeholder="B.Tech, Computer Science" />
            </div>
            <div className="form-group">
              <label className="form-label">Institution</label>
              <input className="form-input" value={row.institution || ''} onChange={e => updateRow(idx, { ...row, institution: e.target.value })} placeholder="University Name" />
            </div>
          </div>
        </div>
      ))}

      <button className="add-section-btn" onClick={addRow}>+ Add Degree</button>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="form-group">
          <label className="form-label">Achievements / Scores</label>
          <textarea
            className="form-textarea"
            value={section.achievements || ''}
            onChange={e => updateSection(s => ({ ...s, achievements: e.target.value }))}
            placeholder="CAT percentile, JEE rank, class scores..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
