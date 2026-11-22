'use strict';
/**
 * Exact read-only LP2 p40–55 original-rune test of conditional
 * floral-stem gap -> clockwise 10110₂=22; right=11111₂=31;
 * two source-motivated minimal +/-2 row strides mod32; 16 original 16-byte records.
 *
 * This operation is a deliberately frozen DIRECT additive receiver,
 * not an authenticated creator cipher. It contains no key guessing.
 * Windows Node22: node sims/lp2_floral_branch22_two_row_source_receiver_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(path.join(root, 'lp2-grid-256.json'), 'utf8')).bytes;
assert.equal(table.length, 256);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(table)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);
assert.equal(corpus.translit.length, 29);
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.pages[57].indices.length, 95);

/**
 * Five site bits in original top-right-bottom-left ring order.
 * Original left printed 01101₂; the branch attaches at the GAP
 * between last and penultimate sites, so a clockwise entry begins
 * at site4, giving 10110₂, rather than the top-first 01101₂.
 * Clockwise is a hypothesis, not an arrow printed on the page.
 */
const leftBits = [0, 1, 1, 0, 1];
const branchTipClockwiseBits = [4, 0, 1, 2, 3].map(i => leftBits[i]);
assert.equal(parseInt(branchTipClockwiseBits.join(''), 2), 22);
const startLeft = 22;
const startRight = 31;

/** @param {number} i - zero-based illustrated page index p40..p55 */
function tableRowPair(i, leftStep, rightStep) {
  return [
    ((startLeft + leftStep * i) % 32 + 32) % 32,
    ((startRight + rightStep * i) % 32 + 32) % 32
  ];
}
/** @param {number} i - zero-based illustrated page index p40..p55 */
function keyFor(i, leftStep, rightStep) {
  const [left, right] = tableRowPair(i, leftStep, rightStep);
  return [
    ...table.slice(8 * left, 8 * left + 8),
    ...table.slice(8 * right, 8 * right + 8)
  ];
}
for (const leftStep of [-2, 2]) {
  for (const rightStep of [-2, 2]) {
    const allRows = Array.from({length: 16}, (_, i) =>
      tableRowPair(i, leftStep, rightStep)).flat();
    assert.equal(new Set(allRows).size, 32);
    assert.deepEqual(tableRowPair(0, leftStep, rightStep), [22, 31]);
    assert.equal(Buffer.from(keyFor(0, leftStep, rightStep)).toString('hex'),
      'eb83a6af9028a751719eace6b424bd50');
  }
}
assert.deepEqual(tableRowPair(15, 2, 2), [20, 29]);

/** @param {number} value @param {number} mod */
function positiveMod(value, mod) { return ((value % mod) + mod) % mod; }
/**
 * The inverse of two exact, source-motivated family members:
 * ring=29 is the ordinary published GP modular addition;
 * ring=28 reserves literal F=0 without advancing the key clock.
 * @param {number[]} letters - original or synthetic ciphertext
 * @param {number[]} key - exactly 16 printed source table bytes
 * @param {number} ring - 29 or 28
 * @param {number} sign - -1 or +1
 * @returns {number[]} unchanged-length recovered GP rune indices
 */
function transform(letters, key, ring, sign) {
  let tick = 0;
  return letters.map(c => {
    if (ring === 28 && c === 0) return 0;
    const k = key[tick % 16] % ring;
    tick += 1;
    return ring === 29 ? positiveMod(c + sign * k, 29) :
      positiveMod(c - 1 + sign * k, 28) + 1;
  });
}
/** @param {number[]} letters */
function ioc(letters) {
  const counts = Array(29).fill(0);
  for (const x of letters) counts[x] += 1;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (letters.length * (letters.length - 1));
}
const original = corpus.pages.slice(40, 56);
assert.equal(original.length, 16);
assert.ok(original.every((p, i) => p.page === 40 + i));
assert.equal(original.reduce((s, p) => s + p.indices.length, 0), 3316);
assert.equal(original.slice(0, 14).reduce((s, p) => s + p.indices.length, 0), 3008);
assert.equal(original[10].indices.length, 0); // runeless p50 record
const known = corpus.pages[57].indices;

const results = [];
for (const leftStep of [-2, 2]) {
  for (const rightStep of [-2, 2]) {
    for (const ring of [29, 28]) {
      for (const sign of [-1, 1]) {
        const decoded = original.map((p, i) => {
          const key = keyFor(i, leftStep, rightStep);
          const out = transform(p.indices, key, ring, sign);
          // Exact full original ciphertext replay under one fixed page clock.
          assert.deepEqual(transform(out, key, ring, -sign), p.indices);
          const plant = Array.from({length: p.indices.length},
            (_, j) => known[j % known.length]);
          const encPlant = transform(plant, key, ring, -sign);
          assert.deepEqual(transform(encPlant, key, ring, sign), plant);
          return out;
        });
        const chapter = decoded.flat();
        const lead = decoded.slice(0, 14).flat();
        const terminal = decoded.slice(14).flat();
        const row = {
          leftStep, rightStep, ring, sign,
          counts: [chapter.length, lead.length, terminal.length],
          allIoc: ioc(chapter), openingIoc: ioc(lead),
          terminalIoc: ioc(terminal),
          firstTwentyGP: decoded[0].slice(0, 20)
            .map(i => corpus.translit[i]).join('-')
        };
        results.push(row);
        assert.ok(row.allIoc < 0.04);
        assert.ok(row.openingIoc < 0.04);
      }
    }
  }
}
assert.equal(results.length, 16);
const find = (leftStep, rightStep, ring, sign) => results.find(r =>
  r.leftStep === leftStep && r.rightStep === rightStep &&
  r.ring === ring && r.sign === sign);
assert.ok(Math.abs(find(2, 2, 29, -1).allIoc - 0.03435202419095132) < 1e-12);
assert.ok(Math.abs(find(2, 2, 29, +1).allIoc - 0.03444681574959017) < 1e-12);
assert.ok(Math.abs(find(2, 2, 28, -1).allIoc - 0.034542517016085454) < 1e-12);
assert.ok(Math.abs(find(2, 2, 28, +1).allIoc - 0.03457890533034221) < 1e-12);
assert.ok(Math.abs(Math.min(...results.map(r => r.allIoc)) -
  0.03426196311316584) < 1e-12);
assert.ok(Math.abs(Math.max(...results.map(r => r.allIoc)) -
  0.03460110220203884) < 1e-12);
console.log(JSON.stringify({
  result: 'PASS / no coherent plaintext under any four minimal stride orientations',
  originalSourcePositions: 3316,
  all256TableCellsAllocatedExactlyOncePerStride: true,
  unusedRecord: 'physical p50 has no GP runes',
  variants: results
}, null, 2));
