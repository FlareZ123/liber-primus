"use strict";
/**
 * Director #429: source-family correction for the 2013 Wisdom / original LP2
 * three-word cardinal-route hypothesis.
 *
 * Run: node sims/lp2_wisdom_cardinal_familywise_sft.cjs
 * No proposed plaintext or historical cipher is asserted.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const load = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const transcript = load("resources/lp2-transcription.txt");
const squares = load("resources/cicada2014-openpuff-magic-squares.txt").trim()
  .split(/\r?\n\s*\r?\n/).map(block => block.trim().split(/\r?\n/)
    .map(line => line.trim().split(/\s+/).map(Number)));

/** @param {number} n @returns {number} */
function phi(n) {
  let result = n;
  let rest = n;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    while (rest % p === 0) rest /= p;
    result -= result / p;
  }
  if (rest > 1) result -= result / rest;
  return result;
}

/** @returns {{sum:number,length:number,page:number}[]} */
function canonicalWords() {
  const gp = new Map(corpus.runes.map((rune, i) => [rune, corpus.prime[i]]));
  /** @type {{sum:number,length:number,page:number}[]} */
  const words = [];
  let page = 0;
  let startPage = 0;
  let sum = 0;
  let length = 0;
  function finish() {
    if (length === 0) return;
    words.push({sum, length, page:startPage});
    sum = 0;
    length = 0;
  }
  for (const ch of transcript.split("%").slice(0, 55).join("%")) {
    if (gp.has(ch)) {
      if (length === 0) startPage = page;
      sum += gp.get(ch);
      length++;
    } else if (ch === "%") {
      page++;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Printed wrap does not terminate a word.
    } else {
      finish();
    }
  }
  finish();
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((n, word) => n + word.length, 0), 12956);
  return words;
}

const directions = [[9,-1,0],[18,0,1],[15,1,0],[7,0,-1]];
/** @returns {{square:number,operation:string,controller:number,edges:Set<string>}[]} */
function allModels() {
  /** @type {{square:number,operation:string,controller:number,edges:Set<string>}[]} */
  const models = [];
  for (let index = 0; index < squares.length; index++) {
    const square = squares[index];
    const n = square.length;
    const edges = new Set();
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      assert.equal(square[y][x], square[n-1-y][n-1-x],
        "Every source square is centrally symmetric, so reversing edge roles is redundant");
      for (const [direction,dy,dx] of directions) {
        const yy = y + dy;
        const xx = x + dx;
        if (yy < 0 || yy >= n || xx < 0 || xx >= n) continue;
        edges.add(square[y][x] + "," + direction + "," + square[yy][xx]);
      }
    }
    for (const operation of ["phi", "raw"]) {
      for (let controller = 0; controller < 3; controller++) {
        models.push({square:index,operation,controller,edges});
      }
    }
  }
  assert.equal(models.length, 18);
  return models;
}

/**
 * @param {number[]} sample
 * @param {ReturnType<typeof allModels>} models
 * @param {Map<number,number>} phiTable
 * @param {Map<number,number>} rawTable
 * @param {boolean} keepPositions
 * @returns {{counts:number[],positions:number[][]}}
 */
function scan(sample,models,phiTable,rawTable,keepPositions) {
  const counts = Array(models.length).fill(0);
  const positions = models.map(() => []);
  for (let i = 0; i + 2 < sample.length; i++) {
    const a = sample[i], b = sample[i+1], c = sample[i+2];
    for (let j = 0; j < models.length; j++) {
      const model = models[j];
      const table = model.operation === "phi" ? phiTable : rawTable;
      const control = model.controller === 0 ? a : model.controller === 1 ? b : c;
      if (model.edges.has(a + "," + table.get(control) + "," + c)) {
        counts[j]++;
        if (keepPositions) positions[j].push(i);
      }
    }
  }
  return {counts,positions};
}

/** @param {number} initial @returns {()=>number} */
function xorshift32(initial) {
  let seed = initial >>> 0;
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  };
}
/** @param {number[]} source @param {()=>number} next @returns {number[]} */
function shuffled(source,next) {
  const copy = source.slice();
  for (let i = copy.length-1; i > 0; i--) {
    const j = next() % (i+1);
    [copy[i],copy[j]] = [copy[j],copy[i]];
  }
  return copy;
}

function run() {
  const words = canonicalWords();
  const original = words.map(w => w.sum);
  const pages = Array.from({length:55}, () => []);
  for (const word of words) pages[word.page].push(word.sum);
  const models = allModels();
  const phiTable = new Map(original.map(n => [n, phi(n) % 29]));
  const rawTable = new Map(original.map(n => [n, n % 29]));
  const actual = scan(original,models,phiTable,rawTable,true);
  assert.deepEqual(actual.positions[13], [1962,2888]);
  assert.equal(models[13].square, 2);
  assert.equal(models[13].operation, "phi");
  assert.equal(models[13].controller, 1);
  assert.deepEqual(actual.positions[14], [1880]);
  assert.deepEqual(actual.positions[16], [1880]);
  assert.equal(actual.counts.reduce((a,b)=>a+b,0), 4);
  assert.equal(actual.counts.filter(n=>n>=2).length, 1);

  const initialSeed = 0x42901334;
  const next = xorshift32(initialSeed);
  const trials = 12000;
  let fixedTwo = 0, familyTwo = 0, total = 0;
  const histogram = [0,0,0,0];
  for (let t = 0; t < trials; t++) {
    const sample = pages.flatMap(page => shuffled(page,next));
    const counts = scan(sample,models,phiTable,rawTable,false).counts;
    const maximum = Math.max(...counts);
    histogram[maximum]++;
    fixedTwo += Number(counts[13] >= 2);
    familyTwo += Number(maximum >= 2);
    total += counts.reduce((a,b)=>a+b,0);
  }
  assert.equal(fixedTwo,54);
  assert.equal(familyTwo,522);
  assert.deepEqual(histogram,[4737,6741,509,13]);
  return {
    objective:"bounded source-choice calibration; no plaintext or cipher claim",
    originalWords:words.length,
    originalRunes:words.reduce((n,w)=>n+w.length,0),
    sourceMatrices:squares.map(square=>square.length),
    sourceHypothesisCount:models.length,
    hypotheses:models.map((model,i)=>({
      model:i,square:model.square,operation:model.operation,
      controllerPosition:model.controller,originalRoutes:actual.positions[i]
    })).filter(model=>model.originalRoutes.length),
    shuffle:{
      seed:"0x42901334",trials,wordTotalsPreservedByOriginalPage:true,
      frozenModelTwo:{hits:fixedTwo,plusOneRate:(fixedTwo+1)/(trials+1)},
      sourceFamilyAnyTwo:{hits:familyTwo,plusOneRate:(familyTwo+1)/(trials+1)},
      histogramOfMaxRoutes:histogram,meanTotalHitsAcrossModels:total/trials
    }
  };
}

if (require.main === module) console.log(JSON.stringify(run(),null,2));
module.exports = {run,phi,canonicalWords,allModels,scan};
