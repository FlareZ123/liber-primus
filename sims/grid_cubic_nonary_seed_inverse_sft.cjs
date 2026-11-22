"use strict";
/**
 * Original-source GF29 cubic/nonary factor feedback with four marked red seeds.
 * Node 22: node sims/grid_cubic_nonary_seed_inverse_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} s @returns {any} */
function read(s){return JSON.parse(fs.readFileSync(path.join(root,s),"utf8"));}
const corpus=read("resources/liber-primus/lp2-corpus.json");
const ink=read("resources/liber-primus/lp2-ink-annotations.json");
const table=read("resources/liber-primus/lp2-grid-256.json").bytes;
const native=read("resources/control/latin-vulgate-heldout-gp.json").runes;
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
assert.equal(native.length,2400);
/** @param {number} x @returns {number} */
function m(x){return ((x%29)+29)%29;}
/** @param {number[]} coeff @returns {void} */
function assertDivides(coeff){
  const r=table.slice().reverse().map(m),d=coeff.length-1;
  for(let i=r.length-1;i>=d;i--){
    const v=r[i];for(let j=0;j<=d;j++)r[i-d+j]=m(r[i-d+j]-v*coeff[j]);
  }
  assert(r.slice(0,d).every(x=>x===0));
}
/** @param {number[]} coeff @param {number[]} seed @param {number} len @returns {number[]} */
function lfsr(coeff,seed,len){
  const n=coeff.length-1,out=seed.slice(0,len);
  for(let i=n;i<len;i++){let s=0;for(let j=0;j<n;j++)s+=coeff[j]*out[i-n+j];out.push(m(-s));}
  return out;
}
/** @param {number[]} z @returns {number} */
function ioc(z){
  const c=Array(29).fill(0);for(const x of z)c[x]++;
  return c.reduce((s,n)=>s+n*(n-1),0)/(z.length*(z.length-1));
}
const specs=[
 {name:"p3 red triple",page:3,start:119,degree:3,poly:[24,16,14,1]},
 {name:"p39 red triple",page:39,start:119,degree:3,poly:[24,16,14,1]},
 {name:"p15 red nine",page:15,start:0,degree:9,poly:[11,15,0,9,1,5,10,20,12,1]},
 {name:"p54 red nine",page:54,start:0,degree:9,poly:[11,15,0,9,1,5,10,20,12,1]}
];
assertDivides(specs[0].poly);assertDivides(specs[2].poly);
/** @param {number[]} seed @param {number[]} poly @param {boolean} reset @returns {number[]} */
function sourcePad(seed,poly,reset){
  if(!reset)return lfsr(poly,seed,12956);
  return pages.flatMap(p=>lfsr(poly,seed,p.indices.length));
}
const original=pages.flatMap(p=>p.indices),cases=[];
for(const spec of specs){
  const image=ink.pages.find(p=>p.page===spec.page);
  const mark=image.red_spans.find(s=>s.start===spec.start&&s.length===spec.degree);
  assert(mark);
  const seed=[...mark.runes].map(r=>corpus.runes.indexOf(r));
  assert(seed.every(x=>x>=0));
  assert.deepEqual(seed,corpus.pages.find(p=>p.page===spec.page).indices.slice(spec.start,spec.start+spec.degree));
  for(const reverseSeed of [false,true])for(const sign of [-1,1])for(const reset of [false,true]){
    const pad=sourcePad(reverseSeed?seed.slice().reverse():seed,spec.poly,reset);
    const plaintext=original.map((c,i)=>m(c+sign*pad[i]));
    assert.deepEqual(plaintext.map((p,i)=>m(p-sign*pad[i])),original);
    const plant=native.map((p,i)=>m(p-sign*pad[i]));
    assert.deepEqual(plant.map((c,i)=>m(c+sign*pad[i])),native);
    cases.push({name:spec.name,seed,reverseSeed,sign,clock:reset?"page":"book",originalIoC:ioc(plaintext)});
  }
}
assert.equal(cases.length,32);
cases.sort((a,b)=>b.originalIoC-a.originalIoC);
assert(Math.abs(cases[0].originalIoC-0.034528980253088294)<1e-12);
assert(Math.abs(cases.at(-1).originalIoC-0.0344427935825069)<1e-12);
assert(ioc(native)>0.07);
console.log(JSON.stringify({
 original_runes:original.length,native_plant_runes:native.length,cases:cases.length,
 original_cipher_ioc:ioc(original),native_latin_ioc:ioc(native),
 best_original:cases[0],worst_original:cases.at(-1),
 original_reencrypt_exact:true,native_plants_exact:true
},null,2));
