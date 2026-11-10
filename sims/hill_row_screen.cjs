"use strict";

/**
 * Exhaustive row recovery for 2x2, 3x3 and 4x4 linear Hill decoders mod 29.
 * Any n x n invertible Hill encryption of ordinary, nonuniform GP-language
 * plaintext admits n nonzero inverse rows with nonuniform scalar projections.
 *
 * Each possible nonzero inverse row is represented once modulo nonzero scalar
 * multiplication, reducing 29^n-1 rows to (29^n-1)/28 projective directions.
 * Test four segmentation rules, every fixed phase offset for global and page
 * modes, and genuine mixed-matrix planted positive controls.
 *
 * Reproduce in opt-in CI: node sims/hill_row_screen.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const ROOT = path.join(__dirname, "..");
const MOD = 29;
const source = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const physical = source.pages.filter(p => p.status === "unsolved" && p.indices.length)
  .map(p => p.indices.slice());
const alphabet = new Map(source.runes.map((r, i) => [r, i]));
const raw = fs.readFileSync(path.join(ROOT, "resources/lp2-transcription.txt"), "utf8")
  .split("%").slice(0, 55).join("%");
const runes = s => Array.from(s).filter(ch => alphabet.has(ch))
  .map(ch => alphabet.get(ch));
const total = items => items.reduce((acc, item) => acc + item.length, 0);
const corpusWords = parseSharedCorpus().words.map(w => runes(w.runes));
const lineSegments = raw.split(/[/%]/u).map(runes).filter(x => x.length);
const segments = {
  global: [physical.flat()],
  page: physical,
  line: lineSegments,
  word: corpusWords
};
assert.equal(physical.length, 55);
assert.equal(total(physical), 12956);
assert.equal(corpusWords.length, 2896);
for (const [name, list] of Object.entries(segments))
  assert.equal(total(list), 12956, name + " rune coverage");

/** @param {number} n @returns {number} */
const mod = n => ((n % MOD) + MOD) % MOD;

/** @param {number[][]} groups @param {number} n @param {number} phase @returns {Uint8Array} */
function blocks(groups, n, phase = 0) {
  let length = 0;
  for (const group of groups)
    length += Math.max(0, Math.floor((group.length - phase) / n));
  const result = new Uint8Array(length * n);
  let target = 0;
  for (const group of groups) {
    for (let i = phase; i + n <= group.length; i += n) {
      for (let j = 0; j < n; j++) result[target++] = group[i + j];
    }
  }
  assert.equal(target, result.length);
  return result;
}

/** @param {number[]} vec @returns {number[]} */
function canonical(vec) {
  const first = vec.findIndex(v => v !== 0);
  assert(first >= 0);
  const value = vec[first];
  let inverse = 1;
  while ((inverse * value) % MOD !== 1) inverse++;
  return vec.map(v => mod(v * inverse));
}

/**
 * Every projective direction, once. First nonzero coefficient is normalized 1.
 * @param {number} n
 * @returns {Array<Uint8Array>}
 */
function directions(n) {
  const out = [];
  for (let lead = 0; lead < n; lead++) {
    const configurations = MOD ** (n - lead - 1);
    for (let suffix = 0; suffix < configurations; suffix++) {
      const vec = new Uint8Array(n);
      vec[lead] = 1;
      let rem = suffix;
      for (let j = lead + 1; j < n; j++) {
        vec[j] = rem % MOD;
        rem = Math.floor(rem / MOD);
      }
      out.push(vec);
    }
  }
  assert.equal(out.length, (MOD ** n - 1) / (MOD - 1));
  return out;
}

/**
 * @param {Uint8Array} data Flat n-column blocks
 * @param {number} n
 * @param {Uint8Array[]} possible
 * @returns {{blocks:number,projectiveRows:number,best:object,top:Array<object>,above043:number,above045:number}}
 */
function scan(data, n, possible) {
  const count = data.length / n;
  assert(count > 1);
  const hist = new Uint32Array(MOD);
  let best = {ioc: -Infinity};
  const top = [];
  let above043 = 0, above045 = 0;
  for (const vec of possible) {
    hist.fill(0);
    for (let offset = 0; offset < data.length; offset += n) {
      let product = 0;
      for (let j = 0; j < n; j++) product += vec[j] * data[offset + j];
      hist[product % MOD]++;
    }
    let collisions = 0;
    for (let j = 0; j < MOD; j++) collisions += hist[j] * (hist[j] - 1);
    const ioc = collisions / (count * (count - 1));
    if (ioc > .043) above043++;
    if (ioc > .045) above045++;
    if (ioc > best.ioc) best = {vec: Array.from(vec), ioc};
    if (top.length < 6 || ioc > top[top.length - 1].ioc) {
      top.push({vec: Array.from(vec), ioc});
      top.sort((a, b) => b.ioc - a.ioc);
      if (top.length > 6) top.pop();
    }
  }
  return {
    blocks: count, projectiveRows: possible.length, best, top,
    above043, above045
  };
}

/** @param {number} n @returns {number[][]} */
function mixingMatrix(n) {
  return Array.from({length: n}, (_, i) =>
    Array.from({length: n}, (_, j) =>
      i === j ? 1 : j < i ? 0 : (3 * j + 7 * i + 4) % MOD));
}

/** @param {number[][]} matrix @returns {number[][]} */
function inverseMatrix(matrix) {
  const n = matrix.length;
  const rows = matrix.map((row, i) =>
    row.concat(Array.from({length: n}, (_, j) => Number(i === j))));
  for (let col = 0; col < n; col++) {
    const pivotIndex = rows.findIndex((r, i) => i >= col && r[col] !== 0);
    assert(pivotIndex >= col);
    [rows[pivotIndex], rows[col]] = [rows[col], rows[pivotIndex]];
    let reciprocal = 1;
    while ((reciprocal * rows[col][col]) % MOD !== 1) reciprocal++;
    for (let j = 0; j < 2 * n; j++)
      rows[col][j] = mod(rows[col][j] * reciprocal);
    for (let i = 0; i < n; i++) {
      if (i === col) continue;
      const factor = rows[i][col];
      for (let j = 0; j < 2 * n; j++)
        rows[i][j] = mod(rows[i][j] - factor * rows[col][j]);
    }
  }
  return rows.map(row => row.slice(n));
}

/** @param {number} seed @returns {() => number} */
function rng(seed) {
  let value = seed >>> 0;
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return value >>> 0;
  };
}
const prior = [15,6,4,5,13,2,3,1,6,6,7,1,3,2,2,7,9,2,12,2,5,2,3,1,9,1,2,1,1];
const priorSum = prior.reduce((a, b) => a + b, 0);

/**
 * Generate real English-like planted Hill ciphertext under a full-rank
 * upper-triangular mixing matrix. Unused segment suffixes are placeholders.
 * @param {number[][]} shapes
 * @param {number} n
 * @param {() => number} random
 * @returns {{cipher:number[][],inverse:number[][],plainIoC:number}}
 */
function plant(shapes, n, random) {
  const encryption = mixingMatrix(n);
  const inverse = inverseMatrix(encryption);
  const sampled = new Uint32Array(MOD);
  function sample() {
    let draw = random() % priorSum;
    for (let i = 0; i < MOD; i++) {
      if (draw < prior[i]) {sampled[i]++; return i;}
      draw -= prior[i];
    }
    throw Error("unreachable");
  }
  const cipher = shapes.map(group => {
    const output = group.slice();
    for (let i = 0; i + n <= group.length; i += n) {
      const plaintext = Array.from({length: n}, sample);
      for (let j = 0; j < n; j++) {
        let value = 0;
        for (let k = 0; k < n; k++)
          value += encryption[j][k] * plaintext[k];
        output[i + j] = value % MOD;
      }
    }
    return output;
  });
  const count = sampled.reduce((sum, v) => sum + v, 0);
  const plainIoC = sampled.reduce((sum, v) => sum + v * (v - 1), 0)
    / (count * (count - 1));
  return {cipher, inverse, plainIoC};
}

/** @param {number} n @param {string} mode @param {Uint8Array[]} possible */
function positiveControl(n, mode, possible) {
  const planted = plant(segments[mode], n, rng(0x15a3301 ^ (n << 6)));
  const target = scan(blocks(planted.cipher, n, 0), n, possible);
  const trueRows = planted.inverse.map(row => {
    const vector = canonical(row);
    const direction = possible.findIndex(v =>
      v.every((value, i) => value === vector[i]));
    assert(direction >= 0);
    const extracted = blocks(planted.cipher, n, 0);
    const hist = new Uint32Array(MOD);
    for (let i = 0; i < extracted.length; i += n) {
      let sum = 0;
      for (let j = 0; j < n; j++) sum += vector[j] * extracted[i + j];
      hist[sum % MOD]++;
    }
    let collisions = 0;
    for (const value of hist) collisions += value * (value - 1);
    return {row: vector, ioc: collisions /
      ((extracted.length / n) * ((extracted.length / n) - 1))};
  });
  assert(trueRows.every(row => row.ioc > 0.045),
    "Planted model must recover each independently nonuniform plaintext row");
  assert(target.above045 >= n,
    "Planted model must expose n linear directions with language-level IoC");
  return {n, mode, blocks: target.blocks, plainIoC: planted.plainIoC,
    plantedInverseRows: trueRows, topRows: target.top.slice(0, n),
    countAbove045: target.above045};
}

/** @returns {object} */
function main() {
  const directionsByN = new Map([2,3,4].map(n => [n, directions(n)]));
  const scans = [];
  for (const n of [2, 3, 4]) {
    for (const mode of ["global", "page", "line", "word"]) {
      const phases = ["global", "page"].includes(mode)
        ? Array.from({length: n}, (_, i) => i) : [0];
      for (const phase of phases) {
        const input = blocks(segments[mode], n, phase);
        const measured = scan(input, n, directionsByN.get(n));
        scans.push({n, mode, phase, ...measured});
      }
    }
  }
  const controls = [
    positiveControl(2, "page", directionsByN.get(2)),
    positiveControl(3, "page", directionsByN.get(3)),
    positiveControl(4, "page", directionsByN.get(4)),
    positiveControl(4, "word", directionsByN.get(4))
  ];
  const concise = scans.map(({n,mode,phase,blocks,projectiveRows,best,above043,above045}) =>
    ({n,mode,phase,blocks,projectiveRows,best,above043,above045}));
  const globalMax = concise.reduce((a,b) => b.best.ioc > a.best.ioc ? b : a);
  const result = {
    schema: 1,
    input: "resources/liber-primus/lp2-corpus.json; resources/lp2-transcription.txt",
    runeCount: total(physical), physicalRunePages: physical.length,
    canonicalWords: corpusWords.length, segmentedLines: lineSegments.length,
    scanCount: scans.length,
    distinctProjectiveRows: Object.fromEntries(
      [2,3,4].map(n => [n, directionsByN.get(n).length])),
    globalMax,
    observations: concise,
    positiveControls: controls
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}
if (require.main === module) main();
module.exports = {blocks,directions,scan,canonical,mixingMatrix,
  inverseMatrix,plant,positiveControl,main};
