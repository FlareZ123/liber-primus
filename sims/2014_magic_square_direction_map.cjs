#!/usr/bin/env node
"use strict";

// Reproduce the 2014 stage04 Rad <-> Ac direction map and test its simplest
// source-motivated transfer to the original LP2 32x8 base-60 byte table.
// Run from the repository root:
//   node sims/2014_magic_square_direction_map.cjs

const assert = require("node:assert/strict");
const fs = require("node:fs");

const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const ink = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-ink-annotations.json", "utf8"));
const grid = JSON.parse(fs.readFileSync("resources/liber-primus/base60-grid.json", "utf8"));
const magic = [
  [272,138,341,131,151],
  [366,199,130,320,18],
  [226,245,91,245,226],
  [18,320,130,199,366],
  [151,131,341,138,272],
];
const mod = n => ((n % 29) + 29) % 29;

function phi(n) {
  assert(Number.isInteger(n) && n > 0, "Euler phi is defined here only for positive integers");
  let x = n, out = n;
  for (let p = 2; p * p <= x; p++) if (x % p === 0) {
    while (x % p === 0) x /= p;
    out -= out / p;
  }
  if (x > 1) out -= out / x;
  return Math.round(out);
}

const dirs = [
  {name:"E",dr:0,dc:1},{name:"NE",dr:-1,dc:1},
  {name:"N",dr:-1,dc:0},{name:"NW",dr:-1,dc:-1},
  {name:"W",dr:0,dc:-1},{name:"SW",dr:1,dc:-1},
  {name:"S",dr:1,dc:0},{name:"SE",dr:1,dc:1},
];

const cells = [];
for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
  const n = magic[r][c], angle = ((n % 360) + 360) % 360;
  const dir = dirs[Math.floor((angle + 22.5) / 45) % 8];
  const tr = r + dir.dr, tc = c + dir.dc;
  const inside = tr >= 0 && tr < 5 && tc >= 0 && tc < 5;
  const runeIndex = mod(phi(n));
  cells.push({
    cell:r * 5 + c + 1, number:n, angle, direction:dir.name, phi:phi(n),
    runeIndex, translit:corpus.translit[runeIndex],
    target:inside ? tr * 5 + tc + 1 : null,
  });
}
const byCell = new Map(cells.map(x => [x.cell, x]));
const cycleKeys = new Set(), cycles = [];
for (let start = 1; start <= 25; start++) {
  const path = [], pos = new Map();
  let cur = start;
  while (cur !== null && !pos.has(cur)) {
    pos.set(cur, path.length);
    path.push(cur);
    cur = byCell.get(cur).target;
  }
  if (cur !== null && pos.has(cur)) {
    const cycle = path.slice(pos.get(cur));
    const min = Math.min(...cycle), i = cycle.indexOf(min);
    const canonical = cycle.slice(i).concat(cycle.slice(0, i));
    const key = canonical.join(",");
    if (!cycleKeys.has(key)) {
      cycleKeys.add(key);
      cycles.push(canonical);
    }
  }
}
cycles.sort((a,b) => a.length - b.length || a[0] - b[0]);
const mutualPairs = cells
  .filter(x => x.target !== null && byCell.get(x.target).target === x.cell)
  .map(x => [x.cell, x.target]).filter(([a,b]) => a < b);
const rowSums = magic.map(r => r.reduce((a,b) => a+b, 0));
const colSums = Array.from({length:5}, (_,c) => magic.reduce((s,r) => s+r[c], 0));
const diagonalSums = [
  magic.reduce((s,r,i) => s+r[i], 0),
  magic.reduce((s,r,i) => s+r[4-i], 0),
];
const magicResult = {
  magicConstant:1033, rowSums, columnSums:colSums, diagonalSums,
  selector:{patienceValue:761,phi761:phi(761),phi761mod29:mod(phi(761)),epiphanyDay:6},
  cell6:byCell.get(6), cell7:byCell.get(7),
  inBoundsEdges:cells.filter(x => x.target !== null).length,
  exits:cells.filter(x => x.target === null).map(x => x.cell),
  mutualPairs,
  cycles:cycles.map(ids => ({
    cells:ids, runes:ids.map(id => byCell.get(id).translit),
    directions:ids.map(id => byCell.get(id).direction),
  })),
};
if (!rowSums.every(x => x === 1033) || !colSums.every(x => x === 1033) ||
    !diagonalSums.every(x => x === 1033)) throw Error("magic-square check failed");
if (mod(phi(761)) !== 6 || byCell.get(6).translit !== "R" ||
    byCell.get(7).translit !== "A" || byCell.get(6).target !== 7 ||
    byCell.get(7).target !== 6 || !mutualPairs.some(x => x[0] === 6 && x[1] === 7)) {
  throw Error("cell 6 Rad <-> cell 7 Ac did not reproduce");
}

// Transfer hypothesis: each positive LP2 grid byte b labels a GP rune by
// phi(b) mod 29 and supplies a bearing b degrees. Use the same 0° east,
// counter-clockwise, nearest-45° convention as the 2014 square, with bounded
// eight-neighbour moves and no wrap. phi(0) is undefined, so zero cells have
// no rune label (their 0° direction remains usable).
function gridGraph(sourceRows, columnIndices, name) {
  const height = sourceRows.length, width = columnIndices.length;
  const nodes = [];
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const byte = sourceRows[y][columnIndices[x]];
    const runeIndex = byte === 0 ? null : mod(phi(byte));
    const angle = ((byte % 360) + 360) % 360;
    const dirIndex = Math.floor((angle + 22.5) / 45) % 8;
    const dir = dirs[dirIndex];
    const ny = y + dir.dr, nx = x + dir.dc;
    const inside = ny >= 0 && ny < height && nx >= 0 && nx < width;
    nodes.push({
      id:y * width + x, sourceRow:y, sourceCol:columnIndices[x],
      byte, runeIndex, translit:runeIndex === null ? null : corpus.translit[runeIndex],
      angle, direction:dir.name, next:inside ? ny * width + nx : null,
    });
  }

  const seen = new Set(), foundCycles = [];
  for (const node of nodes) {
    if (seen.has(node.id)) continue;
    const path = [], positions = new Map();
    let cur = node.id;
    while (cur !== null && !seen.has(cur) && !positions.has(cur)) {
      positions.set(cur, path.length);
      path.push(cur);
      cur = nodes[cur].next;
    }
    if (cur !== null && positions.has(cur)) {
      foundCycles.push(path.slice(positions.get(cur)).map(id => nodes[id]));
    }
    for (const id of path) seen.add(id);
  }

  const acToRadPaths = [];
  for (const start of nodes.filter(x => x.translit === "A")) {
    const path = [], localSeen = new Set();
    let cur = start;
    while (cur !== null && !localSeen.has(cur.id)) {
      localSeen.add(cur.id);
      path.push(cur);
      if (cur.translit === "R") {
        acToRadPaths.push(path.map(x => ({
          row:x.sourceRow + 1, column:x.sourceCol + 1,
          rune:x.translit, byte:x.byte, direction:x.direction,
        })));
        break;
      }
      cur = cur.next === null ? null : nodes[cur.next];
    }
  }

  const runeCounts = {};
  for (const node of nodes) if (node.translit !== null) {
    runeCounts[node.translit] = (runeCounts[node.translit] || 0) + 1;
  }
  const cycleDetails = foundCycles.map(cycle => cycle.map(x => ({
    row:x.sourceRow + 1, column:x.sourceCol + 1,
    rune:x.translit === null ? "UNLABELLED" : x.translit,
    byte:x.byte, direction:x.direction,
  })));
  const radAcMutualCycles = foundCycles.filter(cycle =>
    cycle.length === 2 &&
    cycle.some(x => x.translit === "R") &&
    cycle.some(x => x.translit === "A")
  );
  return {
    name, printedColumns:columnIndices.map(x => x + 1),
    cells:nodes.length, zeroBytes:nodes.filter(x => x.byte === 0).length,
    acCount:runeCounts.A || 0, radCount:runeCounts.R || 0,
    runeCounts, outOfBoundsEdges:nodes.filter(x => x.next === null).length,
    cycleCount:foundCycles.length,
    cycleLengths:foundCycles.map(x => x.length),
    radAcMutualCycleCount:radAcMutualCycles.length,
    acToRadPathCount:acToRadPaths.length,
    acToRadPaths, cycles:cycleDetails,
  };
}

assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every(row => row.length === 8));
const allColumns = Array.from({length:8}, (_,i) => i);
const mod8Columns = [byCell.get(6).number % 8, byCell.get(7).number % 8];
const literalCellColumns = [byCell.get(6).cell - 1, byCell.get(7).cell - 1];
assert.deepEqual(mod8Columns, [6,7]);
assert.deepEqual(literalCellColumns, [5,6]);

const fullGrid = gridGraph(grid.byte_rows, allColumns, "full 32x8 table");
const mod8Strip = gridGraph(grid.byte_rows, mod8Columns, "2014 numbers mod 8 as zero-based columns");
const literalStrip = gridGraph(grid.byte_rows, literalCellColumns, "2014 cell numbers as one-based columns");

// A minimal source-shaped positive: phi(5) mod 29 = Rad and 5° is east;
// phi(199) mod 29 = Ac and 199° is west, so the two cells must cycle.
const positiveControl = gridGraph([[5,199]], [0,1], "planted Rad <-> Ac positive control");
assert.equal(positiveControl.radAcMutualCycleCount, 1);
assert.deepEqual(positiveControl.cycles.map(c => c.map(x => x.rune)), [["R","A"]]);

// Frozen original-source decisions.
assert.equal(fullGrid.zeroBytes, 2);
assert.equal(fullGrid.acCount, 18);
assert.equal(fullGrid.radCount, 14);
assert.equal(fullGrid.radAcMutualCycleCount, 0);
assert.equal(fullGrid.acToRadPathCount, 3);
assert.equal(mod8Strip.zeroBytes, 0);
assert.equal(mod8Strip.acCount, 6);
assert.equal(mod8Strip.radCount, 6);
assert.equal(mod8Strip.radAcMutualCycleCount, 0);
assert.equal(mod8Strip.acToRadPathCount, 0);
assert.equal(literalStrip.zeroBytes, 1);
assert.equal(literalStrip.acCount, 7);
assert.equal(literalStrip.radCount, 1);
assert.equal(literalStrip.radAcMutualCycleCount, 0);
assert.equal(literalStrip.acToRadPathCount, 0);

const lp2GridTransfer = {
  sourceSelection:{
    cell6Number:byCell.get(6).number, cell7Number:byCell.get(7).number,
    mod8ZeroBasedColumns:mod8Columns,
    mod8PrintedColumns:mod8Columns.map(x => x + 1),
    literalCellNumberPrintedColumns:literalCellColumns.map(x => x + 1),
  },
  fullGrid, mod8Strip, literalStrip, positiveControl,
};

function isPrime(n) {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
  return true;
}
const fragmentEvents = [];
for (const page of ink.pages) {
  const sourcePage = corpus.pages[page.page];
  for (const span of page.red_spans || []) {
    for (let i = 0; i < span.length; i++) {
      fragmentEvents.push({
        page:page.page, offset:span.start + i, kind:1,
        rune:sourcePage.indices[span.start + i],
      });
    }
  }
  for (const mark of page.large_punctuation || []) {
    if (mark[1] === 13) fragmentEvents.push({page:page.page, offset:mark[0], kind:0});
  }
}
// A 13-dot mark is a boundary before the red rune at the same normalized offset.
fragmentEvents.sort((a,b) => a.page - b.page || a.offset - b.offset || a.kind - b.kind);
const fragments = [];
let fragment = [];
for (const event of fragmentEvents) {
  if (event.kind === 0) { fragments.push(fragment); fragment = []; }
  else fragment.push(event);
}
fragments.push(fragment);
const fragmentLengths = fragments.map(x => x.length);
const expectedFragmentLengths = [
  13,0,16,0,3,0,11,0,0,14,12,0,9,11,0,16,
  0,19,0,10,0,8,0,3,0,59,9,0,5,0,7,0,
];
assert.equal(fragments.length, 32);
assert.deepEqual(fragmentLengths, expectedFragmentLengths);
const wrap32 = n => (((n % 32) + 32) % 32) || 32;
function fragmentInfo(index, label) {
  const f = fragments[index - 1];
  const positions = label === undefined ? [] : f
    .map((x,i) => corpus.translit[x.rune] === label ? i + 1 : null)
    .filter(x => x !== null);
  return {
    index, length:f.length,
    translit:f.map(x => corpus.translit[x.rune]).join(" "),
    labelPositions:positions,
    first:f.length ? corpus.translit[f[0].rune] : null,
    last:f.length ? corpus.translit[f[f.length - 1].rune] : null,
    firstLocation:f.length ? {page:f[0].page,offset:f[0].offset} : null,
    lastLocation:f.length ? {page:f[f.length - 1].page,offset:f[f.length - 1].offset} : null,
  };
}
const uniqueNumbers = [...new Set(magic.flat())];
const uniqueBridge = uniqueNumbers.map(number => {
  const totient = phi(number), label = corpus.translit[mod(totient)];
  const nFragment = wrap32(number), phiFragment = wrap32(totient);
  const nf = fragments[nFragment - 1], pf = fragments[phiFragment - 1];
  const contains = f => f.length > 0 && f.some(x => corpus.translit[x.rune] === label);
  const nContains = contains(nf), phiContains = contains(pf);
  return {
    number, totient, label, nMod32Fragment:nFragment, phiMod32Fragment:phiFragment,
    nFragment:fragmentInfo(nFragment,label),
    phiFragment:fragmentInfo(phiFragment,label),
    oneEmptyOneLabel:(nf.length === 0 && phiContains) || (pf.length === 0 && nContains),
  };
});
const primeBridge = uniqueBridge.filter(x => isPrime(x.number));
assert.deepEqual(primeBridge.map(x => x.number), [131,151,199]);
assert(primeBridge.every(x => x.oneEmptyOneLabel));
const selected199 = primeBridge.find(x => x.number === 199);
assert.equal(selected199.totient, 198);
assert.equal(selected199.label, "A");
assert.equal(selected199.nMod32Fragment, 7);
assert.equal(selected199.phiMod32Fragment, 6);
assert.equal(fragments[5].length, 0);
assert.equal(fragments[6].length, 11);
assert.equal(corpus.translit[fragments[6][0].rune], "A");
const markers = fragmentEvents.filter(x => x.kind === 0);
const selected199Bridge = {
  ...selected199,
  emptyFragment:fragmentInfo(6,"A"),
  acFragment:fragmentInfo(7,"A"),
  boundaries:{
    beforeEmpty:markers[4],
    betweenEmptyAndAc:markers[5],
    afterAc:markers[6],
  },
};

const primePairSlots = primeBridge.map(x => ({
  phiFragment:x.phiMod32Fragment,
  nFragment:x.nMod32Fragment,
  label:x.label,
}));
function countPrimePairAssignments(orientation) {
  const slots = [];
  for (let k = 0; k < primePairSlots.length; k++) {
    const p = primePairSlots[k], reverse = (orientation >> k) & 1;
    slots.push({role:reverse ? "label" : "empty", label:p.label});
    slots.push({role:reverse ? "empty" : "label", label:p.label});
  }
  const compatible = fragments.map(f => slots.map(s =>
    s.role === "empty" ? f.length === 0 :
      f.length > 0 && f.some(x => corpus.translit[x.rune] === s.label)
  ));
  let dp = Array(1 << 6).fill(0n);
  dp[0] = 1n;
  for (let f = 0; f < fragments.length; f++) {
    const next = dp.slice();
    for (let mask = 0; mask < (1 << 6); mask++) if (dp[mask]) {
      for (let j = 0; j < 6; j++) if (!(mask & (1 << j)) && compatible[f][j]) {
        next[mask | (1 << j)] += dp[mask];
      }
    }
    dp = next;
  }
  return dp[(1 << 6) - 1];
}
const orientationCounts = Array.from({length:8}, (_,mask) => countPrimePairAssignments(mask));
const favorablePrimeAssignments = orientationCounts.reduce((a,b) => a + b, 0n);
let totalPrimeAssignments = 1n;
for (let i = 0; i < 6; i++) totalPrimeAssignments *= BigInt(32 - i);
const conditionalPrimePairProbability =
  Number(favorablePrimeAssignments) / Number(totalPrimeAssignments);

function pairHit(permutation, item) {
  const a = permutation[item.nMod32Fragment - 1];
  const b = permutation[item.phiMod32Fragment - 1];
  const has = f => f.length > 0 && f.some(x => corpus.translit[x.rune] === item.label);
  return (a.length === 0 && has(b)) || (b.length === 0 && has(a));
}
const observedAllValueMatches = uniqueBridge.filter(x => x.oneEmptyOneLabel).length;
let rngState = 0x3301;
function seededRandom() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return (rngState >>> 0) / 4294967296;
}
const permutationSamples = 500000;
let tailMatches = 0, totalMatches = 0;
for (let sample = 0; sample < permutationSamples; sample++) {
  const permutation = fragments.slice();
  for (let i = permutation.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  let matches = 0;
  for (const item of uniqueBridge) if (pairHit(permutation,item)) matches++;
  totalMatches += matches;
  if (matches >= observedAllValueMatches) tailMatches++;
}
const allValuePermutationNull = {
  seed:"0x3301", samples:permutationSamples,
  observedMatches:observedAllValueMatches,
  meanMatches:totalMatches / permutationSamples,
  tailAtLeastObserved:tailMatches / permutationSamples,
};
const cycleFragmentAlignment = cycles.map(ids => ({
  cells:ids.map(cellId => {
    const cell = byCell.get(cellId), f = fragments[cellId - 1];
    const info = fragmentInfo(cellId,cell.translit);
    return {
      cell:cellId, rune:cell.translit, ...info,
      emptyOrContainsLabel:f.length === 0 || info.labelPositions.length > 0,
    };
  }),
}));
assert(cycleFragmentAlignment.every(c => c.cells.every(x => x.emptyOrContainsLabel)));
const fragmentBridge = {
  fragmentCount:fragments.length, fragmentLengths,
  primeBridge, selected199Bridge,
  cycleFragmentAlignment,
  all13UniqueValues:uniqueBridge,
  conditionalPrimePairNull:{
    favorableAssignments:favorablePrimeAssignments.toString(),
    totalAssignments:totalPrimeAssignments.toString(),
    probability:conditionalPrimePairProbability,
    interpretation:"conditional on the three prime entries and the fixed n/phi(n) mod-32 pairs; not a global p-value",
  },
  allValuePermutationNull,
};

console.log(JSON.stringify({magicSquare:magicResult, lp2GridTransfer, fragmentBridge}, null, 2));
