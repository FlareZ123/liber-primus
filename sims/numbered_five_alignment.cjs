'use strict';
/**
 * LP2 five-numbered-passages alignment investigation.
 *
 * Compare the ciphertext after the red labels 1-5 (archive JPEGs 53-55).
 * The first numbered passage is the fixed anchor. Pairwise alignments scan
 * [-40,40] rune offsets without changing the other passage's word structure.
 * A train/validation split at half the overlap checks whether a short-lag
 * coincidence peak persists away from the positions that selected its lag.
 *
 * Inputs: original page-annotated transcription and 29-rune corpus.
 * Reproduce with Node.js 22: node sims/numbered_five_alignment.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const symbol = new Map(corpus.runes.map((r, index) => [r, index]));
// These are the physical items between the red 1-5 labels and printed separator,
// not the next unnumbered paragraph or the later physical page break.
const sourceSection = transcription.split('%').slice(36,39).join('%');
const labels = [...sourceSection.matchAll(/[1-5]-/g)];
assert.deepEqual(labels.map(x=>Number(x[0][0])), [1,2,3,4,5]);
const passages = labels.map((label,i) => {
  const end = i<4 ? labels[i+1].index : sourceSection.indexOf('&',label.index);
  assert.ok(end>label.index,'missing source item terminator for '+(i+1));
  return [...sourceSection.slice(label.index+2,end)]
    .filter(ch=>symbol.has(ch)).map(ch=>symbol.get(ch));
});
assert.deepEqual(passages.map(p=>p.length),[139,91,98,96,129]);
const pool = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(pool.length, 12956);

/** @param {number} count @param {number} length */
function zscore(count, length) {
  return (count - length / 29) / Math.sqrt(length * 28 / 841);
}

/**
 * Scan a finite family of physical (non-cyclic) rune alignments.
 * @param {number[]} a
 * @param {number[]} b
 */
function scan(a, b) {
  const rows = [];
  for (let lag = -40; lag <= 40; lag++) {
    let total = 0, first = 0, second = 0, nFirst = 0, nSecond = 0;
    const overlap = Math.max(0,
      Math.min(a.length, b.length - lag) - Math.max(0, -lag));
    const split = Math.floor(overlap / 2);
    for (let i = 0; i < a.length; i++) {
      const j = i + lag;
      if (j < 0 || j >= b.length) continue;
      const match = Number(a[i] === b[j]);
      if (total < split) { nFirst++; first += match; }
      else { nSecond++; second += match; }
      total++;
    }
    assert.equal(overlap, total);
    rows.push({
      lag, matches: first + second, n: total,
      fullZ: zscore(first + second, total),
      trainMatches: first, trainN: nFirst, trainZ: zscore(first, nFirst),
      validationMatches: second, validationN: nSecond,
      validationZ: zscore(second, nSecond)
    });
  }
  const fullPeak = rows.slice().sort((x, y) => y.fullZ - x.fullZ || x.lag - y.lag)[0];
  const three = rows.slice().sort((x, y) => y.trainZ - x.trainZ || x.lag - y.lag).slice(0, 3);
  const crossValidated = three.slice().sort((x, y) => y.validationZ - x.validationZ)[0];
  return { fullPeak, crossValidated, trainingChoices: three.map(x => x.lag) };
}

/** Deterministic LCG, seed is part of the analysis specification. */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Null 1: fixed genuine first passage, other four as mutually disjoint LP2
 * windows of the actual lengths. Includes the entire 81-lag search and
 * top-three training selection in each trial.
 */
function windowNull(observed, trials = 10000) {
  const random = rng(1013539);
  const thresholdFull = Math.min(...observed.map(r => r.fullPeak.fullZ));
  const thresholdCV = Math.min(...observed.map(r => r.crossValidated.validationZ));
  let fullExceed = 0, cvExceed = 0;
  for (let attempt = 0; attempt < trials; attempt++) {
    const windows = [];
    let minFull = Infinity, minCV = Infinity;
    for (let block = 1; block < 5; block++) {
      const length = passages[block].length;
      let start;
      do {
        start = Math.floor(random() * (pool.length - length + 1));
      } while (windows.some(w => start < w.end && start + length > w.start));
      windows.push({ start, end: start + length });
      const candidate = scan(passages[0], pool.slice(start, start + length));
      minFull = Math.min(minFull, candidate.fullPeak.fullZ);
      minCV = Math.min(minCV, candidate.crossValidated.validationZ);
    }
    if (minFull >= thresholdFull) fullExceed++;
    if (minCV >= thresholdCV) cvExceed++;
  }
  return {trials, seed: 1013539, anchorFixed: true,
    sample: 'Four nonoverlapping intervals drawn from all 12,956 genuine LP2 runes',
    fullExceed, fullP: (fullExceed + 1) / (trials + 1),
    cvExceed, cvP: (cvExceed + 1) / (trials + 1) };
}

/**
 * Null 2: preserve the exact observed rune multiset for each of the four
 * partners, while scrambling their order. The first passage stays untouched.
 */
function shuffleNull(observed, trials = 10000) {
  const random = rng(730031);
  const thresholdFull = Math.min(...observed.map(r => r.fullPeak.fullZ));
  const thresholdCV = Math.min(...observed.map(r => r.crossValidated.validationZ));
  let fullExceed = 0, cvExceed = 0;
  for (let attempt = 0; attempt < trials; attempt++) {
    let minFull = Infinity, minCV = Infinity;
    for (let block = 1; block < 5; block++) {
      const partner = passages[block].slice();
      for (let i = partner.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [partner[i], partner[j]] = [partner[j], partner[i]];
      }
      const candidate = scan(passages[0], partner);
      minFull = Math.min(minFull, candidate.fullPeak.fullZ);
      minCV = Math.min(minCV, candidate.crossValidated.validationZ);
    }
    if (minFull >= thresholdFull) fullExceed++;
    if (minCV >= thresholdCV) cvExceed++;
  }
  return {trials, seed: 730031, anchorFixed: true,
    sample: 'Independent uniform shuffles of each partner, preserving exact 29-rune histogram',
    fullExceed, fullP: (fullExceed + 1) / (trials + 1),
    cvExceed, cvP: (cvExceed + 1) / (trials + 1)};
}

/**
 * Test the transitive implication of one globally shared additive pad.
 * If block 1 aligns to block k at lag[k], then block j and block k
 * should also align at lag[k]-lag[j] wherever their pad overlaps.
 */
function transitiveCheck(observed) {
  const lags = [0, ...observed.map(r => r.fullPeak.lag)];
  const pairs = [];
  for (let i = 1; i < 5; i++) for (let j = i + 1; j < 5; j++) {
    const lag = lags[j] - lags[i];
    let matches = 0, compared = 0;
    for (let t = 0; t < passages[i].length; t++) {
      const u = t + lag;
      if (u >= 0 && u < passages[j].length) {
        compared++;
        matches += Number(passages[i][t] === passages[j][u]);
      }
    }
    pairs.push({blocks:[i+1,j+1],lag,matches,compared});
  }
  return {inferredLags:lags, pairs,
    combinedMatches:pairs.reduce((a,p) => a+p.matches,0),
    combinedCompared:pairs.reduce((a,p) => a+p.compared,0)};
}

function study() {
  const observed = passages.slice(1).map(p => scan(passages[0], p));
  return {
    classification: 'exploratory, no LP2 key or plaintext recovered',
    source: 'LP2 labels 1-5 across original JPEGs 53-55, fifth item ends at the printed red-dot separator',
    passageLengths: passages.map(p => p.length),
    lagRange: [-40,40],
    fixedAnchor: 1, trainSearchChoices: 3,
    observed: observed.map((r, i) => ({partner: i+2, ...r})),
    fullMinimumZ: Math.min(...observed.map(r => r.fullPeak.fullZ)),
    crossValidatedMinimumZ: Math.min(...observed.map(r => r.crossValidated.validationZ)),
    windowNull: windowNull(observed),
    shuffleNull: shuffleNull(observed),
    transitivity: transitiveCheck(observed),
    caveat: 'Fixed-anchor nulls condition on passage 1 and the selected analysis; they do not adjust for all human exploratory choices. The four lags fail a single common-pad transitivity check.'
  };
}

/**
 * Test the independently numbered 1..5 passages as polynomial evaluations in F29.
 * Five values from a cubic polynomial obey the exact fourth finite difference:
 * C1 - 4*C2 + 6*C3 - 4*C4 + C5 = 0 (mod 29).
 * Common affine output alphabets preserve these vanishing differences.
 *
 * Direct item starts and the existing equality-derived hub shifts are predeclared
 * finite checks; the separate degree-1 relative-shift scan is selection-calibrated.
 */
function fieldShareStudy() {
  const coefficientSets = [
    {degree:1, coefficients:[1,-2,1]},
    {degree:2, coefficients:[1,-3,3,-1]},
    {degree:3, coefficients:[1,-4,6,-4,1]}
  ];
  const mod = x => ((x % 29) + 29) % 29;

  /** @param {number[][]} blocks @param {number[]} shifts @param {number[]} coefficients */
  function measure(blocks, shifts, coefficients) {
    const low = Math.max(0, ...coefficients.map((_,i) => -shifts[i]));
    const high = Math.min(blocks[0].length,
      ...coefficients.map((_,i) => blocks[i].length - shifts[i]));
    let hits = 0;
    for(let position=low;position<high;position++) {
      let total = 0;
      for(let i=0;i<coefficients.length;i++)
        total += coefficients[i] * blocks[i][position+shifts[i]];
      hits += Number(mod(total)===0);
    }
    return {hits,compared:Math.max(0,high-low),z:zscore(hits,Math.max(0,high-low))};
  }

  const itemStarts = [0,0,0,0,0];
  const hubShifts = [0,-24,-20,-34,-9];
  const measured = [
    {name:'numbered-item-initial-runes',shifts:itemStarts},
    {name:'existing-hub-coincidence-shifts',shifts:hubShifts}
  ].map(mode=>({
    ...mode,
    conditions:coefficientSets.map(f=>({
      degree:f.degree,...measure(passages,mode.shifts,f.coefficients)
    }))
  }));

  /** Search one specified F29 linear-share relation, not arbitrary coefficients. */
  function shiftedLinearScreen(blocks) {
    let best={z:-Infinity};
    let tested=0;
    for(let offset2=-40;offset2<=40;offset2++)
      for(let offset3=-40;offset3<=40;offset3++) {
        const shifts=[0,offset2,offset3];
        const low=Math.max(0,-offset2,-offset3);
        const high=Math.min(blocks[0].length,blocks[1].length-offset2,blocks[2].length-offset3);
        const n=high-low;
        if(n<60)continue;
        tested++;
        let hits=0;
        for(let i=low;i<high;i++)
          hits+=Number(mod(blocks[0][i]-2*blocks[1][i+offset2]+blocks[2][i+offset3])===0);
        const z=zscore(hits,n);
        if(z>best.z)best={offset2,offset3,hits,compared:n,z};
      }
    return {tested,best};
  }

  const screen = shiftedLinearScreen(passages);
  const random = rng(1901107);
  const controls=500;
  let exceed=0;
  for(let t=0;t<controls;t++) {
    const st2=Math.floor(random()*(pool.length-passages[1].length));
    const st3=Math.floor(random()*(pool.length-passages[2].length));
    const blocks=[passages[0],
      pool.slice(st2,st2+passages[1].length),
      pool.slice(st3,st3+passages[2].length)];
    if(shiftedLinearScreen(blocks).best.z>=screen.best.z)exceed++;
  }

  // A synthetic 81-rune, five-share cubic plant has an exact direct inverse.
  const planted = passages.map(block=>block.slice());
  const plantRandom = rng(3301);
  for(let i=34;i<115;i++) {
    const coefficients=Array.from({length:4},()=>Math.floor(plantRandom()*29));
    for(let j=0;j<5;j++) {
      const x=j+1;
      const encoded=mod(coefficients[0]+coefficients[1]*x+
        coefficients[2]*x*x+coefficients[3]*x*x*x);
      planted[j][i+hubShifts[j]]=encoded;
    }
  }
  const positive=measure(planted,hubShifts,coefficientSets[2].coefficients);
  assert.deepEqual([positive.hits,positive.compared],[81,81]);

  return {
    status:'No direct F29 numbered-share reconstruction in LP2',
    source:'Original numbered items 1..5, fifth item ends before red-dot paragraph separator',
    pageItemLengths:passages.map(p=>p.length),
    measured,
    shiftedLinearScreen:screen,
    shiftedLinearWindowControl:{trials:controls,seed:1901107,exceed,
      p:(exceed+1)/(controls+1)},
    plantedFiveShareCubic:{hits:positive.hits,compared:positive.compared},
    caveat:'This excludes direct common-affine-output low-degree polynomial shares at the tested phases; an unknown non-affine alphabet, transposition, or additional encryption remains outside the test.'
  };
}

if (require.main === module) {
  const result=process.argv.includes('--field-share') ? fieldShareStudy() : study();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports = {scan, study, fieldShareStudy};
