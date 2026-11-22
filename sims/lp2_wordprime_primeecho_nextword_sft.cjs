#!/usr/bin/env node
'use strict';

// Previous-word GP-prime sum -> CicadaOS prime_echo address -> next-word running key.
// This is a frozen hypothesis test, not an asserted LP2 mechanism.
// Source candidate: https://github.com/neuroretransmit/cicada/blob/main/2013/002-3301/rootfs-contents/usr/local/bin/prime_echo
// That reconstructed shell script emits all primes 2..3301 inclusive: 464 values.

const fs = require('node:fs');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const transcription = fs.readFileSync('resources/lp2-transcription.txt', 'utf8');
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const runeToLatin = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);

function parseCipherWords(text) {
  const words = [];
  let word = [];
  for (const ch of text) {
    if (runeToIndex.has(ch)) word.push(runeToIndex.get(ch));
    else if ("-.'".includes(ch) && word.length) {
      words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  return words.slice(0, 2896);
}

function toGP(word) {
  let s = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/K/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/[^A-Z]/g, '');
  const out = [];
  while (s.length) {
    const match = runeToLatin.find(x => s.startsWith(x.s));
    if (!match) return null;
    out.push(match.i);
    s = s.slice(match.s.length);
  }
  return out.length ? out : null;
}

function primesThrough(limit) {
  const out = [];
  for (let n = 2; n <= limit; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}

const mod = (n, m) => ((n % m) + m) % m;
const words = parseCipherWords(transcription);
const originalWords = corpus.pages.slice(0, 56).map(p => p.indices);
const original = originalWords.flat();
assert.equal(words.length, 2896, 'printed ciphertext word count');
assert.equal(words.flat().length, 12956, 'unsolved rune count');
assert.deepEqual(words.flat(), original, 'transcription must align exactly with canonical corpus');

const primeEcho = primesThrough(3301);
assert.equal(primeEcho.length, 464, 'prime_echo count is pi(3301), not 465');
assert.equal(primeEcho.at(-1), 3301, 'prime_echo endpoint');

const controlFiles = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/shakespeare_first300k.txt'
];
const controls = controlFiles.map(path => fs.readFileSync(path, 'utf8'));
const encodedControls = controls.map(text =>
  (text.toUpperCase().match(/[A-Z]+/g) || []).map(toGP).filter(Boolean)
);
const dictionary = new Set(encodedControls.flat().map(w => w.join(',')));
const controlCoverage = encodedControls.map(encoded => ({
  words: encoded.length,
  dictionaryHitRate: encoded.filter(w => dictionary.has(w.join(','))).length / encoded.length
}));

function indexScore(indices) {
  const counts = Array(29).fill(0);
  for (const x of indices) counts[x]++;
  const ioc = counts.reduce((s, n) => s + n * (n - 1), 0) / (indices.length * (indices.length - 1));
  const top12 = counts.slice().sort((a, b) => b - a).slice(0, 12).reduce((s, n) => s + n, 0);
  return { ioc, top12 };
}

function wordHits(outWords) {
  const hits = outWords.filter(w => dictionary.has(w.join(','))).length;
  return { hits, words: outWords.length, rate: hits / outWords.length };
}

function decode(config) {
  const outWords = [];
  for (let wi = 0; wi < words.length; wi++) {
    const cipherWord = words[wi];
    if (wi === 0) { outWords.push(cipherWord.slice()); continue; }

    // The address is derived from the preceding ORIGINAL CIPHERTEXT word.
    const state = words[wi - 1].reduce((sum, r) => sum + corpus.prime[r], 0);
    let pointer = mod(state - config.addressShift, primeEcho.length);
    const plainWord = [];

    for (const c of cipherWord) {
      const p = primeEcho[pointer % primeEcho.length];
      const key = mod(config.keyMap === 'prime-minus-one' ? p - 1 : p, 29);
      const plain = mod(c + config.sign * key, 29);
      plainWord.push(plain);
      // p56-inspired option: plaintext F/index 0 is transparent to key consumption.
      if (!(config.fTransparent && plain === 0)) pointer++;
    }
    outWords.push(plainWord);
  }
  return outWords;
}

function reencrypt(plainWords, config) {
  const out = [];
  for (let wi = 0; wi < plainWords.length; wi++) {
    if (wi === 0) { out.push(...plainWords[wi]); continue; }
    const state = words[wi - 1].reduce((sum, r) => sum + corpus.prime[r], 0);
    let pointer = mod(state - config.addressShift, primeEcho.length);
    for (const plain of plainWords[wi]) {
      const p = primeEcho[pointer % primeEcho.length];
      const key = mod(config.keyMap === 'prime-minus-one' ? p - 1 : p, 29);
      out.push(mod(plain - config.sign * key, 29));
      if (!(config.fTransparent && plain === 0)) pointer++;
    }
  }
  return out;
}

const baseline = {
  ...indexScore(original),
  ...wordHits(words)
};

const candidates = [];
for (const keyMap of ['prime', 'prime-minus-one']) {
  for (const addressShift of [0, 1]) {
    for (const sign of [-1, 1]) {
      for (const fTransparent of [false, true]) {
        const config = { keyMap, addressShift, sign, fTransparent };
        const outWords = decode(config);
        const flat = outWords.flat();
        assert.deepEqual(reencrypt(outWords, config), original, 'exact inverse round-trip');
        candidates.push({
          ...config,
          ...indexScore(flat),
          ...wordHits(outWords),
          sample: flat.slice(0, 180).map(i => corpus.translit[i]).join('')
        });
      }
    }
  }
}

const output = {
  hypothesis: 'previous ciphertext word GP-prime sum selects the starting prime_echo index for the next word',
  sourcePrimeCount: primeEcho.length,
  sourcePrimeEndpoint: primeEcho.at(-1),
  runeCount: original.length,
  wordCount: words.length,
  dictionarySize: dictionary.size,
  baseline,
  controlCoverage,
  candidates,
  ranges: {
    ioc: [Math.min(...candidates.map(x => x.ioc)), Math.max(...candidates.map(x => x.ioc))],
    dictionaryHits: [Math.min(...candidates.map(x => x.hits)), Math.max(...candidates.map(x => x.hits))]
  }
};
process.stdout.write(JSON.stringify(output, null, 2) + '\n');
