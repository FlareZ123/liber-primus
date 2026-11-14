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
assert.deepEqual(contradiction.before, [28]);
assert.equal(firstChapter[17], 0);
assert.equal(fixedKey[17 % 13], 0); // This F must be literal, not key-consuming.
assert.equal(firstChapter[42], 27);
assert.equal(fixedKey[28 % 13], 27); // Would decode to F, but C is IA.

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

process.stdout.write(JSON.stringify({
  source: 'Original physical LP2 p0-p2, 2014 ENLIGHTENMENT crib, authentic p56/p57 controls',
  hypothesis: 'period-13 GP29 Vigenere with plaintext-F literal/bypass',
  candidateHeading: 'ENLIGHTENMENT',
  impliedKey: fixedKey,
  originalRunes: 729,
  originalFirstImpossiblePositionZeroBased: contradiction.firstFailure,
  originalPrefixStateBeforeFailure: contradiction.before,
  failedCipherRune: original.translit[firstChapter[42]],
  offendingKeyRune: original.translit[p0Shift(28)],
  attemptedPlaintextRune: 'F (forbidden when ciphertext is not F)',
  originalAnyValidPathPast42: contradiction.passed,
  controls: {
    solvedP56: '85/85 strict forward replay; valid F clock through all 85',
    p0ShapePlant: '729/729 strict forward replay; full key-clock valid'
  },
  claimLimit: 'Excludes only this derived 13-key GP29 F-transparent model. No unknown plaintext recovered.'
}, null, 2) + '\n');
