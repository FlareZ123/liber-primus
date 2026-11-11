'use strict';
/**
 * Source-frozen historical fourth-onion phrase as an LP2 GP29 Vigenere key.
 * This is an original-ciphertext negative at exactly four fixed sign/clock
 * settings, NOT a claim that the fourth-onion words are a historical LP2 key.
 *
 * Sources: https://github.com/FlareZ123/liber-primus/issues/290
 *          https://github.com/FlareZ123/liber-primus/issues/299
 * Historical 2014 GP29 source-positive control:
 *   sims/historical_text_guide_terminal_vigenere_sft.cjs
 * Run: node sims/2014_fourth_onion_phrase_lp2_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeGP, historicalOnionInverse } = require('./historical_text_guide_terminal_vigenere_sft.cjs');
const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.equal(pages.length, 55);

// The 2014 fourth-onion OutGuess + period-seven transposition exposes this
// source-only sentence before its separately encoded next-onion address.
const historicOutput = 'TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133';
assert.ok(historicOutput.startsWith('TOBELIEVETRUTHISTODESTROYPOSSIBILITY'));
const phrase = 'TO BELIEVE TRUTH IS TO DESTROY POSSIBILITY';
const key = encodeGP(phrase);
assert.equal(key.length, 35);
assert.equal(key.map(i => corpus.translit[i]).join(''), 'TOBELIEUETRUTHISTODESTROYPOSSIBILITY');

// Independently known successful 2014 source-selected key demonstration.
const onion = 'ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3 ᛠᛗᛇᚠᛡ';
assert.equal(historicalOnionInverse(onion, encodeGP('WELCOME PILGRIM TO THE GREAT')),
  'AUOWYFGL5LCSFJ3 NONIAN');

/**
 * @param {number[][]} pageData
 * @param {number} sign Either +1 or -1.
 * @param {'book'|'page'} clock
 * @returns {number[]}
 */
function transform(pageData, sign, clock) {
  const out = [];
  let offset = 0;
  for (const pg of pageData) {
    for (let i = 0; i < pg.length; i++) {
      const index = (clock === 'book' ? offset + i : i) % key.length;
      out.push((pg[i] + sign * key[index] + 29) % 29);
    }
    offset += pg.length;
  }
  return out;
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = new Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((sum, x) => sum + x * (x - 1), 0) / (a.length * (a.length - 1));
}

/** @param {number[]} flat @returns {number[][]} */
function repage(flat) {
  let offset = 0;
  return pages.map(pg => {
    const part = flat.slice(offset, offset + pg.indices.length);
    offset += part.length;
    return part;
  });
}

const referencePlain = corpus.pages.find(pg => pg.page === 57).indices;
assert.ok(referencePlain.length > 100);
const planted = pages.map(pg => Array.from({length: pg.indices.length}, (_, i) => referencePlain[i % referencePlain.length]));
const expected = {
  'book,-1': 0.03447295236354403,
  'book,1': 0.03448608352778856,
  'page,-1': 0.034488621584035456,
  'page,1': 0.034453470100803726
};
const output = [];
for (const clock of ['book', 'page']) {
  for (const sign of [-1, 1]) {
    const decoded = transform(pages.map(pg => pg.indices), sign, clock);
    const roundtrip = transform(repage(decoded), -sign, clock);
    assert.deepEqual(roundtrip, original);
    const encryptedPlant = transform(planted, -sign, clock);
    assert.deepEqual(transform(repage(encryptedPlant), sign, clock), planted.flat());
    const value = ioc(decoded);
    assert.ok(Math.abs(value - expected[clock + ',' + sign]) < 1e-12);
    const prefix = decoded.slice(0, 35).map(i => corpus.translit[i]).join('-');
    output.push({clock, sign, ioc: value, preview35: prefix});
  }
}
console.log(JSON.stringify({
  status: 'SOURCE-FROZEN DIRECT VIGENERE NEGATIVE; NO UNKNOWN LP2 PLAINTEXT',
  sourcePhrase: phrase, keyRunes: key.length, originalRunes: original.length,
  rawIoC: ioc(original), models: output, historical2014Positive: true,
  exactOriginalReencryption: true, plantedOriginalLengthRecovery: true
}, null, 2));
