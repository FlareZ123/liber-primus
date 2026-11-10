"use strict";
/**
 * Key-free GP28 55x233 periodic permutation substitution test.
 *
 * Original source's nonzero GP29 step channel contains exactly 12815 values
 * after 55 physical page IVs and 86 literal equality markers are removed.
 * 12815=55*233. Both dimensions are Fibonacci numbers.
 *
 * For any hidden bijections S_j: F28 -> F28 with j=i mod period,
 * Y_i=S_j(P_i), exact equivalence Y_i==Y_(i+period) iff
 * P_i==P_(i+period). Therefore each observed collision rate is invariant
 * to every possible secret 28-way permutation in every column.
 *
 * Tests both source-derived periods 55 and 233 with native GP28 prose and
 * full-original-shaped hidden-key positive plants. No authentic plaintext,
 * historical key, or cipher is presumed.
 *
 * Node 18+, CommonJS, repository control texts + canonical source.
 * Run: node sims/gp28_fibonacci_55x233_collision_gate.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {toGematria}=require("./previous_cipher_sbox_invariant.cjs");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(pages.length,55);
const original=pages.flatMap(p=>p.indices);
assert.equal(original.length,12956);
const channel=[];
let markers=0;
for(const page of pages)for(let j=1;j<page.indices.length;j++){
 const delta=(page.indices[j]-page.indices[j-1]+29)%29;
 if(delta===0)markers++;
 else channel.push(delta-1);
}
assert.equal(markers,86);
assert.equal(channel.length,12815);
assert.equal(channel.length,55*233);

/**
 * @param {number[]} data
 * @param {number} period
 * @returns {{same:number,pairs:number,rate:number}}
 */
function collision(data,period) {
  let same=0;
  for(let i=period;i<data.length;i++)
    if(data[i]===data[i-period]) same++;
  return {same,pairs:data.length-period,rate:same/(data.length-period)};
}

/** @param {string} source @returns {number[]} */
function nativeGP28(source) {
  return toGematria(source).filter(x=>x!==28);
}
const referenceSources={
  Shakespeare:nativeGP28(read("resources/control/shakespeare_first300k.txt")),
  Gibran:nativeGP28(read("resources/control/gibran_prophet_58585.txt")),
};
assert.equal(referenceSources.Shakespeare.length,217167);
assert.equal(referenceSources.Gibran.length,62508);
const nativeCicada=nativeGP28(read("resources/liber-primus/lp1-plaintext-reference.txt"));
assert.equal(nativeCicada.length,3706);

/**
 * Exhaustive O(source length) scan of EVERY 12,815-GP28-rune candidate source
 * window. An arbitrary period-indexed secret alphabet preserves the number
 * of same-rune pairs separated by exactly 'period'. No key can change that.
 * @param {number[]} source
 * @param {number} period
 * @returns {{windows:number,min:number,minSourceOffset:number,minTies:number,median:number,max:number,wholeSource:number,controlsAtOrBelowOriginal:number}}
 */
function windowStats(source,period) {
  const len=channel.length,n=len-period;
  const match=new Uint8Array(source.length-period);
  for(let i=0;i<match.length;i++)
    if(source[i]===source[i+period]) match[i]=1;
  let count=0;
  for(let i=0;i<n;i++)count+=match[i];
  const originalCount=collision(channel,period).same;
  const windows=source.length-len+1;
  let min=count,minSourceOffset=0,minTies=1,max=count;
  let controlsAtOrBelowOriginal=count<=originalCount?1:0;
  const hist=new Uint32Array(n+1);
  hist[count]++;
  for(let start=1;start<windows;start++){
    count+=match[start+n-1]-match[start-1];
    hist[count]++;
    if(count<min){min=count;minSourceOffset=start;minTies=1;}
    else if(count===min)minTies++;
    if(count>max)max=count;
    if(count<=originalCount)controlsAtOrBelowOriginal++;
  }
  let cum=0,median=min;
  for(let k=min;k<=max;k++){
    cum+=hist[k];
    if(cum>windows/2){median=k;break}
  }
  return {windows,min,minRate:min/n,minSourceOffset,minTies,
    median,medianRate:median/n,max,maxRate:max/n,
    wholeSource:collision(source,period).rate,
    controlsAtOrBelowOriginal};
}

/** @param {number} seed @returns {()=>number} */
function random(seed) {
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0};
}

/**
 * Given source-native GP28 and arbitrary 28-way secret substitution per
 * period state, build the original page-shaped GP29 predecessor walk with
 * literal marker positions and page IVs. Fully decode and recipher every rune.
 * @param {number[]} source
 * @param {55|233} period
 * @returns {{period:number,hiddenIndependentTables:number,GP28Rerecovered:number,reEncypheredRuneCount:number,originalMarkerSites:number,collisionInvariant:true}}
 */
function plant(source,period) {
  const r=random((0x5515f233+period)>>>0);
  const plain=source.slice(1000,1000+channel.length);
  assert.equal(plain.length,12815);
  const permutations=[],inverses=[];
  for(let k=0;k<period;k++){
    const p=Array.from({length:28},(_,i)=>i);
    for(let i=27;i>0;i--){const j=r()%(i+1);[p[i],p[j]]=[p[j],p[i]]}
    const inv=Array(28);for(let i=0;i<28;i++)inv[p[i]]=i;
    permutations.push(p);inverses.push(inv);
  }
  const masked=plain.map((x,i)=>permutations[i%period][x]);
  const encodedPages=[],markerPositions=[];
  let pos=0;
  for(const page of pages){
    let previous=(7*page.page+11)%29;
    const out=[previous];
    for(let j=1;j<page.indices.length;j++){
      if(page.indices[j]===page.indices[j-1]) {
        markerPositions.push([page.page,j]);
      }else{
        previous=(previous+1+masked[pos++])%29;
      }
      out.push(previous);
    }
    encodedPages.push(out);
  }
  assert.equal(pos,12815);
  const decodedSteps=[];
  let match=0;
  for(let i=0;i<pages.length;i++){
    const x=encodedPages[i],ori=pages[i].indices;
    assert.equal(x.length,ori.length);
    for(let j=1;j<x.length;j++){
      const d=(x[j]-x[j-1]+29)%29;
      if(ori[j]===ori[j-1]){assert.equal(d,0);match++;}
      else{assert(d>0);decodedSteps.push(d-1);}
    }
  }
  assert.equal(match,86);
  assert.deepEqual(decodedSteps,masked);
  const decoded=decodedSteps.map((x,i)=>inverses[i%period][x]);
  assert.deepEqual(decoded,plain);
  assert.equal(collision(decodedSteps,period).same,collision(plain,period).same);
  return {period,hiddenIndependentTables:period,
    GP28Rerecovered:decoded.length,reEncypheredRuneCount:original.length,
    originalMarkerSites:match,collisionInvariant:true};
}
function main() {
  const results=[];
  for(const period of [55,233]) {
    const originalRate=collision(channel,period);
    const sources={};
    const plants={};
    for(const [name,source] of Object.entries(referenceSources)) {
      sources[name]=windowStats(source,period);
      plants[name]=plant(source,period);
    }
    const halfway=(channel.length-period)/2;
    const early=channel.slice(0,Math.ceil(halfway)+period);
    const late=channel.slice(Math.floor(halfway));
    results.push({period,original:originalRate,
      editorNormalizedSolvedCicadaRegister:collision(nativeCicada,period),
      independentSourceControls:sources,sourceNativeFullInversePlants:plants,
      earlyHalf:collision(early,period),
      lateHalf:collision(late,period)});
  }
  return {status:"Scoped original-negative for fixed secret F28 permutation by 55- or 233-column state",
    data:{physicalRunePages:55,sourceRunes:original.length,equalStepMarkers:86,
      nonzeroSteps:channel.length,sourceGeometry:"55*233=12815"},
    universalKeyIndependentProof:
      "At period L, any bijections S_0..S_(L-1) preserve the equality event between plaintext symbols at positions i and i+L, for all (28!)^L secret table settings.",
    results,
    limitation:"English GP28 plaintext means direct native GP spelling with EA stripped; source controls are Shakespeare and Gibran. Alternative language, binary intermediates, secret evolving tables, key-dependent transpositions, or differently placed marker/IV sites are outside the exclusion. Divisibility alone is not proof of authorial 55x233 framing."};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+"\n");
module.exports={collision,windowStats,plant,main};
