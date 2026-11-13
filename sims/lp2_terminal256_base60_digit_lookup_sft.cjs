'use strict';

// Exact original-terminal known-plaintext gate for additive secret high-/low-base60 digit lookup.
// Windows 11 / Node 22: run this single file directly with Node from any working directory.
// No data-dependent tuning or external dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const load = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8'));
const source = load('lp2-corpus.json');
const grid = load('base60-grid.json').byte_rows.flat();
assert.equal(grid.length, 256);
assert.equal(source.pages[55].indices.length, 76);
assert.equal(source.pages[56].indices.length, 85);
assert.equal(source.pages[57].indices.length, 95);

const MOD = 29;
const mod = (x) => (x % MOD + MOD) % MOD;
const expected = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const alphabet = source.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} sentence @returns {number[]} */
function toGp(sentence) {
  /** @type {number[]} */
  const out = [];
  for (const word of sentence.split(' ')) {
    for (let i = 0; i < word.length;) {
      const item = alphabet.find(({ token }) => word.startsWith(token, i));
      assert.ok(item, 'No rune for: ' + word.slice(i));
      out.push(item.index);
      i += item.token.length;
    }
  }
  return out;
}

/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  /** @type {number[]} */
  const primes = [];
  for (let candidate = 2; primes.length < n; candidate++) {
    let prime = true;
    for (const p of primes) {
      if (p * p > candidate) break;
      if (candidate % p === 0) { prime = false; break; }
    }
    if (prime) primes.push(candidate);
  }
  return primes;
}

const p56Cipher = source.pages[56].indices;
const primes = firstPrimes(p56Cipher.length);
let primeClock = 0;
const p56 = p56Cipher.map((rune, i) => i === 56 ? 0 : mod(rune - (primes[primeClock++] - 1)));
assert.equal(primeClock, 84);
assert.deepEqual(p56, toGp(expected), 'Authentic 85-rune p56 phi-prime decryption must be exact');
const known = p56.concat(source.pages[57].indices);
assert.equal(known.length, 180);

/** @param {number} depth @returns {number[]} */
function ring(depth) {
  const result = [];
  for (let c = depth; c <= 7 - depth; c++) result.push(depth * 8 + c);
  for (let r = depth + 1; r <= 31 - depth; r++) result.push(r * 8 + 7 - depth);
  for (let c = 6 - depth; c >= depth; c--) result.push((31 - depth) * 8 + c);
  for (let r = 30 - depth; r > depth; r--) result.push(r * 8 + depth);
  return result;
}

/**
 * Four independently chosen corner origins, either perimeter direction.
 * @param {number} depth
 * @returns {number[][]}
 */
function orientations(depth) {
  const route = ring(depth);
  const starts = [
    depth * 8 + depth,
    depth * 8 + 7 - depth,
    (31 - depth) * 8 + 7 - depth,
    (31 - depth) * 8 + depth
  ];
  return starts.flatMap((corner) => {
    const offset = route.indexOf(corner);
    assert.ok(offset >= 0);
    return [1, -1].map((step) => route.map((_, i) => route[(offset + step * i + 2 * route.length) % route.length]));
  });
}
const paths = [1, 2, 3].map(orientations);
assert.deepEqual(paths.map((p) => p[0].length), [68, 60, 52]);

/**
 * Potential union-find for f(high)+g(low)=known GP index mod29.
 * Encode vertex 0..4 as f(high); vertex 5..64 as -g(low).
 * Every row requires vertex[high]-vertex[5+low]=target.
 * When a cycle contradicts its modular sum, no possible secret lookup fits.
 * @param {number[]} positions
 * @param {number[]} target
 * @returns {{ conflicts:number, firstConflict:number, independent:number, rank:number }}
 */
function checkLookup(positions, target) {
  assert.equal(positions.length, target.length);
  const parent = Array.from({ length: 65 }, (_, i) => i);
  const delta = Array(65).fill(0);
  const depth = Array(65).fill(0);
  /** @param {number} i @returns {number} */
  function root(i) {
    if (parent[i] === i) return i;
    const ancestor = parent[i];
    const result = root(ancestor);
    delta[i] = mod(delta[i] + delta[ancestor]);
    parent[i] = result;
    return result;
  }
  let conflicts = 0;
  let firstConflict = -1;
  let independent = 0;
  for (let i = 0; i < positions.length; i++) {
    const value = grid[positions[i]];
    const x = Math.floor(value / 60);
    const y = 5 + value % 60;
    const t = target[i];
    assert.ok(Number.isInteger(t) && t >= 0 && t < 29);
    const a = root(x);
    const b = root(y);
    const dx = delta[x];
    const dy = delta[y];
    if (a === b) {
      if (mod(dx - dy - t) !== 0) {
        conflicts++;
        if (firstConflict === -1) firstConflict = i;
      }
      continue;
    }
    independent++;
    if (depth[a] < depth[b]) {
      parent[a] = b;
      delta[a] = mod(t + dy - dx);
    } else {
      parent[b] = a;
      delta[b] = mod(dx - dy - t);
      if (depth[a] === depth[b]) depth[a]++;
    }
  }
  const components = new Set(parent.map((_, i) => root(i))).size;
  assert.equal(independent, 65 - components);
  return { conflicts, firstConflict, independent, rank: independent };
}

/**
 * A strictly larger model: arbitrary static mapping from every printed
 * byte 0..255 to any GP29 symbol, with no digit separability requirement.
 * This grants 256 secret entries, including keys for bytes not observed.
 * A contradictory duplicate byte implies no such model can work.
 * @param {number[]} positions
 * @param {number[]} target
 * @returns {{contradictions:number, firstConflict:number, usedEntries:number}}
 */
function checkByteLookup(positions, target) {
  assert.equal(positions.length, target.length);
  const table = Array(256).fill(-1);
  let contradictions = 0;
  let firstConflict = -1;
  let usedEntries = 0;
  for (let i = 0; i < positions.length; i++) {
    const byte = grid[positions[i]];
    const gp = target[i];
    if (table[byte] === -1) {
      table[byte] = gp;
      usedEntries++;
    } else if (table[byte] !== gp) {
      contradictions++;
      if (firstConflict < 0) firstConflict = i;
    }
  }
  return { contradictions, firstConflict, usedEntries };
}


/**
 * Exact closest fit for every possible stationary GP29 byte codebook.
 * For each source-byte equality class, select its most frequent target
 * rune. Distinct-byte classes have independent secret mapping entries.
 * @param {number[]} positions
 * @param {number[]} target
 * @returns {{bestMatches:number,minEdits:number,distinctBytes:number,conflictingBytes:number}}
 */
function minimumByteCodebookRepair(positions, target) {
  assert.equal(positions.length, target.length);
  const groups = new Map();
  for (let i = 0; i < positions.length; i++) {
    const b = grid[positions[i]];
    if (!groups.has(b)) groups.set(b, Array(29).fill(0));
    groups.get(b)[target[i]]++;
  }
  let bestMatches = 0, conflictingBytes = 0;
  for (const votes of groups.values()) {
    bestMatches += Math.max(...votes);
    if (votes.filter(x => x !== 0).length > 1) conflictingBytes++;
  }
  return { bestMatches, minEdits: target.length - bestMatches,
    distinctBytes: groups.size, conflictingBytes };
}

// Stronger necessary-condition gate: each inner ring must fit independently,
// even if each ring has its own arbitrary 256-entry secret codebook and the
// producer can start at ANY boundary site in either winding direction.
const ringCounts = [68, 60, 52];
let ringStart = 0;
const completeRingGates = [1, 2, 3].map((depth) => {
  const sourceRing = ring(depth);
  assert.equal(sourceRing.length, ringCounts[depth - 1]);
  const target = known.slice(ringStart, ringStart + sourceRing.length);
  ringStart += sourceRing.length;
  let best = { contradictions: Infinity };
  let zeroFits = 0;
  let tested = 0;
  for (let offset = 0; offset < sourceRing.length; offset++) {
    for (const direction of [1, -1]) {
      const position = sourceRing.map((_, i) =>
        sourceRing[(offset + direction * i + sourceRing.length * 2) % sourceRing.length]);
      const result = checkByteLookup(position, target);
      tested++;
      if (result.contradictions === 0) zeroFits++;
      if (result.contradictions < best.contradictions)
        best = { ...result, offset, direction };
    }
  }
  assert.equal(tested, 2 * sourceRing.length);
  assert.equal(zeroFits, 0);
  // Planted independent per-ring 256-byte static map on original numerical cells.
  const route = sourceRing;
  const shadowByteMap = Array.from({ length: 256 }, (_, i) => mod(13 * i + 9));
  const shadow = route.map(idx => shadowByteMap[grid[idx]]);
  assert.equal(checkByteLookup(route, shadow).contradictions, 0);
  return { depth, knownRunes: sourceRing.length, orientations: tested, zeroFits, best };
});
assert.equal(ringStart, 180);
assert.deepEqual(completeRingGates.map(g => g.best.contradictions), [5, 5, 4]);

const byteHistogram = new Map();
let bestByte = { contradictions: Infinity };
for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) for (let c = 0; c < 8; c++) {
  const position = paths[0][a].concat(paths[1][b], paths[2][c]);
  const result = checkByteLookup(position, known);
  byteHistogram.set(result.contradictions,
    (byteHistogram.get(result.contradictions) ?? 0) + 1);
  if (result.contradictions < bestByte.contradictions)
    bestByte = { ...result, orientation: [a, b, c] };
}
assert.equal([...byteHistogram.values()].reduce((a, b) => a + b, 0), 512);
assert.equal(byteHistogram.get(0) ?? 0, 0);
assert.deepEqual(bestByte,
  { contradictions: 44, firstConflict: 24, usedEntries: 127, orientation: [7, 5, 4] });
// Independent 256-entry secret codebook plant on genuine original grid values.
const histogram = new Map();
let best = { conflicts: Infinity, orientation: [] };
for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) for (let c = 0; c < 8; c++) {
  const position = paths[0][a].concat(paths[1][b], paths[2][c]);
  const result = checkLookup(position, known);
  histogram.set(result.conflicts, (histogram.get(result.conflicts) ?? 0) + 1);
  if (result.conflicts < best.conflicts) best = { ...result, orientation: [a, b, c] };
}
assert.equal([...histogram.values()].reduce((a, b) => a + b, 0), 512);
assert.equal(histogram.get(0) ?? 0, 0);
assert.deepEqual(best, { conflicts: 106, firstConflict: 24, independent: 60, rank: 60, orientation: [7, 5, 2] });

// Independent source-length planted GP29 positive control exercises the exact 180-cell inverse.
const secretHigh = [5, 13, 7, 1, 20];
const secretLow = Array.from({ length: 60 }, (_, i) => mod(11 * i * i + 7 * i + 13));
const plantedRoute = paths[0][4].concat(paths[1][1], paths[2][7]);
const byteCodebook = Array.from({ length: 256 }, (_, x) => mod(17 * x + 12));
const bytePlanted = plantedRoute.map(idx => byteCodebook[grid[idx]]);
assert.deepEqual(checkByteLookup(plantedRoute, bytePlanted),
  { contradictions: 0, firstConflict: -1, usedEntries:
    new Set(plantedRoute.map(idx => grid[idx])).size });
const planted = plantedRoute.map((idx) =>
  mod(secretHigh[Math.floor(grid[idx] / 60)] + secretLow[grid[idx] % 60]));
assert.deepEqual(checkLookup(plantedRoute, planted),
  { conflicts: 0, firstConflict: -1, independent: 60, rank: 60 });


// Globally optimal Hamming repair count, granting all 256 secret byte entries.
// Unlike the online first-observation witness, this is the exact minimum
// number of altered known runes needed for any stationary secret table.
const exactRepairHistogram = new Map();
let exactRepairBest = { minEdits: Infinity };
for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) for (let c = 0; c < 8; c++) {
  const positions = paths[0][a].concat(paths[1][b], paths[2][c]);
  const r = minimumByteCodebookRepair(positions, known);
  exactRepairHistogram.set(r.minEdits, (exactRepairHistogram.get(r.minEdits) ?? 0) + 1);
  if (r.minEdits < exactRepairBest.minEdits)
    exactRepairBest = { ...r, orientation: [a, b, c] };
}
assert.deepEqual(exactRepairBest, {
  bestMatches: 137, minEdits: 43,
  distinctBytes: 127, conflictingBytes: 34, orientation: [7, 5, 2]
});
assert.equal([...exactRepairHistogram.values()].reduce((a,b)=>a+b,0),512);
assert.deepEqual([...exactRepairHistogram.keys()].sort((a,b)=>a-b),[43,44,45,46,47,48,49,50,51,52,53]);
const naturalRowMajor = minimumByteCodebookRepair(
  Array.from({ length: 180 }, (_, i) => i + 76), known
);
assert.deepEqual(naturalRowMajor, {
  bestMatches: 133, minEdits: 47, distinctBytes: 129, conflictingBytes: 42
});
const independentRingRepairs = [];
let ringKnownOffset = 0;
for (const depth of [1,2,3]) {
  const sourceRing = ring(depth);
  const target = known.slice(ringKnownOffset, ringKnownOffset + sourceRing.length);
  ringKnownOffset += sourceRing.length;
  let minEdits = Infinity, maxEdits = 0;
  for (let start = 0; start < sourceRing.length; start++) {
    for (const direction of [1,-1]) {
      const positions = sourceRing.map((_,i)=>
        sourceRing[(start + direction*i + 2*sourceRing.length) % sourceRing.length]);
      const r = minimumByteCodebookRepair(positions,target);
      minEdits = Math.min(minEdits,r.minEdits);
      maxEdits = Math.max(maxEdits,r.minEdits);
    }
  }
  independentRingRepairs.push({ depth, knownRunes: sourceRing.length, minEdits, maxEdits });
}
assert.equal(ringKnownOffset,180);
assert.deepEqual(independentRingRepairs.map(x=>x.minEdits),[5,5,4]);
const exactPlant = minimumByteCodebookRepair(plantedRoute,bytePlanted);
assert.equal(exactPlant.minEdits,0);

console.log(JSON.stringify({
  source: 'original LP2 pp49-51 grid, solved p56 and clear p57',
  hypothesis: 'independent arbitrary secret GF29 addends per high/low base60 digit',
  gridCells: grid.length,
  heldoutUnknownOuter: 76,
  actualKnownInner: known.length,
  testedOrientations: 512,
  lookupUnknowns: 65,
  best,
  histogram: Object.fromEntries([...histogram].sort((x, y) => x[0] - y[0])),
  positivePlant: 'PASS 180/180',
  unrestrictedByteCodebook: {
    exactMinimumRepairs: { naturalRowMajor, all512Best: exactRepairBest,
      histogram: Object.fromEntries([...exactRepairHistogram].sort((a,b)=>a[0]-b[0])),
      perRingEveryStart: independentRingRepairs, positivePlantMinEdits: exactPlant.minEdits },
    secretEntries: 256,
    independentCompleteRings: completeRingGates,
    testedOrientations: 512,
    best: bestByte,
    histogram: Object.fromEntries([...byteHistogram].sort((x, y) => x[0] - y[0])),
    positivePlant: 'PASS 180/180'
  },
  status: 'PASS: no original exact secret-digit-additive fit'
}, null, 2));
