import { useState } from 'react';
import { useResume } from '../context/ResumeContext';
import { v4 as uuidv4 } from 'uuid';

const SECTION_ICONS = {
  work: '💼',
  academic: '🎓',
  simple: '⭐'
};

export default function Sidebar({ selected, onSelect }) {
  const { resume, updateResume } = useResume();
  const [expanded, setExpanded] = useState({});

  if (!resume) return null;

  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const addSection = (type) => {
    const id = uuidv4();
    let newSection;
    if (type === 'work') {
      newSection = {
        id, type: 'work', title: 'NEW SECTION',
        jobs: []
      };
    } else if (type === 'academic') {
      newSection = {
        id, type: 'academic', title: 'ACADEMIC QUALIFICATIONS',
        rows: [], achievements: ''
      };
    } else {
      newSection = {
        id, type: 'simple', title: 'NEW SECTION',
        label: 'Achievements', bullets: []
      };
    }
    updateResume(r => ({ ...r, sections: [...r.sections, newSection] }));
    onSelect({ type: 'section', sectionId: id });
    setExpanded(p => ({ ...p, [id]: true }));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Resume Sections</div>
      </div>

      <div className="sidebar-scroll">
        {/* Header */}
        <div
          className={`sidebar-section-header ${selected?.type === 'header' ? 'active' : ''}`}
          onClick={() => onSelect({ type: 'header' })}
        >
          <span className="section-icon">👤</span>
          <span className="section-label">Personal Info</span>
        </div>

        {/* Sections */}
        {(resume.sections || []).map(section => (
          <div key={section.id} className="sidebar-section">
            <div
              className={`sidebar-section-header ${expanded[section.id] ? 'expanded' : ''} ${selected?.sectionId === section.id && !selected?.jobId ? 'active' : ''}`}
            >
              <span
                className="section-icon"
                style={{ cursor: 'pointer' }}
                onClick={() => toggleExpand(section.id)}
              >
                {SECTION_ICONS[section.type] || '📄'}
              </span>
              <span
                className="section-label"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelect({ type: 'section', sectionId: section.id })}
              >
                {section.title}
              </span>
              <span
                className="chevron"
                onClick={() => toggleExpand(section.id)}
                style={{ cursor: 'pointer' }}
              >
                ▶
              </span>
            </div>

            {expanded[section.id] && section.type === 'work' && (
              <div className="sidebar-sub-items slide-down">
                {(section.jobs || []).map(job => (
                  <div
                    key={job.id}
                    className={`sidebar-sub-item ${selected?.jobId === job.id ? 'active' : ''}`}
                    onClick={() => onSelect({ type: 'job', sectionId: section.id, jobId: job.id })}
                  >
                    💼 {job.company || 'Untitled'}
                  </div>
                ))}
                <button
                  className="add-section-btn"
                  style={{ marginTop: 4, fontSize: 12, padding: '5px 8px' }}
                  onClick={() => {
                    const jobId = uuidv4();
                    updateResume(r => ({
                      ...r,
                      sections: r.sections.map(s => s.id === section.id ? {
                        ...s,
                        jobs: [...(s.jobs || []), {
                          id: jobId, company: 'New Company',
                          role: 'Role', duration: 'Month Year – Present',
                          groups: []
                        }]
                      } : s)
                    }));
                    onSelect({ type: 'job', sectionId: section.id, jobId });
                  }}
                >
                  + Add Job
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add Section */}
        <div className="divider" style={{ margin: '12px 0' }} />
        <div style={{ padding: '0 4px' }}>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Add Section
          </p>
          <button className="add-section-btn" onClick={() => addSection('work')}>+ Work Experience</button>
          <button className="add-section-btn" onClick={() => addSection('academic')}>+ Academic</button>
          <button className="add-section-btn" onClick={() => addSection('simple')}>+ Extra Curriculars</button>
        </div>
      </div>
    </aside>
  );
}
