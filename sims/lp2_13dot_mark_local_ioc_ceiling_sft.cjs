'use strict';

/**
 * Original-input, all-key IoC ceiling for a mark-local 29-state predecessor
 * cipher with arbitrary independent output bijections in each predecessor row.
 * Run: node sims/lp2_13dot_mark_local_ioc_ceiling_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} name */
const load = (name) => fs.readFileSync(path.join(root, name), 'utf8');
/** @param {string} name */
const json = (name) => JSON.parse(load(name));

const corpus = json('resources/liber-primus/lp2-corpus.json');
const ink = json('resources/liber-primus/lp2-ink-annotations.json');
const Q = 29;
const original = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
assert.equal(original.length, 12956);

const pageStarts = new Map();
let nTotal = 0;
for (const page of corpus.pages) {
  pageStarts.set(page.page, nTotal);
  nTotal += page.indices.length;
}
const marks = ink.pages.filter((p) => p.page <= 55)
  .flatMap((p) => (p.large_punctuation || [])
    .filter((m) => m[1] === 13)
    .map((m) => pageStarts.get(p.page) + m[0]))
  .sort((a, b) => a - b);
assert.equal(marks.length, 28);
assert.equal(marks[marks.length - 1], original.length);
const boundaries = [0, ...marks];

const names = corpus.translit.map((name, index) => ({ name, index }))
  .sort((a, b) => b.name.length - a.name.length);
function encode(text, alternate) {
  let cleaned = text.replace(/^#.*$/gm, ' ').toUpperCase();
  if (alternate) cleaned = cleaned.replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  cleaned = cleaned.replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/Q/g, 'C');
  const result = [];
  for (const word of cleaned.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const found = names.find((s) => word.startsWith(s.name, i));
      assert.ok(found, 'Unmapped GP plaintext input: ' + word);
      result.push(found.index);
      i += found.name.length;
    }
  }
  return result;
}

const sourcePaths = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt'],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['LP1', 'resources/liber-primus/lp1-plaintext-reference.txt']
];
const sources = [];
for (const [name, sourcePath] of sourcePaths) {
  let text = load(sourcePath);
  if (name === 'LP1') text = text.split(/^### 56\s*$/m)[0];
  for (const alternate of [false, true]) {
    sources.push({
      name: name + (alternate ? '/alt' : '/regular'),
      seq: encode(text, alternate)
    });
  }
}

/** @param {number[]} seq */
function ioc(seq) {
  if (seq.length < 2) return 0;
  const f = new Uint32Array(Q);
  for (const x of seq) f[x]++;
  let collisions = 0;
  for (const v of f) collisions += v * (v - 1);
  return collisions / (seq.length * (seq.length - 1));
}

/**
 * Exact attainable maximum over all 29! permutations for EACH row.
 * Pairwise rearrangement inequality aligns all descending row frequencies;
 * the free first plaintext rune is assigned to the largest column.
 * @param {number[]} seq
 */
function ceiling(seq) {
  assert.ok(seq.length > 1);
  const rows = Array.from({ length: Q }, () => new Uint32Array(Q));
  for (let i = 1; i < seq.length; i++) rows[seq[i - 1]][seq[i]]++;
  const histogram = new Uint32Array(Q);
  for (const row of rows) {
    const sorted = Array.from(row).sort((a, b) => b - a);
    for (let k = 0; k < Q; k++) histogram[k] += sorted[k];
  }
  histogram[0]++;
  const maxIoC = Array.from(histogram).reduce((s, v) => s + v * (v - 1), 0)
    / (seq.length * (seq.length - 1));

  // Explicit original-input witness: a bijection per predecessor row that
  // attains the bound, including a free first plaintext rune.
  const inverse = rows.map((row) => Array.from({ length: Q }, (_, x) => x)
    .sort((a, b) => row[b] - row[a] || a - b));
  const inverseMap = inverse.map((ord) => {
    const map = new Uint8Array(Q);
    ord.forEach((cipherSymbol, rank) => { map[cipherSymbol] = rank; });
    return map;
  });
  const witness = new Uint8Array(seq.length);
  witness[0] = 0;
  for (let i = 1; i < seq.length; i++) {
    witness[i] = inverseMap[seq[i - 1]][seq[i]];
  }
  assert.ok(Math.abs(ioc(witness) - maxIoC) < 1e-12);
  return { maxIoC, histogram: Array.from(histogram), witness: Array.from(witness) };
}

/**
 * Minimum ordinary GP29 index of coincidence of every length-N source window,
 * including positions that would cut across original word boundaries; thus
 * this is a deliberately generous reference set.
 * @param {number[]} seq
 * @param {number} n
 */
function minSlidingIoC(seq, n) {
  if (n > seq.length) return null;
  const f = new Uint32Array(Q);
  for (let i = 0; i < n; i++) f[seq[i]]++;
  let collisions = Array.from(f).reduce((s, v) => s + v * (v - 1), 0);
  let best = collisions;
  let at = 0;
  for (let i = n; i < seq.length; i++) {
    const prev = seq[i - n];
    collisions -= 2 * (f[prev] - 1);
    f[prev]--;
    const next = seq[i];
    collisions += 2 * f[next];
    f[next]++;
    if (collisions < best) {
      best = collisions;
      at = i - n + 1;
    }
  }
  const exact = ioc(seq.slice(at, at + n));
  assert.ok(Math.abs(exact - best / (n * (n - 1))) < 1e-12);
  return { ioc: best / (n * (n - 1)), at };
}

// Source-native positive with a deterministic arbitrary row-bijective cipher.
let state = 0x33011337;
function next() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
function shuffledRow() {
  const row = Array.from({ length: Q }, (_, i) => i);
  for (let i = Q - 1; i > 0; i--) {
    const j = next() % (i + 1);
    [row[i], row[j]] = [row[j], row[i]];
  }
  return row;
}
function encrypt(plain) {
  const rows = Array.from({ length: Q }, () => shuffledRow());
  const ciphertext = new Uint8Array(plain.length);
  ciphertext[0] = plain[0];
  for (let i = 1; i < plain.length; i++) {
    ciphertext[i] = rows[ciphertext[i - 1]][plain[i]];
  }
  const inverse = rows.map((row) => {
    const map = new Uint8Array(Q);
    row.forEach((cipherSymbol, p) => { map[cipherSymbol] = p; });
    return map;
  });
  const decoded = new Uint8Array(plain.length);
  decoded[0] = ciphertext[0];
  for (let i = 1; i < plain.length; i++) {
    decoded[i] = inverse[ciphertext[i - 1]][ciphertext[i]];
  }
  assert.deepEqual(Array.from(decoded), plain);
  return Array.from(ciphertext);
}

const verdicts = [];
let totalExcludedRunes = 0;
for (let interval = 0; interval + 1 < boundaries.length; interval++) {
  const a = boundaries[interval], b = boundaries[interval + 1], n = b - a;
  if (n < 150) continue;
  const originalSequence = original.slice(a, b);
  const max = ceiling(originalSequence);
  const minima = sources
    .map((source) => ({ source: source.name, value: minSlidingIoC(source.seq, n) }))
    .filter((x) => x.value !== null);
  minima.sort((x, y) => x.value.ioc - y.value.ioc);
  const minSourceIoC = minima[0].value.ioc;
  const excludesAllSourceWindows = minSourceIoC > max.maxIoC + 1e-12;
  if (excludesAllSourceWindows) totalExcludedRunes += n;
  const sourcePositive = sources.find((s) => s.name === 'Gibran/regular').seq.slice(0, n);
  const encrypted = encrypt(sourcePositive);
  const controlBound = ceiling(encrypted).maxIoC;
  assert.ok(ioc(sourcePositive) <= controlBound + 1e-12);
  verdicts.push({
    interval, start:a, end:b, length:n,
    originalCipherIoC: +ioc(originalSequence).toFixed(9),
    exactMaximumPlainIoC: +max.maxIoC.toFixed(9),
    sourceMinimum: minima[0].source,
    sourceMinIoC: +minSourceIoC.toFixed(9),
    sourceMinAt: minima[0].value.at,
    excludedAgainstAllEightNativeSourceVariants: excludesAllSourceWindows,
    nativePlantedIoC: +ioc(sourcePositive).toFixed(9),
    nativePlantedMaximum: +controlBound.toFixed(9),
    boundWitnessExact: true
  });
}
console.log(JSON.stringify({
  model: 'For each original 13-dot interval, C[i]=S_interval[C[i-1]][P[i]], where each of 29 predecessor-state rows is an unrestricted bijection and the interval first plaintext rune is free.',
  invariant: 'Exact maximum possible GP29 plaintext IoC from rearrangement inequality; independently sort the 29 counts in each predecessor row, align rank columns, and add one arbitrary first rune to the largest column.',
  source: { ciphertextRunes:original.length, thirteenDotMarks:marks.length,
    includedReferenceVariants:sources.map((s)=>({name:s.name,runes:s.seq.length})) },
  control: 'Each nonempty long interval has a deterministic planted source-native GP29 encryption/decryption positive. The derived upper bound is attained by a constructive inverse of the real ciphertext.',
  longIntervals: verdicts,
  totalExcludedOriginalRunes: totalExcludedRunes,
  caveat: 'Exclusion is exact for ALL secret row permutations against the specified native-GP source windows with this interval boundary; this is not a theorem against every possible English passage or nonstationary cipher.'
}, null, 2));
