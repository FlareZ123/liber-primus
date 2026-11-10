'use strict';

/**
 * Fixed 2013 Cicada onion-cookie key hypothesis, tested on original LP2.
 * The historical archive reports two 32-byte hexadecimal cookie values
 * under reverse-ordered labels 167 and 761. Neither is authenticated as
 * encryption key material. This is a bounded source-to-key hypothesis.
 *
 * SFT: node sims/onion_cookie_key_probe.cjs
 * Source: https://github.com/scream314/cicada3301/blob/master/hints_never_used.md
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {encode} = require('./grid_keyskip_viterbi.cjs');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.status === 'unsolved' && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 12956);

const cookie167 = Buffer.from(
  '6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6', 'hex');
const cookie761 = Buffer.from(
  '7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5', 'hex');
assert.equal(cookie167.length, 32);
assert.equal(cookie761.length, 32);
const reversed = b => Buffer.from(b).reverse();
const keySources = {
  cookie167, cookie761,
  cookie167_reverse: reversed(cookie167),
  cookie761_reverse: reversed(cookie761),
  cookie_xor: Buffer.from(cookie167.map((b, i) => b ^ cookie761[i])),
  sha256_167_761: crypto.createHash('sha256').update(cookie167).update(cookie761).digest(),
  sha256_761_167: crypto.createHash('sha256').update(cookie761).update(cookie167).digest()
};

/** @returns {Buffer[]} One exact key byte per original rune. */
function generate(key, cipher, clock) {
  let offset = 0;
  const out = [];
  const ivFor = page => {
    const iv = Buffer.alloc(16);
    if (clock === 'page-index') iv.writeUInt32BE(page, 12);
    return iv;
  };
  if (clock === 'continuous') {
    const stream = crypto.createCipheriv(cipher, key, ivFor(0))
      .update(Buffer.alloc(12956));
    for (const page of pages) {
      out.push(stream.subarray(offset, offset + page.indices.length));
      offset += page.indices.length;
    }
    assert.equal(offset, stream.length);
    return out;
  }
  for (const page of pages) {
    out.push(crypto.createCipheriv(cipher, key, ivFor(page.page))
      .update(Buffer.alloc(page.indices.length)));
  }
  return out;
}

/** @param {Buffer[]} bytes @param {'mod29'|'scaled29'} reducer */
function reduce(bytes, reducer) {
  return bytes.map(b => Uint8Array.from(
    b, x => reducer === 'mod29' ? x % 29 : Math.floor(x * 29 / 256)));
}

/**
 * @param {number[][]} inputs Original or planted rune pages
 * @param {Uint8Array[]} stream Page-aligned 29-valued stream
 * @param {number} sign Additive encryption direction
 * @param {0|1} parity Physical-page training/holdout parity
 */
function ioc(inputs, stream, sign, parity) {
  const h = new Uint32Array(29);
  let n = 0;
  for (let j = 0; j < pages.length; j++) {
    if (pages[j].page % 2 !== parity) continue;
    for (let i = 0; i < inputs[j].length; i++) {
      const x = (inputs[j][i] - sign * stream[j][i] + 29) % 29;
      h[x]++;
      n++;
    }
  }
  let collisions = 0;
  for (const v of h) collisions += v * (v - 1);
  return collisions / (n * (n - 1));
}

function allModels() {
  const models = [];
  for (const [keyName, key] of Object.entries(keySources)) {
    for (const cipher of ['aes-256-ctr', 'chacha20']) {
      for (const clock of ['continuous', 'page-zero', 'page-index']) {
        const generated = generate(key, cipher, clock);
        for (const reducer of ['mod29', 'scaled29']) {
          const stream = reduce(generated, reducer);
          for (const sign of [-1, 1]) {
            models.push({keyName, cipher, clock, reducer, sign, stream});
          }
        }
      }
    }
  }
  assert.equal(models.length, 168);
  return models;
}

function screen(inputs, models) {
  return models.map(m => ({
    key: m.keyName, cipher: m.cipher, clock: m.clock, reducer: m.reducer,
    sign: m.sign, train: ioc(inputs, m.stream, m.sign, 0),
    holdout: ioc(inputs, m.stream, m.sign, 1)
  })).sort((a, b) => b.train - a.train);
}

function plant(models) {
  const english = fs.readFileSync(
    path.join(ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');
  const plain = encode(english.slice(240000));
  assert.ok(plain.length >= 12956);
  const actual = pages.map((p, i) => {
    const start = pages.slice(0, i).reduce((n, v) => n + v.indices.length, 0);
    return plain.slice(start, start + p.indices.length);
  });
  const chosen = models.find(m =>
    m.keyName === 'cookie167' && m.cipher === 'aes-256-ctr' &&
    m.clock === 'page-index' && m.reducer === 'mod29' && m.sign === 1);
  assert.ok(chosen);
  let rng = 0x16776133;
  /** @returns {number} */
  function next() {
    rng ^= rng << 13;
    rng ^= rng >>> 17;
    rng ^= rng << 5;
    return rng >>> 0;
  }
  let previous = -1, rewritten = 0;
  const encrypted = actual.map((arr, j) => arr.map((p, i) => {
    let c = (p + chosen.stream[j][i]) % 29;
    if (c === previous && next() % 100 < 81) {
      c = (c + 1 + next() % 28) % 29;
      rewritten++;
    }
    previous = c;
    return c;
  }));
  const ranked = screen(encrypted, models);
  const trueIndex = ranked.findIndex(r =>
    r.key === 'cookie167' && r.cipher === 'aes-256-ctr' &&
    r.clock === 'page-index' && r.reducer === 'mod29' && r.sign === 1);
  assert.equal(trueIndex, 0, 'Planted key should lead the entire 168-model screen');
  assert.ok(ranked[0].holdout > 0.048, 'Heldout plant must remain recognizably linguistic');
  return {rewritten, trueRank: trueIndex + 1, top: ranked.slice(0, 2),
    englishTrain: ioc(actual, chosen.stream.map(v => new Uint8Array(v.length)), 1, 0)};
}

function main() {
  const models = allModels();
  const planted = plant(models);
  const original = pages.map(p => p.indices);
  const ranked = screen(original, models);
  console.log(JSON.stringify({
    originalSource: {pages: 55, runes: 12956},
    archiveHint: '2013 onion cookies 167/761, two 32-byte reported values',
    modelCount: 168,
    candidateKeys: Object.keys(keySources),
    ciphers: ['aes-256-ctr', 'chacha20'],
    clocks: ['continuous', 'page-zero', 'page-index'],
    byteMappings: ['mod29', 'scaled29'],
    signs: [-1, 1],
    planted,
    original: {
      top: ranked.slice(0, 8),
      bestHeldoutSelectedAfterEvaluation:
        ranked.reduce((a, b) => a.holdout > b.holdout ? a : b),
      maxOriginalTraining: ranked[0].train,
      fixedOriginalHoldout: ranked[0].holdout,
      uniformIoC: 1 / 29
    }
  }, null, 2));
}

if (require.main === module) main();
module.exports = {keySources, generate, reduce, ioc, screen, allModels, plant, main};