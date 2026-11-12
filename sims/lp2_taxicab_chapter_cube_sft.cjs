"use strict";
/**
 * Original-input taxicab chapter/cubic-transposition gate (source-frozen).
 * Run from the repository root: node sims/lp2_taxicab_chapter_cube_sft.cjs
 *
 * This is a bounded inverse for the unkeyed three-dimensional axis-permutation
 * cipher family. It does not assume that page boundaries are cube-layer cuts.
 * Native GP-English calibration and a planted exact inverse are included.
 * @module lp2_taxicab_chapter_cube_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const languageText = read("resources/control/shakespeare_first300k.txt");
const orders = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
const N = 29;
const alpha = 0.005;

/**
 * Normalize Latin source text into the repository's GP29 transliteration.
 * Unrecognized source letters are discarded; no text from LP2 is trained on.
 * @param {string} source
 * @returns {number[]}
 */
function toGP(source) {
  const choices = gp.translit.map((v, i) => ({ v, i }))
    .sort((a, b) => b.v.length - a.v.length);
  const normalized = source.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S")
    .replace(/Q/g, "C");
  const out = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let j = 0; j < word.length;) {
      const choice = choices.find(x => word.startsWith(x.v, j));
      if (choice) { out.push(choice.i); j += choice.v.length; }
      else j++;
    }
  }
  return out;
}

/**
 * Train a smoothed conditional trigram model on first 75% of the frozen
 * Shakespeare source, with the remaining 25% reserved for native controls.
 * @param {number[]} corpus
 * @returns {{ score: (seq: number[]) => number, trainLength: number }}
 */
function trainLanguage(corpus) {
  const trainLength = Math.floor(corpus.length * 0.75);
  const three = new Float64Array(N ** 3).fill(alpha);
  const two = new Float64Array(N ** 2).fill(N * alpha);
  for (let i = 2; i < trainLength; i++) {
    const triple = corpus[i-2] * N * N + corpus[i-1] * N + corpus[i];
    three[triple]++;
    two[Math.floor(triple / N)]++;
  }
  return {
    trainLength,
    score(seq) {
      let log = 0;
      for (let i = 2; i < seq.length; i++) {
        const triple = seq[i-2] * N * N + seq[i-1] * N + seq[i];
        log += Math.log(three[triple] / two[Math.floor(triple / N)]);
      }
      return log / (seq.length - 2);
    }
  };
}

/**
 * The output axis order is the specified permutation of the input 3D axes;
 * each output axis can independently be read in the reverse direction.
 * @param {number[]} vector
 * @param {[number,number,number]} dims
 * @param {[number,number,number]} order
 * @param {number} reverseMask
 * @returns {number[]}
 */
function readAxes(vector, dims, order, reverseMask) {
  assert.equal(vector.length, dims[0]*dims[1]*dims[2]);
  const outputDims = order.map(axis => dims[axis]);
  const out = [];
  for (let x = 0; x < outputDims[0]; x++) {
    for (let y = 0; y < outputDims[1]; y++) {
      for (let z = 0; z < outputDims[2]; z++) {
        const xyz = [x,y,z], position = [0,0,0];
        for (let axis = 0; axis < 3; axis++) {
          position[order[axis]] = (reverseMask & (1 << axis))
            ? outputDims[axis] - 1 - xyz[axis] : xyz[axis];
        }
        out.push(vector[(position[0]*dims[1] + position[1])*dims[2] + position[2]]);
      }
    }
  }
  return out;
}

/**
 * Build exact forward inverse of the proposed transposition using a positional
 * plant. If plaintext = readAxes(ciphertext), then each plaintext position is
 * placed into its indicated ciphertext position by this inverse.
 * @param {number[]} plain
 * @param {[number,number,number]} dims
 * @param {[number,number,number]} order
 * @param {number} reverseMask
 * @returns {number[]}
 */
function encodePlant(plain, dims, order, reverseMask) {
  const map = readAxes(Array.from({length: plain.length}, (_, i) => i),
    dims, order, reverseMask);
  const ciphertext = new Array(plain.length);
  for (let i = 0; i < map.length; i++) ciphertext[map[i]] = plain[i];
  return ciphertext;
}

/**
 * Exhaust the 3! axis orders times 2^3 independent reversals.
 * @param {number[]} original
 * @param {[number,number,number]} dims
 * @param {(seq:number[])=>number} score
 * @returns {{raw:number,best:{order:string,mask:number,score:number},mean:number}}
 */
function scan(original, dims, score) {
  const candidates = orders.flatMap(order =>
    Array.from({length:8}, (_, mask) => ({
      order: order.join(""), mask,
      score: score(readAxes(original, dims, order, mask))
    })));
  candidates.sort((a,b) => b.score - a.score);
  return {
    raw: score(original), best: candidates[0],
    mean: candidates.reduce((s,x) => s + x.score, 0) / candidates.length
  };
}

const pages = gp.pages;
const first = pages.filter(p => p.page <= 2).flatMap(p => p.indices);
const thirdPages = pages.filter(p => p.page >= 8 && p.page <= 14);
const third = thirdPages.flatMap(p => p.indices);
assert.deepEqual(thirdPages.map(p => p.runic_count),[255,268,263,273,261,272,137]);
assert.equal(first.length,729);
assert.equal(third.length,1729);
assert.equal(729,9 ** 3);
assert.equal(1729,9 ** 3 + 10 ** 3);
assert.equal(1729,1 ** 3 + 12 ** 3);
assert.equal(1729,7*13*19);

const cases = [
  ["p0-2 entire cube9", first, [9,9,9]],
  ["p8-14 first729 cube9",third.slice(0,729),[9,9,9]],
  ["p8-14 last1000 cube10",third.slice(729),[10,10,10]],
  ["p8-14 first1000 cube10",third.slice(0,1000),[10,10,10]],
  ["p8-14 last729 cube9",third.slice(1000),[9,9,9]],
  ["p8-14 drop-first cube12",third.slice(1),[12,12,12]],
  ["p8-14 drop-last cube12",third.slice(0,-1),[12,12,12]],
  ["p8-14 7x13x19 cuboid",third,[7,13,19]]
];
const native = toGP(languageText);
assert.equal(native.length,218800);
const {score,trainLength} = trainLanguage(native);
assert.equal(trainLength,164100);

// Exact positive plant under a nontrivial three-dimensional key and inverse.
const plant = native.slice(trainLength, trainLength + 729);
const pOrder = [2,0,1], pMask=5;
const encoded = encodePlant(plant,[9,9,9],pOrder,pMask);
assert.deepEqual(readAxes(encoded,[9,9,9],pOrder,pMask),plant);
assert(score(plant)>-3, "GP-English planted decoded text must be linguistic");
assert(score(encoded)<-3, "The keyed cube plant should disrupt trigram order");

const nativeHoldout = [];
for (let i=trainLength; i+1729<native.length; i+=1200)
  nativeHoldout.push(score(native.slice(i,i+1729)));
assert.equal(nativeHoldout.length,45);
const nativeMin = Math.min(...nativeHoldout);
const report = cases.map(([name,input,dims]) => ({
  name,n:input.length,dims,...scan(input, /** @type {[number,number,number]} */ (dims),score)
}));
for (const row of report) {
  assert(row.best.score < -5.6, "Unexpected originally sourced English-like result");
  assert(row.best.score < nativeMin - 2.9, "Cube reading reached GP-native control band");
}
console.log(JSON.stringify({
  source: "original canonical LP2 p0-2 and p8-14, Shakespeare GP-native controls",
  arithmetic: "729=9^3; 1729=9^3+10^3=1^3+12^3=7*13*19",
  nativeGP: {trainLength,heldout1729Count:45,heldoutMin:nativeMin,
    heldoutMax:Math.max(...nativeHoldout)},
  positivePlant: {size:plant.length,order:pOrder.join(""),mask:pMask,
    originalScore:score(plant),encryptedScore:score(encoded),exactRoundTrip:true},
  originalCases:report,
  conclusion:"Eight source-anchored cube/cuboid cases, 48 axis symmetries each, all original-negative. No unknown LP2 plaintext or key recovered."
},null,2));
