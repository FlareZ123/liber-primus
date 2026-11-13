'use strict';

/**
 * Original-source SFT for the plaintext-F interrupter in authenticated LP2 p56.
 *
 * Node.js 22; run: node sims/lp2_p56_plaintext_fehu_ambiguity_sft.cjs
 * Reads the unchanged LP2 GP29 corpus and solved original LP1 transcription.
 * No secret fitting, score optimization, external packages or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const cipher = corpus.pages.find((page) => page.page === 56).indices;
const gp = corpus.translit;
const runeToIndex = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const literalF = new Set([56]);
const fAt = cipher.flatMap((c, i) => c === 0 ? [i] : []);
assert.equal(cipher.length, 85);
assert.deepEqual(fAt, [35, 47, 51, 56, 74]);

/** @param {number} x @returns {number} */
const mod29 = (x) => ((x % 29) + 29) % 29;

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  /** @type {number[]} */
  const result = [];
  for (let n = 2; result.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) result.push(n);
  }
  return result;
}
const totients = firstPrimes(90).map((prime) => prime - 1);

/**
 * Encode the authenticated edited reading of p56, in original GP inventory
 * spellings (EUERY, SEEC). The p56 words contain no ING/IO ambiguity.
 * @param {string} text
 * @returns {number[]}
 */
function encodeGP(text) {
  const tokens = gp.map((token, i) => ({ token, i }))
    .sort((a, b) => b.token.length - a.token.length);
  /** @type {number[]} */
  const out = [];
  for (const word of text.trim().split(/\s+/u)) {
    for (let i = 0; i < word.length;) {
      const found = tokens.find(({ token }) => word.startsWith(token, i));
      assert.ok(found, 'missing GP token: ' + word.slice(i));
      out.push(found.i);
      i += found.token.length;
    }
  }
  return out;
}
const words = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const plaintext = encodeGP(words);
assert.equal(plaintext.length, 85);
assert.deepEqual(plaintext.flatMap((p, i) => p === 0 ? [i] : []), [56]);

/**
 * Enforce historical plaintext-F transparency, including its non-consuming
 * key clock. Unlike generic GP arithmetic, a plaintext 0 cannot consume.
 * @param {number[]} message
 * @returns {number[]}
 */
function encrypt(message) {
  let key = 0;
  return message.map((p) => p === 0 ? 0 : mod29(p + totients[key++]));
}
assert.deepEqual(encrypt(plaintext), cipher);

/**
 * Branch over a ciphertext-F mask and reject any ordinary key-consuming
 * step that would decode to plaintext F. An accepted mask is a legitimate
 * preimage under the historical *plaintext*-F encryption function.
 * @param {number} mask
 * @returns {{mask:number,valid:boolean,plain:number[],consumed:number,invalidAt:number}}
 */
function tryMask(mask) {
  let key = 0;
  /** @type {number[]} */
  const plain = [];
  for (let i = 0; i < cipher.length; i++) {
    const fIndex = fAt.indexOf(i);
    if (fIndex >= 0 && (mask & (1 << fIndex))) {
      plain.push(0);
    } else {
      const p = mod29(cipher[i] - totients[key++]);
      if (p === 0) {
        return { mask, valid: false, plain, consumed: key, invalidAt: i };
      }
      plain.push(p);
    }
  }
  assert.deepEqual(encrypt(plain), cipher);
  return { mask, valid: true, plain, consumed: key, invalidAt: -1 };
}
const tests = Array.from({ length: 1 << fAt.length }, (_, mask) => tryMask(mask));
const valid = tests.filter((x) => x.valid);
assert.equal(valid.length, 22);
assert.equal(tests.filter((x) => !x.valid).length, 10);
assert.deepEqual(valid.map((x) => x.mask), [
  0, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14,
  16, 19, 20, 21, 22, 23, 24, 27, 28, 29, 30
]);
const authentic = valid.find((x) => x.mask === 8);
assert.ok(authentic);
assert.equal(authentic.consumed, 84);
assert.deepEqual(authentic.plain, plaintext);
assert.notDeepEqual(valid.find((x) => x.mask === 0).plain, plaintext);

/*
 * Independent solved LP1 WELCOME/WISDOM Vigenere comparison. The exact
 * 11-position historical literal-F mask and DIVINITY key are already
 * reproduced against all 515 published solved plaintext runes by
 * sims/lp1_fehu_word_shape_prospective_sft.cjs. Count both classes here
 * on the original LP1 cipher, rather than trusting the p56 classification.
 */
const lp1 = read('resources/transcriptions/lp1_wulfic_canonical.txt');
const welcome = [...lp1.split('%').slice(1, 3).join('%')]
  .filter((glyph) => runeToIndex.has(glyph))
  .map((glyph) => runeToIndex.get(glyph));
assert.equal(welcome.length, 515);
const welcomeKey = [23, 10, 1, 10, 9, 10, 16, 26]; // DIVINITY, V=>U
const welcomeLiterals = new Set([
  48, 74, 84, 132, 159, 160, 250, 421, 443, 465, 514
]);
let welcomeClock = 0;
const welcomePlain = welcome.map((c, i) =>
  welcomeLiterals.has(i) ? 0 : mod29(c - welcomeKey[welcomeClock++ % 8]));
assert.deepEqual(welcomePlain.flatMap((x, i) => x === 0 ? [i] : []),
  [...welcomeLiterals]);
let forwardClock = 0;
assert.deepEqual(welcomePlain.map((p) =>
  p === 0 ? 0 : mod29(p + welcomeKey[forwardClock++ % 8])), welcome);
const welcomeFs = welcome.flatMap((x, i) => x === 0 ? [i] : []);
assert.equal(welcomeFs.length, 25);
assert.equal(welcomeLiterals.size, 11);

const source = read('resources/liber-primus/lp2-transcription.txt');
const p56 = source.split(/^\s*%\s*$/m).at(-2);
const printed = p56.split(/[-.]/u)
  .map((w) => [...w].filter((x) => runeToIndex.has(x)))
  .filter((w) => w.length);
let start = 0;
const wordSites = [];
for (const w of printed) {
  for (const i of fAt) {
    if (i >= start && i < start + w.length) {
      wordSites.push({ position: i, offsetInPrintedWord: i - start,
        printedWordLength: w.length, literal: literalF.has(i) });
    }
  }
  start += w.length;
}
assert.equal(start, 85);
assert.deepEqual(wordSites.map((x) => x.position), fAt);
assert.deepEqual(wordSites.map((x) => x.offsetInPrintedWord), [1, 0, 0, 1, 3]);

console.log(JSON.stringify({
  p56OriginalCipherF: fAt,
  p56PlaintextF: [...literalF],
  p56CipherFByPlainRune: fAt.map((at) => ({
    at, plain: gp[plaintext[at]], literal: literalF.has(at)
  })),
  p56SourcePrintedWordSites: wordSites,
  p56All32Masks: tests.length,
  p56ForwardValidMasks: valid.map((x) => x.mask),
  p56ValidMaskCount: valid.length,
  p56InvalidMaskCount: 32 - valid.length,
  p56AuthenticMask: 8,
  p56All85SourceRuneForwardReencoding: true,
  LP1WelcomeOriginalCipherF: welcomeFs.length,
  LP1WelcomePlaintextLiteralF: welcomeLiterals.size,
  LP1WelcomeEncryptedNonFThatProduceCipherF: welcomeFs.length - welcomeLiterals.size,
  conclusion: 'Plaintext-F exception is authentic; ciphertext-F mask is non-identifiable from the known key and original glyph stream alone.'
}, null, 2));
