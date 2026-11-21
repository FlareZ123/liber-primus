"use strict";

/**
 * Agent3 / Director #2028: byte-safe census of archived IRC logs.
 * Raw bytes are decoded as Latin-1 only to preserve ASCII protocol tokens.
 * Run: node sims/lp2_2013_dh_irc_byte_census_sft.cjs external-cicada
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(process.argv[2] || "external-cicada");
const logDir = path.join(root, "irc-logs");
assert.ok(fs.existsSync(logDir), "pinned external archive IRC log directory missing");

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = walk(logDir)
  .filter(full => /\.(?:log|txt)$/iu.test(full))
  .sort((a, b) => a.localeCompare(b));

const results = [];
for (const full of files) {
  const bytes = fs.readFileSync(full);
  // ASCII protocol tokens survive byte-preserving Latin-1 regardless of the
  // original legacy encoding; no UTF-8 replacement or normalization occurs.
  const lines = bytes.toString("latin1").split(/\r?\n/u);
  const anchors = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const commands = [...line.matchAll(/\bDH\s+(\d+)\b/giu)].map(m => Number(m[1]));
    const diffie = /diffie[ -]?hellman/iu.test(line);
    const special = /118818811|db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f/iu.test(line);
    if (commands.length || diffie || special) {
      anchors.push({ line: i + 1, commands, diffie, special, text: line.slice(0, 500) });
    }
  }
  if (!anchors.length) continue;
  const selected = new Set();
  for (const hit of anchors) {
    for (let j = Math.max(1, hit.line - 3); j <= Math.min(lines.length, hit.line + 5); j++) selected.add(j);
  }
  results.push({
    path: path.relative(root, full).replaceAll("\\", "/"),
    bytes: bytes.length,
    lines: lines.length,
    anchors,
    context: [...selected].sort((a, b) => a - b)
      .map(n => ({ line: n, text: lines[n - 1].slice(0, 500) }))
  });
}

const summary = {
  archive: "cicada-solvers/neuroretransmit-cicada",
  commit: "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3",
  scannedFiles: files.length,
  scannedBytes: files.reduce((n, f) => n + fs.statSync(f).size, 0),
  filesWithProtocolOrExactValueAnchors: results.length,
  dhCommandCount: results.reduce((n, f) => n + f.anchors.reduce((m, a) => m + a.commands.length, 0), 0),
  diffieHellmanMentionCount: results.reduce((n, f) => n + f.anchors.filter(a => a.diffie).length, 0),
  exact56013NumberOrHashMentions: results.reduce((n, f) => n + f.anchors.filter(a => a.special).length, 0),
  results
};
console.log(JSON.stringify(summary, null, 2));
assert.ok(files.some(f => f.endsWith("#33012013.freenode.log")), "expected 2013 channel log missing");
assert.ok(files.some(f => f.endsWith("#cicada3301.freenode.log")), "expected Cicada channel log missing");
