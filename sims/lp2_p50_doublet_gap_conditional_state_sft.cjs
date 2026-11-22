"use strict";
/**
 * Original-source conditional locality test: Does the literal-leading-zero
 * p50 table mask explain the serial structure of 86 surviving LP2 doublets?
 *
 * The null conditions on the ACTUAL 33/53 event counts by p50 mask; then
 * separately on nine original visual chapters x mask, and all 55 original
 * physical pages x mask. Site allocations are random inside fixed original
 * eligibility bins. This evaluates a concrete independent-process hypothesis,
 * not historical keys, plaintext, or causality.
 *
 * Windows / Node.js 22 SFT, original read-only inputs:
 *   node sims/lp2_p50_doublet_gap_conditional_state_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const GP = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const TABLE = JSON.parse(read("resources/liber-primus/base60-grid.json")).rows.flat();
assert.equal(TABLE.length, 256);
assert.equal(TABLE.filter(t => t[0] === "0").length, 60);
const chapters = [
  [0,2], [3,7], [8,14], [15,22], [23,26],
  [27,32], [33,39], [40,53], [54,55]
];
/*
 * The original printed "/" line and "." / "&" punctuation sites are
 * alternative source-visible segmentation clocks. Preserve these intact:
 * punctuation carries from one physical page onto the next unless printed.
 * A line/punctuation-conditioned event-count null is deliberately more
 * permissive than a predictive decoder and cannot prove a real reset.
 */
const sourceText = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0,55).join("%");
const runeCode = new Map(GP.runes.map((r,i) => [r,i]));
const layout = [], exactRuneTape = [];
let line=0, punctuation=0, paragraph=0;
for (const char of sourceText) {
  const value = runeCode.get(char);
  if (value !== undefined) {
    exactRuneTape.push(value);
    layout.push({line,punctuation,paragraph});
  } else if (char === "/") {
    line++;
  } else if (char === "." || char === "&") {
    punctuation++;
    if (char === "&") paragraph++;
  }
}
assert.equal(line,594);
assert.equal(exactRuneTape.length,12956);
assert.deepEqual(exactRuneTape,GP.pages.filter(p => p.page < 56 &&
  p.indices.length).flatMap(p => p.indices));
const original = [];
const opportunities = [];
const counts = [new Array(29).fill(0),new Array(29).fill(0)];
let bookPosition = 0;
for (const page of GP.pages.filter(p => p.page < 56 && p.indices.length)) {
  const chapter = chapters.findIndex(([a,b]) =>
    page.page >= a && page.page <= b);
  assert(chapter >= 0);
  for (let i = 0; i + 1 < page.indices.length; i++) {
    const position = bookPosition + i;
    const mark = TABLE[position % 256][0] === "0" ? 1 : 0;
    const delta = (page.indices[i+1] - page.indices[i] + 29) % 29;
    const item = {position, page:page.page, chapter, mark, delta,
      ...layout[position]};
    opportunities.push(item);
    counts[mark][delta]++;
    if (delta === 0) original.push(position);
  }
  bookPosition += page.indices.length;
}
assert.equal(bookPosition, 12956);
assert.equal(opportunities.length, 12901);
assert.equal(original.length, 86);
assert.deepEqual(counts.map(row => row.reduce((a,b) => a+b,0)),
  [9876,3025]);
assert.deepEqual(counts.map(row => row[0]), [53,33]);

/** @param {number[]} points sorted globally */
function gapAc1(points) {
  const gaps = [];
  for (let i = 1; i < points.length; i++) gaps.push(points[i]-points[i-1]);
  const n = gaps.length - 1;
  let mx=0,my=0;
  for (let i = 0; i < n; i++) {
    mx += gaps[i]; my += gaps[i+1];
  }
  mx /= n; my /= n;
  let covariance=0,vx=0,vy=0;
  for (let i = 0; i < n; i++) {
    const x=gaps[i]-mx, y=gaps[i+1]-my;
    covariance += x*y; vx += x*x; vy += y*y;
  }
  return covariance/Math.sqrt(vx*vy);
}
const observed = gapAc1(original);
assert(Math.abs(observed - 0.38001968924100965) < 1e-12);

/** @param {(e:typeof opportunities[number])=>string} key */
function makeBins(key) {
  const map = new Map();
  for (const item of opportunities) {
    const id = key(item);
    if (!map.has(id)) map.set(id, {id, opportunities:[], events:0});
    const bin = map.get(id);
    bin.opportunities.push(item.position);
    bin.events += Number(item.delta === 0);
  }
  assert.equal([...map.values()].reduce((a,b) => a+b.events,0),86);
  return [...map.values()].filter(b => b.events > 0);
}
/** @param {number} seed */
function makeRng(seed) {
  let s = seed >>> 0;
  return n => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) % n;
  };
}
/**
 * Exact-count conditional randomization of all 86 events, holding
 * original eligible site positions, specified group counts and p50 mask.
 * @param {string} name
 * @param {ReturnType<typeof makeBins>} bins
 * @param {number} seed
 * @param {number} trials
 */
function conditional(name,bins,seed,trials) {
  const rng = makeRng(seed);
  const busy = new Uint8Array(bookPosition);
  let sum=0,sq=0,exceed=0,maximum=-Infinity;
  for (let t = 0; t < trials; t++) {
    const sample = [];
    for (const bin of bins) {
      let n=0;
      while (n < bin.events) {
        const site = bin.opportunities[rng(bin.opportunities.length)];
        if (busy[site]) continue;
        busy[site] = 1; sample.push(site); n++;
      }
    }
    for (const site of sample) busy[site] = 0;
    sample.sort((a,b) => a-b);
    assert.equal(sample.length, 86);
    const value = gapAc1(sample);
    sum += value; sq += value*value;
    exceed += Number(value >= observed);
    maximum = Math.max(value, maximum);
  }
  const mean=sum/trials;
  return {name, nonemptyBins:bins.length,seed:"0x"+seed.toString(16),
    draws:trials, observed, mean,sd:Math.sqrt(sq/trials-mean*mean),
    exceed, upperTail:(exceed+1)/(trials+1), maximum};
}
const suites = [
  conditional("literal-p50-leading-zero-class",
    makeBins(e => String(e.mark)),0x3301e83e,50000),
  conditional("nine-original-chapters x p50-class",
    makeBins(e => e.chapter + ":" + e.mark),0x3301d133,50000),
  conditional("55-original-physical-pages x p50-class",
    makeBins(e => e.page + ":" + e.mark),0x3301e0a6,50000),
  conditional("global-128-rune-blocks x p50-class",
    makeBins(e => Math.floor(e.position/128)+":"+e.mark),
    0x33010080,25000),
  conditional("global-256-rune-blocks x p50-class",
    makeBins(e => Math.floor(e.position/256)+":"+e.mark),
    0x33010100,25000),
  conditional("source printed-punctuation blocks x p50-class",
    makeBins(e => e.punctuation+":"+e.mark),0x33012ee3,16000),
  conditional("source printed-line blocks x p50-class",
    makeBins(e => e.line+":"+e.mark),0x33011177,16000)
];
assert(suites[0].upperTail < .005);
assert(suites[1].upperTail < .005);
assert(suites[2].upperTail < .02);
assert(suites[3].upperTail > .02);
assert(suites[4].upperTail < .02);
assert(suites[5].upperTail < .05);
assert(suites[6].upperTail > .05);
const nonzero = counts.map(row => row.slice(1));
const rowTotals = nonzero.map(r => r.reduce((a,b)=>a+b,0));
const colTotals = nonzero[0].map((x,i) => x+nonzero[1][i]);
const total=rowTotals.reduce((a,b)=>a+b,0);
let chiSquare=0;
for(let r=0;r<2;r++)for(let j=0;j<28;j++){
  const expected = rowTotals[r]*colTotals[j]/total;
  chiSquare += (nonzero[r][j]-expected)**2 / expected;
}
assert(Math.abs(chiSquare-23.898458745108506)<1e-9);
console.log(JSON.stringify({
  status:"Conditional source-specified null does not explain observed doublet-gap autocorrelation",
  original:{runes:bookPosition,eligiblePairs:opportunities.length,
    doublets:original.length,observedGapAc1:observed,
    tableMaskSize:60,tableMaskOpportunities:3025,
    maskDoublets:33,nonmaskDoublets:53},
  nonzeroStepDistribution:{
    chiSquare, degreesOfFreedom:27,
    note:"Pearson chi-square p=0.63594255 from scipy; source output is the exact chi-square",
    observed:nonzero},
  suites,
  interpretation:"The digit0 mask and chapter/page incidence cannot fully explain order-sensitive gap structure. Printed-line exact-count conditioning absorbs the anomaly, but fixes which lines actually contain events and is therefore descriptive, not a viable predictive decoder. No plaintext or proof of a p50-controlled cipher."
},null,2));
