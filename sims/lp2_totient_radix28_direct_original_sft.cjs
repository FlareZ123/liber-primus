'use strict';

/**
 * LP2 original-input, literal phi(29)=28 radix/difference inverse.
 *
 * Motivation: all 29 GP runes, the source's explicit TOTIENT instruction,
 * and 86 rare adjacent-equal GP ciphertext positions suggest testing a
 * lossless 28-step cumulative emitter with a visible zero-difference escape.
 *
 * Frozen decoder per independent region:
 * 1. For each consecutive ciphertext rune, take (sign * (C[i]-C[i-1])) mod 29.
 * 2. Treat zero steps as explicit non-data repetitions; remove them.
 * 3. Remaining steps 1..28 represent base28 digits 0..27 by subtracting 1.
 * 4. Interpret the digit string as one big-endian base28 integer.
 * 5. Represent the same integer as GP29 digits (0..28) in big-endian order.
 *
 * This gives the literal plus/minus, book/chapter/physical-page reset family.
 * It makes no assumption about the ciphertext word boundaries or English keys.
 *
 * Run: node sims/lp2_totient_radix28_direct_original_sft.cjs
 * All input files are read-only. Node 22 CommonJS; no outside libraries.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '..', 'resources/liber-primus/lp2-corpus.json'), 'utf8'));

assert.equal(src.pages.length, 58);
assert.equal(src.runes.length, 29);
assert.equal(src.pages.slice(0, 56).reduce((t, p) => t + p.indices.length, 0), 12956);
assert.equal(src.pages[50].indices.length, 0);

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const n = symbols.length;
  const counts = Array(29).fill(0);
  for (const s of symbols) counts[s]++;
  return counts.reduce((s, c) => s + c * (c - 1), 0) / (n * (n - 1));
}

/** @param {number[]} srcDigits @param {number} radix @returns {bigint} */
function parseBase(srcDigits, radix) {
  let value = 0n;
  const b = BigInt(radix);
  for (const digit of srcDigits) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < radix);
    value = value * b + BigInt(digit);
  }
  return value;
}

/** @param {bigint} number @param {number} radix @returns {number[]} */
function toBase(number, radix) {
  const digits = [];
  const b = BigInt(radix);
  if (number === 0n) return [0];
  while (number > 0n) {
    digits.push(Number(number % b));
    number /= b;
  }
  return digits.reverse();
}

/** @param {number[]} source @param {number} sign */
function decode(source, sign) {
  assert.ok(sign === 1 || sign === -1);
  if (source.length < 2) return {digits:[], plain:[], zeros:0};
  const digits = [];
  let zeros = 0;
  for (let i = 1; i < source.length; i++) {
    const step = ((sign * (source[i] - source[i - 1])) % 29 + 29) % 29;
    if (step === 0) zeros++;
    else digits.push(step - 1);
  }
  const plain = toBase(parseBase(digits, 28), 29);
  return {digits, plain, zeros};
}

/** @param {number[]} plain */
function encryptForPositiveControl(plain) {
  const digits = toBase(parseBase(plain, 29), 28);
  const output = [7];
  for (const digit of digits) {
    output.push((output[output.length - 1] + digit + 1) % 29);
  }
  output.splice(30, 0, output[29]); // visible zero-difference marker
  output.splice(71, 0, output[70]); // independent late marker
  return output;
}

// Authentic clear LP2 control, with two planted nulls. No special plaintext
// model or key is fitted: inverse must recover all 95 original GP runes.
const clearP57 = src.pages[57].indices;
assert.equal(clearP57.length, 95);
const plant = encryptForPositiveControl(clearP57);
const control = decode(plant, 1);
assert.equal(control.zeros, 2);
assert.deepEqual(control.plain, clearP57);
assert.ok(ioc(clearP57) > 0.06);
console.log(JSON.stringify({
  control:'Authentic clear p57 -> base28 positive-step emitter with two nulls -> exact inverse',
  originalClearRunes:clearP57.length,
  emittedRunes:plant.length,
  nullsRecovered:control.zeros,
  exactRoundTrip:true,
  clearIoC:ioc(clearP57)
}));

const chapters = [[0,2],[3,7],[8,10],[11,14],[15,22],
  [23,26],[27,32],[33,39],[40,55]];
const regions = [
  ['whole',[[0,55]]],
  ['nine-original-chapters',chapters],
  ['physical-pages',Array.from({length:56},(_,i)=>[i,i])],
];

/** @param {number} a @param {number} b */
function sourceRegion(a, b) {
  return src.pages.filter(p => p.page >= a && p.page <= b).flatMap(p => p.indices);
}

const expected = {
  'whole:1':[86,12735],
  'whole:-1':[86,12735],
  'nine-original-chapters:1':[86,12731],
  'nine-original-chapters:-1':[86,12729],
  'physical-pages:1':[86,12696],
  'physical-pages:-1':[86,12696],
};
const report = [];
for (const [label, scopes] of regions) {
  for (const sign of [1,-1]) {
    const out = [];
    let zeroCount = 0;
    for (const [a,b] of scopes) {
      const ciphertext = sourceRegion(a,b);
      if (ciphertext.length < 2) continue; // p50 is a numeral-only page
      const q = decode(ciphertext,sign);
      zeroCount += q.zeros;
      out.push(...q.plain);
    }
    const counts = Array(29).fill(0);
    for (const x of out) counts[x]++;
    const row = {
      scope:label,
      sign,
      regions:scopes.length,
      originalUnknownRunes:12956,
      zeroDifferenceNulls:zeroCount,
      outputRunes:out.length,
      decodedIoC:ioc(out),
      decodedE:counts[18],
      decodedEO:counts[18]+counts[3],
      highestLetterCount:Math.max(...counts),
      first24GP:out.slice(0,24).map(n=>src.translit[n]).join(' '),
    };
    const exp = expected[`${label}:${sign}`];
    assert.deepEqual([row.zeroDifferenceNulls,row.outputRunes], exp);
    assert.ok(row.decodedIoC >= 0.0343 && row.decodedIoC < 0.0348);
    assert.ok(counts[18] < 510);
    report.push(row);
    console.log(JSON.stringify(row));
  }
}

// The six source-pinned complete inverses all remain within ~0.001 of
// the uniform GP29 IoC 1/29 = 0.03448275, far below the clear p57 0.06271.
// This is not a claim that any unknown page is English. It rejects the
// exact no-key base28 cumulative stream as a native-GP plaintext decoder.
console.log(JSON.stringify({
  decision:'NEGATIVE: literal phi29/base28 positive-step and skip-visible-zero cipher',
  models:report.length,
  source:'resources/liber-primus/lp2-corpus.json',
  originalUnknownRunes:12956,
  nullCount:86,
  nativeSolvedControlIoC:ioc(clearP57),
  uniformIoC:1/29,
  note:'No recovered plaintext, secret key, or source-authenticated null opcode'
}));
console.log('PASS: all six original book/chapter/page × sign inverses and positive plant.');
