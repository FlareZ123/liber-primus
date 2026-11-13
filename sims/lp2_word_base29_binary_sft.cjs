'use strict';

/**
 * Historically motivated word-wise BASE29 binary test on original LP2:
 * the signed 2013 BASE29 codec + signed 2016 "words are the map" clue.
 * Finite source-ordered and word-reversed whole-blob consumers, with native
 * gzip positive plant. Node22 CommonJS, Windows 11 compatible.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const {parseSharedCorpus} = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources',
  'liber-primus', 'lp2-corpus.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'resources',
  'cicada2014-archive-hash-manifest.json'), 'utf8'));
const words = parseSharedCorpus().words;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const indexWords = words.map(({runes}) => [...runes].map((r) => {
  assert.ok(runeIndex.has(r), 'Unexpected original rune ' + r);
  return runeIndex.get(r);
}));
const unsolved = corpus.pages.filter((p) => p.page < 56)
  .flatMap((p) => p.indices);
assert.equal(words.length, 2896);
assert.deepEqual(indexWords.flat(), unsolved);
assert.equal(unsolved.length, 12956);

/** @param {number[]} digits @returns {Buffer} */
function base29Bytes(digits) {
  let n = 0n;
  for (const d of digits) n = n * 29n + BigInt(d);
  let hex = n.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  return Buffer.from(hex, 'hex');
}

/** @param {number} n @returns {number[]} */
function base29Digits(n) {
  assert(Number.isInteger(n) && n >= 0);
  if (n === 0) return [0];
  const out = [];
  for (; n; n = Math.floor(n / 29)) out.unshift(n % 29);
  return out;
}

const native = Buffer.from('THE WORDS ARE THE MAP AND THEIR NUMBERS ARE THE DIRECTION',
  'ascii');
const compressed = zlib.gzipSync(native);
const planted = Array.from(compressed, (b) => base29Digits(b));
const recovered = Buffer.concat(planted.map(base29Bytes));
assert.deepEqual(recovered, compressed);
assert.deepEqual(zlib.gunzipSync(recovered), native);

const variants = [];
for (const reverse of [false, true]) {
  const chosen = reverse ? indexWords.slice().reverse() : indexWords;
  const views = {
    word_base29_bigint_minimal_bytes: Buffer.concat(chosen.map(base29Bytes)),
    word_base29_residue256: Buffer.from(chosen.map((w) =>
      base29Bytes(w).at(-1))),
    word_gp_prime_sum_mod256: Buffer.from(chosen.map((w) =>
      w.reduce((sum, x) => sum + corpus.prime[x], 0) % 256))
  };
  for (const [name, body] of Object.entries(views)) {
    const decompress = {};
    for (const [method, decoder] of Object.entries({
      gzip: zlib.gunzipSync,
      zlib: zlib.inflateSync,
      raw_deflate: zlib.inflateRawSync
    })) {
      try {
        const out = decoder(body, {maxOutputLength: 1<<22});
        decompress[method] = {decoded_bytes: out.length,
          utf8_head: out.subarray(0, 70).toString('utf8')};
      } catch (e) {
        decompress[method] = e.code || e.name;
      }
    }
    const signature = crypto.createHash('sha512').update(body)
      .digest('hex').toLowerCase();
    variants.push({name,reverse,bytes:body.length,
      source_gp_words:indexWords.length,
      first_hex:body.subarray(0, 18).toString('hex'),
      sha512_matches_printed_p56: signature === manifest.targetHex.toLowerCase(),
      compressions:decompress});
  }
}
assert.equal(variants.length, 6);
console.log(JSON.stringify({experiment:'Source-word BASE29 or prime-sum binary payload',
  native_control:{bytes:native.length,gzip_bytes:compressed.length,
    recovered_bytes:recovered.length},
  source_words:words.length,
  cases:variants
},null,2));
