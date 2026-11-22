"use strict";
/**
 * Director #2083, Agent46: exact raw-token second-digit parity contrast.
 * SFT: node sims/lp2_p50_two_radix_parity_visualchapter_holdout_sft.cjs
 * Read-only Windows 11 / Node 22 / CommonJS.
 *
 * Frozen historical input: 256 table tokens, full original physical pages
 * p0-55 and nine independently established original visual chapter cuts.
 * Unlike radix59 whole-value parity, this parity is only of the SECOND
 * printed character's ordinal in the chosen original historical alphabet.
 *
 * The cross-validation is retrospective on the two historically proposed
 * alphabets and is not an authorial authentication of either numeral system.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const alphabet60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const alphabet59 = alphabet60.replace("f", "");
assert.equal(grid.alphabet, alphabet60);
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.byte_count, 256);
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const raw = gp.pages.filter(p => p.page <= 55);
assert.equal(raw.reduce((s,p)=>s+p.indices.length,0),12956);
const matrices = [alphabet60,alphabet59].map(() => 
  chapters.map(() => Array.from({length:4},()=>[0,0]))
);
let global = 0;
for (const page of raw) {
  const chapter = chapters.findIndex(([start,end])=>start<=page.page&&page.page<=end);
  assert(chapter>=0);
  page.indices.forEach((r,loc)=>{
    if(loc>0) {
      const token = tokens[(global-1)%256];
      const low = token[0]==="0";
      const equal = +(r===page.indices[loc-1]);
      [alphabet60,alphabet59].forEach((alpha,kind)=>{
        const digit = alpha.indexOf(token[1]);
        assert(digit>=0);
        const group = (low?2:0) + ((digit&1)===0?1:0);
        matrices[kind][chapter][group][0]++;
        matrices[kind][chapter][group][1]+=equal;
      });
    }
    global++;
  });
}
assert.equal(global,12956);
/** @param {number[][][]} bins */
function foldCounts(bins) {
  return Array.from({length:4},(_,j)=>bins.reduce(
    (sum,chapter)=>[sum[0]+chapter[j][0],sum[1]+chapter[j][1]],[0,0]));
}
/** @param {number[][][]} bins */
function foldScore(bins) {
  const segments = [];
  let modelTotal=0, baselineTotal=0;
  for(let out=0;out<9;out++) {
    const training=bins.filter((_,i)=>i!==out);
    const four=foldCounts(training);
    const [n,e]=four.reduce((sum,[k,h])=>[sum[0]+k,sum[1]+h],[0,0]);
    const baseline=(e+0.5)/(n+1);
    let model=0,control=0;
    for(let group=0;group<4;group++) {
      const p=(four[group][1]+0.5)/(four[group][0]+1);
      const [N,E]=bins[out][group];
      model+=E*Math.log(p)+(N-E)*Math.log1p(-p);
      control+=E*Math.log(baseline)+(N-E)*Math.log1p(-baseline);
    }
    segments.push(model-control);
    modelTotal+=model;
    baselineTotal+=control;
  }
  return {
    gain:modelTotal-baselineTotal,
    modelLogLikelihood:modelTotal,
    pooledLogLikelihood:baselineTotal,
    foldGains:segments
  };
}
const sixty=foldCounts(matrices[0]);
const fiftyNine=foldCounts(matrices[1]);
assert.deepEqual(sixty,[[4937,21],[4939,32],[1216,4],[1809,29]]);
assert.deepEqual(fiftyNine,[[4289,20],[5587,33],[1515,10],[1510,23]]);
const score60=foldScore(matrices[0]),score59=foldScore(matrices[1]);
const eps=1e-6;
assert(Math.abs(score60.gain-10.651281125630078)<eps);
assert(Math.abs(score59.gain-5.660394784199411)<eps);
const firstSeven = m => foldCounts(m.slice(0,7));
const finalTwo = m => foldCounts(m.slice(7));
function heldout(m) {
  const train=firstSeven(m),test=finalTwo(m);
  const [allN,allE]=train.reduce((s,[n,e])=>[s[0]+n,s[1]+e],[0,0]);
  const base=(allE+0.5)/(allN+1);
  let gain=0;
  for(let j=0;j<4;j++) {
    const p=(train[j][1]+0.5)/(train[j][0]+1),[n,e]=test[j];
    gain+=e*Math.log(p/base)+(n-e)*Math.log((1-p)/(1-base));
  }
  return {train,test,gain};
}
const held60=heldout(matrices[0]),held59=heldout(matrices[1]);
assert(Math.abs(held60.gain-3.1076961561435326)<eps);
assert(Math.abs(held59.gain+0.160775996163963)<eps);
const sum=sixty.reduce((s,[n,e])=>[s[0]+n,s[1]+e],[0,0]);
assert.deepEqual(sum,[12901,86]);
const lowRr60=(sixty[3][1]/sixty[3][0])/(sixty[2][1]/sixty[2][0]);
const lowRr59=(fiftyNine[3][1]/fiftyNine[3][0])/(fiftyNine[2][1]/fiftyNine[2][0]);
console.log(JSON.stringify({
  scope:"original 12956 GP29 runes, 12901 within-page transitions, 86 repeats",
  groups:["nonlow odd","nonlow even","low odd","low even"],
  originalSecondPrintedDigitParity:{
    base60:{counts:sixty,lowEvenOddRiskRatio:lowRr60,chapterHoldout:score60,lateSectionHoldout:held60},
    dropf59:{counts:fiftyNine,lowEvenOddRiskRatio:lowRr59,chapterHoldout:score59,lateSectionHoldout:held59},
    allFoldDifference:score60.modelLogLikelihood-score59.modelLogLikelihood,
    lateSectionDifference:held60.gain-held59.gain
  },
  limitation:"Retrospective source-digit contrast, no operator/key or new plaintext."
},null,2));
