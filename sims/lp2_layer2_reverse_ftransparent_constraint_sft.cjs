"use strict";

/**
 * Exact original GP29 reverse-order all-secret Fehu receiver, period 5–6.
 *
 * A long original Fehu-free ciphertext span imposes necessary, finite key
 * value and key-difference constraints at every periodic key phase. Unknown
 * global key phase is normalized to zero at that span by a cyclic rotation.
 * Every surviving short-period secret key is then run through the complete
 * 3008-rune original chapter, with all initial phases and all F-skip states.
 *
 * Reproduction on Windows 11:
 * node sims/lp2_layer2_reverse_ftransparent_constraint_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const gp = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const raw = fs.readFileSync(path.join(ROOT,"resources","lp2-transcription.txt"),"utf8");
const runeToValue = new Map(gp.runes.map((r,i)=>[r,i]));
const allRunes=[], allWords=[];
let newWord=true;
for (const ch of raw) {
  const x=runeToValue.get(ch);
  if (x!==undefined) {
    allRunes.push(x);
    allWords.push(newWord);
    newWord=false;
  } else if (ch==="-"||ch===".") newWord=true;
}
assert.deepEqual(allRunes,gp.pages.flatMap(p=>p.indices));
assert.equal(allRunes.length,13136);
assert.equal(allWords.slice(0,12956).filter(Boolean).length,2896);
const C=allRunes.slice(9640,12648);
const W=allWords.slice(9640,12648);
assert.equal(C.length,3008);
const mod = x => (x%29+29)%29;
const FULL = (1<<29)-1;

/**
 * Return the longest interval with no ciphertext Fehu.
 * @param {number[]} c
 * @returns {{start:number,end:number,length:number}}
 */
function longestNoF(c) {
  let best={start:0,end:0,length:0};
  for (let start=0;start<c.length;) {
    while(start<c.length&&c[start]===0)start++;
    let end=start;
    while(end<c.length&&c[end]!==0)end++;
    if(end-start>best.length)best={start,end,length:end-start};
    start=end;
  }
  return best;
}

/**
 * The final GP29 key is advanced on every ciphertext-non-F in this interval:
 * no literal intermediate F can generate a non-F ciphertext.
 * Fix the secret key's cyclic rotation so the interval starts at phase zero.
 *
 * For each phase, K[phase] must not equal any observed C[i], since then
 * decrypted q[i]=F would be forbidden on a non-F ciphertext. For each real
 * within-word adjacent pair, ΔK[phase] cannot equal ΔC[i], since that would
 * repeat the intermediate q rune. These conditions are necessary and exact
 * for the hypothesized reverse-order strict anti-repeat stage.
 *
 * @param {number[]} c
 * @param {boolean[]} words
 * @param {number} period
 * @param {{start:number,end:number}} span
 * @returns {{values:Uint32Array,deltas:Uint32Array}}
 */
function masks(c,words,period,span) {
  const values=new Uint32Array(period).fill(FULL);
  const deltas=new Uint32Array(period).fill(FULL);
  for(let i=span.start;i<span.end;i++) {
    const phase=(i-span.start)%period;
    values[phase] &= ~(1<<c[i]);
    if(i>span.start&&!words[i])
      deltas[phase] &= ~(1<<mod(c[i]-c[i-1]));
  }
  return {values,deltas};
}

/**
 * Exact full-chapter reverse feasibility for every possible initial key phase.
 * Word starts exempt only the preceding-rune repeat comparison. A plaintext F
 * passes through as ciphertext F without key consumption; ordinary q=F is
 * forbidden when that passthrough is enabled.
 *
 * @param {number[]} c
 * @param {boolean[]} words
 * @param {number[]} key
 * @returns {number} Number of original runes traversed, including failed rune.
 */
function fullInversePrefix(c,words,key) {
  const m=key.length;
  let states=Array.from({length:m},(_,p)=>p*30+29),next=[];
  const stamp=new Uint32Array(m*30);
  let epoch=1;
  for(let i=0;i<c.length;i++) {
    next.length=0;
    epoch++;
    const ci=c[i],wordStart=words[i];
    for(const state of states) {
      const phase=Math.floor(state/30);
      const last=wordStart?29:state%30;
      const q=mod(ci-key[phase]);
      if(q!==0&&q!==last) {
        const nextPhase=(phase+1)%m, id=nextPhase*30+q;
        if(stamp[id]!==epoch){stamp[id]=epoch;next.push(id);}
      }
      if(ci===0&&last!==0) {
        const id=phase*30;
        if(stamp[id]!==epoch){stamp[id]=epoch;next.push(id);}
      }
    }
    const old=states;states=next;next=old;
    if(!states.length)return i+1;
  }
  return c.length;
}

/** @param {number} period */
function exhaustiveSecretPeriod(period) {
  const span=longestNoF(C);
  assert.deepEqual(span,{start:45,end:163,length:118});
  const restriction=masks(C,W,period,span);
  const choices=[...restriction.values].map(mask=>
    Array.from({length:29},(_,i)=>i).filter(x=>mask&(1<<x)));
  const key=new Uint8Array(period);
  let candidates=0,fullPass=0,maxPrefix=0,bestKey=[];
  function enumerate(j) {
    if(j===period) {
      if(!(restriction.deltas[0] & (1<<mod(key[0]-key[period-1]))))return;
      candidates++;
      const prefix=fullInversePrefix(C,W,[...key]);
      if(prefix===C.length)fullPass++;
      if(prefix>maxPrefix){maxPrefix=prefix;bestKey=[...key];}
      return;
    }
    for(const v of choices[j]) {
      if(j>0 && !(restriction.deltas[j]&(1<<mod(v-key[j-1]))))continue;
      key[j]=v;
      enumerate(j+1);
    }
  }
  enumerate(0);
  return {period,allPossibleKeys:29**period,
    phaseNormalizedSpan:span,
    phaseValueChoices:choices.map(arr=>arr.length),
    necessaryMaskSurvivors:candidates,
    exactFullChapterPass:fullPass,
    maximumOriginalPrefix:maxPrefix,
    bestPrefixKeyword:bestKey};
}

/**
 * A native-GP full-length planted positive with genuine nonadvancing F.
 * @param {number[]} source
 * @param {number[]} key
 * @param {number} initialPhase
 */
function nativePlant(source,key,initialPhase) {
  let previous=29,j=0;
  const intermediate=[];
  for(const p of source) {
    let q,tries=0;
    do {
      q=mod(p+gp.prime[(j++)%29]);
      tries++;
      assert(tries<100);
    } while(q===previous);
    intermediate.push(q);
    previous=q;
  }
  const encrypted=[],phaseBefore=[];
  let phase=initialPhase;
  for(const q of intermediate) {
    phaseBefore.push(phase);
    if(q===0)encrypted.push(0);
    else {
      encrypted.push(mod(q+key[phase]));
      phase=(phase+1)%key.length;
    }
  }
  assert.equal(fullInversePrefix(encrypted,W,key),encrypted.length);
  const span=longestNoF(encrypted);
  const rotated=key.map((_,i)=>key[(phaseBefore[span.start]+i)%key.length]);
  const restriction=masks(encrypted,W,key.length,span);
  assert(rotated.every((v,j)=>(restriction.values[j]&(1<<v))!==0
    && (restriction.deltas[j]&(1<<mod(v-rotated[(j+key.length-1)%key.length])))!==0));
  return {originalLength:encrypted.length,period:key.length,accepted:true};
}

const sourceNative=Array.from({length:C.length},(_,i)=>
  gp.pages[57].indices[i%gp.pages[57].indices.length]);
const positive=[5,6].map((m,i)=>nativePlant(sourceNative,
  gp.prime.slice(0,m).map(x=>x%29),i+2));
const results=[5,6].map(exhaustiveSecretPeriod);
assert.deepEqual(results.map(r=>r.exactFullChapterPass),[0,0]);
assert.deepEqual(results.map(r=>r.necessaryMaskSurvivors),[20410,276320]);
assert.deepEqual(results.map(r=>r.maximumOriginalPrefix),[471,501]);

console.log(JSON.stringify({
  hypothesis:"strict no-repeat first, completely secret final GP29 keyword with authentic plaintext-F bypass",
  source:"original LP2 p40-p53 all 3008 runes, 669 printed-word starts",
  proof:"118-rune non-F original substring forces all key values and adjacent differences at every phase; enumerate every mask survivor after normalizing its unknown cyclic phase and validate exact full chapter with every initial phase",
  results,
  sourceNativePositive:positive,
  overallSecretKeySpace:29**5+29**6,
  secretKeysPrunedByNecessaryMask:(29**5+29**6)-results.reduce((a,b)=>a+b.necessaryMaskSurvivors,0),
  note:"No authentic plaintext recovered; periodic final stage, strict intermediate no-doublets and chapter-continuous key clock are premises, not first-party established clues."
},null,2));
