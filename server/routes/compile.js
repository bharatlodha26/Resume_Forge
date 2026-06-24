const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { generateTexFile } = require('../latexGenerator');

const router = express.Router();

const LATEX_DIR     = path.join(__dirname, '../latex');
const TEMPLATES_DIR = path.join(__dirname, '../templates');

// Determine the absolute path to pdflatex.
// Checks well-known locations before falling back to PATH.
function findPdflatex() {
  const candidates = [
    'C:\\Users\\Bharat Lodha\\AppData\\Local\\Programs\\MiKTeX\\miktex\\bin\\x64\\pdflatex.exe',
    '/usr/bin/pdflatex',
    '/usr/local/bin/pdflatex',
    'pdflatex'
  ];
  for (const c of candidates) {
    if (c === 'pdflatex') return c;
    if (fs.existsSync(c)) return c;
  }
  return 'pdflatex';
}

/**
 * POST /api/compile  (legacy — used by the React frontend)
 * POST /api/resume/generate-pdf  (new stateless ChatGPT endpoint)
 *
 * Both accept: { resume: <ResumeJSON>, template?: "executive" }
 * Returns:    { success, pdfUrl, jobId }
 *
 * Fully stateless — no user ID required, no resume is stored.
 * The caller supplies the full resume JSON; we compile and return a URL.
 * PDFs are auto-deleted after 24 h (old directories pruned on each call).
 */
function compilePdf(req, res) {
  // Accept either `resume` (legacy) or `resume_json` (new ChatGPT schema)
  const resume = req.body.resume || req.body.resume_json;
  if (!resume) return res.status(400).json({ error: 'No resume data provided' });

  const template = req.body.template || 'executive';
  const clsName  = template === 'executive' ? 'bharatresume.cls' : `${template}.cls`;
  const clsSrc   = path.join(TEMPLATES_DIR, clsName);

  if (!fs.existsSync(clsSrc)) {
    return res.status(400).json({ error: `Template not found: ${clsName}` });
  }

  const jobId  = uuidv4();
  const jobDir = path.join(LATEX_DIR, jobId);
  fs.mkdirSync(jobDir, { recursive: true });

  try {
    const texContent = generateTexFile(resume);
    const texPath    = path.join(jobDir, 'main.tex');
    fs.writeFileSync(texPath, texContent);
    fs.copyFileSync(clsSrc, path.join(jobDir, clsName));

    // Also copy as bharatresume.cls if needed (tex file references this name)
    if (clsName !== 'bharatresume.cls') {
      fs.copyFileSync(clsSrc, path.join(jobDir, 'bharatresume.cls'));
    }

    const pdflatex = findPdflatex();
    const cmd = `"${pdflatex}" -interaction=nonstopmode -output-directory="${jobDir}" "${texPath}"`;

    // Two pdflatex passes for longtable headers
    exec(cmd, { timeout: 30000 }, () => {
      exec(cmd, { timeout: 30000 }, () => {
        const pdfPath = path.join(jobDir, 'main.pdf');

        if (fs.existsSync(pdfPath)) {
          res.json({
            success: true,
            pdfUrl: `/pdf/${jobId}/main.pdf`,
            jobId
          });
        } else {
          const logPath = path.join(jobDir, 'main.log');
          const log = fs.existsSync(logPath)
            ? fs.readFileSync(logPath, 'utf8').slice(-3000)
            : 'No log available';
          res.status(500).json({ error: 'PDF compilation failed', log, texContent });
        }

        // Prune: keep only the 20 most recent job directories
        try {
          const dirs = fs.readdirSync(LATEX_DIR)
            .map(d => ({ name: d, time: fs.statSync(path.join(LATEX_DIR, d)).mtimeMs }))
            .sort((a, b) => b.time - a.time);
          dirs.slice(20).forEach(d =>
            fs.rmSync(path.join(LATEX_DIR, d.name), { recursive: true, force: true })
          );
        } catch (_) {}
      });
    });

  } catch (err) {
    fs.rmSync(jobDir, { recursive: true, force: true });
    res.status(500).json({ error: err.message });
  }
}

// Both the legacy path and the new ChatGPT path use the same handler
router.post('/', compilePdf);

module.exports = router;
module.exports.compilePdf = compilePdf;
