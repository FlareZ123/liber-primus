'use strict';
const assert = require('node:assert/strict');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const MOD = 29;
const mod = (n) => ((n % MOD) + MOD) % MOD;
const alphabet = grid.alphabet;
const tokens = grid.pages.flatMap((p) => p.tokens);
assert.equal(grid.bytes.length, 256);
assert.equal(tokens.length, 256);
assert.equal(grid.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
const pages = new Map(corpus.pages.filter((p) => p.page <= 57).map((p) => [p.page, p]));
for (let p = 0; p <= 57; p++) assert.ok(pages.has(p), 'missing page ' + p);
assert.equal(pages.get(50).indices.length, 0);
assert.equal(pages.get(57).indices.length, 95);
const base59Digit = (ch) => {
  const i = alphabet.indexOf(ch);
  assert.notEqual(i, -1, 'unknown table digit ' + ch);
  return i > 41 ? i - 1 : i;
};
const tableReadings = [
  { name: 'base60', values: grid.bytes },
  { name: 'base59-drop-f', values: tokens.map((t) => 59 * base59Digit(t[0]) + base59Digit(t[1])) }
];
function extractInner(values) {
  const inner = [];
  for (let r = 2; r < 30; r++) for (let c = 2; c < 6; c++) inner.push(mod(values[r * 8 + c]));
  assert.equal(inner.length, 112);
  return inner;
}
function ioc(symbols) {
  const n = symbols.length;
  if (n < 2) return 0;
  const counts = new Uint32Array(MOD);
  for (const x of symbols) counts[x]++;
  let pairs = 0;
  for (const n of counts) pairs += n * (n - 1);
  return pairs / (n * (n - 1));
}
function transformPage(cipher, key, sign, skipF, startPhase = 0) {
  let phase = startPhase;
  const plain = [];
  for (const c of cipher) {
    if (skipF && c === 0) {
      plain.push(0);
      continue;
    }
    const p = mod(c + sign * key[phase % key.length]);
    assert.equal(mod(p - sign * key[phase % key.length]), c);
    plain.push(p);
    phase++;
  }
  return { plain, endPhase: phase };
}
function transformSpread(pairPages, key, sign, skipF, carrySpread) {
  let phase = 0;
  const decodedPages = [];
  for (const page of pairPages) {
    if (!carrySpread) phase = 0;
    const result = transformPage(page.indices, key, sign, skipF, phase);
    phase = result.endPhase;
    decodedPages.push({ page: page.page, plain: result.plain });
  }
  return decodedPages;
}
function summarize(decodedPages, meta) {
  const all = [];
  const pageScores = [];
  for (const p of decodedPages) {
    all.push(...p.plain);
    pageScores.push({ page: p.page, count: p.plain.length, ioc: ioc(p.plain) });
  }
  return {
    ...meta,
    runeCount: all.length,
    globalIoC: ioc(all),
    medianPageIoC: pageScores.map((x) => x.ioc).sort((a, b) => a - b)[Math.floor(pageScores.length / 2)],
    bestPages: pageScores.slice().sort((a, b) => b.ioc - a.ioc).slice(0, 4)
  };
}
function verifyPlant(key, sign, skipF) {
  const clear = pages.get(57).indices;
  let phase = 0;
  const cipher = [];
  for (const p of clear) {
    if (skipF && p === 0) {
      cipher.push(0);
      continue;
    }
    cipher.push(mod(p - sign * key[phase % key.length]));
    phase++;
  }
  assert.deepEqual(transformPage(cipher, key, sign, skipF).plain, clear);
}
const spreadVariants = [];
const pageVariants = [];
const hill2 = [];
const oddSpreads = [];
for (const reading of tableReadings) {
  const inner = extractInner(reading.values);
  const spreadKeys = Array.from({ length: 28 }, (_, r) => inner.slice(4 * r, 4 * r + 4));
  const pageKeys = Array.from({ length: 56 }, (_, p) => inner.slice(2 * p, 2 * p + 2));
  for (const skipF of [false, true]) for (const sign of [-1, 1]) for (const carrySpread of [false, true]) {
    const decoded = [];
    for (let r = 0; r < 28; r++) {
      decoded.push(...transformSpread([pages.get(2 * r), pages.get(2 * r + 1)], spreadKeys[r], sign, skipF, carrySpread));
    }
    spreadVariants.push(summarize(decoded, {
      radix: reading.name, grouping: '28-spreads-period4', skipF, sign, carrySpread
    }));
    verifyPlant(spreadKeys[0], sign, skipF);
  }
  for (const skipF of [false, true]) for (const sign of [-1, 1]) {
    const decoded = [];
    for (let p = 0; p <= 55; p++) {
      if (p === 50) continue;
      const result = transformPage(pages.get(p).indices, pageKeys[p], sign, skipF);
      decoded.push({ page: p, plain: result.plain });
    }
    pageVariants.push(summarize(decoded, {
      radix: reading.name, grouping: '56-pages-period2', skipF, sign, carrySpread: false
    }));
    verifyPlant(pageKeys[0], sign, skipF);
  }
  for (let r = 0; r < 28; r++) {
    const [a, b, c, d] = spreadKeys[r];
    hill2.push({
      radix: reading.name, row: r, pages: [2 * r, 2 * r + 1],
      matrix: [a, b, c, d], determinant: mod(a * d - b * c)
    });
  }
}
for (let r = 0; r < 28; r++) {
  const count = pages.get(2 * r).indices.length + pages.get(2 * r + 1).indices.length;
  if (count % 2 !== 0) oddSpreads.push({ row: r, pages: [2 * r, 2 * r + 1], runeCount: count });
}
const unknown = [];
for (let p = 0; p <= 55; p++) if (p !== 50) unknown.push(...pages.get(p).indices);
const clearP57 = pages.get(57).indices;
const hill2Summary = tableReadings.map((reading) => {
  const rows = hill2.filter((x) => x.radix === reading.name);
  return { radix: reading.name, singularRows: rows.filter((x) => x.determinant === 0), invertibleRows: rows.filter((x) => x.determinant !== 0).length };
});
assert.equal(spreadVariants.length, 16);
assert.equal(pageVariants.length, 8);
assert.equal(unknown.length, 12956);
assert.ok(spreadVariants.every((x) => x.runeCount === unknown.length));
assert.ok(pageVariants.every((x) => x.runeCount === unknown.length));
console.log(JSON.stringify({
  source: {
    gridShape: grid.shape, tableCells: grid.bytes.length,
    innerGeometry: 'rows 2..29, columns 2..5 (zero-based), row-major',
    innerCellCount: 112, physicalPageSlots: 56, adjacentSpreads: 28,
    unknownRunes: unknown.length, p50RuneCount: pages.get(50).indices.length,
    p57ClearRunes: clearP57.length
  },
  baselines: { uniform29SymbolIoC: 1 / MOD, originalUnknownIoC: ioc(unknown), clearP57IoC: ioc(clearP57) },
  spreadVariants, pageVariants,
  hill2: { singularMatrixSummary: hill2Summary, oddLengthSpreads: oddSpreads }
}, null, 2));
