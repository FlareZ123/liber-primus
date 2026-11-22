'use strict';

// Source-locked test of the GF(29^2) 256-event state -> 32x8 grid-coordinate
// output proposed in the Agent 38/39 handoff. No key fitting or source changes.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const A = readJson('resources/liber-primus/lp2-ink-annotations.json');
const G = readJson('resources/liber-primus/base60-grid.json');
const C = readJson('resources/liber-primus/lp2-corpus.json');
const mod = (x, m = 29) => ((x % m) + m) % m;
const runeIndex = new Map(C.runes.map((r, i) => [r, i]));

const events = [];
for (const page of A.pages) {
  (page.large_punctuation || []).forEach((mark, order) => {
    if (mark[1] === 13) {
      events.push({
        page: page.page, offset: mark[0], kind: 0, order,
        type: '13-dot', color: mark[2], e: 0,
      });
    }
  });
  for (const span of (page.red_spans || [])) {
    Array.from(span.runes).forEach((rune, j) => {
      const gp = runeIndex.get(rune);
      assert.notEqual(gp, undefined, 'unknown annotated red rune');
      events.push({
        page: page.page, offset: span.start + j, kind: 1, order: j,
        type: 'red-rune', gp, e: mod(gp + 1 - 13),
      });
    });
  }
}

// At equal page/offset, the physical punctuation mark precedes the rune.
// Preserve both p7:194 marker records; their shared zero inputs are not deduped.
events.sort((a, b) =>
  a.page - b.page || a.offset - b.offset || a.kind - b.kind || a.order - b.order
);
assert.equal(events.filter((e) => e.type === 'red-rune').length, 225);
assert.equal(events.filter((e) => e.type === '13-dot').length, 31);
assert.equal(events.length, 256);
const p7Marks = events.filter((e) =>
  e.page === 7 && e.offset === 194 && e.type === '13-dot'
);
assert.equal(p7Marks.length, 2);
const p7At194 = events.filter((e) => e.page === 7 && e.offset === 194);
assert.deepEqual(p7At194.map((e) => e.type), ['13-dot', '13-dot', 'red-rune']);

// In GF(29^2), u^2 = 3u + 8. Multiplication is in basis (1,u).
const mul = ([a, b], [c, d]) => [
  mod(a * c + 8 * b * d),
  mod(a * d + b * c + 3 * b * d),
];
const z = [23, 27];
let state = [4, 24]; // s0 = 4 + 24u
const preStates = [];
const postStates = [];
const preBytes = [];
const postBytes = [];
const tableByte = ([a, b]) => G.byte_rows[a % 32][b % 8];

for (const event of events) {
  preStates.push(state.slice());
  preBytes.push(tableByte(state));
  state = mul(z, state);
  state[0] = mod(state[0] + event.e);
  postStates.push(state.slice());
  postBytes.push(tableByte(state));
}
assert.deepEqual(state, [0, 21]);

const ciphertext = C.pages
  .filter((page) => page.page < 56)
  .flatMap((page) => page.indices);
assert.equal(ciphertext.length, 12956);

const ioc = (symbols) => {
  const counts = Array(29).fill(0);
  for (const x of symbols) counts[x]++;
  const n = symbols.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
};
const entropy = (symbols) => {
  const counts = Array(29).fill(0);
  for (const x of symbols) counts[x]++;
  const n = symbols.length;
  return -counts.reduce((sum, count) =>
    count ? sum + (count / n) * Math.log2(count / n) : sum, 0);
};
const variants = [];
for (const [stateSample, bytes] of [['pre-event', preBytes], ['post-event', postBytes]]) {
  const key = bytes.map((b) => mod(b));
  for (const [sign, operation] of [[-1, 'subtract'], [1, 'add']]) {
    const decoded = ciphertext.map((c, i) => mod(c + sign * key[i % 256]));
    const planted = Array.from({ length: ciphertext.length }, (_, i) => mod(i * 17 + 11 * Math.floor(i / 29) + 3));
    const plantedCipher = planted.map((p, i) => mod(p - sign * key[i % 256]));
    const recovered = plantedCipher.map((c, i) => mod(c + sign * key[i % 256]));
    assert.deepEqual(recovered, planted);
    variants.push({
      stateSample, operation,
      decodedIoC: ioc(decoded),
      decodedEntropy: entropy(decoded),
      decodedPrefix: decoded.slice(0, 48).map((x) => C.translit[x]).join(' '),
      plantRecovered: recovered.length,
    });
  }
}

const result = {
  sources: [
    'resources/liber-primus/lp2-ink-annotations.json',
    'resources/liber-primus/base60-grid.json',
    'resources/liber-primus/lp2-corpus.json',
  ],
  eventCounts: {
    redRunes: 225, thirteenDotMarks: 31, total: 256,
    blackThirteenDotMarks: events.filter((e) => e.type === '13-dot' && e.color === 'black').length,
    p7Offset194Records: p7Marks.length,
  },
  recurrence: {
    field: 'u^2 = 3u + 8',
    initialState: [4, 24],
    multiplier: z,
    finalState: state,
    uniquePreStates: new Set(preStates.map((s) => s.join(','))).size,
    uniqueTableCells: new Set(preStates.map((s) => s[0] + ',' + (s[1] % 8))).size,
    uniqueOutputBytes: new Set(preBytes).size,
  },
  output: {
    mapping: 'state a+bu -> original table byte at row a mod32, column b mod8',
    keyReduction: 'byte mod29',
    clock: 'book-continuous, period 256',
    rawCiphertextIoC: ioc(ciphertext),
    uniformIoC: 1 / 29,
    variants,
  },
};
console.log(JSON.stringify(result, null, 2));
