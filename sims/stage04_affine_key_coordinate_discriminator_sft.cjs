'use strict';
const assert = require('node:assert/strict');

// #3193. Known-answer witness from the original Stage04 small image and
// archived fourth-onion identifier (see stage04_small_image_vigenere_repro.cjs).
// These are independent input and known-output constants, not generated
// plaintext. Native GP29 chart: results/2013-original-gp29-source-map.md.
const runes = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const labels = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IO','EA'];
const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const raw = 'ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3ᛠᛗᛇᚠᛡ';
const known = 'AUOWYFGL5LKZFJ3NONION';
/** @param {number} x */
const mod = x => ((x % 29) + 29) % 29;
/** @param {string} s */
function gp(s) {
  const tokens = s.replace(/\s/g,'').replace(/K/g,'C').replace(/Z/g,'S').match(/TH|EO|NG|OE|AE|IO|EA|[A-Z]/g);
  return tokens.map(x=>{const i=labels.indexOf(x);assert(i>=0,x);return i;});
}
const c = [...raw].filter(x=>runes.includes(x)).map(x=>runes.indexOf(x));
const p = gp(known.replace(/[53]/g,''));
const k = gp('WELCOME PILGRIM TO THE');
assert.equal(c.length,18);
assert.equal(p.length,18);
assert.equal(k.length,18);
const maps = {
  ordinal: x=>x,
  oneBased: x=>x+1,
  reversed: x=>28-x,
  prime: x=>primes[x],
  totient: x=>primes[x]-1,
};
const fits = {};
for (const [name,f] of Object.entries(maps)) {
  const first8 = [], all = [];
  for(let a=0;a<29;a++) for(let b=0;b<29;b++) for(let d=0;d<29;d++) {
    const out=c.map((x,i)=>mod(a*x+b*f(k[i])+d));
    if (!out.slice(0,8).every((x,i)=>x===p[i])) continue;
    first8.push([a,b,d]);
    if (out.every((x,i)=>x===p[i])) all.push([a,b,d]);
  }
  fits[name]={first8,all};
}
assert.deepEqual(fits, {
  ordinal:{first8:[[1,28,0]],all:[[1,28,0]]},
  oneBased:{first8:[[1,28,1]],all:[[1,28,1]]},
  reversed:{first8:[[1,1,1]],all:[[1,1,1]]},
  prime:{first8:[],all:[]},
  totient:{first8:[],all:[]},
});
assert.deepEqual(c.map((x,i)=>mod(x-k[i])),p);
assert.deepEqual(p.map((x,i)=>mod(x+k[i])),c);
const crossings=c.map((x,i)=>({i,c:x,p:p[i],k:k[i]})).filter(x=>x.c===0||x.p===0);
assert.deepEqual(crossings,[{i:4,c:0,p:26,k:3},{i:5,c:19,p:0,k:19},{i:11,c:4,p:0,k:4},{i:16,c:0,p:27,k:2}]);
const negativeResidues=c.map((x,i)=>({i,raw:x-k[i]})).filter(x=>x.raw<0);
assert.equal(negativeResidues.length,5);
const compatiblePeriods=Array.from({length:18},(_,i)=>i+1).filter(q=>k.every((v,i)=>i<q||v===k[i-q]));
assert.deepEqual(compatiblePeriods,[18]);
// With q=19, the first eighteen values give no constraint on the 19th.
// Every value 0..28 is compatible, as is a finite 18-step tape.
const q19Extensions=Array.from({length:29},(_,i)=>[...k,i]);
assert(q19Extensions.every(v=>c.every((x,i)=>mod(x-v[i])===p[i])));
console.log(JSON.stringify({raw,known,c,p,k,fits,fitRunes:8,heldRunes:10,
  crossings,negativeResidues,compatiblePeriodsThrough18:compatiblePeriods,
  q19Extensions:q19Extensions.length,
  conclusion:'Ordinal shift fixed in affine family; three coordinate charts equivalent; no F hold; no wrap observed; no LP2 operand under the independently tested mixed identifier grammar.'},null,2));
