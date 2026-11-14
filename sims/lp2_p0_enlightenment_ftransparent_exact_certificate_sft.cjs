'use strict';

/**
 * Full-key, all-F-clock impossibility certificate for the source-crib hypothesis:
 * 2014 PGP-signed "Your enlightenment awaits you" => p0 red13
 * "ENLIGHTENMENT" => conventional period-13 GP29 additive cipher.
 *
 * The *authentic* Cicada convention copies PLAINTEXT F literally and does not
 * consume a key symbol. Ciphertext F may represent either a bypass or an
 * encrypted non-F rune. Explore every such branch exactly, without a lexicon.
 *
 * Source inputs: untouched original LP2 physical p0-p2, solved p56 and p57.
 * Run from repository root with Node.js 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const original = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const mod29 = (n) => ((n % 29) + 29) % 29;
const wordTokens = original.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);

/**
 * @param {string} word Source-supported GP29 Latin transliteration.
 * @returns {number[]}
 */
function encodeGp(word) {
  const values = [];
  for (let i = 0; i < word.length;) {
    const item = wordTokens.find(({ token }) => word.startsWith(token, i));
    assert.ok(item, 'Non-GP spelling at ' + i);
    values.push(item.index);
    i += item.token.length;
  }
  return values;
}

/**
 * Strict historical forward encoder. A plaintext F neither consumes key
 * nor becomes any other ciphertext symbol.
 * @param {number[]} plain
 * @param {(clock:number)=>number} shift
 * @returns {number[]}
 */
function encrypt(plain, shift) {
  let clock = 0;
  return plain.map((rune) =>
    rune === 0 ? 0 : mod29(rune + shift(clock++)));
}

/**
 * Exact set of all forward-valid plaintext-F key clocks. F-consuming
 * branches whose plaintext would equal zero are disallowed, as the
 * authenticated encoder always bypasses plaintext F.
 * @param {number[]} cipher
 * @param {(clock:number)=>number} shift
 * @param {number} startingPosition
 * @param {number} startingClock
 * @returns {{passed:boolean,firstFailure:number|null,before:number[],after:number[],lastValidPosition:number}}
 */
function allClockPaths(cipher, shift, startingPosition = 0, startingClock = 0) {
  let states = new Set([startingClock]);
  let before = [];
  for (let i = startingPosition; i < cipher.length; i++) {
    before = [...states].sort((a, b) => a - b);
    const next = new Set();
    for (const clock of states) {
      if (cipher[i] === 0) next.add(clock);
      if (mod29(cipher[i] - shift(clock)) !== 0) next.add(clock + 1);
    }
    if (next.size === 0) return {
      passed: false, firstFailure: i, before, after: [],
      lastValidPosition: i - 1
    };
    states = next;
  }
  return {
    passed: true, firstFailure: null, before,
    after: [...states].sort((a, b) => a - b),
    lastValidPosition: cipher.length - 1
  };
}

// Original p0 title is physically two printed red words of lengths 8 + 5.
const firstChapter = original.pages.slice(0, 3).flatMap((page) => page.indices);
assert.equal(firstChapter.length, 729);
assert.equal(original.pages[0].indices.length, 262);
const originalHeading = [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5];
assert.deepEqual(firstChapter.slice(0, 13), originalHeading);
const allegedHeadingPlain = encodeGp('ENLIGHTENMENT');
assert.equal(allegedHeadingPlain.length, 13);
assert.ok(!allegedHeadingPlain.includes(0), 'Source crib must have no F');
const fixedKey = allegedHeadingPlain.map((p, i) => mod29(firstChapter[i] - p));
assert.deepEqual(fixedKey, [26, 28, 27, 22, 0, 11, 11, 11, 6, 7, 0, 12, 18]);
const p0Shift = (clock) => fixedKey[clock % fixedKey.length];
assert.deepEqual(encrypt(allegedHeadingPlain, p0Shift), originalHeading);

// All paths forced by original source; no English scores, F-mask guesses,
// key phases, rerendered source material, or cipher-state tuning.
const contradiction = allClockPaths(firstChapter, p0Shift, 13, 13);
assert.equal(contradiction.passed, false);
assert.equal(contradiction.firstFailure, 42);
assert.deepEqual(contradiction.before, [41]);
assert.equal(firstChapter[17], 0);
assert.equal(fixedKey[17 % 13], 0); // This F must be literal, not key-consuming.
assert.equal(firstChapter[42], 27);
assert.equal(fixedKey[41 % 13], 27); // Would decode to F, but C is IA.


// Stronger independent 2016 signed word-shape candidate: original heading 8+5
// exactly matches "EPIPHANY SEEKS" when K is spelled C in GP29.
// This key is derived separately from the same immutable ciphertext red13.
const epiphanyPlain = encodeGp('EPIPHANYSEECS');
assert.equal(epiphanyPlain.length, 13);
const epiphanyKey = epiphanyPlain.map((p, i) => mod29(firstChapter[i] - p));
assert.deepEqual(epiphanyKey, [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19]);
const epiphanyShift = (clock) => epiphanyKey[clock % epiphanyKey.length];
assert.deepEqual(encrypt(epiphanyPlain, epiphanyShift), originalHeading);
const epiphanyContradiction = allClockPaths(firstChapter, epiphanyShift, 13, 13);
assert.equal(epiphanyContradiction.passed, false);
assert.equal(epiphanyContradiction.firstFailure, 57);
assert.deepEqual(epiphanyContradiction.before, [56]);
assert.equal(firstChapter[57], 27);
assert.equal(epiphanyShift(56), 27); // Non-F ciphertext would decode to bypass F.


// Complete the independently published 2016 red-caption word-shape family.
// Source-fixed exact positions are physical p15:r9, p33:r91, p40:r0.
// Their Latin phrases are from the same signed 2016 message; the original
// GP29 ciphertext and chapter edges are held constant.
/**
 * @param {number} startPage
 * @param {number} startRune
 * @param {number} lastPage
 * @param {string} candidateTitle
 * @returns {{plain:number[],cipher:number[],key:number[],firstFailure:number,clockBefore:number[],headerForbidden:number[]}}
 */
function testSigned2016Title(startPage, startRune, lastPage, candidateTitle) {
  const cipher = original.pages.slice(startPage, lastPage + 1)
    .flatMap((page) => page.indices).slice(startRune);
  const plain = encodeGp(candidateTitle);
  const printed = cipher.slice(0, plain.length);
  const headerForbidden = plain.flatMap((rune, i) =>
    rune === 0 && printed[i] !== 0 ? [i] : []);
  if (headerForbidden.length) return {
    plain, cipher, key: [], firstFailure: headerForbidden[0],
    clockBefore: [], headerForbidden
  };
  assert.ok(!plain.includes(0), 'Nonempty F header needs state-derived key slots');
  const key = plain.map((rune, i) => mod29(printed[i] - rune));
  const shift = (clock) => key[clock % key.length];
  assert.deepEqual(encrypt(plain, shift), printed);
  const result = allClockPaths(cipher, shift, plain.length, plain.length);
  assert.equal(result.passed, false);
  return { plain, cipher, key, firstFailure: result.firstFailure,
    clockBefore: result.before, headerForbidden };
}

const p15Found = testSigned2016Title(15, 9, 22, 'WILLBEFOUND');
assert.deepEqual(p15Found.headerForbidden, [6]);
assert.equal(p15Found.cipher[6], 17); // B, incompatible with plaintext F.
assert.equal(p15Found.plain[6], 0);
const p33Words = testSigned2016Title(33, 91, 39, 'ITSWORDS');
assert.deepEqual(p33Words.key, [11, 15, 26, 3, 26, 1, 28, 26]);
assert.equal(p33Words.cipher.length, 1589);
assert.equal(p33Words.firstFailure, 10);
assert.deepEqual(p33Words.clockBefore, [10]);
assert.equal(p33Words.cipher[10], 26); // Y; key[10 mod8] also 26.
const p40Words = testSigned2016Title(40, 0, 53, 'ITSWORDS');
assert.deepEqual(p40Words.key, [19, 22, 4, 19, 3, 19, 2, 22]);
assert.equal(p40Words.cipher.length, 3008);
assert.equal(p40Words.firstFailure, 33);
assert.deepEqual(p40Words.clockBefore, [33]);
assert.equal(p40Words.cipher[33], 22); // OE; key[33 mod8] also 22.
// Ordinary repeating GP29 Vigenere is a *different* historical consumer.
// Keep its independent native-English diagnostic on the same four signed
// heading locations; it does not obey the plaintext-F bypass convention.
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}
/**
 * @param {number[]} ciphertext
 * @param {number[]} titlePlain
 * @returns {number}
 */
function directPeriodBodyIoc(ciphertext, titlePlain) {
  const key = titlePlain.map((p, i) => mod29(ciphertext[i] - p));
  const decoded = ciphertext.map((c, i) => mod29(c - key[i % key.length]));
  assert.deepEqual(decoded.slice(0, titlePlain.length), titlePlain);
  return ioc(decoded.slice(titlePlain.length));
}
const directIoC = {
  enlightenment2014: directPeriodBodyIoc(firstChapter, allegedHeadingPlain),
  epiphany2016: directPeriodBodyIoc(firstChapter, epiphanyPlain),
  willBeFound2016: directPeriodBodyIoc(p15Found.cipher, p15Found.plain),
  itsWordsP33: directPeriodBodyIoc(p33Words.cipher, p33Words.plain),
  itsWordsP40: directPeriodBodyIoc(p40Words.cipher, p40Words.plain)
};
const expectedIoC = [
  0.03414462632339727, 0.03415243973903192,
  0.034371520337174215, 0.03456953218200306,
  0.034379682116260975
];
for (const [i, observed] of Object.values(directIoC).entries()) {
  assert.ok(Math.abs(observed - expectedIoC[i]) < 1e-12);
  assert.ok(observed < 0.04);
}
// Independent known-solved original p56 control: prime-totient running key,
// the exact F skip at local56 and all original ciphertext symbols.
function primeList(n) {
  const values = [];
  for (let p = 2; values.length < n; p++) {
    let isPrime = true;
    for (let d = 2; d * d <= p; d++) {
      if (p % d === 0) { isPrime = false; break; }
    }
    if (isPrime) values.push(p);
  }
  return values;
}
const p56Key = primeList(90).map((prime) => prime - 1);
const authenticP56 = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
  .split(' ').flatMap(encodeGp);
const originalP56 = original.pages[56].indices;
assert.equal(authenticP56.length, 85);
assert.equal(originalP56.length, 85);
assert.deepEqual(authenticP56.flatMap((rune, i) => rune === 0 ? [i] : []), [56]);
assert.deepEqual(encrypt(authenticP56, (clock) => p56Key[clock]), originalP56);
const solvedControl = allClockPaths(originalP56, (clock) => p56Key[clock]);
assert.equal(solvedControl.passed, true);
assert.ok(solvedControl.after.includes(84));

// Full 729-rune positive control with the alleged 13-rune title, identical
// additive key and authentic 95-rune p57 cleartext cycled through body.
const sourceNative = original.pages[57].indices;
assert.equal(sourceNative.length, 95);
const plantedPlain = allegedHeadingPlain.concat(
  Array.from({ length: 716 }, (_, i) => sourceNative[i % sourceNative.length])
);
assert.equal(plantedPlain.length, 729);
const plantedCipher = encrypt(plantedPlain, p0Shift);
const plantedControl = allClockPaths(plantedCipher, p0Shift, 13, 13);
const trueConsumed = plantedPlain.filter((rune) => rune !== 0).length;
assert.equal(plantedControl.passed, true);
assert.ok(plantedControl.after.includes(trueConsumed));


// Separate full-length native-positive plant for the 2016 signed title too.
const epiphanyPlantPlain = epiphanyPlain.concat(
  Array.from({ length: 716 }, (_, i) => sourceNative[i % sourceNative.length])
);
const epiphanyPlantCipher = encrypt(epiphanyPlantPlain, epiphanyShift);
const epiphanyPlantControl = allClockPaths(epiphanyPlantCipher, epiphanyShift, 13, 13);
assert.equal(epiphanyPlantControl.passed, true);
assert.ok(epiphanyPlantControl.after.includes(
  epiphanyPlantPlain.filter((rune) => rune !== 0).length
));


for (const trial of [p33Words, p40Words]) {
  const shift = (clock) => trial.key[clock % trial.key.length];
  const plain = trial.plain.concat(Array.from({
    length: trial.cipher.length - trial.plain.length
  }, (_, i) => sourceNative[i % sourceNative.length]));
  const cipher = encrypt(plain, shift);
  const check = allClockPaths(cipher, shift, trial.plain.length, trial.plain.length);
  assert.equal(check.passed, true);
  assert.ok(check.after.includes(plain.filter((rune) => rune !== 0).length));
}
process.stdout.write(JSON.stringify({
  source: 'Original physical LP2 p0-p2, 2014 ENLIGHTENMENT crib, authentic p56/p57 controls',
  hypothesis: 'period-13 GP29 Vigenere with plaintext-F literal/bypass',
  candidateHeading: 'ENLIGHTENMENT',
  impliedKey: fixedKey,
  originalRunes: 729,
  originalFirstImpossiblePositionZeroBased: contradiction.firstFailure,
  originalPrefixStateBeforeFailure: contradiction.before,
  failedCipherRune: original.translit[firstChapter[42]],
  offendingKeyRune: original.translit[p0Shift(41)],
  attemptedPlaintextRune: 'F (forbidden when ciphertext is not F)',
  originalAnyValidPathPast42: contradiction.passed,
  directPeriodBodyIoC: directIoC,
  epiphany2016SourceKey: epiphanyKey,
  epiphany2016FirstImpossiblePosition: epiphanyContradiction.firstFailure,
  epiphany2016KeyClockBeforeFailure: epiphanyContradiction.before,
  other2016Titles: {
    p15_WILL_BE_FOUND: { headerFIndex: p15Found.firstFailure, actualGlyph: original.translit[p15Found.cipher[6]] },
    p33_ITS_WORDS: { titleLocalRune: 91, failureLocalRune: 101, derivedKey: p33Words.key },
    p40_ITS_WORDS: { titleLocalRune: 0, failureLocalRune: 33, derivedKey: p40Words.key }
  },
  controls: {
    solvedP56: '85/85 strict forward replay; valid F clock through all 85',
    p0ShapePlant: '729/729 strict forward replay; full key-clock valid',
    p0EpiphanyShapePlant: '729/729 strict forward replay; full key-clock valid',
    p33andP40ShapePlants: '1589/1589 and 3008/3008 valid inverse clocks with authentic p57 native prose'
  },
  claimLimit: 'Excludes only this derived 13-key GP29 F-transparent model. No unknown plaintext recovered.'
}, null, 2) + '\n');
