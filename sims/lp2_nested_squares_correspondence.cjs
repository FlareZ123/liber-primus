"use strict";

/**
 * Original LP2 square-nesting test: an 81x81 block ending at the first exact
 * duplicated six-rune phrase, followed by 6,395 runes of a putative 80x80
 * nested square with five unknown terminal cells.
 *
 * Tests *all* four 80x80 crops from the larger square and all eight dihedral
 * orientations of the smaller square. Detects direct repeated plaintext
 * through a single unknown fixed GP29 symbol mapping, even allowing every
 * output-symbol row its own freely chosen favored symbol.
 *
 * The original alignment is compared with source-exact cyclic shifts of the
 * entire second block, with the full 32-model selection repeated on each
 * surrogate. Synthetic secret-permutation plants verify detector power.
 *
 * No decryption or genuine cipher key is claimed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const WIDTH_A = 81;
const WIDTH_B = 80;
const N = 29;
const TRIALS = 1000;
const SEED = 0x81115349;

/** @returns {{a:Uint8Array,b:Uint8Array}} */
function readSource() {
  const file = path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json");
  const pages = JSON.parse(fs.readFileSync(file, "utf8")).pages
    .filter(p => p.page < 56 && p.indices.length);
  assert.equal(pages.length, 55);
  const stream = pages.flatMap(p => p.indices);
  assert.equal(stream.length, 12956);
  assert(stream.every(x => Number.isInteger(x) && x >= 0 && x < N));
  const a = Uint8Array.from(stream.slice(0, WIDTH_A * WIDTH_A));
  const b = Uint8Array.from(stream.slice(WIDTH_A * WIDTH_A));
  assert.equal(a.length, 6561);
  assert.equal(b.length, 6395);
  return { a, b };
}

/** @param {number} orientation @param {number} r @param {number} c */
function orient(orientation, r, c) {
  switch (orientation) {
    case 0: return [r, c];
    case 1: return [c, 79 - r];
    case 2: return [79 - r, 79 - c];
    case 3: return [79 - c, r];
    case 4: return [r, 79 - c];
    case 5: return [79 - r, c];
    case 6: return [c, r];
    case 7: return [79 - c, 79 - r];
    default: throw new RangeError("orientation");
  }
}

/**
 * @param {Uint8Array} a
 * @param {number} n
 * @returns {{orientation:number,top:number,left:number,cells:Uint8Array}[]}
 */
function originalModels(a, n) {
  const out = [];
  for (let orientation = 0; orientation < 8; orientation++) {
    for (let top = 0; top <= 1; top++) for (let left = 0; left <= 1; left++) {
      const cells = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        const [r, c] = orient(orientation, Math.floor(i / WIDTH_B), i % WIDTH_B);
        cells[i] = a[(r + top) * WIDTH_A + c + left];
      }
      out.push({ orientation, top, left, cells });
    }
  }
  assert.equal(out.length, 32);
  return out;
}

/**
 * @param {Uint8Array} b
 * @param {ReturnType<typeof originalModels>} models
 * @param {number} shift
 * @returns {{mutualInformation:number, equalPairs:number,
 *           unrestrictedRowAccuracy:number, winningModel:[number,number,number]}}
 */
function measure(b, models, shift = 0) {
  const length = b.length;
  const rotated = new Uint8Array(length);
  const countB = new Int32Array(N);
  for (let i = 0; i < length; i++) {
    const value = b[(i + shift) % length];
    rotated[i] = value;
    countB[value]++;
  }
  let bestMI = -Infinity, bestEquals = 0, bestRow = 0, winner = null;
  for (const model of models) {
    const counts = new Int16Array(N * N);
    const countA = new Int16Array(N);
    let equality = 0;
    for (let i = 0; i < length; i++) {
      const a = model.cells[i], y = rotated[i];
      counts[a * N + y]++;
      countA[a]++;
      equality += Number(a === y);
    }
    let likelihoodRatio = 0, rowCapacity = 0;
    for (let a = 0; a < N; a++) {
      let maximum = 0;
      for (let y = 0; y < N; y++) {
        const count = counts[a * N + y];
        if (count) {
          likelihoodRatio += count * Math.log(count * length / (countA[a] * countB[y]));
          if (count > maximum) maximum = count;
        }
      }
      rowCapacity += maximum;
    }
    const mi = likelihoodRatio / length;
    if (mi > bestMI) {
      bestMI = mi;
      winner = [model.orientation, model.top, model.left];
    }
    if (equality > bestEquals) bestEquals = equality;
    if (rowCapacity > bestRow) bestRow = rowCapacity;
  }
  return {
    mutualInformation: bestMI,
    equalPairs: bestEquals,
    unrestrictedRowAccuracy: bestRow / length,
    winningModel: winner
  };
}

/** @param {number} seed */
function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {Uint8Array} a @param {ReturnType<typeof originalModels>} models */
function blindPlant(a, models) {
  const target = models.find(m => m.orientation === 3 && m.top === 1 && m.left === 0);
  assert(target);
  const order = Uint8Array.from({ length: N }, (_, i) => i);
  const random = seeded(0x13579bdf);
  for (let j = N - 1; j > 0; j--) {
    const k = random() % (j + 1);
    [order[j], order[k]] = [order[k], order[j]];
  }
  const ciphertext = Uint8Array.from(target.cells, x => order[x]);
  const scores = measure(ciphertext, models);
  assert(Math.abs(scores.unrestrictedRowAccuracy - 1) < 1e-12);
  assert.deepEqual(scores.winningModel, [3, 1, 0]);
  assert(scores.mutualInformation > 3.2);
  for (let i = 0; i < ciphertext.length; i++) {
    assert.equal(ciphertext[i], order[target.cells[i]]);
  }
  return {
    trueModel: [3, 1, 0],
    recoveredModel: scores.winningModel,
    mutualInformation: scores.mutualInformation,
    sourceCipherReencryption: ciphertext.length
  };
}

/** Run original and refitted source-shift null with a planted positive. */
function run() {
  const { a, b } = readSource();
  const models = originalModels(a, b.length);
  const original = measure(b, models);
  const random = seeded(SEED);
  const tail = { mutualInformation: 0, equalPairs: 0, unrestrictedRowAccuracy: 0 };
  const mean = { mutualInformation: 0, equalPairs: 0, unrestrictedRowAccuracy: 0 };
  let maximumNullMI = 0;
  for (let j = 0; j < TRIALS; j++) {
    const shift = 1 + random() % (b.length - 1);
    const nullResult = measure(b, models, shift);
    for (const key of Object.keys(tail)) {
      tail[key] += Number(nullResult[key] >= original[key]);
      mean[key] += nullResult[key] / TRIALS;
    }
    maximumNullMI = Math.max(maximumNullMI, nullResult.mutualInformation);
  }
  const report = {
    source: "original 12,956 GP runes, 81² opening and terminal-five-omitted 80² suffix",
    nPaired: b.length,
    hypotheses: "4 one-row/column border crops x 8 dihedral orientations",
    original,
    fullFamilyNullShifts: TRIALS,
    refitNullMean: mean,
    refitNullExceedances: tail,
    addOneP: Object.fromEntries(Object.entries(tail).map(([k, v]) => [k, (v + 1) / (TRIALS + 1)])),
    maximumNullMI,
    syntheticUnknownPermutationControl: blindPlant(a, models),
    interpretation: "No reliable one-to-one corresponding GP rune relation under nested-square models; no plaintext or historical key"
  };
  assert.equal(original.equalPairs, 241);
  assert(Math.abs(original.mutualInformation - 0.07116763237508562) < 1e-10);
  assert.equal(tail.mutualInformation, 218);
  assert.equal(tail.equalPairs, 949);
  assert.equal(tail.unrestrictedRowAccuracy, 148);
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) run();
module.exports = { readSource, orient, originalModels, measure, seeded, blindPlant, run };
