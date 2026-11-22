"use strict";
/**
 * Constructive blind test for a single 256-symbol periodical pad consumed
 * continuously across all unsolved LP2 rune pages, but represented by an
 * independent unknown affine rune alphabet on each physical page:
 *
 * C[j,t] = a[j]*(P[j,t] + K[(G[j]+t)%256]) + b[j] (mod29),
 * where G[j] is the exact global rune offset of page j.
 *
 * The manuscript's actual 256-byte number grid supplies the period length,
 * not key bytes or fitted cipher material. Reorder source runes by their
 * global modulo-256 pad phase, retaining distinct image runes and only
 * pages of length at least 256, then invoke the independently implemented
 * blind affine-harmonic recovery with even/odd heldout phases.
 *
 * All random baselines and independent original-length positive controls
 * undergo the identical global-offset re-indexing and frequency search.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {makePrior}=require("./caesar_pad_spectral.cjs");
const {fit}=require("./affine_page_spectral_sync.cjs");
const ROOT=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(
  path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const english=fs.readFileSync(
  path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const MOD=29,PERIOD=256,PREFIX=150;
const mod=x=>(x%MOD+MOD)%MOD;
/** @param {number} seed */
function rng32(seed){let x=seed|0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;
  return (x>>>0)/4294967296;};}
/** @param {number[][]} pages */
function withOffsets(pages) {
  let at=0;
  return pages.map(indices=>{const o={indices,start:at};at+=indices.length;return o;});
}
/**
 * Re-index each page's physically distinct glyphs by global key phase.
 * A page of at least PERIOD runes has one source rune at each 256 phase.
 * @param {{indices:number[],start:number}[]} original
 */
function phaseRows(original) {
  const selected=original.filter(p=>p.indices.length>=PERIOD);
  return {pages:selected.map(p=>Array.from({length:PREFIX},(_,t)=>
    p.indices[(t-(p.start%PERIOD)+PERIOD)%PERIOD])),
    pageStarts:selected.map(x=>x.start)};
}
/**
 * @param {{indices:number[],start:number}[]} original
 * @param {number[]} q
 * @param {number} overwrite
 * @param {number} seed
 */
function plant(original,q,overwrite,seed){
  const rng=rng32(seed),pad=Array.from({length:PERIOD},()=>
    Math.floor(rng()*MOD));
  const acc=[];let s=0;
  for(const n of q){s+=n;acc.push(s);}
  const draw=()=>{const v=rng();const k=acc.findIndex(x=>x>v);
    return k>=0?k:MOD-1;};
  let repairs=0;
  const pages=original.map(pg=>{
    const a=1+Math.floor(rng()*28),b=Math.floor(rng()*MOD),out=[];
    for(let t=0;t<pg.indices.length;t++){
      let c=(a*(draw()+pad[(pg.start+t)%PERIOD])+b)%MOD;
      if(t>0&&c===out[t-1]&&rng()<overwrite){
        c=(c+1+Math.floor(rng()*28))%MOD;repairs++;
      }
      out.push(c);
    }
    return {indices:out,start:pg.start};
  });
  return {pages,repairs};
}
/** @param {{indices:number[],start:number}[]} pages @param {()=>number} rng */
function rotations(pages,rng){
  return pages.map(p=>{const k=Math.floor(rng()*p.indices.length);
    return {start:p.start,indices:p.indices.slice(k).concat(p.indices.slice(0,k))};});
}
/** @param {number} nullCount */
function run(nullCount=160){
  const raw=corpus.pages.filter(p=>p.page<56).map(p=>p.indices);
  const at=withOffsets(raw);
  assert.equal(raw.length,56);
  assert.equal(raw.reduce((s,p)=>s+p.length,0),12956);
  const aligned=phaseRows(at);
  assert(aligned.pages.length>=25);
  const real=fit(aligned.pages);
  const rng=rng32(0xa15f0256),nullScores=[];
  for(let i=0;i<nullCount;i++)
    nullScores.push(fit(phaseRows(rotations(at,rng)).pages).heldout);
  const sorted=nullScores.slice().sort((a,b)=>a-b);
  const source=makePrior(english),planted=[];
  for(const overwrite of [0,0.81])for(let i=0;i<12;i++){
    const generated=plant(at,source,overwrite,
      (0xa15f3256+i*3907+Math.round(overwrite*1000))>>>0);
    const candidate=fit(phaseRows(generated.pages).pages);
    planted.push({overwrite,seed:i,repairs:generated.repairs,
      training:candidate.training,heldout:candidate.heldout,
      aboveNull95:candidate.heldout>sorted[Math.floor(.95*nullCount)]});
  }
  return {
    model:"Full 12,956-symbol global-position keystream, period 256; one independent affine 29-rune alphabet per page",
    source:"LP2 physical pages 0..55, page50 empty, 256-byte original base60 grid motivates period only",
    pageCount:aligned.pages.length,alignedStarts:aligned.pageStarts,
    testedKeyPhases:"0..149",training:"even 0..148",heldout:"odd 1..149",
    real:{training:real.training,heldout:real.heldout,
      referencePageInCohort:real.reference,referenceHarmonic:real.anchor},
    null:{repetitions:nullCount,seed:"0xa15f0256",mean:
      nullScores.reduce((s,v)=>s+v,0)/nullScores.length,
      q95:sorted[Math.floor(.95*nullCount)],max:sorted.at(-1),
      upperTail:(1+nullScores.filter(x=>x>=real.heldout).length)/(nullCount+1)},
    positive:{trials:planted,
      noRewriteDetected:planted.filter(x=>x.overwrite===0&&x.aboveNull95).length,
      rewriteDetected:planted.filter(x=>x.overwrite>0&&x.aboveNull95).length},
    limitation:"Tests the source-motivated period-256, no-key-skip full-corpus schedule. No plaintext inferred from training or heldout phases."
  };
}
if(require.main===module)console.log(JSON.stringify(run(Number(process.argv[2]||160)),null,2));
module.exports={withOffsets,phaseRows,plant,run};
