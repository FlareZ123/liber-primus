'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const pages = corpus.pages;
const alpha = corpus.translit;
const mod = (x) => ((x % 29) + 29) % 29;

function primes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { isPrime = false; break; }
    }
    if (isPrime) out.push(n);
  }
  return out;
}

function ioc(xs) {
  const f = Array(29).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}

function apply(cipher, key, mode, reverse, repeating) {
  const n = repeating ? cipher.length : Math.min(cipher.length, key.length);
  const out = [];
  for (let i = 0; i < n; i++) {
    const k = key[reverse ? key.length - 1 - (i % key.length) : i % key.length];
    const c = cipher[i];
    if (mode === 'C-K') out.push(mod(c - k));
    else if (mode === 'K-C') out.push(mod(k - c));
    else if (mode === 'C+K') out.push(mod(c + k));
    else throw new Error('unknown mode ' + mode);
  }
  return out;
}

function encrypt(plain, key, mode, reverse) {
  return plain.map((p, i) => {
    const k = key[reverse ? key.length - 1 - (i % key.length) : i % key.length];
    if (mode === 'C-K') return mod(p + k);
    if (mode === 'K-C') return mod(k - p);
    if (mode === 'C+K') return mod(p - k);
    throw new Error('unknown mode ' + mode);
  });
}

function equalityPatternMismatches(plain, cipher) {
  let mismatches = 0;
  for (let i = 0; i < plain.length; i++) {
    for (let j = i + 1; j < plain.length; j++) {
      if ((plain[i] === plain[j]) !== (cipher[i] === cipher[j])) mismatches++;
    }
  }
  return mismatches;
}

assert.equal(pages.length, 58);
assert.equal(corpus.runes.length, 29);
assert.equal(pages[50].runic_count, 0);
assert.equal(pages[27].runic_count, 234);
assert.equal(pages[28].runic_count, 269);
assert.equal(pages[56].runic_count, 85);
assert.equal(pages[57].runic_count, 95);

// Reconstruct the already-solved p56 plaintext from its authentic first-primes
// totient key. The one literal plaintext F at page-local offset 56 consumes no
// key symbol. This is used only as known plaintext for the p27/p56 pair test.
const prime = primes(100);
const p56 = [];
let consumed = 0;
for (let i = 0; i < pages[56].indices.length; i++) {
  if (i === 56) {
    p56.push(0);
    continue;
  }
  p56.push(mod(pages[56].indices[i] - (prime[consumed] - 1)));
  consumed++;
}
const p56Text = p56.map(x => alpha[x]).join('');
const expectedP56 = 'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE';
assert.equal(p56.length, 85);
assert.equal(consumed, 84);
assert.equal(p56Text, expectedP56);

const p57 = pages[57].indices.slice();
assert.equal(p57.length, 95);
assert.equal(p57.slice(0, 7).map(x => alpha[x]).join(''), 'PARABLE');

const pagePairs = [
  { cipherPage: 27, keyPage: 56, cipher: pages[27].indices, key: p56 },
  { cipherPage: 28, keyPage: 57, cipher: pages[28].indices, key: p57 },
];

const keyTransfer = [];
for (const pair of pagePairs) {
  const modes = ['C-K', 'K-C', 'C+K'];
  for (const mode of modes) {
    for (const reverse of [false, true]) {
      const plant = Array.from({ length: pair.key.length }, (_, i) => (7 * i + 3) % 29);
      const plantedCipher = encrypt(plant, pair.key, mode, reverse);
      assert.deepEqual(apply(plantedCipher, pair.key, mode, reverse, false), plant);

      const prefix = apply(pair.cipher, pair.key, mode, reverse, false);
      const repeated = apply(pair.cipher, pair.key, mode, reverse, true);
      keyTransfer.push({
        pair: String(pair.cipherPage) + '/' + String(pair.keyPage),
        mode,
        keyDirection: reverse ? 'reverse' : 'forward',
        singlePassLength: prefix.length,
        singlePassIoC: ioc(prefix),
        repeatedLength: repeated.length,
        repeatedIoC: ioc(repeated),
      });
    }
  }
}

const p27Mismatch = equalityPatternMismatches(p56, pages[27].indices.slice(0, 85));
const p28Mismatch = equalityPatternMismatches(p57, pages[28].indices.slice(0, 95));
assert.equal(p27Mismatch, 375);
assert.equal(p28Mismatch, 391);

const lengthResiduePairs = [];
for (let p = 0; p < 29; p++) {
  const a = pages[p].runic_count;
  const b = pages[p + 29].runic_count;
  if (a && b && mod(a - b) === 0) {
    lengthResiduePairs.push({
      firstPage: p,
      secondPage: p + 29,
      firstLength: a,
      secondLength: b,
      differenceIn29Blocks: (a - b) / 29,
    });
  }
}
assert.deepEqual(lengthResiduePairs, [
  { firstPage: 13, secondPage: 42, firstLength: 272, secondLength: 272, differenceIn29Blocks: 0 },
  { firstPage: 19, secondPage: 48, firstLength: 271, secondLength: 271, differenceIn29Blocks: 0 },
  { firstPage: 20, secondPage: 49, firstLength: 269, secondLength: 66, differenceIn29Blocks: 7 },
  { firstPage: 28, secondPage: 57, firstLength: 269, secondLength: 95, differenceIn29Blocks: 6 },
]);

// Special p21/p50 variant: p21 is 29 pages before the numeric grid page.
// p21 has 12 printed rune lines; physical p50 contributes 13 rows of eight
// cells (global grid rows 10..22). Test both natural 12-row boundary choices.
const runeSet = new Set(corpus.runes);
const p21Segment = transcription.split('%')[21];
const p21Lines = p21Segment.split('/')
  .map(line => [...line].filter(ch => runeSet.has(ch)))
  .filter(line => line.length > 0);
assert.equal(p21Lines.length, 12);
assert.equal(p21Lines.reduce((s, line) => s + line.length, 0), 273);
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);
const p50Rows = grid.byte_rows.slice(10, 23);
assert.equal(p50Rows.length, 13);
assert(p50Rows.every(row => row.length === 8));

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const p21LineKeyModels = [];
for (const rowStart of [0, 1]) {
  for (const byteMap of ['b-mod-29', 'floor-29b-over-256']) {
    for (const mode of ['C-K', 'C+K', 'K-C']) {
      const decoded = p21Lines.flatMap((line, lineNo) => {
        const row = p50Rows[rowStart + lineNo];
        const key = row.map(b => byteMap === 'b-mod-29' ? b % 29 : Math.floor(29 * b / 256));
        return line.map((glyph, i) => {
          const c = runeIndex.get(glyph);
          const k = key[i % 8];
          if (mode === 'C-K') return mod(c - k);
          if (mode === 'C+K') return mod(c + k);
          return mod(k - c);
        });
      });
      p21LineKeyModels.push({
        gridRows: String(10 + rowStart) + '..' + String(21 + rowStart),
        byteMap,
        mode,
        ioc: ioc(decoded),
      });
    }
  }
}
const p21LineIocs = p21LineKeyModels.map(x => x.ioc);
assert(Math.abs(Math.min(...p21LineIocs) - 0.03232062055591468) < 1e-12);
assert(Math.abs(Math.max(...p21LineIocs) - 0.03566041801335919) < 1e-12);

const result = {
  hypothesis: 'physical page p is keyed by the plaintext of physical page p+29',
  sourceShape: {
    physicalPages: pages.length,
    alphabetSymbols: corpus.runes.length,
    offset: 29,
    lengthResiduePairs,
  },
  knownPlaintextKeyTransfer: {
    p56Plaintext: p56Text,
    p56LiteralFBypassOffset: 56,
    p56KeySymbolsConsumed: consumed,
    p57PlaintextStarts: 'PARABLE',
    sourceIoC: {
      p27: ioc(pages[27].indices),
      p28: ioc(pages[28].indices),
      p56Plaintext: ioc(p56),
      p57Plaintext: ioc(p57),
    },
    keyTransfer,
    monoalphabeticEqualityInvariant: {
      p27CipherPrefixVsP56Plaintext: { length: 85, mismatchedPairs: p27Mismatch, allPairs: 85 * 84 / 2 },
      p28CipherPrefixVsP57Plaintext: { length: 95, mismatchedPairs: p28Mismatch, allPairs: 95 * 94 / 2 },
    },
  },
  p21p50GridLineKey: {
    p21LineCount: p21Lines.length,
    p21RuneCount: 273,
    p50GridRows: 13,
    rowAlignmentChoices: ['first 12 rows', 'last 12 rows'],
    testedModels: p21LineKeyModels,
    minIoC: Math.min(...p21LineIocs),
    maxIoC: Math.max(...p21LineIocs),
  },
};

console.log(JSON.stringify(result, null, 2));
