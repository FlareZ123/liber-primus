"use strict";
/**
 * LP2 physical p7 five red complete-word GP29 products provide five source
 * seed values [11,26,8,15,2]. Physical p8 has exactly 243 black runes,
 * 3^5: a possible complete five-trit nonlinear lookup table T.
 *
 * Reversible and source-typed original-consumer test:
 *   P_i = C_i +/- T[trit(last five cipher or plaintext runes)]
 * with seed from the five p7 products, runes->trits via GP index mod3 or
 * GP prime value mod3; either page reset or book-continuous state.
 *
 * Standalone Windows Node.js 22 SFT:
 *   node sims/lp2_p8_ternary5_nonlin_lookup_consumer_sft.cjs
 * No external network, no data writes or hypothesis-dependent key search.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const seed=[11,26,8,15,2];
const T=gp.pages[8].indices.slice(12);
const mod=x=>((x%29)+29)%29;
assert.equal(gp.pages[8].indices.length,255);
assert.equal(T.length,243);
assert.equal(T.length,3**5);
const reds=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
assert.deepEqual(gp.pages[7].indices.slice(-14),reds.flat());
assert.deepEqual(reds.map(x=>x.reduce((a,b)=>mod(a*b),1)),seed);
const trit={
  index:v=>v%3,
  prime:v=>gp.prime[v]%3
};
/**
 * @param {number[]} state exactly five or more runes
 * @param {"index"|"prime"} variant
 * @returns {number}
 */
function tableIndex(state,variant){
  let index=0;
  for(let j=1;j<=5;j++)
    index=3*index+trit[variant](state[state.length-j]);
  assert(index>=0&&index<243);
  return index;
}
/**
 * @param {number[]} C
 * @param {"C"|"P"} stateInput
 * @param {"index"|"prime"} variant
 * @param {number} sign +1 or -1
 * @param {number[]} initial
 * @returns {{P:number[],lastState:number[]}}
 */
function decrypt(C,stateInput,variant,sign,initial){
  const hist=initial.slice(),P=[];
  for(const c of C){
    const x=mod(c+sign*T[tableIndex(hist,variant)]);
    P.push(x);
    hist.push(stateInput==="C"?c:x);
  }
  return {P,lastState:hist.slice(-5)};
}
/**
 * Positive plant under exactly the same genuinely nonlinear lookup rule.
 * @param {number[]} P
 * @param {"C"|"P"} stateInput
 * @param {"index"|"prime"} variant
 * @param {number} sign
 * @param {number[]} initial
 * @returns {number[]}
 */
function encrypt(P,stateInput,variant,sign,initial){
  const hist=initial.slice(),C=[];
  for(const p of P){
    const c=mod(p-sign*T[tableIndex(hist,variant)]);
    C.push(c);
    hist.push(stateInput==="C"?c:p);
  }
  return C;
}
function ioc(xs){
  assert(xs.length>2);
  const hist=Array(29).fill(0);
  for(const x of xs)hist[x]++;
  return hist.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1));
}
const sampleSource=read("resources/control/gibran_prophet_58585.txt");
const sourceWords=sampleSource.match(/[A-Za-z]+/g)||[];
const native=[];
for(const word of sourceWords){
  const runes=encodeSourceNativeGP(word);
  if(runes)native.push(...runes);
  if(native.length>=1800)break;
}
assert(native.length>=1800);
const clear=native.slice(0,1200);
let plantedControls=0;
for(const stateInput of ["C","P"])
  for(const variant of ["index","prime"])
    for(const sign of [-1,1]){
      const C=encrypt(clear,stateInput,variant,sign,seed);
      const result=decrypt(C,stateInput,variant,sign,seed).P;
      assert.deepEqual(result,clear);
      plantedControls++;
    }
assert.equal(plantedControls,8);
const unsolved=gp.pages.filter(p=>p.page<=55);
assert.equal(unsolved.reduce((n,p)=>n+p.indices.length,0),12956);
const later=gp.pages.filter(p=>p.page>=9&&p.page<=55);
const originalIoC=ioc(later.flatMap(p=>p.indices));
const results=[];
for(const variant of ["index","prime"])
  for(const stateInput of ["C","P"])
    for(const sign of [-1,1])
      for(const reset of ["page","book"]){
        let hist=seed.slice(),all=[],after8=[];
        for(const page of unsolved){
          if(reset==="page")hist=seed.slice();
          const decoded=decrypt(page.indices,stateInput,variant,sign,hist);
          hist=decoded.lastState;
          all.push(...decoded.P);
          if(page.page>=9)after8.push(...decoded.P);
        }
        results.push({
          variant,stateInput,sign,reset,
          allPagesIoC:ioc(all),
          p9to55IoC:ioc(after8)
        });
      }
results.sort((a,b)=>b.p9to55IoC-a.p9to55IoC);
assert.equal(results.length,16);
assert(Math.abs(originalIoC-0.03449302109588397)<1e-12);
assert(Math.abs(results[0].p9to55IoC-0.034523785574755966)<1e-12);
assert(results.every(x=>x.p9to55IoC<0.03453));
console.log(JSON.stringify({
  source:"p7 five complete red-word products and p8 original 243 black runes",
  directHypothesis:"p8 body as 3^5-entry nonlinear GP29 additive lookup; previous five GP runes mapped to ternary digits",
  originalPages:56,
  gpRunes:12956,
  p8TableLength:T.length,
  p7FiveSeed:seed,
  originalP9to55IoC:originalIoC,
  nativeGibranSourceIoC:ioc(clear),
  original16ConsumerVariants:results,
  fullyRecoveredSyntheticNativeControls:plantedControls,
  decision:"NO readable or English-like native-GP statistical shift for direct nonlinear lookup interpretation; p8 table may have another purpose or require undisclosed key/ordering",
  recoveredUnknownPlaintext:false
},null,2));
