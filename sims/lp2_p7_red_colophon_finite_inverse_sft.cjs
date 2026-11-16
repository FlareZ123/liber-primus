'use strict';

/**
 * LP2 p7 original red 14-rune caption: exact finite historical inverse gate.
 * Read-only Node.js 22 SFT for Windows 11.
 * Native inputs: lp2-corpus, ink annotations, punctuation identity,
 * and the stable TextBlob word-frequency lexicon.
 * No language-fitted key, unknown offset, or output file is used.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} filename */
const json = (filename) => JSON.parse(fs.readFileSync(path.join(ROOT, filename), 'utf8'));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const ink = json('resources/liber-primus/lp2-ink-annotations.json');
const punct = json('resources/liber-primus/lp2-punctuation-identity.json');
const wordFile = fs.readFileSync(path.join(ROOT, 'resources/control/english_wordfreq_textblob.txt'), 'utf8');
const words = new Set(wordFile.split(/\r?\n/).filter(x => x && !x.startsWith(';')).map(x => x.trim().split(/\s+/)[0]));
const gp = corpus.translit;
const mod29 = (x) => ((x % 29) + 29) % 29;
/** @param {number[]} a */
const roman = (a) => a.map(i => gp[i]).join('').toLowerCase();
/** @param {number} n */
const page = (n) => corpus.pages.find(p => p.page === n);

const marker = ink.pages.find(p => p.page === 7).red_spans[0];
const p7 = page(7);
assert.equal(p7.runic_count, 208);
assert.equal(marker.start, 194);
assert.equal(marker.length, 14);
const ciphertext = p7.indices.slice(194, 208);
assert.equal(ciphertext.map(i => corpus.runes[i]).join(''), 'ᛞᚩᛟᛏᚦᚫᚳᚹᛄᛉᛠᚷᛠᛗ');
assert.equal(marker.runes, ciphertext.map(i => corpus.runes[i]).join(''));
const split = punct.events.find(e => e.page === 7 && e.rune_offset === 1866);
assert.equal(split.local_rune_offset, 200);
assert.equal(split.symbol, '⁘');
assert.equal(roman(ciphertext.slice(0, 6)), 'dooetthae');
assert.equal(roman(ciphertext.slice(6)), 'cwjxeageam');

// Source-native GP29 affine ±1 represents every Caesar shift and Atbash+shift.
let all = 0;
const lexicalHits = [];
for (const sign of [1, -1]) {
  for (let shift = 0; shift < 29; shift++) {
    const decoded = ciphertext.map(c => mod29(sign * c + shift));
    const first = roman(decoded.slice(0, 6));
    const second = roman(decoded.slice(6));
    if (words.has(first) || words.has(second)) {
      lexicalHits.push({ sign, shift, first, second });
    }
    assert.deepEqual(decoded.map(x => mod29(sign * (x - shift))), ciphertext);
    all++;
  }
}
assert.equal(all, 58);
assert.deepEqual(lexicalHits, []);

// Authentic p56: prime totient additive cipher with plaintext-F transparency.
// The first five p56 cipher runes decrypt to ANEND under primes 2,3,5,7,11.
const p56 = page(56).indices.slice(0, 5);
assert.equal(roman(p56), 'aejoesr');
const firstPhi = [1, 2, 4, 6, 10];
const p56Out = p56.map((c, i) => mod29(c - firstPhi[i]));
assert.equal(roman(p56Out), 'anend');
assert.deepEqual(p56Out.map((p, i) => mod29(p + firstPhi[i])), p56);
assert.equal(roman(page(57).indices.slice(0, 7)), 'parable');

const primes = [];
for (let n = 2; n <= 3500; n++) {
  let prime = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) { prime = false; break; }
  }
  if (prime) primes.push(n);
}
/** @param {number} n */
function totient(n) {
  let v = n;
  let remaining = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p === 0) {
      while (remaining % p === 0) remaining /= p;
      v -= v / p;
    }
  }
  if (remaining > 1) v -= v / remaining;
  return v;
}
assert.equal(primes[0], 2);
assert.equal(primes[173], 1033);
assert.equal(primes[463], 3301);

const outcomes = [];
for (const initial of [0, 173, 463]) {
  for (const sign of [-1, 1]) {
    /** @type {{runes: number[], clock: number}[]} */
    let branches = [{ runes: [], clock: initial }];
    for (const c of ciphertext) {
      const next = [];
      for (const candidate of branches) {
        if (c === 0) next.push({ runes: [...candidate.runes, 0], clock: candidate.clock });
        const decoded = mod29(c + sign * totient(primes[candidate.clock]));
        // A non-F ciphertext cannot represent an unencrypted F.
        if (decoded !== 0) next.push({
          runes: [...candidate.runes, decoded],
          clock: candidate.clock + 1,
        });
      }
      branches = next;
    }
    outcomes.push({
      primeStart: primes[initial],
      sign,
      outputs: branches.map(q => [
        roman(q.runes.slice(0, 6)),
        roman(q.runes.slice(6)),
      ]),
    });
  }
}
assert.deepEqual(outcomes, [
  { primeStart: 2, sign: -1, outputs: [['oeueingp', 'eeesiaeabg']] },
  { primeStart: 2, sign: 1, outputs: [] },
  { primeStart: 1033, sign: -1, outputs: [['gneisw', 'iddacgoec']] },
  { primeStart: 1033, sign: 1, outputs: [] },
  { primeStart: 3301, sign: -1, outputs: [] },
  { primeStart: 3301, sign: 1, outputs: [] },
]);
console.log(JSON.stringify({
  case: 'original p7 red colophon, printed 6+8 rune split',
  sourceRuneIndices: ciphertext,
  sourceRoman: [roman(ciphertext.slice(0, 6)), roman(ciphertext.slice(6))],
  nativeControls: { p56: roman(p56Out), p57: roman(page(57).indices.slice(0, 7)) },
  affineCases: all,
  affineSingleWordLexiconHits: lexicalHits.length,
  p56NativePrimeTransfers: outcomes,
  conclusion: 'no complete typed p7 instruction in these frozen families',
}, null, 2));
