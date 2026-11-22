"use strict";
/**
 * Original LP2 sentencewise BASE29 -> GP30 SPACE transcode.
 * Specific 2013 BASE29 source hypothesis, using only manuscript punctuation.
 *
 * The source's original '-' word markers and 32 page carries are an exactly
 * preserved sidecar. Digit 29 in the 30-symbol output alphabet means SPACE.
 * This is an experimental decoder, not an authenticated Cicada cipher.
 *
 * Reproduce on Windows 11: Node.js 22, CommonJS, no external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = f => fs.readFileSync(path.join(root, f), "utf8");
const master = read("resources/liber-primus/lp2-transcription.txt");
const pages = master.split("%").slice(0, 55); // p50 has no rune transcription
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const alphabet = corpus.runes;
const gpIndex = new Map(alphabet.map((rune, index) => [rune, index]));
const getRunes = text => text.match(/[\u16A0-\u16FF]/gu) || [];
const original = pages.join("%");
const sourceTape = original.replace(/\/\r?\n/g, "").replace(/[%$&\s]/g, "");
const scopes = sourceTape.split(".").map(text =>
  getRunes(text).map(rune => gpIndex.get(rune))).filter(word => word.length);
assert.equal(scopes.length, 175);
const flatSource = scopes.flat();
assert.equal(flatSource.length, 12956);
assert.equal(pages.reduce((n, text) => n + getRunes(text).length, 0), 12956);

/** @param {number[]} digits @param {bigint} radix */
function valueOf(digits, radix) {
  let value = 0n;
  for (const digit of digits) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && BigInt(digit) < radix);
    value = value * radix + BigInt(digit);
  }
  return value;
}
/** @param {bigint} value @param {bigint} radix @param {number} width */
function digitsOf(value, radix, width) {
  const out = new Array(width);
  for (let i = width - 1; i >= 0; i--) {
    out[i] = Number(value % radix);
    value /= radix;
  }
  assert.equal(value, 0n);
  return out;
}
/** @param {number[]} originalGP @param {boolean} reverse */
function decode(originalGP, reverse) {
  const order = reverse ? [...originalGP].reverse() : [...originalGP];
  const value = valueOf(order, 29n);
  const gp30 = digitsOf(value, 30n, order.length);
  const back = digitsOf(valueOf(gp30, 30n), 29n, order.length);
  assert.deepEqual(back, order);
  return gp30;
}
const planted = [0, 0, 18, 29, 24, 5, 29, 23];
const encoded = digitsOf(valueOf(planted, 30n), 29n, planted.length);
assert.deepEqual(decode(encoded, false), planted);

const native = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const p57 = native.sections.find(section => section.name === "p57_parable");
assert.ok(p57);
const sourceNative = getRunes(p57.source_text).map(rune => gpIndex.get(rune));
assert.equal(sourceNative.length, 95);
for (const reverse of [false, true]) {
  const transformed = decode(sourceNative, reverse);
  const roundtrip = digitsOf(valueOf(transformed, 30n), 29n, 95);
  assert.deepEqual(roundtrip, reverse ? [...sourceNative].reverse() : sourceNative);
}

const positions = pages.map(text => getRunes(text).length);
const interval = (start, end) => [
  positions.slice(0, start).reduce((a, b) => a + b, 0),
  positions.slice(0, end).reduce((a, b) => a + b, 0)
];
const train = interval(16, 22);
const held = interval(40, 53); // p40..p53, including p50 rune-free
assert.equal(train[1] - train[0], 1613);
assert.equal(held[1] - held[0], 3008);

function assess(reverse) {
  const output = [], counts = Array(30).fill(0);
  let allSecretScopeMax = 0;
  let leadingZeroTotal = 0;
  let maxLeadingZero = 0;
  for (const word of scopes) {
    const result = decode(word, reverse);
    const inScope = Array(30).fill(0);
    for (const digit of result) {
      counts[digit]++;
      inScope[digit]++;
      output.push(digit);
    }
    allSecretScopeMax += Math.max(...inScope);
    let zeroes = 0;
    while (zeroes < result.length && result[zeroes] === 0) zeroes++;
    leadingZeroTotal += zeroes;
    maxLeadingZero = Math.max(maxLeadingZero, zeroes);
  }
  assert.equal(output.length, 12956);
  const getSpace = range => output.slice(range[0], range[1])
    .reduce((a, x) => a + Number(x === 29), 0);
  const stats = {
    sign: reverse ? "reverse original source rune order per scope" : "printed order",
    originalRunes: output.length,
    scopes: scopes.length,
    decodedSpacePositions: counts[29],
    decodedSpaceFraction: counts[29] / output.length,
    maxAnyGlobalAlphabetSymbol: Math.max(...counts),
    allSecretPerScopeSpaceMaximum: allSecretScopeMax,
    allSecretPerScopeMaxFraction: allSecretScopeMax / output.length,
    totalLeadingZeroDigits: leadingZeroTotal,
    maximalLeadingZeroRun: maxLeadingZero,
    dev: { runes: train[1] - train[0], spaces: getSpace(train) },
    holdout: { runes: held[1] - held[0], spaces: getSpace(held) }
  };
  return stats;
}
const first = assess(false);
const reverse = assess(true);
assert.equal(first.decodedSpacePositions, 388);
assert.equal(reverse.decodedSpacePositions, 441);
assert.equal(first.allSecretPerScopeSpaceMaximum, 1019);
assert.equal(reverse.allSecretPerScopeSpaceMaximum, 1025);
assert.ok(first.allSecretPerScopeMaxFraction < 0.08);
assert.ok(reverse.allSecretPerScopeMaxFraction < 0.08);
const p57SpaceFraction = 19 / (95 + 19);
assert.ok(first.allSecretPerScopeMaxFraction < p57SpaceFraction);
assert.ok(reverse.allSecretPerScopeMaxFraction < p57SpaceFraction);
console.log(JSON.stringify({
  source: "unchanged LP2 p0..p55 rune tape and 175 literal period scopes",
  competingModel: "full-width BASE29 to GP30 numeral conversion, 29=SPACE",
  nativeP57SpaceFraction: p57SpaceFraction,
  printed: first,
  reverse
}, null, 2));
console.log("PASS: original GP29 full inverse, planted SPACEs, solved native source controls, heldout and 175-secret-symbol capacity.");
