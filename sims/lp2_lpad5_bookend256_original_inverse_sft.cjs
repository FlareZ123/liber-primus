'use strict';

/**
 * Original-LP2 LPAD5, 6395-rune bookend, 256-byte grid alignment test.
 * Intended as a source-constrained failed direct inverse, not plaintext.
 * Run: node sims/lp2_lpad5_bookend256_original_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const load = (name) => JSON.parse(fs.readFileSync(path.join(base, name), 'utf8'));
const corpus = load('lp2-corpus.json');
const table = load('base60-grid.json').byte_rows.flat();
const ink = load('lp2-ink-annotations.json');
const unknown = corpus.pages.filter((page) => page.page <= 55).flatMap((page) => page.indices);
assert.equal(table.length, 256);
assert.equal(unknown.length, 12956);

// GP runes themselves determine the historically visible bookend.
const a = 6555;
const b = 12950;
const echo = unknown.slice(a, a + 6);
assert.deepEqual(echo, unknown.slice(b, b + 6));
assert.deepEqual(echo.map((v) => corpus.translit[v]), ['D', 'J', 'U', 'B', 'E', 'I']);
assert.equal(b - a, 6395);

// The independent five-dot stencil and chapter LPAD acrostic.
const redStarts = ink.pages.filter((p) => p.page >= 3 && p.page <= 7)
  .flatMap((p) => (p.red_spans || []).map((sp) => corpus.translit[corpus.pages[p.page].indices[sp.start]]));
assert.deepEqual(redStarts, ['L', 'P', 'A', 'D']);
const padding = 5;
assert.equal(b - a + padding, 25 * table.length);

const keyAt = (pos) => table[((pos % 256) + 256) % 256] % 29;
const echoKey27 = echo.map((_, i) => keyAt(a + i));
const echoKey55 = echo.map((_, i) => keyAt(b + padding + i));
assert.deepEqual(echoKey27, echoKey55);
assert.deepEqual(echoKey27, [25, 23, 19, 17, 16, 1]);

const mod29 = (x) => ((x % 29) + 29) % 29;
const echoSubtract = echo.map((x, i) => mod29(x - echoKey27[i]));
const echoAdd = echo.map((x, i) => mod29(x + echoKey27[i]));
assert.deepEqual(echoSubtract.map((v) => corpus.translit[v]), ['IA', 'B', 'J', 'F', 'TH', 'N']);
assert.deepEqual(echoAdd.map((v) => corpus.translit[v]), ['M', 'C', 'L', 'C', 'C', 'J']);

// The p55 terminal phrase actually continues for one more rune at the
// start of the independently solved p56. This is the source-original
// seven-rune seam, whose seventh plaintext rune is known to be A.
const printedP56 = corpus.pages[56].indices;
assert.equal(corpus.translit[printedP56[0]], 'AE');
assert.equal(corpus.translit[unknown[a + 6]], 'AE');
assert.deepEqual(unknown.slice(a, a + 7), [...unknown.slice(b, b + 6), printedP56[0]]);
const seventhIndex = (a + 6) % 256;
assert.equal(seventhIndex, (b + 6 + padding) % 256);
assert.equal(seventhIndex, 161);
const seventhKey = keyAt(seventhIndex);
const authenticPlain = corpus.translit.indexOf('A');
assert.equal(seventhKey, 14);
assert.equal(authenticPlain, 24);
assert.equal(mod29(printedP56[0] - authenticPlain), 1);
const seventhSub = mod29(printedP56[0] - seventhKey);
const seventhAdd = mod29(printedP56[0] + seventhKey);
assert.equal(corpus.translit[seventhSub], 'J');
assert.equal(corpus.translit[seventhAdd], 'I');
assert.notEqual(seventhSub, authenticPlain);
assert.notEqual(seventhAdd, authenticPlain);


const starts = new Map();
let runes = 0;
for (const page of corpus.pages) {
  starts.set(page.page, runes);
  runes += page.indices.length;
}
assert.equal(starts.get(27), 6527);
assert.equal(starts.get(55), 12880);

/** @param {number[]} items */
const ioc = (items) => {
  const histogram = Array(29).fill(0);
  for (const v of items) histogram[v]++;
  return histogram.reduce((s, n) => s + n * (n - 1), 0) / (items.length * (items.length - 1));
};
const results = {};
for (const sign of [-1, 1]) {
  const p27 = corpus.pages[27].indices;
  const p55 = corpus.pages[55].indices;
  const key27 = p27.map((_, i) => keyAt(starts.get(27) + i));
  const key55 = p55.map((_, i) => keyAt(starts.get(55) + padding + i));
  const out27 = p27.map((x, i) => mod29(x + sign * key27[i]));
  const out55 = p55.map((x, i) => mod29(x + sign * key55[i]));
  assert.deepEqual(out27.map((v, i) => mod29(v - sign * key27[i])), p27);
  assert.deepEqual(out55.map((v, i) => mod29(v - sign * key55[i])), p55);
  results[sign] = {
    p27Ioc: ioc(out27),
    p55Ioc: ioc(out55),
    p27Opening: out27.slice(0, 24).map((v) => corpus.translit[v]).join(' '),
    p55Opening: out55.slice(0, 24).map((v) => corpus.translit[v]).join(' ')
  };
}
assert(Math.abs(results[-1].p27Ioc - 0.03415135174791827) < 1e-14);
assert(Math.abs(results[-1].p55Ioc - 0.027017543859649124) < 1e-14);
assert(Math.abs(results[1].p27Ioc - 0.03741608891823484) < 1e-14);
assert(Math.abs(results[1].p55Ioc - 0.04105263157894737) < 1e-14);

console.log(JSON.stringify({
  sourceClues: { acrostic: redStarts.join(''), fiveDots: padding, lag: b - a, tableSize: table.length, alignedLag: b - a + padding },
  echo: { cipher: echo.map((v) => corpus.translit[v]), key: echoKey27, subtract: echoSubtract.map((v) => corpus.translit[v]), add: echoAdd.map((v) => corpus.translit[v]) },
  seventhSeam: { sourceRune: 'AE', independentlySolvedRune: 'A', requiredSubtractKey: 1, actualKey: seventhKey, subtract: corpus.translit[seventhSub], add: corpus.translit[seventhAdd] },
  originalInverse: results,
  decision: 'The forced echo-key alignment does not recover readable original GP prose.'
}, null, 2));
