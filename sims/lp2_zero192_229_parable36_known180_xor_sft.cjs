"use strict";

/**
 * Original LP2 zero-bracket/PARABLE known-plaintext XOR inverse.
 * Run as a read-only Windows Node.js 22 single-file test from repository root.
 * All original data are loaded from the canonical immutable-source resources.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} relative */
function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
}
const gp = readJson("resources/liber-primus/lp2-corpus.json");
const tableSource = readJson("resources/liber-primus/lp2-grid-256.json");
const table = tableSource.bytes;
const pages = new Map(gp.pages.map(p => [p.page, p.indices]));
const p55 = pages.get(55);
const c56 = pages.get(56);
const p57 = pages.get(57);
assert.deepEqual([p55.length, c56.length, p57.length], [76, 85, 95]);
assert.equal(table.length, 256);
assert.deepEqual(table.flatMap((v, i) => v === 0 ? [i] : []), [192, 229]);
// The source's original zero-based numeric-table image is LP2 page 50.jpg.
// The 50th ordinary prime independently indexes the second zero cell.
let ordinal = 0, prime50 = 0;
for (let n = 2; ordinal < 50; n++) {
  let prime = true;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) prime = false;
  if (prime) { ordinal++; prime50 = n; }
}
assert.equal(prime50, 229);
assert.equal(table[prime50], 0);

// Another concrete original-key consumer: use prime(physical page50)=229 as
// the first totient-key prime for p55, with p56's verified F-transparent rule.
// Before p55's first printed F at local15, this decoder has no skip choice.
const primeSequence = [];
for (let n = 2; primeSequence.length < 150; n++) {
  let good = true;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) good = false;
  if (good) primeSequence.push(n);
}
const forcedPrefix = p55.slice(0, 10).map((c, i) =>
  ((c - (primeSequence[49 + i] - 1)) % 29 + 29) % 29);
assert.equal(p55.slice(0, 10).includes(0), false);
assert.equal(primeSequence[58], 277);
assert.equal(p55[9], 15); // ciphertext S, distinct from printed F
assert.equal(forcedPrefix[9], 0); // would require encrypted F


/** @param {number[]} a */
const sum = a => a.reduce((acc, v) => acc + v, 0);
/** @param {number[]} a */
const xor = a => a.reduce((acc, v) => acc ^ v, 0);
/** @param {number} n */
const mod29 = n => ((n % 29) + 29) % 29;
/** @param {number} i */
const phase = i => ((i - 193) % 36 + 36) % 36;
/** @param {number} n */
function isPrime(n) {
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return n >= 2;
}

/** Recreate authentic solved-page prime-totient, plaintext-F-transparent inverse. */
function solvedPage56() {
  const prime = [];
  for (let n = 2; prime.length < c56.length; n++) if (isPrime(n)) prime.push(n);
  let k = 0;
  return c56.map((v, i) => i === 56 ? 0 : mod29(v - (prime[k++] - 1)));
}
const plain56 = solvedPage56();
assert.deepEqual(plain56.slice(0, 5), [24, 9, 18, 9, 23]);

const heading = p57.slice(0, 7).map(v => gp.prime[v]);
const body = p57.slice(7).map(v => gp.prime[v]);
const headingSum = sum(heading), bodySum = sum(body);
assert.deepEqual([headingSum, bodySum, headingSum + bodySum], [449, 3519, 3968]);
assert.equal((headingSum + bodySum) / 31, 128);
assert.deepEqual([headingSum % 256, bodySum % 256], [193, 191]);
assert.equal(table[192], 0);
assert.deepEqual([table[191], table[193], table[228], table[230]], [33, 155, 144, 117]);
assert.equal(table[191] ^ table[193], 186);
assert.equal(sum(p57.slice(39, 43).map(v => gp.prime[v])), 186); // "MUST"
assert.equal(table[228] ^ table[230], 229);

const enclosed = table.slice(193, 229);
const clearSpan = p57.slice(32, 68);
assert.equal(enclosed.length, 36);
assert.equal(clearSpan.length, 36);
assert.equal(xor(enclosed), 95);
assert.equal(gp.translit[p57[31]], "U"); // SURFACE, before the enclosed span
assert.equal(gp.translit[p57[68]], "I"); // FIND, after the enclosed span
assert.equal(clearSpan.map(v => gp.translit[v]).join(""),
  "RFACEWEMUSTSHEDOUROWNCIRCUMFERENCESF");

const known = plain56.concat(p57);
assert.equal(known.length, 180);

/**
 * Recover a 36-byte candidate XOR pad from the fully known p57 interval.
 * Exactly 144 other actual known runes are reserved for evaluation.
 * @param {"index"|"prime"} encoding
 * @param {number[]} ciphertext
 * @param {number[]} reference
 */
function invert(encoding, ciphertext, reference) {
  /** @param {number} v */
  const encode = v => encoding === "index" ? v : gp.prime[v];
  const pad = Array.from({length: 36},
    (_, j) => ciphertext[193 + j] ^ encode(reference[193 + j]));
  const decoded = ciphertext.map((v, i) => v ^ pad[phase(i)]);
  const legalSet = new Set(encoding === "index" ?
    gp.runes.map((_, i) => i) : gp.prime);
  const knownHoldout = [];
  for (let i = 76; i < 256; i++) {
    if (i >= 193 && i < 229) continue;
    knownHoldout.push(i);
  }
  assert.equal(knownHoldout.length, 144);
  const first76 = decoded.slice(0, 76);
  return {
    pad,
    decoded,
    exact: knownHoldout.filter(i => decoded[i] === encode(reference[i])).length,
    validKnown: knownHoldout.filter(i => legalSet.has(decoded[i])).length,
    validFirst76: first76.filter(v => legalSet.has(v)).length,
    trained: Array.from({length: 36}, (_, j) => 193 + j)
      .every(i => decoded[i] === encode(reference[i]))
  };
}
const reference = p55.concat(known);
assert.equal(reference.length, 256);
const actual = {};
for (const encoding of ["index", "prime"]) {
  const result = invert(encoding, table, reference);
  actual[encoding] = {
    known_training: 36,
    heldout: 144,
    exact: result.exact,
    validKnown: result.validKnown,
    validFirst76: result.validFirst76,
    padXor: xor(result.pad)
  };
  assert.equal(result.trained, true);
  assert.equal(result.exact, 1);
  assert.deepEqual([result.validKnown, result.validFirst76],
    encoding === "index" ? [11, 9] : [14, 6]);

  // Independent solved-source terminal plant, with unknown p55 replaced by
  // a length76 excerpt of already clear p57. Its true secret is withheld.
  const plantPlain = p57.slice(0, 76).concat(known);
  const encode = v => encoding === "index" ? v : gp.prime[v];
  const secret = Array.from({length: 36},
    (_, i) => (13 + 37 * i + i * i) % 256);
  const plantTable = plantPlain.map((v, i) => encode(v) ^ secret[phase(i)]);
  const planted = invert(encoding, plantTable, plantPlain);
  assert.equal(planted.exact, 144);
  assert.equal(planted.validKnown, 144);
  assert.equal(planted.validFirst76, 76);
  assert.deepEqual(planted.pad, secret);
  assert.deepEqual(planted.decoded, plantPlain.map(encode));
}
assert.deepEqual([xor(clearSpan), xor(enclosed)], [19, 95]);
assert.equal(xor(enclosed) ^ xor(clearSpan), p55.length);

/** Original zero-including 38 base60 tokens yield exactly 76 printed characters. */
const printedTokens = tableSource.pages.flatMap(p => p.tokens).slice(192, 230);
assert.equal(printedTokens.length, 38);
assert.equal(printedTokens[0], "00");
assert.equal(printedTokens[37], "00");
const digitKey = Array.from(printedTokens.join(""),
  letter => tableSource.alphabet.indexOf(letter) % 29);
/** Alternative no-secret change of base60 byte to a two-GP29-digit key. */
const pair29Key = table.slice(192, 230)
  .flatMap(value => [Math.floor(value / 29), value % 29]);
assert.equal(digitKey.length, p55.length);
assert.equal(pair29Key.length, p55.length);
assert.deepEqual(digitKey.slice(0, 2), [0, 0]);
assert.deepEqual(pair29Key.slice(-2), [0, 0]);
const plainControl = p57.slice(0, 76);
/** @param {number[]} a */
function ioc(a) {
  const f = Array(29).fill(0);
  for (const v of a) f[v]++;
  return sum(f.map(v => v * (v - 1))) / (a.length * (a.length - 1));
}
const direct76 = [];
for (const [encoding, source] of [["printedBase60Digits", digitKey],
  ["base29BytePair", pair29Key]]) {
  for (const reversed of [false, true]) for (const sign of [-1, 1]) {
    const key = reversed ? source.slice().reverse() : source;
    const decoded = p55.map((c, i) => mod29(c + sign * key[i]));
    const plantedCipher = plainControl.map((v, i) => mod29(v - sign * key[i]));
    const recovered = plantedCipher.map((v, i) => mod29(v + sign * key[i]));
    assert.deepEqual(recovered, plainControl);
    direct76.push({encoding, reversed, sign, ioc: ioc(decoded),
      readableHead: decoded.slice(0, 20).map(x => gp.translit[x]).join("")});
  }
}
assert.equal(direct76.length, 8);
const strongest76 = Math.max(...direct76.map(x => x.ioc));
assert.equal(strongest76, 0.03824561403508772);
assert.ok(strongest76 < ioc(plainControl));
assert.deepEqual(p55.slice(0, 2), [21, 25]);
assert.deepEqual(p55.slice(-2), [18, 10]);

// The unique original zero on the full 32x8 table's 76-cell outer border
// provides an independently selected starting cell for a perimeter key.
// Unlike corner-anchored perimeter tests, its clock begins at cell 192.
const border = [];
for (let c = 0; c < 8; c++) border.push(c);
for (let row = 1; row < 32; row++) border.push(8 * row + 7);
for (let c = 6; c >= 0; c--) border.push(8 * 31 + c);
for (let row = 30; row >= 1; row--) border.push(8 * row);
assert.equal(border.length, 76);
assert.deepEqual(border.filter(i => table[i] === 0), [192]);
const borderOffset = border.indexOf(192);
const seededClockwise = border.slice(borderOffset).concat(border.slice(0, borderOffset));
const seededCounterclockwise = [seededClockwise[0], ...seededClockwise.slice(1).reverse()];
assert.equal(seededClockwise[0], 192);
assert.equal(seededCounterclockwise[0], 192);
const originalRim76 = [];
for (const [order, ids] of [["clockwise", seededClockwise],
  ["counterclockwise", seededCounterclockwise]]) {
  const key = ids.map(i => table[i] % 29);
  for (const sign of [-1, 1]) {
    const deciphered = p55.map((v, i) => mod29(v + sign * key[i]));
    const plantEncrypted = plainControl.map((v, i) => mod29(v - sign * key[i]));
    const planted = plantEncrypted.map((v, i) => mod29(v + sign * key[i]));
    assert.deepEqual(planted, plainControl);
    originalRim76.push({order, sign, ioc: ioc(deciphered),
      first20: deciphered.slice(0, 20).map(v => gp.translit[v]).join("")});
  }
}
assert.equal(originalRim76.length, 4);
assert.equal(Math.max(...originalRim76.map(x => x.ioc)), 0.0431578947368421);
assert.ok(originalRim76.every(x => x.ioc < ioc(plainControl)));

const sourceRimWheel76 = [];
for (const [order, ids] of [["clockwise", seededClockwise],
  ["counterclockwise", seededCounterclockwise]]) {
  const key = ids.map(i => table[i] % 28);
  for (const sign of [-1, 1]) {
    const decoded = rank28Inverse(key.slice(), sign, p55);
    const plant = rank28Forward(key.slice(), sign, plainControl);
    const recovered = rank28Inverse(key.slice(), sign, plant);
    assert.deepEqual(recovered, plainControl);
    sourceRimWheel76.push({order, sign, ioc: ioc(decoded)});
  }
}
assert.equal(sourceRimWheel76.length, 4);
assert.equal(Math.max(...sourceRimWheel76.map(x => x.ioc)), 0.03543859649122807);

// The second original table zero is the unique zero on concentric ring 2,
// whose 60 cells pair with p56 final17 and p57 initial43 known rune positions.
const middleRing = [];
for (let c = 2; c <= 5; c++) middleRing.push(2 * 8 + c);
for (let row = 3; row <= 29; row++) middleRing.push(row * 8 + 5);
for (let c = 4; c >= 2; c--) middleRing.push(29 * 8 + c);
for (let row = 28; row >= 3; row--) middleRing.push(row * 8 + 2);
assert.equal(middleRing.length, 60);
assert.deepEqual(middleRing.filter(i => table[i] === 0), [229]);
const middleOrigin = middleRing.indexOf(229);
const midClockwise = middleRing.slice(middleOrigin)
  .concat(middleRing.slice(0, middleOrigin));
const midCounterclockwise = [midClockwise[0], ...midClockwise.slice(1).reverse()];
const known60Printed = c56.slice(68).concat(p57.slice(0, 43));
const known60Clear = plain56.slice(68).concat(p57.slice(0, 43));
assert.deepEqual([known60Printed.length, known60Clear.length], [60, 60]);
const midKnown = [];
for (const [order, ids] of [["clockwise", midClockwise],
  ["counterclockwise", midCounterclockwise]]) {
  const direct = ids.map(i => table[i] % 29);
  const directMatches = direct.filter((v, i) => v === known60Clear[i]).length;
  for (const sign of [-1, 1]) {
    const decoded = known60Printed.map((v, i) => mod29(v + sign * direct[i]));
    midKnown.push({order, sign, directMatches,
      exactClear: decoded.filter((v, i) => v === known60Clear[i]).length,
      nonzeroP57Pad: direct.slice(17).filter(v => v !== 0).length});
  }
}
assert.deepEqual(midKnown.map(x => x.exactClear), [3, 2, 3, 0]);
assert.deepEqual(midKnown.map(x => x.directMatches), [3, 3, 1, 1]);
assert.deepEqual(midKnown.map(x => x.nonzeroP57Pad), [42, 42, 43, 43]);




// Source-motivated alternative decoder for the ciphertext's strong doublet
// depletion. F (index0) is represented by a repeated ciphertext rune, and
// 1..28 by the 28 nonrepeat steps. This preserves 29-symbol invertibility.
/** @param {number} x */
function mod28(x) { return ((x % 28) + 28) % 28; }
/** @param {number[]} key @param {number} sign @param {number[]} cipher */
function rank28Inverse(key, sign, cipher) {
  let prev = pages.get(54).at(-1);
  return cipher.map(c => {
    const step = mod29(c - prev);
    prev = c;
    return step === 0 ? 0 : 1 + mod28(step - 1 + sign * key.shift());
  });
}
/** @param {number[]} key @param {number} sign @param {number[]} plaintext */
function rank28Forward(key, sign, plaintext) {
  let prev = pages.get(54).at(-1);
  return plaintext.map(p => {
    const step = p === 0 ? 0 : 1 + mod28(p - 1 - sign * key.shift());
    prev = mod29(prev + step);
    return prev;
  });
}
const wheel76 = [];
for (const [encoding, source] of [["printedBase60Digits", digitKey],
  ["base29BytePair", pair29Key]]) {
  for (const reversed of [false, true]) for (const sign of [-1, 1]) {
    const key = (reversed ? source.slice().reverse() : source)
      .map(v => v % 28);
    const decoded = rank28Inverse(key.slice(), sign, p55);
    const plantedCipher = rank28Forward(key.slice(), sign, plainControl);
    const reconstructed = rank28Inverse(key.slice(), sign, plantedCipher);
    assert.deepEqual(reconstructed, plainControl);
    wheel76.push({encoding, reversed, sign, ioc: ioc(decoded),
      first20: decoded.slice(0, 20).map(x => gp.translit[x]).join("")});
  }
}
assert.equal(wheel76.length, 8);
assert.equal(Math.max(...wheel76.map(x => x.ioc)), 0.04035087719298246);


console.log(JSON.stringify({
  status: "PASS", source: "original LP2 table and terminal source pages",
  zeroCells: [192, 229], primeOfTablePage50: prime50,
  seededTotientP55: {firstPrime: 229, impossibleAtLocalRune: 9,
    forbiddenCipherSForPlainF: true},
  clearAddressPair: [193, 191],
  gapBytes: 36, gapByteXor: 95, parableRunes: p57.length,
  neighboringByteXors: [186, 229],
  clear36GpOrdinalXor: 19, masked36GpOrdinalXor: 76,
  directPeriodicXorGate: actual,
  closedZeroBracket: {tokens: 38, printedDigits: digitKey.length,
    terminalP55Runes: p55.length, directAdditiveMaxIoc: strongest76,
    knownP57First76Ioc: ioc(plainControl), direct76,
    sourceZero192AnchoredRim76: originalRim76,
    sourceZero192AnchoredRimGp28: sourceRimWheel76,
    zero229Middle60Known: midKnown,
    nonrepeatGp28Wheel: wheel76},
  control: "Both 256/256 original-sized planted terminals recovered"
}, null, 2));
