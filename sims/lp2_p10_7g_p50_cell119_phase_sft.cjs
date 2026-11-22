#!/usr/bin/env node
'use strict';

/*
 * Source-led test of p10 "7 G" -> one-based table cell 119 and its
 * simplest whole-book consumer: a period-256 GP29 additive key starting
 * at cell 119. This is a bounded hypothesis test, not a decryption claim.
 * Run from the repository root with Node.js 22:
 *   node sims/lp2_p10_7g_p50_cell119_phase_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const paths = {
  corpus: 'resources/liber-primus/lp2-corpus.json',
  base60: 'resources/liber-primus/base60-grid.json',
  grid256: 'resources/liber-primus/lp2-grid-256.json',
  transcription: 'resources/liber-primus/lp2-transcription.txt',
  ink: 'resources/liber-primus/lp2-ink-annotations.json',
  control: 'resources/control/gibran_prophet_58585.txt',
};
const expectedBlob = {
  corpus: '054f2a0f780b7d46901acbe3d9bf4f0ac1801165',
  base60: '4698c0806e6bab06a39cfbc3c3283b862de58b35',
  grid256: '39c4f098566fc5eba9d6738416a2fd193f800701',
  transcription: '43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7',
  ink: '3c52f209ce6bd7b138eaa2d4a9323526952ba9f9',
  control: 'df260a07d56bf5998d40a6360b6132c35c252d10',
};
const raw = Object.fromEntries(Object.entries(paths).map(([k, p]) =>
  [k, fs.readFileSync(path.join(root, p))]));
const blobSha1 = b => crypto.createHash('sha1')
  .update(Buffer.from('blob ' + b.length + '\0')).update(b).digest('hex');
for (const k of Object.keys(paths)) {
  assert.equal(blobSha1(raw[k]), expectedBlob[k], k + ' Git blob SHA mismatch');
}
const corpus = JSON.parse(raw.corpus.toString('utf8'));
const base60 = JSON.parse(raw.base60.toString('utf8'));
const grid256 = JSON.parse(raw.grid256.toString('utf8'));
const transcription = raw.transcription.toString('utf8');
const ink = JSON.parse(raw.ink.toString('utf8'));
const controlText = raw.control.toString('utf8');
const mod = x => ((x % 29) + 29) % 29;

const runes = corpus.runes;
const runeSet = new Set(runes);
const alphabet = base60.alphabet;
const tableTokens = base60.rows.flat();
const tableBytes = base60.byte_rows.flat();
const valueOf = token => 60 * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);
assert.equal(tableTokens.length, 256);
assert.equal(tableBytes.length, 256);
assert.deepEqual(tableBytes, grid256.bytes);
assert.deepEqual(tableBytes, tableTokens.map(valueOf));
assert.deepEqual(base60.page_row_counts, [10, 13, 9]);

// Recover the six original decimal-number / following-word pairs. Physical
// p50 has no transcription segment, so segment indices after 49 shift by one.
const sections = transcription.split(/^%$/m);
assert.equal(sections.length, 57);
const printedNumbers = [];
for (let i = 0; i < sections.length; i++) {
  const page = i < 50 ? i : i + 1;
  if (page > 55) continue;
  const section = sections[i];
  for (const match of section.matchAll(/[0-9]/g)) {
    const after = /^-([\u16A0-\u16FF]+)/u.exec(section.slice(match.index + 1));
    assert.ok(after, 'printed numeral must be followed by a GP word');
    const following = after[1];
    const firstRune = Array.from(following)[0];
    const runeIndex = runes.indexOf(firstRune);
    assert.ok(runeIndex >= 0);
    const digit = Number(match[0]);
    const prime = corpus.prime[runeIndex];
    const product = digit * prime;
    const token = product >= 1 && product <= 256 ? tableTokens[product - 1] : null;
    const cellValue = token === null ? null : valueOf(token);
    printedNumbers.push({
      page,
      digit,
      runeOffset: Array.from(section.slice(0, match.index)).filter(r => runeSet.has(r)).length,
      following,
      firstRune,
      translit: corpus.translit[runeIndex],
      runeIndex,
      ordinal: runeIndex + 1,
      prime,
      product,
      token,
      cellValue,
      residue: cellValue === null ? null : cellValue % 29,
      residueMatchesRune: cellValue !== null && cellValue % 29 === runeIndex,
    });
  }
}
assert.deepEqual(printedNumbers.map(x => [x.page, x.digit]), [
  [10, 7], [36, 1], [37, 2], [37, 3], [37, 4], [38, 5],
]);
const marker = printedNumbers[0];
assert.deepEqual(
  [marker.runeOffset, marker.following, marker.translit, marker.ordinal, marker.prime, marker.product],
  [169, 'ᚷ', 'G', 7, 17, 119],
);
assert.equal(marker.token, '0Z');
assert.equal(marker.cellValue, 35);
assert.equal(marker.residue, 6);
assert.equal(corpus.translit[6], 'G');
assert.ok(printedNumbers.slice(1).every(x => !x.residueMatchesRune));

// One-based table cell 119 is physical p50 row 5, column 7.
const cell119 = tableTokens[118];
const cell120 = tableTokens[119];
assert.equal(cell119, '0Z');
assert.equal(valueOf(cell119), 35);
assert.equal(valueOf(cell119) % 29, 6);
assert.equal(cell120, '34');
assert.equal(valueOf(cell120) % 29, 10);
const globalRow = Math.floor((119 - 1) / 8) + 1;
const column = (119 - 1) % 8 + 1;
assert.equal(globalRow, 15);
assert.equal(column, 7);
const p50LocalRow = globalRow - 10; // p49 contributes ten preceding rows
assert.equal(p50LocalRow, 5);
assert.equal(p50LocalRow * column, 35);

// Check every original printed cell under physical-page-local row numbering.
// This is a conditional coordinate observation; the continuous 32-row table
// would instead call the selected cell row 15, column 7.
const coordinateMatches = [];
let globalCell = 0;
for (const page of [{page:49, rows:10}, {page:50, rows:13}, {page:51, rows:9}]) {
  for (let row = 1; row <= page.rows; row++) {
    for (let col = 1; col <= 8; col++) {
      const token = tableTokens[globalCell];
      const value = valueOf(token);
      if (value === row * col) {
        coordinateMatches.push({
          globalCell: globalCell + 1, page: page.page,
          pageRow: row, col, token, value,
        });
      }
      globalCell++;
    }
  }
}
assert.equal(globalCell, 256);
assert.deepEqual(coordinateMatches, [{
  globalCell:119, page:50, pageRow:5, col:7, token:'0Z', value:35,
}]);
const value35Indices = tableBytes.map((v, i) => v === 35 ? i + 1 : null).filter(Boolean);
const residueGIndices = tableBytes.map((v, i) => v % 29 === 6 ? i + 1 : null).filter(Boolean);
assert.deepEqual(value35Indices, [96, 119]);
assert.equal(residueGIndices.length, 10);

// The only two isolated red three-rune spans are the already documented
// p3/p39 spans at the same page-local offset 119.
const redTriads = ink.pages.flatMap(page => (page.red_spans || [])
  .filter(span => span.length === 3)
  .map(span => [page.page, span.start]));
assert.deepEqual(redTriads, [[3, 119], [39, 119]]);

// Reconstruct the canonical unknown p0-p55 stream and native-GP Gibran control.
const cipher = corpus.pages
  .filter(page => page.page <= 55 && page.runic_count > 0)
  .flatMap(page => page.indices);
assert.equal(cipher.length, 12956);
const key = tableBytes.map(x => x % 29);
assert.equal(new Set(key).size, 29);
const phase = 119; // one-based cell number
const phaseIndex = phase - 1;
const phaseKey = key.map((_, i) => key[(i + phaseIndex) % 256]);

const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const native = [];
for (let word of (controlText.toUpperCase().match(/[A-Z]+/g) || [])) {
  word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG');
  for (let j = 0; j < word.length;) {
    const token = tokens.find(t => word.startsWith(t.s, j));
    assert.ok(token, 'unmapped native-GP control at ' + word.slice(j));
    native.push(token.i);
    j += token.s.length;
  }
}
assert.equal(native.length, 62696);
const train = native.slice(0, 40000);
const trigramCounts = new Float64Array(29 ** 3);
for (let i = 2; i < train.length; i++) {
  trigramCounts[train[i - 2] * 841 + train[i - 1] * 29 + train[i]]++;
}
const denominator = train.length - 2 + 0.1 * (29 ** 3);
const trigramScore = seq => {
  let score = 0;
  for (let i = 2; i < seq.length; i++) {
    const k = seq[i - 2] * 841 + seq[i - 1] * 29 + seq[i];
    score += Math.log((trigramCounts[k] + 0.1) / denominator);
  }
  return score / (seq.length - 2);
};
const heldNative = [];
for (let i = 40000; i + 256 <= native.length; i++) {
  heldNative.push(trigramScore(native.slice(i, i + 256)));
}
heldNative.sort((a, b) => a - b);
const worstNativeWindow = heldNative[0];
const medianNativeWindow = heldNative[Math.floor(heldNative.length / 2)];
assert.equal(heldNative.length, 22441);

const ioc = seq => {
  const counts = new Array(29).fill(0);
  for (const x of seq) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (seq.length * (seq.length - 1));
};
const decrypt = (sign, k) => cipher.map((x, i) => mod(x + sign * k[i % 256]));
const candidate = sign => {
  const decoded = decrypt(sign, phaseKey);
  const restored = decoded.map((x, i) => mod(x - sign * phaseKey[i % 256]));
  assert.deepEqual(restored, cipher);
  const windows = [];
  for (let i = 0; i + 256 <= decoded.length; i += 256) {
    windows.push(trigramScore(decoded.slice(i, i + 256)));
  }
  const sorted = windows.slice().sort((a, b) => a - b);
  return {
    sign: sign < 0 ? 'C-K' : 'C+K',
    meanTrigram: trigramScore(decoded),
    ioc: ioc(decoded),
    first120: decoded.slice(0, 120).map(x => corpus.translit[x]).join(''),
    windows: windows.length,
    windowMin: Math.min(...windows),
    windowMedian: sorted[25],
    windowMax: Math.max(...windows),
    windowsAtOrBelowWorstNative: windows.filter(x => x <= worstNativeWindow).length,
  };
};
const results = [candidate(-1), candidate(1)];

// Positive control: both inverse signs recover a native-GP plant exactly.
const plant = native.slice(0, cipher.length);
for (const sign of [-1, 1]) {
  const encrypted = plant.map((x, i) => mod(x - sign * phaseKey[i % 256]));
  const recovered = encrypted.map((x, i) => mod(x + sign * phaseKey[i % 256]));
  assert.deepEqual(recovered, plant);
}

// Deterministic 512-shuffle null, identical to the earlier p50 global-key gate.
function mulberry32(seed) {
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(0x20261111);
const nullScores = {minus:[], plus:[]};
for (let n = 0; n < 512; n++) {
  const shuffled = phaseKey.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  nullScores.minus.push(trigramScore(decrypt(-1, shuffled)));
  nullScores.plus.push(trigramScore(decrypt(1, shuffled)));
}
const summarize = values => {
  const sorted = values.slice().sort((a, b) => a - b);
  return {
    min: sorted[0],
    median: sorted[256],
    p95: sorted[Math.floor(0.95 * 511)],
    max: sorted[511],
  };
};
const empiricalP = {};
for (const [name, index] of [['minus',0], ['plus',1]]) {
  const score = results[index].meanTrigram;
  const atOrAbove = nullScores[name].filter(x => x >= score).length;
  empiricalP[name] = {atOrAbove, addOneP:(1 + atOrAbove) / 513};
}
assert.ok(Math.abs(results[0].meanTrigram - (-12.305340171043854)) < 1e-10);
assert.ok(Math.abs(results[1].meanTrigram - (-12.30229465240474)) < 1e-10);
assert.ok(results.every(x => x.windows === 50 && x.windowsAtOrBelowWorstNative === 50));
assert.equal(empiricalP.minus.atOrAbove, 399);
assert.equal(empiricalP.plus.atOrAbove, 401);

console.log(JSON.stringify({
  interpretation: 'candidate source address plus a bounded negative direct-key test; NOT a decryption',
  printedNumbers,
  tableAddress: {
    oneBasedCell:119, globalRow:15, column:7, physicalPage:50, pageLocalRow:5,
    token:cell119, base60Value:35, modulo29:6, rune:'G',
    pageLocalRowTimesColumn:35,
    uniquePageLocalRowColumnProductCell:coordinateMatches,
    duplicateValue35Cells:value35Indices,
    cellsWithGPResidueG:residueGIndices.length,
    zeroBasedAlternative:{cellNumber:120,token:cell120,value:valueOf(cell120),residue:valueOf(cell120)%29},
  },
  redTriads: redTriads,
  phaseKeyTest: {
    hypothesis:'B mod 29, period 256, one-based phase 119, continuous p0-p55 rune clock; both additive signs',
    cipherRunes:cipher.length, keyBytes:key.length, distinctKeyResidues:new Set(key).size,
    nativeGpRunes:native.length, trainingRunes:train.length,
    heldNativeWindows:heldNative.length, worstNativeWindow, medianNativeWindow,
    raw:{meanTrigram:trigramScore(cipher),ioc:ioc(cipher)},
    candidates:results,
    shuffledKeyNull:{minus:summarize(nullScores.minus),plus:summarize(nullScores.plus)},
    empiricalUpperTailP:empiricalP,
  },
  conclusion:'The source-selected phase-119 direct additive/subtractive period-256 key is negative. The cell119 address remains a provisional clue; no unknown plaintext, authentic key, cipher, or endpoint is recovered.',
}, null, 2));
