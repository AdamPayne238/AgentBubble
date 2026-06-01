export const AUDIT_SECTION_NAMES = [
  'Declared Scope',
  'Expected Domains',
  'Forbidden Domains',
  'Risky Systems',
  'Acceptance Criteria'
];

export function parseCurrentTicket(content) {
  const warnings = [];
  const sections = Object.fromEntries(AUDIT_SECTION_NAMES.map((name) => [name, []]));
  const seen = new Set();
  const headingPattern = /^##\s+(.+?)\s*$/gm;
  const headings = [];
  let match;

  while ((match = headingPattern.exec(content)) !== null) {
    headings.push({
      name: match[1],
      start: match.index,
      contentStart: headingPattern.lastIndex
    });
  }

  for (const required of AUDIT_SECTION_NAMES) {
    const found = headings.filter((heading) => heading.name === required);
    if (found.length === 0) {
      warnings.push(`Missing section: ${required}`);
    } else if (found.length > 1) {
      warnings.push(`Duplicate section: ${required}`);
    }
  }

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    if (!AUDIT_SECTION_NAMES.includes(heading.name) || seen.has(heading.name)) continue;

    const nextHeading = headings[index + 1];
    const rawSection = content.slice(heading.contentStart, nextHeading?.start ?? content.length);
    sections[heading.name] = parseSectionItems(rawSection);
    seen.add(heading.name);
  }

  return { sections, warnings };
}

function parseSectionItems(rawSection) {
  return rawSection
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('<!--') && !line.endsWith('-->'))
    .map((line) => line.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean);
}
