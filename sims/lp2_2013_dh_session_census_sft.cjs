"use strict";

/**
 * Director #1545: enumerate every preserved 2013 DH command/exchange in the
 * pinned neuroretransmit Cicada archive.
 *
 * The companion workflow checks out commit
 * ade9a02889ef8acbc8cde8edbfd0a785c369f4c3 as external-cicada.
 *
 * Run:
 *   node sims/lp2_2013_dh_session_census_sft.cjs external-cicada
 *
 * Node.js 22, CommonJS, standard library only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(process.argv[2] || "external-cicada");
assert.ok(fs.existsSync(root), "pinned external archive checkout missing");

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = walk(root).filter(full => {
  const rel = path.relative(root, full).replaceAll("\\", "/");
  return rel.startsWith("2013/") || /^irc-logs\/clientlog-.*\.txt$/u.test(rel);
});

/**
 * @param {string} line
 * @returns {string | null}
 */
function timestamp(line) {
  const iso = line.match(/^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d(?:\.\d+)?)/u);
  if (iso) return iso[1];
  const human = line.match(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+\w+\s+\d+\s+\d\d:\d\d:\d\d\s+\d{4}/u);
  return human ? human[0] : null;
}

const hits = [];
for (const full of files) {
  const stat = fs.statSync(full);
  if (stat.size > 35_000_000) continue;
  let text;
  try {
    text = fs.readFileSync(full, "latin1");
  } catch {
    continue;
  }
  const rel = path.relative(root, full).replaceAll("\\", "/");
  const lines = text.split(/\r?\n/u);
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/\bDH\s+(\d+)\b/iu);
    if (!match) continue;
    hits.push({
      path: rel,
      line: i + 1,
      timestamp: timestamp(lines[i]),
      modulus: Number(match[1]),
      command: lines[i].slice(0, 500),
      context: lines.slice(Math.max(0, i - 4), Math.min(lines.length, i + 12))
        .map((value, index) => ({
          line: Math.max(0, i - 4) + index + 1,
          text: value.slice(0, 700)
        }))
    });
  }
}

hits.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line);
console.log(JSON.stringify({
  archiveCommit: "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3",
  scannedFiles: files.length,
  dhCommandCount: hits.length,
  moduli: [...new Set(hits.map(hit => hit.modulus))].sort((a, b) => a - b),
  paths: [...new Set(hits.map(hit => hit.path))],
  hits
}, null, 2));
