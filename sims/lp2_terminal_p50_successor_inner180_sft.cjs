"use strict";
/**
 * Single runnable test: original p50 first-interior graph decoder.
 * Uses the source's 32x8 base60 byte table and the exact solved p56/p57 GP29
 * rune controls to test a frozen p55 perimeter continuation.
 * Compatible with Windows Node.js 22; no third-party dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = name => JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", name), "utf8"));
const grid = load("base60-grid.json").byte_rows.flat();
const corpus = load("lp2-corpus.json");
const ref = fs.readFileSync(path.join(root, "resources", "liber-primus", "lp1-plaintext-reference.txt"), "utf8");
assert.equal(grid.length, 256);
const symbols = corpus.translit.map((symbol, i) => ({ symbol, i }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} text @returns {number[]} */
function gp(text) {
  const source = text.toUpperCase().replaceAll("ING", "NG").replaceAll("K", "C")
    .replaceAll("V", "U").replaceAll("Q", "CW").replaceAll("Z", "S");
  const result = [];
  for (let p = 0; p < source.length;) {
    if (!/[A-Z]/.test(source[p])) { p++; continue; }
    const found = symbols.find(x => source.startsWith(x.symbol, p));
    assert.ok(found, "Unencodable GP29 source at offset " + p);
    result.push(found.i);
    p += found.symbol.length;
  }
  return result;
}
const section56 = ref.split("### 56\n")[1].split("### 57\n")[0];
const plain56 = gp(section56.split("\n").filter(x => !/^[\da-f]{20,}$/i.test(x.trim())).join("\n"));
const plain57 = gp(ref.split("### 57\n")[1]);
assert.equal(plain56.length, 85);
assert.deepEqual(plain57, corpus.pages[57].indices);
const primes = [];
for (let n = 2; primes.length < 100; n++) {
  if (primes.every(p => p * p > n || n % p !== 0)) primes.push(n);
}
let clock = 0;
const encrypted56 = plain56.map(p => p === 0 ? 0 : (p + primes[clock++] - 1) % 29);
assert.deepEqual(encrypted56, corpus.pages[56].indices);
assert.equal(clock, 84);
const knownPlain = plain56.concat(plain57);
const knownVisible = corpus.pages[56].indices.concat(corpus.pages[57].indices);
assert.equal(knownPlain.length, 180);

const inside = [];
const outside = [];
for (let row = 0; row < 32; row++) {
  for (let col = 0; col < 8; col++) {
    const pos = row * 8 + col;
    (row === 0 || row === 31 || col === 0 || col === 7 ? outside : inside).push(pos);
  }
}
const innerRank = new Map(inside.map((pos, i) => [pos, i]));
assert.equal(inside.length, 180);
assert.equal(outside.length, 76);
const rim = [
  ...Array.from({ length: 8 }, (_, j) => j),
  ...Array.from({ length: 31 }, (_, j) => (j + 1) * 8 + 7),
  ...Array.from({ length: 7 }, (_, j) => 31 * 8 + 6 - j),
  ...Array.from({ length: 30 }, (_, j) => (30 - j) * 8)
];
assert.equal(new Set(rim).size, 76);
function firstInterior(start) {
  let pos = start;
  for (let depth = 0; depth <= 256; depth++) {
    if (innerRank.has(pos)) return { pos, depth };
    pos = grid[pos];
  }
  throw new Error("Outside-only successor cycle at " + start);
}
const landed = rim.map(firstInterior);
assert.equal(new Set(landed.map(x => x.pos)).size, 49);
assert.equal(Math.max(...landed.map(x => x.depth)), 4);

/**
 * Exact lower bound on violations for any secret deterministic f:
 * label(cell)=f(label(successor(cell)),phase(cell)).
 * @param {number[]} labels
 * @param {(cell:number)=>number} phase
 */
function unaryBound(labels, phase = () => 0) {
  const byCell = new Map(inside.map((cell, i) => [cell, labels[i]]));
  const classes = new Map();
  let edges = 0;
  for (const cell of inside) {
    const successor = grid[cell];
    if (!byCell.has(successor)) continue;
    edges++;
    const key = String(phase(cell)) + ":" + String(byCell.get(successor));
    const freq = classes.get(key) || new Map();
    const output = byCell.get(cell);
    freq.set(output, (freq.get(output) || 0) + 1);
    classes.set(key, freq);
  }
  let possible = 0;
  let contradictoryClasses = 0;
  for (const freq of classes.values()) {
    possible += Math.max(...freq.values());
    if (freq.size > 1) contradictoryClasses++;
  }
  return { edges, classes: classes.size, contradictoryClasses, forcedErrors: edges - possible };
}
function bestAffine(labels) {
  const byCell = new Map(inside.map((cell, i) => [cell, labels[i]]));
  let best = { a: 0, b: 0, matches: 0 };
  for (let a = 1; a < 29; a++) for (let b = 0; b < 29; b++) {
    let count = 0;
    for (const cell of inside) {
      if (byCell.has(grid[cell]) && byCell.get(cell) === (a * byCell.get(grid[cell]) + b) % 29) count++;
    }
    if (count > best.matches) best = { a, b, matches: count };
  }
  return best;
}
/** @param {number[]} xs */
function ioc(xs) {
  const f = Array(29).fill(0);
  xs.forEach(x => f[x]++);
  return f.reduce((sum, n) => sum + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}
const asGP = xs => xs.map(x => corpus.translit[x]).join("");

// Genuine 256-node positive plant: involution f(x)=1-x over GP29.
// Two-cycle labels alternate 5/25, and the 11-cycle is fixed at 15.
const plant = Array(256).fill(-1);
plant[249] = 5; plant[158] = 25;
for (let start = 0; start < 256; start++) {
  const trail = [];
  let cell = start;
  while (plant[cell] === -1 && !trail.includes(cell)) {
    trail.push(cell); cell = grid[cell];
  }
  if (trail.includes(cell)) for (const v of trail) plant[v] = 15;
  for (let k = trail.length - 1; k >= 0; k--) {
    const v = trail[k];
    if (plant[v] === -1) plant[v] = (1 - plant[grid[v]] + 29) % 29;
  }
}
assert.ok(plant.every(x => x >= 0 && x < 29));
for (let i = 0; i < 256; i++) assert.equal(plant[i], (1 - plant[grid[i]] + 29) % 29);
assert.equal(unaryBound(inside.map(i => plant[i])).forcedErrors, 0);

console.log("Known plaintext: p56 85/85 prime-totient/F transparent re-encryption; p57 95/95 exact GP glyphs.");
console.log("Natural geometry: 76 perimeter, 180 interior; all perimeter walkers arrive in 1..4 hops at 49 distinct interior cells.");
console.log("Positive secret function control: f(x)=1-x, all 256 original graph edges satisfied.");
for (const [register, known] of [["printed C56+C57", knownVisible], ["solved P56+P57", knownPlain]]) {
  const result = {
    unrestricted: unaryBound(known),
    rowParity: unaryBound(known, cell => Math.floor(cell / 8) % 2),
    colParity: unaryBound(known, cell => cell % 2),
    bestAffine: bestAffine(known)
  };
  assert.equal(result.unrestricted.edges, 130);
  assert.ok(result.unrestricted.forcedErrors >= 90);
  console.log(register + ":", JSON.stringify(result));
}
const rimKey = landed.map(x => knownPlain[innerRank.get(x.pos)]);
const cipher55 = corpus.pages[55].indices;
assert.equal(cipher55.length, 76);
console.log("Original p55 IoC:", ioc(cipher55).toFixed(8));
console.log("Direct first-interior GP readout:", asGP(rimKey));
console.log("Direct readout IoC:", ioc(rimKey).toFixed(8),
  "unchanged rune positions:", rimKey.filter((p, i) => p === cipher55[i]).length);
for (const [name, keyFunction] of [
  ["GP index", x => x],
  ["GP prime", x => corpus.prime[x] % 29],
  ["GP totient prime", x => (corpus.prime[x] - 1) % 29]
]) {
  for (const direction of [-1, 1]) {
    const output = cipher55.map((p, i) => (p + 29 + direction * keyFunction(rimKey[i])) % 29);
    console.log(name + " sign " + direction + " IoC " + ioc(output).toFixed(8) +
      " readout " + asGP(output));
    assert.ok(ioc(output) < 0.05);
  }
}
console.log("PASS. No actual p55 plaintext or usable original inverse was recovered.");
