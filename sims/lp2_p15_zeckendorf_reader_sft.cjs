'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(sourceDir, 'lp2-corpus.json'), 'utf8'));

const primes = [2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817];
const printedSpiral = [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516];
assert.deepEqual(printedSpiral, primes.map(p => Math.abs(3301 - p)));

const image = fs.readFileSync(path.join(sourceDir, '32.jpg'));
const sums = fs.readFileSync(path.join(sourceDir, 'SHA256SUMS.txt'), 'utf8');
const imageSumLine = sums.split(/\r?\n/).find(line => /\s32\.jpg$/.test(line));
assert.ok(imageSumLine, 'original p15 image hash must be present in SHA256SUMS.txt');
const imageSha256 = crypto.createHash('sha256').update(image).digest('hex');
assert.equal(imageSha256, imageSumLine.slice(0, 64), 'p15 input must be the repository original image');

const fib = [1, 2];
while (fib[fib.length - 1] < Math.max(...printedSpiral)) {
  fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
}

function zeckendorfFibonacciCode(n) {
  assert.ok(Number.isSafeInteger(n) && n > 0);
  let remainder = n;
  const digitsLowToHigh = Array(fib.length).fill(0);
  for (let i = fib.length - 1; i >= 0; i -= 1) {
    if (fib[i] <= remainder) {
      digitsLowToHigh[i] = 1;
      remainder -= fib[i];
    }
  }
  assert.equal(remainder, 0);
  while (digitsLowToHigh[digitsLowToHigh.length - 1] === 0) digitsLowToHigh.pop();
  for (let i = 1; i < digitsLowToHigh.length; i += 1) {
    assert.notEqual(digitsLowToHigh[i] + digitsLowToHigh[i - 1], 2, 'Zeckendorf digits cannot be adjacent ones');
  }
  return digitsLowToHigh.join('') + '1';
}

function decodeFibonacciCode(codeword) {
  assert.ok(codeword.endsWith('11'));
  const payload = codeword.slice(0, -1);
  assert.ok(!payload.includes('11'), 'the payload itself must have no adjacent ones');
  let value = 0;
  for (let i = 0; i < payload.length; i += 1) {
    if (payload[i] === '1') value += fib[i];
  }
  return value;
}

const codewords = printedSpiral.map(zeckendorfFibonacciCode);
const bits = codewords.join('');
let cursor = 0;
const recoveredNumbers = [];
for (let i = 0; i < printedSpiral.length; i += 1) {
  const delimiter = bits.indexOf('11', cursor);
  assert.ok(delimiter >= cursor, 'every integer must have a self-delimiting 11 terminator');
  const codeword = bits.slice(cursor, delimiter + 2);
  recoveredNumbers.push(decodeFibonacciCode(codeword));
  cursor = delimiter + 2;
}
assert.equal(cursor, bits.length);
assert.deepEqual(recoveredNumbers, printedSpiral);

const groupCount = Math.floor(bits.length / 5);
const fiveBitGroups = Array.from({ length: groupCount }, (_, i) => parseInt(bits.slice(i * 5, i * 5 + 5), 2));
const trailingBits = bits.slice(groupCount * 5);
assert.equal(bits.length, 282);
assert.equal(groupCount, 56);
assert.equal(trailingBits, '11');
assert.ok(fiveBitGroups.every(value => value >= 0 && value <= 28), 'every 5-bit group must map to a GP29 symbol');

const runeTokens = corpus.translit;
const runeGlyphs = corpus.runes;

const rowMajorPrinted = [3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838, 3288, 3294, 3296, 2472, 4516, 1206, 708, 1820];
const rowMajorBits = rowMajorPrinted.map(zeckendorfFibonacciCode).join('');
const rowMajorGroups = Array.from({ length: Math.floor(rowMajorBits.length / 5) }, (_, i) => parseInt(rowMajorBits.slice(i * 5, i * 5 + 5), 2));
const rowMajorTail = rowMajorBits.slice(rowMajorGroups.length * 5);
assert.equal(rowMajorBits.length, 282);
assert.equal(rowMajorGroups.length, 56);
assert.equal(rowMajorTail, '11');
assert.ok(rowMajorGroups.every(value => value <= 28));
const reverseBits = printedSpiral.slice().reverse().map(zeckendorfFibonacciCode).join('');
const reverseGroups = Array.from({ length: Math.floor(reverseBits.length / 5) }, (_, i) => parseInt(reverseBits.slice(i * 5, i * 5 + 5), 2));
assert.equal(reverseBits.length, 282);
assert.equal(reverseGroups.length, 56);
assert.equal(reverseBits.slice(reverseGroups.length * 5), '11');
assert.ok(reverseGroups.every(value => value <= 28));

// Exact any-order proof, not a random permutation sample. With every
// codeword >= 15 bits, any 5-bit window straddles at most one codeword
// boundary. Check all 16*16 ordered pairs, including possible repetitions.
// GP29-invalid five-bit words are exactly 11101, 11110 and 11111.
const invalidFiveBitWords = new Set(['11101', '11110', '11111']);
assert.ok(codewords.every(word => word.length >= 5));
let pairBoundaryWindows = 0;
for (const first of codewords) {
  for (const second of codewords) {
    const combined = first + second;
    for (let index = 0; index + 5 <= combined.length; index++) {
      const window = combined.slice(index, index + 5);
      assert.ok(!invalidFiveBitWords.has(window),
        'GP29-invalid window in ordered source-codeword pair');
      pairBoundaryWindows++;
    }
  }
}
const allCodewordOrdersHaveOnlyGp29Groups = true;
const allCodewordOrdersHaveSame56Groups = codewords.reduce(
  (sum, word) => sum + word.length, 0) === 282;
assert.ok(allCodewordOrdersHaveSame56Groups);
assert.ok(codewords.every(word => word.endsWith('11')));


const key = fiveBitGroups;
const keyTokens = key.map(value => runeTokens[value]);
const uniqueKeySymbols = [...new Set(key)].sort((a, b) => a - b);
const missingKeySymbols = Array.from({ length: 29 }, (_, i) => i).filter(i => !uniqueKeySymbols.includes(i));

const mod29 = value => ((value % 29) + 29) % 29;
function indexOfCoincidence(values) {
  if (values.length < 2) return 0;
  const counts = Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (values.length * (values.length - 1));
}
function decodeRepeatedAdditive(ciphertext, sign) {
  return ciphertext.map((value, i) => mod29(value + sign * key[i % key.length]));
}
function encodeRepeatedAdditive(plaintext, sign) {
  return plaintext.map((value, i) => mod29(value - sign * key[i % key.length]));
}
function topTrigrams(values, limit = 10) {
  const counts = new Map();
  for (let i = 0; i + 2 < values.length; i += 1) {
    const trigram = values.slice(i, i + 3).join(',');
    counts.set(trigram, (counts.get(trigram) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([trigram, count]) => ({
      runes: trigram.split(',').map(Number).map(i => runeTokens[i]).join(' '),
      count
    }));
}

const chapterPages = corpus.pages.filter(page => page.page >= 15 && page.page <= 22);
assert.equal(chapterPages.length, 8);
const chapterCiphertext = chapterPages.flatMap(page => page.indices);
assert.equal(chapterCiphertext.length, 1903);
assert.equal(chapterPages[0].page, 15);
assert.equal(chapterPages[0].indices.length, 159);
const bodyCiphertext = chapterCiphertext.slice(9);
assert.equal(bodyCiphertext.length, 1894);

const originalChapterIoC = indexOfCoincidence(chapterCiphertext);
const originalBodyIoC = indexOfCoincidence(bodyCiphertext);
const repeatedKeyResults = [];
for (const sign of [-1, 1]) {
  const candidate = decodeRepeatedAdditive(chapterCiphertext, sign);
  assert.deepEqual(encodeRepeatedAdditive(candidate, sign), chapterCiphertext);
  const bodyResetCandidate = decodeRepeatedAdditive(bodyCiphertext, sign);
  assert.deepEqual(encodeRepeatedAdditive(bodyResetCandidate, sign), bodyCiphertext);
  repeatedKeyResults.push({
    operation: sign === -1 ? 'P = C - K (mod 29)' : 'P = C + K (mod 29)',
    fullChapterIoC: indexOfCoincidence(candidate),
    bodyOnlyClockResetIoC: indexOfCoincidence(bodyResetCandidate),
    first60FullChapterTokens: candidate.slice(0, 60).map(i => runeTokens[i]).join(' '),
    topFullChapterTrigrams: topTrigrams(candidate),
    exactOriginalForwardReencryption: true
  });
}

// Native-GP positive plant: repeat the independently clear p57 text to 190 runes.
const clearP57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(clearP57.length, 95);
const plantedPlaintext = clearP57.concat(clearP57);
const positiveControls = [];
for (const sign of [-1, 1]) {
  const plantedCiphertext = encodeRepeatedAdditive(plantedPlaintext, sign);
  assert.deepEqual(decodeRepeatedAdditive(plantedCiphertext, sign), plantedPlaintext);
  positiveControls.push({
    operation: sign === -1 ? 'P = C - K (mod 29)' : 'P = C + K (mod 29)',
    plantedRunes: plantedPlaintext.length,
    exactRecovery: true
  });
}

// One of the 56 GP values per physical page is a natural competing reading.
const unknownPages = corpus.pages.filter(page => page.page >= 0 && page.page <= 55);
assert.equal(unknownPages.length, 56);
const pageShiftResults = [];
for (const sign of [-1, 1]) {
  const decodedPages = unknownPages.map(page => page.indices.map(value => mod29(value + sign * key[page.page])));
  for (let i = 0; i < unknownPages.length; i += 1) {
    assert.equal(indexOfCoincidence(decodedPages[i]), indexOfCoincidence(unknownPages[i].indices));
  }
  const decodedChapter = decodedPages.filter((_, i) => i >= 15 && i <= 22).flat();
  pageShiftResults.push({
    operation: sign === -1 ? 'P = C - K[physicalPage] (mod 29)' : 'P = C + K[physicalPage] (mod 29)',
    fullChapterIoC: indexOfCoincidence(decodedChapter),
    perPageIoCInvariant: true,
    p15ToP22OriginalPerPageIoCs: unknownPages.slice(15, 23).map(page => ({
      page: page.page,
      runes: page.indices.length,
      ioc: indexOfCoincidence(page.indices)
    }))
  });
}

const report = {
  source: {
    image: 'resources/liber-primus/32.jpg',
    imageSha256,
    primeValues: primes,
    printedAbsoluteDifferencesInSpiralOrder: printedSpiral
  },
  orderControls: {
    rowMajor: {
      bitLength: rowMajorBits.length,
      fiveBitGroups: rowMajorGroups.length,
      trailingBits: rowMajorTail,
      allGroupsAreGp29: true,
      maximumGroup: Math.max(...rowMajorGroups)
    },
    reversedSpiral: {
      bitLength: reverseBits.length,
      fiveBitGroups: reverseGroups.length,
      trailingBits: reverseBits.slice(reverseGroups.length * 5),
      allGroupsAreGp29: true,
      maximumGroup: Math.max(...reverseGroups)
    }
  },
  zeckendorf: {
    basis: fib,
    codewords,
    codewordLengths: codewords.map(word => word.length),
    concatenatedBitLength: bits.length,
    concatenatedBits: bits,
    finalTwoBits: trailingBits,
    completeFiveBitGroups: groupCount,
    fiveBitGroups,
    allGroupsAreGp29: true,
    keyTokens,
    keyGlyphs: key.map(value => runeGlyphs[value]),
    distinctSymbols: uniqueKeySymbols.length,
    missingSymbols: missingKeySymbols,
    allPermutationsRangeValid: allCodewordOrdersHaveOnlyGp29Groups,
    allPermutationsHave56GroupsAndTerminal11: allCodewordOrdersHaveSame56Groups,
    exhaustiveOrderedCodewordPairs: codewords.length ** 2,
    checkedPairFiveBitWindows: pairBoundaryWindows
  },
  target: {
    physicalPages: chapterPages.map(page => ({ page: page.page, runes: page.indices.length })),
    originalRunes: chapterCiphertext.length,
    originalChapterIoC,
    bodyRunesAfterNineRuneP15Rubric: bodyCiphertext.length,
    originalBodyIoC
  },
  repeatedAdditiveKey: repeatedKeyResults,
  pageSpecificCaesarKey: pageShiftResults,
  nativeGpPositiveControls: {
    source: 'clear original p57',
    sourceRunes: clearP57.length,
    plantConstruction: 'p57 || p57',
    tests: positiveControls
  }
};

process.stdout.write(JSON.stringify(report, null, 2) + '\n');
