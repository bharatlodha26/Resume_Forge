import React, { useState } from 'react';

export default function SupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleGoBack = () => {
    window.location.href = '/';
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    // Simulate sending support email or redirecting to mailto
    const mailtoUrl = `mailto:support@bharatlodha.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoUrl;
    setSent(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      color: 'var(--color-text-primary)',
      padding: '40px 24px',
      overflowY: 'auto'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={handleGoBack}>
            <div style={{
              width: 32, height: 32, background: 'var(--color-accent)',
              borderRadius: 6, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff'
            }}>R</div>
            <span style={{ fontSize: 18, fontWeight: 700 }}>ResumeForge</span>
          </div>
          <button 
            onClick={handleGoBack}
            style={{
              padding: '8px 16px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 13
            }}
          >
            ← Back to App
          </button>
        </div>

        {/* Content */}
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Customer Support</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '32px' }}>Need help? Browse FAQs or send us an email.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* FAQ */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-accent)' }}>Frequently Asked Questions</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>How do I download my compiled PDF?</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Click the "Compile PDF" button in the right sidebar. Once compiled, a PDF preview will show, and a direct download URL will be generated.</p>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Can I sync my changes with ChatGPT?</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Yes! If you install the ResumeForge ChatGPT App, you can ask ChatGPT to "load my master resume" to read your current data, or ask it to "save this tailored resume" to update your master copy.</p>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>How do I change my resume template?</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Go to the settings panel in the frontend application or instruct ChatGPT to use a specific template (e.g. 'executive') during compilation.</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-accent)' }}>Contact Support</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Email support directly at <a href="mailto:support@bharatlodha.com" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}>support@bharatlodha.com</a> or use the form below to draft an email.
            </p>

            <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  className="form-input"
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="How can we help you?"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message Details</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '120px', resize: 'vertical', fontFamily: 'inherit' }}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your question or issue in detail..."
                  required
                />
              </div>

              <button
                className="btn btn-primary"
                type="submit"
                style={{ width: '100%', padding: '11px', fontSize: '13px' }}
              >
                Draft Support Email
              </button>

              {sent && (
                <p style={{ color: 'var(--color-success)', fontSize: '13px', textAlign: 'center' }}>
                  Opened your mail client! If it didn't open, email directly.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
