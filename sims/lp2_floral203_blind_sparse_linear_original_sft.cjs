'use strict';

/**
 * Blind sparse GF(29) row-unmixing on original LP2 floral 16x203 register.
 * Exhaustive 1-, 2- and 3-row nonzero coefficient projections.
 * Read-only, deterministic, Windows Node.js 22, no packages or network.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p */
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const pages = read('resources/liber-primus/lp2-corpus.json').pages;
const ink = read('resources/liber-primus/lp2-ink-annotations.json').pages;
const solved = read('resources/external/relikd-solved-gp29-native-v1.json');
const spans = new Map(ink.map((p) => [p.page, p.red_spans || []]));
/** @param {number} a */
const mod = (a) => ((a % 29) + 29) % 29;
/** @param {number[]} word */
function pairs(word) {
  const freq = new Uint16Array(29);
  for (const v of word) freq[v]++;
  let out = 0;
  for (const count of freq) out += count * (count - 1) / 2;
  return out;
}
const black = [];
for (let p = 40; p <= 55; p++) {
  const page = pages.find((x) => x.page === p);
  const red = spans.get(p) || [];
  for (let j = 0; j < page.indices.length; j++) {
    if (!red.some((z) => j >= z.start && j < z.start + z.length)) black.push(page.indices[j]);
  }
}
assert.equal(black.length, 3248);
const rows = Array.from({ length: 16 }, (_, k) => black.slice(k * 203, (k + 1) * 203));

/**
 * Test all 1-, 2-, and 3-sparse nonzero linear forms on 16 source rows
 * up to multiplication by any nonzero field scalar. Every equivalence
 * class has unique normalized first nonzero coefficient 1.
 * @param {number[][]} x 16 rows of 203 symbols
 * @returns {{support: number, tested: number, maximum: number, witness: number[], over1000: number}[]}
 */
function census(x) {
  assert.equal(x.length, 16);
  for (const row of x) assert.equal(row.length, 203);
  const out = [];
  let tested = 0, maximum = -1, witness = [], over1000 = 0;
  /** @param {number[]} values @param {number[]} c */
  function record(values, c) {
    const e = pairs(values);
    tested++;
    if (e > maximum) { maximum = e; witness = c; }
    if (e >= 1000) over1000++;
  }
  for (let a = 0; a < 16; a++) record(x[a], [a, 1]);
  out.push({support: 1, tested, maximum, witness, over1000});
  tested = 0; maximum = -1; witness = []; over1000 = 0;
  for (let a = 0; a < 16; a++) for (let b = a + 1; b < 16; b++) {
    for (let u = 1; u < 29; u++) {
      const counts = new Uint16Array(29);
      for (let j = 0; j < 203; j++) counts[(x[a][j] + u * x[b][j]) % 29]++;
      let e = 0;
      for (const c of counts) e += c * (c - 1) / 2;
      tested++;
      if (e > maximum) { maximum = e; witness = [a, 1, b, u]; }
      if (e >= 1000) over1000++;
    }
  }
  out.push({support: 2, tested, maximum, witness, over1000});
  tested = 0; maximum = -1; witness = []; over1000 = 0;
  for (let a = 0; a < 16; a++) for (let b = a + 1; b < 16; b++)
    for (let c = b + 1; c < 16; c++) {
      const A = x[a], B = x[b], C = x[c];
      for (let u = 1; u < 29; u++) {
        const ab = new Uint8Array(203);
        for (let j = 0; j < 203; j++) ab[j] = (A[j] + u * B[j]) % 29;
        for (let v = 1; v < 29; v++) {
          const counts = new Uint16Array(29);
          for (let j = 0; j < 203; j++) counts[(ab[j] + v * C[j]) % 29]++;
          let e = 0;
          for (const count of counts) e += count * (count - 1) / 2;
          tested++;
          if (e > maximum) { maximum = e; witness = [a, 1, b, u, c, v]; }
          if (e >= 1000) over1000++;
        }
      }
    }
  out.push({support: 3, tested, maximum, witness, over1000});
  return out;
}
const original = census(rows);
assert.deepEqual(original.map((r) => [r.tested, r.maximum, r.over1000]), [
  [16, 758, 0],
  [3360, 836, 0],
  [439040, 896, 0]
]);
assert.deepEqual(original[2].witness, [3, 1, 7, 20, 14, 6]);

const rune = new Map(solved.runes.map((s, i) => [s, i]));
let nReference = 0, minReference = Infinity, maxReference = -1;
for (const section of solved.sections) {
  const seq = Array.from(section.source_text).filter((s) => rune.has(s)).map((s) => rune.get(s));
  for (let j = 0; j + 203 <= seq.length; j++) {
    const p = pairs(seq.slice(j, j + 203));
    nReference++;
    minReference = Math.min(minReference, p);
    maxReference = Math.max(maxReference, p);
  }
}
assert.equal(nReference, 1561);
assert.equal(minReference, 1096);
assert.ok(original.every((r) => r.maximum < minReference));

// Independent positive: a planted authentic 203-rune GP29 passage is one
// sparse linear combination of three otherwise independently random rows.
const welcome = Array.from(solved.sections.find((s) => s.name === '0_welcome').source_text)
  .filter((s) => rune.has(s)).map((s) => rune.get(s)).slice(0, 203);
assert.equal(welcome.length, 203);
const planted = rows.map((r) => r.slice());
for (let j = 0; j < 203; j++) {
  planted[14][j] = mod((welcome[j] - planted[3][j] - 20 * planted[7][j]) * 5);
  // 6^-1 = 5 (mod 29).
  assert.equal(mod(planted[3][j] + 20 * planted[7][j] + 6 * planted[14][j]), welcome[j]);
}
const trueNativePairs = pairs(welcome);
assert.ok(trueNativePairs >= minReference);
const positive = census(planted);
assert.ok(positive[2].maximum >= trueNativePairs);
console.log(JSON.stringify({
  status: 'PASS',
  source: 'LP2 p40-p55 black GP29 16x203 with all original red exclusions',
  original,
  authenticWithinSectionSolvedWindows: nReference,
  solvedWindowEqualPairs: [minReference, maxReference],
  positive: {nativeTruePairs: trueNativePairs, threeSparseBest: positive[2].maximum,
    plantedExact: '203/203'},
  conclusion: 'all at-most-3-sparse GF29 linear row inverses disfavor solved-style native-GP plaintext; dense nonlinear mixing remains open'
}, null, 2));
