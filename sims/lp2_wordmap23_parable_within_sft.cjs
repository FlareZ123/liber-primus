'use strict';

/**
 * Source-bounded PARABLE "shed circumferences / find within" extraction.
 * Read-only SFT: node sims/lp2_wordmap23_parable_within_sft.cjs
 * Every original GP rune and word boundary is obtained from repository fixtures.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseLP2Words } = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = parseLP2Words(read('resources/lp2-transcription.txt'), 3);
const words = original.words;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
/** @param {string} word */
const sum = (word) => [...word].reduce((s, r) => s + corpus.prime[runeIndex.get(r)], 0);
/** @param {string[]} runes */
const transliterate = (runes) => runes.map((r) => corpus.translit[runeIndex.get(r)]).join('');
/** @param {string[][]} source */
const interior = (source) => source.flatMap((w) => w.slice(1, -1));
/** @param {string[][]} source */
const centerLeft = (source) => source.map((w) => w[Math.floor((w.length - 1) / 2)]);
/** @param {string[][]} source */
const centerRight = (source) => source.map((w) => w[Math.floor(w.length / 2)]);

assert.equal(words.length, 158);
assert.equal(original.runeCount, 729);
const headingSums = words.slice(0, 2).map((w) => sum(w.runes));
assert.deepEqual(headingSums, [347, 315]);
const body = words.slice(2);
assert.equal(body.length, 156);
const sums = body.map((w) => sum(w.runes));
const pointers = sums.map((s) => s % 156);
let at = headingSums[0] % 156;
const order = [];
const seen = new Map();
while (!seen.has(at)) {
  seen.set(at, order.length);
  order.push(at);
  at = pointers[at];
}
const cycle = order.slice(seen.get(at));
assert.equal(cycle.length, 23);
assert.equal(order.length - cycle.length, 3);
assert.ok(cycle.includes(headingSums[1] % 156));
assert.deepEqual(cycle.map((i) => sums[i]), [
  220, 111, 34, 336, 119, 3, 563, 170, 67, 209, 463, 108,
  244, 569, 128, 237, 323, 618, 277, 419, 139, 143, 473
]);
const selected = cycle.map((i) => [...body[i].runes]);
assert.equal(selected.reduce((s, w) => s + w.length, 0), 119);
assert.equal(selected.filter((w) => w.length <= 2).length, 5);
assert.equal(interior(selected).length, 74);

const result = {
  selectedCellsOneBased: cycle.map((i) => i + 1),
  selectedLengths: selected.map((w) => w.length),
  strippedCircumferences74: transliterate(interior(selected)),
  centerLeft23: transliterate(centerLeft(selected)),
  centerRight23: transliterate(centerRight(selected))
};
assert.equal(result.strippedCircumferences74,
  'BNGMJROLTHJIEWBASOEEOINGDOSOEWEAOELFEJEAFINIACYEAIXBGJPFSEOAEPTFPUNGYNGXEAEOLDHBYWCLWEADUD');
assert.equal(result.centerLeft23, 'BFHJJUSDOSEAOJIAEAGSUEADYWEA');
assert.equal(result.centerRight23, 'NEARRJUSDOSEAAEJCWGEOUEADYWEA');

// Real-native-rune positive plants: same complete 23 selected word shapes,
// containing known GP29 runes from p57 at exactly the extraction sites.
const clear = corpus.pages.find((p) => p.page === 57);
assert.equal(clear.status, 'solved');
const known = clear.indices.map((i) => corpus.runes[i]);
const plantedInterior = selected.map((w) => w.map(() => corpus.runes[0]));
let offset = 0;
for (const w of plantedInterior) {
  for (let i = 1; i < w.length - 1; i++) w[i] = known[offset++];
}
assert.equal(offset, 74);
assert.deepEqual(interior(plantedInterior), known.slice(0, 74));
for (const [indexer, collector] of [
  [/** @param {number} n */ (n) => Math.floor((n - 1) / 2), centerLeft],
  [/** @param {number} n */ (n) => Math.floor(n / 2), centerRight]
]) {
  const plant = selected.map((w) => w.map(() => corpus.runes[0]));
  plant.forEach((w, i) => { w[indexer(w.length)] = known[i]; });
  assert.deepEqual(collector(plant), known.slice(0, 23));
}

console.log(JSON.stringify(result, null, 2));
console.log('PASS: authentic source 23-cycle, all 119 original selected runes, 74/23/23 exact readouts, three source-native plants.');
