'use strict';
/**
 * Source-bound test of the 36 *interior* p50 zero-bracket bytes as a standard
 * ARC4/RC4 key for the complete 76-rune original p55 body. Node 22 CommonJS.
 * Uses the historical outguess-era stream primitive without deriving a
 * nonce, tuning the key start, moving page boundaries, or fitting plaintext.
 * Run: node sims/lp2_p50_zero36_rc4_p55_original_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const load = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const grid = load('resources/liber-primus/base60-grid.json');
const corpus = load('resources/liber-primus/lp2-corpus.json');
const table = Buffer.from(grid.byte_rows.flat());
const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');
assert.equal(table.length, 256);
assert.equal(sha256(table), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const zeros = Array.from(table.keys()).filter((i) => table[i] === 0);
assert.deepEqual(zeros, [192, 229]);
const key = table.subarray(193, 229);
assert.equal(key.length, 36);
assert.equal(sha256(key), '9205dc9d0d6071448dd91876e1211becd2b4ef224445030e11b08b63acbdd86b');

/** @param {ArrayLike<number>} secret @param {number} length @returns {number[]} */
function rc4(secret, length) {
  assert.ok(secret.length > 0);
  const s = Uint8Array.from({length:256}, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + secret[i % secret.length]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
  }
  let i = 0;
  j = 0;
  const out = [];
  for (let k = 0; k < length; k++) {
    i = (i + 1) & 255;
    j = (j + s[i]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
    out.push(s[(s[i] + s[j]) & 255]);
  }
  return out;
}
assert.equal(Buffer.from(rc4(Buffer.from('Key'),9)).toString('hex'), 'eb9f7781b734ca72a7');
const target = corpus.pages.find((p) => p.page === 55).indices;
const clear = corpus.pages.find((p) => p.page === 57).indices.slice(0,76);
assert.equal(target.length,76);
assert.equal(clear.length,76);
const shift = rc4(key, target.length).map((v) => v % 29);
const mod = (v) => (v % 29 + 29) % 29;
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const v of a) counts[v]++;
  return counts.reduce((s, n) => s + n * (n-1),0) / (a.length * (a.length-1));
}
const planted = clear.map((x,i) => mod(x + shift[i]));
const recovered = planted.map((x,i) => mod(x - shift[i]));
assert.deepEqual(recovered, clear);
assert.notDeepEqual(planted, clear);
const candidates = [-1,1].map((sign) => {
  const plain = target.map((x,i) => mod(x + sign*shift[i]));
  const reconstructed = plain.map((x,i) => mod(x-sign*shift[i]));
  assert.deepEqual(reconstructed,target);
  return {sign, ioc:ioc(plain), transliteration:plain.map((i) => corpus.translit[i]).join(''), first32Indices:plain.slice(0,32)};
});
assert.equal(candidates.length, 2);
assert.ok(Math.abs(candidates[0].ioc - 0.03263157894736842) < 1e-12);
assert.ok(Math.abs(candidates[1].ioc - 0.03684210526315789) < 1e-12);
assert.equal(candidates[0].transliteration.startsWith('ANDWPTXAPJLAESCT'),true);
assert.equal(candidates[1].transliteration.startsWith('EEOSPUXLRAEMRTTH'),true);
console.log(JSON.stringify({
  status:'PASS',
  original:{
    zeroCellIndices:zeros,
    interiorKeyBytes:key.length,
    interiorKeySHA256:sha256(key),
    targetPage:55,
    targetRunes:target.length,
    targetIoC:ioc(target)
  },
  historicalPrimitive:'Standard RC4/ARC4, zero initial state, byte-mod-29 shift',
  variants:candidates,
  positive:{rc4Rfc6229StyleKnownVector:true, plantedKnownPage57Runes:clear.length, exactRecovered:recovered.length, nativeIoC:ioc(clear)},
  decision:'Neither direct source-key RC4 orientation yields original p55 plaintext. The apparent ANDW prefix of the subtractive candidate is a short coincidence; its remaining 72 runes are nonprose. Do not tune key offsets or transport modes without new creator-selected instructions.'
},null,2));
