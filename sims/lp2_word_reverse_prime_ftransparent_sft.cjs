'use strict';

/**
 * Source-constrained word-direction original-cipher gate.
 *
 * The 2016 signed "their numbers are the direction" clue motivates a
 * low-parameter reversal of complete source-printed words. After that
 * reversible step, apply the historically authentic p56 phi(prime)-key
 * inverse with plaintext F bypass. Search starts 0..4999, not free keys.
 *
 * Read-only SFT: node sims/lp2_word_reverse_prime_ftransparent_sft.cjs
 * Native Windows 11 / Node 22, no external packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const src = JSON.parse(fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const reference = fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');
const q = 29;
const mod = n => ((n % q) + q) % q;
const runeMap = new Map(src.runes.map((r, i) => [r, i]));
const unknown = src.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const pageStart = [];
let global = 0;
for (const page of src.pages) {
  pageStart[page.page] = global;
  if (page.page <= 55) global += page.indices.length;
}
assert.equal(global, 12956);

const words = [];
const direct = [];
let first = -1;
for (const ch of transcript) {
  if (direct.length === 12956) break;
  if (runeMap.has(ch)) {
    if (first < 0) first = direct.length;
    direct.push(runeMap.get(ch));
  } else if (ch !== '/' && ch !== '%' && !/\s/.test(ch) && first >= 0) {
    words.push([first, direct.length]);
    first = -1;
  }
}
if (first >= 0) words.push([first, direct.length]);
assert.equal(words.length, 2896);
assert.deepEqual(direct, unknown, 'exact unchanged original printed text');

const sieve = new Uint8Array(190000);
const key = [];
for (let p = 2; p < sieve.length && key.length < 9000; p++) {
  if (sieve[p]) continue;
  key.push((p - 1) % q);
  if (p * p < sieve.length)
    for (let j = p * p; j < sieve.length; j += p) sieve[j] = 1;
}
assert.equal(key.length, 9000);

const gpTokens = src.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} word @returns {number[] | null} */
function gpWord(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let i = 0; i < s.length;) {
    const tok = gpTokens.find(t => s.startsWith(t.s, i));
    if (!tok) return null;
    out.push(tok.i);
    i += tok.s.length;
  }
  return out;
}

const training = reference.split('### 56')[0].split('\n')
  .filter(line => !line.trim().startsWith('#') && !line.includes('['))
  .flatMap(line => line.toUpperCase().match(/[A-Z]{2,}/g) || [])
  .map(gpWord).filter(Boolean);
const bigram = Array.from({length: 30}, () => Array(q).fill(0.2));
for (const w of training) {
  let prev = 29;
  for (const c of w) {
    bigram[prev][c]++;
    prev = c;
  }
}
const logp = bigram.map(row => {
  const total = row.reduce((a, b) => a + b, 0);
  return row.map(n => Math.log(n / total));
});

function isPrime(x) {
  if (x < 2) return false;
  for (let p = 2; p * p <= x; p++) if (x % p === 0) return false;
  return true;
}
const rules = [
  ['none', () => false],
  ['current-length-even', x => x.n % 2 === 0],
  ['previous-GP-primesum-even', x => x.prev !== null && x.prev % 2 === 0],
  ['previous-GP-primesum-isprime', x => x.prev !== null && isPrime(x.prev)],
  ['word-ordinal-even', x => x.ordinal % 2 === 0]
];

/** Reverse entire source-printed words, after a predeclared rule. */
function transform(lo, hi, spans, fn, inversePolarity) {
  const result = unknown.slice(lo, hi);
  let prev = null;
  let ordinal = 0;
  for (const [a, b] of spans) {
    const sum = unknown.slice(a, b).reduce((v, c) => v + src.prime[c], 0);
    const use = Boolean(fn({n: b - a, prev, ordinal: ++ordinal}));
    if (use !== inversePolarity) {
      for (let x = a - lo, y = b - lo - 1; x < y; x++, y--)
        [result[x], result[y]] = [result[y], result[x]];
    }
    prev = sum;
  }
  return result;
}

/**
 * All-branch transparent-plaintext-F reachability, no plaintext fitting.
 * States with same consumed prime count are future-equivalent.
 * @param {number[]} ciphertext
 * @param {number} start
 */
function furthest(ciphertext, start, singletonPositions = new Set()) {
  let states = [0];
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    const seen = new Uint8Array(i + 2);
    const next = [];
    for (const used of states) {
      if (c === 0 && !singletonPositions.has(i) && !seen[used]) {
        seen[used] = 1;
        next.push(used);
      }
      const plain = mod(c - key[start + used]);
      if (plain !== 0 && (!singletonPositions.has(i) ||
          [24, 10, 3].includes(plain)) && !seen[used + 1]) {
        seen[used + 1] = 1;
        next.push(used + 1);
      }
    }
    if (!next.length) return i;
    states = next;
  }
  return ciphertext.length;
}

/** Exactly invert legal p56 streams, ranking F paths by a fixed LP1 bigram. */
function viterbi(ciphertext, start) {
  let states = new Map([[29, {used: 0, last: 29, score: 0, parent: null}]]);
  for (const c of ciphertext) {
    const next = new Map();
    for (const old of states.values()) {
      const options = c === 0 ? [[0, old.used]] : [];
      const p = mod(c - key[start + old.used]);
      if (p !== 0) options.push([p, old.used + 1]);
      for (const [plain, used] of options) {
        const score = old.score + logp[old.last][plain];
        const slot = used * 30 + plain;
        const found = next.get(slot);
        if (!found || found.score < score)
          next.set(slot, {used, last: plain, score, parent: old});
      }
    }
    if (next.size === 0) return null;
    states = next;
  }
  const tail = [...states.values()].reduce(
    (best, v) => !best || v.score > best.score ? v : best, null);
  const plaintext = new Array(ciphertext.length);
  let step = tail;
  for (let i = ciphertext.length - 1; i >= 0; i--) {
    plaintext[i] = step.last;
    step = step.parent;
  }
  return {plaintext, score: tail.score};
}

/** Exact p56 forward cipher: F=0 bypasses without using prime key. */
function encrypt(plaintext, start) {
  let used = 0;
  return plaintext.map(p => p === 0 ? 0 : mod(p + key[start + used++]));
}
function ioc(a) {
  const hist = Array(29).fill(0);
  for (const c of a) hist[c]++;
  return hist.reduce((n, v) => n + v * (v - 1), 0) / (a.length * (a.length - 1));
}

const p56Text = ('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(gpWord);
assert.equal(p56Text.length, 85);
assert.deepEqual(encrypt(p56Text, 0), src.pages[56].indices);
const solved = viterbi(src.pages[56].indices, 0);
assert.deepEqual(solved.plaintext, p56Text);
assert.equal(furthest(src.pages[56].indices, 0), 85);

const groups = [[0, 2], [40, 53], [54, 55]];
const result = [];
for (const [from, to] of groups) {
  const lo = pageStart[from];
  const hi = pageStart[to] + src.pages[to].indices.length;
  const spans = words.filter(([a, b]) => a >= lo && b <= hi);
  assert.equal(spans.at(-1)[1], hi);
  for (const [rule, fn] of rules) {
    const polarities = rule === 'none' ? [false] : [false, true];
    for (const inversePolarity of polarities) {
      const tape = transform(lo, hi, spans, fn, inversePolarity);
      const starts = [];
      let maxReach = 0;
      for (let start = 0; start < 5000; start++) {
        const reach = furthest(tape, start);
        if (reach === tape.length) starts.push(start);
        maxReach = Math.max(maxReach, reach);
      }
      const singletonPositions = new Set(spans
        .filter(([a, b]) => b - a === 1).map(([a]) => a - lo));
      const candidates = starts.map(start => {
        const best = viterbi(tape, start);
        assert.ok(best);
        assert.deepEqual(encrypt(best.plaintext, start), tape,
          'genuine forward roundtrip for all selected F skip paths');
        const one = spans.filter(([a, b]) => b - a === 1);
        const plausible = one.filter(([a]) =>
          [24, 10, 3].includes(best.plaintext[a - lo]));
        const entries = new Set(training.map(x => x.join(',')));
        const dictionary = spans.filter(([a, b]) =>
          entries.has(best.plaintext.slice(a - lo, b - lo).join(',')));
        return {
          start, scorePerRune: best.score / tape.length, ioc: ioc(best.plaintext),
          grammarLastReach: furthest(tape, start, singletonPositions),
          oneRuneWords: one.length, plausibleOneRuneWords: plausible.length,
          exactTrainingWords: dictionary.length, printedWords: spans.length,
          opening: best.plaintext.slice(0, 48).map(x => src.translit[x]).join('')
        };
      });
      result.push({pages: 'p' + from + '-' + to, runes: tape.length,
        rule, inversePolarity, viableStarts: starts.length,
        starts, maxReach, candidates});
    }
  }
}

const get = (pages, rule, polarity = false) =>
  result.find(r => r.pages === pages && r.rule === rule &&
    r.inversePolarity === polarity);
assert.deepEqual(get('p0-2', 'previous-GP-primesum-even').starts, [4775, 4778, 4779]);
assert.equal(result.filter(r => r.pages === 'p0-2')
  .reduce((n, r) => n + r.viableStarts, 0), 3);
assert.ok(result.filter(r => r.pages === 'p40-53')
  .every(r => r.viableStarts === 0));
assert.equal(result.filter(r => r.pages === 'p54-55')
  .reduce((n, r) => n + r.viableStarts, 0), 44);
const all = result.flatMap(r => r.candidates.map(x => ({pages: r.pages, ...x})));
assert.ok(all.every(x => x.ioc < 0.04));
assert.ok(all.every(x => x.plausibleOneRuneWords === 0));
assert.ok(result.every(r => r.candidates.every(x =>
  x.grammarLastReach < r.runes)),
  'exact all-F-branch A/I/O one-rune-word gate rejects all 47 surviving starts');
console.log(JSON.stringify({
  corpus: 'unaltered original 12956 GP29 cipher runes and 2896 printed words',
  control: 'authentic p56 exact 85/85 with plaintext-F nonconsumption',
  knownP56IoC: ioc(p56Text), clearP57IoC: ioc(src.pages[57].indices),
  starts: 'first 5000 historical prime-totient key positions',
  tests: result.map(({candidates, ...r}) => ({...r,
    best: candidates.sort((a, b) => b.scorePerRune - a.scorePerRune)[0] || null})),
  decision: 'No genuine original LP2 plaintext; three p0 legal inverses are gibberish and all p40-53 tests impossible.'
}, null, 2));
