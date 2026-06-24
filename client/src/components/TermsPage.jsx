import React from 'react';

export default function TermsPage() {
  const handleGoBack = () => {
    window.location.href = '/';
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
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Terms of Service</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '32px' }}>Last Updated: June 25, 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: '1.6' }}>
          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-accent)' }}>1. Agreement to Terms</h2>
            <p>By registering a ResumeForge account or connecting our app via the ChatGPT App Store integration, you agree to comply with and be bound by these Terms of Service. If you do not agree to all of these terms, you must not use or access our service.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-accent)' }}>2. User Accounts</h2>
            <p>To use our services, you must register an account using a valid email address and password. You are solely responsible for protecting your password, keeping your credentials secure, and managing all activities that occur under your account.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-accent)' }}>3. Service Availability and Compilation</h2>
            <p>ResumeForge compiles resume details into PDFs using LaTeX engines running on Render servers. We strive to maintain stable compiler operation; however:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>We do not guarantee that LaTeX compilation will succeed for malformed or customized LaTeX structures.</li>
              <li>We prune and delete generated PDF files from our server within 24 hours to conserve storage. You must download and save your PDFs locally.</li>
              <li>We reserve the right to modify, suspend, or terminate the service (or any part thereof) at any time without notice.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-accent)' }}>4. Ownership and Licensing</h2>
            <p>You retain full ownership, intellectual property rights, and copyright over all text, resume data, and content you write into our platform or instruct ChatGPT to compile. ResumeForge does not claim any ownership rights over your resumes.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-accent)' }}>5. Limitations of Liability</h2>
            <p>RESUMEFORGE AND ITS CREATORS ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE ARE NOT LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES (INCLUDING LOSS OF DATA, JOBS, OPPORTUNITIES, OR INTERVIEWS) ARISING OUT OF YOUR USE OF OR INABILITY TO USE THE SERVICE.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-accent)' }}>6. Contact Us</h2>
            <p>If you have any questions, disputes, or feedback concerning these Terms of Service, please contact us at:</p>
            <p style={{ marginTop: '8px', fontWeight: 500 }}>Email: support@bharatlodha.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}
