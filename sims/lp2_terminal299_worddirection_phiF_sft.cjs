'use strict';

/**
 * LP2 p54-red-title separation: exact 299 black-rune word-direction gates.
 * Tests both word reversal and genuine p56 +/- prime pointer with literal-F
 * transparency; native GP29 A/I/O printed-word necessary constraint; fixed
 * solved-LP1 bigram model on the eight survivors, exact reencryption.
 *
 * SFT: node sims/lp2_terminal299_worddirection_phiF_sft.cjs (Windows Node22)
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const src = JSON.parse(fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const txt = fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const lp1 = fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');
const runeMap = new Map(src.runes.map((r, i) => [r, i]));
const cipher = src.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const pages = [];
let pos = 0;
for (const p of src.pages) {
  pages[p.page] = pos;
  if (p.page <= 55) pos += p.indices.length;
}
assert.equal(pos, 12956);

const words = [];
const parsed = [];
let wordStart = -1;
for (const ch of txt) {
  if (parsed.length >= cipher.length) break;
  if (runeMap.has(ch)) {
    if (wordStart < 0) wordStart = parsed.length;
    parsed.push(runeMap.get(ch));
  } else if (ch !== '/' && ch !== '%' && !/\s/.test(ch) && wordStart >= 0) {
    words.push([wordStart, parsed.length]);
    wordStart = -1;
  }
}
if (wordStart >= 0) words.push([wordStart, parsed.length]);
assert.equal(words.length, 2896);
assert.deepEqual(parsed, cipher);

const lo = pages[54] + 9;
const hi = pages[55] + src.pages[55].indices.length;
const spans = words.filter(([a, b]) => a >= lo && b <= hi);
assert.equal(hi - lo, 299);
assert.equal(spans.length, 64);
assert.equal(spans[0][0], lo);
assert.equal(spans.at(-1)[1], hi);
assert.deepEqual(spans.filter(([a, b]) => b - a === 1)
  .map(([a]) => a - lo), [113]);
const primeKey = [];
const sieve = new Uint8Array(190000);
for (let p = 2; p < sieve.length && primeKey.length < 9000; p++) {
  if (sieve[p]) continue;
  primeKey.push((p - 1) % 29);
  if (p * p < sieve.length)
    for (let j = p * p; j < sieve.length; j += p) sieve[j] = 1;
}
assert.equal(primeKey.length, 9000);
const mod = n => ((n % 29) + 29) % 29;
const isPrime = n => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};
const rules = [
  ['none', () => false],
  ['length-even', x => x.n % 2 === 0],
  ['previous-primesum-even', x => x.prev !== null && x.prev % 2 === 0],
  ['previous-primesum-isprime', x => x.prev !== null && isPrime(x.prev)],
  ['ordinal-even', x => x.ordinal % 2 === 0]
];

/** Original-source fixed values; source heading is not included. */
function prepare(mode, rule, polarity) {
  const tape = cipher.slice(lo, hi);
  const directions = new Int8Array(tape.length);
  const singletons = new Uint8Array(tape.length);
  let prev = null;
  let ordinal = 0;
  for (const [a, b] of spans) {
    const sum = cipher.slice(a, b)
      .reduce((n, c) => n + src.prime[c], 0);
    const take = rule({prev, n: b - a, ordinal: ++ordinal});
    if (mode === 'reversal' && Boolean(take) !== Boolean(polarity)) {
      for (let x = a - lo, y = b - lo - 1; x < y; x++, y--)
        [tape[x], tape[y]] = [tape[y], tape[x]];
    }
    for (let i = a - lo; i < b - lo; i++)
      directions[i] = (take ? 1 : -1) * Number(polarity);
    if (b - a === 1) singletons[a - lo] = 1;
    prev = sum;
  }
  return {tape, directions, singletons};
}

/** Full-branch legal inverse with source-singleton A/I/O if enabled. */
function reach(data, start, mode, grammar = false) {
  let states = new Set([0]);
  for (let i = 0; i < data.tape.length; i++) {
    const next = new Set();
    const c = data.tape[i];
    const restricted = grammar && Boolean(data.singletons[i]);
    for (const delta of states) {
      const j = start + delta;
      if (c === 0 && !restricted) next.add(delta);
      if (j < 0 || j >= primeKey.length) continue;
      const p = mod(c - primeKey[j]);
      if (p !== 0 && (!restricted || [24, 10, 3].includes(p)))
        next.add(delta + (mode === 'reversal' ? 1 : data.directions[i]));
    }
    if (!next.size) return i;
    states = next;
  }
  return data.tape.length;
}

const gpTokens = src.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
function gpWord(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let i = 0; i < s.length;) {
    const hit = gpTokens.find(t => s.startsWith(t.s, i));
    if (!hit) return null;
    out.push(hit.i);
    i += hit.s.length;
  }
  return out;
}
const training = lp1.split('### 56')[0].split('\n')
  .filter(x => !x.trim().startsWith('#') && !x.includes('['))
  .flatMap(x => x.toUpperCase().match(/[A-Z]{2,}/g) || [])
  .map(gpWord).filter(Boolean);
const dictionary = new Set(training.map(w => w.join(',')));
const counts = Array.from({length: 30}, () => Array(29).fill(0.2));
for (const w of training) {
  let prev = 29;
  for (const p of w) {
    counts[prev][p] += 1;
    prev = p;
  }
}
const score = counts.map(row => {
  const sum = row.reduce((a, b) => a + b, 0);
  return row.map(x => Math.log(x / sum));
});

/** Source/grammar-constrained Viterbi over both F paths and pointer direction. */
function decode(data, start, mode) {
  let states = new Map([[29, {delta: 0, last: 29, value: 0, parent: null}]]);
  for (let i = 0; i < data.tape.length; i++) {
    const next = new Map();
    const c = data.tape[i];
    const constrained = Boolean(data.singletons[i]);
    for (const old of states.values()) {
      const j = start + old.delta;
      const candidates = c === 0 && !constrained
        ? [{p: 0, delta: old.delta}] : [];
      if (j >= 0 && j < primeKey.length) {
        const p = mod(c - primeKey[j]);
        if (p !== 0 && (!constrained || [24, 10, 3].includes(p)))
          candidates.push({p, delta: old.delta +
            (mode === 'reversal' ? 1 : data.directions[i])});
      }
      for (const cand of candidates) {
        const value = old.value + score[old.last][cand.p];
        const stateKey = cand.delta * 30 + cand.p;
        const found = next.get(stateKey);
        if (!found || found.value < value)
          next.set(stateKey, {...cand, last: cand.p,
            value, parent: old});
      }
    }
    if (!next.size) return null;
    states = next;
  }
  const best = [...states.values()].reduce((a, b) =>
    !a || a.value < b.value ? b : a, null);
  const plain = new Array(data.tape.length);
  let step = best;
  for (let i = plain.length - 1; i >= 0; i--) {
    plain[i] = step.last;
    step = step.parent;
  }
  let keyPointer = start;
  const reencryption = plain.map((p, i) => {
    if (p === 0) return 0;
    const c = mod(p + primeKey[keyPointer]);
    keyPointer += (mode === 'reversal' ? 1 : data.directions[i]);
    return c;
  });
  assert.deepEqual(reencryption, data.tape,
    'exact whole-receiver forward reencryption');
  const exactWords = spans.filter(([a, b]) =>
    dictionary.has(plain.slice(a - lo, b - lo).join(','))).length;
  const hist = new Array(29).fill(0);
  for (const p of plain) hist[p] += 1;
  const ioc = hist.reduce((v, n) => v + n * (n - 1), 0) /
    (plain.length * (plain.length - 1));
  return {
    start, scorePerRune: best.value / plain.length, ioc,
    singleton: src.translit[plain[113]],
    dictionaryMatches: exactWords, printedWords: spans.length,
    opening: spans.map(([a, b]) => plain.slice(a - lo, b - lo)
      .map(x => src.translit[x]).join('')).join(' ').slice(0, 220)
  };
}

/** Original solved p56 cipher source authenticity and F-skip control. */
const p56Plain = ('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(gpWord);
assert.equal(p56Plain.length, 85);
let used = 0;
const p56Cipher = p56Plain.map(p => p === 0 ? 0 :
  mod(p + primeKey[used++]));
assert.deepEqual(p56Cipher, src.pages[56].indices);

const results = [];
let mechanical = 0;
for (const mode of ['reversal', 'pointer']) {
  for (const [label, fn] of rules) {
    const polarities = mode === 'reversal'
      ? (label === 'none' ? [false] : [false, true])
      : (label === 'none' ? [1] : [1, -1]);
    for (const polarity of polarities) {
      const data = prepare(mode, fn, polarity);
      const compatible = [];
      const mechanicallyViable = [];
      for (let start = 0; start < 5000; start++) {
        if (reach(data, start, mode, false) === data.tape.length)
          mechanicallyViable.push(start);
        if (reach(data, start, mode, true) === data.tape.length)
          compatible.push(start);
      }
      assert.ok(compatible.every(k => mechanicallyViable.includes(k)));
      mechanical += mechanicallyViable.length;
      results.push({mode, label, polarity,
        mechanical: mechanicallyViable.length,
        grammar: compatible.length, candidates: compatible.map(k =>
          decode(data, k, mode))});
    }
  }
}
assert.equal(mechanical, 83);
const viable = results.flatMap(x => x.candidates);
assert.equal(viable.length, 8);
assert.ok(viable.every(x => x.ioc < 0.04));
assert.ok(viable.every(x => x.scorePerRune < -4.4));
console.log(JSON.stringify({
  original: 'p54 black body after nine-rune red title + p55, 299 runes',
  originalPrintedWords: 64, originalSingletonLocal: 113,
  source: 'unaltered GP29, original word breaks across p55',
  originalP56Positive: '85/85 exact plaintext forward re-encryption',
  estimatedEnglish: 'LP1 native GP29 bigram, 718 words/2995 runes, 0.2 pseudocount',
  finiteModels: '2 modes × 9 rule-orientation choices × 5000 prime ordinal starts',
  results, candidatesSortedByScore: viable.sort((a, b) =>
    b.scorePerRune - a.scorePerRune),
  decision: 'Eight black-only singleton-compatible mathematical paths remain, all nonprose; red-heading-based terminal exclusion must not be used for black-only inference.'
}, null, 2));
