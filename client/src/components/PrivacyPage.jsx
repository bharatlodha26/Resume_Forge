import React from 'react';

export default function PrivacyPage() {
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
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '32px' }}>Last Updated: June 25, 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: '1.6' }}>
          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-accent)' }}>1. Introduction</h2>
            <p>Welcome to ResumeForge. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our web application or connect our services via our ChatGPT App integration.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-accent)' }}>2. Data We Collect</h2>
            <p>To provide our resume building and PDF compilation services, we collect the following information:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Account Credentials</strong>: Email address and a hashed password when you register.</li>
              <li><strong>Resume Content</strong>: Your contact details, work history, educational achievements, skills, and other text fields that you type or authorize ChatGPT to write into your resume.</li>
              <li><strong>Technical Metadata</strong>: Temporary compilation records (job IDs) when rendering PDF copies.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-accent)' }}>3. How We Use Your Data</h2>
            <p>We use your information solely to deliver and optimize our services:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>To persist and save your master resume so you can load it across sessions.</li>
              <li>To run our LaTeX compiler to generate PDF files from your resume JSON structure.</li>
              <li>To email compiled PDF copies of your resume directly to your inbox upon your command.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-accent)' }}>4. Third-Party Hosting and Processing</h2>
            <p>Our infrastructure relies on secure, reputable third-party processors to run the service:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Vercel</strong>: Hosts our frontend static assets.</li>
              <li><strong>Render</strong>: Deploys our backend server code and LaTeX compiler in a secure Docker container environment.</li>
              <li><strong>SMTP Providers</strong>: Delivers transactional emails containing your PDF resume to your mailbox.</li>
            </ul>
            <p style={{ marginTop: '12px' }}>We never sell, rent, or trade your resume data or contact details to third-party advertisers or recruitment companies.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-accent)' }}>5. Data Retention</h2>
            <p>We store your resume JSON data for as long as you keep your ResumeForge account open. You can edit or replace your master resume data at any time. Generated PDF files are compiled statelessly and are automatically pruned and deleted from our server directories within 24 hours of creation.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-accent)' }}>6. Contact Information</h2>
            <p>If you have any questions or concerns regarding this privacy policy or your data rights, please contact us at:</p>
            <p style={{ marginTop: '8px', fontWeight: 500 }}>Email: support@bharatlodha.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}
