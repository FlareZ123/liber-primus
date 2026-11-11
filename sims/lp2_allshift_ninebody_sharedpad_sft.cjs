"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Original-input test of an otherwise arbitrary GP29 additive key reused
 * across the eight long printed LP2 bodies, with unknown body-specific
 * relative key-pointer shifts and unknown body Caesar offsets.
 *
 * Source clock is the nine typographic bodies. The 91-rune interlude (body 6)
 * is explicitly excluded because its longest overlap is below 256.
 *
 * Unlike shift-2 page fits, this tests EVERY integer relative pointer shift
 * with at least 256 physically printed overlapping runes for every body pair.
 * The score optimizes one of all 29 unknown relative Caesar offsets.
 *
 * Implementation invariant: C[p,t] = P[p,t] + K[t+s_p] + b_p (mod 29)
 * gives a heightened histogram mode at shift s_q - s_p, offset b_p - b_q,
 * if the native GP plaintext has concentrated letter frequencies.
 *
 * This single-pair maximum is a discovery score, not a complete key-recovery
 * inverse or a familywise p-value without the printed matched controls.
 */

const ROOT = path.join(__dirname, "..");
const CORPUS = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const BOUNDS = [0, 729, 1874, 3612, 5506, 6527, 7960, 8051, 9640, 12956];
const MIN_OVERLAP = 256;
const D = 29;

/** @returns {number[]} Concatenated original 55 nonempty unsolved pages. */
function originalRunes() {
  const pages = CORPUS.pages.filter((p) => p.page <= 55);
  const runes = pages.flatMap((p) => p.indices);
  assert.equal(runes.length, 12956);
  assert.equal(pages.filter((p) => p.indices.length).length, 55);
  return runes;
}

/** @param {number[]} xs @returns {{id:number,arr:number[]}[]} */
function longBodies(xs) {
  return BOUNDS.slice(0, -1).map((start, id) => ({
    id, arr: xs.slice(start, BOUNDS[id + 1]),
  })).filter((entry) => entry.arr.length >= MIN_OVERLAP);
}

/** @param {number} seed @returns {()=>number} */
function xorshift(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * The full nested loop is only ~70 million original symbol comparisons,
 * with 75,747 shifts and 29-bin maxima. No fitting of key source, rule,
 * segment bounds, overlap threshold or GP alphabet follows scoring.
 * @param {{id:number,arr:number[]}[]} bodies
 * @returns {{z:number,p:number,q:number,delta:number,n:number,hits:number,diff:number,shifts:number}}
 */
function scanAllShifts(bodies) {
  let best = {z: -Infinity, p: -1, q: -1, delta: 0, n: 0,
    hits: 0, diff: 0, shifts: 0};
  for (let p = 0; p < bodies.length; p++) {
    for (let q = p + 1; q < bodies.length; q++) {
      const x = bodies[p].arr;
      const y = bodies[q].arr;
      for (let delta = MIN_OVERLAP - y.length;
        delta <= x.length - MIN_OVERLAP; delta++) {
        const nx = Math.max(0, delta);
        const ny = Math.max(0, -delta);
        const n = Math.min(x.length - nx, y.length - ny);
        const histogram = new Int16Array(D);
        for (let i = 0; i < n; i++) {
          let difference = x[nx + i] - y[ny + i];
          if (difference < 0) difference += D;
          histogram[difference]++;
        }
        let mode = 0;
        for (let k = 1; k < D; k++) {
          if (histogram[k] > histogram[mode]) mode = k;
        }
        const z = (histogram[mode] - n / D) / Math.sqrt(n * 28 / 841);
        best.shifts++;
        if (z > best.z) {
          best = {z, p: bodies[p].id, q: bodies[q].id, delta,
            n, hits: histogram[mode], diff: mode, shifts: best.shifts};
        }
      }
    }
  }
  return best;
}

/**
 * Preserve each original body intact but choose an independent circular
 * origin. This null does not fully disrupt an all-shift score; it is a
 * conservative supplementary whole-stream placement control.
 * @param {{id:number,arr:number[]}[]} bodies
 * @param {()=>number} rand
 * @returns {{id:number,arr:number[]}[]}
 */
function rotateBodies(bodies, rand) {
  return bodies.map((body) => {
    const k = rand() % body.arr.length;
    return {id: body.id, arr: body.arr.slice(k).concat(body.arr.slice(0, k))};
  });
}

/**
 * Preserve all within-body equality and adjacency, including the original
 * doublets, but independently relabel the 29 symbols on every body.
 * This disrupts the very GP29 additive difference structure being tested.
 * @param {{id:number,arr:number[]}[]} bodies
 * @param {()=>number} rand
 * @returns {{id:number,arr:number[]}[]}
 */
function permuteBodyAlphabets(bodies, rand) {
  return bodies.map((body) => {
    const alphabet = Array.from({length: D}, (_, i) => i);
    for (let i = D - 1; i > 0; i--) {
      const j = rand() % (i + 1);
      [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
    }
    return {id: body.id, arr: body.arr.map((x) => alphabet[x])};
  });
}

/**
 * Greedy GP transliteration for an independently preserved actual Gibran
 * reference. Its native source is never used to tune original offsets.
 * @param {string} raw
 * @returns {number[]}
 */
function nativeGP(raw) {
  const text = raw.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const names = Object.fromEntries(CORPUS.translit.map((x, i) => [x, i]));
  const digraphs = new Set(["TH", "EO", "NG", "OE", "AE", "IA", "EA"]);
  const output = [];
  for (let i = 0; i < text.length; i++) {
    const pair = text.slice(i, i + 2);
    if (digraphs.has(pair)) {
      output.push(names[pair]);
      i++;
    } else if (names[text[i]] !== undefined) {
      output.push(names[text[i]]);
    }
  }
  return output;
}

/**
 * A genuinely reused 29-value key with random pointer origins and
 * per-body Caesar rotations. It must be detected when the English
 * marginals are sufficiently nonuniform.
 * @param {{id:number,arr:number[]}[]} bodyShapes
 * @param {number[]} native
 * @param {()=>number} rand
 * @returns {{bodies:{id:number,arr:number[]}[],offsets:number[]}}
 */
function nativeReusedPadPlant(bodyShapes, native, rand) {
  const length = Math.max(...bodyShapes.map((x) => x.arr.length)) + 200;
  const pad = Array.from({length}, () => rand() % D);
  let start = 300;
  const offsets = [];
  const bodies = bodyShapes.map((shape) => {
    const offset = rand() % 200;
    const caesar = rand() % D;
    offsets.push(offset);
    const text = native.slice(start, start + shape.arr.length);
    assert.equal(text.length, shape.arr.length);
    start += text.length + 100;
    return {id: shape.id,
      arr: text.map((rune, i) => (rune + pad[i + offset] + caesar) % D)};
  });
  return {bodies, offsets};
}

/** @param {number[]} a @returns {number} */
function indexOfCoincidence(a) {
  const counts = new Int32Array(D);
  for (const x of a) counts[x]++;
  const pairs = counts.reduce((total, x) => total + x * (x - 1), 0);
  return pairs / (a.length * (a.length - 1));
}

/** Run all experiments against the immutable original files. */
function main() {
  const bodies = longBodies(originalRunes());
  assert.deepEqual(bodies.map((x) => x.id), [0, 1, 2, 3, 4, 5, 7, 8]);
  const original = scanAllShifts(bodies);
  assert.equal(original.shifts, 75747);
  assert.deepEqual([original.p, original.q, original.delta, original.n,
    original.diff, original.hits], [0, 4, 303, 426, 11, 36]);
  assert.ok(Math.abs(original.z - 5.6585) < 0.0002);
  const rotationRand = xorshift(0x33012014);
  const alphabetRand = xorshift(0x33012015);
  const rotations = [];
  const permutations = [];
  for (let n = 0; n < 4; n++) {
    rotations.push(scanAllShifts(rotateBodies(bodies, rotationRand)));
    permutations.push(scanAllShifts(permuteBodyAlphabets(bodies, alphabetRand)));
  }
  const source = fs.readFileSync(
    path.join(ROOT, "resources", "control", "gibran_prophet_58585.txt"), "utf8");
  const native = nativeGP(source);
  assert.ok(native.length >= 14500);
  const plantRand = xorshift(0x3301c1c4);
  const {bodies: plantedBodies, offsets} =
    nativeReusedPadPlant(bodies, native, plantRand);
  const planted = scanAllShifts(plantedBodies);
  assert.ok(planted.z > original.z);
  const expectedShift = offsets[planted.q > 6 ? planted.q - 1 : planted.q] -
    offsets[planted.p > 6 ? planted.p - 1 : planted.p];
  assert.equal(planted.delta, expectedShift);

  const out = {
    input: "original 12956 LP2 GP indices, nine typographic bodies",
    longBodyIds: bodies.map((x) => x.id),
    minOverlap: MIN_OVERLAP,
    allRelativeShifts: original.shifts,
    original,
    circularRotationNull: rotations,
    independentBodyAlphabetNull: permutations,
    nativeGibranGPCount: native.length,
    nativeGibranIoC: indexOfCoincidence(native),
    planted: {offsets, best: planted},
    interpretation: "No original plaintext or source-selected key recovered",
  };
  process.stdout.write(JSON.stringify(out, null, 2) + "\n");
}

if (require.main === module) main();
module.exports = {scanAllShifts, rotateBodies, permuteBodyAlphabets,
  nativeReusedPadPlant, nativeGP, longBodies};
