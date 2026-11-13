"use strict";
/**
 * Key-independent GP29 capacity test for ciphertext-driven running-checksum
 * substitution ciphers. Source-native LP2 and English, original 12,956 runes.
 * Any secret alphabet per (original visual chapter, public checksum state).
 * SFT: node sims/lp2_running_checksum_anyalphabet_sft.cjs
 * Node.js 22, CommonJS; read-only; no third-party packages.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const ROOT=path.resolve(__dirname,"..");
/** @param {string} f @returns {string} */
const read=f=>fs.readFileSync(path.join(ROOT,f),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=gp.pages.filter(p=>p.page<56&&p.indices.length);
const original=pages.flatMap(p=>p.indices);
const LENGTHS=[729,1145,1729,1903,1021,1433,1680,3008,308];
const MOD=29,E=gp.translit.indexOf("E"),O=gp.translit.indexOf("O");
/** @param {number} n @returns {number} */
const mod=n=>(n%MOD+MOD)%MOD;
assert.deepEqual([original.length,pages.length,E,O],[12956,55,18,3]);
assert.equal(LENGTHS.reduce((s,n)=>s+n,0),original.length);
/** @param {number[]} seq @returns {number[][]} */
function split(seq){
 let start=0;
 const pieces=LENGTHS.map(n=>{
  const v=seq.slice(start,start+n);start+=n;
  assert.equal(v.length,n);return v;
 });
 assert.equal(start,seq.length);return pieces;
}
/**
 * Grant an arbitrary full GP29 permutation for EVERY state of EVERY section.
 * For any fixed plaintext rune the maximum occurrence count is the largest
 * observed ciphertext bin in each state; for two distinct plaintext runes
 * the maximum is the sum of the largest TWO DISTINCT bins.
 * @param {number[][]} sections
 * @param {(glyph:number)=>number} increment
 * @returns {{E:number,EO:number}}
 */
function capacity(sections,increment){
 let one=0,two=0;
 for(const cipher of sections){
  const hist=Array.from({length:MOD},()=>new Uint32Array(MOD));
  let state=0;
  for(const c of cipher){
   assert.ok(Number.isInteger(c)&&c>=0&&c<MOD);
   hist[state][c]++;
   state=mod(state+increment(c));
  }
  for(const row of hist){
   let first=0,second=0;
   for(const n of row){
    if(n>first){second=first;first=n;}
    else if(n>second)second=n;
   }
   one+=first;two+=first+second;
  }
 }
 return {E:one,EO:two};
}
/**
 * Exact minimum symbol count across every original-length sliding window.
 * @param {number[]} seq @param {number} window
 * @param {(glyph:number)=>boolean} select
 */
function minimumWindow(seq,window,select){
 assert.ok(seq.length>=window);
 let count=0,best=Infinity,offset=-1;
 for(let i=0;i<seq.length;i++){
  if(select(seq[i]))count++;
  if(i>=window&&select(seq[i-window]))count--;
  if(i>=window-1&&count<best){best=count;offset=i-window+1;}
 }
 return {count:best,offset};
}
const clocks={
 gpIndex:c=>c,
 gpPrime:c=>gp.prime[c],
 gpTotient:c=>gp.prime[c]-1
};
/**
 * Reversible, source-length native-GP plant with a changing cipher-only prime
 * checksum and independently keyed alphabets at all nine original chapters.
 * The affine table per chapter/state is one of the unlimited secret tables
 * allowed by the proof: c=(11*p+7*state+3*chapter) mod29.
 * @param {number[]} native
 */
function positivePlant(native){
 const ciphertext=[],plaintext=[],encryptedSections=[];
 const sections=split(native);
 for(let chapter=0;chapter<sections.length;chapter++){
  const encrypted=[];let state=0;
  for(const p of sections[chapter]){
   const c=mod(11*p+7*state+3*chapter);
   encrypted.push(c);ciphertext.push(c);
   state=mod(state+gp.prime[c]);
  }
  encryptedSections.push(encrypted);
  state=0;
  for(const c of encrypted){
   plaintext.push(mod(8*(c-7*state-3*chapter)));
   state=mod(state+gp.prime[c]);
  }
 }
 assert.deepEqual(plaintext,native);
 assert.equal(ciphertext.length,12956);
 const blind=capacity(encryptedSections,clocks.gpPrime);
 const nativeE=native.filter(c=>c===E).length;
 const nativeEO=native.filter(c=>c===E||c===O).length;
 assert.ok(blind.E>=nativeE&&blind.EO>=nativeEO);
 return {runes:plaintext.length,exactForwardAndInverse:true,
   nativeE,nativeEO,blindCipherE:blind.E,blindCipherEO:blind.EO};
}
function main(){
 const chapters=split(original),out={};
 const expected={
  gpIndex:[[692,1328],[1245,2265]],
  gpPrime:[[708,1339],[1226,2259]],
  gpTotient:[[705,1360],[1236,2266]]
 };
 for(const [name,inc] of Object.entries(clocks)){
  const single=capacity([original],inc);
  const nine=capacity(chapters,inc);
  assert.deepEqual([[single.E,single.EO],[nine.E,nine.EO]],expected[name]);
  out[name]={oneGlobalTablePerState:single,
    nineIndependentChapterTablesPerState:nine};
 }
 const controls=[
  ["Gibran","resources/control/gibran_prophet_58585.txt",1416,2548],
  ["Shakespeare","resources/control/shakespeare_first300k.txt",1408,2441],
  ["Emerson","resources/control/emerson_essays_2944.txt",1491,2408]
 ].map(([name,file,minE,minEO])=>{
  const native=encodeSourceNativeGP(read(file));
  const gotE=minimumWindow(native,12956,c=>c===E);
  const gotEO=minimumWindow(native,12956,c=>c===E||c===O);
  assert.deepEqual([gotE.count,gotEO.count],[minE,minEO]);
  return {name,runes:native.length,minimumE:gotE,minimumEO:gotEO};
 });
 const upperE=Math.max(...Object.values(out).map(x=>
   x.nineIndependentChapterTablesPerState.E));
 const upperEO=Math.max(...Object.values(out).map(x=>
   x.nineIndependentChapterTablesPerState.EO));
 assert.ok(controls.every(x=>
   x.minimumE.count>upperE&&x.minimumEO.count>upperEO));
 const planted=positivePlant(encodeSourceNativeGP(read(
  "resources/control/gibran_prophet_58585.txt")).slice(0,12956));
 assert.deepEqual([planted.nativeE,planted.nativeEO,planted.blindCipherE,
  planted.blindCipherEO],[1529,2661,2554,4292]);
 const result={originalRunes:original.length,sourceVisibleChapters:LENGTHS,
  hypothesis:"C_t=sigma_(chapter,cumulativePreviousCiphertext)(P_t)",
  allSecretOriginalBounds:out,sourceNativeEnglishControls:controls,
  planted,conclusion:"All three checksum state choices fail contiguous native GP prose under one book or nine independent chapter-state tables; physical-page-independent keys and plaintext feedback remain outside scope. No recovered unknown plaintext."};
 console.log(JSON.stringify(result,null,2));
 return result;
}
if(require.main===module)main();
module.exports={main,capacity,minimumWindow,positivePlant};
