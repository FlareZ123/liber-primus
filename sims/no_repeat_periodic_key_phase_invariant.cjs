"use strict";
/**
 * Key-free phase-equality exclusion for a 28-code no-adjacent-repeat channel.
 * Original LP2 C is decoded to ranks 0..27, then same-phase equality is
 * measured without knowing the repeating additive key or internal relabeling.
 *
 * Fixed candidate periods: 8,16,32,64,128,256. Two rank conventions;
 * key phase continuous across pages or reset at the first rune of each page.
 * Source observations C[i]===C[i-1] are erasures. Page-first rune is omitted.
 *
 * Node.js 22+, built-in libraries only.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
const PERIODS = [8, 16, 32, 64, 128, 256];
const TYPES = ["sorted", "cyclic"];
const SCOPES = ["page", "continuous"];
const UNIFORM28 = 1 / 28;
const RESAMPLE_COUNT = 300;
const SEED = 0x28256225;
const DI = {TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:27};
const LET = {A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,
  K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,
  W:7,X:14,Y:26,Z:15};

/** @returns {number[][]} Rune-bearing unsolved LP2 physical pages. */
function loadPages() {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT,
    "resources/liber-primus/lp2-corpus.json"), "utf8"));
  const pages = data.pages.filter(p => p.status === "unsolved"
    && p.indices.length).map(p => p.indices);
  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((s, p) => s+p.length, 0), 12956);
  assert.equal(pages.reduce((s,p)=>s+p.slice(1).filter((v,i)=>v===p[i]).length,0),86);
  return pages;
}

/** @param {number} seed @returns {() => number} Deterministic [0,1) generator. */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * @param {number[]} page Rune indices.
 * @param {string} type One of the two reversible 28-rank conventions.
 * @param {number} i 1-based position within page.
 * @returns {number|null} Rank or erasure.
 */
function inverseRank(page, type, i) {
  const c = page[i], prev = page[i-1];
  if (c === prev) return null;
  return type === "sorted"
    ? c - Number(c > prev)
    : (c - prev + 29) % 29 - 1;
}

/**
 * Equality is invariant under an unknown additive pad reused at this phase
 * and an arbitrary *fixed* permutation of the internal plaintext symbols.
 * @param {number[][]} pages
 * @param {string} type
 * @param {string} scope
 * @param {number} period
 */
function phaseRate(pages, type, scope, period) {
  const histogram = Array.from({length:period}, () => new Uint16Array(28));
  let offset = 0, valid = 0, same = 0, pairs = 0;
  for (const page of pages) {
    for (let i = 1; i < page.length; i++) {
      const rank = inverseRank(page, type, i);
      if (rank === null) continue;
      const phase = ((scope === "continuous" ? offset : 0) + i) % period;
      histogram[phase][rank]++;
      valid++;
    }
    offset += page.length;
  }
  for (const bins of histogram) {
    let n = 0;
    for (const c of bins) {n += c; same += c*(c-1);}
    pairs += n*(n-1);
  }
  assert.ok(pairs > 0);
  assert.equal(valid, 12815);
  return {
    rate:same/pairs, same, pairs, valid,
    zNominal:(same-pairs*UNIFORM28)/Math.sqrt(pairs*UNIFORM28*(1-UNIFORM28))
  };
}

/** @param {number[][]} pages @returns {object[]} All 24 tests, sorted by nominal z. */
function scan(pages) {
  const output = [];
  for (const type of TYPES) for (const scope of SCOPES)
    for (const period of PERIODS)
      output.push({type,scope,period,...phaseRate(pages,type,scope,period)});
  return output.sort((a,b)=>b.zNominal-a.zNominal);
}

/**
 * Translate authentic source-register alphabetic words into a GP28 control.
 * English digraph collapse uses the repository's established GP conversion.
 * The rare EA symbol folds to the 28th rank, so the alphabet has 28 codes.
 * @param {number} count
 * @returns {number[]}
 */
function englishSource(count) {
  const text = fs.readFileSync(path.join(ROOT,
    "resources/control/shakespeare_first300k.txt"), "utf8");
  const words = text.toUpperCase().match(/[A-Z]+/g);
  const output = [];
  for (const word of words) {
    for (let i=0; i<word.length; i++) {
      const d = DI[word.slice(i,i+2)];
      if (d !== undefined) {output.push(d);i++;}
      else output.push(LET[word[i]]);
    }
    if (output.length >= count) break;
  }
  assert.ok(output.length >= count);
  return output.slice(0,count);
}

/** @param {number[][]} pages @param {number[]} source */
function splitSource(pages, source) {
  let j=0;
  return pages.map(p => {
    const segment=source.slice(j,j+p.length);
    j+=p.length;
    return segment;
  });
}

/**
 * Reversibly encrypt GP28 input through one of the two exclusion-rank maps.
 * The 86 *fixed original LP2 immediate-doublet positions* are overwritten
 * with the preceding published rune, and are omitted from the inverse.
 * This maximally permits observed exceptions to the strict 28-output model.
 * @param {number[][]} real
 * @param {number[][]} source
 * @param {number[]} pad
 * @param {string} type
 * @param {string} scope
 * @param {number} period
 */
function plant(real, source, pad, type, scope, period) {
  let offset=0;
  return source.map((page,j) => {
    const out=[];
    for(let i=0;i<page.length;i++) {
      const phase=((scope==="continuous"?offset:0)+i)%period;
      const rank=(page[i]+pad[phase])%28;
      if(i===0){out.push(rank);continue;}
      const prev=out[i-1];
      if(real[j][i]===real[j][i-1])out.push(prev);
      else if(type==="sorted")out.push(rank<prev?rank:rank+1);
      else out.push((prev+1+rank)%29);
    }
    offset+=page.length;
    return out;
  });
}

/** @param {number[][]} pages @param {()=>number} rand */
function rotatePages(pages, rand) {
  return pages.map(p=>{
    const offset=Math.floor(rand()*p.length);
    return p.slice(offset).concat(p.slice(0,offset));
  });
}

/** @returns {object} Full independent-key exclusion benchmark. */
function run() {
  const pages=loadPages();
  const observed=scan(pages);
  const top=observed[0];
  const observedRawMax=Math.max(...observed.map(x=>x.rate));
  const source=splitSource(pages,englishSource(12956));
  const padRng=xorshift32(SEED);
  const pad=Array.from({length:256},()=>Math.floor(padRng()*28));
  const positives=[];
  for(const type of TYPES) for(const scope of SCOPES) {
    const planted=plant(pages,source,pad,type,scope,256);
    const metric=phaseRate(planted,type,scope,256);
    positives.push({type,scope,period:256,rate:metric.rate,
      same:metric.same,pairs:metric.pairs});
    assert.ok(metric.rate>0.057,"Planted English rank model must be detectable");
  }
  const rand=xorshift32(SEED);
  let nullMaxAtLeastNominal=0,nullMaxAtLeastRaw=0;
  let nullNominalSum=0,nullRawSum=0;
  for(let sample=0;sample<RESAMPLE_COUNT;sample++) {
    const permuted=scan(rotatePages(pages,rand));
    const nullMaxNominal=permuted[0].zNominal;
    const nullMaxRaw=Math.max(...permuted.map(x=>x.rate));
    nullNominalSum+=nullMaxNominal;nullRawSum+=nullMaxRaw;
    nullMaxAtLeastNominal+=Number(nullMaxNominal>=top.zNominal);
    nullMaxAtLeastRaw+=Number(nullMaxRaw>=observedRawMax);
  }
  return {
    sourcePages:pages.length,sourceRunes:12956,validRankObservations:12815,
    model:"strict 28-rank exclusion, arbitrary shared L-period additive key",
    periods:PERIODS,observed,
    observedBestByNominalZ:top,observedBestRawRate:observedRawMax,
    planted:positives,calibration:{
      samples:RESAMPLE_COUNT,seed:SEED,
      rotationFamilyMaxNominalP:(nullMaxAtLeastNominal+1)/(RESAMPLE_COUNT+1),
      rotationFamilyMaxRawP:(nullMaxAtLeastRaw+1)/(RESAMPLE_COUNT+1),
      nullNominalMean:nullNominalSum/RESAMPLE_COUNT,
      nullRawMean:nullRawSum/RESAMPLE_COUNT
    }
  };
}

if(require.main===module) console.log(JSON.stringify(run(),null,2));
module.exports={loadPages,inverseRank,phaseRate,scan,englishSource,
  splitSource,plant,rotatePages,run};
