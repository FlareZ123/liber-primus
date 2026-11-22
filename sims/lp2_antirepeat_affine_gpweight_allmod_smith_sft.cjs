"use strict";
/**
 * Original LP2 all-integer-modulus affine GP prime/ordinal antirepeat clock.
 * Five actual F-free, punctuation-free adjacent-doublet gap witnesses force
 * a Smith invariant [1,1,2] for both pre- and post-event conventions.
 *
 * A clock W(r)=c+a*r+b*GPprime(r) modulo m, with repeated output permitted
 * at only one phase, must therefore have c=a=b=0 for EVERY odd m>=3.
 * For even m, the only nonzero surviving coefficient vector is
 * (m/2,0,m/2): this clock ticks exclusively on GP F (prime=2).
 * Thus no changing state driven by any non-F ciphertext rune survives.
 *
 * Windows 11 Node22 standalone: node sims/lp2_antirepeat_affine_gpweight_allmod_smith_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
/** @param {string} name */
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const punct=JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
const originalInk=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const pages=corpus.pages.filter(x=>x.page<56 && x.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
const gpPrime=corpus.prime;
assert.equal(gpPrime.length,29);
assert.equal(gpPrime[0],2);
assert(gpPrime.slice(1).every(p=>p%2===1));
const sources=[
 {page:27,start:84,end:90},
 {page:24,start:52,end:59},
 {page:35,start:196,end:203},
 {page:8,start:142,end:152},
 {page:19,start:18,end:45}
];
const vec=(ar)=>[
 ar.length,
 ar.reduce((s,x)=>s+x,0),
 ar.reduce((s,x)=>s+gpPrime[x],0)
];
const rows={before:[],after:[]};
const original=[];
for(const w of sources){
 const page=pages.find(x=>x.page===w.page);
 assert(page);
 const arr=page.indices;
 assert.equal(arr[w.start],arr[w.start-1],"first doublet "+w.page);
 assert.equal(arr[w.end],arr[w.end-1],"second doublet "+w.page);
 const before=arr.slice(w.start,w.end),after=arr.slice(w.start+1,w.end+1);
 assert.equal(before.length,w.end-w.start);
 assert(!before.includes(0)&&!after.includes(0),"no F in gap");
 const marks=punct.events.filter(e=>e.page===w.page
   && e.local_rune_offset>w.start && e.local_rune_offset<=w.end);
 assert.equal(marks.length,0,"no printed punctuation in gap");
 const sourceInk=originalInk.pages.find(p=>p.page===w.page);
 assert(sourceInk);
 const redInGap=(sourceInk.red_spans||[]).filter(r=>r.start<w.end && r.start+r.length>w.start);
 assert.equal(redInGap.length,0,"no source red-ink rubric reset in gap");
 rows.before.push(vec(before));
 rows.after.push(vec(after));
 original.push({page:w.page,repeatDestinations:[w.start,w.end],
  glyphs:[arr[w.start],arr[w.end]],gap:w.end-w.start,
  before:vec(before),after:vec(after)});
}
assert.deepEqual(rows.before,[
 [6,94,354],[7,90,321],[7,104,379],[10,149,532],[27,374,1341]]);
assert.deepEqual(rows.after,[
 [6,109,414],[7,111,411],[7,113,411],[10,138,486],[27,390,1405]]);
const determinant=m=>{
 const [[a,b,c],[d,e,f],[g,h,i]]=m;
 return a*(e*i-f*h)-b*(d*i-f*g)+c*(d*h-e*g);
};
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const gcda=ar=>ar.reduce((s,x)=>gcd(s,x),0);
/** @param {number[][]} matrix */
function minors(matrix){
 const one=matrix.flat();
 const two=[];
 const three=[];
 for(let i=0;i<matrix.length;i++){
  for(let j=i+1;j<matrix.length;j++){
   for(let c=0;c<3;c++)for(let d=c+1;d<3;d++)
    two.push(matrix[i][c]*matrix[j][d]-matrix[i][d]*matrix[j][c]);
   for(let k=j+1;k<matrix.length;k++)
    three.push(determinant([matrix[i],matrix[j],matrix[k]]));
  }
 }
 assert.equal(one.length,15);
 assert.equal(two.length,30);
 assert.equal(three.length,10);
 return {oneGcd:gcda(one),twoGcd:gcda(two),threeGcd:gcda(three),
   threeValues:three};
}
const checks={before:minors(rows.before),after:minors(rows.after)};
assert.deepEqual([checks.before.oneGcd,checks.before.twoGcd,checks.before.threeGcd],[1,1,2]);
assert.deepEqual([checks.after.oneGcd,checks.after.twoGcd,checks.after.threeGcd],[1,1,2]);
assert.deepEqual(checks.before.threeValues,
  [884,2612,2688,408,-1428,-5460,-1098,-824,904,-2154]);
assert.deepEqual(checks.after.threeValues,
  [864,924,1010,-1524,-4486,-3016,-1416,-2524,-1044,-2900]);
/** @param {number} v @param {number} mod */
const mod=(v,m)=>((v%m)+m)%m;
/** @param {number[][]} matrix @param {number[]} key @param {number} m */
const valid=(matrix,key,m)=>matrix.every(row=>
 mod(row[0]*key[0]+row[1]*key[1]+row[2]*key[2],m)===0);
/** Enumerate all secret coefficients for every modulus up to the actual
 * original GP29 alphabet size; global Smith proof covers all m unbounded.
 */
const tested=[];
for(let m=2;m<=29;m++){
 const wanted=m%2===0?[[0,0,0],[m/2,0,m/2]]:[[0,0,0]];
 const results={before:[],after:[]};
 for(let c=0;c<m;c++)for(let a=0;a<m;a++)for(let b=0;b<m;b++){
  const key=[c,a,b];
  for(const phase of ["before","after"])
   if(valid(rows[phase],key,m))results[phase].push(key);
 }
 for(const mode of ["before","after"]){
  assert.deepEqual(results[mode],wanted,
    "no additional clock allowed modulo "+m+" convention "+mode);
 }
 tested.push({modulus:m,count:results.before.length,
  nontrivial:results.before.length-1});
}
for(const even of [2,4,6,10,28,30,256,3300]){
 const key=[even/2,0,even/2];
 assert(valid(rows.before,key,even));
 assert(valid(rows.after,key,even));
 for(let rune=0;rune<29;rune++)
  assert.equal(mod(key[0]+key[1]*rune+key[2]*gpPrime[rune],even),
    rune===0?even/2:0,"F-only surviving step");
}
for(const m of [3,5,7,13,17,29,257,3301]){
 assert(valid(rows.before,[0,0,0],m));
 assert(valid(rows.after,[0,0,0],m));
 // 2 is invertible for every odd m; SNF invariant [1,1,2]
 // establishes this as the sole key for all odd m without enumeration.
}
console.log("PASS "+JSON.stringify({
 originalRunes:12956,noRedInkBetweenSourceWitnesses:true,sourceWitnesses:original,
 smithInvariant:{before:[1,1,2],after:[1,1,2]},
 exactOriginalMinors:checks,enumeratedSecretModuli:tested,
 allOddModuli:"only zero secret coefficient vector",
 evenModuli:"only nonzero possible key (m/2,0,m/2); F-only phase toggle",
 scope:"all linear c+a*ordinal(r)+b*GPprime(r) clocks whose repeat gates use only punctuation/page resets and optional F skips; no ordinary word-boundary reset"
}));
