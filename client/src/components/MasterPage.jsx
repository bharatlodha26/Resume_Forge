import { useState } from 'react';
import { useResume } from '../context/ResumeContext';
import Sidebar from './Sidebar';
import PdfPreview from './PdfPreview';
import HeaderEditor from './editors/HeaderEditor';
import WorkSectionEditor from './editors/WorkSectionEditor';
import AcademicSectionEditor from './editors/AcademicSectionEditor';
import SimpleSectionEditor from './editors/SimpleSectionEditor';

export default function MasterPage() {
  const { resume } = useResume();
  const [selected, setSelected] = useState({ type: 'header' });

  if (!resume) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--color-text-muted)' }}>
        <div className="spinner" style={{ borderTopColor: 'var(--color-text-muted)' }} />
        <span style={{ marginLeft: 12 }}>Loading resume data…</span>
      </div>
    );
  }

  function renderEditor() {
    if (selected.type === 'header') return <HeaderEditor />;
    if (selected.type === 'section' || selected.type === 'job') {
      const sectionId = selected.sectionId;
      const section = resume.sections?.find(s => s.id === sectionId);
      if (!section) return null;
      if (section.type === 'work') return <WorkSectionEditor sectionId={sectionId} />;
      if (section.type === 'academic') return <AcademicSectionEditor sectionId={sectionId} />;
      if (section.type === 'simple') return <SimpleSectionEditor sectionId={sectionId} />;
    }
    return (
      <div className="empty-state">
        <div className="empty-icon">👈</div>
        <p>Select a section from the sidebar to edit it.</p>
      </div>
    );
  }

  return (
    <>
      <Sidebar selected={selected} onSelect={setSelected} />
      <div className="main-content">
        <div className="editor-panel">
          {renderEditor()}
        </div>
        <PdfPreview />
      </div>
    </>
  );
}
