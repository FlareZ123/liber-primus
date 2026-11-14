'use strict';
/**
 * A source-bounded Curve25519 / eight-section Liber Primus inverse.
 *
 * Original source geometry: p15 has 16 decimal 16-bit cells (32 bytes);
 * p50 has 8 printed columns of 32 bytes, and LP2 has eight large sections
 * if the independently documented two-word bridge is joined to its successor.
 *
 * The historical 2013 Cicada challenge explicitly used Diffie-Hellman.
 * X25519, private/public role, byte order, byte radix, AES/ChaCha consumption
 * and the GP29 reduction remain hypotheses, not authenticated instructions.
 *
 * Standalone test for Node.js 22:
 *   node sims/lp2_curve25519_p15_p50_original_sft.cjs
 * No writes. Source native plaintext is used only for a positive control.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { inputs } = require('./grid_section_column_keys.cjs');
const { encode } = require('./grid_keyskip_viterbi.cjs');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const { groups } = inputs();
assert.equal(groups.length, 8);
assert.equal(groups.reduce((n, a) => n + a.length, 0), 12956);
assert(groups.every((x) => x.length >= 700));

const rows = [3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838,
  3288, 3294, 3296, 2472, 4516, 1206, 708, 1820];
const spiral = [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516];
assert.deepEqual([...rows].sort((a, b) => a - b), [...spiral].sort((a, b) => a - b));

const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');
const repairs = [[45, 107, 81], [50, 47, 21], [165, 18, 47],
  [172, 148, 174], [246, 198, 224]];
const originalTokens = grid.rows.flat();
assert.equal(originalTokens.length, 256);
assert(originalTokens.every((token) => token.length === 2));
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);

/** @param {number[]} source @param {'BE'|'LE'} order */
function pack16(source, order) {
  const b = Buffer.alloc(32);
  for (let i = 0; i < 16; i++) {
    if (order === 'BE') b.writeUInt16BE(source[i], i * 2);
    else b.writeUInt16LE(source[i], i * 2);
  }
  return b;
}

/** @param {boolean} corrected @param {number} radix */
function tableColumns(corrected, radix) {
  const tokens = originalTokens.slice();
  if (corrected) for (const [at, oldByte, newByte] of repairs) {
    assert.equal(alphabet60.indexOf(tokens[at][0]) * 60 +
      alphabet60.indexOf(tokens[at][1]), oldByte);
    tokens[at] = alphabet60[Math.floor(newByte / 60)] + alphabet60[newByte % 60];
  }
  const alphabet = radix === 60 ? alphabet60 : alphabet59;
  const bytes = tokens.map(token => alphabet.indexOf(token[0]) * radix +
    alphabet.indexOf(token[1]));
  assert(bytes.every(value => Number.isInteger(value) && value >= 0 && value < 256));
  return Array.from({ length: 8 }, (_, col) =>
    Buffer.from(Array.from({ length: 32 }, (_, row) => bytes[row * 8 + col])));
}

const privHeader = Buffer.from('302e020100300506032b656e04220420', 'hex');
const pubHeader = Buffer.from('302a300506032b656e032100', 'hex');
/** @param {Buffer} raw */
function privateKey(raw) {
  assert.equal(raw.length, 32);
  return crypto.createPrivateKey({
    key: Buffer.concat([privHeader, raw]), format: 'der', type: 'pkcs8'
  });
}
/** @param {Buffer} raw */
function publicKey(raw) {
  assert.equal(raw.length, 32);
  return crypto.createPublicKey({
    key: Buffer.concat([pubHeader, raw]), format: 'der', type: 'spki'
  });
}
/** @param {Buffer} square @param {Buffer[]} columns @param {string} role */
function sharedSecrets(square, columns, role) {
  return role === 'square-public'
    ? columns.map(col => crypto.diffieHellman({
      privateKey: privateKey(col), publicKey: publicKey(square)
    }))
    : columns.map(col => crypto.diffieHellman({
      privateKey: privateKey(square), publicKey: publicKey(col)
    }));
}

/** @param {Buffer} secret @param {string} algorithm @param {number} length */
function pad(secret, algorithm, length) {
  const engine = crypto.createCipheriv(algorithm, secret, Buffer.alloc(16));
  return Buffer.concat([engine.update(Buffer.alloc(length)), engine.final()]);
}

/** @param {number} c @param {number} k @param {number} sign */
function mod29(c, k, sign) {
  return (c + 29 + sign * k) % 29;
}
/** @param {Buffer} ks @param {'mod'|'scaled'} conversion */
function keys(ks, conversion) {
  return Array.from(ks, x => conversion === 'mod' ? x % 29 : Math.floor(29 * x / 256));
}
/** @param {number[]} sample */
function ioc(sample) {
  const n = sample.length;
  const hist = new Uint32Array(29);
  for (const value of sample) {
    assert(Number.isInteger(value) && value >= 0 && value < 29);
    hist[value]++;
  }
  return hist.reduce((sum, x) => sum + x * (x - 1), 0) / (n * (n - 1));
}

const WINDOW = 350;
const variants = [];
for (const corrected of [false, true]) for (const radix of [60, 59])
for (const [order, values] of [['row', rows], ['spiral', spiral]])
for (const endian of ['BE', 'LE'])
for (const role of ['square-public', 'square-private']) {
  const square = pack16(values, endian);
  const columns = tableColumns(corrected, radix);
  const secrets = sharedSecrets(square, columns, role);
  assert(secrets.every(x => x.length === 32 && x.some(y => y !== 0)));
  for (const algorithm of ['aes-256-ctr', 'chacha20']) {
    const pads = secrets.map(secret => pad(secret, algorithm, 2 * WINDOW));
    for (const conversion of ['mod', 'scaled']) for (const sign of [-1, 1]) {
      let train = 0, heldout = 0;
      for (let j = 0; j < 8; j++) {
        const mask = keys(pads[j], conversion);
        const source = groups[j];
        train += ioc(source.slice(0, WINDOW).map((v, i) => mod29(v, mask[i], sign)));
        heldout += ioc(source.slice(WINDOW, 2 * WINDOW)
          .map((v, i) => mod29(v, mask[WINDOW + i], sign)));
      }
      variants.push({ corrected, radix, order, endian, role, algorithm,
        conversion, sign, train: train / 8, heldout: heldout / 8 });
    }
  }
}
assert.equal(variants.length, 256);
variants.sort((a, b) => b.train - a.train);
const best = variants[0];
const bestHeldout = [...variants].sort((a, b) => b.heldout - a.heldout)[0];

const natural = encode(fs.readFileSync(
  path.join(root, 'resources/control/gibran_prophet_58585.txt'), 'utf8'));
assert(natural.length >= 12956);
const square = pack16(spiral, 'LE');
const secrets = sharedSecrets(square, tableColumns(false, 60), 'square-public');
let k = 0, positiveEqual = 0, nativeTrain = 0, nativeHeldout = 0;
for (let section = 0; section < 8; section++) {
  const n = groups[section].length;
  const native = natural.slice(k, k + n);
  const key = keys(pad(secrets[section], 'aes-256-ctr', n), 'mod');
  const enc = native.map((v, i) => mod29(v, key[i], 1));
  const decoded = enc.map((v, i) => mod29(v, key[i], -1));
  for (let i = 0; i < n; i++) positiveEqual += Number(decoded[i] === native[i]);
  nativeTrain += ioc(decoded.slice(0, WINDOW));
  nativeHeldout += ioc(decoded.slice(WINDOW, 2 * WINDOW));
  k += n;
}
assert.equal(positiveEqual, 12956);
assert(nativeTrain / 8 > 0.045 && nativeHeldout / 8 > 0.045);

function firstText(model, count) {
  const vals = model.order === 'row' ? rows : spiral;
  const shared = sharedSecrets(pack16(vals, model.endian),
    tableColumns(model.corrected, model.radix), model.role);
  const mask = keys(pad(shared[0], model.algorithm, count), model.conversion);
  const corpus = JSON.parse(fs.readFileSync(
    path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  return groups[0].slice(0, count)
    .map((v, i) => corpus.translit[mod29(v, mask[i], model.sign)]).join('');
}

const summary = {
  originalRuneCount: 12956,
  originalSections: groups.map(x => x.length),
  source: 'p15 16x16bit square packed to 32bytes; p50 eight 32byte columns; X25519',
  originalTableHighbitInLastRow: tableColumns(false, 60)
    .map(col => Number((col[31] & 128) !== 0)),
  sourceInterpretations: variants.length,
  selection: 'max mean IoC on first 350 symbols of each of 8 sections, withheld next 350',
  bestTrain: best,
  bestHeldoutPostselected: bestHeldout,
  GP29NativeEnglishControl: {
    exactRecovered: positiveEqual, total: k,
    trainIoC: nativeTrain / 8,
    heldoutIoC: nativeHeldout / 8
  },
  bestOriginalPreview: firstText(best, 64),
  status: 'No authentic key/decoder is implied by 2013 DH precedent; judge original heldout independently'
};
console.log(JSON.stringify(summary, null, 2));
