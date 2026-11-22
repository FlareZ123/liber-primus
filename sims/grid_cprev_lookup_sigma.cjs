"use strict";
/**
 * Ciphertext-dependent grid lookup with an arbitrary unknown outer alphabet.
 *
 * The source grid has 32 rows and 8 columns. A row is selected by the
 * preceding *published ciphertext* rune, and a column by a clock phase.
 * The inverse for a known outer permutation is:
 *
 *   P_i = sigma^-1(C_i) - sign*grid[row(C_(i-1)),col(i)] (mod 29).
 *
 * A 29! unknown sigma is fitted exactly by 29x29 linear assignment on
 * early LP2 pages. Later pages are evaluated with no refitting.
 *
 * This family tests a source-defined stateful key from the grid, distinct
 * from direct byte-stream/pad attacks. It does not assume a real LP2 cipher.
 *
 * Run: node sims/grid_cprev_lookup_sigma.cjs
 * Environment: LP2_GRID_LOOKUP_NULLS=20 (defaults to 12).
 *
 * @module grid_cprev_lookup_sigma
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  assignmentMax, encodeEnglish, seededRandom, shuffledPermutation
} = require("./outer_permutation_assignment.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const alpha = [..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const runeIndices = new Map(alpha.map((rune, index) => [rune, index]));
const M = 29;
const mod = x => ((x % M) + M) % M;
const originalGrid = JSON.parse(read("resources/liber-primus/base60-grid.json")).byte_rows;
assert.equal(originalGrid.length, 32);
assert(originalGrid.every(row => row.length === 8 && row.every(value =>
  Number.isInteger(value) && value >= 0 && value <= 255)));

const prose = read("resources/control/shakespeare_first300k.txt");
const source = encodeEnglish(prose.slice(180000));
const reference = encodeEnglish(prose.slice(0, 160000));
const sourceCount = Array(M).fill(0.5);
for (const symbol of reference) sourceCount[symbol]++;
const sourceTotal = sourceCount.reduce((sum, value) => sum + value, 0);
const logPrior = sourceCount.map(value => Math.log(value / sourceTotal));
const pageRecord = read("resources/lp2-transcription.txt").split("%").slice(0, 55);

/**
 * A record retains continuous runic and word-local clocks, while a physical
 * page separator does not end a word. Printed '/' wraps also do not end it.
 * @returns {{c:number,pg:number,pp:number,g:number,sp:number,wp:number,prev:number}[]}
 */
function originalRecords() {
  const rows = [];
  let g = 0, sp = 0, wp = 0, prev = -1, nWords = 0, sec = 0;
  for (let pg = 0; pg < pageRecord.length; pg++) {
    let pp = 0;
    for (const char of pageRecord[pg]) {
      if (runeIndices.has(char)) {
        if (wp === 0) nWords++;
        const c = runeIndices.get(char);
        rows.push({c,pg,pp,g,sp,wp,prev});
        prev = c;
        g++;pp++;sp++;wp++;
      } else if (char === "$") {
        sec++;
        sp = 0;wp = 0;
      } else if (char === "-" || char === "." || char === "&") {
        wp = 0;
      }
    }
  }
  assert.equal(pageRecord.length, 55);
  assert.equal(sec, 8);
  assert.equal(nWords, 2896);
  assert.equal(rows.length, 12956);
  return rows;
}

const records = originalRecords();
const training = records.filter(row => row.pg < 28 && row.prev >= 0);
const heldout = records.filter(row => row.pg >= 28 && row.prev >= 0);
assert.equal(training.length + heldout.length, 12955);

/**
 * @typedef {{row:string,clock:string,phase:number,reverse:boolean,sign:number}} Config
 * @param {{prev:number,pp:number,g:number,sp:number,wp:number}} r
 * @param {Config} config
 * @param {number[][]} grid
 * @returns {number} 29-ary additive digit from the original printed grid
 */
function keyDigit(r,config,grid) {
  const row = config.row === "direct" ? r.prev :
    config.row === "plus3" ? r.prev + 3 :
    config.row === "reverse" ? 28 - r.prev : 31 - r.prev;
  const phase = (r[config.clock] + config.phase) % 8;
  const column = config.reverse ? 7-phase : phase;
  return grid[row][column] % 29;
}

/**
 * Exact optimal 29-symbol inverse outer alphabet on a set of observed pairs.
 * @param {object[]} rows
 * @param {Config} config
 * @param {number[][]} grid
 * @returns {number[]}
 */
function fit(rows,config,grid) {
  const contexts = Array.from({length:M}, () => Array(M).fill(0));
  for (const r of rows) contexts[r.c][keyDigit(r,config,grid)]++;
  const likelihood = Array.from({length:M}, () => Array(M).fill(0));
  for (let c = 0; c < M; c++) {
    for (let x = 0; x < M; x++) {
      let weight = 0;
      for (let k = 0; k < M; k++) {
        weight += contexts[c][k] * logPrior[mod(x - config.sign*k)];
      }
      likelihood[c][x] = weight;
    }
  }
  return assignmentMax(likelihood).assignment;
}

/**
 * Held-out average natural log-likelihood under GP-English unigram prior.
 * @param {object[]} rows
 * @param {Config} config
 * @param {number[][]} grid
 * @param {number[]} inverse
 */
function evaluate(rows,config,grid,inverse) {
  let total = 0;
  for (const r of rows)
    total += logPrior[mod(inverse[r.c] - config.sign*keyDigit(r,config,grid))];
  return total / rows.length;
}

/** 512 fixed source-index/clock/phase/direction/sign alternatives. */
const configs = [];
for (const row of ["direct","plus3","reverse","reversePlus3"])
  for (const clock of ["pp","g","sp","wp"])
    for (let phase = 0; phase < 8; phase++)
      for (const reverse of [false,true])
        for (const sign of [-1,1])
          configs.push({row,clock,phase,reverse,sign});
assert.equal(configs.length, 512);

/** @param {object[]} train @param {object[]} test @param {number[][]} grid */
function screen(train,test,grid) {
  const ordered = configs.map(config => {
    const inverse = fit(train,config,grid);
    return {config,inverse,
      training: evaluate(train,config,grid,inverse),
      heldout: evaluate(test,config,grid,inverse)};
  });
  ordered.sort((a,b) => b.heldout-a.heldout);
  return ordered;
}

/**
 * Construct a source-true synthetic ciphertext by using the *published*
 * preceding ciphertext as feedback for the next row choice.
 * Suppress equal consecutive output glyphs with 81% probability by
 * overwriting with a random different output glyph, without key skips.
 * The following row always uses the actual previously published glyph.
 *
 * @param {Config} truth
 * @param {number[][]} grid
 * @param {number} suppress
 */
function planted(truth,grid,suppress) {
  assert(source.length >= records.length);
  const random = seededRandom(0x90113301);
  const sigma = shuffledPermutation([...Array(M).keys()],random);
  let prev = -1, rewritten = 0;
  const rows = records.map((r,i) => {
    const provisional = {...r,prev};
    const digit = prev < 0 ? 0 : keyDigit(provisional,truth,grid);
    let c = sigma[mod(source[i] + truth.sign*digit)];
    if (c === prev && random() < suppress) {
      c = (c + 1 + Math.floor(random()*28)) % M;
      rewritten++;
    }
    prev = c;
    return {...provisional,c};
  });
  return {
    train: rows.filter(r => r.pg < 28 && r.prev >= 0),
    test: rows.filter(r => r.pg >= 28 && r.prev >= 0),
    sigma,
    rewritten
  };
}

/** Independent seeded Fisher-Yates shuffle of all 256 source bytes. */
function shuffledGrid(random) {
  const flat = originalGrid.flat();
  for (let i = flat.length-1; i > 0; i--) {
    const j = Math.floor(random()*(i+1));
    [flat[i],flat[j]] = [flat[j],flat[i]];
  }
  return Array.from({length:32},(_,r) => flat.slice(8*r,8*r+8));
}

/** @param {number} nulls */
function run(nulls=12) {
  assert(Number.isSafeInteger(nulls) && nulls >= 0 && nulls <= 500);
  const real = screen(training,heldout,originalGrid);
  const truth = {row:"plus3",clock:"wp",phase:4,reverse:true,sign:1};
  const positive = planted(truth,originalGrid,0.81);
  const positives = screen(positive.train,positive.test,originalGrid);
  const bestPlant = positives[0];
  const trueIndex = positives.findIndex(row =>
    JSON.stringify(row.config) === JSON.stringify(truth));
  const exactAlpha = bestPlant.inverse.filter((rune,label) =>
    positive.sigma[rune] === label).length;
  assert.equal(trueIndex,0,"Must recover planted source-grid rule");
  assert.equal(exactAlpha,29,"Must recover all 29 planted outer runes");
  assert(positive.rewritten > 100 && positive.rewritten < 700);
  assert(bestPlant.heldout > -3.4,"Synthetic English heldout gate");
  const random = seededRandom(0x88210310);
  const nullWinners = [];
  for (let i=0;i<nulls;i++)
    nullWinners.push(screen(training,heldout,shuffledGrid(random))[0].heldout);
  const exceed = nullWinners.filter(value => value >= real[0].heldout).length;
  return {
    hypothesis:"C_i = sigma(P_i+sign*grid[row(C_(i-1)), col(clock_i)] mod29)",
    corpus:{runes:records.length,words:2896,trainingRunes:training.length,
      heldoutRunes:heldout.length,
      trainingPages:"physical LP2 0..27",
      heldoutPages:"physical LP2 28..55 except rune-free page 50"},
    variants:configs.length,source:"original LP2 base60 32x8 byte grid",
    language:"Shakespeare GP transliteration, first 160000 characters",
    realTop:real.slice(0,5).map(x=>({config:x.config,
      training:x.training,heldout:x.heldout})),
    synthetic:{truth,repeatSuppression:0.81,rewritten:positive.rewritten,
      winner:bestPlant.config,training:bestPlant.training,
      heldout:bestPlant.heldout,correctOuterLabels:exactAlpha},
    shuffledGrid:{replicates:nulls,mean:nullWinners.length ?
      nullWinners.reduce((a,b)=>a+b,0)/nullWinners.length : null,
      best:nullWinners.length ? Math.max(...nullWinners) : null,
      nullAtLeastSource:exceed,
      addOneUpperP:(exceed+1)/(nulls+1)},
    interpretation:"No original LP2 plaintext recovered. Source feedback table plus arbitrary shared outer permutation fails English heldout despite powered synthetic positive."
  };
}
if (require.main === module) {
  const nulls = Number(process.env.LP2_GRID_LOOKUP_NULLS || "12");
  console.log(JSON.stringify(run(nulls),null,2));
}
module.exports = {originalRecords,keyDigit,fit,evaluate,screen,planted,run};
