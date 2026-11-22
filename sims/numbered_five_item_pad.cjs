"use strict";
/**
 * Test positional-pad reuse across the five explicitly numbered LP2 passages.
 *
 * Original source: 53.jpg–55.jpg, p36–p38 of LP2 rune-bearing transcription.
 * Numbered paragraphs 1–5 are an externally specified segmentation, so this
 * search does not choose windows or pairings after inspecting the ciphertext.
 *
 * Nine models: a key-index increment of -1, 0, or +1 per numbered item;
 * independent numbered Caesar adjustments of -item, 0 or +item modulo29.
 * All 3000 rotation-null trials rescan all nine models. Positive controls
 * plant actual solved GP-runic P57 plaintext frequencies under true shared pads.
 *
 * Run: node sims/numbered_five_item_pad.cjs (Node.js22, no dependencies).
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-transcription.txt"), "utf8").split("%");
const text = pages.slice(36, 39).join("%");
const digitMarkers = [...text.matchAll(/[1-5]-/g)];
assert.deepEqual(digitMarkers.map(m => Number(m[0][0])), [1,2,3,4,5]);
const segments = digitMarkers.map((mark, i) => {
  const end = i === 4 ? text.indexOf("&", mark.index) : digitMarkers[i + 1].index;
  assert.ok(end > mark.index);
  return [...text.slice(mark.index + 2, end)]
    .filter(ch => corpus.runes.includes(ch))
    .map(ch => corpus.runes.indexOf(ch));
});
assert.deepEqual(segments.map(a => a.length), [139,91,98,96,129]);
const models = [];
for (const pace of [-1,0,1])
  for (const shift of [-1,0,1]) models.push({pace,shift});

/** @param {number} n */
function mod29(n) { return ((n % 29) + 29) % 29; }

/**
 * @param {number[][]} groups
 * @param {{pace:number, shift:number}} model
 */
function evaluate(groups, model) {
  let hits = 0, comparisons = 0;
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      const phaseI = model.pace * i, phaseJ = model.pace * j;
      const lo = Math.max(phaseI, phaseJ);
      const hi = Math.min(phaseI + groups[i].length,
        phaseJ + groups[j].length);
      for (let k = lo; k < hi; k++) {
        const a = mod29(groups[i][k-phaseI] - model.shift * (i+1));
        const b = mod29(groups[j][k-phaseJ] - model.shift * (j+1));
        hits += Number(a === b);
        comparisons++;
      }
    }
  }
  return {hits, comparisons,
    z: (hits - comparisons / 29) /
      Math.sqrt(comparisons * (1/29) * (28/29))};
}

/** @param {number} seed */
function prng(seed) {
  let x = seed >>> 0;
  return () => {x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return x >>>= 0;};
}

/** @param {number[][]} input @param {() => number} random */
function circularRotate(input, random) {
  return input.map(a => {
    const pivot = random() % a.length;
    return a.slice(pivot).concat(a.slice(0, pivot));
  });
}

/** @param {number[]} frequencies @param {() => number} random */
function sampler(frequencies, random) {
  const cumulative = [];
  let sum = 0;
  for (const f of frequencies) {sum += f; cumulative.push(sum);}
  return () => {
    const hit = random() % sum;
    for (let i = 0; i < 29; i++) if (hit < cumulative[i]) return i;
    throw new Error("Invalid cumulative count");
  };
}

/**
 * @param {{pace:number,shift:number}} model
 * @param {() => number} random
 * @param {() => number} plainRune
 */
function plant(model, random, plainRune) {
  const length = Math.max(160, ...segments.map((a, i) =>
    a.length + model.pace * i));
  const pad = Array.from({length:length+10}, () => random()%29);
  return segments.map((b, i) => {
    const output = [];
    for (let j = 0; j < b.length; j++) {
      let value = mod29(plainRune() + pad[j + model.pace * i + 5]
        + model.shift * (i+1));
      // Approximate original cipher's exceptionally low doublet rate.
      if (j > 0 && value === output[j-1] && random()%100 < 81)
        value = mod29(value + 1 + random()%28);
      output.push(value);
    }
    return output;
  });
}

function study() {
  const random = prng(0x53193211);
  const actual = models.map(model => ({...model, ...evaluate(segments,model)}))
    .sort((a,b) => b.z - a.z);
  const n = 3000;
  const maxima = [];
  for (let trial = 0; trial < n; trial++) {
    const rotated = circularRotate(segments, random);
    maxima.push(Math.max(...models.map(model => evaluate(rotated,model).z)));
  }
  const observed = actual[0].z;
  const sorted = [...maxima].sort((a,b)=>a-b);
  const freq = Array(29).fill(0);
  assert.equal(corpus.pages[57].status, "solved");
  for (const p of corpus.pages[57].indices) freq[p]++;
  const plainRune = sampler(freq, random);
  const planted = [];
  for (const model of [models[4], models[0], models[8]]) {
    const tests = [];
    for (let i = 0; i < 40; i++) {
      const fake = plant(model, random, plainRune);
      tests.push({
        trueZ:evaluate(fake,model).z,
        selectedZ:Math.max(...models.map(m=>evaluate(fake,m).z))
      });
    }
    planted.push({
      model, n:tests.length,
      meanTrueZ:tests.reduce((s,x)=>s+x.trueZ,0)/tests.length,
      recoveredAboveObserved:tests.filter(x=>x.selectedZ>observed).length
    });
  }
  const result = {
    input:{archiveScans:[53,54,55], pageRecords:[36,37,38],
      numberedItemRuneLengths:segments.map(x=>x.length),
      totalRunePairsAtZeroPhase:evaluate(segments,models[4]).comparisons,
      originalReference: "Authentic GP plaintext, solved LP2 P57",
      solvedReferenceRunes: corpus.pages[57].indices.length},
    models:actual, control:{
      trials:n,
      maxNullMean:maxima.reduce((s,x)=>s+x,0)/n,
      maxNullP95:sorted[Math.floor(n*.95)],
      maxNullObserved:sorted.at(-1),
      familywiseUpperP:(1+maxima.filter(x=>x>=observed).length)/(n+1)
    },
    planted,
    interpretation:"No evidence for any tested numbered reset/offset/shift shared-pad model."
  };
  assert.equal(result.input.totalRunePairsAtZeroPhase,977);
  assert.equal(result.input.numberedItemRuneLengths.reduce((s,x)=>s+x,0),553);
  assert.ok(result.control.familywiseUpperP>0.5);
  assert.ok(planted.every(x=>x.recoveredAboveObserved===40));
  return result;
}
if (require.main === module) console.log(JSON.stringify(study(),null,2));
module.exports={evaluate,segments,study};
