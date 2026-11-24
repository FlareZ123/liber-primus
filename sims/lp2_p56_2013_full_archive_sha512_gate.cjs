'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = process.env.CICADA_ARCHIVE_ROOT || '/tmp/cicada';
const archiveRoot = path.join(root, '2013');
const target = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const pinnedCommit = 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

const files = walk(archiveRoot);
const rows = [];
const unique = new Map();
let totalBytes = 0;
for (const file of files) {
  const bytes = fs.readFileSync(file);
  totalBytes += bytes.length;
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  const sha512 = crypto.createHash('sha512').update(bytes).digest('hex');
  if (!unique.has(sha256)) unique.set(sha256, []);
  unique.get(sha256).push(path.relative(root, file).split(path.sep).join('/'));
  rows.push({
    path: path.relative(root, file).split(path.sep).join('/'),
    bytes: bytes.length,
    sha256,
    sha512,
    matches_p56_target: sha512 === target
  });
}

const matches = rows.filter((row) => row.matches_p56_target);
const duplicateGroups = [...unique.values()].filter((group) => group.length > 1);
if (files.length !== 129 || totalBytes !== 25160267) {
  throw new Error('Pinned 2013 archive inventory changed: ' + files.length + ' files, ' + totalBytes + ' bytes');
}
const result = {
  target_sha512: target,
  external_repository: 'neuroretransmit/cicada',
  pinned_commit: pinnedCommit,
  scope: 'every regular file under 2013/ at the pinned source commit',
  file_count: files.length,
  total_bytes: totalBytes,
  unique_byte_contents: unique.size,
  duplicate_groups: duplicateGroups,
  sha512_match_count: matches.length,
  sha512_matches: matches,
  html_page_candidates: rows.filter((row) => /\.html?$/i.test(row.path)),
  pgp_candidates: rows.filter((row) => /\.(asc|sig)$/i.test(row.path))
};
console.log(JSON.stringify(result, null, 2));
console.log('SUMMARY ' + JSON.stringify({
  file_count: files.length,
  total_bytes: totalBytes,
  unique_byte_contents: unique.size,
  sha512_match_count: matches.length,
  matching_paths: matches.map((row) => row.path)
}));
