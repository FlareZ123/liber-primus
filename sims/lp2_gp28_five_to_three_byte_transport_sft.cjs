'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const LIMIT = 256 ** 3;
const RADIX = 28;
const UNIT = 5;

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * A reversible GP28 step register preserving every original repeated step.
 * The zero steps are retained as a mask, and only nonzero steps are digits.
 * @param {number[]} ciphertext
 * @param {number} sign
 * @returns {{digits:number[],zeroMask:boolean[],first:number}}
 */
function nonzeroSteps(ciphertext, sign) {
  const digits = [];
  const zeroMask = [];
  for (let i = 1; i < ciphertext.length; i++) {
    const step = mod29(sign * (ciphertext[i] - ciphertext[i - 1]));
    zeroMask.push(step === 0);
    if (step) digits.push(step - 1);
  }
  return {digits, zeroMask, first: ciphertext[0]};
}

/**
 * Exact reconstruction from digits plus the original transparent-zero mask.
 * @param {{digits:number[],zeroMask:boolean[],first:number}} input
 * @param {number} sign
 * @returns {number[]}
 */
function reconstruct(input, sign) {
  const output = [input.first];
  let j = 0;
  for (const skip of input.zeroMask) {
    const step = skip ? 0 : 1 + input.digits[j++];
    output.push(mod29(output.at(-1) + sign * step));
  }
  assert.equal(j, input.digits.length);
  return output;
}

/**
 * Strict 5 base28 digits -> exactly 3 bytes. Any value >=2^24 is
 * invalid in this fixed-width codec, regardless of its byte order.
 * @param {number[]} digits
 * @param {number} phase
 * @param {boolean} reversed
 * @returns {{blocks:number,invalid:number,firstOverflow:{block:number,value:number}|null}}
 */
function scanBlocks(digits, phase, reversed) {
  let blocks = 0;
  let invalid = 0;
  let firstOverflow = null;
  for (let i = phase; i + UNIT <= digits.length; i += UNIT) {
    let value = 0;
    for (let j = 0; j < UNIT; j++) {
      value = RADIX * value + digits[i + (reversed ? UNIT - 1 - j : j)];
    }
    assert.ok(value >= 0 && value < RADIX ** UNIT);
    if (value >= LIMIT) {
      invalid++;
      if (!firstOverflow) firstOverflow = {block: blocks, value};
    }
    blocks++;
  }
  return {blocks, invalid, firstOverflow};
}

/**
 * All source-motivated finite transport conventions: natural/reversed
 * GP29 difference, forward/reversed five-digit read, and five phases.
 * @param {number[]} cipher
 * @returns {{sign:number,reversed:boolean,phase:number,blocks:number,invalid:number,firstOverflow:object|null}[]}
 */
function allConventions(cipher) {
  const results = [];
  for (const sign of [1, -1]) {
    const steps = nonzeroSteps(cipher, sign);
    assert.deepEqual(reconstruct(steps, sign), cipher);
    for (const reversed of [false, true]) {
      for (let phase = 0; phase < UNIT; phase++) {
        results.push({sign, reversed, phase, ...scanBlocks(steps.digits, phase, reversed)});
      }
    }
  }
  return results;
}

/**
 * Canonical fixed-width three-byte-to-five-base28 codec. Never overflows.
 * @param {Uint8Array} bytes
 * @returns {number[]}
 */
function packBytes(bytes) {
  assert.equal(bytes.length % 3, 0);
  const digits = [];
  for (let i = 0; i < bytes.length; i += 3) {
    let number = (bytes[i] << 16) + (bytes[i + 1] << 8) + bytes[i + 2];
    const quintet = Array(UNIT).fill(0);
    for (let k = UNIT - 1; k >= 0; k--) {
      quintet[k] = number % RADIX;
      number = Math.floor(number / RADIX);
    }
    assert.equal(number, 0);
    digits.push(...quintet);
  }
  return digits;
}

/**
 * @param {number[]} digits
 * @returns {Uint8Array}
 */
function unpackBytes(digits) {
  assert.equal(digits.length % UNIT, 0);
  assert.equal(scanBlocks(digits, 0, false).invalid, 0);
  const bytes = [];
  for (let i = 0; i < digits.length; i += UNIT) {
    let number = 0;
    for (let j = 0; j < UNIT; j++) number = RADIX * number + digits[i + j];
    bytes.push((number >>> 16) & 255, (number >>> 8) & 255, number & 255);
  }
  return Uint8Array.from(bytes);
}

/** @param {number[]} digits @param {number} initialCipher @returns {number[]} */
function issueNonrepeatingCipher(digits, initialCipher) {
  const output = [initialCipher];
  for (const digit of digits) output.push(mod29(output.at(-1) + digit + 1));
  return output;
}

function main() {
  assert.equal(RADIX ** UNIT, 17210368);
  assert.equal(LIMIT, 16777216);
  assert.ok(RADIX ** UNIT > LIMIT);

  const source = transcript.split('%').slice(0, 55).join('%');
  const sections = source.split('$').map((part) =>
    Array.from(part).filter((rune) => runeIndex.has(rune))
      .map((rune) => runeIndex.get(rune))).filter((runes) => runes.length);
  assert.deepEqual(sections.map((runes) => runes.length),
    [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]);
  const original = sections.flat();
  assert.deepEqual(original, corpus.pages.filter((page) => page.page <= 55)
    .flatMap((page) => page.indices));
  assert.equal(original.length, 12956);

  const globalSteps = nonzeroSteps(original, 1);
  assert.equal(globalSteps.zeroMask.filter(Boolean).length, 86);
  assert.equal(globalSteps.digits.length, 12869);
  const global = allConventions(original);
  assert.equal(global.length, 20);
  assert.equal(Math.min(...global.map((row) => row.invalid)), 54);
  assert.equal(Math.max(...global.map((row) => row.invalid)), 79);
  assert.ok(global.every((row) => row.blocks === 2573 && row.invalid > 0));

  const local = sections.map((runes, section) => {
    const variants = allConventions(runes);
    const best = variants.slice().sort((a, b) => a.invalid - b.invalid)[0];
    return {section, runes: runes.length, best, anyValid: variants.some((v) => !v.invalid)};
  });
  assert.deepEqual(local.map((row) => row.best.invalid), [1, 2, 5, 4, 2, 3, 4, 8]);
  assert.ok(local.every((row) => !row.anyValid));

  // An authentic solved LP2 clear-page rune stream supplies a nontrivial
  // source-derived ASCII input. This is an independent engineering plant.
  const solved = corpus.pages[57].indices.map((i) => corpus.translit[i]).join('');
  const sourceBytes = Buffer.from(solved, 'ascii');
  const padded = Buffer.alloc(Math.ceil(sourceBytes.length / 3) * 3);
  sourceBytes.copy(padded);
  const digits = packBytes(padded);
  const encoded = issueNonrepeatingCipher(digits, corpus.pages[57].indices[0]);
  const extracted = nonzeroSteps(encoded, 1);
  assert.equal(extracted.zeroMask.filter(Boolean).length, 0);
  assert.deepEqual(extracted.digits, digits);
  const decoded = unpackBytes(extracted.digits);
  assert.deepEqual(Buffer.from(decoded.subarray(0, sourceBytes.length)), sourceBytes);
  assert.deepEqual(issueNonrepeatingCipher(extracted.digits, encoded[0]), encoded);

  console.log(JSON.stringify({
    status: 'PASS: original strict five-base28-digit to three-byte capacity gate',
    source: '12,956 unmodified original GP29 runes, eight true printed sections',
    globalNonzeroDigits: globalSteps.digits.length,
    originalRepeatedStepMarkers: 86,
    global,
    local,
    originalFullInverse: 'all 12,956 source runes exactly reconstructed with retained zero-step mask',
    sourceNativePlant: {textBytes: sourceBytes.length, packedBytes: padded.length,
      outputGP28Digits: digits.length, recoveredBytes: decoded.length, exact: true},
    conclusion: 'Every original direction, byte order and phase violates the canonical 3-byte-in-5-base28 capacity. No original byte payload or LP2 plaintext.'
  }, null, 2));
}

main();
