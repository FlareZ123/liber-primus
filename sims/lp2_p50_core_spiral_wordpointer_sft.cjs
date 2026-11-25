#!/usr/bin/env node
'use strict';

// Source-constrained test of a spiral-addressed p50 core word-pointer map.
// p15: marked outward number spiral; p57: "WE MUST SHED OUR OWN CIRCUMFERENCES";
// Authenticated 2016 message:
// "Its words are the map ... their numbers are the direction."
//
// Two circumferences removed from the 32x8 p50 table leave a 28x4 core.
// GP0(word) indexes the core's spiral order; each cell's base-59 value is
// the next address. All eight dihedral spiral orientations and both radices
// are tested against the complete 20-word p57 source sequence.

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const solved = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const p57Section = solved.sections.find(s => s.name === 'p57_parable');
if (!p57Section) throw new Error('missing solved p57 source section');

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const words = (p57Section.source_text.replace(/\/\s*/gu, '').match(/[\u16A0-\u16FF]+/gu) || [])
  .map(w => [...w].map(r => {
    const v = runeIndex.get(r);
    if (v === undefined) throw new Error('unknown p57 rune');
    return v;
  }));
const p57 = words.map((a, i) => ({
  position: i + 1,
  word: a.map(v => corpus.translit[v]).join(''),
  addr: a.reduce((sum, v) => sum + v, 0)
}));
const we = p57.find(w => w.word === 'WE');
const must = p57.find(w => w.word === 'MUST');
if (!we || !must || we.addr !== 25 || must.addr !== 51) throw new Error('p57 GP0 anchor mismatch');

const tokens = grid.pages.flatMap(p => p.tokens);
if (tokens.length !== 256) throw new Error('p50 table is not 256 cells');
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace('f', '');
const value = (token, alphabet) => alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]);
const full = Array.from({ length: 32 }, (_, r) => Array.from({ length: 8 }, (_, c) => r * 8 + c));
const core = full.slice(2, 30).map(row => row.slice(2, 6));
if (core.length !== 28 || core[0].length !== 4) throw new Error('two-shell core shape mismatch');

function transform(matrix, rotations, flip) {
  let a = matrix.map(row => row.slice());
  if (flip) a = a.map(row => row.slice().reverse());
  for (let i = 0; i < rotations; i++)
    a = a[0].map((_, c) => a.map(row => row[c]).reverse());
  return a;
}
function spiral(matrix) {
  let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
  const out = [];
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push(matrix[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) out.push(matrix[r][right]);
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) out.push(matrix[bottom][c]);
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) out.push(matrix[r][left]);
      left++;
    }
  }
  return out;
}
const coreLocal = Array.from({ length: 28 }, (_, r) => Array.from({ length: 4 }, (_, c) => r * 4 + c));
const variants = [];
for (let flip = 0; flip < 2; flip++)
  for (let rot = 0; rot < 4; rot++)
    variants.push({ rot, flip: !!flip, order: spiral(transform(coreLocal, rot, !!flip)) });

const scopes = [
  { name: 'core28x4', matrix: core },
  { name: 'full32x8', matrix: full }
];
const results = [];
for (const scope of scopes) {
  for (let flip = 0; flip < 2; flip++) {
    for (let rot = 0; rot < 4; rot++) {
      const order = spiral(transform(scope.matrix, rot, !!flip));
      for (const [base, alphabet] of [['59', alpha59], ['60', alpha60]]) {
        const pointer = addr => addr >= 0 && addr < order.length
          ? value(tokens[order[addr]], alphabet) : null;
        const adjacent = [];
        for (let i = 0; i < p57.length - 1; i++) {
          const a = p57[i], b = p57[i + 1];
          if (a.addr < order.length && b.addr < order.length && pointer(a.addr) === b.addr)
            adjacent.push({ from: a.word, fromAddr: a.addr, to: b.word, toAddr: b.addr });
        }
        const unique = [...new Set(p57.map(w => w.addr).filter(a => a < order.length))];
        const mutual = [];
        for (let i = 0; i < unique.length; i++)
          for (let j = i + 1; j < unique.length; j++) {
            const a = unique[i], b = unique[j];
            if (pointer(a) === b && pointer(b) === a) mutual.push([a, b]);
          }
        results.push({
          scope: scope.name, rot, flip: !!flip, base,
          adjacent, mutual,
          WEtoMUST: pointer(25) === 51,
          MUSTtoWE: pointer(51) === 25
        });
      }
    }
  }
}

// Explicit physical-cell trace for the unique source-word cycle.
const selected = results.find(r => r.scope === 'core28x4' && r.rot === 3 && !r.flip && r.base === '59');
const selectedOrder = spiral(transform(core, 3, false)); // 90-degree CCW transform => top-right clockwise
const trace = [25, 51].map(addr => {
  const cell = selectedOrder[addr], token = tokens[cell];
  return {
    word: p57.find(w => w.addr === addr)?.word,
    address: addr,
    originalTableCell: cell,
    row: Math.floor(cell / 8),
    column: cell % 8,
    token,
    base59Value: value(token, alpha59)
  };
});
if (trace[0].token !== '0q' || trace[0].base59Value !== 51 ||
    trace[1].token !== '0P' || trace[1].base59Value !== 25)
  throw new Error('WE/MUST spiral pointer trace changed');

// Conditional randomization null: shuffle the 112 base-59 values while
// preserving their multiset; test all eight core spiral orientations.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const coreValues = core.flatMap((row, r) => row.map((_, c) => {
  const cell = (r + 2) * 8 + (c + 2);
  return value(tokens[cell], alpha59);
}));
const wordAddresses = [...new Set(p57.map(w => w.addr).filter(a => a < 112))];
const adjacentPairs = p57.slice(0, -1).map((w, i) => ({ a: w.addr, b: p57[i + 1].addr }))
  .filter(p => p.a < 112 && p.b < 112);
const random = rng(0x3301), permutations = 100000;
let weEdge = 0, weMutual = 0, anyMutual = 0, anyAdjacent = 0;
for (let it = 0; it < permutations; it++) {
  const perm = coreValues.slice();
  for (let i = perm.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  let edge = false, mutual = false, cycle = false, adjacentHit = false;
  for (const v of variants) {
    const pointer = a => perm[v.order[a]];
    if (pointer(25) === 51) edge = true;
    if (pointer(25) === 51 && pointer(51) === 25) mutual = true;
    for (let i = 0; i < wordAddresses.length; i++)
      for (let j = i + 1; j < wordAddresses.length; j++) {
        const a = wordAddresses[i], b = wordAddresses[j];
        if (pointer(a) === b && pointer(b) === a) cycle = true;
      }
    for (const p of adjacentPairs)
      if (pointer(p.a) === p.b) adjacentHit = true;
  }
  if (edge) weEdge++;
  if (mutual) weMutual++;
  if (cycle) anyMutual++;
  if (adjacentHit) anyAdjacent++;
}

console.log(JSON.stringify({
  method: {
    table: '32x8 original p49-p51 numeric table',
    peel: 'remove two outer circumferences: rows 2..29, columns 2..5 => 28x4',
    address: 'GP0(word) = sum of source GP29 rune indices',
    pointer: 'base-59 numeric value after removing lowercase f from the 60-symbol alphabet',
    traversal: 'eight dihedral spiral orientations; test base59 and base60 controls',
    selectedOrientation: 'top-right clockwise'
  },
  p57,
  results,
  selectedTrace: trace,
  randomization: {
    seed: '0x3301', permutations,
    specificWEtoMUSTEdgeRate: weEdge / permutations,
    specificWEMUSTMutualCycleRate: weMutual / permutations,
    anyP57WordMutualCycleRate: anyMutual / permutations,
    anyAdjacentP57WordEdgeRate: anyAdjacent / permutations,
    counts: { weEdge, weMutual, anyMutual, anyAdjacent }
  },
  interpretation: 'provisional navigation-structure candidate; not a plaintext decryption; spiral start/orientation still needs independent source selection'
}, null, 2));
