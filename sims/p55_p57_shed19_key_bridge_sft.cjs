'use strict';

/**
 * Source-selected 76-rune bridge across LP2 p50/p55/solved p57.
 * SFT: node sims/p55_p57_shed19_key_bridge_sft.cjs
 *
 * Input contracts: original physical pages p55 and p57 in lp2-corpus;
 * 32x8 printed p49-p51 table in base60-grid. No original input is edited.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
const lengths = [7, 4, 2, 6, 7, 2, 2, 7, 2, 4, 4, 3, 3, 14, 4, 2, 8, 5, 3, 6];

assert.equal(p55.length, 76);
assert.equal(p57.length, 95);
assert.equal(lengths.reduce((s, n) => s + n, 0), 95);
assert.equal(lengths.length, 20);
assert.equal(table.rows.length, 32);
assert.ok(table.rows.every((row) => row.length === 8));

const mod = (x) => ((x % 29) + 29) % 29;
const translit = (values) => values.map((n) => corpus.translit[n]).join('');
const ioc = (values) => {
  const counts = Array(29).fill(0);
  values.forEach((v) => { counts[v] += 1; });
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
};
let offset = 0;
const words = lengths.map((length) => {
  const out = p57.slice(offset, offset + length);
  offset += length;
  return out;
});
assert.equal(offset, 95);

const grid = table.rows.map((row) => row.map((token) =>
  60 * table.alphabet.indexOf(token[0]) + table.alphabet.indexOf(token[1])
));
assert.ok(grid.flat().every((v) => v >= 0 && v < 256));
const ring = [];
grid[0].forEach((v) => ring.push(v));
for (let row = 1; row < 32; row += 1) ring.push(grid[row][7]);
for (let col = 6; col >= 0; col -= 1) ring.push(grid[31][col]);
for (let row = 30; row >= 1; row -= 1) ring.push(grid[row][0]);
assert.equal(ring.length, 76);

function exactMapMaximum(inputs, outputs) {
  const countsByToken = new Map();
  inputs.forEach((token, i) => {
    let histogram = countsByToken.get(token);
    if (!histogram) {
      histogram = Array(29).fill(0);
      countsByToken.set(token, histogram);
    }
    histogram[outputs[i]] += 1;
  });
  let best = 0;
  for (const histogram of countsByToken.values()) best += Math.max(...histogram);
  return { best, forcedMismatches: inputs.length - best, tokenClasses: countsByToken.size };
}

const results = {
  source: { p55Runes: p55.length, p57Runes: p57.length,
    headingRunes: words[0].length, bodyWords: words.length - 1,
    printedGrid: '32x8', perimeterCells: ring.length },
  baseline: { p55Ioc: ioc(p55), p57Ioc: ioc(p57) },
  shed: [],
  bodyWordKeys: []
};

for (const side of ['first', 'last']) {
  const masked = [
    ...words[0],
    ...words.slice(1).flatMap((word) => side === 'first' ? word.slice(1) : word.slice(0, -1))
  ];
  assert.equal(masked.length, 76);
  const entry = { side, keyLength: masked.length, keyIoc: ioc(masked), additive: [], gridKnownPlaintext: [] };
  for (const sign of [-1, +1]) {
    const decoded = p55.map((c, i) => mod(c + sign * masked[i]));
    const replay = decoded.map((p, i) => mod(p - sign * masked[i]));
    assert.deepEqual(replay, p55);
    entry.additive.push({ sign, ioc: ioc(decoded), prefix: translit(decoded).slice(0, 100) });

    // Source-native positive: independently known 76 original solved GP runes
    // must survive the same encryption/decryption with the same 76-key mask.
    const planted = p57.slice(0, 76).map((p, i) => mod(p - sign * masked[i]));
    assert.deepEqual(planted.map((c, i) => mod(c + sign * masked[i])), p57.slice(0, 76));
  }

  // Alternative reading: masked p57 is the proposed plaintext, and the
  // 76-cell table circumference should provide the exact additive pad.
  // A completely secret but stationary byte -> GP29 map is also allowed.
  const requiredPad = p55.map((c, i) => mod(c - masked[i]));
  for (const direction of ['clockwise', 'reversed']) {
    const byteRing = direction === 'clockwise' ? ring : [...ring].reverse();
    const expectedPad = byteRing.map((v) => v % 29);
    const plusMatches = requiredPad.filter((v, i) => v === expectedPad[i]).length;
    const minusMatches = requiredPad.filter((v, i) => v === mod(-expectedPad[i])).length;
    const stationary = exactMapMaximum(byteRing, requiredPad);
    const invertedStationary = exactMapMaximum(byteRing, requiredPad.map((v) => mod(-v)));
    assert.deepEqual(stationary, invertedStationary);
    entry.gridKnownPlaintext.push({
      direction, plusMatches, minusMatches, ...stationary
    });
    // Blind positive control: freeze an unknown lookup for the ORIGINAL ring,
    // then generate 76 target pads with it; maximum must recover every event.
    const plantedPad = byteRing.map((v) => mod(v * 11 + 17));
    assert.equal(exactMapMaximum(byteRing, plantedPad).best, 76);
  }
  results.shed.push(entry);
}

// A separate 19x4 candidate: one p57 body-word sum per four p55 runes.
for (const keyKind of ['gpIndexSum', 'gpPrimeSum']) {
  const keys = words.slice(1).map((word) => mod(word.reduce(
    (sum, rune) => sum + (keyKind === 'gpPrimeSum' ? corpus.prime[rune] : rune), 0
  )));
  assert.equal(keys.length, 19);
  for (const sign of [-1, 1]) {
    const decoded = p55.map((c, i) => mod(c + sign * keys[Math.floor(i / 4)]));
    assert.deepEqual(decoded.map((p, i) => mod(p - sign * keys[Math.floor(i / 4)])), p55);
    results.bodyWordKeys.push({
      keyKind, sign, ioc: ioc(decoded), prefix: translit(decoded).slice(0, 100)
    });
  }
}

const first = results.shed.find((x) => x.side === 'first');
const last = results.shed.find((x) => x.side === 'last');
assert.ok(Math.abs(first.additive[0].ioc - 0.04035087719298246) < 1e-12);
assert.ok(Math.abs(last.additive[0].ioc - 0.03263157894736842) < 1e-12);
assert.deepEqual(
  first.gridKnownPlaintext.map((x) => [x.best, x.forcedMismatches]),
  [[68, 8], [68, 8]]
);
assert.deepEqual(
  last.gridKnownPlaintext.map((x) => [x.best, x.forcedMismatches]),
  [[70, 6], [69, 7]]
);
console.log(JSON.stringify(results, null, 2));
