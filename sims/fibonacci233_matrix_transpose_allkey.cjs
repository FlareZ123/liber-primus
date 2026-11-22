"use strict";
/**
 * Exact source-geometry GP28 periodic permutation all-key capacity theorem.
 * Source: 55 unsolved rune pages, 86 within-page repeats, 55 free page IVs.
 * 12956 - 86 - 55 = 12815 = 55 * 233 rank symbols.
 * SFT: node sims/fibonacci233_matrix_transpose_allkey.cjs (Node.js 22).
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {nativeGP} = require("./thirteen_dot_grid_8phase_allkey_capacity.cjs");
const {scanNativeWindows} = require("./thirteen_dot_grid_feedback_topk_gate.cjs");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const pages=JSON.parse(read("resources/liber-primus/lp2-corpus.json"))
  .pages.filter(p=>p.page<=55&&p.indices.length);
const FULL=pages.flatMap(p=>p.indices),R=55,C=233,FREE=141;
assert.equal(pages.length,R);assert.equal(FULL.length,12956);
const layoutKeys=[];
for(const conv of ["cyclic","sorted"])for(const tr of [0,1])
  for(const fr of [0,1])for(const fc of [0,1])for(const snake of [0,1])
    layoutKeys.push({conv,tr,fr,fc,snake});
assert.equal(layoutKeys.length,32);

/** @param {number[]} cipher */
function rankStreams(cipher) {
  const cyclic=[],sorted=[];
  let at=0, free=0, zeros=0;
  for(const p of pages)for(let i=0;i<p.indices.length;i++,at++){
    if(i===0){free++;continue;}
    const a=cipher[at-1],b=cipher[at];
    if(a===b){free++;zeros++;continue;}
    cyclic.push((b-a+28)%29);
    sorted.push(b-(b>a?1:0));
  }
  assert.equal(free,FREE);assert.equal(zeros,86);
  assert.equal(cyclic.length,R*C);
  return {cyclic,sorted};
}
/** @param {{tr:number,fr:number,fc:number,snake:number}} o */
function order(o){
  const ids=[];
  for(let i=0;i<(o.tr?C:R);i++)for(let j=0;j<(o.tr?R:C);j++){
    let r,c;
    if(o.tr){r=o.fr?R-1-j:j;c=o.fc?C-1-i:i;
      if(o.snake&&(i&1))r=R-1-r;
    }else{r=o.fr?R-1-i:i;c=o.fc?C-1-j:j;
      if(o.snake&&(i&1))c=C-1-c;}
    ids.push(r*C+c);
  }
  assert.equal(ids.length,R*C);
  assert.equal(new Set(ids).size,R*C);
  return ids;
}
/** @param {number[]} values @param {number[]} ids */
function permutation(values,ids){return ids.map(i=>values[i]);}
/** @param {number[]} values @param {number[]} ids */
function unpermutation(values,ids){
  const out=new Array(ids.length);
  for(let i=0;i<ids.length;i++)out[ids[i]]=values[i];
  return out;
}
/**
 * Exact top-k all-hidden-key bound for any k selected plain GP symbols.
 * @param {number[]} stream original 28-rank ordered symbols
 * @param {number} p substitution phase period
 * @param {number} k chosen plaintext symbol set size
 */
function capacity(stream,p,k=12){
  const hist=Array.from({length:p},()=>new Uint16Array(28));
  for(let i=0;i<stream.length;i++)hist[i%p][stream[i]]++;
  let result=0;
  for(const h of hist){
    const sorted=Array.from(h).sort((a,b)=>b-a);
    for(let j=0;j<k;j++)result+=sorted[j];
  }
  return result;
}
function originalScan(maxPeriod=350){
  const source=rankStreams(FULL);
  const orders=layoutKeys.map(o=>({o,seq:permutation(source[o.conv],order(o))}));
  const rows=[];
  for(let p=1;p<=maxPeriod;p++){
    let upper=-1,layout=null;
    for(const obj of orders){const score=capacity(obj.seq,p);
      if(score>upper){upper=score;layout=obj.o;}}
    rows.push({period:p,upper,layout});
  }
  return rows;
}
/** Seeded random secret 28-bijections for hidden-key positive. */
function permutations(period){
  let seed=0x55332331;
  const random=()=>{seed^=seed<<13;seed^=seed>>>17;
    seed^=seed<<5;return seed>>>0;};
  return Array.from({length:period},()=>{
    const enc=Array.from({length:28},(_,i)=>i);
    for(let i=27;i>0;i--){const j=random()%(i+1);
      [enc[i],enc[j]]=[enc[j],enc[i]];}
    const dec=new Array(28);
    enc.forEach((v,i)=>{dec[v]=i;});
    return {enc,dec};
  });
}
/** Reassemble true nonzero field ranks into source-pattern ciphertext. */
function assemble(ranks){
  let n=0,cipher=[],at=0;
  for(const p of pages){
    let prev=0;
    for(let i=0;i<p.indices.length;i++,at++){
      if(i===0){prev=(p.page*7+11)%29;}
      else if(p.indices[i]!==p.indices[i-1]){
        prev=(prev+1+ranks[n++])%29;
      }
      cipher.push(prev);
    }
  }
  assert.equal(n,R*C);
  return cipher;
}
/** Original-length reversible known native-GP source positive control. */
function plant(sourceGP){
  const text=sourceGP.slice(25000,25000+FULL.length);
  assert.equal(text.length,FULL.length);
  const free=new Set();
  text.forEach((x,i)=>{if(x===28)free.add(i);});
  assert.ok(free.size<=FREE);
  for(let i=0;free.size<FREE;i++)free.add(i);
  const plain=text.filter((_,i)=>!free.has(i));
  assert.equal(plain.length,R*C);
  const chosen={conv:"cyclic",tr:1,fr:1,fc:0,snake:1},
    ids=order(chosen), keys=permutations(256);
  const crypted=plain.map((v,i)=>keys[i%256].enc[v]);
  const originalOrder=unpermutation(crypted,ids);
  const planted=assemble(originalOrder);
  const decoded=permutation(rankStreams(planted).cyclic,ids)
    .map((v,i)=>keys[i%256].dec[v]);
  assert.deepEqual(decoded,plain);
  assert.deepEqual(assemble(unpermutation(decoded.map((v,i)=>
    keys[i%256].enc[v]),ids)),planted);
  let ix=0;
  const complete=text.map((v,i)=>free.has(i)?v:decoded[ix++]);
  assert.equal(ix,R*C);
  assert.deepEqual(complete,text);
  const f=new Uint32Array(29);text.forEach(x=>f[x]++);
  const ranked=Array.from(f).sort((a,b)=>b-a);
  const actualTop12=ranked.slice(0,12).reduce((a,b)=>a+b,0),
    upper=capacity(crypted,256)+FREE;
  assert.ok(upper>=actualTop12);
  return {sourceRunes:complete.length,payloadDecoded:ix,
    freeMarkerSlots:free.size,sourceEA:text.filter(v=>v===28).length,
    exactReencryption:planted.length,top12PlantUpper:upper,
    actualSourceTop12:actualTop12};
}
function main(){
  const records=originalScan();
  assert.equal(records.length,350);
  const survivor=records.find(r=>r.upper+FREE>=9651);
  assert.equal(survivor.period,296);
  assert.equal(survivor.upper,9511);
  const maximum256=Math.max(...records.slice(0,256).map(r=>r.upper));
  assert.equal(maximum256,9187);
  const refs={};
  for(const [name,file] of Object.entries({
    Shakespeare:"resources/control/shakespeare_first300k.txt",
    Gibran:"resources/control/gibran_prophet_58585.txt",
    Emerson:"resources/control/emerson_essays_2944.txt"})){
    const stats=scanNativeWindows(nativeGP(read(file)),
      FULL.length,new Array(30).fill(0));
    refs[name]={length:stats.gpRunes,windows:stats.windows,
      minimumTop12:stats.minimumTop12};
  }
  assert.deepEqual(Object.values(refs).map(x=>x.minimumTop12),
    [9651,9897,9986]);
  for(const row of records.slice(0,295))
    assert.ok(row.upper+FREE<refs.Shakespeare.minimumTop12);
  return {
    class:"Conditional, key-independent original-cipher GP-English exclusion",
    original:{runes:FULL.length,pages:R,doublets:86,freeIVs:55,
      freeAnyOutput:FREE,nonzeroPayload:R*C,matrix:[R,C]},
    search:{rankConventions:2,matrixTraversals:16,
      allPeriods:[1,350],allModels:350*32,
      arbitraryUnknownGP28PermutationPerPhase:true},
    result:{everyPeriodUpTo295Excluded:true,
      configurationsExcluded:295*32,
      largestTop12CapacityAtMost256:maximum256,
      largestTotalTop12AtMost256:maximum256+FREE,
      minimumForcedChangesForShakespeare:refs.Shakespeare.minimumTop12-
        (maximum256+FREE),
      firstPeriodNotExcludedByThisOneStatistic:survivor,
      samples:[55,79,128,233,255,256,295,296,350].map(p=>records[p-1])},
    sourceReferences:refs,
    planted:plant(nativeGP(read("resources/control/shakespeare_first300k.txt"))),
    limitation:"Unrestricted markers and arbitrary secret alphabets; source 55x233 geometry and stationary key phases are hypotheses. No original plaintext or historical key recovered."
  };
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={main,rankStreams,order,capacity,originalScan,plant};
