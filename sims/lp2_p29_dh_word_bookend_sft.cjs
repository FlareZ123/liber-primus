'use strict';

/**
 * Original p29 whole-word boundary to the independently authenticated 2013 DH23
 * worked example. Research SFT: a finite exact source test, not a plaintext claim.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(repoRoot, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const originalText = fs.readFileSync(
  path.join(repoRoot, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8'
);
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const p29 = pages.find((page) => page.page === 29);
assert(p29);
assert.equal(pages.length, 55);
assert.equal(p29.indices.length, 277);

const signedDh = Object.freeze({
  p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2,
});
const mod29 = (value) => ((value % 29) + 29) % 29;

/** @param {number} base @param {number} power @param {number} prime */
function powMod(base, power, prime) {
  let value = 1;
  for (let step = 0; step < power; step++) value = (value * base) % prime;
  return value;
}

assert.equal(powMod(signedDh.g, signedDh.a, signedDh.p), signedDh.A);
assert.equal(powMod(signedDh.g, signedDh.b, signedDh.p), signedDh.B);
assert.equal(powMod(signedDh.B, signedDh.a, signedDh.p), signedDh.K);

const startExpected = [signedDh.K, signedDh.p, signedDh.a];
const endExpected = [signedDh.a, signedDh.A, signedDh.B];
assert.deepEqual(p29.indices.slice(0, 3), startExpected);
assert.deepEqual(p29.indices.slice(-3), endExpected);

const p29Print = originalText.split('%')[29].trim();
assert.match(p29Print, /^ᚦᛞᚷ-/u, 'First three runes must be a complete printed word');
assert.match(p29Print, /-ᚷᚻᛗ\/\s*$/u, 'Page-terminal three-rune fragment must match original print');

const G = [mod29(-signedDh.K), signedDh.g, signedDh.b];
assert.deepEqual(G, [27, 5, 15]);
const root = 3301 % 29;
const gAtRoot = mod29(G[0] + G[1] * root + G[2] * root * root);
const gDerivative = mod29(G[1] + 2 * G[2] * root);
assert.deepEqual([gAtRoot, gDerivative], [0, 0]);

/** Polynomial coefficients are in original high-to-low source order.
 *  @param {number[]} coefficients
 *  @param {number} at
 */
function evalPoly(coefficients, at) {
  return coefficients.reduce((v, c) => mod29(v * at + c), 0);
}

const derivative = p29.indices.slice(0, -1).map(
  (v, i) => mod29(v * (p29.indices.length - 1 - i))
);
assert.equal(evalPoly(p29.indices, root), 0);
assert.equal(evalPoly(derivative, root), 0);

const dhValues = new Set(Object.values(signedDh));
assert.equal(dhValues.size, 7);
const ranking = pages.map((page) => ({
  page: page.page,
  six: [...page.indices.slice(0, 3), ...page.indices.slice(-3)],
  hits: [...page.indices.slice(0, 3), ...page.indices.slice(-3)]
    .filter((value) => dhValues.has(value)).length,
})).sort((x, y) => y.hits - x.hits || x.page - y.page);
assert.equal(ranking[0].page, 29);
assert.equal(ranking[0].hits, 6);
assert.equal(ranking[1].hits, 4);
assert.equal(ranking.filter((page) => page.hits === 6).length, 1);

console.log('Input: 55 original rune-bearing LP2 p0..55 pages, 12,956 rune symbols.');
console.log('Source: 2013 signed DH23 worked example, state:', signedDh);
console.log('p29 complete first word GP indices:', startExpected, '(K,p,a)');
console.log('p29 final on-page three-rune fragment GP indices:', endExpected, '(a,A,B)');
console.log('p39 red G = (-K,g,b) =', G, '= 15(X-24)^2 mod 29');
console.log('p29 P(24) and formal derivative P\'(24):',
  evalPoly(p29.indices, root), evalPoly(derivative, root));
console.log('Boundary six-value DH membership; top three:',
  JSON.stringify(ranking.slice(0, 3)));

/** Locked three-row DH bookend Hill candidate, original source print order. */
const M = [startExpected, endExpected, G];
const p39 = pages.find((page) => page.page === 39);
assert(p39);
assert.equal(p39.indices.length, 240);
assert.deepEqual(p39.indices.slice(119, 122), G);
const body39 = p39.indices.filter((_, index) => index < 119 || index >= 122);
assert.equal(body39.length, 237);

/** @param {number[][]} source */
function inverse3(source) {
  const q = source.map((row, i) => row.concat(
    [0, 1, 2].map((j) => Number(i === j))));
  for (let j = 0; j < 3; j++) {
    const pivot = q.findIndex((row, k) => k >= j && row[j] !== 0);
    assert(pivot >= 0);
    [q[j], q[pivot]] = [q[pivot], q[j]];
    const fieldInverse = [1, ...Array.from({ length: 27 }, (_, k) => k + 2)]
      .find((value) => mod29(value * q[j][j]) === 1);
    assert(fieldInverse);
    q[j] = q[j].map((value) => mod29(value * fieldInverse));
    for (let i = 0; i < 3; i++) {
      if (i === j) continue;
      const factor = q[i][j];
      q[i] = q[i].map((value, k) => mod29(value - factor * q[j][k]));
    }
  }
  return q.map((row) => row.slice(3));
}

/** @param {number[]} input @param {number[][]} matrix */
function hill3(input, matrix) {
  assert.equal(input.length % 3, 0);
  const output = [];
  for (let i = 0; i < input.length; i += 3) {
    for (let row = 0; row < 3; row++) {
      output.push(mod29(input[i] * matrix[row][0] +
        input[i + 1] * matrix[row][1] + input[i + 2] * matrix[row][2]));
    }
  }
  return output;
}

/** @param {number[]} input */
function coincidence(input) {
  const counts = Array(29).fill(0);
  input.forEach((v) => counts[v]++);
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (input.length * (input.length - 1));
}

const inverseM = inverse3(M);
assert.deepEqual(inverseM, [[15, 14, 13], [16, 2, 22], [16, 7, 8]]);
const decoded39 = hill3(body39, inverseM);
assert.deepEqual(hill3(decoded39, M), body39);
const solvedP57 = corpus.pages.find((page) => page.page === 57);
assert(solvedP57);
const clear93 = solvedP57.indices.slice(0, 93);
assert.deepEqual(hill3(hill3(clear93, M), inverseM), clear93);
assert(Math.abs(coincidence(decoded39) - 0.032789816205392265) < 1e-12);
console.log('Frozen p39 237-rune, red3-excluded Hill3 consumer:');
console.log('M:', M, 'inverse:', inverseM);
console.log('Decoded p39 IoC:', coincidence(decoded39),
  'unmodified IoC:', coincidence(body39));
console.log('p39 decoded first72 GP: ',
  decoded39.slice(0, 72).map((v) => corpus.translit[v]).join(' '));
console.log('Original 237/237 re-encryption and solved p57 93/93 plant pass.');


/**
 * A independently source-checkable candidate word-navigation path.
 * Page 29's first-word GP0 product is exactly phi(277)=276, the terminal
 * zero-based rune address, whose original symbol is B=19. The reversed
 * three-rune word exists exactly once, at source offset15 on p53.
 */
const { parseLP2Words } = require('./lp2_word_pages.cjs');
const parsed = parseLP2Words(originalText);
const joinP29P30 = parsed.words.filter(
  (word) => word.startPage === 29 && word.endPage === 30);
assert.deepEqual(joinP29P30.map((word) => word.runes),
  ['ᚷᚻᛗᛞᚪᛈᛖ']);
const primeWeight = (indices) =>
  indices.reduce((sum, index) => sum + corpus.prime[index], 0);
assert.equal(primeWeight(p29.indices.slice(0, 3)), 111);
assert.equal(primeWeight(p29.indices.slice(-3)), 111);
assert.deepEqual(pages.filter((page) =>
  primeWeight(page.indices.slice(0, 3)) ===
  primeWeight(page.indices.slice(-3))).map((page) => page.page), [29]);
console.log('P29 unique physical first/last three-rune GP prime sums:',
  111, 'even though its final printed word continues onto p30.');
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
const p53 = pages.find((page) => page.page === 53);
assert(p53);
assert.equal(p53.indices.length, 179);
assert.equal(p29.indices.length, 277);
const firstProduct = startExpected.reduce((value, digit) => value * digit, 1);
assert.equal(firstProduct, 276);
assert.equal(firstProduct, p29.indices.length - 1);
assert.equal(p29.indices[firstProduct], signedDh.B);
assert.equal(p29.indices.length - p53.indices.length, 98);
const direction = [23, 10, 4, 18, 5, 16, 10, 3, 9];
assert.equal(direction.map((v) => corpus.translit[v]).join(''),
  'DIRECTION');
assert.equal(direction.reduce((sum, x) => sum + x, 0), 98);
const reversedFirst = startExpected.toReversed();
assert.deepEqual(p53.indices.slice(signedDh.b, signedDh.b + 3),
  reversedFirst);
const reverseRunes = reversedFirst.map((index) => corpus.runes[index]).join('');
const matched = parsed.words.filter((word) => word.runes === reverseRunes);
assert.equal(matched.length, 1);
assert.equal(matched[0].startPage, 52);
assert.equal(matched[0].endPage, 52);
console.log('P29 first word GP product:', firstProduct,
  '= phi(277) = last local index, ending with B=19.');
console.log('Unique complete reversed word:', reverseRunes,
  'physical p53 at rune offset b=15; page-runecount difference:',
  p29.indices.length - p53.indices.length,
  '= GP0(DIRECTION) [postselected interpretation].');

// The p53 red 51-rune stanza is exactly 17 three-rune blocks.
const red53 = p53.indices.slice(128, 179);
assert.equal(red53.length, 51);
const decodedRed53 = hill3(red53, inverseM);
assert.deepEqual(hill3(decodedRed53, M), red53);
assert(Math.abs(coincidence(decodedRed53) - 0.03529411764705882) < 1e-12);
console.log('Frozen p53 51-red-rune Hill3 consumer:',
  'decoded IoC', coincidence(decodedRed53),
  'first15 GP', decodedRed53.slice(0, 15)
    .map((v) => corpus.translit[v]).join(' '));
console.log('Exact p53 red51 forward re-encryption passes; no recognizable text.');


/**
 * Conditional p29-length modulus hypothesis: the exact p29 rune count is
 * 277, a prime with phi(277)=276 selected by the first-word GP0 product.
 * Re-run the historical DH generator and derived exponents in this new group.
 * This changes a source protocol parameter; it is NOT author authenticated.
 */
const pNew = p29.indices.length;
const isPrime = (n) => {
  for (let k = 2; k * k <= n; k++) if (n % k === 0) return false;
  return n >= 2;
};
assert(isPrime(pNew));
const ANew = powMod(signedDh.g, signedDh.a, pNew);
const BNew = powMod(signedDh.g, signedDh.b, pNew);
const KNew = powMod(ANew, signedDh.b, pNew);
assert.deepEqual([ANew, BNew, KNew], [113, 51, 193]);
assert.equal(powMod(BNew, signedDh.a, pNew), KNew);
assert.equal(BNew, red53.length);
const first30Primes = [];
for (let v = 2; first30Primes.length < 30; v++)
  if (isPrime(v)) first30Primes.push(v);
assert.equal(first30Primes[29], ANew);

const signed2016 = fs.readFileSync(
  path.join(repoRoot, 'resources', 'historical',
    'cicada2016-4gq25-outguess.asc'), 'utf8').replace(/\r/g, '');
const signedClear = signed2016.split('-----BEGIN PGP SIGNATURE-----')[0]
  .split(/\n\n/u).slice(1).join('\n');
const source2016Words = signedClear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((token) => token.toUpperCase());
assert.equal(source2016Words.length, 43);
assert.equal(source2016Words[29], 'DIRECTION');

const grid = JSON.parse(fs.readFileSync(
  path.join(repoRoot, 'resources', 'liber-primus', 'lp2-grid-256.json'),
  'utf8'));
assert.equal(grid.bytes.length, 256);
assert.equal(grid.bytes[127], KNew);
assert.equal(grid.bytes[256 - signedDh.A], ANew);
assert.deepEqual(grid.bytes.flatMap((value, index) =>
  value === KNew ? [index] : []), [83, 127]);
console.log('Conditional new modulus DH277 outputs:',
  { p: pNew, A: ANew, B: BNew, K: KNew });
console.log('Original independent anchors:',
  '30th prime DIRECTION=113, p53 red length51,',
  'numeric table[127]=193, table[248]=113.');

const originalPad = grid.bytes.slice(128, 179);
assert.equal(originalPad.length, 51);
const decodedTable = red53.map((value, i) =>
  mod29(value - originalPad[i]));
assert(Math.abs(coincidence(decodedTable) - 0.03215686274509804) < 1e-12);
assert.deepEqual(decodedTable.map((v,i) =>
  mod29(v + originalPad[i])), red53);
const dhPowerPad = Array.from({ length: red53.length }, (_, i) =>
  powMod(KNew, i + 1, pNew));
const decodedDhPower = red53.map((value, i) =>
  mod29(value - dhPowerPad[i]));
assert(Math.abs(coincidence(decodedDhPower) - 0.043137254901960784) < 1e-12);
assert.deepEqual(decodedDhPower.map((v,i) =>
  mod29(v + dhPowerPad[i])), red53);
console.log('Source-fixed p53-red51 original cipher checks:',
  'table-aligned IoC', coincidence(decodedTable),
  'DH-shared-power IoC', coincidence(decodedDhPower));
console.log('Both 51-rune sources reencrypt exactly and neither yields text.');


/**
 * Conditional prime-rank waypoint: shared value193 is the 44th prime.
 * Its page p44 has the exact original terminal DH client packet
 * [B,p,b]=[19,23,15]. Its GP prime sum213 is the exact rune length of
 * p23, selected by its middle index23. The complete 55-page source
 * family has one terminal-middle/prime-sum matching page, p44.
 */
const first44Primes = [];
for (let n = 2; first44Primes.length < 44; n++)
  if (isPrime(n)) first44Primes.push(n);
assert.equal(first44Primes[43], KNew);
const p44 = pages.find((page) => page.page === 44);
const p23 = pages.find((page) => page.page === 23);
assert(p44 && p23);
const packet44 = p44.indices.slice(-3);
assert.deepEqual(packet44, [signedDh.B, signedDh.p, signedDh.b]);
assert.equal(primeWeight(packet44), 213);
assert.equal(p23.indices.length, 213);
assert.equal(packet44[1], p23.page);
const middleLengthHits = pages.filter((page) => {
  const tail = page.indices.slice(-3);
  const targetPage = pages.find((entry) => entry.page === tail[1]);
  return targetPage && primeWeight(tail) === targetPage.indices.length;
}).map((page) => page.page);
assert.deepEqual(middleLengthHits, [44]);
console.log('Candidate K=193 -> 44th prime -> p44 terminal',
  packet44, '= [B,p,b]; GP prime sum213 -> p23 213 runes.');
console.log('Original 55-page terminal-middle/prime-sum target hits:',
  middleLengthHits);

// Freeze the already-established p28 H-difference readout on an
// untouched source-marked p23 red16 stanza. It does NOT yield a contiguous
// phrase in the authenticated 2016 source; no alternate clock is fitted.
const ink = JSON.parse(fs.readFileSync(
  path.join(repoRoot, 'resources', 'liber-primus',
    'lp2-ink-annotations.json'), 'utf8'));
const p23Ink = ink.pages.find((page) => page.page === 23);
assert(p23Ink);
assert.deepEqual(p23Ink.red_spans.map((part) =>
  [part.start, part.length]), [[0, 16]]);
const red23 = p23.indices.slice(0, 16);
const d4 = [];
for (let i = 0; i < red23.length; i += 4) {
  d4.push(mod29(red23[i] - red23[i + 3]));
  d4.push(mod29(red23[i + 1] - red23[i + 2]));
}
assert.deepEqual(d4, [9, 17, 0, 20, 27, 7, 19, 7]);
const words23 = d4.map((value) => source2016Words[value]);
assert.deepEqual(words23,
  ['LIBER', 'THE', 'HELLO', 'MEANING', 'ARE', 'THE', 'THEIR', 'THE']);
assert.equal(source2016Words.join(' ').includes(words23.join(' ')), false);
console.log('Locked p23 marked-red16 H-D4 original consumer:',
  words23.join(' '), '(non-phrase, rejected).');


/**
 * One direct authentic-p56 cipher transfer with the candidate DH K'=193.
 * Select its 44th-prime index 43 (zero based), reset once at each natural
 * receiver, apply the existing p56 ciphertext-F bypass rule and subtract
 * prime-1 modulo29. No fitted masks, keyword or plaintext scoring.
 */
const primeStream = [...first44Primes];
for (let n = primeStream.at(-1) + 1; primeStream.length < 350; n++)
  if (isPrime(n)) primeStream.push(n);
const shiftedByP56 = (source) => {
  let cursor = 43;
  return source.map((value) =>
    value === 0 ? value : mod29(value - (primeStream[cursor++] - 1)));
};
const conditionalP56Receivers = [
  { name: 'p23 black197', ciphertext: p23.indices.slice(16),
    expectedIoC: 0.036827929141199624 },
  { name: 'p53 red51', ciphertext: red53,
    expectedIoC: 0.034509803921568626 },
  { name: 'p44 full273', ciphertext: p44.indices,
    expectedIoC: 0.035256410256410256 },
  { name: 'p55 final76 holdout',
    ciphertext: pages.find((page) => page.page === 55).indices,
    expectedIoC: 0.034736842105263156 },
];
for (const target of conditionalP56Receivers) {
  const output = shiftedByP56(target.ciphertext);
  assert(Math.abs(coincidence(output) - target.expectedIoC) < 1e-12);
  // Note: the literal-F bypass branch is not unconditionally self-inverting
  // if a non-F ciphertext rune happens to decrypt to F. Re-encryption of a
  // particular ciphertext must recover its original bypass bit mask.
  let cursor = 43;
  const reproduced = output.map((value, i) => {
    if (target.ciphertext[i] === 0) return 0;
    return mod29(value + (primeStream[cursor++] - 1));
  });
  assert.deepEqual(reproduced, target.ciphertext);
  console.log('K193 p56 prime-totient transfer on', target.name,
    'n=', output.length, 'decoded IoC=', coincidence(output),
    'opening40=', output.slice(0, 40).map((v) =>
      corpus.translit[v]).join(' '));
}
console.log('One source-fixed p56 transfer at DH-derived K193 is nonlinguistic',
  'on three original targets; exact forward controls pass.');

console.log('PASS. Exact source-index linkage. No deciphered LP2 text or');
console.log('independently sourced instruction selecting this DH bookend grammar.');
