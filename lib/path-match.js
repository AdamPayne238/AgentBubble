export function normalizeRelativePath(value) {
  return value
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/^[.][/\\]/, '')
    .replaceAll('\\', '/')
    .replace(/\/+/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
}

export function matchesPattern(filePath, pattern) {
  const normalizedFile = normalizeRelativePath(filePath);
  const normalizedPattern = normalizeRelativePath(pattern);

  if (!normalizedFile || !normalizedPattern) return false;

  if (hasGlob(normalizedPattern)) {
    return globToRegExp(normalizedPattern).test(normalizedFile);
  }

  if (normalizedFile === normalizedPattern) return true;
  if (normalizedFile.startsWith(`${normalizedPattern}/`)) return true;
  return normalizedFile.includes(`/${normalizedPattern}/`);
}

export function matchesAnyPattern(filePath, patterns) {
  return patterns.some((pattern) => matchesPattern(filePath, pattern));
}

function hasGlob(pattern) {
  return pattern.includes('*') || pattern.includes('?');
}

function globToRegExp(pattern) {
  let source = '^';
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    const next = pattern[index + 1];

    if (char === '*' && next === '*') {
      if (pattern[index + 2] === '/') {
        source += '(?:.*/)?';
        index += 2;
      } else {
        source += '.*';
        index += 1;
      }
    } else if (char === '*') {
      source += '[^/]*';
    } else if (char === '?') {
      source += '[^/]';
    } else {
      source += escapeRegExp(char);
    }
  }

  source += '$';
  return new RegExp(source);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
