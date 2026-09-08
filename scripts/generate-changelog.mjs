#!/usr/bin/env node
// Writes public/changelog.json from the git log, for the Behind the Scenes
// page to fetch.
//
// Generated rather than committed: a changelog file in the repo would need a
// commit of its own for every commit it describes, which is both noise and a
// deploy loop waiting to happen. The deploy workflow runs this before the
// build (with a full-history checkout — a shallow one would silently produce
// a three-entry changelog).
//
// Safe to run locally: `npm run changelog`.

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const OUT = 'public/changelog.json';
const MAX_ENTRIES = 300;

// Unit separator between fields, record separator between commits: commit
// subjects contain commas, pipes, quotes and emoji, so any printable
// delimiter would eventually split one in half.
const FIELD = '';
const RECORD = '';

const git = (args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });

let raw;
try {
  raw = git([
    'log',
    `--max-count=${MAX_ENTRIES}`,
    `--pretty=format:%h${FIELD}%aI${FIELD}%s${FIELD}%an${RECORD}`,
  ]);
} catch (error) {
  // No git history (a tarball export, say). An empty changelog is a fine
  // outcome; failing the build over it is not.
  console.warn(`changelog: no git history available (${error.message}) — writing an empty file`);
  raw = '';
}

const commits = raw
  .split(RECORD)
  .map((entry) => entry.trim())
  .filter(Boolean)
  .map((entry) => {
    const [sha, date, subject, author] = entry.split(FIELD);
    return { sha, date, subject, author };
  })
  .filter((c) => c.sha && c.date && c.subject);

let totalCommits = commits.length;
try {
  totalCommits = Number(git(['rev-list', '--count', 'HEAD']).trim()) || commits.length;
} catch {
  // Keep the page-visible count consistent with what we actually listed.
}

const payload = {
  generatedAt: new Date().toISOString(),
  totalCommits,
  firstListedAt: commits.at(-1)?.date ?? null,
  commits,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`changelog: wrote ${commits.length} of ${totalCommits} commits to ${OUT}`);
