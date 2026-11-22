'use strict';

/**
 * Original LP2 p33–39 versus the period 2014 7x7 magic-square rows.
 * Exact, fixed row-to-page assignment and page-local modulo-7 key clocks.
 * This is a bounded GP29 additive gate, not a recovered plaintext or key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const square = [
  [7, 375, 236, 190, 27, 17, 181],
  [351, 223, 14, 47, 293, 98, 7],
  [456, 232, 121, 114, 72, 23, 15],
  [16, 65, 270, 331, 270, 65, 16],
  [15, 23, 72, 114, 121, 232, 456],
  [7, 98, 293, 47, 14, 223, 351],
  [181, 17, 27, 190, 236, 375, 7],
];
const pages = Array.from({ length: 7 }, (_, i) => {
  const p = corpus.pages.find((entry) => entry.page === 33 + i);
  assert.ok(p, 'Missing original LP2 page ' + (33 + i));
  return p;
});
const sourceLengths = [214, 261, 271, 238, 228, 228, 240];
assert.deepEqual(pages.map((p) => p.indices.length), sourceLengths);
assert.equal(square.flat().length, 49);
assert.equal(square.flat().every(Number.isInteger), true);
assert.deepEqual(square.map((row) => row.reduce((a, b) => a + b, 0)), Array(7).fill(1033));

/**
 * @param {number} value Original GP29 index.
 * @param {number} key Historical 2014 square value.
 * @param {number} sign +1 or -1.
 * @returns {number} GP29 index.
 */
function transform(value, key, sign) {
  return ((value + sign * (key % 29)) % 29 + 29) % 29;
}

/**
 * @param {number[]} indices
 * @returns {number}
 */
function indexOfCoincidence(indices) {
  const counts = Array(29).fill(0);
  indices.forEach((i) => {
    assert.ok(Number.isInteger(i) && i >= 0 && i < 29);
    counts[i] += 1;
  });
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (indices.length * (indices.length - 1));
}

const original = pages.flatMap((p) => p.indices);
assert.equal(original.length, 1680);
assert.ok(Math.abs(indexOfCoincidence(original) - 0.03436002155478034) < 1e-14);
const clear = corpus.pages.find((p) => p.page === 57);
assert.equal(clear.indices.length, 95);
console.log('Original p33–39 GP29 IoC:', indexOfCoincidence(original).toFixed(12));
console.log('Authentic solved clear p57 IoC:', indexOfCoincidence(clear.indices).toFixed(12));

for (const sign of [-1, 1]) {
  const decoded = pages.map((p, pageIndex) => p.indices.map((c, i) =>
    transform(c, square[pageIndex][i % 7], sign)));
  const inverse = decoded.map((v, pageIndex) => v.map((c, i) =>
    transform(c, square[pageIndex][i % 7], -sign)));
  assert.deepEqual(inverse, pages.map((p) => p.indices));

  // A 1,680-sign source-native GP29 positive plant; independent of original cipher.
  const positive = pages.map((p) => p.indices.map((_, i) =>
    clear.indices[i % clear.indices.length]));
  const encoded = positive.map((part, pageIndex) => part.map((v, i) =>
    transform(v, square[pageIndex][i % 7], -sign)));
  const recovered = encoded.map((part, pageIndex) => part.map((v, i) =>
    transform(v, square[pageIndex][i % 7], sign)));
  assert.deepEqual(recovered, positive);

  const all = decoded.flat();
  const expected = sign === -1 ? 0.03458336878527468 : 0.034378456564281464;
  assert.ok(Math.abs(indexOfCoincidence(all) - expected) < 1e-14);
  console.log('Sign', sign, 'GP29 IoC', indexOfCoincidence(all).toFixed(12),
    'reencryption', all.length + '/' + original.length,
    'native-positive', positive.flat().length + '/' + original.length);
  decoded.forEach((part, i) => console.log(
    'p' + pages[i].page, part.length,
    'IoC=' + indexOfCoincidence(part).toFixed(9),
    'head=' + part.slice(0, 38).map((v) => corpus.translit[v]).join('')
  ));
}


/**
 * A second, independently natural consumer of the entire printed 7x7 square:
 * flatten all 49 source integers in fixed row-major order and cycle them
 * either across the seven-page chapter or from each physical-page start.
 * No position, sign, or key element is fitted to original ciphertext.
 */
const all49 = square.flat();
for (const clock of ['chapter', 'page']) {
  for (const sign of [-1, 1]) {
    let offset = 0;
    const fullKeyAt = (pageOffset, i) =>
      all49[((clock === 'chapter' ? pageOffset : 0) + i) % 49];
    const decoded = pages.map((p) => {
      const start = offset;
      offset += p.indices.length;
      return p.indices.map((v, i) => transform(v, fullKeyAt(start, i), sign));
    });
    offset = 0;
    const restored = decoded.map((part) => {
      const start = offset;
      offset += part.length;
      return part.map((v, i) => transform(v, fullKeyAt(start, i), -sign));
    });
    assert.deepEqual(restored, pages.map((p) => p.indices));

    offset = 0;
    const planted = pages.map((p) => p.indices.map((_, i) =>
      clear.indices[i % clear.indices.length]));
    const encoded = planted.map((part) => {
      const start = offset;
      offset += part.length;
      return part.map((v, i) => transform(v, fullKeyAt(start, i), -sign));
    });
    offset = 0;
    const recovered = encoded.map((part) => {
      const start = offset;
      offset += part.length;
      return part.map((v, i) => transform(v, fullKeyAt(start, i), sign));
    });
    assert.deepEqual(recovered, planted);

    const observed = indexOfCoincidence(decoded.flat());
    const expected49 = {
      chapter: { '-1': 0.03474928387078476, '1': 0.03436994809835787 },
      page: { '-1': 0.03443943390340055, '1': 0.034385546952551124 },
    };
    assert.ok(Math.abs(observed - expected49[clock][sign]) < 1e-14);
    console.log('Full49', clock, 'sign', sign, 'GP29 IoC', observed.toFixed(12),
      'original reencryption 1680/1680 native positive 1680/1680');
  }
}
