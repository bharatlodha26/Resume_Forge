const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ── File paths ──────────────────────────────────────────────────────────────
const DATA_DIR    = path.join(__dirname, '../data');
const USERS_FILE  = path.join(DATA_DIR, 'users.json');
const CODES_FILE  = path.join(DATA_DIR, 'oauth_codes.json');
const TOKENS_FILE = path.join(DATA_DIR, 'access_tokens.json');

// OAuth config — these would normally come from a registered client registry.
// For ChatGPT Actions there is exactly one "client" (ChatGPT itself).
const ALLOWED_CLIENTS = {
  'resumeforge-gpt': {
    clientSecret: process.env.OAUTH_CLIENT_SECRET || 'change-me-in-prod',
    redirectUris: [
      // ChatGPT callback URI (filled in when publishing the GPT Action)
      process.env.CHATGPT_REDIRECT_URI || 'https://chatgpt.com/aip/g-placeholder/oauth/callback',
      // Allow localhost for development testing
      'http://localhost:5173/oauth/callback'
    ]
  }
};

const CODE_TTL_MS  = 10 * 60 * 1000;  // 10 minutes
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ── Helpers ──────────────────────────────────────────────────────────────────
function loadJson(file, def) {
  if (!fs.existsSync(file)) return def;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return def; }
}
function saveJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
function loadUsers()  { return loadJson(USERS_FILE, []); }
function loadCodes()  { return loadJson(CODES_FILE, {}); }
function loadTokens() { return loadJson(TOKENS_FILE, {}); }

// ── GET /api/auth/authorize ──────────────────────────────────────────────────
// ChatGPT redirects the user here to start OAuth.
// We validate the parameters and forward the user to the frontend login page.
router.get('/authorize', (req, res) => {
  const { client_id, redirect_uri, state, response_type } = req.query;

  if (response_type !== 'code') {
    return res.status(400).json({ error: 'Only response_type=code is supported' });
  }

  const client = ALLOWED_CLIENTS[client_id];
  if (!client) {
    return res.status(400).json({ error: 'Unknown client_id' });
  }

  if (!client.redirectUris.includes(redirect_uri)) {
    return res.status(400).json({ error: 'redirect_uri not allowed for this client' });
  }

  // Forward to the React login page with all OAuth params preserved
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
  const loginUrl = new URL(`${frontendBase}/login`);
  loginUrl.searchParams.set('client_id', client_id);
  loginUrl.searchParams.set('redirect_uri', redirect_uri);
  loginUrl.searchParams.set('state', state || '');
  loginUrl.searchParams.set('response_type', response_type);

  res.redirect(loginUrl.toString());
});

// ── POST /api/auth/signup ────────────────────────────────────────────────────
// Creates a new user account and issues an authorization code.
router.post('/signup', async (req, res) => {
  const { email, password, client_id, redirect_uri, state } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const users = loadUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = uuidv4();
  users.push({ id: userId, email: email.toLowerCase(), passwordHash, createdAt: Date.now() });
  saveJson(USERS_FILE, users);

  // Ensure the user's resume file directory exists
  fs.mkdirSync(path.join(DATA_DIR, 'resumes'), { recursive: true });

  return issueCode(res, userId, client_id, redirect_uri, state);
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
// Verifies credentials and issues an authorization code.
router.post('/login', async (req, res) => {
  const { email, password, client_id, redirect_uri, state } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const users = loadUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  return issueCode(res, user.id, client_id, redirect_uri, state);
});

// ── POST /api/auth/token ─────────────────────────────────────────────────────
// ChatGPT exchanges the authorization code for an access token.
router.post('/token', (req, res) => {
  // Accept both JSON body and application/x-www-form-urlencoded (ChatGPT sends the latter)
  const grant_type    = req.body.grant_type;
  const code          = req.body.code;
  const client_id     = req.body.client_id;
  const client_secret = req.body.client_secret;
  const redirect_uri  = req.body.redirect_uri;

  if (grant_type !== 'authorization_code') {
    return res.status(400).json({ error: 'Only authorization_code grant is supported' });
  }

  const client = ALLOWED_CLIENTS[client_id];
  if (!client || client.clientSecret !== client_secret) {
    return res.status(401).json({ error: 'Invalid client credentials' });
  }

  const codes = loadCodes();
  const record = codes[code];

  if (!record) {
    return res.status(400).json({ error: 'Invalid or expired authorization code' });
  }
  if (Date.now() > record.expiresAt) {
    delete codes[code];
    saveJson(CODES_FILE, codes);
    return res.status(400).json({ error: 'Authorization code has expired' });
  }
  if (record.clientId && record.clientId !== client_id) {
    return res.status(400).json({ error: 'code/client mismatch' });
  }

  // Treat null/undefined/empty string as equivalent for redirect_uri
  const storedUri   = record.redirectUri   || '';
  const requestedUri = redirect_uri || '';
  if (storedUri !== requestedUri) {
    return res.status(400).json({ error: 'redirect_uri mismatch' });
  }

  // Consume the code (one-time use)
  const userId = record.userId;
  delete codes[code];
  saveJson(CODES_FILE, codes);

  // Issue access token
  const accessToken = uuidv4() + '-' + uuidv4(); // high entropy
  const tokens = loadTokens();
  tokens[accessToken] = {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + TOKEN_TTL_MS
  };
  saveJson(TOKENS_FILE, tokens);

  res.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: TOKEN_TTL_MS / 1000
  });
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
// Revokes the current access token.
router.post('/logout', (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    const tokens = loadTokens();
    delete tokens[token];
    saveJson(TOKENS_FILE, tokens);
  }
  res.json({ success: true });
});

// ── Helper: issue authorization code ────────────────────────────────────────
function issueCode(res, userId, client_id, redirect_uri, state) {
  const code = uuidv4();
  const codes = loadCodes();
  codes[code] = {
    userId,
    clientId: client_id,
    redirectUri: redirect_uri,
    expiresAt: Date.now() + CODE_TTL_MS
  };
  saveJson(CODES_FILE, codes);

  // If a redirect_uri was provided (OAuth flow), return it for the frontend to navigate to.
  // Otherwise (e.g. direct API test) return JSON.
  if (redirect_uri) {
    const callbackUrl = new URL(redirect_uri);
    callbackUrl.searchParams.set('code', code);
    if (state) callbackUrl.searchParams.set('state', state);
    return res.json({ redirectUrl: callbackUrl.toString() });
  }

  return res.json({ code });
}

module.exports = router;
