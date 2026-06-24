const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const TEMPLATES_DIR = path.join(__dirname, '../templates');

// ── GET /api/resume/templates ─────────────────────────────────────────────────
// Returns metadata about available LaTeX resume templates.
router.get('/', (req, res) => {
  const templates = [
    {
      id: 'executive',
      name: 'Executive',
      description: 'Clean two-column Garamond layout with dark red accents. Best for senior roles.',
      preview: null,
      clsFile: 'bharatresume.cls',
      isDefault: true
    }
  ];

  // Dynamically check which .cls files exist in the templates directory
  try {
    const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.cls'));
    const knownIds = templates.map(t => t.clsFile);
    for (const file of files) {
      if (!knownIds.includes(file)) {
        templates.push({
          id: path.basename(file, '.cls'),
          name: path.basename(file, '.cls'),
          description: 'Custom template',
          preview: null,
          clsFile: file,
          isDefault: false
        });
      }
    }
  } catch (_) {}

  res.json({ templates });
});

module.exports = router;
