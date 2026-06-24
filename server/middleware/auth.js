const fs = require('fs');
const path = require('path');

const TOKENS_FILE = path.join(__dirname, '../data/access_tokens.json');

function loadTokens() {
  if (!fs.existsSync(TOKENS_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8')); } catch { return {}; }
}

/**
 * Express middleware: verifies Bearer token and attaches req.userId.
 * Returns 401 if missing/invalid, 403 if token expired.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const tokens = loadTokens();
  const record = tokens[token];

  if (!record) {
    return res.status(401).json({ error: 'Invalid access token' });
  }

  if (record.expiresAt && Date.now() > record.expiresAt) {
    // Clean up expired token
    delete tokens[token];
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
    return res.status(403).json({ error: 'Access token expired' });
  }

  req.userId = record.userId;
  next();
}

module.exports = { requireAuth };
