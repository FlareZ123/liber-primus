#!/usr/bin/env node
'use strict';

// One frozen source-selected candidate for #2273:
// each of the 86 quoted words is converted to the product of its authentic
// GP prime weights modulo 29. In source order, these 86 values fill the 86
// adjacent-equal ciphertext positions. Every other transition decodes to the
// rank of the current rune among the 28 GP29 symbols other than its predecessor.
// The first rune is literal; the stream carries globally across words/pages;
// F is ordinary (no p56-only transparent-F rule is imported); printed word
// boundaries are preserved. No key, phase, reset, alphabet permutation or
// language-score tuning is searched.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const quote = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-quote-punctuation-spans.json'), 'utf8'));

const N = 12956;
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const words = [];
let globalRune = 0;
let current = [];
let currentStart = 0;

function flushWord() {
  if (current.length) {
    words.push({ start: currentStart, end: globalRune, indices: current });
    current = [];
  }
}

for (const ch of transcription) {
  if (runeToIndex.has(ch)) {
    if (!current.length) currentStart = globalRune;
    current.push(runeToIndex.get(ch));
    globalRune++;
  } else if (ch === '-' || ch === '.') {
    flushWord();
  } else if (ch === '§') {
    flushWord();
    break;
  }
}
flushWord();

const unknownWords = words.filter(w => w.end <= N);
assert.equal(globalRune, 13136, 'transcription rune count changed');
assert.equal(unknownWords.length, 2896, 'canonical unknown-word count changed');

const quoteWords = quote.quotes.flatMap(span =>
  unknownWords.filter(w => w.start >= span.start && w.end <= span.end)
);
assert.equal(quoteWords.length, 86, 'quoted-word count changed');
assert.equal(quote.quote_rune_total, 405);

const sidecar = quoteWords.map(w =>
  w.indices.reduce((acc, runeIndex) => (acc * corpus.prime[runeIndex]) % 29, 1)
);

const ciphertext = corpus.pages
  .filter(page => page.page <= 55)
  .flatMap(page => page.indices);
assert.equal(ciphertext.length, N, 'unknown-ciphertext length changed');

const repeatPositions = [];
for (let i = 1; i < N; i++) {
  if (ciphertext[i] === ciphertext[i - 1]) repeatPositions.push(i);
}
assert.equal(repeatPositions.length, 86, 'adjacent-repeat count changed');
assert.equal(repeatPositions.length, sidecar.length, 'sidecar/repeat cardinality changed');

function decode(input, key) {
  const out = new Uint8Array(input.length);
  out[0] = input[0];
  let k = 0;
  for (let i = 1; i < input.length; i++) {
    if (input[i] === input[i - 1]) {
      out[i] = key[k++];
    } else {
      // Zero-based rank in GP29 with the previous ciphertext rune removed.
      out[i] = input[i] - (input[i - 1] < input[i] ? 1 : 0);
    }
  }
  assert.equal(k, key.length, 'not every sidecar symbol was consumed');
  return out;
}

function encode(plain, exceptionPositions, key) {
  const out = new Uint8Array(plain.length);
  out[0] = plain[0];
  const exceptions = new Set(exceptionPositions);
  let k = 0;
  for (let i = 1; i < plain.length; i++) {
    if (exceptions.has(i)) {
      assert.equal(plain[i], key[k], 'exception plaintext must equal its source sidecar value');
      out[i] = out[i - 1];
      k++;
    } else {
      assert(plain[i] >= 0 && plain[i] < 28, 'ordinary rank must be in 0..27');
      const allowed = [];
      for (let r = 0; r < 29; r++) if (r !== out[i - 1]) allowed.push(r);
      out[i] = allowed[plain[i]];
    }
  }
  assert.equal(k, key.length);
  return out;
}

function ioc(values) {
  const counts = new Uint32Array(29);
  for (const x of values) counts[x]++;
  let numerator = 0;
  for (const n of counts) numerator += n * (n - 1);
  return numerator / (values.length * (values.length - 1));
}

function render(values) {
  return Array.from(values, x => corpus.translit[x]).join('');
}

// Construct a positive control under the exact same exception schedule and
// exact same sidecar. This verifies the encoder/decoder pair, not the original
// manuscript hypothesis.
let seed = 0x13371337;
function next32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const exceptionSet = new Set(repeatPositions);
const plantedPlain = new Uint8Array(N);
plantedPlain[0] = 15;
let keyIndex = 0;
for (let i = 1; i < N; i++) {
  if (exceptionSet.has(i)) plantedPlain[i] = sidecar[keyIndex++];
  else plantedPlain[i] = next32() % 28;
}
const plantedCipher = encode(plantedPlain, repeatPositions, sidecar);
const plantedRecovered = decode(plantedCipher, sidecar);
assert.deepEqual(Array.from(plantedRecovered), Array.from(plantedPlain), 'synthetic positive failed');

const recovered = decode(ciphertext, sidecar);
const pageStarts = new Map();
let cursor = 0;
for (const page of corpus.pages.filter(page => page.page <= 55)) {
  pageStarts.set(page.page, cursor);
  cursor += page.indices.length;
}
const p16Start = pageStarts.get(16);
const opening300 = recovered.slice(0, 300);
const p16_200 = recovered.slice(p16Start, p16Start + 200);
const p57 = corpus.pages.find(page => page.page === 57).indices;

const repeatValues = repeatPositions.map(i => ciphertext[i]);
const matchCounts = {
  repeatRune: sidecar.filter((v, i) => v === repeatValues[i]).length,
  precedingRune: sidecar.filter((v, i) => v === (ciphertext[repeatPositions[i] - 2] ?? -1)).length,
  followingRune: sidecar.filter((v, i) => v === (ciphertext[repeatPositions[i] + 1] ?? -1)).length
};

const result = {
  sourceCounts: {
    unknownRunes: ciphertext.length,
    canonicalWords: unknownWords.length,
    quotedWords: quoteWords.length,
    quotedRunes: quote.quote_rune_total,
    adjacentRepeats: repeatPositions.length,
    firstRepeatOffsets: repeatPositions.slice(0, 10)
  },
  sidecar: {
    operation: 'product(GP prime weights in each quoted word) mod 29',
    values: sidecar,
    transliteration: render(sidecar),
    directMatches: matchCounts
  },
  inverseSemantics: {
    firstRune: 'literal',
    ordinaryTransition: 'rank(current ciphertext rune among GP29 symbols excluding previous ciphertext rune)',
    repeat: 'consume next quoted-word prime-product value in source order',
    wordAndPageBoundaries: 'preserved; no resets',
    F: 'ordinary; no transparent-F rule imported from solved p56'
  },
  original: {
    opening300IoC: ioc(opening300),
    opening300: render(opening300),
    p16Start,
    p16_200IoC: ioc(p16_200),
    p16_200: render(p16_200),
    wholeBookIoC: ioc(recovered),
    p57NativeIoC: ioc(p57),
    wholeBookPlaintext: render(recovered)
  },
  syntheticPositive: {
    exceptionCount: repeatPositions.length,
    exactRecovery: true,
    plaintextLength: plantedPlain.length
  }
};

console.log(JSON.stringify(result, null, 2));
