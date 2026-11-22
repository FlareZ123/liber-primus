'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translit = corpus.translit;
const mod29 = (n) => ((n % 29) + 29) % 29;

function printedWords(segment) {
  return (segment.replace(/\\/\\s*/gu, '').match(/[\\u16A0-\\u16FF]+/gu) || [])
    .map((word) => [...word].map((r) => {
      const i = runeIndex.get(r);
      assert.notEqual(i, undefined, 'unexpected rune in canonical transcription');
      return i;
    }));
}

function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}

const pages = transcription.split(/^\\s*%\\s*$/mu);
const p55WordsWithCarry = printedWords(pages[54]);
const p55Words = p55WordsWithCarry.slice(1);
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const expectedWordLengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];

assert.equal(p55.length, 76);
assert.equal(p55WordsWithCarry[0].length, 1, 'p55 begins with one carried rune from p54');
assert.deepEqual(p55Words.map((w) => w.length), expectedWordLengths);
assert.deepEqual(p55WordsWithCarry.flat(), p55);

const interiorWords = p55Words.map((w) => w.slice(1, -1));
const interior = interiorWords.flat();
const interiorWordLengths = interiorWords.map((w) => w.length);
assert.equal(interior.length, 43);
const interiorFPositions = interior.flatMap((v, i) => v === 0 ? [i] : []);
assert.deepEqual(interiorFPositions, [11]);

// p57's three printed body clauses (heading PARABLE excluded) are the
// independently documented prime sums 1259, 1031, 1229.
const p57Clauses = pages[56].split('.').map((segment) => printedWords(segment).flat())
  .filter((clause) => clause.length);
assert.equal(p57Clauses.length, 4);
const gpPrimes = firstPrimes(29);
const clausePrimeSums = p57Clauses.slice(1).map((clause) =>
  clause.reduce((sum, rune) => sum + gpPrimes[rune], 0));
assert.deepEqual(clausePrimeSums, [1259, 1031, 1229]);
const isPrime = (n) => n >= 2 && !firstPrimes(Math.floor(Math.sqrt(n)) + 1)
  .some((p) => p * p <= n && n % p === 0);
assert.ok(clausePrimeSums.every(isPrime));

// "Divinity" -> Euler phi; each clause sum is prime, so phi(p)=p-1.
// Reduce into the native GP29 alphabet. No phase or key-order fitting.
const key = clausePrimeSums.map((p) => mod29(p - 1));
assert.deepEqual(key, [11, 15, 10]);

function decrypt(cipher, literalFPositions) {
  const literal = new Set(literalFPositions);
  let consumed = 0;
  const plain = cipher.map((c, i) => {
    if (literal.has(i)) {
      assert.equal(c, 0, 'a literal plaintext F must be a ciphertext F');
      return 0;
    }
    const p = mod29(c - key[consumed % key.length]);
    consumed++;
    return p;
  });
  return { plain, consumed, keyConsumedFPositions: plain.flatMap((p, i) =>
    p === 0 && !literal.has(i) ? [i] : []) };
}

function encrypt(plain) {
  let consumed = 0;
  return plain.map((p) => {
    if (p === 0) return 0; // exact p56 plaintext-F bypass
    return mod29(p + key[consumed++ % key.length]);
  });
}

function render(values) {
  return values.map((v) => translit[v]).join('');
}
function renderWords(values, lengths) {
  let at = 0;
  return lengths.map((n) => {
    const word = render(values.slice(at, at + n));
    at += n;
    return word;
  });
}

// The only two possible readings of the sole interior ciphertext F under
// the p56 transparent-F rule: literal (no key consumption), or encrypted.
const literalF = decrypt(interior, [11]);
const encryptedF = decrypt(interior, []);
const rawContinuous = encryptedF;

assert.deepEqual(encrypt(rawContinuous.plain), interior);
assert.deepEqual(encrypt(literalF.plain), interior);

// A source-native 43-rune positive plant validates the key clock and the
// transparent-F forward/inverse implementation independently of p55.
const p57 = corpus.pages.find((p) => p.page === 57).indices;
const plant = p57.slice(0, 43);
const plantedCipher = encrypt(plant);
const plantFPositions = plant.flatMap((v, i) => v === 0 ? [i] : []);
const plantRecovered = decrypt(plantedCipher, plantFPositions);
assert.deepEqual(plantRecovered.plain, plant);
assert.deepEqual(encrypt(plantRecovered.plain), plantedCipher);

console.log(JSON.stringify({
  source: 'p57 three body-clause GP-prime sums -> Euler phi of each prime -> mod 29',
  clausePrimeSums,
  key,
  p55OriginalRunes: p55.length,
  p55CompleteWords: p55Words.length,
  p55InteriorRunes: interior.length,
  p55InteriorWordLengths: interiorWordLengths,
  p55InteriorCiphertextFPositions: interiorFPositions,
  ordinaryRepeatingKeySubtraction: {
    consumed: rawContinuous.consumed,
    plaintext: render(rawContinuous.plain),
    wordGroups: renderWords(rawContinuous.plain, interiorWordLengths),
    plaintextFAtEncryptedPositions: rawContinuous.keyConsumedFPositions
  },
  p56TransparentFBranches: [
    {
      branch: 'ciphertext F at interior offset 11 is literal plaintext F',
      consumed: literalF.consumed,
      plaintext: render(literalF.plain),
      wordGroups: renderWords(literalF.plain, interiorWordLengths),
      invalidPlaintextFAtEncryptedPositions: literalF.keyConsumedFPositions,
      validUnderP56Rule: literalF.keyConsumedFPositions.length === 0
    },
    {
      branch: 'ciphertext F at interior offset 11 is encrypted',
      consumed: encryptedF.consumed,
      plaintext: render(encryptedF.plain),
      wordGroups: renderWords(encryptedF.plain, interiorWordLengths),
      invalidPlaintextFAtEncryptedPositions: encryptedF.keyConsumedFPositions,
      validUnderP56Rule: encryptedF.keyConsumedFPositions.length === 0
    }
  ],
  positiveControl: {
    p57SourceRunes: plant.length,
    literalFPositions: plantFPositions,
    recovered: plantRecovered.plain.length,
    exactRoundTrip: true
  },
  conclusion: 'The fixed p57-clause-totient 3-symbol key does not produce plaintext on p55 interiors; neither possible p56 transparent-F branch is valid.'
}, null, 2));
