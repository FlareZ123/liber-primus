#!/usr/bin/env node
'use strict';

// Test the literal "east of the 27x27 map" interpretation as a repeating
// GP29 key. No search over phases, keys, or transformations is performed.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const corpusPath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const page = n => {
  const p = corpus.pages.find(x => x.page === n);
  assert.ok(p, 'missing page ' + n);
  return p.indices;
};

const map = [...page(0), ...page(1), ...page(2)];
assert.equal(map.length, 729);
assert.equal(map.length, 27 * 27);

// The east edge is the 27th column, read north-to-south in row-major order.
const east = Array.from({ length: 27 }, (_, row) => map[row * 27 + 26]);
assert.deepEqual(east, [
  17,17,21,25,7,11,25,28,1,4,16,6,9,24,28,5,1,8,6,19,8,16,18,20,7,21,7
]);

const variants = [
  { name: 'rune-index-east-down', key: east },
  { name: 'rune-index-east-up', key: [...east].reverse() },
  { name: 'gp-prime-mod29-east-down', key: east.map(x => corpus.prime[x] % 29) },
  { name: 'gp-prime-mod29-east-up', key: east.map(x => corpus.prime[x] % 29).reverse() },
];

const p3 = page(3);
const p55 = page(55);
assert.equal(p3.length, 217);
assert.equal(p55.length, 76);

// A 729-rune map consumes exactly 27 periods. The continuous stream therefore
// begins p3 at phase 0. Pages 0..54 contain 12,880 runes, so p55 begins phase 1.
const prefixTo55 = corpus.pages.filter(p => p.page < 55)
  .reduce((sum, p) => sum + p.indices.length, 0);
assert.equal(prefixTo55, 12880);
const continuousP55Phase = prefixTo55 % 27;
assert.equal(continuousP55Phase, 1);

const ioc = values => {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  let numerator = 0;
  for (const n of counts) numerator += n * (n - 1);
  return numerator / (values.length * (values.length - 1));
};
const render = values => values.map(x => corpus.translit[x]).join(' ');

const targets = [
  { label: 'p3-after-map', values: p3, phase: 0 },
  { label: 'p55-page-reset', values: p55, phase: 0 },
  { label: 'p55-continuous-from-p0', values: p55, phase: continuousP55Phase },
];

const outputs = [];
for (const variant of variants) {
  for (const sign of [-1, 1]) {
    for (const target of targets) {
      const decoded = target.values.map((c, i) =>
        (c + sign * variant.key[(target.phase + i) % 27] + 29) % 29
      );
      outputs.push({
        key: variant.name,
        operation: sign < 0 ? 'C-K mod29' : 'C+K mod29',
        target: target.label,
        phase: target.phase,
        length: decoded.length,
        ioc: ioc(decoded),
        decoded: render(decoded),
      });
    }
  }
}

const originals = {
  p3: { length: p3.length, ioc: ioc(p3) },
  p55: { length: p55.length, ioc: ioc(p55) },
  p57_clear_control: { length: page(57).length, ioc: ioc(page(57)) },
};

console.log(JSON.stringify({
  corpus: 'resources/liber-primus/lp2-corpus.json',
  mapShape: '27x27 row-major from p0-p2',
  eastEdgeRuneIndices: east,
  eastEdgeTransliteration: render(east),
  primeWeightsMod29: east.map(x => corpus.prime[x] % 29),
  continuousP55Phase,
  originals,
  outputs,
}, null, 2));
