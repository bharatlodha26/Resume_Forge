import { useResume } from '../../context/ResumeContext';

export default function HeaderEditor() {
  const { resume, updateResume } = useResume();
  if (!resume) return null;
  const { header } = resume;

  const update = (key, value) =>
    updateResume(r => ({ ...r, header: { ...r.header, [key]: value } }));

  return (
    <div className="fade-in">
      <div className="editor-section-title">Personal Information</div>
      <div className="editor-section-subtitle">This appears at the top of your resume.</div>

      <div className="card">
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            value={header.name || ''}
            onChange={e => update('name', e.target.value)}
            placeholder="Your Name"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={header.email || ''}
              onChange={e => update('email', e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              value={header.phone || ''}
              onChange={e => update('phone', e.target.value)}
              placeholder="+91 00000 00000"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
