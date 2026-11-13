'use strict';

/**
 * One source-inspired inversion: p3 primitive-root15 GP28 nonrepeat step,
 * transparent EA zero-step, and eight original 32-byte p50 table columns as
 * ChaCha20-256 keystream seeds on eight visual macro-chapters.
 *
 * This is an experimental composition, not an author-authenticated cipher.
 * Run: node sims/lp2_grid8_chacha20_gp28_ea_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} p */
const json = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const table = json('resources/liber-primus/lp2-grid-256.json').bytes;
const C = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const cuts = [0,729,1874,3603,5506,6527,7960,9640,12648,12956];
assert.equal(C.length, 12956);
assert.equal(table.length, 256);
assert.equal(cuts.at(-1), C.length);
const pow = Array.from({length: 28}, (_, i) => {
  let v = 1;
  for (let j = 0; j < i; ++j) v = v * 15 % 29;
  return v;
});
const log = Array(29).fill(-1);
pow.forEach((v, i) => { log[v] = i; });
assert.equal(new Set(pow).size, 28);
assert.equal(15*15%29, 22);
assert.equal(22*22%29, 20); // 78 mod29.
const mod = (n, m) => ((n % m) + m) % m;
/** @param {Buffer} key @param {number} n */
function stream(key, n) {
  return crypto.createCipheriv('chacha20', key, Buffer.alloc(16))
    .update(Buffer.alloc(n));
}
assert.equal(stream(Buffer.alloc(32), 64).toString('hex'),
  '76b8e0ada0f13d90405d6ae55386bd28bdd219b8a08ded1aa836efcc8b770dc7da41597c5157488d7724e03fb8d84a376a43b8f41518a11cc387b669b2ee6586');
/** @param {number[]} plain @param {Buffer} pad @returns {number[]} */
function encrypt(plain, pad) {
  assert.equal(plain.length, pad.length);
  const out = [mod(plain[0] + pad[0] % 29, 29)];
  for (let i = 1; i < plain.length; ++i) {
    out.push(plain[i] === 28 ? out[i-1] :
      mod(out[i-1] + pow[mod(plain[i] + pad[i] % 28, 28)], 29));
  }
  return out;
}
/** @param {number[]} cipher @param {Buffer} pad @returns {number[]} */
function decrypt(cipher, pad) {
  assert.equal(cipher.length, pad.length);
  const out = [mod(cipher[0] - pad[0] % 29, 29)];
  for (let i = 1; i < cipher.length; ++i) {
    const step = mod(cipher[i] - cipher[i-1], 29);
    out.push(step === 0 ? 28 : mod(log[step] - pad[i] % 28, 28));
  }
  return out;
}
/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((s, n) => s + n * (n-1), 0) /
    (values.length * (values.length-1));
}
const solvedP57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(solvedP57.length, 95);
assert(ioc(solvedP57) > 0.05);
const rows = [];
for (let chapter = 0; chapter < 8; ++chapter) {
  const key = Buffer.from(Array.from({length:32},
    (_, row) => table[8*row+chapter]));
  const original = C.slice(cuts[chapter], cuts[chapter+1]);
  const pad = stream(key, original.length);
  const decoded = decrypt(original, pad);
  assert.deepEqual(encrypt(decoded, pad), original);
  const plantPad = stream(key, solvedP57.length);
  const plantCipher = encrypt(solvedP57, plantPad);
  assert.deepEqual(decrypt(plantCipher, plantPad), solvedP57);
  const naturalPlain = decoded.slice(0, 70)
    .map(x => corpus.translit[x]).join('');
  rows.push({
    chapter, originalRunes: original.length,
    rawIoC: Number(ioc(original).toFixed(9)),
    decodedIoC: Number(ioc(decoded).toFixed(9)),
    detectedEA: decoded.filter(v => v === 28).length,
    previewGP: naturalPlain,
    originalRoundTrip: true, solvedNativePlant: true,
  });
}
assert.deepEqual(rows.map(r => r.originalRunes),
  [729,1145,1729,1903,1021,1433,1680,3008]);
assert(rows.every(r => r.decodedIoC < 0.04));
// The final p54-55 unit has no ninth key in an eight-column table.
if (require.main === module) console.log(JSON.stringify({
  status: 'PASS', classification: 'bounded negative, source-inspired transducer, no original plaintext',
  model: 'EA transparent step=0; else deltaC=15^((P+ChaCha20byte mod28) mod28) mod29',
  key: 'one original table vertical 32-byte column per visual macro-chapter, natural order; zero IV',
  byteConsumption: 'one byte per original GP rune, including EA and first-symbol states',
  firstRune: 'P0=(C0 - ChaCha20byte0 mod29) mod29',
  testControls: 'published 64-byte ChaCha20 KAT, eight exact original inverses, eight solved-p57 GP plants',
  visualTerminalUnit: {pages:[54,55],runes:308,keyAvailable:false},
  rows,
  decision: 'All eight decodes remain GP-like random, no authentic plaintext or source-selected ChaCha consumer'
},null,2));
module.exports = {encrypt, decrypt, stream};
