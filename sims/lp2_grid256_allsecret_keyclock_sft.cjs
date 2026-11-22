'use strict';

/**
 * Original-input all-secret 256-phase periodic key exclusion.
 * Source clue: precisely 256 printed numerical table cells on LP2 pp49–51.
 * Tests every possible unknown per-phase GP29 bijection, including F skips.
 * Read only: node sims/lp2_grid256_allsecret_keyclock_sft.cjs (Node 22, CJS).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const PERIOD = 256;
const MOD = 29;
/** @param {number} n @param {number} base @returns {number} */
const mod = (n, base) => ((n % base) + base) % base;
assert.equal(table.bytes.length, PERIOD);
assert.equal(corpus.translit[0], 'F');
const chapterRanges = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55],
];
const chapters = chapterRanges.map(([lo, hi]) =>
  corpus.pages.filter((p) => p.page >= lo && p.page <= hi)
    .flatMap((p) => p.indices));
const total = chapters.reduce((s, a) => s + a.length, 0);
assert.deepEqual(chapters.map((a) => a.length),
  [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);
assert.equal(total, 12956);
assert.deepEqual(chapters.map((a) => a.filter((x) => x !== 0).length),
  [695, 1119, 1663, 1831, 984, 1381, 1640, 2883, 302]);

/** @param {string} s @returns {number[]} */
function gpNative(s) {
  const words = s.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S').match(/[A-Z]+/g) || [];
  const tokens = corpus.translit.map((t, i) => ({t, i}))
    .sort((a, b) => b.t.length - a.t.length);
  const out = [];
  for (const word of words) {
    for (let at = 0; at < word.length;) {
      if (word.startsWith('ING', at)) {out.push(21); at += 3; continue;}
      if (word.startsWith('IO', at)) {out.push(27); at += 2; continue;}
      const tok = tokens.find((t) => word.startsWith(t.t, at));
      assert.ok(tok, 'Unrecognized GP letter ' + word.slice(at));
      out.push(tok.i);
      at += tok.t.length;
    }
  }
  return out;
}
const native = gpNative(read('resources/control/gibran_prophet_58585.txt'));
assert.equal(native.length, 62492);
const nativeNoF = native.filter((x) => x !== 0);
assert.equal(nativeNoF.length, 60878);

/**
 * @param {number[]} xs @param {boolean} skipF
 * @returns {number[]}
 */
const project = (xs, skipF) => skipF ? xs.filter((x) => x !== 0) : xs;
/**
 * @param {number[]} a
 * @param {boolean} chain
 * @param {number} ring
 * @returns {{hits:number,eligible:number}}
 */
function countAt256(a, chain, ring) {
  let hits = 0, eligible = 0;
  for (let i = chain ? 1 : 0; i + PERIOD < a.length; i++) {
    const left = chain ? mod(a[i] - a[i-1], ring) : a[i];
    const right = chain ? mod(a[i+PERIOD] - a[i+PERIOD-1], ring) : a[i+PERIOD];
    hits += Number(left === right);
    eligible++;
  }
  return {hits, eligible};
}
/** @param {number[][]} xs @param {boolean} chain @param {number} ring */
function countGroups(xs, chain, ring) {
  const rows = xs.map((x) => countAt256(x, chain, ring));
  return {
    hits: rows.reduce((s, v) => s + v.hits, 0),
    eligible: rows.reduce((s, v) => s + v.eligible, 0),
    perGroup: rows.map((v) => v.hits),
  };
}

/**
 * Native equality under an unknown *same-phase bijection* is invariant even
 * if ciphertext uses predecessor feedback. The plaintext comparison is
 * between its rune identities, not its own differences.
 * @param {number[]} language
 * @param {number[]} lengths
 * @param {boolean} chain
 * @returns {{minimum:number,maximum:number,windows:number}}
 */
function nativeWindowRange(language, lengths, chain) {
  const n = language.length;
  const totalLength = lengths.reduce((a, b) => a + b, 0);
  const pref = new Uint32Array(n + 1);
  for (let i = 0; i + PERIOD < n; i++)
    pref[i + 1] = pref[i] + Number(language[i] === language[i + PERIOD]);
  for (let i = n - PERIOD; i < n; i++) pref[i + 1] = pref[i];
  let off = 0;
  const zones = [];
  for (const length of lengths) {
    const first = off + (chain ? 1 : 0);
    zones.push([first, Math.max(0, length - PERIOD - (chain ? 1 : 0))]);
    off += length;
  }
  let minimum = Infinity, maximum = 0, minAt = -1;
  const windows = n - totalLength + 1;
  for (let start = 0; start < windows; start++) {
    let hits = 0;
    for (const [offset, count] of zones)
      hits += pref[start + offset + count] - pref[start + offset];
    if (hits < minimum) {minimum = hits; minAt = start;}
    if (hits > maximum) maximum = hits;
  }
  return {minimum, maximum, windows, minAt};
}

/** @returns {() => number} */
function prng() {
  let x = 0x3301256;
  return () => {x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return x >>> 0;};
}
const rand = prng();
/** @param {number} alphabet @returns {number[]} */
function randomPermutation(alphabet) {
  const a = Array.from({length:alphabet}, (_, i) => i);
  for (let i = alphabet-1; i > 0; i--) {
    const j = rand() % (i+1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/**
 * Build only source-shaped secret per-phase permutations, no source-text fit.
 * F-transparent cases only permute indices1..28 and expose literal index0.
 * @param {number} groupCount @param {boolean} skipF
 * @returns {number[][][]}
 */
function keys(groupCount, skipF) {
  return Array.from({length:groupCount}, () =>
    Array.from({length:PERIOD}, () =>
      randomPermutation(skipF ? MOD-1 : MOD)
        .map((v) => v + (skipF ? 1 : 0))));
}
/**
 * @param {number[][]} plain
 * @param {boolean} skipF
 * @param {boolean} chain
 * @returns {{cipher:number[][],recovered:number[][]}}
 */
function positive(plain, skipF, chain) {
  const allKeys = keys(plain.length, skipF);
  const ring = skipF ? 28 : 29;
  const cipher = [], recovered = [];
  for (let group = 0; group < plain.length; group++) {
    const key = allKeys[group];
    const cp = [], restored = [];
    let phase = 0, prev = 0;
    for (const symbol of plain[group]) {
      if (skipF && symbol === 0) {cp.push(0); continue;}
      const permutation = key[phase % PERIOD];
      const mapped = permutation[symbol - (skipF ? 1 : 0)];
      let output;
      if (chain) {
        const step = mapped - (skipF ? 1 : 0);
        const next = mod(prev + step + (skipF ? 1 : 0), ring);
        output = next + (skipF ? 1 : 0);
        prev = next;
      } else {
        output = mapped;
      }
      cp.push(output);
      phase++;
    }
    phase = 0; prev = 0;
    for (const symbol of cp) {
      if (skipF && symbol === 0) {restored.push(0); continue;}
      const permutation = key[phase % PERIOD];
      let masked;
      if (chain) {
        const next = symbol - (skipF ? 1 : 0);
        masked = mod(next - prev - (skipF ? 1 : 0), ring)
          + (skipF ? 1 : 0);
        prev = next;
      } else {
        masked = symbol;
      }
      const index = permutation.indexOf(masked);
      assert.ok(index >= 0);
      restored.push(index + (skipF ? 1 : 0));
      phase++;
    }
    cipher.push(cp);
    recovered.push(restored);
  }
  assert.deepEqual(recovered, plain);
  const cmpCipher = countGroups(cipher.map((xs) => project(xs, skipF)), chain, ring);
  const cmpPlain = countGroups(plain.map((xs) => project(xs, skipF)), false, ring);
  // Each source key is a bijection at every repeated phase. Remove the first
  // comparison in the chain model, whose predecessor has a different phase.
  if (!chain) assert.equal(cmpCipher.hits, cmpPlain.hits);
  else {
    let expected = 0;
    for (const xs of plain) {
      const p = project(xs, skipF);
      for (let i = 1; i + PERIOD < p.length; i++)
        expected += Number(p[i] === p[i + PERIOD]);
    }
    assert.equal(cmpCipher.hits, expected);
  }
  return {recovered: recovered.flat().length, encrypted: cipher.flat().length};
}

/** @type {Array<object>} */
const report = [];
for (const split of ['book', 'chapters']) {
  const originalGroups = split === 'book' ? [chapters.flat()] : chapters;
  for (const skipF of [false, true]) {
    const adjusted = originalGroups.map((xs) => project(xs, skipF));
    const lengths = adjusted.map((xs) => xs.length);
    const sourceLanguage = skipF ? nativeNoF : native;
    for (const chain of [false, true]) {
      const ring = skipF ? 28 : 29;
      const original = countGroups(adjusted, chain, ring);
      const reference = nativeWindowRange(sourceLanguage, lengths, chain);
      assert.ok(original.hits < reference.minimum,
        'An original model failed to separate from matched GP native: '
         + JSON.stringify({split, skipF, chain, original, reference}));

      const plant = [];
      let pos = 0;
      for (const xs of originalGroups) {
        if (skipF) {
          const result = xs.map((v) => v === 0 ? 0 : nativeNoF[pos++]);
          plant.push(result);
        } else {
          plant.push(native.slice(pos, pos + xs.length));
          pos += xs.length;
        }
      }
      assert.equal(pos, adjusted.reduce((s,a)=>s+a.length,0));
      const control = positive(plant, skipF, chain);
      report.push({split, skipF, consumer: chain ? 'cipher-step' : 'absolute',
        source: original, matchedNative: reference, plant: control});
      console.log(JSON.stringify(report[report.length-1]));
    }
  }
}

const expected = [
  [435,12700],[449,12699],[434,12242],[450,12241],
  [357,10652],[374,10643],[359,10194],[373,10185]
];
for (let i = 0; i < report.length; i++)
  assert.deepEqual([report[i].source.hits,report[i].source.eligible],expected[i]);
console.log('PASS 8 full original-source all-secret 256-key models; 8 complete native GP positive inverses.');
console.log('No original plaintext or author-selected key; only a repeated fixed phase key (with or without transparent F) has been excluded.');
