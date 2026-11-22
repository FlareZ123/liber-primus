'use strict';

/**
 * Director #1536: pinned 2013 DH3301 client-witness census.
 *
 * The workflow checks out cicada-solvers/neuroretransmit-cicada at the pinned
 * historical archive commit into external-cicada. This script reads only 2013
 * stage material plus original IRC/client logs and reports every exact DH3301
 * / known-share occurrence and any plausible client implementation.
 *
 * Run in CI from repository root:
 *   node sims/lp2_2013_dh3301_client_witness_census_sft.cjs external-cicada
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'external-cicada');
assert.ok(fs.existsSync(root), 'external archive checkout missing');

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    if (entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = walk(root).filter((full) => {
  const rel = path.relative(root, full).replaceAll('\\','/');
  return rel.startsWith('2013/') || rel.startsWith('irc-logs/');
});

const exact = /(?:DH\s+3301|\b2800\b|\b3034\b|\b1067\b|\b2757\b|\b1264\b)/i;
const clientCode = /(?:connect\s*\(|create_connection|socket\.socket|socket\.create_connection|Twisted.*Client|ClientFactory)/i;
const dhCode = /(?:\bDH\b|diffie|base29|pow\s*\()/i;
const matchRows = [];
const clientCandidates = [];

for (const full of files) {
  const stat = fs.statSync(full);
  if (stat.size > 35_000_000) continue;
  let text;
  try {
    text = fs.readFileSync(full, 'latin1');
  } catch {
    continue;
  }
  const rel = path.relative(root, full).replaceAll('\\','/');
  if (clientCode.test(text) && dhCode.test(text)) clientCandidates.push(rel);
  const lines = text.split(/\r?\n/);
  for (let i=0;i<lines.length;i++) {
    if (!exact.test(lines[i])) continue;
    matchRows.push({
      path:rel,
      line:i+1,
      text:lines[i].slice(0,700),
      before:lines.slice(Math.max(0,i-2),i).map(x=>x.slice(0,500)),
      after:lines.slice(i+1,Math.min(lines.length,i+3)).map(x=>x.slice(0,500))
    });
  }
}

const dh3301 = matchRows.filter(r=>/DH\s+3301/i.test(r.text));
const share2800 = matchRows.filter(r=>/\b2800\b/.test(r.text));
const share3034 = matchRows.filter(r=>/\b3034\b/.test(r.text));

assert.ok(dh3301.length > 0, 'expected historical DH3301 witness missing');
assert.ok(share2800.length > 0, 'expected 2800 witness missing');
assert.ok(share3034.length > 0, 'expected 3034 witness missing');

console.log(JSON.stringify({
  archiveRoot:path.basename(root),
  scannedFiles:files.length,
  exactMatchRows:matchRows.length,
  dh3301Rows:dh3301.length,
  share2800Rows:share2800.length,
  share3034Rows:share3034.length,
  clientImplementationCandidates:clientCandidates
},null,2));
for (const row of matchRows) console.log('MATCH '+JSON.stringify(row));
