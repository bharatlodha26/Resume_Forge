const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Ajv = require('ajv').default;
const addFormats = require('ajv-formats');

const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const DATA_DIR    = path.join(__dirname, '../data');
const RESUMES_DIR = path.join(DATA_DIR, 'resumes');

// AJV schema validator
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../schema/resume.schema.json'), 'utf8'));
const validate = ajv.compile(schema);

function resumeFile(userId) {
  return path.join(RESUMES_DIR, `${userId}.json`);
}

function loadResume(userId) {
  const file = resumeFile(userId);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveResume(userId, data) {
  fs.mkdirSync(RESUMES_DIR, { recursive: true });
  fs.writeFileSync(resumeFile(userId), JSON.stringify(data, null, 2));
}

// ── GET /api/resume/master ────────────────────────────────────────────────────
// Returns the authenticated user's master resume JSON.
router.get('/master', requireAuth, (req, res) => {
  const resume = loadResume(req.userId);
  if (!resume) return res.status(404).json({ error: 'No master resume found. Create one first.' });
  res.json(resume);
});

// ── PUT /api/resume/master ────────────────────────────────────────────────────
// Saves (replaces) the authenticated user's master resume.
// Validates against the JSON Schema before persisting.
router.put('/master', requireAuth, (req, res) => {
  const data = req.body;
  const valid = validate(data);
  if (!valid) {
    return res.status(400).json({
      error: 'Resume JSON does not match the required schema',
      details: validate.errors.map(e => `${e.instancePath} ${e.message}`.trim())
    });
  }
  saveResume(req.userId, data);
  res.json({ success: true });
});

// ── Legacy routes — keep for the React frontend ──────────────────────────────
// GET /api/resume  → same as master but falls back to default for frontend UX
router.get('/', requireAuth, (req, res) => {
  const resume = loadResume(req.userId) || getDefaultResume();
  res.json(resume);
});

// PUT /api/resume  → same as master (frontend auto-save)
router.put('/', requireAuth, (req, res) => {
  const data = req.body;
  // Soft validation only for the legacy frontend route (schema may still evolve)
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Invalid resume data' });
  }
  saveResume(req.userId, data);
  res.json({ success: true });
});

// ── GET /api/resume/class ─────────────────────────────────────────────────────
const CLASS_FILE = path.join(__dirname, '../templates/bharatresume.cls');

router.get('/class', (req, res) => {
  try {
    if (!fs.existsSync(CLASS_FILE)) return res.status(404).json({ error: 'bharatresume.cls not found' });
    res.json({ content: fs.readFileSync(CLASS_FILE, 'utf8') });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PUT /api/resume/class ─────────────────────────────────────────────────────
router.put('/class', requireAuth, (req, res) => {
  try {
    const { content } = req.body;
    if (content === undefined) return res.status(400).json({ error: 'No content provided' });
    fs.writeFileSync(CLASS_FILE, content, 'utf8');
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Default resume template ───────────────────────────────────────────────────
function getDefaultResume() {
  return {
    header: { name: 'Your Name', email: 'your.email@example.com', phone: '+91 00000 00000' },
    sections: [
      {
        id: uuidv4(), type: 'work', title: 'WORK EXPERIENCE',
        jobs: [{
          id: uuidv4(), company: 'Company Name', role: 'Your Role',
          duration: 'Jan 2020 – Present',
          groups: [{
            id: uuidv4(), label: 'Key Achievement Area',
            bullets: [
              { id: uuidv4(), text: 'Led a key initiative that delivered measurable results' },
              { id: uuidv4(), text: 'Built and scaled a product feature used by thousands' }
            ]
          }]
        }]
      },
      {
        id: uuidv4(), type: 'academic', title: 'ACADEMIC QUALIFICATIONS',
        rows: [{ id: uuidv4(), year: '2020', degree: 'B.Tech, Computer Science', institution: 'University Name' }],
        achievements: 'Academic achievements and scores here'
      },
      {
        id: uuidv4(), type: 'simple', title: 'EXTRA CURRICULARS',
        label: 'Achievements',
        bullets: [{ id: uuidv4(), text: 'Your extracurricular achievement here' }]
      }
    ]
  };
}

module.exports = router;
