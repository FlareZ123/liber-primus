'use strict';

/**
 * Candidate: source-authenticated p15 4x4 spiral reads each of sixteen
 * native 4x4 tiles of the unmodified p49-51 32x8 number table into a
 * 16-byte candidate key. Assign printed tiles to floral pages p40..p55,
 * once per physical page, and test standard AES-128-CTR/zero-IV additive
 * GP29 or literal-F-bypassing GP28 rune receivers. This is a falsifiable
 * proposal; no first-party Cicada instruction specifies AES or this KDF.
 *
 * Windows 11 / Node.js 22; standalone:
 *   node sims/lp2_p15_spiral16_floral_pagekey_aes128_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} f @returns {any} */
function load(f) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
}
const book = load('resources/liber-primus/lp2-corpus.json');
const table = load('resources/liber-primus/base60-grid.json');
assert.equal(table.byte_rows.length, 32);
assert(table.byte_rows.every(row => row.length === 8));
const bytes = Buffer.from(table.byte_rows.flat());
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

// An exact original p15 clue, printed with RED 3299 at row1 col1.
// The Fibonacci-prime spiral's subsequent source-known order is fixed.
const originalP15 = [
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820]
];
const spiral = [5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];
assert.deepEqual(spiral.map(n => originalP15[Math.floor(n / 4)][n % 4]),
  [3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,
    2838,2472,1820,708,1206,4516]);

// Original source table is exactly 8 high groups of two adjacent
// 4x4 squares each, giving sixteen natural source-order tiles.
const keys = [];
const addresses = [];
for (let blockRow = 0; blockRow < 8; blockRow++) {
  for (let blockCol = 0; blockCol < 2; blockCol++) {
    const tile = [];
    const pos = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const x = 4 * blockCol + col;
        const y = 4 * blockRow + row;
        tile.push(table.byte_rows[y][x]);
        pos.push(8 * y + x);
      }
    }
    keys.push(Buffer.from(spiral.map(i => tile[i])));
    addresses.push(spiral.map(i => pos[i]));
  }
}
assert.equal(keys.length, 16);
assert.equal(new Set(addresses.flat()).size, 256);
assert.equal(new Set(keys.map(b => b.toString('hex'))).size, 16);
assert(keys.every(b => b.length === 16));
assert.equal(addresses[0][0], 9);
assert.equal(addresses[15].length, 16);
const pages = book.pages.slice(40,56);
const lengths = pages.map(p => p.indices.length);
assert.deepEqual(lengths,
  [231,273,272,274,273,270,270,274,271,66,0,92,263,179,232,76]);
assert.equal(lengths.reduce((a,b) => a + b), 3316);

/** @param {Buffer} key @param {number} length @returns {Buffer} */
function keystream(key, length) {
  const cipher = crypto.createCipheriv('aes-128-ctr', key, Buffer.alloc(16));
  return Buffer.concat([cipher.update(Buffer.alloc(length)), cipher.final()]);
}

/**
 * Original GP29 ↔ fixed keystream under sign; GP28 reserves GP=0 (F).
 * @param {number[]} input
 * @param {Buffer} stream
 * @param {1|-1} sign
 * @param {'gp29'|'gp28-f-literal'} model
 * @returns {number[]}
 */
function convert(input, stream, sign, model) {
  let index = 0;
  return input.map(x => {
    if (model === 'gp28-f-literal' && x === 0) return 0;
    const modulus = model === 'gp29' ? 29 : 28;
    const offset = model === 'gp29' ? x : x - 1;
    const out = (((offset + sign * (stream[index++] % modulus)) % modulus)
      + modulus) % modulus;
    return model === 'gp29' ? out : out + 1;
  });
}

/** @param {number[]} source @returns {number} */
function coincidence(source) {
  const counts = Array(29).fill(0);
  for (const x of source) {
    assert(Number.isInteger(x) && x >= 0 && x < 29);
    counts[x]++;
  }
  return counts.reduce((s,n) => s + n * (n-1), 0) /
    (source.length * (source.length-1));
}

const solved = book.pages[57].indices;
assert.equal(solved.length, 95);
const native = pages.map((p,i) => Array.from(
  {length:p.indices.length}, (_,k) => solved[(k+17*i)%solved.length]));
const raw = pages.flatMap(p => p.indices);
const control = native.flat();
assert(coincidence(control) > 0.050);
const results = [];

for (const model of ['gp29','gp28-f-literal']) {
  for (const sign of [-1,1]) {
    const decoded = [];
    for (let pageIndex = 0; pageIndex < 16; pageIndex++) {
      const original = pages[pageIndex].indices;
      const stream = keystream(keys[pageIndex], original.length);
      const plain = convert(original, stream, sign, model);
      assert.deepEqual(convert(plain, stream, -sign, model), original,
        'Original re-encryption p' + (pageIndex+40));
      const p = native[pageIndex], s = keystream(keys[pageIndex], p.length);
      const enc = convert(p, s, -sign, model);
      assert.deepEqual(convert(enc, s, sign, model), p,
        'Native p57 positive p' + (pageIndex+40));
      decoded.push(plain);
    }
    const full = decoded.flat();
    assert.equal(full.length, 3316);
    const first = decoded.slice(0,14).flat();
    const held = decoded.slice(14).flat();
    assert.equal(first.length,3008);
    assert.equal(held.length,308);
    const outcome = {
      model, sign,
      completeIoC: coincidence(full),
      p40to53IoC: coincidence(first),
      p54to55IoC: coincidence(held),
      p55IoC: coincidence(decoded[15]),
      pageMaxIoC: Math.max(...decoded.filter(a => a.length >= 50)
        .map(coincidence)),
      first32: decoded[0].slice(0,32).map(n => book.translit[n]).join('.')
    };
    results.push(outcome);
  }
}
assert(results.every(r => r.completeIoC < 0.046));

// A simpler competing, no-AES interpretation: repeat each 16-byte tile
// directly on its matched page, again with no fitted clock or phase.
// It is deliberately tested before accepting any proposed AES key role.
const directResults = [];
for (const model of ['gp29','gp28-f-literal']) {
  for (const sign of [-1,1]) {
    const decoded = [];
    for (let pageIndex = 0; pageIndex < 16; pageIndex++) {
      const original = pages[pageIndex].indices;
      const key = keys[pageIndex];
      const stream = Buffer.from(Array.from(
        {length: original.length}, (_,i) => key[i % 16]));
      const plain = convert(original, stream, sign, model);
      assert.deepEqual(convert(plain, stream, -sign, model), original);
      const p = native[pageIndex];
      const controlStream = Buffer.from(Array.from(
        {length:p.length}, (_,i) => key[i % 16]));
      const enc = convert(p, controlStream, -sign, model);
      assert.deepEqual(convert(enc, controlStream, sign, model), p);
      decoded.push(plain);
    }
    const full = decoded.flat();
    const outcome = {
      model, sign,
      completeIoC: coincidence(full),
      p40to53IoC: coincidence(decoded.slice(0,14).flat()),
      p54to55IoC: coincidence(decoded.slice(14).flat()),
      p55IoC: coincidence(decoded[15])
    };
    assert(outcome.completeIoC < 0.046);
    directResults.push(outcome);
  }
}
console.log(JSON.stringify({
  source: 'p15 red-centered, complete 4x4 Fibonacci-prime spiral + unmodified p49-51 32x8 grid',
  hypothesis: '16 keys of 16 native tile bytes, one per original physical floral page; AES-128-CTR/zero-IV and GP29/GP28 additive',
  gridSHA256: crypto.createHash('sha256').update(bytes).digest('hex'),
  firstPageKeyHex: keys[0].toString('hex'),
  runelessP50KeyHex: keys[10].toString('hex'),
  finalP55KeyHex: keys[15].toString('hex'),
  pageKeys: 16,
  sourceTableBytesCoveredOnce: 256,
  originalFloralRunes: raw.length,
  solvedNativeControlIoC: coincidence(control),
  originalCipherIoC: coincidence(raw),
  results,
  directLiteralPageKeyResults: directResults,
  verdict: 'Neither source-spiral page-local AES-128-CTR receiver recovers native GP text. No unknown LP2 plaintext or key authenticated.'
}, null, 2));
