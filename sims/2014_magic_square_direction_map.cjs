#!/usr/bin/env node
"use strict";

// Reproduce the 2014 stage04 Rad <-> Ac direction map and test its simplest
// source-motivated transfer to the original LP2 32x8 base-60 byte table.
// Run from the repository root:
//   node sims/2014_magic_square_direction_map.cjs

const assert = require("node:assert/strict");
const fs = require("node:fs");

const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
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
console.log(JSON.stringify({magicSquare:magicResult, lp2GridTransfer}, null, 2));
