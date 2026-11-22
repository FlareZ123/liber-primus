"use strict";

/**
 * Source-selected five-product DH packet as a five-phase exponent schedule
 * for an invertible five-back GF29 plaintext-feedback cipher.
 *
 * C[j] = C[j-1] + k[j]*(P[j] - P[j-5]^e[j]) mod 29, j>=5;
 * arbitrary secret nonzero k[j] at every position. The first five
 * ciphertext runes per printed word are unconstrained initial values.
 *
 * The source-visible p7 five red-word products [11,26,8,15,2] are
 * interpreted, hypothetically, as exponents; this semantic step is NOT
 * an authenticated creator instruction. Test all five cycle rotations
 * and both traversal directions. No key can evade the necessary equality
 * invariant C[j]=C[j-1] iff P[j]=P[j-5]^e[j].
 *
 * Node.js 22 / Windows 11 / CJS, no external packages:
 * node sims/lp2_p7_fiveproduct_lag5_power_feedback_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.resolve(__dirname, "..");
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const red = [[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
assert.deepEqual(gp.pages[7].indices.slice(-14), red.flat());
const exponents = red.map(w => w.reduce((a,b) => a*b%29, 1));
assert.deepEqual(exponents, [11,26,8,15,2]);
const variants = [];
for (const reversed of [false,true]) {
  const ordered = reversed ? [...exponents].reverse() : exponents;
  for (let phase=0; phase<5; phase++)
    variants.push({reversed,phase,
      schedule: Array.from({length:5}, (_,i)=>ordered[(i+phase)%5])});
}
assert.equal(variants.length, 10);
const original = gp.pages.filter(p => p.page<=55 && p.indices.length)
  .flatMap(p=>p.indices);
const indices = new Map(gp.runes.map((r,i)=>[r,i]));
const printed = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0,55).join("")
  .replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,"");
const words = (printed.match(new RegExp(
  "["+gp.runes.join("")+"]+","gu"))||[])
  .map(w => Array.from(w,c=>indices.get(c)));
assert.equal(original.length,12956);
assert.equal(words.length,2896);
assert.deepEqual(words.flat(),original);
const page = new Uint8Array(original.length);
let offset=0;
for (const p of gp.pages.filter(p => p.page<=55 && p.indices.length)){
  page.fill(p.page,offset,offset+p.indices.length);
  offset+=p.indices.length;
}
const slots=[];
offset=0;
for (const w of words) {
  const these=[];
  for (let j=5;j<w.length;j++)
    if (page[offset+j]===page[offset+j-5])these.push(j);
  slots.push(these);
  offset+=w.length;
}
const nSlots=slots.reduce((sum,cell)=>sum+cell.length,0);
const observed=words.reduce((sum,w,i)=>
  sum+slots[i].filter(j=>w[j]===w[j-1]).length,0);
assert.deepEqual([nSlots,observed],[2073,15]);

const pow=Array.from({length:29},(_,x)=>{
  const out=Array(29).fill(1);
  for(let i=1;i<=28;i++)out[i]=out[i-1]*x%29;
  return out;
});
/** @param {number} v */
const mod=v=>(v%29+29)%29;
/** @param {number} v */
function inv(v){
  assert(v>0&&v<29);
  for(let k=1;k<29;k++)if(v*k%29===1)return k;
  throw Error("unreachable inverse");
}
/**
 * Full native GP encryption and inversion with unrelated nonzero
 * multipliers. Positive to ensure the exact key-independent marker is
 * necessary AND sufficient at all original eligible sites.
 * @param {number[][]} native
 * @param {number[]} schedule
 */
function plant(native,schedule){
  let checked=0,eligible=0;
  for(let wi=0;wi<native.length;wi++){
    const P=native[wi],C=P.slice(0,5),D=C.slice();
    for(let j=5;j<P.length;j++){
      const e=schedule[(j-5)%5],k=1+(13*wi+17*j)%28;
      C[j]=mod(C[j-1]+k*(P[j]-pow[P[j-5]][e]));
      D[j]=mod(pow[D[j-5]][e]+mod(C[j]-C[j-1])*inv(k));
    }
    assert.deepEqual(D,P);
    for(const j of slots[wi]){
      assert.equal(C[j]===C[j-1],
        P[j]===pow[P[j-5]][schedule[(j-5)%5]]);
      eligible++;
    }
    checked+=P.length;
  }
  assert.deepEqual([checked,eligible],[12956,nSlots]);
  return {recovered:checked,invariantChecks:eligible};
}
/** @param {number} initial */
function rng(initial) {
  let state=initial>>>0;
  return ()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return (state>>>0)/4294967296;
  };
}
/** @param {number[][]} sample */
function score(sample){
  const counts=Array(variants.length).fill(0);
  for(let wi=0;wi<sample.length;wi++){
    const w=sample[wi];
    for(const j of slots[wi]){
      const x=w[j-5],v=w[j],p=pow[x];
      for(let t=0;t<variants.length;t++)
        if(p[variants[t].schedule[(j-5)%5]]===v)counts[t]++;
    }
  }
  return counts;
}

const controlFiles=[
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
const trials=300;
const output=[];
for(let c=0;c<controlFiles.length;c++){
  const pools=new Map();
  for(const word of read(controlFiles[c]).match(/[A-Za-z]+/g)||[]){
    const p=encodeSourceNativeGP(word);
    if(!pools.has(p.length))pools.set(p.length,[]);
    pools.get(p.length).push(p);
  }
  assert(words.every(w=>pools.has(w.length)));
  const next=rng(0x33015640+c);
  const samples=Array.from({length:10},()=>[]);
  let planted=null;
  for(let t=0;t<trials;t++){
    const sample=words.map(w=>{
      const pool=pools.get(w.length);
      return pool[Math.floor(next()*pool.length)];
    });
    if(t===0)planted=plant(sample,variants[0].schedule);
    for(const [v,n] of score(sample).entries())samples[v].push(n);
  }
  const estimates=samples.map((nums,i)=>{
    const mean=nums.reduce((s,x)=>s+x,0)/trials;
    const sd=Math.sqrt(nums.reduce((s,x)=>s+(x-mean)**2,0)/trials);
    return {direction:variants[i].reversed?"reverse":"forward",
      phase:variants[i].phase,schedule:variants[i].schedule,
      original:observed,mean:+mean.toFixed(3),sd:+sd.toFixed(3),
      z:+((observed-mean)/sd).toFixed(3),
      min:Math.min(...nums),max:Math.max(...nums)};
  });
  output.push({source:controlFiles[c],trials,
    nativePositive:planted,
    mostFavorableForOriginal:estimates.slice().sort((a,b)=>a.mean-b.mean).slice(0,3),
    allPhaseEstimates:estimates});
}
console.log(JSON.stringify({
  status:"All-secret original gate for source p7 five-red-product exponents; no plaintext",
  sourcePacket:exponents,
  original:{runes:original.length,words:words.length,
    eligible:nSlots,adjacentRepeats:observed},
  controls:output,
  conclusion:"All ten direction/phase schedules are excluded as source-native unchanged-English book encoders if their count ranges exceed original. All secret k choices are covered by the invariant."
},null,2));
