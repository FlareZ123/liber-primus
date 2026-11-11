'use strict';

/**
 * Original LP2 source-locked triple-DES follow-up to the row-DES experiment.
 *
 * Candidate clue: the separately signed 2016 prime-sum book address for
 * "lies" selects the literal printed p50 token "3D"; its interpretation as
 * triple DES is speculative. The 32x8 original table naturally supplies
 * 32 eight-byte source rows. Adjacent rows provide two- or three-key 3DES
 * per thirteen-dot-delimited text fragment, without searching secret keys.
 *
 * Node 22 CommonJS SFT: node sims/fragment_grid_3des_source_inverse.cjs
 */
const assert = require('node:assert/strict');
const {createCipheriv, getCiphers} = require('node:crypto');
const base = require('./fragment_grid_des_inverse.cjs');

const {
  segments, original, sourceKeys, english, nativeRef,
  decode, encodeCipher, sliceSplit, plainScore, corpus
} = base;

assert.ok(getCiphers().includes('des-ede3'));
assert.ok(getCiphers().includes('des-ede3-ofb'));
assert.equal(segments.length, 32);
assert.equal(original.flat().length, 12956);
assert.equal(sourceKeys.canonical.length, 32);

const identity = Array.from({length: 32}, (_, i) => i);
const lcg = [];
for (let state = 0; lcg.length < 32; state = (13 * state + 31) % 32) {
  lcg.push(state);
}
assert.equal(new Set(lcg).size, 32);
const orders = {printed: identity, lcg};

const modes = [];
for (const arrangement of ['two-key', 'three-key'])
for (const order of ['printed', 'lcg'])
for (const stream of ['ctr', 'ofb'])
for (const salt of ['zero', 'fragment'])
for (const format of ['direct29', 'diff28'])
for (const reducer of ['mod', 'scaled'])
for (const sign of [-1, 1]) {
  modes.push({arrangement, order, stream, salt, format, reducer, sign});
}
assert.equal(modes.length, 128);

/**
 * @param {Buffer} key Exactly 24 bytes from original printed grid rows.
 * @param {number} count Bytes required by the given original fragment.
 * @param {number} fragment 0-based thirteen-dot-delimited fragment.
 * @param {{stream:string, salt:string}} mode Fixed model.
 * @returns {Buffer} Deterministic 3DES output bytes.
 */
function streamBytes(key, count, fragment, mode) {
  assert.equal(key.length, 24);
  if (count === 0) return Buffer.alloc(0);
  if (mode.stream === 'ofb') {
    const iv = Buffer.alloc(8);
    if (mode.salt === 'fragment') iv.writeBigUInt64BE(BigInt(fragment));
    const c = createCipheriv('des-ede3-ofb', key, iv);
    return Buffer.concat([c.update(Buffer.alloc(count)), c.final()]);
  }
  const input = Buffer.alloc(Math.ceil(count / 8) * 8);
  for (let i = 0; i < input.length / 8; i++) {
    input.writeBigUInt64BE(BigInt(i + (mode.salt === 'fragment' ? fragment : 0)), i * 8);
  }
  const c = createCipheriv('des-ede3', key, null);
  c.setAutoPadding(false);
  return Buffer.concat([c.update(input), c.final()]).subarray(0, count);
}

/**
 * Derive a 24-byte key from consecutive rows in one source-prescribed order.
 * K1,K2,K1 is two-key triple DES; K1,K2,K3 uses three adjacent table rows.
 * The key schedule wraps the original 32-row source table.
 *
 * @param {number} fragment Fragment ordinal.
 * @param {{arrangement:string,order:string}} mode Selected model.
 * @returns {Buffer}
 */
function sourceKey(fragment, mode) {
  const order = orders[mode.order];
  const rows = sourceKeys.canonical;
  const a = rows[order[fragment % 32]];
  const b = rows[order[(fragment + 1) % 32]];
  const c = mode.arrangement === 'two-key' ? a : rows[order[(fragment + 2) % 32]];
  return Buffer.concat([a, b, c]);
}

/** @param {object} mode Fixed 3DES source interpretation. */
function makePads(mode) {
  return segments.map((segment, i) =>
    streamBytes(sourceKey(i, mode), segment.length, i, mode));
}
function ioc(seq) {
  const hist = Array(29).fill(0);
  for (const v of seq) hist[v]++;
  return hist.reduce((n, v) => n + v * (v - 1), 0) / (seq.length * (seq.length - 1));
}
function search(segs) {
  const results = modes.map(mode => {
    const pads = makePads(mode);
    const plaintext = decode(segs, pads, mode);
    assert.deepEqual(encodeCipher(plaintext, pads, mode), segs);
    const {tr, ho} = sliceSplit(plaintext);
    return {
      mode, train: plainScore(tr, english), heldout: plainScore(ho, english),
      trainIoc: ioc(tr), heldoutIoc: ioc(ho),
      first: plaintext[0].slice(0, 35).map(x => corpus.translit[x]).join('')
    };
  });
  return results.sort((a, b) => b.train - a.train);
}
function plant() {
  const chosen = {
    arrangement: 'three-key', order: 'lcg', stream: 'ctr', salt: 'fragment',
    format: 'diff28', reducer: 'scaled', sign: 1
  };
  let offset = 0;
  const native = segments.map(segment => {
    const item = nativeRef.slice(offset, offset + segment.length);
    offset += segment.length;
    return item;
  });
  assert.equal(offset, 12956);
  const pads = makePads(chosen);
  const ciphertext = encodeCipher(native, pads, chosen);
  assert.deepEqual(decode(ciphertext, pads, chosen), native);
  assert.deepEqual(encodeCipher(decode(ciphertext, pads, chosen), pads, chosen), ciphertext);
  const ranked = search(ciphertext);
  const rank = ranked.findIndex(x => JSON.stringify(x.mode) === JSON.stringify(chosen)) + 1;
  assert.ok(rank > 0);
  const split = sliceSplit(native);
  return {
    trueModeRank: rank,
    recovered: native.flat().length,
    nativeTrain: plainScore(split.tr, english),
    nativeHeldout: plainScore(split.ho, english),
    plantMatchedTrain: ranked[rank - 1].train,
    plantMatchedHeldout: ranked[rank - 1].heldout
  };
}
function main() {
  const rank = search(original);
  const raw = sliceSplit(original);
  const top = rank.slice(0, 8);
  const best = rank[0];
  const out = {
    status: 'hypothetical 3D=triple DES source reading, not an authenticated decoder',
    originalRuneCount: original.flat().length,
    fragmentCount: segments.length,
    source: 'original 32x8 base60 numeric table + 31 thirteen-dot boundaries',
    models: modes.length,
    comparisons: {
      originalTrain: plainScore(raw.tr, english),
      originalHeldout: plainScore(raw.ho, english),
      nativeReferenceTrain: plainScore(sliceSplit([nativeRef.slice(0, original.flat().length)]).tr, english)
    },
    topTraining: top,
    frozenBestHeldout: {mode: best.mode, score: best.heldout, ioc: best.heldoutIoc},
    nativePositive: plant()
  };
  console.log(JSON.stringify(out, null, 2));
}
if (require.main === module) main();
module.exports = {sourceKey, makePads, search, plant, main};
