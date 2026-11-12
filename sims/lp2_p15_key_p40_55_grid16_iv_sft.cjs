'use strict';
/**
 * Original-input SFT: one 256-bit key from the p15 spiral, one 128-bit IV
 * per each of the sixteen identically bordered LP2 pages p40..p55.
 *
 * Explicit candidate: 16 source values in red-centred clockwise order,
 * unsigned 16-bit big-endian -> AES-256-CTR key. Original 32x8 table in
 * physical row-major order -> 16 successive 16-byte page IVs. Stream byte
 * modulo29, direct original GP29 addition/subtraction; key resets each page.
 * No page-selection search, byte-order search, additional cipher or key skips.
 *
 * Reproduce: node sims/lp2_p15_key_p40_55_grid16_iv_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createCipheriv, createHash} = require('node:crypto');
const {candidates} = require('./fibonacci_spiral_key_derivation.cjs');
const {tableBytes} = require('./base60_seeded_stream.cjs');
const {encode, train} = require('./grid_keyskip_viterbi.cjs');

const ROOT = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.slice(40, 56);
const source = pages.map(page => page.indices);
const grid = tableBytes();
const key = candidates().find(item => item.name === 'absolute-spiral:BE')?.key;
assert.ok(key && key.length === 32);
assert.equal(grid.length, 256);
assert.deepEqual(pages.map(page => page.page), 
  Array.from({length: 16}, (_, i) => 40 + i));
assert.equal(source.reduce((sum, page) => sum + page.length, 0), 3316);
assert.equal(source[10].length, 0, 'Numerical p50 still consumes its own IV');

/** @param {Buffer} master @param {Buffer} iv @param {number} n */
function pad(master, iv, n) {
  const cipher = createCipheriv('aes-256-ctr', master, iv);
  const output = Buffer.concat([cipher.update(Buffer.alloc(n)), cipher.final()]);
  assert.equal(output.length, n);
  return output;
}

/**
 * @param {number[][]} book
 * @param {number} sign Plus to encrypt, minus to decrypt.
 * @param {Buffer} master
 * @param {Buffer} ivData
 * @returns {number[][]}
 */
function apply(book, sign, master = key, ivData = grid) {
  assert.equal(book.length, 16);
  assert.equal(ivData.length, 256);
  return book.map((page, i) => {
    const stream = pad(master, ivData.subarray(16 * i, 16 * (i + 1)), page.length);
    return page.map((symbol, j) =>
      (symbol + 29 + sign * (stream[j] % 29)) % 29);
  });
}

/** @param {number[]} a */
function ioc(a) {
  const counts = new Uint32Array(29);
  for (const x of a) counts[x]++;
  return counts.reduce((sum, k) => sum + k * (k - 1), 0) / (a.length * (a.length - 1));
}

/** @param {number[][]} pgs */
function metrics(pgs, model) {
  const flat = pgs.flat(), spell = corpus.translit;
  let log = 0;
  for (const page of pgs) for (let j = 0; j < page.length; j++) {
    const rune = page[j];
    log += j >= 2 ? model.trigram[(page[j-2] * 29 + page[j-1]) * 29 + rune]
      : j ? model.bigram[page[0] * 29 + rune] : model.unigram[rune];
  }
  return {
    ioc: ioc(flat),
    smoothedGpLogPerRune: log / flat.length,
    firstPagePrefix: pgs[0].slice(0, 70).map(x => spell[x]).join(' ')
  };
}

function main() {
  const english = fs.readFileSync(path.join(ROOT, 
    'resources/control/shakespeare_first300k.txt'), 'utf8');
  const languageModel = train(english.slice(0, 80000));
  const holdout = encode(english.slice(120000));
  assert.ok(holdout.length >= 3316);
  const plant = [];
  let at = 0;
  for (const page of source) {
    plant.push(holdout.slice(at, at + page.length));
    at += page.length;
  }
  assert.equal(at, 3316);
  const encryptedPlant = apply(plant, +1);
  const recoveredPlant = apply(encryptedPlant, -1);
  assert.deepEqual(recoveredPlant, plant);
  const originalMinus = apply(source, -1);
  const originalPlus = apply(source, +1);
  assert.deepEqual(apply(originalMinus, +1), source);
  assert.deepEqual(apply(originalPlus, -1), source);

  const result = {
    originalSources: {
      square: 'physical p15, red-centred clockwise 16xuint16 BE',
      grid: 'physical pp49-51, 256 conditional base60 values',
      tableSHA256: createHash('sha256').update(grid).digest('hex'),
      keySHA256: createHash('sha256').update(key).digest('hex'),
      ivRule: '16 consecutive physical-row-major bytes per physical p40-55 page',
      pageLengths: source.map(x => x.length)
    },
    original: {
      untouched: metrics(source, languageModel),
      CminusK: metrics(originalMinus, languageModel),
      CplusK: metrics(originalPlus, languageModel),
      wrongReversedGridIV: metrics(apply(source, -1, key, Buffer.from(grid).reverse()), languageModel),
      wrongRowMajorKey: metrics(apply(source, -1, candidates().find(x => x.name === 'absolute-row-major:BE').key), languageModel)
    },
    positive: {
      gpNative: metrics(plant, languageModel),
      encryptedNative: metrics(encryptedPlant, languageModel),
      recoveredNative: metrics(recoveredPlant, languageModel),
      recoveredAll3316: true
    },
    exactOriginalRoundtrip: true,
    decision: 'Judge original complete-text natural-language output; synthetic exact roundtrips do not authenticate the cipher.'
  };
  console.log(JSON.stringify(result, null, 2));
}
if (require.main === module) main();
module.exports = {apply, ioc, metrics, main};
