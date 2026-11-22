'use strict';
/**
 * 2012 MIDI chorus as p36 known plaintext, testing a p50-H16 GF29
 * source-cofactor LFSR as the *entire otherwise-secret additive key*.
 * Source-motivated conditional gate; no claim of a historical LFSR.
 * Run: node sims/2012_chorus_p36_h16_derived_key_gate.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p */
const txt=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(txt('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(txt('resources/liber-primus/base60-grid.json'));
const midi=JSON.parse(txt('im-results/2012-midi-chorus-p36-238-inputs.json'));
const cipher=corpus.pages.find(p=>p.page===36).indices;
const poem=txt('resources/control/cicada2012_blake_chorus.txt')
  .split('BEGIN SOURCE TEXT')[1].split('END SOURCE TEXT')[0]
  .toUpperCase().replace(/[^A-Z]/g,'');
assert.equal(poem.length,238);
assert.equal(cipher.length,238);
assert.equal(midi.first_cycle_note_plus_delta_sums.length,238);
const mod=n=>(n%29+29)%29;
/** @param {number[]} a @param {number[]} b */
function mul(a,b){
 const z=Array(a.length+b.length-1).fill(0);
 for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)
   z[i+j]=mod(z[i+j]+a[i]*b[j]);
 return z;
}
const factors=[
 [5,1],[5,1],[11,18,1],[24,16,14,1],
 [11,15,0,9,1,5,10,20,12,1]
];
const H=factors.reduce(mul,[1]);
assert.equal(H.length,17);
assert.deepEqual(H,[13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1]);
const bytes=grid.byte_rows.flat();
assert.equal(bytes.length,256);
let r=bytes.slice().reverse().map(mod);
assert.equal(r.at(-1),0);
r.pop();
const inv=x=>{for(let i=1;i<29;i++)if(mod(i*x)===1)return i;
 throw Error('noninvertible leading coefficient');};
const q=Array(r.length-H.length+1).fill(0);
for(let i=r.length-1;i>=H.length-1;i--){
 const k=mod(r[i]*inv(H.at(-1)));
 q[i-H.length+1]=k;
 for(let j=0;j<H.length;j++)r[i-H.length+1+j]=mod(r[i-H.length+1+j]-k*H[j]);
}
assert(r.slice(0,H.length-1).every(x=>x===0));
assert.equal(q.length,239);
assert.equal(q.at(-1),28);
const gp=new Map(corpus.translit.map((v,i)=>[v,i]));
const rank='abcdefghijklmnoprstuvwy'.toUpperCase();
const mapped={
 'Latin ordinal': [...poem].map(c=>c.charCodeAt(0)-65),
 'GP single-rune': [...poem].map(c=>gp.get(({K:'C',V:'U',Z:'S',Q:'C'})[c]||c)),
 '2012 MIDI rank': [...poem].map(c=>rank.indexOf(c)),
 'MIDI pitch+duration mod29':midi.first_cycle_note_plus_delta_sums.map(mod),
};
for(const a of Object.values(mapped)){
 assert.equal(a.length,238);
 assert(a.every(x=>Number.isInteger(x)&&x>=0&&x<29));
}
/**
 * @param {number[]} key
 * @param {number[]} poly ascending recurrence polynomial
 */
function tally(key,poly){
 const d=poly.length-1,reciprocal=inv(poly[d]);
 let hits=0;
 for(let i=d;i<key.length;i++){
  let n=0;
  for(let j=0;j<d;j++)n-=poly[j]*key[i-d+j];
  if(mod(n*reciprocal)===key[i])hits++;
 }
 return hits;
}
/** @param {number[]} seed @param {number[]} poly */
function plantKey(seed,poly){
 const k=seed.slice(),d=poly.length-1,reciprocal=inv(poly[d]);
 while(k.length<238){
  let next=0;
  for(let j=0;j<d;j++)next-=poly[j]*k[k.length-d+j];
  k.push(mod(next*reciprocal));
 }
 return k;
}
const expected={
 'Latin ordinal':[6,4,9,6],
 'GP single-rune':[10,6,10,8],
 '2012 MIDI rank':[2,7,7,7],
 'MIDI pitch+duration mod29':[6,8,13,16]
};
const results=[];
for(const [name,plain] of Object.entries(mapped)){
 let idx=0;
 for(const sign of [-1,1])for(const reverse of [false,true]){
  const poly=reverse?H.slice().reverse():H;
  const key=cipher.map((c,i)=>mod(c+sign*plain[i]));
  const matches=tally(key,poly);
  assert.equal(matches,expected[name][idx++]);
  const planted=plantKey(Array.from({length:16},(_,i)=>mod(13+i*7)),poly);
  const cipherPlant=plain.map((p,i)=>mod(planted[i]-sign*p));
  assert.equal(tally(cipherPlant.map((c,i)=>mod(c+sign*plain[i])),poly),222);
  results.push({name,sign,reverse,matched:matches,total:222});
 }
}
assert.equal(results.length,16);
assert.equal(Math.max(...results.map(x=>x.matched)),16);
console.log(JSON.stringify({p36:238,chorus:238,H16:H,results,
 decision:'0/16 models satisfy all 222 necessary recurrence predictions; no LP2 plaintext'},null,2));
