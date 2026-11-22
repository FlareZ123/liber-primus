#!/usr/bin/env node
"use strict";

/**
 * Original-source 32x8 grid -> terminal known-180 row-quadratic gate.
 *
 * Test an arbitrary secret quadratic f_r(x)=a_r*x^2+b_r*x+c_r (mod 29)
 * independently on every interior row of the printed 32x8 table.
 * If that family could map table bytes to the final known p56+p57 GP runes,
 * all six inner cells in all 30 rows must satisfy the same row polynomial.
 *
 * Two independent registrations: literal printed row-major 30x6 and the
 * 512 original concentric arrangements (four corners x two windings per ring).
 * Three input readings: full base60 value mod29, low sexagesimal digit mod29,
 * and high sexagesimal digit. No original p55 unknown plaintext is fitted.
 *
 * Run: node sims/lp2_terminal256_rowquadratic_allsecret_knownplain_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const bytes = grid.pages.flatMap(page => page.bytes);
assert.equal(bytes.length, 256);
assert.deepEqual(grid.pages.map(page => page.bytes.length), [80, 104, 72]);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);

/** @param {number} v @returns {number} */
function mod(v) {
  return ((v % 29) + 29) % 29;
}

/** @param {number} count @returns {number[]} */
function primes(count) {
  /** @type {number[]} */
  const found = [];
  for (let x = 2; found.length < count; x++) {
    let isPrime = true;
    for (let div = 2; div * div <= x; div++) {
      if (x % div === 0) { isPrime = false; break; }
    }
    if (isPrime) found.push(x);
  }
  return found;
}

/**
 * GP digraphs must not merge across original printed word boundaries.
 * @param {string} phrase
 * @returns {number[]}
 */
function tokenizeWords(phrase) {
  const alphabet = corpus.translit
    .map((token, index) => ({token, index}))
    .sort((a, b) => b.token.length - a.token.length);
  /** @type {number[]} */
  const runes = [];
  for (const word of phrase.split(" ")) {
    for (let i = 0; i < word.length;) {
      const entry = alphabet.find(({token}) => word.startsWith(token, i));
      assert.ok(entry, "GP tokenizer could not read " + word.slice(i));
      runes.push(entry.index);
      i += entry.token.length;
    }
  }
  return runes;
}

const solvedP56 =
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
  "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const p56Cipher = corpus.pages[56].indices;
const primesForP56 = primes(85);
let primeClock = 0;
const reconstructedP56 = p56Cipher.map((rune, i) => {
  if (i === 56) {
    assert.equal(rune, 0, "the single literal F in solved p56");
    return 0;
  }
  return mod(rune - (primesForP56[primeClock++] - 1));
});
assert.equal(primeClock, 84);
assert.deepEqual(reconstructedP56, tokenizeWords(solvedP56),
  "authentic p56 phi(prime) plaintext gate");
const known = [...reconstructedP56, ...corpus.pages[57].indices];
assert.equal(known.length, 180);

/**
 * @param {number} depth
 * @returns {[number, number][]}
 */
function ring(depth) {
  const top = depth, bottom = 31 - depth, left = depth, right = 7 - depth;
  /** @type {[number, number][]} */
  const cells = [];
  for (let c = left; c <= right; c++) cells.push([top, c]);
  for (let r = top + 1; r <= bottom; r++) cells.push([r, right]);
  for (let c = right - 1; c >= left; c--) cells.push([bottom, c]);
  for (let r = bottom - 1; r > top; r--) cells.push([r, left]);
  return cells;
}

/**
 * Four physical corners x two windings, with no fitted cyclic phase.
 * @param {number} depth
 * @returns {[number, number][][]}
 */
function ringOptions(depth) {
  const perimeter = ring(depth);
  const corners = [[depth, depth], [depth, 7 - depth],
    [31 - depth, 7 - depth], [31 - depth, depth]];
  return corners.flatMap(([r, c]) => {
    const start = perimeter.findIndex(([y, x]) => y === r && x === c);
    assert.ok(start >= 0);
    return [1, -1].map(direction => perimeter.map((_, i) =>
      perimeter[(start + direction * i + 2 * perimeter.length) %
        perimeter.length]));
  });
}
const rings = [1, 2, 3].map(ringOptions);
assert.deepEqual(rings.map(options => options[0].length), [68, 60, 52]);

/**
 * @param {[number, number][][]} orderedRings
 * @param {number[]} values
 * @returns {number[]}
 */
function layoutForRings(orderedRings, values) {
  const layout = Array(256).fill(-1);
  let i = 0;
  for (const ordered of orderedRings) {
    for (const [r, c] of ordered) {
      const pos = 8 * r + c;
      assert.equal(layout[pos], -1, "duplicate ring coordinate");
      layout[pos] = values[i++];
    }
  }
  assert.equal(i, 180);
  for (let r = 1; r <= 30; r++)
    for (let c = 1; c <= 6; c++)
      assert.ok(layout[8 * r + c] >= 0);
  return layout;
}

/**
 * Every row may choose any coefficients in GF(29), including non-bijective
 * quadratic functions. Gaussian elimination checks all 29^3 possibilities
 * simultaneously, including rank-deficient repeated-input cases.
 * @param {number[][]} pairs six [x,y] values
 * @returns {boolean}
 */
function hasQuadratic(pairs) {
  const m = pairs.map(([x, y]) => [1, x, mod(x * x), y]);
  let rank = 0;
  for (let col = 0; col < 3; col++) {
    const pivot = m.findIndex((row, i) => i >= rank && row[col] !== 0);
    if (pivot < 0) continue;
    [m[rank], m[pivot]] = [m[pivot], m[rank]];
    let inverse = 1;
    while (mod(m[rank][col] * inverse) !== 1) inverse++;
    m[rank] = m[rank].map(v => mod(v * inverse));
    for (let r = 0; r < m.length; r++) {
      if (r === rank) continue;
      const factor = m[r][col];
      m[r] = m[r].map((v, k) => mod(v - factor * m[rank][k]));
    }
    rank++;
  }
  return m.every(row => row.slice(0, 3).some(v => v !== 0) || row[3] === 0);
}

/** @type {Record<string, (byte:number) => number>} */
const reducers = {
  byte: byte => byte % 29,
  low: byte => (byte % 60) % 29,
  high: byte => Math.floor(byte / 60)
};

/**
 * @param {number[]} layout length256 with 180 known inner cells
 * @param {(byte:number) => number} reducer
 * @returns {number} how many of the thirty rows have any quadratic decoder
 */
function fittingRows(layout, reducer) {
  let compatible = 0;
  for (let r = 1; r <= 30; r++) {
    /** @type {number[][]} */
    const pairs = [];
    for (let c = 1; c <= 6; c++) {
      const pos = 8 * r + c;
      pairs.push([reducer(bytes[pos]), layout[pos]]);
    }
    compatible += Number(hasQuadratic(pairs));
  }
  return compatible;
}

/**
 * Exactly optimize each row over all 29^3 secret coefficient triples.
 * @param {number[]} layout
 * @param {(byte:number) => number} reducer
 * @returns {number} minimum required edits to the 180 authentic known runes
 */
function minimumRepairs(layout, reducer) {
  let repairs = 0;
  for (let r = 1; r <= 30; r++) {
    const pairs = [];
    for (let c = 1; c <= 6; c++) {
      const pos = 8 * r + c;
      pairs.push([reducer(bytes[pos]), layout[pos]]);
    }
    let best = 0;
    for (let a = 0; a < 29; a++) {
      for (let b = 0; b < 29; b++) {
        for (let d = 0; d < 29; d++) {
          let hits = 0;
          for (const [x, y] of pairs) {
            hits += Number(mod(a * x * x + b * x + d) === y);
          }
          if (hits > best) best = hits;
          if (best === 6) break;
        }
      }
    }
    repairs += 6 - best;
  }
  return repairs;
}

const originalPrinted = Array(256).fill(-1);
let k = 0;
for (let r = 1; r <= 30; r++)
  for (let c = 1; c <= 6; c++)
    originalPrinted[r * 8 + c] = known[k++];
assert.equal(k, 180);

const printed = {};
for (const [name, reducer] of Object.entries(reducers)) {
  const fit = fittingRows(originalPrinted, reducer);
  const minEdits = minimumRepairs(originalPrinted, reducer);
  printed[name] = {fittingRows: fit, failingRows: 30 - fit, minEdits};
}
assert.deepEqual(printed, {
  byte: {fittingRows: 0, failingRows: 30, minEdits: 77},
  low: {fittingRows: 0, failingRows: 30, minEdits: 78},
  high: {fittingRows: 0, failingRows: 30, minEdits: 78}
});

const shells = {};
for (const [name, reducer] of Object.entries(reducers)) {
  const histogram = Array(31).fill(0);
  for (let a = 0; a < 8; a++)
    for (let b = 0; b < 8; b++)
      for (let c = 0; c < 8; c++) {
        const layout = layoutForRings(
          [rings[0][a], rings[1][b], rings[2][c]], known);
        histogram[fittingRows(layout, reducer)]++;
      }
  assert.equal(histogram.reduce((x, y) => x + y, 0), 512);
  assert.equal(histogram[30], 0);
  shells[name] = histogram
    .map((count, fits) => ({fits, count})).filter(item => item.count);
}
assert.deepEqual(shells, {
  byte: [{fits: 0, count: 512}],
  low: [{fits: 0, count: 508}, {fits: 1, count: 4}],
  high: [{fits: 0, count: 509}, {fits: 1, count: 3}]
});

/**
 * A much stronger exact gate than any fixed polynomial degree: grant each
 * physical row a completely arbitrary secret function from a source symbol
 * to a GP29 output. Repeated source symbols in that row must have equal
 * outputs under EVERY conceivable stationary row decoder.
 *
 * Group equal inputs per row and choose an arbitrary modal output for each
 * group. The sum of other counts gives the exact minimum GP29 edits required
 * under ANY row function, nonlinear, non-injective, or non-polynomial.
 * @param {number[]} layout 256 cells, with 180 independently known outputs
 * @param {(value:number)=>number} reduce original table byte to input symbol
 * @returns {{failedRows:number, repairs:number}}
 */
function allSecretRowLookupRepair(layout, reduce) {
  let failedRows = 0, repairs = 0;
  for (let row = 1; row <= 30; row++) {
    /** @type {Map<number,Map<number,number>>} */
    const inputGroups = new Map();
    for (let col = 1; col <= 6; col++) {
      const pos = row * 8 + col, x = reduce(bytes[pos]), y = layout[pos];
      let observed = inputGroups.get(x);
      if (!observed) {
        observed = new Map();
        inputGroups.set(x, observed);
      }
      observed.set(y, (observed.get(y) || 0) + 1);
    }
    let changes = 0;
    for (const group of inputGroups.values()) {
      const counts = [...group.values()];
      changes += counts.reduce((n,v)=>n+v,0) - Math.max(...counts);
    }
    repairs += changes;
    failedRows += Number(changes > 0);
  }
  return {failedRows, repairs};
}

// Source-canonical byte, reduced byte, low-digit and high-digit interfaces.
// A raw byte is an unrestricted 0..255 input: a per-row lookup cannot be
// inferred from six all-distinct inner cells and gives no p55 prediction.
const allSecretRegisters = {
  rawByte: x => x,
  byteMod29: x => x % 29,
  lowBase60: x => x % 60,
  lowBase60Mod29: x => (x % 60) % 29,
  highBase60: x => Math.floor(x / 60)
};
const unrestrictedRowSecret = {};
for (const [name, reduce] of Object.entries(allSecretRegisters)) {
  const printedRow = allSecretRowLookupRepair(originalPrinted, reduce);
  let shellFits = 0, minFailedRows = 30, minRepairs = 180, maxRepairs = 0;
  for (let a = 0; a < 8; a++)
    for (let b = 0; b < 8; b++)
      for (let c = 0; c < 8; c++) {
        const layout = layoutForRings(
          [rings[0][a], rings[1][b], rings[2][c]], known);
        const r = allSecretRowLookupRepair(layout, reduce);
        shellFits += Number(r.repairs === 0);
        minFailedRows = Math.min(minFailedRows, r.failedRows);
        minRepairs = Math.min(minRepairs, r.repairs);
        maxRepairs = Math.max(maxRepairs, r.repairs);
      }
  unrestrictedRowSecret[name] = {
    printed: printedRow, shellFits,
    minFailedRows, minRepairs, maxRepairs
  };
  const positive = Array(256).fill(-1);
  for (let row = 1; row <= 30; row++)
    for (let col = 1; col <= 6; col++) {
      const pos = row * 8 + col;
      positive[pos] = (3 * row + 7 * reduce(bytes[pos])) % 29;
    }
  assert.deepEqual(allSecretRowLookupRepair(positive, reduce),
    {failedRows:0, repairs:0}, name + " secret-lookup native positive");
}
assert.deepEqual(unrestrictedRowSecret, {
  rawByte: {printed:{failedRows:0,repairs:0},shellFits:512,minFailedRows:0,minRepairs:0,maxRepairs:0},
  byteMod29: {printed:{failedRows:8,repairs:11},shellFits:0,minFailedRows:6,minRepairs:8,maxRepairs:12},
  lowBase60: {printed:{failedRows:4,repairs:4},shellFits:0,minFailedRows:3,minRepairs:3,maxRepairs:4},
  lowBase60Mod29: {printed:{failedRows:10,repairs:10},shellFits:0,minFailedRows:7,minRepairs:7,maxRepairs:11},
  highBase60: {printed:{failedRows:30,repairs:62},shellFits:0,minFailedRows:27,minRepairs:58,maxRepairs:71}
});

// Positive original-grid control: row-varying secret quadratic maps are
// allowed and a planted 180-rune known interior always passes all 30 rows.
for (const [name, reducer] of Object.entries(reducers)) {
  const plant = Array(256).fill(-1);
  for (let r = 1; r <= 30; r++) {
    const a = (5 * r + 1) % 29, b = (11 * r + 3) % 29;
    const d = (17 * r + 7) % 29;
    for (let c = 1; c <= 6; c++) {
      const pos = 8 * r + c, x = reducer(bytes[pos]);
      plant[pos] = mod(a * x * x + b * x + d);
    }
  }
  assert.equal(fittingRows(plant, reducer), 30, name + " positive plant");
}
console.log(JSON.stringify({
  experiment: "all-secret row quadratic on original grid and authentic final 180 runes",
  originalShape: [32, 8],
  heldoutUnknownPage: 55,
  independentlySolved: {p56: 85, p57: 95},
  printed,
  shellOrientationCounts: shells,
  unrestrictedPerRowSecret: unrestrictedRowSecret,
  positivePlants: "3/3 complete 30-row fits",
  classification: "bounded negative; no p55 plaintext or selected decoder"
}, null, 2));
