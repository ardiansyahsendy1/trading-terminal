import { execFileSync } from 'node:child_process';

const run = (command, args) => {
  try {
    return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};

const issuesJson = run('gh', ['issue', 'list', '--json', 'number,title,state', '--limit', '20']);
const issues = issuesJson ? JSON.parse(issuesJson) : [];
const log = run('git', ['log', '--oneline', '-5']);

console.log('# Maintainer Digest Draft\n');
console.log('## Issue Triage\n');
if (issues.length === 0) {
  console.log('- No open GitHub issues were available from the local environment.');
} else {
  for (const issue of issues) {
    console.log(`- #${issue.number} ${issue.title} (${issue.state})`);
  }
}

console.log('\n## Changelog Draft\n');
for (const line of log.split('\n').filter(Boolean)) {
  console.log(`- ${line}`);
}
