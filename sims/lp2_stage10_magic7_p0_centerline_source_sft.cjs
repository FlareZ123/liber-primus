'use strict';
/**
 * Original 2014 OpenPuff 7x7 middle-row numbers against LP2 p0 red-word
 * prime sums, and a finite central-row 7-cycle GP29 inverse.
 * Read-only Windows/Node 22 single-file test.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const source = (name) => fs.readFileSync(path.resolve(__dirname, '..', name));
const magic = source('resources/cicada2014-openpuff-magic-squares.txt');
assert.equal(crypto.createHash('sha256').update(magic).digest('hex'),
  '9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f');
const lines = magic.toString('utf8').trim().split(/\r?\n/);
const blocks = [];
let block = [];
for (const line of lines) {
  if (!line.trim()) {
    if (block.length) blocks.push(block);
    block = [];
  } else {
    block.push(Array.from(line.matchAll(/\d+/g), (m) => Number(m[0])));
  }
}
if (block.length) blocks.push(block);
const square = blocks.find((b) => b.length === 7 && b.every((r) => r.length === 7));
assert.ok(square);
const center = square[3];
assert.deepEqual(center, [16, 65, 270, 331, 270, 65, 16]);
for (const row of square) assert.equal(row.reduce((a, b) => a + b, 0), 1033);
const html = source('resources/cicada2014-onion7-index.html').toString('utf8');
assert.match(html, /<title>133<\/title>/);
assert.match(html, /<div id="331">/);
assert.equal((html.match(/<img src="\d+\.jpg"/g) || []).length, 58);

const { pages, prime, translit } = JSON.parse(source('resources/liber-primus/lp2-corpus.json'));
const title = pages[0].indices.slice(0, 13);
assert.deepEqual(title, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
const sum = (a) => a.reduce((x, y) => x + y, 0);
const sums = [sum(title.slice(0, 8).map((i) => prime[i])),
  sum(title.slice(8).map((i) => prime[i]))];
assert.deepEqual(sums, [center[3] + center[0], center[3] - center[0]]);
assert.deepEqual(sums, [347, 315]);
const otherExpected = [center[3] + center[1], center[3] - center[1],
  center[3] + center[2], center[3] - center[2]];
assert.deepEqual(otherExpected, [396, 266, 601, 61]);
const ink = JSON.parse(source('resources/liber-primus/lp2-ink-annotations.json'));
const redSpans = ink.pages.filter((p) => p.page <= 55).flatMap((p) =>
  (p.red_spans || []).map((s) => sum(pages[p.page].indices
    .slice(s.start, s.start + s.length).map((i) => prime[i]))));
assert.equal(redSpans.length, 16);
assert.equal(redSpans.filter((n) => otherExpected.includes(n)).length, 0);

const p0 = pages.slice(0, 3).flatMap((p) => p.indices).slice(13);
const later = pages.slice(3, 8).flatMap((p) => p.indices);
assert.equal(p0.length, 716);
assert.equal(later.length, 1145);
const key = center.map((n) => n % 29);
assert.deepEqual(key, [16, 7, 9, 12, 9, 7, 16]);
const cipher = (data, sign) => data.map((x, i) =>
  (x + 29 + sign * key[i % key.length]) % 29);
const ioc = (data) => {
  const counts = new Array(29).fill(0);
  for (const x of data) counts[x]++;
  return sum(counts.map((n) => n * (n - 1))) / (data.length * (data.length - 1));
};
const p57 = pages[57].indices;
assert.equal(p57.length, 95);
for (const sign of [-1, 1]) {
  const known = Array.from({length: 716}, (_, i) => p57[i % 95]);
  assert.deepEqual(cipher(cipher(known, sign), -sign), known);
}
const result = { sevenBySevenCenterRow: center, titleSums: sums,
  unusedRowPredictions: otherExpected, redSpansCount: redSpans.length, test: {} };
for (const [name, data] of [['p0Black', p0], ['p3To7', later]]) {
  result.test[name] = { original: ioc(data), n: data.length, decoders: [] };
  for (const sign of [-1, 1]) {
    const decoded = cipher(data, sign);
    assert.deepEqual(cipher(decoded, -sign), data);
    const index = ioc(decoded);
    assert.ok(index < 0.04);
    result.test[name].decoders.push({sign, ioc: index,
      preview: decoded.slice(0, 55).map((n) => translit[n]).join('')});
  }
}
console.log(JSON.stringify(result, null, 2));
