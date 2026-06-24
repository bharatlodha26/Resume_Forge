import { useState } from 'react';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // OAuth params forwarded by ChatGPT via /api/auth/authorize redirect.
  // Parse once at mount time using a state initializer — avoids the setState-in-effect lint error.
  const [oauthParams] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const clientId    = p.get('client_id');
    const redirectUri = p.get('redirect_uri');
    const state       = p.get('state');
    return (clientId && redirectUri) ? { client_id: clientId, redirect_uri: redirectUri, state } : null;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === 'signup' && password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body = { email, password, ...oauthParams };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        return setError(data.error || 'Something went wrong. Please try again.');
      }

      if (data.redirectUrl) {
        // OAuth flow — redirect back to ChatGPT callback with the code
        window.location.href = data.redirectUrl;
      } else {
        // Direct access (testing without ChatGPT)
        const tokenRes = await fetch(`${API_BASE}/api/auth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            code: data.code,
            client_id: 'resumeforge-gpt',
            client_secret: 'change-me-in-prod'
          })
        });
        const tokenData = await tokenRes.json();
        if (tokenRes.ok && tokenData.access_token) {
          localStorage.setItem('token', tokenData.access_token);
          window.location.href = '/'; // redirect to main app
        } else {
          setError(tokenData.error || 'Failed to exchange token');
        }
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{
          width: 40, height: 40, background: 'var(--color-accent)',
          borderRadius: 8, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff'
        }}>R</div>
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          ResumeForge
        </span>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* OAuth context banner */}
        {oauthParams && (
          <div style={{
            padding: '10px 14px',
            background: 'var(--color-accent-soft)',
            border: '1px solid var(--color-accent)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            color: 'var(--color-text-primary)',
            marginBottom: 24
          }}>
            🔗 ChatGPT is requesting access to your ResumeForge account.
          </div>
        )}

        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6, color: 'var(--color-text-primary)' }}>
          {mode === 'login' ? 'Sign in to ResumeForge' : 'Create your account'}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
          {mode === 'login'
            ? 'Enter your credentials to continue.'
            : 'Create a free account to build your resume.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input
                id="login-confirm"
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
              />
            </div>
          )}

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(196,64,64,0.12)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              color: 'var(--color-danger)'
            }}>{error}</div>
          )}

          {success && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(45,158,107,0.12)',
              border: '1px solid var(--color-success)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              color: 'var(--color-success)'
            }}>{success}</div>
          )}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '11px', fontSize: 14 }}
          >
            {loading
              ? <><div className="spinner" style={{ width: 14, height: 14, marginRight: 8 }} /> Processing…</>
              : mode === 'login' ? 'Sign In' : 'Create Account'
            }
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--color-text-secondary)' }}>
          {mode === 'login' ? (
            <>No account? <button
              onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
              style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 600 }}
            >Sign up free</button></>
          ) : (
            <>Already have an account? <button
              onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
              style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 600 }}
            >Sign in</button></>
          )}
        </div>
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>
        Your resume data is stored securely and is never shared.
      </p>
    </div>
  );
}
