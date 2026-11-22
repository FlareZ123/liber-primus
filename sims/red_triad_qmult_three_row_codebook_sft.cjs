"use strict";

/**
 * Arbitrary-secret-256-codebook obstruction for a source-locked
 * evolving GF(29^2) register. Three original 127-field-element rows
 * alone suffice, even with a freely chosen field seed in each row.
 *
 * Each row has 841 distinct possible initial states. Candidate plaintext
 * is P_j=C_j-S_j and state advances using the source's exact 127
 * quotient multipliers, with either C or P as additive feedback.
 *
 * Enumerate ALL 841^3=594,823,321 initial-state triples PER feedback
 * law, with no hidden seed or alphabet assumed. For every triple:
 *
 * |A ∪ B ∪ C| >= |A|+|B|+|C|-|A∩B|-|A∩C|-|B∩C|.
 *
 * The last term omitted is +|A∩B∩C|, always nonnegative. If the
 * exact minimum of this lower bound exceeds 256, NO stationary
 * 256-element field codebook is possible, even one picked adversarially.
 *
 * Run: node sims/red_triad_qmult_three_row_codebook_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {quotient, decrypt, encrypt} = require("./red_triad_qmult_allstate_byte_sft.cjs");

const ROOT = path.resolve(__dirname, "..");
const STATES = 841;
const WIDTH = 127;
const ROWS = 3;

/** @typedef {[number,number]} Field */

/** @param {string} file @returns {any} */
function json(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
}

/**
 * Deduplicate 127 field elements into sorted-by-first-appearance
 * labels 0..840, where [a,b] maps to a+29b.
 * @param {Field[]} row
 * @returns {number[]}
 */
function uniqueFields(row) {
  const seen = new Uint8Array(STATES);
  const out = [];
  for (const [a, b] of row) {
    const v = a + 29 * b;
    if (!seen[v]) { seen[v] = 1; out.push(v); }
  }
  return out;
}

/**
 * Exhaust all 841 hidden starting values of one source row.
 * @param {Field[]} cipherRow
 * @param {Field[]} q
 * @param {"cipher"|"plain"} feedback
 * @returns {number[][]}
 */
function candidates(cipherRow, q, feedback) {
  assert.equal(cipherRow.length, WIDTH);
  return Array.from({length: STATES}, (_, h) =>
    uniqueFields(decrypt(cipherRow, q, [h % 29, Math.floor(h / 29)], feedback)));
}

/**
 * Exact intersection cardinality for each ordered seed pair, computed
 * using a per-symbol inverted index rather than set intersections.
 * Result is row-major 841x841; pair counts never exceed 127.
 * @param {number[][]} a
 * @param {number[][]} b
 * @returns {{scores:Uint8Array,maxIntersection:number,minUnion:number}}
 */
function pairMatrix(a, b) {
  assert.equal(a.length, STATES);
  assert.equal(b.length, STATES);
  const inverse = Array.from({length: STATES}, () => []);
  for (let j = 0; j < STATES; j++)
    for (const v of b[j]) inverse[v].push(j);
  const scores = new Uint8Array(STATES * STATES);
  let maxIntersection = 0;
  let minUnion = Infinity;
  for (let i = 0; i < STATES; i++) {
    const hits = new Uint8Array(STATES);
    for (const v of a[i])
      for (const j of inverse[v]) hits[j]++;
    scores.set(hits, i * STATES);
    for (let j = 0; j < STATES; j++) {
      const k = hits[j];
      if (k > maxIntersection) maxIntersection = k;
      const union = a[i].length + b[j].length - k;
      if (union < minUnion) minUnion = union;
    }
  }
  return {scores, maxIntersection, minUnion};
}

/**
 * Full 841^3 scan of the exact three-set Bonferroni lower bound.
 * A counterexample of <=256 is a necessary but not sufficient
 * condition for a 256-codepoint register, so never report it as
 * a positive decryption.
 * @param {number[][]} a
 * @param {number[][]} b
 * @param {number[][]} c
 * @param {Uint8Array} ab
 * @param {Uint8Array} ac
 * @param {Uint8Array} bc
 * @returns {{minLowerBound:number,witnessSeeds:number[],triplesEnumerated:number,triplesNotRuledOut:number}}
 */
function exhaustiveThree(a, b, c, ab, ac, bc) {
  let minLowerBound = Infinity;
  let witnessSeeds = [];
  let triplesNotRuledOut = 0;
  for (let i = 0; i < STATES; i++) {
    const ia = i * STATES;
    for (let j = 0; j < STATES; j++) {
      const jb = j * STATES;
      const fixed = a[i].length + b[j].length - ab[ia + j];
      for (let k = 0; k < STATES; k++) {
        const bound = fixed + c[k].length - ac[ia + k] - bc[jb + k];
        if (bound < minLowerBound) {
          minLowerBound = bound;
          witnessSeeds = [i, j, k];
        }
        if (bound <= 256) triplesNotRuledOut++;
      }
    }
  }
  return {
    minLowerBound,
    witnessSeeds,
    triplesEnumerated: STATES ** ROWS,
    triplesNotRuledOut
  };
}

/**
 * Check a planted arbitrary codebook of exactly 256 distinct field
 * values without passing the hidden row seeds to the detector.
 * @param {number[][]} options
 * @param {Set<number>} codebook
 * @returns {number[]}
 */
function viableSeeds(options, codebook) {
  const seeds = [];
  for (let h = 0; h < STATES; h++)
    if (options[h].every(value => codebook.has(value))) seeds.push(h);
  return seeds;
}

/**
 * @param {Field[]} q
 * @param {Field[][]} rows
 * @param {"cipher"|"plain"} feedback
 * @returns {any}
 */
function investigate(q, rows, feedback) {
  const sets = rows.map(row => candidates(row, q, feedback));
  const ab = pairMatrix(sets[0], sets[1]);
  const ac = pairMatrix(sets[0], sets[2]);
  const bc = pairMatrix(sets[1], sets[2]);
  const result = exhaustiveThree(
    sets[0], sets[1], sets[2], ab.scores, ac.scores, bc.scores);
  // True union of a witness may be LARGER than its Bonferroni bound;
  // verify the exact full inclusion-exclusion identity independently.
  const [a, b, c] = result.witnessSeeds.map((seed, r) => new Set(sets[r][seed]));
  const intersection = (x, y) => [...x].filter(v => y.has(v)).length;
  const pair = [intersection(a,b), intersection(a,c), intersection(b,c)];
  const triple = [...a].filter(v => b.has(v) && c.has(v)).length;
  const actualUnion = new Set([...a, ...b, ...c]).size;
  assert.equal(actualUnion, result.minLowerBound + triple);
  assert.equal(result.triplesNotRuledOut, 0);
  assert.ok(result.minLowerBound > 256);
  return {
    ...result,
    firstThreeRowMinDistinct: sets.map(row => Math.min(...row.map(x => x.length))),
    pairMaxIntersections: [ab,ac,bc].map(p => p.maxIntersection),
    pairMinUnions: [ab,ac,bc].map(p => p.minUnion),
    witnessSingles: [a.size,b.size,c.size],
    witnessIntersections: pair,
    witnessTripleIntersection: triple,
    witnessActualUnion: actualUnion,
  };
}

/**
 * Positive control: generate a source-compatible message using a
 * secret, arbitrary, non-contiguous 256-field-symbol codebook, then
 * enumerate all 841 seeds per row without passing the encoder seeds
 * to the detector. Field values x=(37b+17) mod841 are bijective over
 * the first 256 byte values; no canonical byte restriction is used.
 * @param {Field[]} q
 * @param {"cipher"|"plain"} feedback
 * @returns {any}
 */
function plantedControl(q, feedback) {
  const codebook = new Set(Array.from({length:256}, (_, b) => (37*b + 17) % 841));
  assert.equal(codebook.size, 256);
  const secretSeeds = /** @type {Field[]} */ ([[9,3], [12,20], [15,8]]);
  const plain = Array.from({length: ROWS}, (_, row) => Array.from({length: WIDTH},
    (_, j) => {
      const b = (row * 73 + j * 19 + row * j * 7) % 256;
      const v = (37*b + 17) % 841;
      return /** @type {Field} */ ([v % 29, Math.floor(v / 29)]);
    }));
  const encoded = plain.map((row, i) => encrypt(row, q, secretSeeds[i], feedback));
  for (let i = 0; i < ROWS; i++)
    assert.deepEqual(decrypt(encoded[i], q, secretSeeds[i], feedback), plain[i]);

  const detected = encoded.map(row =>
    viableSeeds(candidates(row, q, feedback), codebook));
  const expectedSeeds = secretSeeds.map(seed => seed[0] + 29*seed[1]);
  for (let i = 0; i < ROWS; i++)
    assert.ok(detected[i].includes(expectedSeeds[i]));
  // Recovered candidates are in one stationary 256-symbol alphabet.
  const union = new Set(plain.flat().map(([a,b]) => a+29*b));
  assert.ok(union.size <= 256);
  return {
    rows: ROWS, glyphPairsReencoded: ROWS*WIDTH,
    actualDistinctSymbols: union.size,
    viableInitialStates: detected.map(x => x.length),
    trueSeedsRecovered: true
  };
}

function main() {
  const corpus = json("resources/liber-primus/lp2-corpus.json");
  const grid = json("resources/liber-primus/base60-grid.json");
  const source = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
  assert.equal(source.length, 12956);
  assert.deepEqual(source.slice(0,2), [15,8]);
  const payload = source.slice(2);
  assert.equal(payload.length, 51*127*2);
  const q = quotient(grid.byte_rows.flat());
  assert.equal(q.length, WIDTH);
  assert.ok(q.every(v => v[0] || v[1]));
  const firstThree = Array.from({length: ROWS}, (_, r) =>
    Array.from({length: WIDTH}, (_, j) => {
      const offset = 2*(r*WIDTH+j);
      return /** @type {Field} */ ([payload[offset],payload[offset+1]]);
    }));
  const summary = {};
  for (const feedback of /** @type {const} */ (["cipher", "plain"])) {
    const original = investigate(q, firstThree, feedback);
    assert.equal(original.minLowerBound, feedback === "cipher" ? 260 : 261);
    summary[feedback] = {
      original,
      plantedArbitraryCodebook: plantedControl(q, feedback)
    };
  }
  process.stdout.write(JSON.stringify({
    source: "LP2 original first three of 51 source-selected 127-element GF841 rows",
    sourceRules: ["u²=3u+8","p39 factor 15(X-24)^2 of 256-byte table"],
    allSecretInitialStateTriplesPerModel: 841**3,
    alphabetLimit: 256,
    summary,
    conclusion: "No stationary 256-element GF841 plaintext codebook exists for either declared source-quotient feedback law, even allowing independently secret start states for all three rows."
  },null,2)+"\n");
}

if (require.main === module) main();
module.exports = {uniqueFields, candidates, pairMatrix, exhaustiveThree, investigate};
