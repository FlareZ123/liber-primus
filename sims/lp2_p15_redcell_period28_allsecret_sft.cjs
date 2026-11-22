"use strict";
/**
 * Key-independent all-secret 28-phase alphabet gate on the original p15
 * signed-red-cell GP29 scalar clock. The period of that unique original
 * highlighted source coordinate is exactly 28 (separate pinned SFT).
 *
 * Every 28-phase secret substitution preserves each phase's sorted
 * symbol histogram, hence its largest-symbol count.
 * Tests entire original 1894-rune source chapter against three native
 * heldout GP English text registers; positive plants are exact.
 * Node.js 22 CommonJS, read-only.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const SIZE=1894,PHASE=28;
const original=gp.pages.slice(15,23).flatMap(p=>p.indices).slice(9);
assert.equal(original.length,SIZE);
assert.equal(gp.pages[15].indices.length,159);
/** @param {number[]} seq @returns {{maxSum:number,chi2:number}} */
function signature(seq){
 assert.equal(seq.length,SIZE);
 let maxSum=0,chi2=0;
 for(let t=0;t<PHASE;t++){
  const f=Array(29).fill(0);
  for(let i=t;i<seq.length;i+=PHASE)f[seq[i]]++;
  const mu=f.reduce((s,n)=>s+n,0)/29;
  maxSum+=Math.max(...f);
  chi2+=f.reduce((s,n)=>s+(n-mu)**2/mu,0);
 }
 return {maxSum,chi2};
}
const glyph=gp.translit.map((name,index)=>({name,index}))
 .sort((x,y)=>y.name.length-x.name.length);
/** @param {string} text @returns {number[]} */
function gpEncode(text){
 const words=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
  .replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[];
 const out=[];
 for(const w of words)for(let j=0;j<w.length;){
  const t=glyph.find(k=>w.startsWith(k.name,j));
  assert.ok(t,"Unmappable native-GP control");
  out.push(t.index);j+=t.name.length;
 }
 return out;
}
const sources=[
 ["Gibran","resources/control/gibran_prophet_58585.txt"],
 ["Shakespeare","resources/control/shakespeare_first300k.txt"],
 ["Emerson","resources/control/emerson_essays_2944.txt"]
];
function main(){
 const source=signature(original), controls=[];
 let positiveNative=null;
 for(const [name,file] of sources){
  const runes=gpEncode(read(file));assert(runes.length>=SIZE);
  if(!positiveNative)positiveNative=runes.slice(0,SIZE);
  let n=0,min=Infinity,chiMin=Infinity,max=-Infinity;
  for(let start=0;start+SIZE<=runes.length;start+=Math.floor(SIZE/2)){
   const s=signature(runes.slice(start,start+SIZE));
   n++;min=Math.min(min,s.maxSum);max=Math.max(max,s.maxSum);
   chiMin=Math.min(chiMin,s.chi2);
  }
  controls.push({name,n,min,max,chiMin});
 }
 assert.equal(source.maxSum,169);
 assert(Math.abs(source.chi2-791.4407374890254)<1e-8);
 assert.deepEqual(controls.map(c=>[c.n,c.min,c.max]),[
  [65,242,283],[230,234,297],[341,243,308]
 ]);
 assert(controls.every(c=>c.min>source.maxSum));
 assert(controls.every(c=>c.chiMin>source.chi2));
 // Full original-length exact secret per-phase bijection (affine example).
 const native=positiveNative;
 const plant=native.map((v,i)=>(7*v+3+i%PHASE)%29);
 const recovered=plant.map((v,i)=>((v-3-i%PHASE+58)*25)%29);
 assert.deepEqual(recovered,native);
 assert.deepEqual(signature(plant),signature(native));
 assert(signature(native).maxSum>=controls[0].min);
 const result={source,controls,totalControls:controls.reduce((s,c)=>s+c.n,0),
  allControlsStrictlyHigher:true,originalRunes:SIZE,period:PHASE,
  positiveExactRecovery:recovered.length,
  positiveSourceNativeSignature:signature(native)};
 console.log(JSON.stringify(result,null,2));return result;
}
if(require.main===module)main();
module.exports={main,gpEncode,signature};
