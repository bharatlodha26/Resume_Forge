const express = require('express');
const https = require('https');

const router = express.Router();

router.post('/', async (req, res) => {
  const { resume, jd, apiKey } = req.body;

  if (!jd) return res.status(400).json({ error: 'Job description required' });
  if (!resume) return res.status(400).json({ error: 'Resume data required' });

  // Collect all bullets with their IDs
  const allBullets = [];
  for (const section of resume.sections || []) {
    if (section.type === 'work') {
      for (const job of section.jobs || []) {
        for (const group of job.groups || []) {
          for (const bullet of group.bullets || []) {
            allBullets.push({
              id: bullet.id,
              context: `${job.company} | ${job.role} | ${group.label}`,
              text: bullet.text
            });
          }
        }
      }
    } else if (section.type === 'simple') {
      for (const bullet of section.bullets || []) {
        allBullets.push({
          id: bullet.id,
          context: `${section.title}`,
          text: bullet.text || bullet
        });
      }
    }
  }

  const bulletList = allBullets.map((b, i) => 
    `[${b.id}] (${b.context}): ${b.text}`
  ).join('\n');

  const prompt = `You are an expert resume writer helping tailor a resume for a specific job description.

Here is a list of resume bullet points (each with a unique ID):
${bulletList}

Here is the job description:
${jd}

Task: Select the most relevant bullet points for this job description. Return ONLY a JSON array of the selected bullet IDs (the strings in square brackets). Select 8-15 bullets that best match the JD requirements. Prioritize impact, relevance to the role, and quantified achievements.

Response format (JSON only, no explanation):
{"selected": ["id1", "id2", "id3", ...]}`;

  const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
  
  if (!geminiApiKey) {
    // Return demo selection (first 10 bullets) if no API key
    const demoSelected = allBullets.slice(0, 10).map(b => b.id);
    return res.json({ selected: demoSelected, demo: true });
  }

  // Call Gemini API
  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody)
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.error) {
          return res.status(apiRes.statusCode || 500).json({
            error: response.error.message || 'Gemini API Error',
            details: response.error
          });
        }
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          res.json({ selected: parsed.selected || [] });
        } else {
          res.status(500).json({ error: 'Could not parse Gemini response', raw: text });
        }
      } catch (err) {
        res.status(500).json({ error: 'Failed to parse response', raw: data });
      }
    });
  });

  apiReq.on('error', err => res.status(500).json({ error: err.message }));
  apiReq.write(requestBody);
  apiReq.end();
});

module.exports = router;
