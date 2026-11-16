'use strict';

/**
 * Key-independent word-local rank28 stationary-permutation gate.
 * Run on Node.js 22, CommonJS: node sims/lp2_rank28_stationary_permutation_original_sft.cjs
 * Original LP2 transcription, independent canonical GP29 pages, clear LP1 and LP2 p57 controls.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const text = read('resources/liber-primus/lp2-transcription.txt');
const lp1 = read('resources/transcriptions/lp1_wulfic_canonical.txt');
const indices = new Map(corpus.runes.map((r, i) => [r, i]));
const delimiters = new Set(['-', '.', '&', '$', '§']);
assert.equal(indices.size, 29);

function tokenize(chunks) {
  const out = [];
  let current = [];
  for (const chunk of chunks) for (const r of chunk) {
    if (indices.has(r)) current.push(indices.get(r));
    else if (delimiters.has(r) && current.length) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}

function rank(word) {
  const out = [];
  for (let j = 1; j < word.length; j++) {
    const previous = word[j - 1], current = word[j];
    out.push(current === previous ? 28 : current < previous ? current : current - 1);
  }
  return out;
}
function emit(nativeWord, key) {
  if (!nativeWord.length) return [];
  const out = [nativeWord[0]];
  for (let j = 1; j < nativeWord.length; j++) {
    const d = key(nativeWord[j]), previous = out.at(-1);
    out.push(d === 28 ? previous : d < previous ? d : d + 1);
  }
  return out;
}
const flatten = groups => groups.flatMap(x => x);
const interior = words => flatten(words.map(w => w.slice(1)));
const ranks = words => flatten(words.map(rank));
function ioc(x) {
  assert.ok(x.length > 1);
  const counts = new Array(29).fill(0);
  for (const v of x) { assert.ok(v >= 0 && v < 29); counts[v]++; }
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (x.length * (x.length - 1));
}
function close(observed, expected) {
  assert.ok(Math.abs(observed - expected) < 1e-12, observed + ' != ' + expected);
}

const chunks = text.split('%');
assert.equal(chunks.length, 57);
const sourcePages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(sourcePages.length, 55);
for (let p = 0; p < 55; p++) {
  const fromInk = Array.from(chunks[p]).filter(r => indices.has(r)).map(r => indices.get(r));
  assert.deepEqual(fromInk, sourcePages[p].indices, 'original physical page ' + sourcePages[p].page);
}
const unknown = tokenize(chunks.slice(0, 55));
const solvedSections = lp1.split('%');
const known = tokenize([3, 8, 9, 10, 11, 14].map(i => solvedSections[i]));
const clear57 = tokenize([chunks[56]]);
assert.equal(unknown.length, 2896);
assert.equal(flatten(unknown).length, 12956);
assert.equal(known.length, 230);
assert.equal(flatten(known).length, 1001);
assert.equal(clear57.length, 20);
assert.equal(flatten(clear57).length, 95);

const actualRank = ranks(unknown), nativeInterior = interior(known);
assert.equal(actualRank.length, 10060);
assert.equal(actualRank.filter(x => x === 28).length, 63);
close(ioc(actualRank), 0.03527934688321013);
close(ioc(nativeInterior), 0.070406117876935);
close(ioc(interior(clear57)), 0.07747747747747748);
const counts = Array.from({length:29}, (_,i) => actualRank.filter(x=>x===i).length);
assert.deepEqual(counts, [
  355,361,365,363,340,361,348,336,340,351,393,345,336,345,
  354,365,343,331,351,355,364,397,362,372,365,362,381,356,63
]);

// Frozen secret permutations include an affine GP29 key and 29 cyclic shifts.
// Full rank-digit recovery (not just a synthetic implementation round trip)
// demonstrates that a stationary secret alphabet relabeling preserves IoC.
for (let shift = 0; shift < 29; shift++) {
  const key = x => (7 * x + shift) % 29;
  const planted = known.map(w => emit(w, key));
  assert.equal(flatten(planted).length, 1001);
  assert.deepEqual(ranks(planted), interior(known).map(key));
  close(ioc(ranks(planted)), ioc(nativeInterior));
  close(ioc(actualRank.map(x => (7 * x + shift) % 29)), ioc(actualRank));
}
console.log(JSON.stringify({
  status: 'stationary rank29 alphabet relabeling inconsistent with native GP controls',
  originalWords: unknown.length,
  originalRunes: flatten(unknown).length,
  originalWithinWordRankSymbols: actualRank.length,
  originalWithinWordRepeatSymbols: 63,
  originalWithinWordRankIoC: ioc(actualRank),
  nativeLP1ClearWords: known.length,
  nativeLP1InteriorRunes: nativeInterior.length,
  nativeLP1InteriorIoC: ioc(nativeInterior),
  nativeLP2P57InteriorIoC: ioc(interior(clear57)),
  reversibleStationaryKeyPositiveControls: 29
}, null, 2));
