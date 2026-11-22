'use strict';

/**
 * Original LP2 p0–p2: historically motivated GF(29²) word-direction key screen.
 *
 * Run in Windows 11 / Node.js 22: node sims/lp2_gf841_word_direction_original_sft.cjs
 * The source model uses H(X)=3+26X+24X² from signed 2013 BASE29 3301
 * and G(X)=15(X+5)² from original p39 red title. It is a candidate,
 * not a documented creator-chosen key or an authenticated LP2 decoder.
 *
 * Uses 2016 "their numbers are the direction" for parity of each original
 * complete printed word's GP-prime sum. Source-visible word boundaries
 * survive physical page breaks. Screens the exact 18 × 2 sign × 2
 * anti-repeat × 2 direction × 2 trace family = 288 phase-zero modes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const text = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const id = new Map(corpus.runes.map((r, i) => [r, i]));
const allWords = [];
let word = [];
for (const ch of text) {
  if (id.has(ch)) {
    word.push(id.get(ch));
  } else if (ch === '-' || ch === '.' || ch === '§' || ch === '&') {
    if (word.length) allWords.push(word);
    word = [];
  }
}
if (word.length) allWords.push(word);
const words = allWords.slice(0, 2896);
const source = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(source.length, 12956);
assert.deepEqual(words.flat(), source);
assert.equal(words.length, 2896);
const openingWords = words.slice(0, 158);
const opening = openingWords.flat();
assert.equal(opening.length, 729);

// H/24's root alpha satisfies alpha²=18+11alpha, with order exactly 840.
// Its field trace is 2a+11b for alpha^j=a+b alpha. G's double
// root is 24 in GF29, order 7. Both keys are fixed from these factors.
const keys = [[], []];
let a = 1, b = 0, pow24 = 1;
for (let j = 0; j < 840; j++) {
  const trace = (2 * a + 11 * b) % 29;
  keys[0].push(trace);
  keys[1].push(trace * pow24 % 29);
  [a, b] = [18 * b % 29, (a + 11 * b) % 29];
  pow24 = pow24 * 24 % 29;
}
assert.deepEqual([a, b, pow24], [1, 0, 1]);

const fixedDirs = openingWords.map(w =>
  w.reduce((sum, rune) => sum + corpus.prime[rune], 0) % 2 ? 1 : -1
);
const wrap = j => (j % 840 + 840) % 840;

/**
 * The historical pdir engine's three-digit convention:
 * h: backward-word first read (same/one step back),
 * m: interword move (none/old direction/new direction),
 * cmp: backward collision comparator (preceding rune, word-local,
 * last-backward emitted). All are source-independent fixed options.
 * @param {number[]} c Original GP29 ciphertext (or control ciphertext)
 * @param {number} flip Global sign of source word-prime directions
 * @param {number} h Historical first-read convention, 0..1
 * @param {number} m Historical interword convention, 0..2
 * @param {number} cmp Historical backward comparator, 0..2
 * @returns {{d:number[],mv:number[],pv:number[]}} Frozen pointer plan
 */
function plan(c, flip, h, m, cmp) {
  const d = [], mv = [], pv = [];
  let old = 1, lastBack = -1, at = 0;
  for (let t = 0; t < openingWords.length; t++) {
    const direction = fixedDirs[t] * flip;
    for (let j = 0; j < openingWords[t].length; j++) {
      const i = at + j, prev = i > 0 ? c[i - 1] : -1;
      d[i] = direction;
      mv[i] = j === 0
        ? (t > 0 ? (m === 0 ? 0 : m === 1 ? old : direction) : 0)
            + (direction < 0 && h === 1 ? -1 : 0)
        : 0;
      pv[i] = direction > 0 || cmp === 0
        ? prev
        : cmp === 1 ? (j === 0 ? -1 : prev) : lastBack;
      if (direction < 0) lastBack = c[i];
    }
    at += openingWords[t].length;
    old = direction;
  }
  return {d, mv, pv};
}

/**
 * Beam-16 real or planted pdir LAST/coin inversion, preserving exact
 * historical branch predicates. Infinite periodic GF841 stream avoids
 * arbitrary padding/offset effects; initial phase is strictly zero.
 * @param {number[]} c Input ciphertext
 * @param {number[]} key One of two original source derived 840-period streams
 * @param {number} sign Additive operand +1 or -1
 * @param {number} model 0=LAST collision skip, 1=coin event
 * @param {number} flip Source word-prime direction orientation
 * @param {number} h See plan
 * @param {number} m See plan
 * @param {number} cmp See plan
 * @param {number} n Ciphertext symbols to decode
 * @returns {number} GP29 normalized index of coincidence
 */
function decode(c, key, sign, model, flip, h, m, cmp, n) {
  const {d, mv, pv} = plan(c, flip, h, m, cmp);
  const k = j => (sign * key[wrap(j)] + 29) % 29;
  let states = [{j: 0, score: 0, counts: new Uint16Array(29)}];
  for (let i = 0; i < n; i++) {
    const candidates = new Map(), previous = pv[i], ci = c[i], step = d[i];
    for (const state of states) {
      const j = state.j + mv[i];
      const k0 = k(j), k1 = k(j + step), k2 = k(j + 2 * step);
      const t0 = (ci - k0 + 29) % 29;
      const t1 = (ci - k1 + 29) % 29;
      const t2 = (ci - k2 + 29) % 29;
      const offers = [[t0, j + (model === 1 && previous === ci ? 2 : 1) * step]];
      if (previous >= 0) {
        if (model === 0) {
          if ((t1 + k0) % 29 === previous) offers.push([t1, j + 2 * step]);
          if ((t2 + k0) % 29 === previous && (t2 + k1) % 29 === previous) {
            offers.push([t2, j + 3 * step]);
          }
        } else if ((t2 + k0) % 29 === previous) {
          offers.push([t2, j + 3 * step]);
        }
      }
      for (const [rune, nextJ] of offers) {
        const score = state.score + 2 * state.counts[rune];
        const older = candidates.get(nextJ);
        if (!older || score > older.score) {
          const counts = state.counts.slice();
          counts[rune]++;
          candidates.set(nextJ, {j: nextJ, score, counts});
        }
      }
    }
    states = Array.from(candidates.values())
      .sort((x, y) => y.score - x.score).slice(0, 16);
    assert.ok(states.length);
  }
  return 29 * states[0].score / (n * (n - 1));
}

// A source-native positive, retaining all original first-300 word cuts.
// The fixed direction sequence is externally supplied for the plant,
// so this tests exact pointer/skip mechanics, not the key-selection claim.
const known = corpus.pages.find(p => p.page === 57).indices;
assert.equal(known.length, 95);
const plaintext = Array.from({length: 300}, (_, i) => known[i % 95]);
const layout = plan(opening, 1, 0, 0, 0);
const planted = [];
let pointer = 0, skipped = 0;
for (let i = 0; i < 300; i++) {
  const step = layout.d[i], start = pointer + layout.mv[i];
  let selected = -1, used = 0;
  for (let retry = 0; retry < 3; retry++) {
    const trial = (plaintext[i] + keys[0][wrap(start + retry * step)]) % 29;
    if (retry === 2 || i === 0 || trial !== planted[i - 1]) {
      selected = trial;
      used = retry;
      break;
    }
  }
  planted.push(selected);
  skipped += used;
  pointer = start + (used + 1) * step;
}
const plantScore = decode(planted, keys[0], 1, 0, 1, 0, 0, 0, 300);
const counts = Array(29).fill(0);
for (const p of plaintext) counts[p]++;
const expected = 29 * counts.reduce((s, c) => s + c * (c - 1), 0) / (300 * 299);
assert.ok(Math.abs(plantScore - expected) < 1e-12);
assert.equal(skipped, 10);
assert.ok(plantScore > 1.4);

// Precisely 288 unmodified original hypotheses, with all input variables
// chosen by visible historical sources or the frozen external pdir design.
const candidates = [];
for (let keyIndex = 0; keyIndex < 2; keyIndex++)
for (const flip of [-1, 1])
for (const h of [0, 1])
for (const m of [0, 1, 2])
for (const cmp of [0, 1, 2])
for (const sign of [-1, 1])
for (const model of [0, 1]) {
  const ioc = decode(opening, keys[keyIndex], sign, model, flip, h, m, cmp, 300);
  candidates.push({keyIndex, flip, h, m, cmp, sign, model, ioc});
}
assert.equal(candidates.length, 288);
candidates.sort((x, y) => y.ioc - x.ioc);
assert.ok(Math.abs(candidates[0].ioc - 1.1503010033444816) < 1e-12);
assert.equal(candidates.filter(x => x.ioc >= 1.40).length, 0);
console.log(JSON.stringify({
  cipher: 'Original p0-p2 first 300 of 729 GP29 symbols',
  source: 'H=2013 BASE29 3301; G=p39 red quadratic; 2016 word-prime directions',
  variants: candidates.length,
  sourceNativePositive: {runes: 300, skips: skipped, ioc: plantScore},
  original: {best: candidates[0], countGe140: 0}
}, null, 2));


// AFFINE H/G READER: An independent, completely fixed, reversible use
// of *both* original source factors at each pointer position:
//   C = 24^j * P ± Trace(alpha^j) mod29  OR
//   C = 24^j * (P ± Trace(alpha^j)) mod29.
// Unlike additive trace, this includes the p39 root as the GP alphabet's
// finite-field multiplier and needs no guessed 29x29 substitution table.
const factors = [], inverseFactors = [];
for (let j = 0, v = 1; j < 840; j++, v = v * 24 % 29) {
  factors.push(v);
  inverseFactors.push((() => {
    for (let t = 1; t < 29; t++) if (t * v % 29 === 1) return t;
    throw Error('Noninvertible G root');
  })());
}

/**
 * Exact 16-beam pdir inverse with source-derived affine GP29 operator.
 * @param {number[]} c Source-shaped GP29 ciphertext
 * @param {number} type 0: root-multiply then trace-add; 1: multiply both
 * @param {number} sign Sign of the historical H root's trace
 * @param {number} model 0=LAST skip / 1=coin
 * @param {number} flip ±1 word-direction orientation
 * @param {number} h 0..1 backward first-read
 * @param {number} m 0..2 interword step
 * @param {number} cmp 0..2 backward comparison
 * @param {number} n Prefix length
 * @returns {number} Normalized GP29 plaintext IoC
 */
function decodeAffine(c, type, sign, model, flip, h, m, cmp, n) {
  const {d, mv, pv} = plan(c, flip, h, m, cmp);
  const shifted = j => (sign * keys[type][wrap(j)] + 29) % 29;
  const encrypt = (plain, j) =>
    (factors[wrap(j)] * plain + shifted(j)) % 29;
  const decrypt = (cipher, j) =>
    ((cipher - shifted(j) + 29) * inverseFactors[wrap(j)]) % 29;
  let states = [{j: 0, score: 0, counts: new Uint16Array(29)}];
  for (let i = 0; i < n; i++) {
    const next = new Map(), previous = pv[i], ci = c[i], step = d[i];
    for (const state of states) {
      const j = state.j + mv[i];
      const p0 = decrypt(ci, j);
      const p1 = decrypt(ci, j + step);
      const p2 = decrypt(ci, j + 2 * step);
      const offers = [[p0, j + (model === 1 && previous === ci ? 2 : 1) * step]];
      if (previous >= 0) {
        if (model === 0) {
          if (encrypt(p1, j) === previous) offers.push([p1, j + 2 * step]);
          if (encrypt(p2, j) === previous && encrypt(p2, j + step) === previous) {
            offers.push([p2, j + 3 * step]);
          }
        } else if (encrypt(p2, j) === previous) {
          offers.push([p2, j + 3 * step]);
        }
      }
      for (const [plain, nextJ] of offers) {
        const score = state.score + 2 * state.counts[plain];
        const older = next.get(nextJ);
        if (!older || score > older.score) {
          const counts = state.counts.slice();
          counts[plain]++;
          next.set(nextJ, {j: nextJ, score, counts});
        }
      }
    }
    states = Array.from(next.values()).sort((x, y) => y.score - x.score).slice(0, 16);
    assert.ok(states.length);
  }
  return 29 * states[0].score / (n * (n - 1));
}

// The source-native positive uses a genuinely reversibly affine-modulated
// ciphertext with 16 hidden collision skips. This checks whether the
// hypothesized class can be *detected*; a max-IoC beam can score above its
// exact source plant by preferentially choosing false paths.
const affinePlan = plan(opening, 1, 0, 0, 0);
const affinePlant = [];
let affinePointer = 0, affineSkips = 0;
for (let i = 0; i < 300; i++) {
  const j = affinePointer + affinePlan.mv[i], step = affinePlan.d[i];
  let chosen = -1, retries = 0;
  for (let retry = 0; retry < 3; retry++) {
    const k = wrap(j + retry * step);
    const trial = (factors[k] * plaintext[i] + keys[0][k]) % 29;
    if (retry === 2 || i === 0 || trial !== affinePlant[i - 1]) {
      chosen = trial;
      retries = retry;
      break;
    }
  }
  affinePlant.push(chosen);
  affinePointer = j + (retries + 1) * step;
  affineSkips += retries;
}
const affinePlantScore = decodeAffine(affinePlant, 0, 1, 0, 1, 0, 0, 0, 300);
assert.equal(affineSkips, 16);
assert.ok(affinePlantScore >= 1.40);

const affineOriginal = [];
for (let type = 0; type < 2; type++)
for (const flip of [-1, 1])
for (const h of [0, 1])
for (const m of [0, 1, 2])
for (const cmp of [0, 1, 2])
for (const sign of [-1, 1])
for (const model of [0, 1]) {
  affineOriginal.push({type, flip, h, m, cmp, sign, model,
    ioc: decodeAffine(opening, type, sign, model, flip, h, m, cmp, 300)});
}
affineOriginal.sort((x, y) => y.ioc - x.ioc);
assert.equal(affineOriginal.length, 288);
assert.ok(Math.abs(affineOriginal[0].ioc - 1.1451282051282052) < 1e-12);
assert.equal(affineOriginal.filter(x => x.ioc >= 1.40).length, 0);
console.log(JSON.stringify({
  cipher: 'Original first300 H/G field-affine pdir inverse',
  variants: affineOriginal.length,
  sourceNativePositive: {runes: 300, skips: affineSkips, ioc: affinePlantScore},
  original: {best: affineOriginal[0], countGe140: 0}
}, null, 2));
