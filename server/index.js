const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const resumeRouter    = require('./routes/resume');
const compileRouter   = require('./routes/compile');
const tailorRouter    = require('./routes/tailor');
const authRouter      = require('./routes/auth');
const emailRouter     = require('./routes/email');
const templatesRouter = require('./routes/templates');

const { compilePdf } = require('./routes/compile');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── CORS ─────────────────────────────────────────────────────────────────────
// Allow the React dev server and ChatGPT to reach this API.
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3001',
  'https://chatgpt.com',
  'https://chat.openai.com'
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Parse both JSON and URL-encoded bodies (ChatGPT token exchange uses form-encoding)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static: serve compiled PDFs ───────────────────────────────────────────────
const latexDir = path.join(__dirname, 'latex');
if (!fs.existsSync(latexDir)) fs.mkdirSync(latexDir, { recursive: true });
app.use('/pdf', express.static(latexDir));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',               authRouter);
app.use('/api/resume',             resumeRouter);
app.use('/api/compile',            compileRouter);   // legacy (React frontend)
app.use('/api/resume/generate-pdf', (req, res) => compilePdf(req, res)); // ChatGPT endpoint
app.use('/api/resume/email',       emailRouter);
app.use('/api/resume/templates',   templatesRouter);
app.use('/api/tailor',             tailorRouter);

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '2.0.0' }));

// ── OpenAPI spec (for ChatGPT Action setup) ───────────────────────────────────
const openApiPath = path.join(__dirname, 'openapi.json');
app.get('/openapi.json', (req, res) => {
  if (fs.existsSync(openApiPath)) {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(openApiPath);
  } else {
    res.status(404).json({ error: 'OpenAPI spec not found' });
  }
});

app.listen(PORT, () => {
  console.log(`ResumeForge API v2.0 running on http://localhost:${PORT}`);
  console.log(`  → Health:    http://localhost:${PORT}/api/health`);
  console.log(`  → OpenAPI:   http://localhost:${PORT}/openapi.json`);
  console.log(`  → OAuth:     http://localhost:${PORT}/api/auth/authorize`);
});
