'use strict';

/**
 * Source-visible p7 five-dot order and proposed p0 handoff, Windows Node22 CJS SFT.
 * No dependencies beyond Node.js. Reproduces only a candidate human ordering,
 * not an authenticated unknown-page decoder.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpusPath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const mod29 = (v) => ((v % 29) + 29) % 29;
const product29 = (word) => word.reduce((acc, n) => mod29(acc * n), 1);
const gp = (indices) => indices.map((n) => corpus.translit[n]).join('');
const ioc = (indices) => {
  const histogram = Array(29).fill(0);
  indices.forEach((n) => { histogram[n] += 1; });
  return histogram.reduce((acc, n) => acc + n * (n - 1), 0)
    / (indices.length * (indices.length - 1));
};

const p7 = corpus.pages.find((record) => record.page === 7).indices;
assert.equal(p7.length, 208);
const red = p7.slice(194);
const wordLengths = [2, 4, 3, 2, 3];
let offset = 0;
const printed = wordLengths.map((length) => {
  const word = red.slice(offset, offset + length);
  offset += length;
  return word;
});
assert.equal(offset, 14);
assert.deepEqual(printed, [
  [23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19],
]);

// Centers of the five isolated filled dots in original image 24.jpg, pixels
// in its 2400x3600 coordinate system. Extracted by thresholding grayscale
// at <90 in y=2700..3400 and retaining 20..160px connected components with
// 1500..20000 dark pixels. Their raw bounding boxes are recorded in the report.
// Ordering by x is a *hypothetical* word-to-dot association, not proof of intent.
const dots = [
  { x: 796.94, y: 3105.77 },
  { x: 992.50, y: 3166.64 },
  { x: 1296.93, y: 2866.79 },
  { x: 1479.26, y: 3127.50 },
  { x: 1527.15, y: 2936.15 },
];
const xOrdered = [...dots].sort((a, b) => a.x - b.x);
const heightOrder = xOrdered
  .map((dot, id) => ({ ...dot, id }))
  .sort((a, b) => a.y - b.y)
  .map((dot) => dot.id);
assert.deepEqual(heightOrder, [2, 4, 0, 3, 1]);
const heightWords = heightOrder.map((index) => printed[index]);
const heads = heightWords.map((word) => word[0]);
const products = heightWords.map(product29);
assert.deepEqual(heads, [5, 6, 23, 14, 22]);
assert.deepEqual(products, [8, 2, 11, 15, 26]);

// Uniform word-head and word-product readouts, supplemented with the second
// word's *printed* last rune. These assignments match the historical DH
// register, but were noticed after that register was known.
const g = heads[0], a = heads[1], p = heads[2];
const A = products[0], K = products[1], b = products[3];
const B = heightWords[1].at(-1);
const e = heightWords[2].at(-1);
const q = mod29(printed.map(product29).reduce((sum, n) => sum + n, 0));
assert.deepEqual({ p, g, a, b, A, B, K, e, q },
  { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4 });
assert.equal(Number(BigInt(g) ** BigInt(a) % BigInt(p)), A);
assert.equal(Number(BigInt(g) ** BigInt(b) % BigInt(p)), B);
assert.equal(Number(BigInt(B) ** BigInt(a) % BigInt(p)), K);
assert.equal(mod29(products[4] * B), 1);
console.log('p7 dots height order (one-based words):', heightOrder.map((v) => v + 1));
console.log('red-word heads:', heads);
console.log('red-word products:', products);
console.log('derived DH register:', { p, g, a, b, A, B, K, e, q });

// Unchanged retrospective marker-rise local p0 title serializer. This checks
// compatibility with the known local reading and does not add new plaintext.
const u = mod29(q - e), t = mod29(g + K), w = mod29(A + g);
function cumulative(seed, steps) {
  const values = [mod29(seed)];
  for (const step of steps) values.push(mod29(values.at(-1) + step));
  return values;
}
const left = cumulative(-q, [q - u, w - u, w + u]);
const center = cumulative(q, [q, q + t, q + 2 * t, q + 3 * t]);
const right = cumulative(t, [t - u, t, t + u]);
assert.deepEqual([left, center, right],
  [[25, 28, 11, 25], [4, 8, 19, 8, 4], [7, 13, 20, 28]]);
const marker = [...left, ...center, ...right];
const titleKey = [];
for (let i = 0; i < 6; i += 1) {
  titleKey.push(mod29(marker[i] - marker[12 - i]));
  titleKey.push(mod29(marker[i] + marker[12 - i]));
}
titleKey.push(marker[6]);
assert.deepEqual(titleKey, [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19]);
const p0 = corpus.pages.find((record) => record.page === 0).indices;
const titlePlain = p0.slice(0, 13).map((n, i) => mod29(n - titleKey[i]));
assert.equal(gp(titlePlain), 'EPIPHANYSEECS');
assert.deepEqual(titlePlain.map((n, i) => mod29(n + titleKey[i])), p0.slice(0, 13));
console.log('known local p0 title:', gp(titlePlain), '(pre-existing retrospective rule)');

// A single natural 5-period repeated additive interpretation of the newly
// ordered red products, plus printed-order and sign rivals; no phase fitting.
const p0body = p0.slice(13);
assert.equal(p0body.length, 249);
const keys = [
  { label: 'height-sorted red products', values: products },
  { label: 'printed red products', values: printed.map(product29) },
];
for (const { label, values } of keys) {
  for (const sign of [-1, 1]) {
    const candidate = p0body.map((c, i) => mod29(c + sign * values[i % 5]));
    assert.deepEqual(candidate.map((v, i) => mod29(v - sign * values[i % 5])), p0body);
    console.log(label, sign === -1 ? 'subtract' : 'add',
      'p0-body-IoC', ioc(candidate).toFixed(6),
      'first-70-runes', gp(candidate.slice(0, 70)));
  }
}
console.log('source p0-body IoC', ioc(p0body).toFixed(6));
console.log('solved p57 IoC', ioc(corpus.pages.find((r) => r.page === 57).indices).toFixed(6));
console.log('PASS: geometric ordering and exact arithmetic; no original black-body plaintext recovered');
