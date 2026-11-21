'use strict';

// Source-locked direct test of the base59 table's parent-address key on p55.
// Run from repository root with Node 22:
//   node sims/lp2_p55_base59_parent_address_key_sft.cjs

const assert = require('node:assert/strict');
const fs = require('node:fs');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const grid = JSON.parse(fs.readFileSync('resources/liber-primus/base60-grid.json', 'utf8'));
const page = n => corpus.pages.find(p => p.page === n).indices;
const p55 = page(55), p56 = page(56), p57 = page(57);
assert.deepEqual([p55.length, p56.length, p57.length], [76, 85, 95]);

const alphabet59 = grid.alphabet.replace('f', '');
assert.equal(alphabet59.length, 59);
const parent = grid.rows.flat().map(token => {
  const n = alphabet59.indexOf(token[0]) * 59 + alphabet59.indexOf(token[1]);
  assert.ok(n >= 0 && n < 256);
  return n;
});
const root = parent.findIndex((v, i) => v === i);
assert.equal(root, 189);
assert.equal(grid.rows.flat()[root], '3C');

const children = Array.from({ length: 256 }, () => []);
for (let i = 0; i < 256; i++) if (i !== root) children[parent[i]].push(i);
const leaves = new Set(children.map((xs, i) => xs.length === 0 ? i : null).filter(x => x !== null));
assert.equal(leaves.size, 95);

const W = 8, H = 32, perimeter = [], interior = [];
for (let x = 0; x < W; x++) perimeter.push(x);
for (let y = 1; y < H - 1; y++) perimeter.push(y * W + W - 1);
for (let x = W - 1; x >= 0; x--) perimeter.push((H - 1) * W + x);
for (let y = H - 2; y >= 1; y--) perimeter.push(y * W);
for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) interior.push(y * W + x);
assert.deepEqual([perimeter.length, interior.length], [76, 180]);

const pset = new Set(perimeter), iset = new Set(interior);
const counts = {
  perimeterLeaves: perimeter.filter(i => leaves.has(i)).length,
  perimeterInternal: perimeter.filter(i => !leaves.has(i)).length,
  interiorLeaves: interior.filter(i => leaves.has(i)).length,
  interiorInternal: interior.filter(i => !leaves.has(i)).length
};
assert.deepEqual(counts, {
  perimeterLeaves: 27, perimeterInternal: 49,
  interiorLeaves: 68, interiorInternal: 112
});

const key = perimeter.map(i => parent[i] % 29);
const translit = values => values.map(v => corpus.translit[v]).join('');
const wordLengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(wordLengths.length, 17);
assert.equal(wordLengths.reduce((a, b) => a + b, 0), 76);
const words = values => {
  let offset = 0;
  return wordLengths.map(n => {
    const word = translit(values.slice(offset, offset + n));
    offset += n;
    return word;
  });
};
function decrypt(sign, transparentF) {
  return p55.map((cipher, i) => transparentF && cipher === 0
    ? 0
    : (cipher + sign * key[i] + 2900) % 29);
}
const results = {
  subtract: decrypt(-1, false),
  add: decrypt(1, false),
  subtractFpass: decrypt(-1, true),
  addFpass: decrypt(1, true)
};
const actual = Object.fromEntries(Object.entries(results).map(([k, v]) => [k, translit(v)]));
const expected = {
  subtract: 'AUFUIAXNHPTYUGIRIREJCRFBDDBTHIAUHUAETAETXDFTHSGYDPUISUMDEOXXAETXEBANGDOBEMDSOUAEGMRYSG',
  add: 'ELNMTTAELAEXIAJJDBMNGUDCIAXLJREOYOEHDNUFBAISUSILOJODFNGHPHIAXTXOEEOWNEOPIATYLRCGNOJOIAHNGX',
  subtractFpass: 'AUFUIAXNHPTYUGIRFREJCRFBDDFTHIAUHUAETAETXDFTHSGFDPUISUMDEOXXAETXEBANGDOBEMDSOUAEGMRYSG',
  addFpass: 'ELNMTTAELAEXIAJJDBFNGUDCIAXLJRFYOEHDNUFBAISUSILFJODFNGHPHIAXTXOEEOWNEOPIATYLRCGNOJOIAHNGX'
};
assert.deepEqual(actual, expected);
console.log(JSON.stringify({
  classification: 'bounded negative: direct parent-address modulo-29 Vigenere key does not recover p55 plaintext',
  root, rootToken: grid.rows.flat()[root], key: translit(key), intersections: counts,
  outputs: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, { text: translit(v), words: words(v) }]))
}, null, 2));
