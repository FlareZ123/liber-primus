'use strict';
/**
 * Original-source 2013 DH state vs p27 wing counts / red heading / p29 frame.
 * SFT: node sims/lp2_p27_wing_dh15_19_2_source_sft.cjs
 * This is a *conditional* 2013-DH interpretation, no plaintext decoder.
 *
 * Wing area counts are read from the frozen independent original-JPEG parser
 * sims/lp2_p27_wing_perimeter_sft.py (15 total / 13 rim / 2 internal).
 * This SFT binds those recorded counts to the original JPEG SHA256, derives
 * the DH state from unchanged original GP29/ink sources, and checks unique
 * modular exponent/log predictions and previously reported p27/p55 echo.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {Buffer} */
const read = p => fs.readFileSync(path.join(root, p));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const originalWingHash = crypto.createHash('sha256')
  .update(read('resources/liber-primus/44.jpg')).digest('hex');
assert.equal(originalWingHash,
  'c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e');
const wing = { total: 15, perimeter: 13, interior: 2 };
assert.equal(wing.total, wing.perimeter + wing.interior);
const pg27 = ink.pages.find(p => p.page === 27);
assert(pg27);
assert.equal(pg27.red_spans.length, 1);
const heading = pg27.red_spans[0];
assert.equal(heading.start, 0);
assert.equal(heading.length, 19);
assert.deepEqual(pg27.large_punctuation, [[19, 13, 'red']]);
const allRed = ink.pages.flatMap(p =>
  (p.red_spans || []).map(v => ({ page: p.page, length: v.length })));
assert.deepEqual(allRed.filter(x => x.length === 19), [{ page: 27, length: 19 }]);
const p27 = corpus.pages[27].indices;
const p29 = corpus.pages[29].indices;
const p39 = corpus.pages[39].indices;
const mod = x => ((x % 29) + 29) % 29;
/** @param {number} x @param {number} n @param {number} p @returns {number} */
function pow(x, n, p) {
  let result = 1;
  for (let i = 0; i < n; i++) result = (result * x) % p;
  return result;
}
const [K, p, a] = p29.slice(0, 3);
const [negativeK, g, b] = p39.slice(119, 122);
assert.deepEqual([K, p, a], [2, 23, 6]);
assert.deepEqual([negativeK, g, b], [27, 5, 15]);
assert.equal(mod(-K), negativeK);
assert.equal(b, wing.total);
const A = pow(g, a, p), B = pow(g, b, p);
assert.deepEqual([A, B], [8, 19]);
assert.equal(pow(A, b, p), K);
assert.equal(pow(B, a, p), K);
assert.equal(B, heading.length);
assert.equal(K, wing.interior);
assert.equal(wing.perimeter, b - K);
const order = Array.from({ length: p - 1 }, (_, i) => i + 1)
  .find(i => pow(g, i, p) === 1);
assert.equal(order, 22); // g is primitive modulo 23
const discreteLogs = Array.from({ length: order }, (_, i) => i)
  .filter(i => pow(g, i, p) === heading.length);
assert.deepEqual(discreteLogs, [b]);
assert.notEqual(pow(g, wing.total - 1, p), heading.length);
assert.notEqual(pow(g, wing.perimeter, p), heading.length);
assert.deepEqual(p29.slice(-5),
  [mod(A - B), mod(K * a), a, A, B]);
// Existing independently reported p27->p55->solved p56 seam.
assert.equal(p27.length, 234);
assert.equal(p27.slice(19, 34).length, b);
assert.deepEqual(p27.slice(28, 34), corpus.pages[55].indices.slice(70, 76));
assert.equal(p27[34], corpus.pages[56].indices[0]);
const seenAsNeighbor = corpus.pages.filter(x =>
  x.page <= 55 && x.indices.some((v, i) =>
    i + 6 < x.indices.length &&
    x.indices.slice(i, i + 7).join(',') ===
    p27.slice(28, 35).join(','))).map(x => x.page);
assert(seenAsNeighbor.includes(27));
console.log(JSON.stringify({
  passed: true,
  classification: 'conditional exact cross-page DH and ink-geometry observation; no authentic cipher or plaintext',
  immutableWingHash: originalWingHash,
  physical: { totalFaces: wing.total, rimFaces: wing.perimeter,
    enclosedInteriorFaces: wing.interior, headingRedRunes: heading.length,
    redHeadingsWith19Runes: allRed.filter(x => x.length === 19),
    punctuationBoundary: 19 },
  sourceDH: { p, g, a, b, A, B, K, negativeK, primitiveOrder: order,
    exponentFromRedHeading: discreteLogs },
  sourceEcho: { p27FifteenHopEnd: 34, matchingP55LastSix: true,
    p27NextMatchesSolvedP56First: true, directOccurrences: seenAsNeighbor }
}, null, 2));
