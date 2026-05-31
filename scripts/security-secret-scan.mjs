import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname } from 'node:path';

const MAX_FILE_BYTES = 1_000_000;
const TEXT_EXTENSIONS = new Set([
  '',
  '.css',
  '.env',
  '.example',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.lock',
  '.md',
  '.mjs',
  '.ts',
  '.tsx',
  '.txt',
  '.yml',
  '.yaml',
]);

const SECRET_PATTERNS = [
  {
    name: 'OpenAI API key',
    pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    name: 'GitHub token',
    pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
  },
  {
    name: 'generic credential assignment',
    pattern: /\b(?:API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY)\s*[:=]\s*['"]?[A-Za-z0-9_./+=-]{24,}['"]?/g,
  },
];

const ALLOWED_MARKERS = [
  '<',
  '>',
  'example',
  'placeholder',
  'your_',
  'your-',
  'dummy',
  'test',
  'redacted',
  'xxxx',
];

const getCandidateFiles = () => {
  const output = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
    encoding: 'utf8',
  });

  return output
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter(Boolean);
};

const isTextCandidate = (file) => {
  if (!existsSync(file)) return false;
  if (statSync(file).size > MAX_FILE_BYTES) return false;

  const extension = extname(file).toLowerCase();
  return TEXT_EXTENSIONS.has(extension) || file.includes('.env');
};

const isAllowedMatch = (value) => {
  const normalized = value.toLowerCase();
  return ALLOWED_MARKERS.some((marker) => normalized.includes(marker));
};

const findings = [];

for (const file of getCandidateFiles()) {
  if (!isTextCandidate(file)) continue;

  const content = readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const { name, pattern } of SECRET_PATTERNS) {
    pattern.lastIndex = 0;

    for (const match of content.matchAll(pattern)) {
      const value = match[0];
      if (isAllowedMatch(value)) continue;

      const line = content.slice(0, match.index).split(/\r?\n/).length;
      const lineText = lines[line - 1]?.trim() ?? '';

      findings.push({
        file,
        line,
        name,
        evidence: lineText.replace(value, '[REDACTED]'),
      });
    }
  }
}

if (findings.length > 0) {
  console.error('Potential committed secrets detected:');

  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} ${finding.name}`);
    console.error(`  ${finding.evidence}`);
  }

  process.exit(1);
}

console.log('No committed secrets detected.');
