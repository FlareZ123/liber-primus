'use strict';

/**
 * Original-source first-occurrence / repeated-token partition gate.
 * Run with Node.js 22 from any current working directory.
 * Read-only: uses canonical repository files and no external packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const loadText = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const grid = JSON.parse(loadText('resources/liber-primus/lp2-grid-256.json'));
const corpus = JSON.parse(loadText('resources/liber-primus/lp2-corpus.json'));
const master = loadText('resources/transcriptions/liber_primus_master.txt');
const alphabet = new Set(corpus.runes);
const pages = master.split(/\r?\n\r?\n/).slice(1).join('\n\n').split('%').slice(15);
const originalRunes = (page) => [...pages[page]].filter((c) => alphabet.has(c));
const tokens = grid.pages.flatMap((page) => page.tokens);

assert.equal(tokens.length, 256, 'Original source must have 256 printed numeral pairs');
assert.equal(originalRunes(55).length, 76, 'Original p55 must have 76 rune symbols');
assert.equal(originalRunes(56).length, 85, 'Original p56 must have 85 rune symbols');
const knownP57 = originalRunes(57);
assert.equal(knownP57.length, 95, 'Original clear PARABLE must have 95 rune symbols');

const seen = new Set();
const repeatedTokens = [];
for (const token of tokens) {
  if (seen.has(token)) repeatedTokens.push(token);
  else seen.add(token);
}
assert.equal(seen.size, 161);
assert.equal(repeatedTokens.length, 95);

/**
 * Minimum number of rune positions to change so every same-token occurrence
 * can have one arbitrary fixed output rune, regardless of the selected map.
 * @param {string[]} carrierTokens
 * @param {string[]} outputs
 * @returns {{minimumChanges:number, conflictingClasses:number, classSizes:Record<string,number>, classes:number}}
 */
function minimumCorrections(carrierTokens, outputs) {
  assert.equal(carrierTokens.length, outputs.length);
  const classes = new Map();
  for (let i = 0; i < carrierTokens.length; i++) {
    const token = carrierTokens[i];
    if (!classes.has(token)) classes.set(token, new Map());
    const counts = classes.get(token);
    counts.set(outputs[i], (counts.get(outputs[i]) || 0) + 1);
  }

  let minimumChanges = 0;
  let conflictingClasses = 0;
  const classSizes = {};
  for (const counts of classes.values()) {
    const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
    classSizes[total] = (classSizes[total] || 0) + 1;
    const edits = total - Math.max(...counts.values());
    minimumChanges += edits;
    if (edits > 0) conflictingClasses++;
  }
  return { minimumChanges, conflictingClasses, classSizes, classes: classes.size };
}

const actual = minimumCorrections(repeatedTokens, knownP57);
assert.deepEqual(actual, {
  minimumChanges: 23,
  conflictingClasses: 19,
  classSizes: { '1': 49, '2': 14, '3': 6 },
  classes: 69
});

// Known-source-shaped positive plant: each source token emits the same GP rune.
const mapping = new Map([...new Set(repeatedTokens)].map((token, i) =>
  [token, corpus.runes[(i * 7) % corpus.runes.length]]));
const planted = repeatedTokens.map((token) => mapping.get(token));
assert.equal(minimumCorrections(repeatedTokens, planted).minimumChanges, 0);

// An exact iid-uniform-byte null for the numerical coincidence: 256 draws
// from 256 possible bytes, number U of distinct values.
let probabilities = Array(257).fill(0);
probabilities[0] = 1;
for (let draw = 0; draw < 256; draw++) {
  const next = Array(257).fill(0);
  for (let u = 0; u <= draw; u++) {
    next[u] += probabilities[u] * u / 256;
    next[u + 1] += probabilities[u] * (256 - u) / 256;
  }
  probabilities = next;
}
const massAt161 = probabilities[161];
assert.ok(Math.abs(massAt161 - 0.07822643713065443) < 1e-12);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'canonical original printed tokens and clear p57 rune symbols',
  tableTokens: tokens.length,
  uniqueTokens: seen.size,
  repeatedOccurrences: repeatedTokens.length,
  knownP57: knownP57.length,
  originalStaticCodebookGate: actual,
  plantedMinimumChanges: minimumCorrections(repeatedTokens, planted).minimumChanges,
  iidByteProbabilityOfExactly161Unique: massAt161,
  finding: 'No fixed printed-token-to-GP-rune map can generate the original PARABLE register at repeat positions'
}, null, 2));
