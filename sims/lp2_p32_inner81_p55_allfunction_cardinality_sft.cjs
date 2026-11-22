/**
 * Source-only exact type-capacity theorem for the p32 tree 11x11 peeled to
 * its 9x9 interior vs the p55 76-rune tree page.
 *
 * Model: delete any 5 of the 81 peeled symbols, map each remaining GP29
 * input symbol through any one arbitrary deterministic 29->29 function
 * (not required to be bijective), then reorder the output arbitrarily.
 * An independent 75-rune intact p55-body register allows 6 deletions.
 *
 * The theorem rejects ALL secret functions and EVERY choice of omitted
 * positions without enumerating them. It does not assume English,
 * plaintext frequency, an affine cipher, encryption direction or a key.
 *
 * Windows 11, Node 22, CommonJS, read-only source-native test.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.runes.length, 29);

const p32 = corpus.pages.find(page => page.page === 32).indices;
const p55 = corpus.pages.find(page => page.page === 55).indices;
assert.equal(p32.length, 121, 'original p32 11x11 source runes');
assert.equal(p55.length, 76, 'original physical p55 all runes');
const inner = Array.from({ length: 9 }, (_, y) =>
  p32.slice((y + 1) * 11 + 1, (y + 1) * 11 + 10)
).flat();
assert.equal(inner.length, 81, 'one exact visible circumference removed');

/** @param {number[]} runes @returns {number[]} */
function counts(runes) {
  const hist = Array(29).fill(0);
  for (const rune of runes) {
    assert.ok(Number.isInteger(rune) && rune >= 0 && rune < 29);
    hist[rune]++;
  }
  return hist;
}

/** @param {number[]} runes */
function profile(runes) {
  const hist = counts(runes);
  return {
    n: runes.length,
    distinct: hist.filter(count => count > 0).length,
    high5: hist.filter(count => count >= 5).length,
    sortedCounts: hist.filter(Boolean).sort((a, b) => b - a)
  };
}

/**
 * The bound holds under ANY omissions, any deterministic (possibly
 * many-to-one) symbol map, and any permutation of output positions.
 *
 * Proof: write s for number of input types before deletion; h for
 * number with count >=5. Omissions cannot increase either number.
 * After deletion, let s'<=s types survive and let t output types
 * occur. Every output high type either inherits at least one input
 * high type, or merges >=2 input low types. Each latter case costs
 * at least one of the s'-t surplus type mergers. So H<=h+(s'-t)
 * <=h+(s-t), independent of every hidden mapping and deletion.
 *
 * @param {number[]} source
 * @param {number[]} target
 */
function testCapacity(source, target) {
  assert.ok(target.length <= source.length);
  const before = profile(source);
  const after = profile(target);
  assert.ok(before.distinct >= after.distinct,
    'target distinct count already exceeds source');
  const maxTargetHigh5 = before.high5 + before.distinct - after.distinct;
  return { before, after, maxTargetHigh5,
    exceedsCapacity: after.high5 > maxTargetHigh5,
    requiredExtraHighClasses: after.high5 - maxTargetHigh5 };
}

const full = testCapacity(inner, p55);
const intact = testCapacity(inner, p55.slice(1));
assert.deepEqual(
  [full.before.n, full.before.distinct, full.before.high5],
  [81, 28, 3]
);
for (const result of [full, intact]) {
  assert.equal(result.after.distinct, 25);
  assert.equal(result.after.high5, 7);
  assert.equal(result.maxTargetHigh5, 6);
  assert.equal(result.requiredExtraHighClasses, 1);
  assert.equal(result.exceedsCapacity, true);
}
assert.equal(full.after.n, 76);
assert.equal(intact.after.n, 75);

/*
 * Tight positive construction on the EXACT original 81 symbols:
 * merge 3 genuine singleton source types into 3 genuine count-4
 * source types, creating 3 additional count-5 output types while
 * retaining the 3 original high types. Delete one occurrence of
 * each of five distinct count-3 types, with no type disappearing.
 * It is an ordinary many-to-one function plus 5 deletions, with
 * no fitted or fabricated source glyphs.
 */
const sourceHistogram = counts(inner);
const singletons = sourceHistogram.map((count, id) => ({ count, id }))
  .filter(x => x.count === 1).map(x => x.id);
const fours = sourceHistogram.map((count, id) => ({ count, id }))
  .filter(x => x.count === 4).map(x => x.id);
const threes = sourceHistogram.map((count, id) => ({ count, id }))
  .filter(x => x.count === 3).map(x => x.id);
assert.ok(singletons.length >= 3 && fours.length >= 3 && threes.length >= 5);
const mapping = Array.from({ length: 29 }, (_, i) => i);
for (let i = 0; i < 3; i++) mapping[singletons[i]] = fours[i];
const deletionOnce = new Set(threes.slice(0, 5));
const planted = [];
for (const rune of inner) {
  if (deletionOnce.has(rune)) {
    deletionOnce.delete(rune);
    continue;
  }
  planted.push(mapping[rune]);
}
assert.equal(deletionOnce.size, 0);
const positive = testCapacity(inner, planted);
assert.equal(positive.after.n, 76);
assert.equal(positive.after.distinct, 25);
assert.equal(positive.after.high5, 6);
assert.equal(positive.maxTargetHigh5, 6);
assert.equal(positive.exceedsCapacity, false);
assert.equal(positive.requiredExtraHighClasses, 0);

console.log('P32_TREE_P55_ANY_DETERMINISTIC_SYMBOL_MAP_BOUND', JSON.stringify({
  model: 'source81 remove circumference; delete 5 or 6 cells; arbitrary 29-symbol function and output order',
  originalSource: full.before,
  originalP55Full: full.after,
  originalP55Intact: intact.after,
  maximumPossibleP55HighCount: full.maxTargetHigh5,
  observedP55HighCount: full.after.high5,
  conclusion: 'ALL deterministic 29->29 static symbol maps impossible, even noninjective',
  exactSourcePositiveBoundIsTight: positive,
  excludedInputDeletedCells: [full.before.n - full.after.n, intact.before.n - intact.after.n],
}, null, 2));
