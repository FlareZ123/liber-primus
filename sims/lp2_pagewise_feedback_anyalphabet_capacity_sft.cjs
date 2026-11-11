"use strict";
/**
 * Source-exact, all-secret capacity test for page-wise first-order
 * ciphertext-feedback encoders over the 29 Gematria Primus rune values.
 * Node.js 22 CommonJS; independent of guessed keys or language-model scores.
 *
 * Candidate model on each physical page:
 *   C[j] = (beta* C[j-1] + sigma(P[j])) mod 29, for j >= 1,
 * with arbitrary beta in F29, arbitrary page-specific 29! permutation sigma,
 * and an unconstrained first output rune on every page.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encodeWords,minimumWindow}=require("./lp2_difference_allletter_capacity_sft.cjs");

const ROOT=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=gp.pages.filter(p=>p.page<=55 && p.indices.length>0);
const MOD=29;

/** @param {number} n @returns {number} */
function mod(n){return ((n%MOD)+MOD)%MOD;}

/**
 * For a fixed feedback beta, counts the most frequent resulting
 * sigma(P) symbol among all page-internal positions.
 * @param {number[]} symbols
 * @param {number} beta
 * @returns {number}
 */
function largestDifferenceClass(symbols,beta){
 const counts=new Uint32Array(MOD);
 for(let j=1;j<symbols.length;j++)
   counts[mod(symbols[j]-beta*symbols[j-1])]++;
 return Math.max(...counts);
}

/**
 * Exact upper bound on occurrences of ANY one plaintext GP rune.
 * The secret beta and secret alphabet permutation may change on EVERY page.
 * Every first rune is granted to the adversary for free.
 * @param {number[][]} streams
 * @returns {{internal:number,firsts:number,total:number,perPage:number[]}}
 */
function allSecretPageCapacity(streams){
 const perPage=streams.map(symbols=>Math.max(
   ...Array.from({length:MOD},(_,beta)=>largestDifferenceClass(symbols,beta))
 ));
 const internal=perPage.reduce((sum,n)=>sum+n,0);
 return {internal,firsts:streams.length,total:internal+streams.length,perPage};
}

/** @param {number} count @returns {number[]} */
function nativeGibran(count){
 const text=encodeWords(read("resources/control/gibran_prophet_58585.txt")).flat();
 assert.ok(text.length>=count);
 return text.slice(0,count);
}

/**
 * Deterministic xorshift for a planted reversible SECRET permutation.
 * This is strictly a positive control; no PRNG is inferred for Cicada.
 * @returns {()=>number}
 */
function seededGenerator(){
 let x=0x33012016;
 return ()=>{
   x^=x<<13;x^=x>>>17;x^=x<<5;
   return x>>>0;
 };
}

/**
 * Encode and decode original-length native GP prose using a DIFFERENT
 * secret alphabet and beta for every original physical page.
 * @param {number[]} plain
 * @param {number[][]} templates
 */
function positiveControl(plain,templates){
 const random=seededGenerator();
 const cipher=[],recovered=[];
 let pos=0;
 for(let page=0;page<templates.length;page++){
   const p=plain.slice(pos,pos+templates[page].length);
   pos+=p.length;
   const sigma=Array.from({length:MOD},(_,i)=>i);
   for(let j=MOD-1;j>0;j--){
     const k=random()%(j+1);
     [sigma[j],sigma[k]]=[sigma[k],sigma[j]];
   }
   const inverse=Array(MOD).fill(-1);
   sigma.forEach((value,index)=>{inverse[value]=index;});
   assert.equal(new Set(sigma).size,MOD);
   const beta=mod(page*11+25);
   const c=Array(p.length);
   c[0]=sigma[p[0]];
   for(let j=1;j<p.length;j++)c[j]=mod(sigma[p[j]]+beta*c[j-1]);
   const d=Array(p.length);
   d[0]=inverse[c[0]];
   for(let j=1;j<p.length;j++)
     d[j]=inverse[mod(c[j]-beta*c[j-1])];
   assert.deepEqual(d,p);
   cipher.push(c);recovered.push(...d);
 }
 assert.equal(pos,plain.length);
 assert.deepEqual(recovered,plain);
 const bound=allSecretPageCapacity(cipher);
 const countE=plain.filter(x=>x===gp.translit.indexOf("E")).length;
 assert.ok(bound.total>=countE);
 return {runes:plain.length,recoveredExactly:true, E:countE,
   anyAlphabetAnyBetaUpperBound:bound.total};
}

function main(){
 assert.equal(pages.length,55);
 const streams=pages.map(p=>p.indices);
 const all=streams.flat();
 assert.equal(all.length,12956);
 const model=allSecretPageCapacity(streams);
 assert.deepEqual(
   [model.internal,model.firsts,model.total],[993,55,1048]
 );
 const global=Array.from({length:MOD},(_,beta)=>({
   beta,max:largestDifferenceClass(all,beta)
 }));
 assert.equal(Math.max(...global.map(x=>x.max)),513);
 const minE=["Gibran","Emerson","Shakespeare"].map((name,i)=>{
   const file=[
     "resources/control/gibran_prophet_58585.txt",
     "resources/control/emerson_essays_2944.txt",
     "resources/control/shakespeare_first300k.txt"
   ][i];
   const native=encodeWords(read(file)).flat();
   const window=minimumWindow(native,all.length,gp.translit.indexOf("E"));
   assert.ok(window);
   return {name,nativeRunes:native.length,
     minimumE:window.count,offset:window.offset};
 });
 assert.deepEqual(minE.map(x=>x.minimumE),[1407,1482,1397]);
 assert.ok(minE.every(x=>x.minimumE>model.total));
 const planted=positiveControl(nativeGibran(all.length),streams);
 const result={hypothesis:"C_j=beta_page*C_(j-1)+sigma_page(P_j) mod29",
   original:{runes:all.length,pages:pages.length,
     allSecretPageCapacity:model,
     globalSingleBetaMaxClass:Math.max(...global.map(x=>x.max)),
     globalByBeta:global},controls:minE,planted};
 console.log(JSON.stringify(result,null,2));
 return result;
}
if(require.main===module)main();
module.exports={main,mod,largestDifferenceClass,allSecretPageCapacity,positiveControl};
