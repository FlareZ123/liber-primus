'use strict';

/**
 * SFT: examine the 128+128 glyph layout selected by the two original
 * LP2 moth illustrations and p54's enlarged red A, versus the 32x8 table.
 * Reversible direct GP29 byte-residue gate; no plaintext/key claim.
 *
 * Run: node sims/lp2_moth128_red51_terminal256_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = read('lp2-corpus.json');
const grid = read('lp2-grid-256.json');
const ink = read('lp2-ink-annotations.json');
const get = (p) => corpus.pages[p].indices;
const p53 = get(53);
const p54 = get(54);
const p55 = get(55);
const mark53 = ink.pages.find((p) => p.page === 53).red_spans;
const mark54 = ink.pages.find((p) => p.page === 54).red_spans;
const mod = (v) => ((v % 29) + 29) % 29;
const ioc = (xs) => {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (xs.length * (xs.length - 1));
};
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

assert.deepEqual([p53.length, p54.length, p55.length], [179, 232, 76]);
assert.equal(mark53.length, 1);
assert.deepEqual([mark53[0].start, mark53[0].length], [128, 51]);
assert.deepEqual([mark54[0].start, mark54[0].length], [0, 9]);
assert.equal(p54[0], 24); // ᚪ, GP A: an enlarged original red drop capital
assert.equal(grid.bytes.length, 256);
assert.equal(grid.pages.reduce((sum, page) => sum + page.bytes.length, 0), 256);
assert.equal(sha256(Buffer.from(grid.bytes)),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

for (const [p, expected] of [
  [70, '4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548'],
  [71, 'dbc2cfca46a150689e60ea83015dcd54ace81245711fefe114d6076b96412ec4'],
  [72, 'a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba'],
]) {
  assert.equal(sha256(fs.readFileSync(path.join(root, String(p) + '.jpg'))), expected);
}

// The two moth-bearing pages supply 179+76 glyphs. Add only the
// oversized p54 A, which is independently visually distinguished.
const halfBlack = p53.slice(0, 128);
const halfOther = [...p53.slice(128), p54[0], ...p55];
assert.deepEqual([halfBlack.length, halfOther.length], [128, 128]);
const carrier = [...halfBlack, ...halfOther];
assert.equal(carrier.length, 256);
const equalityCount = halfBlack.filter((x, i) => x === halfOther[i]).length;
assert.equal(equalityCount, 2);

const native = get(57);
assert.equal(native.length, 95);
const plant = Array.from({ length: 256 }, (_, i) => native[i % native.length]);
const result = { source: {
  input: 'p53[0:179] + p54[0] + p55[0:76]', glyphs: carrier.length,
  black: 128, other: 128, paired_equal: equalityCount,
  grid_cells: 256, raw_ioc: ioc(carrier),
}, candidates: [] };

for (const sign of [-1, 1]) {
  const key = grid.bytes.map((byte) => byte % 29);
  const decrypt = (ct) => ct.map((c, i) => mod(c + sign * key[i]));
  const encrypt = (plain) => plain.map((p, i) => mod(p - sign * key[i]));
  const output = decrypt(carrier);
  assert.deepEqual(encrypt(output), carrier);
  assert.deepEqual(decrypt(encrypt(plant)), plant);
  const entry = {
    sign, decoded_ioc: ioc(output),
    p53_ioc: ioc(output.slice(0, 179)),
    p55_ioc: ioc(output.slice(180)),
    p54_first_decoded_gp_index: output[179],
    first40_gp: output.slice(0, 40).map((v) => corpus.translit[v]).join(' '),
    plant_exact: true,
  };
  result.candidates.push(entry);
}
assert(Math.abs(result.candidates[0].decoded_ioc - 0.03425245098039216) < 1e-12);
assert(Math.abs(result.candidates[1].decoded_ioc - 0.0328125) < 1e-12);
console.log(JSON.stringify(result, null, 2));
