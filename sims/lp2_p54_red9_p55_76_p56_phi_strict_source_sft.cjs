'use strict';

/**
 * One-file original-source gate: p54's nine-runic red title joined to the
 * 76 physical p55 ciphertext runes, against the *authentic* p56 85-rune
 * prime-totient cipher with nonconsuming plaintext F.
 *
 * This is a deliberately noncontiguous candidate input; no source says to
 * omit the 223 intervening p54 body runes. Do not treat a positive synthetic
 * replay as evidence that the candidate is a historical encryption.
 * Run on Windows 11 with Node.js 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const ink = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8'
));
/** @param {number} n @returns {number[]} */
const page = n => corpus.pages.find(p => p.page === n).indices;
/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  /** @type {number[]} */
  const out = [];
  for (let v = 2; out.length < n; v++) {
    let prime = true;
    for (let d = 2; d * d <= v; d++) {
      if (v % d === 0) { prime = false; break; }
    }
    if (prime) out.push(v);
  }
  return out;
}
const primes = firstPrimes(120);
/** @param {number} n @returns {number} */
const mod29 = n => (n % 29 + 29) % 29;
const p54 = page(54);
const p55 = page(55);
const p56 = page(56);
const p57 = page(57);
assert.deepEqual([p54.length, p55.length, p56.length, p57.length],
  [232, 76, 85, 95]);
const originalRed = ink.pages.find(p => p.page === 54).red_spans;
assert.deepEqual(originalRed.map(({start, length}) => ({start, length})),
  [{start: 0, length: 9}]);
const candidate = p54.slice(0, 9).concat(p55);
assert.equal(candidate.length, p56.length);
assert.deepEqual(candidate.slice(0, 9), [24, 19, 21, 23, 27, 2, 14, 10, 19]);
const cipherFOffsets = candidate.flatMap((r, i) => r === 0 ? [i] : []);
assert.deepEqual(cipherFOffsets, [24, 34, 50]);

/** @param {number[]} plain @returns {number[]} */
function forward(plain) {
  let clock = 0;
  return plain.map(x => x === 0 ? 0 : mod29(x + primes[clock++] - 1));
}

/**
 * The p56 authentic inverse branches at ciphertext F. A literal-F branch
 * transmits F and does not consume a prime; an encrypted branch must yield
 * a plaintext rune different from F.
 * @param {number[]} cipher
 * @param {number} mask
 * @returns {{plaintext:number[], failure:null | {at:number,prime:number,rune:number}}}
 */
function inverse(cipher, mask) {
  const fPositions = cipher.flatMap((r, i) => r === 0 ? [i] : []);
  let clock = 0;
  /** @type {number[]} */
  const plaintext = [];
  for (let i = 0; i < cipher.length; i++) {
    const bit = fPositions.indexOf(i);
    if (bit >= 0 && (mask & (1 << bit))) {
      plaintext.push(0);
      continue;
    }
    const p = primes[clock++];
    const decoded = mod29(cipher[i] - (p - 1));
    if (decoded === 0) {
      return {plaintext, failure: {at: i, prime: p, rune: cipher[i]}};
    }
    plaintext.push(decoded);
  }
  return {plaintext, failure: null};
}
/** @param {number[]} plaintext @param {number[]} ciphertext */
function plaintextFMask(plaintext, ciphertext) {
  const fPositions = ciphertext.flatMap((r, i) => r === 0 ? [i] : []);
  return fPositions.reduce((mask, i, b) =>
    mask | (plaintext[i] === 0 ? 1 << b : 0), 0);
}
/** @param {string} text @returns {number[]} */
function encodeGp(text) {
  const alphabet = corpus.translit.map((token, index) => ({token, index}))
    .sort((a, b) => b.token.length - a.token.length);
  /** @type {number[]} */
  const out = [];
  for (const word of text.split(' ')) {
    for (let at = 0; at < word.length;) {
      const match = alphabet.find(item => word.startsWith(item.token, at));
      assert.ok(match, 'Invalid GP spelling in solved source: ' + word.slice(at));
      out.push(match.index);
      at += match.token.length;
    }
  }
  return out;
}

const solved56 = encodeGp(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO ' +
  'IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
);
assert.equal(solved56.length, 85);
assert.deepEqual(forward(solved56), p56, 'authentic p56 full-source positive');
assert.deepEqual(p56.flatMap((r, i) => r === 0 ? [i] : []),
  [35, 47, 51, 56, 74]);
const positive56 = inverse(p56, plaintextFMask(solved56, p56));
assert.equal(positive56.failure, null);
assert.deepEqual(positive56.plaintext, solved56);

/** The independent p57 clear rune stream is a second genuine native-GP plant. */
const plantedPlain = p57.slice(0, 85);
const plantedCipher = forward(plantedPlain);
const planted = inverse(plantedCipher, plaintextFMask(plantedPlain, plantedCipher));
assert.equal(planted.failure, null);
assert.deepEqual(planted.plaintext, plantedPlain);
assert.deepEqual(forward(planted.plaintext), plantedCipher);

/** All eight original-cipher candidate masks must have the same early failure. */
const checked = [];
for (let mask = 0; mask < 1 << cipherFOffsets.length; mask++) {
  const decoded = inverse(candidate, mask);
  assert.deepEqual(decoded.failure,
    {at: 19, prime: 71, rune: 12});
  checked.push({mask, failureOffset: decoded.failure.at});
}
assert.equal(candidate[19], p55[10]);
assert.equal(corpus.translit[candidate[19]], 'EO');
assert.equal(mod29(71 - 1), candidate[19]);

console.log(JSON.stringify({
  source: 'original p54 red9 + physically separate p55 76, exactly p56 85 runes',
  sourceSplit: {p54Red9: 9, interveningP54BodyExcluded: 223, p55: 76},
  candidateCipherFOffsets: cipherFOffsets,
  originalMasks: checked.length,
  firstImpossibleCompositeOffset: 19,
  originalPhysicalLocation: 'p55 local10, EO, GP index12',
  authenticPrimeAtFailure: 71,
  forcedForbiddenPlaintext: 'F (GP index0) from non-F ciphertext',
  genuineP56PositiveRecovered: solved56.length,
  independentP57PlantRecovered: plantedPlain.length,
  decision: 'No legal inverse in this exact historical p56 cipher family; no unknown plaintext.'
}, null, 2));
