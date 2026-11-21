"use strict";

/**
 * Agent3 / Director #2028: byte-safe census of archived 2013/2014 IRC logs.
 *
 * Reads raw bytes and decodes as Latin-1 solely so ASCII protocol tokens
 * survive arbitrary legacy encodings. This is not a text normalization or
 * source correction. Run:
 *   node sims/lp2_2013_dh_irc_byte_census_sft.cjs external-cicada
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

const all = [];
for (const full of files) {
  const bytes = fs.readFileSync(full);
  // Latin-1 preserves ASCII bytes 1:1, including command names and integers.
  const lines = bytes.toString("latin1").split(/\r?\n/u);
  const dhLines = [];
  const diffieLines = [];
  const literal56013 = [];
  const protocolLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dh = [...line.matchAll(/\bDH\s+(\d+)\b/giu)].map(m => Number(m[1]));
    if (/\bDH\b/iu.test(line)) dhLines.push({ line: i + 1, moduli: dh, text: line.slice(0, 500) });
    if (/diffie[ -]?hellman/iu.test(line)) diffieLines.push({ line: i + 1, text: line.slice(0, 500) });
    if (/118818811|db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f/iu.test(line)) {
      literal56013.push({ line: i + 1, text: line.slice(0, 500) });
    }
    if (/\b(?:01 OK|03 DATA)\b/iu.test(line)) protocolLines.push({ line: i + 1, text: line.slice(0, 500) });
  }
  if (dhLines.length || diffieLines.length || literal56013.length) {
    const anchors = [...dhLines, ...diffieLines, ...literal56013].map(x => x.line);
    const selected = new Set();
    for (const n of anchors) {
      for (let j = Math.max(1, n - 3); j <= Math.min(lines.length, n + 5); j++) selected.add(j);
    }
    const context = [...selected].sort((a, b) => a - b)
      .map(n => ({ line: n, text: lines[n - 1].slice(0, 500) }));
    all.push({
      path: path.relative(root, full).replaceAll("\\", "/"),
      bytes: bytes.length,
      lines: lines.length,
      dhCommandLines: dhLines,
      diffieHellmanLines: diffieLines,
      literal56013Lines: literal56013,
      protocolResponseLineCount: protocolLines.length,
      contexts: context
    });
  }
}

const summary = {
  archive: "cicada-solvers/neuroretransmit-cicada",
  commit: "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3",
  scannedFiles: files.length,
  scannedBytes: files.reduce((n, f) => n + fs.statSync(f).size, 0),
  filesWithRelevantTokens: all.length,
  dhCommandCount: all.reduce((n, f) => n + f.dhCommandLines.length, 0),
  diffieHellmanMentionCount: all.reduce((n, f) => n + f.diffieHellmanLines.length, 0),
  literal56013MentionCount: all.reduce((n, f) => n + f.literal56013Lines.length, 0),
  results: all
};
console.log(JSON.stringify(summary, null, 2));
assert.ok(files.some(f => f.endsWith("#33012013.freenode.log")), "expected 2013 channel log missing");
assert.ok(files.some(f => f.endsWith("#cicada3301.freenode.log")), "expected Cicada channel log missing");
