'use strict';

/**
 * Conditional original-artifact crosslink of p15's last two Fibonacci-prime
 * entries, archived 2014 HTML id, original p49 red ten-dot mark, and the
 * known p27/p55 terminal six-rune echo. No original author opcode claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name */
const read = (name) => fs.readFileSync(path.join(root, 'resources', name), 'utf8');

const originalIndex = read('cicada2014-onion7-index.html');
const htmlId = /<div id="([0-9]+)">/.exec(originalIndex);
const htmlTitle = /<title>([0-9]+)<\/title>/.exec(originalIndex);
assert.ok(htmlId && htmlTitle);
assert.equal(htmlId[1], '331');
assert.equal(htmlTitle[1], '133');

const corpus = JSON.parse(read('liber-primus/lp2-corpus.json'));
const annotations = JSON.parse(read('liber-primus/lp2-ink-annotations.json'));
const imagesP40To55 = corpus.pages.filter((p) => p.page >= 40 && p.page <= 55);
assert.deepEqual(imagesP40To55.map((p) => p.page),
  Array.from({ length: 16 }, (_, i) => 40 + i));
const originalFlora = imagesP40To55.flatMap((p) => p.indices);
assert.equal(originalFlora.length, 3316);

const p55 = corpus.pages.find((p) => p.page === 55);
const p27 = corpus.pages.find((p) => p.page === 27);
const originalSuffix = p55.indices.slice(-6);
assert.deepEqual(originalSuffix, p27.indices.slice(28, 34));
assert.equal(originalSuffix.map((i) => corpus.translit[i]).join(''), 'DJUBEI');
const bodyWithoutTerminalEcho = originalFlora.slice(0, -originalSuffix.length);
assert.equal(bodyWithoutTerminalEcho.length, 3310);

// This six-symbol echo is the only full repeated length-six substring of
// the original entire 12,956-rune unknown tape. This is a known observation,
// rechecked solely to tie the exact 6 to a source-visible terminal motif.
const originalTape = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
assert.equal(originalTape.length, 12956);
const seen = new Map();
const duplicateSix = [];
for (let i = 0; i <= originalTape.length - 6; i++) {
  const key = originalTape.slice(i, i + 6).join(',');
  if (seen.has(key)) duplicateSix.push([seen.get(key), i]);
  else seen.set(key, i);
}
assert.deepEqual(duplicateSix, [[6555, 12950]]);

/** @param {number} n one-based prime rank */
function nthPrime(n) {
  let count = 0;
  for (let i = 2; ; i++) {
    let prime = true;
    for (let div = 2; div * div <= i; div++) {
      if (i % div === 0) { prime = false; break; }
    }
    if (prime && ++count === n) return i;
  }
}

const fibonacci = [0, 1, 1];
for (let i = 3; i <= 16; i++) fibonacci.push(fibonacci[i - 1] + fibonacci[i - 2]);
const distinctFibonacci = [0, ...fibonacci.slice(2)];
assert.equal(distinctFibonacci.length, 16);
assert.equal(distinctFibonacci[14], 610);
assert.equal(distinctFibonacci[15], 987);
const generatingPrimes = distinctFibonacci.map((f) => nthPrime(f + 1));
const lastTwoPrimes = generatingPrimes.slice(-2);
assert.deepEqual(lastTwoPrimes, [4507, 7817]);
assert.ok(generatingPrimes.slice(0, 14).every((p) => p < 3301));
assert.ok(lastTwoPrimes.every((p) => p > 3301));
const lastGap = lastTwoPrimes[1] - lastTwoPrimes[0];
assert.equal(lastGap, 3310);
assert.equal(bodyWithoutTerminalEcho.length, lastGap);

const markedFlora = annotations.pages
  .filter((p) => p.page >= 40 && p.page <= 55)
  .flatMap((p) => (p.large_punctuation || []).map(([after, dotCount, ink]) =>
    ({ page: p.page, after, dotCount, ink })));
const floralRedTen = markedFlora.filter((m) => m.dotCount === 10 && m.ink === 'red');
assert.deepEqual(floralRedTen, [{ page: 49, after: 66, dotCount: 10, ink: 'red' }]);
const oneBasedFloralOrdinal = floralRedTen[0].page - 40 + 1;
assert.equal(oneBasedFloralOrdinal, 10);
assert.equal(lastGap, Number(htmlId[1]) * oneBasedFloralOrdinal);
const beforeP54 = imagesP40To55.filter((p) => p.page <= 53)
  .reduce((sum, p) => sum + p.indices.length, 0);
assert.equal(beforeP54, 3008);
const nineFullRegisterRows = 9 * Number(htmlId[1]);
assert.equal(nineFullRegisterRows, 2979);
assert.equal(beforeP54 - nineFullRegisterRows, 29);
const redP53 = annotations.pages.find((p) => p.page === 53).red_spans[0];
assert.equal(redP53.length, 51);
assert.equal(redP53.start, 128);
const redP53StartInRegister = beforeP54 - redP53.length;
assert.equal(redP53StartInRegister, 2957);
assert.equal(nineFullRegisterRows - redP53StartInRegister, 22);
assert.equal(3299 % 29, 22);
assert.equal(redP53.length, 22 + 29);
const p54Ink = annotations.pages.find((p) => p.page === 54);
const originalP54RedHeading = p54Ink.red_spans.find((r) => r.start === 0);
assert.equal(originalP54RedHeading.length, 9);
assert.equal(lastGap - 3301, originalP54RedHeading.length);


/** @param {number[]} values */
function ioc(values) {
  const counts = new Array(29).fill(0);
  for (const val of values) counts[val]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
const sourceIoc = ioc(bodyWithoutTerminalEcho);
const clearP57 = corpus.pages.find((p) => p.page === 57).indices;
assert.ok(ioc(clearP57) > sourceIoc + 0.015);
// Every pure rearrangement has exact same rune inventory and thus identical IoC.
assert.equal(ioc([...bodyWithoutTerminalEcho].reverse()), sourceIoc);
assert.equal(ioc([...bodyWithoutTerminalEcho].sort((a, b) => a - b)), sourceIoc);

/**
 * One bounded, original-shape direct typed-output attempt. The signed 2013
 * Cicada TCP protocol documented BASE29 numeral conversion, although it
 * did not explicitly apply it to the LP2 runes. This is a hypothetical
 * consumer of the newly source-constrained 10x331 register.
 * @param {number[]} digits
 */
function positionalBase29(digits) {
  return digits.reduce((value, digit) => value * 29n + BigInt(digit), 0n);
}
/** @param {bigint} value @param {number} byteWidth */
function fixedBigEndian(value, byteWidth) {
  const bytes = new Array(byteWidth).fill(0);
  for (let i = byteWidth - 1; i >= 0; i--) {
    bytes[i] = Number(value & 255n);
    value >>= 8n;
  }
  assert.equal(value, 0n);
  return bytes;
}
/** @param {number[]} bytes */
function byteProfile(bytes) {
  return {
    byteCount: bytes.length,
    first16Hex: bytes.slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join(''),
    printableAscii: bytes.filter((b) => b >= 32 && b <= 126).length,
  };
}
const per331 = Array.from({ length: 10 }, (_, r) =>
  positionalBase29(bodyWithoutTerminalEcho.slice(r * 331, (r + 1) * 331)));
const per10 = Array.from({ length: 331 }, (_, r) =>
  positionalBase29(bodyWithoutTerminalEcho.slice(r * 10, (r + 1) * 10)));
const tenLongRowsBinary = per331.flatMap((n) => fixedBigEndian(n, 201));
const threeHundredThirtyOneShortRowsBinary = per10.flatMap((n) => fixedBigEndian(n, 7));
const tenRuneResiduesMod256 = per10.map((n) => Number(n % 256n));
const tenRuneResiduesMod331 = per10.map((n) => Number(n % 331n));
assert.equal(tenLongRowsBinary.length, 2010);
assert.equal(threeHundredThirtyOneShortRowsBinary.length, 2317);
assert.equal(tenRuneResiduesMod256.length, 331);
assert.equal(byteProfile(tenLongRowsBinary).first16Hex, '02ee7f5293dc87184f30c058a3d2d3e3');
assert.equal(byteProfile(threeHundredThirtyOneShortRowsBinary).first16Hex, '0004683285922100c4ae216d7aca010c');
assert.equal(byteProfile(tenRuneResiduesMod256).first16Hex, '21ca1921e595d4b283e921321d3743f7');

console.log(JSON.stringify({
  archived2014Html: { title: htmlTitle[1], id: htmlId[1] },
  authenticPrintedTenDot: floralRedTen[0],
  p15LastDistinctFibonacciIndices: distinctFibonacci.slice(-2),
  p15LastPrimeRanks: distinctFibonacci.slice(-2).map((f) => f + 1),
  p15LastGeneratedPrimes: lastTwoPrimes,
  signedPrimeGap: lastGap,
  originalSixteenFloraRuneCount: originalFlora.length,
  terminalUniqueRepeatedSixRunes: 'DJU-BEI',
  originalDuplicateSixGlobalPositions: duplicateSix,
  floraExcludingTerminalEcho: bodyWithoutTerminalEcho.length,
  tenTimesArchivedId: oneBasedFloralOrdinal * Number(htmlId[1]),
  lastPrimeGapMinusCicada3301: lastGap - 3301,
  sourceP54OpeningRedRuneCountAtSignedFlip: originalP54RedHeading.length,
  final331RuneRowStartsAtRegisterOffset: nineFullRegisterRows,
  p53LastRedStanzaStartAtRegisterOffset: redP53StartInRegister,
  sourceRed51AtRowSeam: [22, 29],
  finalRowFirst29RedRunesThenP54Red9: true,
  trimmedFloraIoc: sourceIoc,
  directSourceShapeBase29: {
    tenRowsOf331NumeralBytes: byteProfile(tenLongRowsBinary),
    threeHundredThirtyOneRowsOf10NumeralBytes: byteProfile(threeHundredThirtyOneShortRowsBinary),
    lowByteOfTenRuneNumeral: byteProfile(tenRuneResiduesMod256),
    residueModuloHtml331Printable: tenRuneResiduesMod331.filter((n) => n >= 32 && n <= 126).length,
    residueModuloHtml331Over255: tenRuneResiduesMod331.filter((n) => n > 255).length,
  },
  clearP57Ioc: ioc(clearP57),
  permutationOnlyDecodeCannotRestoreEnglishIoc: true,
  conclusion: 'Exact multi-source arithmetic alignment; cutting last six, multiplying 10*331, and using a 331x10 decoder are NOT authenticated operations. No plaintext.',
}, null, 2));
