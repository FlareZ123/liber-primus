// @ts-check
/**
 * All-GP29 reserved-rune gate for literal equal-neighbor ciphertext markers.
 * Run: node sims/lp2_single_reserved_rune_wordshape_sft.cjs
 * Uses original LP2 word boundaries and three independently authored GP-native
 * English source controls. No packages and no historical cipher attribution.
 */
"use strict";
const fs = require("node:fs");
const assert = require("node:assert/strict");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const alphabet = ["F","U","TH","O","R","C","G","W","H","N","I","J",
  "EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const digraphs = ["TH","EO","NG","OE","AE","IA","EA"];
const lookup = new Map(alphabet.map((x, i) => [x, i]));
assert.equal(alphabet.length, 29);

/** @param {string} text @returns {number[]} */
function gpWord(text) {
  const s = text.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    const token = digraphs.find(x => s.startsWith(x, i));
    const k = token === undefined ? lookup.get(s[i]) : lookup.get(token);
    assert.notEqual(k, undefined, "GP29 token missing");
    out.push(/** @type {number} */ (k));
    i += token === undefined ? 1 : token.length;
  }
  return out;
}
/** @param {number[]} values @returns {[number[],number[]]} */
function tally(values) {
  const total = Array(29).fill(0), final = Array(29).fill(0);
  for (let j = 1; j < values.length; j++) total[values[j]]++;
  if (values.length > 1) final[values[values.length-1]]++;
  return [total, final];
}

/** Reversible source-native positive plant: fixed reserved plaintext index maps to step 0. */
function plantRoundtrip() {
  const p = gpWord("ANENDINGTHEBEGINNINGPROCEEDINGWITHWISDOM");
  const reserved = lookup.get("NG");
  assert.notEqual(reserved, undefined);
  const c = [p[0]];
  for (let i = 1; i < p.length; i++) {
    const step = p[i] === reserved ? 0 : p[i] < reserved ? p[i]+1 : p[i];
    c.push((c[i-1]+step)%29);
  }
  const q = [c[0]];
  for (let i = 1; i < c.length; i++) {
    const step = (c[i]-c[i-1]+29)%29;
    q.push(step === 0 ? reserved : step <= reserved ? step-1 : step);
  }
  assert.deepEqual(q,p);
  for(let i=1;i<p.length;i++) assert.equal(c[i]===c[i-1],p[i]===reserved);
}
plantRoundtrip();

const shared = parseSharedCorpus();
assert.equal(shared.words.length, 2896);
assert.equal(shared.runeCount, 12956);
assert.equal(shared.crossPageWords, 32);
const histogram = new Map();
let observedTotal = 0, observedFinal = 0;
for (const w of shared.words) {
  histogram.set(w.length, (histogram.get(w.length)||0)+1);
  const z = [...w.runes];
  for (let j = 1; j < z.length; j++) {
    if (z[j] !== z[j-1]) continue;
    observedTotal++;
    if (j === z.length-1) observedFinal++;
  }
}
assert.equal(observedTotal,63);
assert.equal(observedFinal,19);

let seed=0x3301ac23;
/** @returns {number} */
function random() {
  seed ^= seed<<13; seed ^= seed>>>17; seed ^= seed<<5;
  return (seed>>>0)/4294967296;
}

const files = [
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"]
];
const output=[];
for (const [name,path] of files) {
  const raw = fs.readFileSync(path,"utf8").match(/[A-Za-z]+/g) || [];
  /** @type {Map<number,number[][]>} */
  const groups = new Map();
  for (const w of raw) {
    const g = gpWord(w);
    let pool = groups.get(g.length);
    if (!pool) { pool=[]; groups.set(g.length,pool); }
    pool.push(g);
  }
  const meanT=Array(29).fill(0),meanF=Array(29).fill(0),
    varianceT=Array(29).fill(0),varianceF=Array(29).fill(0),
    covariance=Array(29).fill(0);
  for(const [n,count] of histogram) {
    const pool = groups.get(n);
    assert(pool, "Missing GP length "+n+" from "+name);
    const sumT=Array(29).fill(0),sumF=Array(29).fill(0),
      sumT2=Array(29).fill(0),sumF2=Array(29).fill(0),
      sumTF=Array(29).fill(0);
    for(const g of pool) {
      const [t,f]=tally(g);
      for(let k=0;k<29;k++) {
        sumT[k]+=t[k];sumF[k]+=f[k];
        sumT2[k]+=t[k]*t[k];sumF2[k]+=f[k]*f[k];
        sumTF[k]+=t[k]*f[k];
      }
    }
    for(let k=0;k<29;k++){
      const mt=sumT[k]/pool.length,mf=sumF[k]/pool.length;
      meanT[k]+=count*mt;meanF[k]+=count*mf;
      varianceT[k]+=count*(sumT2[k]/pool.length-mt*mt);
      varianceF[k]+=count*(sumF2[k]/pool.length-mf*mf);
      covariance[k]+=count*(sumTF[k]/pool.length-mt*mf);
    }
  }
  /** @param {number} k @param {number} t @param {number} f @returns {number} */
  function distance(k,t,f) {
    const dt=t-meanT[k],df=f-meanF[k];
    const determinant=varianceT[k]*varianceF[k]-covariance[k]*covariance[k];
    if (determinant<=1e-9) return dt*dt+df*df<1e-12 ? 0 : 1e12;
    return (dt*dt*varianceF[k]+df*df*varianceT[k]
      -2*dt*df*covariance[k])/determinant;
  }
  const options=alphabet.map((symbol,k)=>({symbol,
    expectedTotal:meanT[k],expectedFinal:meanF[k],
    score:distance(k,observedTotal,observedFinal)}))
    .sort((a,b)=>a.score-b.score);
  const reps=1000;
  let atLeastOriginal=0,maxBestControl=0;
  for(let rep=0;rep<reps;rep++){
    const totals=Array(29).fill(0), finals=Array(29).fill(0);
    for(const w of shared.words){
      const pool=/** @type {number[][]} */(groups.get(w.length));
      const g=pool[Math.floor(random()*pool.length)];
      const [t,f]=tally(g);
      for(let k=0;k<29;k++){totals[k]+=t[k];finals[k]+=f[k];}
    }
    const best=Math.min(...alphabet.map((_,k)=>distance(k,totals[k],finals[k])));
    if(best>=options[0].score)atLeastOriginal++;
    if(best>maxBestControl)maxBestControl=best;
  }
  assert(options[0].score>15);
  assert.equal(atLeastOriginal,0);
  output.push({corpus:name,sourceWords:raw.length,top:options.slice(0,5),
    replicates:reps,maxBestControl,controlsAtLeastOriginal:atLeastOriginal});
}
console.log(JSON.stringify({model:"single reserved plaintext GP29 rune iff ciphertext repeat",
  original:{words:shared.words.length,runes:shared.runeCount,
    withinWordRepeats:observedTotal,wordFinalRepeats:observedFinal},
  sourceNativePositivePlant:"passed",
  observations:output},null,2));
