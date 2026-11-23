"use strict";
/**
 * Original-source key-independent four-rune affine-block geometry screen.
 * A page-private invertible affine GF(29)^4 block cipher preserves the
 * equality of sums of two disjoint packet pairs under every possible key.
 * Test a frozen count of those parallelogram relations across all 55 pages,
 * every page alignment, and matched original-word-slot native-GP controls.
 *
 * SFT: node sims/lp2_p15_fourblock_allaffine_parallelogram_original_sft.cjs
 * Node.js 22 CommonJS, read-only, no external packages.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ps=gp.pages.filter(p=>p.page<=55&&p.indices.length);
const sizes=ps.map(p=>p.indices.length);
const cipher=ps.flatMap(p=>p.indices);
const {parseLP2Words}=require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const words=parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
const lens=words.words.map(w=>w.length);
assert.equal(ps.length,55);
assert.equal(cipher.length,12956);
assert.equal(lens.length,2896);
assert.equal(lens.reduce((a,b)=>a+b,0),cipher.length);
assert.equal(words.crossPageWords,32);
const K=4,M=29;
const mod=x=>(x%M+M)%M;
/** @param {number[]} page @param {number} phase */
function geometry(page,phase){
  const sites=[];
  for(let i=phase;i+K<=page.length;i+=K)sites.push(i);
  const packets=sites.length,pairs=new Map();
  let parallelograms=0,rawBucketCollisions=0,repeatedPackets=0;
  const seen=new Set();
  for(const at of sites){
    const x=page[at]*M**3+page[at+1]*M**2+page[at+2]*M+page[at+3];
    if(seen.has(x))repeatedPackets++;
    seen.add(x);
  }
  for(let i=0;i<packets;i++){
    const a=sites[i];
    for(let j=i+1;j<packets;j++){
      const b=sites[j];
      let key=0;
      for(let k=0;k<K;k++)key=M*key+((page[a+k]+page[b+k])%M);
      const previous=pairs.get(key);
      if(previous){
        for(let t=0;t<previous.length;t+=2){
          const u=previous[t],v=previous[t+1];
          rawBucketCollisions++;
          if(i!==u&&i!==v&&j!==u&&j!==v)parallelograms++;
        }
        previous.push(i,j);
      }else pairs.set(key,[i,j]);
    }
  }
  return {packets,repeatedPackets,parallelograms,rawBucketCollisions};
}
/** @param {number[]} tape */
function book(tape){
  assert.equal(tape.length,cipher.length);
  let offset=0,totals=[0,0,0,0],totalMin=0,totalMax=0;
  let pagesAnyZeroRepeated=0;
  const detail=[];
  for(const n of sizes){
    const page=tape.slice(offset,offset+n);
    const phases=Array.from({length:4},(_,ph)=>geometry(page,ph));
    const g=phases.map(x=>x.parallelograms);
    const r=phases.map(x=>x.repeatedPackets);
    for(let ph=0;ph<4;ph++)totals[ph]+=g[ph];
    totalMin+=Math.min(...g);totalMax+=Math.max(...g);
    pagesAnyZeroRepeated+=Number(r.some(x=>x===0));
    detail.push({g,r,packets:phases.map(x=>x.packets)});
    offset+=n;
  }
  assert.equal(offset,cipher.length);
  return {totals,totalMin,totalMax,pagesAnyZeroRepeated,detail};
}
const original=book(cipher);
assert.equal(original.pagesAnyZeroRepeated,55);
assert(original.detail.every(x=>x.r.every(y=>y===0)));
/**
 * Source-locked invertible arbitrary lower-triangular 4x4 GF29 linear
 * substitution plus affine translation, with a different key on each page.
 * Tests exact recovery as well as affine parallelogram invariance.
 */
function plant(source){
  let offset=0;const out=source.slice(),back=source.slice();
  for(let page=0;page<sizes.length;page++){
    const n=sizes[page],phase=page%4;
    const diag=[3,7,11,17].map((v,i)=>mod(v+page*3+i*2)||1);
    const inv=diag.map(a=>{for(let t=1;t<M;t++)if(a*t%M===1)return t;throw Error("singular");});
    const low=[[0,0,0,0],[13,0,0,0],[5,8,0,0],[19,2,7,0]];
    const shift=[5,11,17,23].map(x=>mod(x+page));
    for(let at=offset+phase;at+4<=offset+n;at+=4){
      for(let i=0;i<4;i++){
        let y=diag[i]*source[at+i]+shift[i];
        for(let j=0;j<i;j++)y+=low[i][j]*source[at+j];
        out[at+i]=mod(y);
      }
      for(let i=0;i<4;i++){
        let x=out[at+i]-shift[i];
        for(let j=0;j<i;j++)x-=low[i][j]*back[at+j];
        back[at+i]=mod(x*inv[i]);
      }
    }
    const before=geometry(source.slice(offset,offset+n),phase);
    const after=geometry(out.slice(offset,offset+n),phase);
    assert.deepEqual(after,before);
    offset+=n;
  }
  assert.deepEqual(back,source);
  return out;
}
let seed=0x33012026;
function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
const samplesPerSource=96;
const controls=[
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
];
const results=[],survivorDetails=[];
for(const [name,file] of controls){
  const pool=Array.from({length:30},()=>[]);
  for(const word of read(file).match(/[A-Za-z]+/g)||[]){
    const enc=encodeSourceNativeGP(word);
    pool[enc.length].push(enc);
  }
  assert(lens.every(n=>pool[n].length));
  const scores=[],common=[[],[],[],[]],minPhase=[], maxPhase=[];
  let priorEqualitySurvivors=0;
  for(let trial=0;trial<samplesPerSource;trial++){
    const data=[];
    for(const n of lens)data.push(...pool[n][rand()%pool[n].length]);
    assert.equal(data.length,cipher.length);
    const scored=book(data);
    for(let ph=0;ph<4;ph++)common[ph].push(scored.totals[ph]);
    minPhase.push(scored.totalMin);maxPhase.push(scored.totalMax);
    if(scored.pagesAnyZeroRepeated===55){
      priorEqualitySurvivors++;
      survivorDetails.push({name,trial,parallelogramsMin:scored.totalMin,
        parallelogramsCommon:scored.totals,perPage:scored.detail.map(x=>x.g)});
    }
    if(trial===0)plant(data);
  }
  results.push({name,samples:samplesPerSource,equalitySurvivors:priorEqualitySurvivors,
    independentPagePhaseMin:{min:Math.min(...minPhase),max:Math.max(...minPhase),
      mean:minPhase.reduce((a,b)=>a+b,0)/minPhase.length,
      atMostSourceMax:minPhase.filter(x=>x<=original.totalMax).length},
    commonPhase:common.map(v=>({min:Math.min(...v),max:Math.max(...v),
      atMostSourceAtSamePhase:v.filter((x,i)=>x<=original.totals[common.indexOf(v)]).length}))});
}
assert.equal(survivorDetails.length,13);
const result={scope:"source original page-private affine four-rune GF29^4 block substitution",
  sourceRunes:cipher.length,pages:ps.length,wordSlots:lens.length,
  seed:"0x33012026",samplesPerSource,original:{
    commonPhase:original.totals,independentPagePhaseMin:original.totalMin,
    independentPagePhaseMax:original.totalMax,
    firstTenPagePhaseCounts:original.detail.slice(0,10).map(x=>x.g)},
  controls:results,equalitySurvivors:survivorDetails.map(x=>({
    source:x.name,trial:x.trial,independentPhaseParallelogramMin:x.parallelogramsMin,
    commonPhase:x.parallelogramsCommon})),
  positivePlants:"One source-native independently invertible 4x4 affine pagewise plant per donor, with different page keys and phases, exactly reencrypted and proved invariance."};
process.stdout.write(JSON.stringify(result,null,2)+"\n");
