"use strict";
/**
 * T7 conditional ordering-sensitive gap-correlation study.
 *
 * Exact original 55 rune-bearing physical LP2 pages (12956 glyphs) and 86
 * same-page doublets. Unlike earlier stationary gap-permutation tests, the
 * nulls preserve all original page counts, optionally all page×word-position
 * type counts. They test whether event ordering/placement is anomalous
 * *given* these fixed observable page-level margins.
 *
 * Read-only self-contained SFT, Node.js 22 CJS, deterministic xorshift32.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(pages.length, 55);
const corpus = pages.flatMap(p => p.indices);
assert.equal(corpus.length, 12956);
const transcription = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/\/\r?\n/g, "").replace(/\r?\n/g, "").replace(/[%&$]/g, "");
const words = transcription.match(new RegExp("[" + gp.runes.join("") + "]+", "gu")) || [];
const starts = new Set(), ends = new Set();
let wordSum = 0, wordCount = 0;
for (const w of words) {
  if (wordSum === corpus.length) break;
  assert(wordSum + w.length <= corpus.length);
  starts.add(wordSum);
  ends.add(wordSum + w.length - 1);
  wordSum += w.length;
  wordCount++;
}
assert.equal(wordSum, corpus.length);
assert.equal(wordCount, 2896);

const pageEntries = [];
const actual = [];
let offset = 0;
for (const page of pages) {
  const pools = [[], [], []]; // 0 word start, 1 word end, 2 word middle
  const counts = [0, 0, 0];
  for (let i = 1; i < page.indices.length; i++) {
    const global = offset + i;
    const type = starts.has(global) ? 0 : ends.has(global) ? 1 : 2;
    pools[type].push(global);
    if (page.indices[i] === page.indices[i - 1]) {
      actual.push(global);
      counts[type]++;
    }
  }
  pageEntries.push({ page: page.page, pools, counts, offset, end: offset + page.indices.length });
  offset += page.indices.length;
}
assert.equal(offset, 12956);
assert.equal(actual.length, 86);
assert.deepEqual(pageEntries.reduce((v, p) =>
  p.counts.map((x, i) => x + v[i]), [0, 0, 0]), [23, 19, 44]);
assert.deepEqual(actual.slice(0, 9), [122,207,456,653,782,909,932,979,1038]);

const sourceBlockEnd = pageEntries.find(p => p.page === 24).offset;
assert.equal(sourceBlockEnd, 5719); // original p7/p23/p56 five-dot hierarchy

/** @param {number[]} eventPositions */
function metrics(eventPositions) {
  const gaps = eventPositions.slice(1).map((x, i) => x - eventPositions[i]);
  let max3 = 0;
  for (let i = 2; i < gaps.length; i++)
    max3 = Math.max(max3, gaps[i-2] + gaps[i-1] + gaps[i]);
  return { corr: correlation(gaps), max3 };
}
/** Ordinary Pearson correlation between successive gaps. */
function correlation(gaps) {
  if (gaps.length < 3) return NaN;
  const n = gaps.length - 1;
  let sx=0,sy=0;
  for (let i=0;i<n;i++){sx+=gaps[i];sy+=gaps[i+1];}
  const mx=sx/n,my=sy/n;
  let xy=0,xx=0,yy=0;
  for (let i=0;i<n;i++){
    const x=gaps[i]-mx,y=gaps[i+1]-my;
    xy+=x*y;xx+=x*x;yy+=y*y;
  }
  return xy/Math.sqrt(xx*yy);
}
function partition(eventPositions) {
  const early = [], late = [];
  for (const n of eventPositions)
    (n < sourceBlockEnd ? early : late).push(n);
  return [metrics(early).corr,metrics(late).corr];
}
const real = metrics(actual), realHalves = partition(actual);
assert(Math.abs(real.corr - 0.38001968924100965) < 1e-12);
assert.equal(real.max3, 1649);
assert.equal(actual.filter(x=>x<sourceBlockEnd).length,30);
assert.equal(actual.filter(x=>x>=sourceBlockEnd).length,56);

// Fixed, seeded null with no hidden parameter fitting.
let seed = 0x37a19a52;
function randomInt(max) {
  assert(max > 0);
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return (seed >>> 0) % max;
}
function choose(pool, count, out) {
  assert(count <= pool.length);
  const selected = new Set();
  while (selected.size < count) selected.add(randomInt(pool.length));
  for (const index of selected) out.push(pool[index]);
}
function draw(mode) {
  const sample = [];
  for (const p of pageEntries) {
    if (mode === "page") {
      const pool = p.pools.flat();
      choose(pool, p.counts.reduce((a,b)=>a+b,0), sample);
    } else if (mode === "boundary") {
      choose(p.pools[0],p.counts[0],sample);
      choose(p.pools[1].concat(p.pools[2]),p.counts[1]+p.counts[2],sample);
    } else {
      assert.equal(mode,"position");
      for(let j=0;j<3;j++)choose(p.pools[j],p.counts[j],sample);
    }
  }
  assert.equal(sample.length,actual.length);
  sample.sort((a,b)=>a-b);
  return sample;
}
const draws = 30000;
const output = [];
for (const mode of ["page", "boundary", "position"]) {
  let countCorr=0,countMax3=0,countEarly=0,countLate=0;
  let sumCorr=0,sumMax3=0;
  for (let i=0;i<draws;i++) {
    const sample=draw(mode);
    const observed=metrics(sample);
    const halves=partition(sample);
    countCorr+=Number(observed.corr>=real.corr);
    countMax3+=Number(observed.max3>=real.max3);
    countEarly+=Number(halves[0]>=realHalves[0]);
    countLate+=Number(halves[1]>=realHalves[1]);
    sumCorr+=observed.corr;
    sumMax3+=observed.max3;
  }
  output.push({
    null: mode, draws,
    meanCorrelation:sumCorr/draws,geOriginalCorrelation:countCorr,
    upperTailCorrelation:(countCorr+1)/(draws+1),
    meanMaxThreeGaps:sumMax3/draws,geOriginalMaxThreeGaps:countMax3,
    upperTailMaxThreeGaps:(countMax3+1)/(draws+1),
    earlyCorr:realHalves[0],earlyUpper:(countEarly+1)/(draws+1),
    lateCorr:realHalves[1],lateUpper:(countLate+1)/(draws+1)
  });
}
assert(output.every(o=>o.upperTailCorrelation<0.025),
  "overall original Pearson gap persistence should survive page conditioning");
assert(output.every(o=>o.upperTailMaxThreeGaps>0.1&&o.upperTailMaxThreeGaps<0.9),
  "1649-rune three-gap span should cease to be exceptional after page conditioning");

// Positive model control: every draw preserves exactly the original per-page
// and (when typed) word-class doublet inventories by construction.
const planted = draw("position");
for(const p of pageEntries) {
  const n = planted.filter(x=>x>=p.offset&&x<p.end);
  assert.equal(n.length,p.counts.reduce((s,v)=>s+v,0));
  const types=n.map(x=>starts.has(x)?0:ends.has(x)?1:2);
  assert.deepEqual([0,1,2].map(j=>types.filter(t=>t===j).length),p.counts);
}
console.log(JSON.stringify({
  status:"PASS",source:{runes:corpus.length,pages:pages.length,words:wordCount,
    samePageEvents:actual.length,wordPositionCounts:[23,19,44],
    knownLiteratureSplitAtPhysicalPage24:sourceBlockEnd,
    actualPearsonLagOne:real.corr,
    originalMaxThreeConsecutiveGaps:real.max3,
    earlyPearson:realHalves[0],latePearson:realHalves[1]},
  conditionalNulls:output,positiveSamplingControl:true,
  randomness:"xorshift32 seed 0x37a19a52, 30000 samples per family"
},null,2));
