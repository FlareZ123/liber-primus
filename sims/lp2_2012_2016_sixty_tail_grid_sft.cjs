'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Tests a cross-round +60-size clue and the simplest direct use of the
 * 2012 first-image 60-byte printed trailer on the 2014 LP2 256-byte grid.
 * Inputs are source-native JPEGs, not reconstructed text files.
 */
const ROOT = path.resolve(__dirname, '..');
const original2012 = fs.readFileSync(path.join(ROOT, 'resources/historical/cicada2012-first-image.jpg'));
const original2016 = fs.readFileSync(path.join(ROOT, 'resources/historical/cicada2016-4gq25.jpg'));
const grid = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));

/** @param {Buffer} bytes */
function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

/** @param {Buffer} jpeg */
function dimensions(jpeg) {
  assert.equal(jpeg.readUInt16BE(0), 0xffd8);
  const sof = jpeg.indexOf(Buffer.from([0xff, 0xc0]));
  assert.ok(sof > 0);
  assert.equal(jpeg[sof + 4], 8);
  return { width: jpeg.readUInt16BE(sof + 7), height: jpeg.readUInt16BE(sof + 5) };
}

/**
 * @param {Buffer} input
 * @param {Buffer} key
 * @param {'xor'|'add'|'subtract'} op
 */
function transform(input, key, op) {
  return Buffer.from(input.map((b, i) => {
    const k = key[i % key.length];
    if (op === 'xor') return b ^ k;
    return op === 'add' ? (b + k) & 255 : (b - k + 256) & 255;
  }));
}

/** @param {Buffer} bytes */
function readability(bytes) {
  let printable = 0;
  let longestPrintRun = 0;
  let run = 0;
  for (const b of bytes) {
    if (b >= 32 && b <= 126) {
      printable++;
      run++;
      longestPrintRun = Math.max(longestPrintRun, run);
    } else run = 0;
  }
  return { printable, longestPrintRun };
}

assert.equal(sha256(original2012), '870353b8fbe4d1dd83fdbfc61b07d80213bab035526d3e5fd6a43f7d77db1ead');
assert.equal(sha256(original2016), 'a8340ad04b83fb3130e7ed9172867a440812e87089d6aa2b932d97c6ae38aebe');
const first = dimensions(original2012);
const later = dimensions(original2016);
assert.deepEqual(first, { width: 509, height: 503 });
assert.deepEqual(later, { width: 563, height: 569 });
const ascendingFirst = Object.values(first).sort((a, b) => a - b);
const ascendingLater = Object.values(later).sort((a, b) => a - b);
assert.deepEqual(ascendingLater.map((x, i) => x - ascendingFirst[i]), [60, 60]);

/**
 * Historically exact 2012 phone-stage operation: for an image whose width
 * and height are prime, multiply those two primes by 3301 and append .com.
 * Reapplication to the 2016 signed carrier is only a candidate destination.
 * @param {number} x
 */
function isPrime(x) {
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false;
  return x > 1;
}
assert.ok([first.width, first.height, later.width, later.height, 3301].every(isPrime));
const original2012Host = first.width * first.height * 3301;
const candidate2016Host = later.width * later.height * 3301;
assert.equal(original2012Host, 845145127);
assert.equal(candidate2016Host, 1057465447);

/*
 * A third, pre-2016 original-source witness: p32 is an 11×11 rune matrix.
 * Its first row and first column have GP-prime sums equal to both 2016 JPEG
 * dimensions. This makes the hypothetical phone-product candidate
 * reconstructible from an original LP2 page already public in 2014.
 */
const page32 = corpus.pages.find(page => page.page === 32);
assert.equal(page32.indices.length, 121);
assert.equal(corpus.prime.length, 29);
const topRow = page32.indices.slice(0, 11);
const leftColumn = Array.from({length: 11}, (_, i) => page32.indices[i * 11]);
const sumGP = indices => indices.reduce((sum, index) => sum + corpus.prime[index], 0);
assert.equal(sumGP(topRow), 563);
assert.equal(sumGP(leftColumn), 569);
assert.equal(sumGP(topRow) * sumGP(leftColumn) * 3301, candidate2016Host);

/*
 * Both 2014 edge sums can be returned to the earlier 2012 pixel dimensions
 * by changing only their shared top-left symbol. The original p32 corner is
 * L, prime73. The exactly inferred replacement is C, prime13 (73−60).
 * This is an exact counterfactual source bridge, not recovered p32 plaintext.
 */
const printedCornerIndex = page32.indices[0];
const printedCornerPrime = corpus.prime[printedCornerIndex];
const earlierCornerPrime = printedCornerPrime - 60;
const earlierCornerIndex = corpus.prime.indexOf(earlierCornerPrime);
assert.equal(corpus.translit[printedCornerIndex], 'L');
assert.equal(printedCornerPrime, 73);
assert.equal(earlierCornerPrime, 13);
assert.equal(earlierCornerIndex, 5);
assert.equal(corpus.translit[earlierCornerIndex], 'C');
assert.equal(sumGP(topRow) - printedCornerPrime + earlierCornerPrime, 503);
assert.equal(sumGP(leftColumn) - printedCornerPrime + earlierCornerPrime, 509);

/*
 * Falsifiable cipher-consumer control: all GP primes differing by exactly
 * 60 yield ten disjoint symbol pairs. Swapping each pair is the reversible
 * alphabet-wide extension of the corner L↔C bridge. It must preserve exact
 * whole-page rune collision counts, and it does not reveal p32 plaintext.
 * A many-to-one high-prime→low-prime fold inflates IoC for a uniform source;
 * the inflation is not linguistic evidence.
 */
const alphabetSwap = Array.from({length: 29}, (_, i) => i);
const alphabetFold = Array.from({length: 29}, (_, i) => i);
let paired = 0;
for (let i = 0; i < 29; i++) {
  const j = corpus.prime.indexOf(corpus.prime[i] + 60);
  if (j >= 0) {
    alphabetSwap[i] = j;
    alphabetSwap[j] = i;
    alphabetFold[j] = i;
    paired++;
  }
}
assert.equal(paired, 10);
assert.ok(alphabetSwap.every((j, i) => alphabetSwap[j] === i));
assert.equal(alphabetSwap[printedCornerIndex], earlierCornerIndex);
const collisionNumerator = indices => {
  const counts = Array(29).fill(0);
  for (const index of indices) counts[index]++;
  return counts.reduce((s, f) => s + f * (f - 1), 0);
};
const originalP32Collisions = collisionNumerator(page32.indices);
const swappedP32Collisions = collisionNumerator(page32.indices.map(i => alphabetSwap[i]));
const foldedP32Collisions = collisionNumerator(page32.indices.map(i => alphabetFold[i]));
assert.equal(originalP32Collisions, 496);
assert.equal(swappedP32Collisions, 496);
assert.equal(foldedP32Collisions, 836);
// Uniform GP29 input under this 10-pair collapse has exactly (10*4+9)/29^2.
assert.equal(10 * 4 + 9, 49);





const trailer = original2012.subarray(original2012.length - 61);
assert.equal(trailer.toString('ascii'), 'TIBERIVS CLAVDIVS CAESAR says "lxxt>33m2mqkyv2gsq3q=w]O2ntk"\n');
const key = trailer.subarray(0, 60);
assert.equal(key.length, 60);

assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8 && row.every(v => Number.isInteger(v) && v >= 0 && v < 256)));
const sourceBytes = Buffer.from(grid.byte_rows.flat());
assert.equal(sourceBytes.length, 256);
assert.equal(sha256(sourceBytes), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const results = {};
for (const op of ['xor', 'add', 'subtract']) {
  const decoded = transform(sourceBytes, key, op);
  results[op] = { ...readability(decoded), first24Hex: decoded.subarray(0, 24).toString('hex') };
  const plant = Buffer.from('THE INSTAR EMERGENCE. LIBER PRIMUS. 3301. '.repeat(7).slice(0, 256), 'ascii');
  assert.equal(plant.length, 256);
  const inverseOp = op === 'add' ? 'subtract' : op === 'subtract' ? 'add' : 'xor';
  const codedPlant = transform(plant, key, inverseOp);
  assert.deepEqual(transform(codedPlant, key, op), plant);
}
assert.equal(results.xor.printable, 93);
assert.equal(results.add.printable, 84);
assert.equal(results.subtract.printable, 95);
console.log(JSON.stringify({
  source2012: first,
  source2016: later,
  sortedDimensionDelta: [60, 60],
  original2012PhoneDomain: original2012Host + '.com',
  original2014LP2P32SourceDimensions: { firstRowGPPrimeSum: sumGP(topRow), firstColumnGPPrimeSum: sumGP(leftColumn) },
  original2014P32CornerCounterfactual: { printed: 'L', printedPrime: printedCornerPrime, hypotheticalPrior: 'C', priorPrime: earlierCornerPrime, inferredShift: 60 },
  source60GPAlphabetConsumer: { swappedPairs: paired, originalP32Collisions, swappedP32Collisions, foldedP32Collisions, uniformFoldExpectedIoC: 49 / 841 },
  hypothetical2016AnalogDomain: candidate2016Host + '.com',
  analogDomainStatus: 'arithmetic candidate only: no historical host or archive verified',
  image2012Trailer: { fullBytes: trailer.length, printablePayloadBytes: key.length },
  originalGridByteLength: sourceBytes.length,
  directReversibleReadouts: results,
  evidenceLevel: 'source-aligned clue and bounded negative: no original LP2 plaintext/key'
}, null, 2));
