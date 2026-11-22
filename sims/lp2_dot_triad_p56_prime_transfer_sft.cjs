'use strict';

/**
 * SFT: try the source-attested solved p56 prime-totient cipher on source-
 * oriented p7/p23 runes selected by the original five-dot dihedral triad.
 * Tests an exact source-fixed mechanism, without a free phase, key or fit.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const transcript = fs.readFileSync(
  path.join(root, 'resources', 'lp2-transcription.txt'), 'utf8'
).split('%');
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {number} n @returns {number[]} */
function primes(n) {
  const result = [];
  for (let candidate = 2; result.length < n; candidate++) {
    let isPrime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) { isPrime = false; break; }
    }
    if (isPrime) result.push(candidate);
  }
  return result;
}

/** @param {number[]} sequence @returns {number} */
function ioc(sequence) {
  const counts = Array(29).fill(0);
  for (const index of sequence) counts[index]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (sequence.length * (sequence.length - 1));
}

/** @param {number[]} sequence @returns {string} */
function latin(sequence) {
  return sequence.map((v) => corpus.translit[v]).join('');
}

/** @param {number} physicalPage @returns {number[][]} */
function printedLines(physicalPage) {
  return transcript[physicalPage].split(/\/\s*|\n+/)
    .map((line) => [...line].filter((r) => runeToIndex.has(r))
      .map((r) => runeToIndex.get(r)))
    .filter((line) => line.length > 0);
}

/** @param {number[][]} lines @param {boolean} reverseLines @param {boolean} reverseSymbols @returns {number[]} */
function orient(lines, reverseLines, reverseSymbols) {
  const ordered = reverseLines ? lines.slice().reverse() : lines;
  return ordered.flatMap((line) => reverseSymbols ? line.slice().reverse() : line);
}

const allPrimes = primes(300);
const solvedCipher = corpus.pages.find((p) => p.page === 56).indices;
assert.equal(solvedCipher.length, 85);

// The known single p56 literal F at zero-based offset 56 is non-consuming.
let k = 0;
const solvedPlain = solvedCipher.map((rune, offset) =>
  offset === 56 ? 0 : (rune - (allPrimes[k++] - 1) % 29 + 29) % 29
);
assert.equal(k, 84);
assert.equal(
  latin(solvedPlain),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE'
);

// Exact genuine-source reencryption, including literal-F key-clock skip.
let forwardKey = 0;
const reencryption = solvedPlain.map((rune, offset) =>
  offset === 56 ? 0 : (rune + allPrimes[forwardKey++] - 1) % 29
);
assert.deepEqual(reencryption, solvedCipher);
const exactP56Pad = solvedCipher.map((r, i) => (r - solvedPlain[i] + 29) % 29);

// Dot-adjacent *red* rune spans offer an independent source-visible reset
// candidate. Their positions come from the pinned ink annotation, not a guess.
const ink = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8'
));
const expectedRed = new Map([
  [7, 'EYTHOEREALTOOSSNGI'],
  [23, 'AEHPITHIAUNGPAPEAIDWW'],
  [56, 'ANEND'],
]);
const redTests = [];
for (const page of [7, 23, 56]) {
  const pageInk = ink.pages.find((p) => p.page === page);
  const span = pageInk.red_spans[0];
  const pageRunes = corpus.pages.find((p) => p.page === page).indices;
  const sourceRed = pageRunes.slice(span.start, span.start + span.length);
  const orientedRed = page === 56 ? sourceRed : sourceRed.slice().reverse();
  const candidate = orientedRed.map((rune, i) =>
    (rune - exactP56Pad[i] + 29) % 29
  );
  assert.equal(latin(candidate), expectedRed.get(page));
  assert.deepEqual(
    candidate.map((rune, i) => (rune + exactP56Pad[i]) % 29),
    orientedRed
  );
  redTests.push({
    page, originalOffset: span.start, sourceRunes: span.length,
    sourceCiphertext: latin(orientedRed), sourcePadOutput: latin(candidate),
  });
}

const outputs = [];
for (const page of [7, 23]) {
  const lines = printedLines(page);
  const original = corpus.pages.find((p) => p.page === page).indices;
  assert.deepEqual(orient(lines, false, false), original);
  assert.equal(original.length, page === 7 ? 208 : 213);

  // Artwork reflection onto solved p56: page7 horizontal; page23 180 degrees.
  const reverseLines = page === 23;
  const reversedWithinLines = true;
  const shifted = orient(lines, reverseLines, reversedWithinLines);
  const simple = shifted.map((rune, i) =>
    (rune - (allPrimes[i] - 1) % 29 + 29) % 29
  );
  const pad85 = shifted.slice(0, 85).map((rune, i) =>
    (rune - exactP56Pad[i] + 29) % 29
  );
  assert.deepEqual(simple.map((r, i) => (r + allPrimes[i] - 1) % 29), shifted);
  assert.deepEqual(
    pad85.map((r, i) => (r + exactP56Pad[i]) % 29),
    shifted.slice(0, 85)
  );
  assert.ok(ioc(simple) < 0.05);
  assert.ok(ioc(pad85) < 0.05);
  outputs.push({
    page,
    sourceOrientation: page === 7 ? 'horizontal-flip' : '180-degree-rotation',
    runes: original.length,
    originalIoc: ioc(original),
    directPrimeTotientIoc: ioc(simple),
    directPrimeTotientFirst100: latin(simple).slice(0, 100),
    copiedKnownP56PadFirst85Ioc: ioc(pad85),
    copiedKnownP56PadFirst100: latin(pad85).slice(0, 100),
  });
}
console.log(JSON.stringify({
  control: {page: 56, knownPlaintextRecovered: true, runes: 85, ioc: ioc(solvedPlain)},
  outputs,
  redTests,
  decision: 'Both source-oriented direct transfers remain nonlinguistic; no new LP2 plaintext.',
}, null, 2));
