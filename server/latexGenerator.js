/**
 * Converts a resume JSON object into a bharatresume LaTeX string.
 */
function escapeLatex(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/–/g, '--')
    .replace(/—/g, '---')
    .replace(/\|/g, '\\textbar\\ ')
    .replace(/"/g, '``')
    .replace(/"/g, "''")
    .replace(/'/g, '`')
    .replace(/'/g, "'");
}

function generateBullets(bullets) {
  if (!bullets || bullets.length === 0) return '';
  const items = bullets.map(b => `        \\item ${escapeLatex(b.text || b)}`).join('\n');
  return `    \\begin{resumebullets}\n${items}\n    \\end{resumebullets}`;
}

function generateWorkSection(section, isFirst) {
  const lines = [];
  // The first section's title is already output in the \endhead block, skip here
  if (!isFirst) {
    lines.push(`\\resumesection{${escapeLatex(section.title)}}`);
  }
  for (const job of section.jobs || []) {
    lines.push(`\\jobheading{${escapeLatex(job.company)}}{${escapeLatex(job.role)}}{${escapeLatex(job.duration)}}`);
    for (const group of job.groups || []) {
      const bulletsLatex = generateBullets(group.bullets);
      lines.push(`\\tworow{{${escapeLatex(group.label)}}}{`);
      lines.push(bulletsLatex);
      lines.push(`}`);
    }
  }
  return lines.join('\n');
}

function generateAcademicSection(section) {
  const lines = [`\\resumesection{${escapeLatex(section.title)}}`];
  for (const row of section.rows || []) {
    lines.push(`\\threerow{${escapeLatex(row.year)}}{\\textbf{${escapeLatex(row.degree)}}}{${escapeLatex(row.institution)}}`);
  }
  if (section.achievements) {
    lines.push(`\\tworow{Achievements}{${escapeLatex(section.achievements)}}`);
  }
  lines.push('\\hhline{--}');
  return lines.join('\n');
}

function generateSimpleSection(section) {
  const lines = [`\\resumesection{${escapeLatex(section.title)}}`];
  const bulletsLatex = generateBullets(section.bullets);
  lines.push(`\\tworow{${escapeLatex(section.label || 'Achievements')}}{`);
  lines.push(bulletsLatex);
  lines.push(`}`);
  lines.push('\\hhline{--}');
  return lines.join('\n');
}

function generateTexFile(resume) {
  const { header, sections } = resume;

  const contactLine = `Email: ${escapeLatex(header.email)} \\quad \\textbar \\quad Phone: ${escapeLatex(header.phone)}`;

  const sectionBlocks = [];
  for (let i = 0; i < (sections || []).length; i++) {
    const section = sections[i];
    const isFirst = i === 0;
    if (section.type === 'work') {
      sectionBlocks.push(generateWorkSection(section, isFirst));
    } else if (section.type === 'academic') {
      sectionBlocks.push(generateAcademicSection(section));
    } else if (section.type === 'simple') {
      sectionBlocks.push(generateSimpleSection(section));
    }
  }

  const firstSectionTitle = sections?.[0]?.title || 'WORK EXPERIENCE';

  return `\\documentclass{bharatresume}

\\begin{document}

% --- HEADER DETAILS ---
\\name{${escapeLatex(header.name)}}
\\contact{${contactLine}}
\\makeheader

% Resume table
\\resumetable

% --- TABLE HEADERS FOR MULTI-PAGE SUPPORT ---
\\resumesection{${escapeLatex(firstSectionTitle)}}
\\endhead

${sectionBlocks.join('\n\n')}

\\end{longtable}

\\end{document}
`;
}

module.exports = { generateTexFile };
