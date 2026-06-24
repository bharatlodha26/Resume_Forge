import { useResume } from '../context/ResumeContext';

export default function PdfPreview() {
  const { pdfUrl, compiling, compileError } = useResume();

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <span className="preview-title">📄 PDF Preview</span>
        <div className="spacer" />
        {pdfUrl && (
          <a href={pdfUrl} download="resume.pdf" className="btn btn-secondary btn-sm">
            ⬇ Download
          </a>
        )}
        {compiling && (
          <div className="compile-status">
            <div className="spinner" style={{ borderTopColor: 'var(--color-text-secondary)' }} />
            Compiling LaTeX…
          </div>
        )}
        {compileError && (
          <div className="compile-status error">
            ⚠ Compile error
          </div>
        )}
      </div>

      <div className="preview-iframe-wrap">
        {pdfUrl ? (
          <iframe
            key={pdfUrl}
            src={pdfUrl}
            title="Resume PDF"
          />
        ) : (
          <div className="preview-placeholder">
            <div className="ph-icon">📋</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              No preview yet
            </p>
            <p className="empty-text">
              {compileError
                ? `Error: ${compileError}`
                : 'Click "Generate PDF" to compile your resume'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
