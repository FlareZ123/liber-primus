"use strict";
/**
 * Full 29^3 GF29 recurrence key search for the speculative 13-rune
 * EPIPHANY SEECS original opening title, *without* the special F bypass.
 * Tests the separate ordinary historically attested additive GP29 variant.
 *
 * Native-GP trigram profile: original-independent Shakespeare training.
 * Calibration: original independently solved p57 and heldout Gibran text.
 * The exact assumed title's first13 are excluded from all language scores.
 *
 * Node.js 22 CommonJS / Windows 11:
 * node sims/lp2_p0_epiphany_fibonacci_allcoeff_nof_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root,file),"utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = corpus.pages.slice(0,3).flatMap(p=>p.indices);
const source57 = corpus.pages.find(p=>p.page===57).indices;
const MOD = 29, RUNE_TRIGRAMS = MOD**3;
const runes = corpus.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {number} x @returns {number} */
const mod = x => ((x%MOD)+MOD)%MOD;
/** @param {string} text @returns {number[]} */
function gp(text) {
  const words=text.toUpperCase().replace(/ING/g,"NG").replace(/IO/g,"IA")
    .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S")
    .replace(/[^A-Z]/g," ").split(/\s+/);
  const out=[];
  for(const word of words)for(let i=0;i<word.length;) {
    const t=runes.find(x=>word.startsWith(x.s,i));
    assert.ok(t, "Invalid GP word fragment "+word.slice(i));
    out.push(t.i);
    i+=t.s.length;
  }
  return out;
}
/**
 * @param {number[]} train
 * @returns {(value:number[])=>number}
 */
function languageScore(train) {
  const counts=new Float64Array(RUNE_TRIGRAMS).fill(1);
  const totals=new Float64Array(MOD**2).fill(MOD);
  for(let i=2;i<train.length;i++) {
    const prefix=train[i-2]*MOD+train[i-1];
    counts[prefix*MOD+train[i]]++;
    totals[prefix]++;
  }
  const logs=counts.map((n,i)=>Math.log(n/totals[Math.floor(i/MOD)]));
  return value=>{
    let result=0;
    for(let i=2;i<value.length;i++)
      result+=logs[(value[i-2]*MOD+value[i-1])*MOD+value[i]];
    return result/(value.length-2);
  };
}
function run() {
  assert.deepEqual(corpus.pages.slice(0,3).map(p=>p.runic_count),
    [262,266,201]);
  assert.equal(original.length,729);
  const title=gp("EPIPHANY SEECS");
  assert.equal(title.length,13);
  const seed=title.map((p,i)=>mod(original[i]-p));
  assert.deepEqual(seed,[26,24,8,19,27,24,18,3,0,8,0,16,19]);
  const shakespeare=gp(read("resources/control/shakespeare_first300k.txt"));
  const gibran=gp(read("resources/control/gibran_prophet_58585.txt"));
  assert.equal(shakespeare.length,217106);
  assert.equal(gibran.length,62492);
  const score=languageScore(shakespeare);
  const gibranScores=[];
  for(let off=0;off+729<=gibran.length;off+=729)
    gibranScores.push(score(gibran.slice(off,off+729)));
  assert.equal(gibranScores.length,85);
  const worstGibran=Math.min(...gibranScores);
  const authentic57=score(source57);
  const raw=score(original.slice(13));
  let best={score:-Infinity,a:0,b:0,c:0,training:0,holdout:0},tested=0,plausible=0;
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++) {
    tested++;
    const key=new Uint8Array(729);
    key.set(seed);
    for(let i=13;i<729;i++)
      key[i]=mod(a*key[i-13]+b*key[i-8]+c*key[i-5]);
    const plain=original.map((value,i)=>mod(value-key[i]));
    const full=score(plain.slice(13));
    if(full>-3.4)plausible++;
    if(full>best.score) {
      best={score:full,a,b,c,training:score(plain.slice(13,360)),
        holdout:score(plain.slice(360)),nativePreview:plain.slice(13,70)
          .map(v=>corpus.translit[v]).join("")};
      assert.deepEqual(plain.map((value,i)=>mod(value+key[i])),original);
    }
  }
  assert.equal(tested,24389);
  assert.deepEqual([best.a,best.b,best.c],[8,18,0]);
  assert.ok(Math.abs(best.score-(-3.8307344307254136))<1e-9);
  assert.ok(Math.abs(best.training-(-3.7747829311484136))<1e-9);
  assert.ok(Math.abs(best.holdout-(-3.886791505528102))<1e-9);
  assert.ok(Math.abs(raw-(-4.000874740368636))<1e-9);
  assert.ok(Math.abs(authentic57-(-2.452599338767663))<1e-9);
  assert.ok(Math.abs(worstGibran-(-2.8052978363204932))<1e-9);
  assert.equal(plausible,0);
  assert.ok(best.score<worstGibran);
  console.log(JSON.stringify({
    inference:"conditional EPIPHANY SEECS p0 title and ordinary no-F additive",
    coefficientsScanned:tested,trainingGPCount:shakespeare.length,
    heldoutGPCount:gibran.length,heldoutWindows:gibranScores.length,
    language:"smoothed GP29 trigrams, nats per rune; higher is better",
    genuineP57Score:authentic57,
    lowestHeldoutNativeGibran729Score:worstGibran,
    originalCiphertextScore:raw,bestAllCoefficients:best,
    sourceNativeCandidatesAboveMinus3_4:plausible,
    recoveredUnknownPlaintext:false
  },null,2));
}
if(require.main===module)run();
module.exports={run,gp,languageScore};
