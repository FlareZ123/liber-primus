'use strict';
/**
 * Original-source LP2 floral constant-key test. The identical left/right
 * flower masks on p40..55 select the SAME p50 table rows 22 and 31
 * throughout the complete 3316-rune group, with either page-reset or
 * continuous key clocks. No new key schedule, arbitrary phase or key fit.
 * Windows Node 22: node sims/lp2_floral_branch22_static_two_row_key_source_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(path.join(root, 'lp2-grid-256.json'), 'utf8')).bytes;
assert.equal(table.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(table)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const key = Buffer.from([...table.slice(22 * 8, 22 * 8 + 8),
  ...table.slice(31 * 8, 31 * 8 + 8)]);
assert.equal(key.toString('hex'), 'eb83a6af9028a751719eace6b424bd50');
const original = corpus.pages.slice(40, 56).map(p => p.indices);
assert.equal(original.reduce((v, p) => v + p.length, 0), 3316);
assert.equal(original[10].length, 0);
const known = corpus.pages[57].indices;
assert.equal(known.length, 95);
/** @param {number} x @param {number} m */
function mod(x, m) { return ((x % m) + m) % m; }
/**
 * @param {number[][]} parts
 * @param {number} ring
 * @param {number} sign
 * @param {boolean} reset
 */
function inverse(parts, ring, sign, reset) {
  let tick = 0;
  return parts.map(part => {
    if (reset) tick = 0;
    return part.map(c => {
      if (ring === 28 && c === 0) return 0;
      const k = key[tick++ % key.length] % ring;
      return ring === 29 ? mod(c + sign * k, 29) :
        mod(c - 1 + sign * k, 28) + 1;
    });
  });
}
/** @param {number[]} arr */
function ioc(arr) {
  const counts = Array(29).fill(0);
  for (const v of arr) counts[v]++;
  return counts.reduce((s, x) => s + x * (x - 1), 0) /
    (arr.length * (arr.length - 1));
}
const rows = [];
for (const ring of [29, 28]) {
  for (const sign of [-1, 1]) {
    for (const reset of [true, false]) {
      const recovered = inverse(original, ring, sign, reset);
      assert.deepEqual(inverse(recovered, ring, -sign, reset), original);
      const plant = original.map(p => p.map((_, i) => known[i % 95]));
      const enc = inverse(plant, ring, -sign, reset);
      assert.deepEqual(inverse(enc, ring, sign, reset), plant);
      const all = recovered.flat();
      rows.push({ring, sign, reset,
        fullIoc: ioc(all),
        floral14Ioc: ioc(recovered.slice(0, 14).flat()),
        p54p55Ioc: ioc(recovered.slice(14).flat()),
        gpPrefix: recovered[0].slice(0, 24)
          .map(i => corpus.translit[i]).join('-')});
    }
  }
}
assert.equal(rows.length, 8);
assert.ok(Math.abs(rows[0].fullIoc - 0.034559437582214844) < 1e-12);
assert.ok(Math.abs(rows[3].fullIoc - 0.034651681958855735) < 1e-12);
assert.ok(Math.abs(rows[7].fullIoc - 0.034406788603907744) < 1e-12);
assert.ok(rows.every(r => r.fullIoc < 0.04));
console.log(JSON.stringify({
  result: 'PASS / no original plaintext under fixed 22+31 static key',
  sourceBytes: 16, originalRunes: 3316, variants: rows
}, null, 2));
