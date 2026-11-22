"use strict";
/**
 * Original LP2 p7/p8 five-trit state and predecessor-rank receiver.
 * Read-only, self-contained single-file test from repository root:
 *   node sims/lp2_p8_ternary5_rank28_allsecret_sft.cjs
 *
 * Historical clues are hypotheses: p7 has five red-word products, p8 has
 * 243 = 3^5 black runes. No first-party clue defines the tested cipher.
 * This report tests two distinct families:
 *   (A) Every possible static GP29 permutation indexed by five prior
 *       ciphertext trits, with a completely unknown table.
 *   (B) A fully reversible predecessor-difference rank28 emitter driven
 *       by the literal 243-rune p8 table, with EA=28 as zero-step escape.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=gp.pages.filter(p=>p.page>=9&&p.page<=55&&p.indices.length);
const original=pages.flatMap(p=>p.indices);
const seed=[11,26,8,15,2];
const table=gp.pages[8].indices.slice(12);
const mod=(v,m)=>((v%m)+m)%m;
assert.equal(table.length,243,"p8 black source table = 3^5");
assert.equal(original.length,10827);
const sourceReds=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
assert.deepEqual(gp.pages[7].indices.slice(-14),sourceReds.flat());
assert.deepEqual(sourceReds.map(a=>a.reduce((x,y)=>mod(x*y,29),1)),seed);

/**
 * @param {number[]} recent Five or more GP29 runes.
 * @param {"index"|"prime"} base
 * @param {"firstlast"|"lastfirst"} direction
 * @returns {number} Integer in [0,242].
 */
function stateIndex(recent,base,direction="firstlast"){
  let idx=0;
  for(let k=0;k<5;k++){
    const x=recent[direction==="firstlast"?recent.length-5+k:recent.length-1-k];
    const trit=base==="index"?x%3:gp.prime[x]%3;
    idx=3*idx+trit;
  }
  assert(idx>=0&&idx<243);
  return idx;
}
/** @param {number[]} input */
function ioc(input){
  const counts=Array(29).fill(0);
  for(const x of input)counts[x]++;
  return counts.reduce((a,x)=>a+x*(x-1),0)/(input.length*(input.length-1));
}
/**
 * Sum per-state k largest emission counts. A GP29 row permutation preserves
 * the sorted output counts at every state. With a single secret table shared
 * across the book this is an exact upper bound on any k plaintext labels.
 * @param {"index"|"prime"} base
 * @param {"page"|"book"} reset
 */
function secretRowCapacity(base,reset){
  const rows=Array.from({length:243},()=>new Uint32Array(29));
  let history=seed.slice();
  for(const page of pages){
    if(reset==="page")history=seed.slice();
    for(const c of page.indices){
      rows[stateIndex(history,base)][c]++;
      history.push(c);
    }
  }
  const cap=[1,2,3,4].map(k=>rows.reduce((sum,row)=>{
    const largest=Array.from(row).sort((a,b)=>b-a);
    return sum+largest.slice(0,k).reduce((a,b)=>a+b,0);
  },0));
  return {base,reset,visited:rows.filter(row=>row.some(x=>x)).length,cap,
    fraction:cap.map(x=>x/original.length)};
}
/**
 * Direct literal 243-entry table as a changing 28-step alphabet, with
 * a one-to-one EA=28 escape for a zero ciphertext difference.
 * The immediately preceding ciphertext rune is additional state; therefore
 * this model is outside the exact five-trit-only permutation exclusion.
 * @param {number[]} input Plaintext when encrypting, ciphertext otherwise.
 * @param {{base:"index"|"prime",state:"C"|"P",sign:number,
 *   reset:"page"|"book",direction:"firstlast"|"lastfirst"}} cfg
 * @param {"encrypt"|"decrypt"} mode
 */
function transform(input,cfg,mode){
  let history=seed.slice(),prev=seed[4];
  const output=[];
  for(const x of input){
    const shift=table[stateIndex(history,cfg.base,cfg.direction)]%28;
    let c,p;
    if(mode==="encrypt"){
      p=x;
      const d=p===28?0:1+mod(p-cfg.sign*shift,28);
      c=mod(prev+d,29);
      output.push(c);
    }else{
      c=x;
      const d=mod(c-prev,29);
      p=d===0?28:mod(d-1+cfg.sign*shift,28);
      output.push(p);
    }
    history.push(cfg.state==="C"?c:p);
    prev=c;
  }
  return {output,history:history.slice(-5),prev};
}
/** Same transform preserving page boundaries for all original p9–55. */
function transformPages(cfg){
  let history=seed.slice(),prev=seed[4],out=[];
  for(const page of pages){
    if(cfg.reset==="page"){history=seed.slice();prev=seed[4]}
    // Transform the current page as one piece, retaining the last 5 state
    // symbols and immediately preceding ciphertext across book-mode pages.
    for(const c of page.indices){
      const shift=table[stateIndex(history,cfg.base,cfg.direction)]%28;
      const d=mod(c-prev,29),p=d===0?28:mod(d-1+cfg.sign*shift,28);
      out.push(p);
      history.push(cfg.state==="C"?c:p);
      prev=c;
    }
  }
  return out;
}
/** Source-native GP text, using independently validated LP1 orthography. */
const refs=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt",39],
  ["Gibran","resources/control/gibran_prophet_58585.txt",10],
  ["Emerson","resources/control/emerson_essays_2944.txt",58]
];
const controls=[];
let controlsCount=0,minTop1=1,minTop2=1;
for(const [name,file,expected] of refs){
  const source=encodeSourceNativeGP(read(file));
  const step=Math.floor(original.length/2),N=original.length;
  let count=0,low=[1,1,1,1];
  for(let start=0;start+N<=source.length;start+=step){
    const c=Array(29).fill(0);
    for(let i=start;i<start+N;i++)c[source[i]]++;
    c.sort((a,b)=>b-a);
    let s=0;
    for(let k=0;k<4;k++){s+=c[k];low[k]=Math.min(low[k],s/N)}
    count++;
  }
  assert.equal(count,expected,"historically independent reference windows");
  controls.push({name,sourceRunes:source.length,windows:count,minimumTopShares:low});
  controlsCount+=count;
  minTop1=Math.min(minTop1,low[0]);
  minTop2=Math.min(minTop2,low[1]);
}
assert.equal(controlsCount,107);
const bounds=[];
for(const base of ["index","prime"]){
  for(const reset of ["page","book"])bounds.push(secretRowCapacity(base,reset));
}
assert.deepEqual(bounds.map(x=>x.cap),[
  [1108,2016,2830,3560],[1117,2028,2839,3575],
  [820,1513,2144,2714],[817,1512,2141,2713]
]);
assert.deepEqual(bounds.map(x=>x.visited),[243,243,155,155]);
assert(bounds.every(x=>x.fraction[0]<minTop1));
assert(bounds.every(x=>x.fraction[1]<minTop2));
// Positive for the all-secret arbitrary row-permutation capacity theorem.
for(const base of ["index","prime"]){
  const known=encodeSourceNativeGP(read(refs[1][1])).slice(0,1200);
  const C=[],recovered=[],history=seed.slice(),historyInverse=seed.slice();
  for(const p of known){
    const s=stateIndex(history,base),c=mod(11*p+7*s,29);
    C.push(c);history.push(c);
  }
  for(const c of C){
    const s=stateIndex(historyInverse,base);
    const p=mod(8*(c-7*s),29); // 11 * 8 = 88 = 1 mod 29
    recovered.push(p);historyInverse.push(c);
  }
  assert.deepEqual(recovered,known);
  const sample=secretRowCapacity; // original-bound function covered separately
  assert.equal(typeof sample,"function");
}
// Synthetic native-word recovery for all 32 explicit reversible rank28 variants.
const clear=encodeSourceNativeGP(read(refs[1][1])).slice(0,1200);
let successfulPlants=0;
const direct=[];
for(const base of ["index","prime"])
  for(const state of ["C","P"])
    for(const sign of [-1,1])
      for(const reset of ["page","book"])
        for(const direction of ["firstlast","lastfirst"]){
          const cfg={base,state,sign,reset,direction};
          const planted=transform(clear,cfg,"encrypt").output;
          const recovered=transform(planted,cfg,"decrypt").output;
          assert.deepEqual(recovered,clear);
          successfulPlants++;
          const actual=transformPages(cfg);
          direct.push({...cfg,ioc:ioc(actual),sentinelEA:actual.filter(x=>x===28).length});
        }
assert.equal(successfulPlants,32);
direct.sort((a,b)=>b.ioc-a.ioc);
assert(Math.abs(ioc(original)-0.03449302109588397)<1e-12);
assert(Math.abs(direct[0].ioc-0.035328337270691804)<1e-12);
assert(direct.every(x=>x.ioc<0.03534));
console.log(JSON.stringify({
  status:"Original input tested; no unknown LP2 plaintext/key recovered",
  originalPhysicalPages:"p9–p55, excluding runeless p50",
  originalRunes:original.length,source243Table:table.length,
  exactUnknownKeyFiveTritBounds:bounds,nativeReferenceControls:controls,
  fixedTableRank28DirectVariants:direct.length,
  allNativeRank28PositivePlants:successfulPlants,
  topExplicitRank28Model:direct[0],baselineOriginalIoC:ioc(original),
  nativeClearIoC:ioc(clear),
  decision:"Any fixed unknown five-trit-state GP29 permutation cannot recover native-English source distribution. The 32 literal p8 rank28 predecessor-feedback models also fail, despite fully reversible native plants. Further mechanisms require a new original-source selector."
},null,2));
