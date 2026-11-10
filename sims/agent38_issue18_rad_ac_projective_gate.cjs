'use strict';

// Source-locked audit of the 2014 Rad↔Ac edge against the 2016 lag-six clue.
// Uses only the original LP2 transcription, canonical 32×8 table and corpus.
// No rotations, offsets, or fitted masks are searched.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const C = readJson('resources/liber-primus/lp2-corpus.json');
const G = readJson('resources/liber-primus/lp2-grid-256.json');
const raw = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8')
  .split('%').slice(0, 55).join('%');
const bytes = G.bytes;
assert.equal(bytes.length, 256);

const runeIndex = new Map(C.runes.map((r, i) => [r, i]));
const words = raw.split(/[-.&$§]/u)
  .map((s) => Array.from(s).filter((ch) => runeIndex.has(ch)).map((ch) => runeIndex.get(ch)))
  .filter((w) => w.length);
const mod = (x, m = 29) => ((x % m) + m) % m;
const inv29 = (x) => {
  for (let k = 1; k < 29; k++) if (mod(x * k) === 1) return k;
  throw new Error('non-invertible F29 element: ' + x);
};

// Cross-triad primitive root z=23+27u, u²=3u+8.
// Multiplication by z in basis (1,u) is [[23,13],[27,17]].
// Projective coordinate x=a/b gives M(x)=(23x+13)/(27x+17).
// State 29 represents infinity in P¹(F29).
const INF = 29;
function M(x) {
  if (x === INF) return mod(23 * inv29(27));
  const den = mod(27 * x + 17);
  if (den === 0) return INF;
  return mod((23 * x + 13) * inv29(den));
}
function Minv(y) {
  if (y === INF) return 23;
  const den = mod(27 * y - 23);
  if (den === 0) return INF;
  return mod((13 - 17 * y) * inv29(den));
}
function iterate(f, x, n) {
  for (let i = 0; i < mod(n, 30); i++) x = f(x);
  return x;
}
function lagHits(f) {
  let hits = 0;
  let eligible = 0;
  const positions = [];
  let global = 0;
  for (const w of words) {
    for (let i = 6; i < w.length; i++) {
      eligible++;
      if (f(w[i - 6]) === w[i]) {
        hits++;
        positions.push(global + i);
      }
    }
    global += w.length + 1;
  }
  return { hits, eligible, positions };
}
const M6 = (x) => iterate(M, x, 6);
const Mminus6 = (x) => iterate(Minv, x, 6);
const Mminus3 = (x) => iterate(Minv, x, 3);
const T6 = (x) => mod(24 - 2 * x);
const projective = {
  Mplus6: lagHits(M6),
  Mminus6: lagHits(Mminus6),
  T6: lagHits(T6),
};
const t6Set = new Set(projective.T6.positions);
projective.Mplus6.overlapT6 = projective.Mplus6.positions.filter((p) => t6Set.has(p)).length;
projective.Mminus6.overlapT6 = projective.Mminus6.positions.filter((p) => t6Set.has(p)).length;

// The 2014 direction edge is Rad=4 -> Ac=24.
// It is exactly three inverse projective steps; this is a selector/orientation
// alignment, not evidence that the projective map generates the T6 event mask.
assert.equal(Mminus3(4), 24);
const orbit = [];
let state = 4;
for (let i = 0; i < 30; i++) {
  assert(!orbit.includes(state));
  orbit.push(state);
  state = M(state);
}
assert.equal(state, 4);
assert.equal(orbit.length, 30);

// The natural 32×8 coordinate interpretation is row=Ac(24), column=Rad(4).
const radAcCoordinate = {
  row: 24,
  column: 4,
  rowMajorIndex: 24 * 8 + 4,
  byte: bytes[24 * 8 + 4],
  byteMod29: bytes[24 * 8 + 4] % 29,
};
assert.equal(radAcCoordinate.rowMajorIndex, 196);
assert.equal(radAcCoordinate.byte, 176);
assert.equal(radAcCoordinate.byteMod29, 2);

// The signed 2016 image dimensions select the two offsets without a fitted
// transform: 563 mod 256 = 51; 569 mod 256 = 57.
const dimensionOffsets = [563 % 256, 569 % 256];
const dimensionValues = dimensionOffsets.map((i) => bytes[i]);
assert.deepEqual(dimensionOffsets, [51, 57]);
assert.deepEqual(dimensionValues, [59, 118]);

// Test the tempting byte-as-next-index walk. It is not selective if nearly
// every table cell flows to the same functional-graph cycle.
function cycleOf(start) {
  const seen = new Map();
  const seq = [];
  let x = start;
  while (!seen.has(x)) {
    seen.set(x, seq.length);
    seq.push(x);
    x = bytes[x];
  }
  return seq.slice(seen.get(x));
}
const cycleKey = (cycle) => cycle.slice().sort((a, b) => a - b).join(',');
const targetCycle = cycleOf(247);
const targetKey = cycleKey(targetCycle);
const basin = [];
for (let i = 0; i < 256; i++) {
  if (cycleKey(cycleOf(i)) === targetKey) basin.push(i);
}
const pointerStarts = [51, 57, 196, 152];
assert(pointerStarts.every((i) => basin.includes(i)));
assert.equal(basin.length, 252);

// A fixed 32-cell toroidal path from offset 51, with the unique displacement
// to offset 57: one row down and two columns left. It is a source-derived path,
// but its aggregate alone does not establish a cryptographic clock.
const pathCells = [];
for (let n = 0; n < 32; n++) {
  const row = (6 + n) % 32;
  const column = mod(3 - 2 * n, 8);
  const index = row * 8 + column;
  pathCells.push({ n, row, column, index, value: bytes[index] });
}
const pathSum = pathCells.reduce((s, p) => s + p.value, 0);
assert.equal(pathCells[0].index, 51);
assert.equal(pathCells[1].index, 57);

const summary = {
  source: {
    words: words.length,
    runes: words.reduce((s, w) => s + w.length, 0),
    wordInteriorLag6Eligible: projective.T6.eligible,
  },
  projective: {
    matrix: [[23, 13], [27, 17]],
    order: 30,
    rad4ToAc24InverseSteps: 3,
    Mplus6: {
      hits: projective.Mplus6.hits,
      rate: projective.Mplus6.hits / projective.Mplus6.eligible,
      overlapT6: projective.Mplus6.overlapT6,
    },
    Mminus6: {
      hits: projective.Mminus6.hits,
      rate: projective.Mminus6.hits / projective.Mminus6.eligible,
      overlapT6: projective.Mminus6.overlapT6,
    },
    affineT6: {
      hits: projective.T6.hits,
      rate: projective.T6.hits / projective.T6.eligible,
    },
  },
  tableCoordinates: {
    radAcCoordinate,
    dimensionOffsets,
    dimensionValues,
    bytePointerStarts: pointerStarts,
    commonCycle: targetCycle,
    commonCycleLength: targetCycle.length,
    commonCycleBasin: basin.length,
    basinFraction: basin.length / 256,
  },
  dimensionPath: {
    cells: pathCells,
    sum: pathSum,
    sumMod127: pathSum % 127,
  },
};
console.log(JSON.stringify(summary, null, 2));
