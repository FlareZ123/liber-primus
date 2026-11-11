"use strict";

/**
 * LP2 p0-2: all-secret independent per-row / per-column alphabet and
 * within-group transposition invariants on the source-motivated 27x27 square.
 *
 * SFT: node sims/lp2_p0_allsecret_27group_invariant_sft.cjs
 * No dependencies beyond Node.js and the repository's pinned source files.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} name */
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const N = 27;
const LENGTH = N * N;
const MOD = 29;
const source = corpus.pages.filter(p => p.page >= 0 && p.page <= 2).flatMap(p => p.indices);
assert.deepEqual(corpus.pages.slice(0, 3).map(p => p.indices.length), [262, 266, 201]);
assert.equal(source.length, LENGTH);

/**
 * Preserve canonical GP transliteration: distinct TH/ING/NG/EO/OE/AE/IA/EA,
 * and contemporary source-control spellings QU->CW, V->U, K->C, Z->S.
 * @param {string} text
 * @returns {number[]}
 */
function gpEncode(text) {
  const tokens = new Map(corpus.translit.map((t, i) => [t, i]));
  tokens.set("ING", 21);
  const normalized = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const symbols = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let at = 0; at < word.length;) {
      let found = false;
      for (const length of [3, 2, 1]) {
        const value = tokens.get(word.slice(at, at + length));
        if (value !== undefined) {
          symbols.push(value);
          at += length;
          found = true;
          break;
        }
      }
      assert.ok(found, "unrepresentable GP source letter");
    }
  }
  return symbols;
}

/**
 * The 27 row/column groups in a cyclically reanchored 27x27 source square.
 * The printed original start is phase 0. All 27 phase allowances are
 * supplied only to make the negative generous to an unknown column start.
 * @param {"row"|"column"} axis
 * @param {number} group
 * @param {number} phase
 * @returns {number[]}
 */
function locations(axis, group, phase = 0) {
  return Array.from({ length: N }, (_, i) =>
    (phase + (axis === "row" ? group * N + i : i * N + group)) % LENGTH);
}

/** @param {number[]} values */
function histogram(values) {
  const count = Array(MOD).fill(0);
  for (const value of values) {
    assert.ok(Number.isInteger(value) && value >= 0 && value < MOD);
    count[value]++;
  }
  return count;
}

/**
 * Exact equality-pair invariant of ANY independent secret alphabet
 * permutation in each 27-symbol group, even with arbitrary positional
 * permutations inside the same group.
 * @param {number[]} symbols
 * @param {"row"|"column"} axis
 * @param {number} phase
 */
function equalPairs(symbols, axis, phase = 0) {
  let total = 0;
  for (let group = 0; group < N; group++) {
    const counts = histogram(locations(axis, group, phase).map(i => symbols[i]));
    total += counts.reduce((sum, n) => sum + n * (n - 1) / 2, 0);
  }
  return total;
}

/**
 * Exact minimum number of extra rune REPLACEMENTS after granting the
 * entire independent permutation of the 29 alphabet labels in each
 * group and the entire positional permutation of its 27 sites.
 * Sorting frequency bins gives the rearrangement-inequality optimum.
 * @param {number[]} ciphertext
 * @param {number[]} plaintext
 * @param {"row"|"column"} axis
 */
function minimumExtraReplacements(ciphertext, plaintext, axis) {
  let l1 = 0;
  for (let group = 0; group < N; group++) {
    const sites = locations(axis, group, 0);
    const a = histogram(sites.map(i => ciphertext[i])).sort((x, y) => x - y);
    const b = histogram(sites.map(i => plaintext[i])).sort((x, y) => x - y);
    for (let k = 0; k < MOD; k++) l1 += Math.abs(a[k] - b[k]);
  }
  assert.equal(l1 % 2, 0);
  return l1 / 2;
}

/** @param {number} seed */
function rng32(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return s >>> 0;
  };
}

/** @template T @param {T[]} input @param {() => number} rand */
function shuffled(input, rand) {
  const values = input.slice();
  for (let i = values.length - 1; i > 0; i--) {
    const j = rand() % (i + 1);
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

/**
 * Native GP-English positive: encrypt 729 original plaintext symbols under
 * independent arbitrary 29-way secret label bijections AND unrestricted
 * 27-way within-group position shuffles. This is strictly broader than
 * fixed Caesar keys, fixed Hill matrices, or any one shared substitution.
 * @param {number[]} plaintext
 * @param {"row"|"column"} axis
 * @param {() => number} rand
 */
function plantedCiphertext(plaintext, axis, rand) {
  const out = plaintext.slice();
  for (let group = 0; group < N; group++) {
    const sites = locations(axis, group, 0);
    const targets = shuffled(sites, rand);
    const alphabet = shuffled(Array.from({ length: MOD }, (_, i) => i), rand);
    for (let i = 0; i < N; i++) out[targets[i]] = alphabet[plaintext[sites[i]]];
  }
  return out;
}

/** @param {number[]} symbols */
function minimumPhaseCollision(symbols) {
  let min = Infinity;
  for (const axis of ["row", "column"]) {
    for (let phase = 0; phase < N; phase++) {
      min = Math.min(min, equalPairs(symbols, axis, phase));
    }
  }
  return min;
}

const cRow = equalPairs(source, "row");
const cColumn = equalPairs(source, "column");
const cRowPhases = Array.from({ length: N }, (_, p) => equalPairs(source, "row", p));
const cColPhases = Array.from({ length: N }, (_, p) => equalPairs(source, "column", p));
assert.equal(cRow, 337);
assert.equal(cColumn, 326);
assert.equal(Math.max(...cRowPhases), 337);
assert.ok(cColPhases.every(value => value === 326));

const controls = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"],
];
const reports = [];
let allWindows = 0;
let absoluteEnglishMinAny = Infinity;
let absoluteMinEdits = Infinity;

for (const [name, file] of controls) {
  const text = gpEncode(read(file));
  const metrics = { row: [], column: [], phaseAny: [], editRow: [], editColumn: [] };
  for (let start = 0; start + LENGTH <= text.length; start += LENGTH) {
    const sample = text.slice(start, start + LENGTH);
    metrics.row.push(equalPairs(sample, "row"));
    metrics.column.push(equalPairs(sample, "column"));
    metrics.phaseAny.push(minimumPhaseCollision(sample));
    metrics.editRow.push(minimumExtraReplacements(source, sample, "row"));
    metrics.editColumn.push(minimumExtraReplacements(source, sample, "column"));
  }
  const low = key => Math.min(...metrics[key]);
  const median = key => {
    const sorted = metrics[key].slice().sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };
  reports.push({
    name,
    sourceRunes: text.length,
    disjointWindows: metrics.row.length,
    lowestRowPairs: low("row"),
    lowestColumnPairs: low("column"),
    lowestEitherAxisAnyOf27Phases: low("phaseAny"),
    medianRowPairs: median("row"),
    medianColumnPairs: median("column"),
    leastExtraReplacementsRow: low("editRow"),
    leastExtraReplacementsColumn: low("editColumn"),
  });
  allWindows += metrics.row.length;
  absoluteEnglishMinAny = Math.min(absoluteEnglishMinAny, low("phaseAny"));
  absoluteMinEdits = Math.min(absoluteMinEdits, low("editRow"), low("editColumn"));

  if (name === "Shakespeare") {
    const plantSource = text.slice(0, LENGTH);
    const rand = rng32(0x3301);
    for (const axis of ["row", "column"]) {
      const planted = plantedCiphertext(plantSource, axis, rand);
      assert.equal(equalPairs(planted, axis), equalPairs(plantSource, axis));
      assert.equal(minimumExtraReplacements(planted, plantSource, axis), 0);
      assert.ok(planted.some((value, i) => value !== plantSource[i]));
    }
  }
}
assert.equal(allWindows, 827);
assert.equal(absoluteEnglishMinAny, 445);
assert.equal(absoluteMinEdits, 83);
assert.deepEqual(reports.map(r => [
  r.disjointWindows, r.lowestRowPairs, r.lowestColumnPairs,
  r.lowestEitherAxisAnyOf27Phases, r.leastExtraReplacementsRow,
  r.leastExtraReplacementsColumn,
]), [[298, 457, 477, 445, 83, 91],
    [86, 477, 517, 464, 86, 95],
    [443, 483, 518, 462, 87, 98]]);

console.log(JSON.stringify({
  interpretation: "independent arbitrary row-or-column secret 29-rune substitution and within-group positional permutation, one 27x27 source square",
  original: { runeCount: LENGTH, rowPairs: cRow, columnPairs: cColumn,
    maximumOver27RowPhases: Math.max(...cRowPhases),
    maximumOver27ColumnPhases: Math.max(...cColPhases) },
  referenceWindowCount: allWindows,
  minimumReferencePairsEvenAfter27PhaseAndAxisSelection: absoluteEnglishMinAny,
  minimumExtraRuneReplacementsOverAllReferenceWindows: absoluteMinEdits,
  independentSourceControls: reports,
  positive: "per-group independent secret alphabet and position permutations preserve exact pairs; minimum extra replacements 0",
  recoveredUnknownPlaintext: false,
}, null, 2));
