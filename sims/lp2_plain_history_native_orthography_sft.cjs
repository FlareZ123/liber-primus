'use strict';

/**
 * Re-evaluate the original LP2 plaintext-history exclusion using the
 * solved-LP1/p57 authenticated ING and IO GP29 rune spellings.
 * Run: node sims/lp2_plain_history_native_orthography_sft.cjs
 * Source-native controls and a complete reversible positive plant.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const lengths = pages.map(p => p.indices.length);
const original = pages.flatMap(p => p.indices);
const N = original.length;
assert.equal(pages.length, 55);
assert.equal(N, 12956);
assert.equal(lengths.at(-1), 76);

/**
 * Count unordered pairs of equal length-m overlapping windows, respecting
 * original page resets and optional same page-local phase.
 * @param {number[]} source @param {number} m
 * @param {number} phasePeriod @param {number} skip
 * @returns {number}
 */
function equalPairs(source, m, phasePeriod = 0, skip = 0) {
  assert.equal(source.length, N);
  let offset = 0, total = 0;
  for (const n of lengths) {
    const counts = new Map();
    for (let i = skip; i + m <= n; i++) {
      const key = (phasePeriod ? String(i % phasePeriod) + ':' : '') +
        source.slice(offset + i, offset + i + m).join(',');
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    for (const k of counts.values()) total += k * (k - 1) / 2;
    offset += n;
  }
  return total;
}

/**
 * Test whether original ciphertext is a deterministic output of the
 * proposed unmodified plaintext, keyed by page/history/optional phase.
 * Any identical complete input requiring two different outputs disproves
 * every possible secret deterministic table in the specified family.
 * @param {number[]} plain @param {number} q @param {number} phasePeriod
 */
function exactRows(plain, q, phasePeriod = 0) {
  let offset = 0, conflicts = 0, bijectiveConflicts = 0;
  let witness = null;
  for (let p = 0; p < pages.length; p++) {
    const rows = new Map();
    for (let i = q; i < lengths[p]; i++) {
      const key = (phasePeriod ? String(i % phasePeriod) + ':' : '') +
        plain.slice(offset + i - q, offset + i).join(',');
      const x = plain[offset + i], y = original[offset + i];
      let row = rows.get(key);
      if (!row) {
        row = {forward: new Map(), reverse: new Map()};
        rows.set(key, row);
      }
      if (row.forward.has(x) && row.forward.get(x) !== y) {
        conflicts++;
        if (!witness) witness = {
          physicalPage: pages[p].page, localRune: i, context: key,
          plainRune: x, expectedCipher: row.forward.get(x), actualCipher: y
        };
      }
      if (row.reverse.has(y) && row.reverse.get(y) !== x) bijectiveConflicts++;
      row.forward.set(x, y);
      row.reverse.set(y, x);
    }
    offset += lengths[p];
  }
  return {conflicts, bijectiveConflicts, witness};
}
assert.equal(equalPairs(original, 3, 0, 1), 55);
assert.equal(equalPairs(original, 4, 0, 1), 1);
assert.equal(equalPairs(original, 5, 0, 1), 0);
assert.equal(equalPairs(original, 4, 8, 1), 0);

const sources = [
  {author: 'Shakespeare', file: 'shakespeare_first300k.txt',
    oldLen: 218800, newLen: 217106, oldWins: 32, wins: 32,
    oldMin11: 13, min11: 6, min12: 4, minPhase7: 11},
  {author: 'Gibran', file: 'gibran_prophet_58585.txt',
    oldLen: 63114, newLen: 62492, oldWins: 8, wins: 8,
    oldMin11: 64, min11: 61, min12: 44, minPhase7: 24},
  {author: 'Emerson', file: 'emerson_essays_2944.txt',
    oldLen: 324630, newLen: 321327, oldWins: 49, wins: 48,
    oldMin11: 2, min11: 0, min12: 0, minPhase7: 0}
];
const survivors = {q7: [], q8: [], phase8q3: []};
const summary = [];
let firstNative = null;
for (const s of sources) {
  const prose = read('resources/control/' + s.file);
  const legacy = encodeSourceNativeGP(prose, false);
  const native = encodeSourceNativeGP(prose, true);
  assert.equal(legacy.length, s.oldLen);
  assert.equal(native.length, s.newLen);
  const old11 = [];
  for (let start = 0; start + N <= legacy.length; start += N / 2)
    old11.push(equalPairs(legacy.slice(start, start + N), 11));
  assert.equal(old11.length, s.oldWins);
  assert.equal(Math.min(...old11), s.oldMin11);

  let windows = 0, min11 = Infinity, min12 = Infinity, minPhase7 = Infinity;
  for (let start = 0; start + N <= native.length; start += N / 2) {
    const window = native.slice(start, start + N);
    if (firstNative === null) firstNative = window;
    const e11 = equalPairs(window, 11);
    const e12 = equalPairs(window, 12);
    const e7 = equalPairs(window, 7, 8);
    min11 = Math.min(min11, e11);
    min12 = Math.min(min12, e12);
    minPhase7 = Math.min(minPhase7, e7);
    windows++;
    if (e11 <= 1) {
      const check = exactRows(window, 7);
      assert(check.conflicts > 0);
      survivors.q7.push({source: s.author, offset: start, e11, ...check});
    }
    if (e12 <= 1) {
      const check = exactRows(window, 8);
      assert(check.conflicts > 0);
      survivors.q8.push({source: s.author, offset: start, e12, ...check});
    }
    if (e7 === 0) {
      const check = exactRows(window, 3, 8);
      assert(check.conflicts > 0);
      survivors.phase8q3.push({source: s.author, offset: start, e7, ...check});
    }
  }
  assert.deepEqual([windows, min11, min12, minPhase7],
    [s.wins, s.min11, s.min12, s.minPhase7]);
  summary.push({source: s.author, windows, min11, min12, minPhase7});
}
assert.equal(summary.reduce((n, s) => n + s.windows, 0), 88);
assert.deepEqual(survivors.q7.map(x => [x.offset, x.conflicts]),
  [[25912, 21], [161950, 26]]);
assert.deepEqual(survivors.q8.map(x => [x.offset, x.conflicts]),
  [[25912, 7], [142516, 26], [161950, 8]]);
assert.deepEqual(survivors.phase8q3.map(x => [x.offset, x.conflicts]),
  [[12956, 47], [161950, 44]]);

/**
 * Independent seeded context affine-permutation positive plant in GF(29).
 * This is an implementation control, not a conjectured historical key.
 * @param {number} seed @param {number} p @param {number} phase
 * @param {number[]} history
 * @returns {{a:number,b:number}}
 */
function row(seed, p, phase, history) {
  let h = (0x811c9dc5 ^ seed) >>> 0;
  for (const v of [p, phase, ...history]) h = Math.imul(h ^ (v + 1), 16777619) >>> 0;
  return {a: 1 + h % 28, b: (h >>> 11) % 29};
}

/**
 * @param {number[]} input @param {number} q @param {number} period
 * @param {number} seed @param {boolean} decode
 * @returns {number[]}
 */
function transform(input, q, period, seed, decode = false) {
  const output = [];
  let offset = 0;
  for (let p = 0; p < lengths.length; p++) {
    const local = [];
    for (let i = 0; i < lengths[p]; i++) {
      const v = input[offset + i];
      if (i < q) { local.push(v); continue; }
      const history = decode ? local.slice(i - q, i)
        : input.slice(offset + i - q, offset + i);
      const {a, b} = row(seed, p, period ? i % period : 0, history);
      if (decode) {
        const inverse = Array.from({length: 28}, (_, j) => j + 1)
          .find(j => (a * j) % 29 === 1);
        assert(inverse !== undefined);
        local.push(((v - b + 29) * inverse) % 29);
      } else {
        local.push((a * v + b) % 29);
      }
    }
    output.push(...local);
    offset += lengths[p];
  }
  return output;
}
for (const [q, phase] of [[7, 0], [8, 0], [3, 8]]) {
  const ciphertext = transform(firstNative, q, phase, 0x33012014);
  assert.deepEqual(transform(ciphertext, q, phase, 0x33012014, true), firstNative);
  const wrong = transform(ciphertext, q, phase, 0x33012015, true);
  assert(wrong.filter((v, i) => v !== firstNative[i]).length > 100);
  // For the positive plant, check its own ciphertext against its own
  // source plaintext, rather than calling exactRows on the unknown original.
  if (q === 7) assert(equalPairs(firstNative, 11) <= equalPairs(ciphertext, 4, 0, 1));
  if (q === 8) assert(equalPairs(firstNative, 12) <= equalPairs(ciphertext, 4, 0, 1));
  if (phase) assert(equalPairs(firstNative, 7, 8) <= equalPairs(ciphertext, 4, 8, 1));
}

if (require.main === module) {
  console.log(JSON.stringify({
    finding: 'all source-native q<=8/page-static and q<=3/page-phase8 control windows fail',
    establishedUnknownPlaintext: false,
    originalRunes: N,
    oldControlWindows: 89,
    correctedControlWindows: 88,
    summary, survivors, reversibleFullLengthPlants: 3
  }, null, 2));
}
module.exports = {equalPairs, exactRows};
