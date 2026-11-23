'use strict';
/**
 * Original-input GP29 multiplicative-field word-edge inversion SFT.
 *
 * Test: take each complete original ciphertext word's two outside runes as
 * public state and read every interior symbol as a discrete log of the
 * preceding ciphertext difference. The author-authenticated solved p57
 * "shed circumferences" is a possible selector, not authentication of this
 * cipher. The prime/totient alternative comes from solved LP1 page 5.
 *
 * Run under Node.js 22 in the repository root. Read-only and deterministic.
 * @module lp2_wordedge_fieldlog_original_sft
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const rune = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const sourcePages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const pageOffsets = new Map();
let count = 0;
for (const p of sourcePages) {
  pageOffsets.set(p.page, count);
  count += p.indices.length;
}
assert.equal(count, 12956);
const flatOriginal = sourcePages.flatMap((p) => p.indices);

/**
 * @returns {{values:number[], positions:number[]}[]}
 * Page/newline markers are transparent; a printed hyphen, stop, or major
 * punctuation breaks a word, including carried words across page edges.
 */
function parseWords() {
  const chunks = transcription.split('%').slice(0, 55);
  assert.equal(chunks.length, sourcePages.length);
  /** @type {{values:number[], positions:number[]}[]} */
  const words = [];
  let values = [], positions = [], offset = 0;
  for (const chunk of chunks) {
    for (const char of chunk) {
      if (rune.has(char)) {
        values.push(rune.get(char));
        positions.push(offset++);
      } else if ('-.&$'.includes(char)) {
        if (values.length) {
          words.push({values, positions});
          values = [];
          positions = [];
        }
      }
    }
  }
  if (values.length) words.push({values, positions});
  assert.equal(offset, 12956);
  assert.equal(words.length, 2896);
  assert.deepEqual(words.flatMap((w) => w.values), flatOriginal);
  return words;
}

/** @param {number} v @param {number} m */
function mod(v, m) { return ((v % m) + m) % m; }
/** @param {number} g @param {number} k */
function pow29(g, k) {
  let out = 1;
  for (let j = 0; j < k; j++) out = out * g % 29;
  return out;
}
/** @param {number[]} a */
function stats(a) {
  const counts = Array(29).fill(0);
  for (const n of a) counts[n]++;
  return {n: a.length, ioc: counts.reduce((s, c) => s + c * (c - 1), 0) /
    (a.length * (a.length - 1)), ea: counts[28]};
}
const laws = {
  first: (f, l) => f,
  last: (f, l) => l,
  sum: (f, l) => f + l,
  difference: (f, l) => f - l,
  primeSum: (f, l) => corpus.prime[f] + corpus.prime[l],
  totientSum: (f, l) => corpus.prime[f] + corpus.prime[l] - 2
};
const roots = [];
for (let g = 2; g < 29; g++) {
  const log = Array(29).fill(-1);
  let v = 1;
  for (let k = 0; k < 28 && log[v] < 0; k++) {
    log[v] = k;
    v = v * g % 29;
  }
  if (log.slice(1).every((n) => n >= 0)) roots.push({g, log});
}
assert.deepEqual(roots.map((r) => r.g),
  [2, 3, 8, 10, 11, 14, 15, 18, 19, 21, 26, 27]);
const words = parseWords();
const solved = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(solved.length, 95);

/**
 * @param {{values:number[],positions:number[]}} w
 * @param {number[]} log
 * @param {(f:number,l:number)=>number} law
 */
function decodeWord(w, log, law) {
  if (w.values.length < 3) return [];
  const key = mod(law(w.values[0], w.values.at(-1)), 28);
  const out = [];
  for (let i = 1; i < w.values.length - 1; i++) {
    const d = mod(w.values[i] - w.values[i - 1], 29);
    out.push({value: d === 0 ? 28 : mod(log[d] - key, 28),
      absolute: w.positions[i]});
  }
  return out;
}
/**
 * Reversible encoder for native plaintext interiors and literal outer runes.
 * @param {number[]} shell
 * @param {number[]} plain
 * @param {number} g
 * @param {(f:number,l:number)=>number} law
 */
function encodeWord(shell, plain, g, law) {
  const first = shell[0], last = shell.at(-1);
  const key = mod(law(first, last), 28);
  const values = [first];
  for (const p of plain) {
    const d = p === 28 ? 0 : pow29(g, mod(p + key, 28));
    values.push(mod(values.at(-1) + d, 29));
  }
  return {values: [...values, last],
    positions: Array.from({length: plain.length + 2}, (_, i) => i)};
}
const rows = [];
for (const {g, log} of roots) {
  for (const [name, law] of Object.entries(laws)) {
    const result = words.flatMap((w) => {
      const decoded = decodeWord(w, log, law);
      if (decoded.length) {
        const reencoded = encodeWord([w.values[0], w.values.at(-1)],
          decoded.map((e) => e.value), g, law);
        assert.deepEqual(reencoded.values, w.values,
          'original full-word re-encryption must recover every rune');
      }
      return decoded;
    });
    const all = result.map((e) => e.value);
    assert.equal(result.length, 7247);
    // Native original p57 is the only non-gibberish plant.
    let planted = 0;
    for (const w of words) {
      const capacity = Math.max(0, w.values.length - 2);
      if (!capacity || planted >= solved.length) continue;
      const take = Math.min(capacity, solved.length - planted);
      const input = solved.slice(planted, planted + take);
      const candidate = encodeWord([w.values[0], w.values.at(-1)], input, g, law);
      const recovered = decodeWord(candidate, log, law).map((e) => e.value);
      assert.deepEqual(recovered, input);
      // Exact forward recovery is the known-key implementation invariant.
      assert.deepEqual(encodeWord([candidate.values[0], candidate.values.at(-1)],
        recovered, g, law).values, candidate.values);
      planted += take;
    }
    assert.equal(planted, 95);
    const pageRange = (start, end) => {
      const lo = pageOffsets.get(start);
      const endPage = sourcePages.find((p) => p.page === end);
      const hi = pageOffsets.get(end) + endPage.indices.length;
      return stats(result.filter((e) => e.absolute >= lo && e.absolute < hi)
        .map((e) => e.value));
    };
    rows.push({generator: g, law: name, all: stats(all),
      p16to21: pageRange(16, 21), p40to53: pageRange(40, 53),
      nativeP57PlantRoundTrip: planted});
  }
}
rows.sort((a, b) => b.all.ioc - a.all.ioc);
assert.equal(rows.length, 72);
assert.equal(rows[0].generator, 15);
assert.equal(rows[0].law, 'primeSum');
assert.equal(rows[0].all.n, 7247);
assert(Math.abs(rows[0].all.ioc - 0.03539618419202921) < 1e-14);
assert.equal(rows[0].all.ea, 44);
console.log(JSON.stringify({
  tested: 'original physical LP2 p0-p55 complete words',
  runes: flatOriginal.length, completeWords: words.length,
  candidateCount: rows.length, originalInteriors: 7247,
  roots: roots.map((r) => r.g),
  bestOriginal: rows[0], allIocRange: [rows.at(-1).all.ioc, rows[0].all.ioc],
  nativeP57Positive: '95 GP29 runes recovered and re-encoded in every variant',
  interpretation: 'none supplies a recognizable original plaintext'
}, null, 2));
console.log('PASS: source identity; all 72 original inverses and original-native positive plants');
