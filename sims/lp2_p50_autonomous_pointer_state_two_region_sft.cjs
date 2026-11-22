"use strict";
/**
 * Source-frozen autonomous GP29 byte-pointer cipher gate (Director #2184).
 * Exhaust every 8-bit initial state under both source-contested p50 radices.
 * Two independent 200+ original regions, solved native LP1/p57 plant controls.
 * Node22: node sims/lp2_p50_autonomous_pointer_state_two_region_sft.cjs
 *
 * The original 32x8 numeric table supplies 256 printed pointers; reading
 * pointers as the next keystream state is a hypothesis, not author instruction.
 * Autonomous model only: no plaintext/ciphertext feedback, no nonce, no
 * fitted key, no word resets or claimed cryptanalysis of arbitrary cipher.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {buildSourceNativeTrigramModel}=require("./lp1_source_native_trigram_model.cjs");
const root=path.resolve(__dirname,"..");
/** @param {string} p */
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const corpus=load("resources/liber-primus/lp2-corpus.json");
const grid=load("resources/liber-primus/lp2-grid-256.json");
const reference=fs.readFileSync(path.join(root,"resources/liber-primus/lp1-plaintext-reference.txt"),"utf8");
const lm=buildSourceNativeTrigramModel({corpus,referenceText:reference});
const tokens=grid.pages.flatMap(p=>p.tokens);
const original=(lo,hi)=>corpus.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices);
const first=original(16,21),second=original(40,53),solved=corpus.pages[57].indices;
assert(first.length>=200 && second.length>=200);
assert.equal(tokens.length,256);
assert.equal(solved.length,95);
const radians=[60,59];
/** @param {number} x */
const mod29=x=>((x%29)+29)%29;
/** @param {number[]} a */
function repeats(a){let n=0;for(let i=1;i<a.length;i++)if(a[i]===a[i-1])n++;return n;}
/** @param {number[]} a */
function ioc(a){const f=Array(29).fill(0);for(const v of a)f[v]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
/** @param {number[]} T @param {number} seed @param {number[]} cipher @param {number} sign */
function decrypt(T,seed,cipher,sign){
  let state=seed;
  const plain=new Array(cipher.length);
  for(let i=0;i<cipher.length;i++){
    const next=T[state];
    plain[i]=mod29(cipher[i]+sign*(next%29));
    state=next;
  }
  return plain;
}
/** @param {number[]} T @param {number} seed @param {number[]} plain @param {number} sign */
function encrypt(T,seed,plain,sign){
  let state=seed;
  const cipher=new Array(plain.length);
  for(let i=0;i<plain.length;i++){
    const next=T[state];
    cipher[i]=mod29(plain[i]-sign*(next%29));
    state=next;
  }
  return cipher;
}
/** @param {number[]} T @param {number} start */
function orbit(T,start){
  const seen=new Map();
  let i=start;
  const sequence=[];
  while(!seen.has(i)){
    seen.set(i,sequence.length);
    sequence.push(i);
    i=T[i];
  }
  return {transient:seen.get(i),period:sequence.length-seen.get(i),cycle:sequence.slice(seen.get(i))};
}
const all=[],paths=[];
for(const radix of radians){
  const alphabet=radix===59?grid.alphabet.replace("f",""):grid.alphabet;
  assert.equal(alphabet.length,radix);
  const T=tokens.map(pair=>{
    const a=alphabet.indexOf(pair[0]),b=alphabet.indexOf(pair[1]);
    assert(a>=0 && b>=0);
    return radix*a+b;
  });
  assert(T.every(x=>x>=0&&x<256));
  const cycles=new Map();
  let maxTransient=0;
  for(let start=0;start<256;start++){
    const o=orbit(T,start),key=o.cycle.slice().sort((a,b)=>a-b).join(",");
    const p=cycles.get(key)||{cycle:o.cycle,basin:0};
    p.basin++;
    cycles.set(key,p);
    maxTransient=Math.max(maxTransient,o.transient);
  }
  const graph={radix,maxTransient,components:[...cycles.values()].sort((a,b)=>b.basin-a.basin)};
  paths.push(graph);
  if(radix===59){
    assert.equal(graph.components.length,1);
    assert.deepEqual(graph.components[0].cycle,[189]);
    // For any autonomous output f(state), the suffix after this bound
    // is CONSTANT. This result does not depend on the GP29 projection.
    const sourceFirst=first.slice(maxTransient);
    const allEqual=Array.from({length:256},(_,seed)=>{
      const result=decrypt(T,seed,first,-1).slice(maxTransient);
      return repeats(result)===repeats(sourceFirst);
    });
    assert(allEqual.every(Boolean));
  } else{
    assert.deepEqual(graph.components.map(g=>g.cycle.length),[11,2]);
    assert.deepEqual(graph.components.map(g=>g.basin),[252,4]);
  }
  for(const sign of [-1,1]){
    const known=lm.training.slice(0,512);
    for(const seed of [0,189,205,229]){
      const plant=encrypt(T,seed,known,sign);
      assert.deepEqual(decrypt(T,seed,plant,sign),known);
      const roundtrip=decrypt(T,seed,first,sign);
      assert.deepEqual(encrypt(T,seed,roundtrip,sign),first);
    }
    for(let seed=0;seed<256;seed++){
      const candidate=decrypt(T,seed,first,sign);
      const holdout=decrypt(T,seed,second,sign);
      all.push({radix,sign,seed,firstScore:lm.scoreStream(candidate).mean,
        holdoutScore:lm.scoreStream(holdout).mean,firstIoC:ioc(candidate),
        secondIoC:ioc(holdout),firstPreview:lm.spell(candidate.slice(0,75)),
        holdoutPreview:lm.spell(holdout.slice(0,75))});
    }
  }
}
assert.equal(all.length,1024);
const byTrain=all.slice().sort((a,b)=>b.firstScore-a.firstScore);
const best=byTrain[0],bestHoldout=all.slice().sort((a,b)=>b.holdoutScore-a.holdoutScore)[0];
const both=all.slice().sort((a,b)=>(b.firstScore+b.holdoutScore)-(a.firstScore+a.holdoutScore));
const raw={firstScore:lm.scoreStream(first).mean,secondScore:lm.scoreStream(second).mean,
  firstIoC:ioc(first),secondIoC:ioc(second),firstDoublets:repeats(first),
  secondDoublets:repeats(second)};
console.log("ORIGINAL_TWO_REGIONS",JSON.stringify({
  pages16to21:first.length,pages40to53:second.length,
  sourceNativeP57Score:lm.p57Score,sourceNativeLP1Score:lm.trainingScore,
  sourceCiphertext:raw,graph:paths,
}));
console.log("BEST_DISCOVERY_FIRST",JSON.stringify(best));
console.log("TRAIN_SELECTED_HELDOUT",JSON.stringify({seed:best.seed,radix:best.radix,
  sign:best.sign,firstScore:best.firstScore,heldoutSecond:best.holdoutScore}));
console.log("BEST_POSTHOC_SECOND",JSON.stringify(bestHoldout));
console.log("BEST_JOINT_POSTHOC",JSON.stringify(both[0]));
console.log("TOP5",JSON.stringify(byTrain.slice(0,5)));
assert(best.firstScore < -3.8);
assert(bestHoldout.holdoutScore < -3.8);
console.log("PASS: 1024 reversible source-pointer attempts, 16 native LP1 full512 plants, two original heldout long regions; no plaintext.");
