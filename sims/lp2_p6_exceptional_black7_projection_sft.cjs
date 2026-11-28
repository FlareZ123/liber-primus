'use strict';
// Source-only, target-blind finite grammar for Director issue #3406.
// Do not import signed 2016 words or grade against them in this script.
const assert = require('node:assert/strict');
const mod = x => ((x % 29) + 29) % 29;
const sum = xs => mod(xs.reduce((a,b) => a+b, 0));
const inv = n => { for(let i=1;i<29;i++)if(mod(i*n)===1)return i;throw Error('non-invertible '+n); };
const p6Black7 = [6,9,28,25,6,21,23]; // physical p6, immediate post-title word, start82
const H = xs => {const out=[];for(let i=0;i<Math.floor(xs.length/2);i++)out.push(mod(xs[i]-xs[xs.length-1-i]),mod(xs[i]+xs[xs.length-1-i]));if(xs.length%2)out.push(xs[Math.floor(xs.length/2)]);return out;};
const Hadj = xs => {const out=[];for(let i=0;i+1<xs.length;i+=2)out.push(mod(xs[i]-xs[i+1]),mod(xs[i]+xs[i+1]));if(xs.length%2)out.push(xs[xs.length-1]);return out;};
assert.deepEqual(H(p6Black7),[12,0,17,1,22,5,25]);
// P6 grid's pre-existing target-rune-blind page-key sum schedule, pages p30..p42.
const sigma = [20,9,4,0,0,25,10,7,0,28,0,5,18];
// The prepared receivers are independently selected by the index-diagonal q/F rule.
// Keep checked markers as original ciphertext, then remove before applying a key.
const cases = [
  {page:36,start:169,original:[2,22,4,1,20],removeIndex:2,required:4},
  {page:41,start:178,original:[27,12,5,0,17,13,19],removeIndex:3,required:0},
  {page:42,start:211,marker:{start:206,original:[16,0,14],H:[2,1,0]},original:[10,0,14,1,3,26,8,2],removeIndex:1,required:0}
];
for(const c of cases){assert.equal(c.original[c.removeIndex],c.required);c.cipher=c.original.filter((_,i)=>i!==c.removeIndex);c.keysum=sigma[c.page-30];if(c.marker)assert.deepEqual(H(c.marker.original),c.marker.H);}
const variants=[];
for(const representation of ['direct','H','Hadj'])for(const orientation of ['forward','reverse'])for(const sign of [1,-1])for(const placement of ['prefix','suffix','centerLeft','centerRight']){
  const src = orientation==='forward'?p6Black7:p6Black7.slice().reverse();
  const base = representation==='direct'?src:representation==='H'?H(src):Hadj(src);
  const out=[];
  for(const c of cases){
    const n=c.cipher.length, slack=7-n;
    const start=placement==='prefix'?0:placement==='suffix'?slack:placement==='centerLeft'?Math.floor(slack/2):Math.ceil(slack/2);
    const window=base.slice(start,start+n).map(x=>mod(sign*x));
    // Unique equal-coordinate lift onto the frozen key-sum hyperplane. Neither
    // its uniformity nor the source-to-key operation is authenticated.
    const correction=mod((c.keysum-sum(window))*inv(n));
    const key=window.map(x=>mod(x+correction));
    assert.equal(sum(key),c.keysum);
    const plaintext=c.cipher.map((x,j)=>mod(x-key[j]));
    assert.deepEqual(plaintext.map((x,j)=>mod(x+key[j])),c.cipher);
    out.push({page:c.page,start:c.start,markedOriginal:c.original,checkedIndex:c.removeIndex,preparedCipher:c.cipher,requiredKeySum:c.keysum,windowStart:start,correction,key,rawDecoded:plaintext});
  }
  variants.push({representation,orientation,sign,placement,receivers:out});
}
assert.equal(variants.length,48);
const signatures=new Set(variants.map(v=>v.receivers.map(c=>c.key.join(',')).join('|')));
console.log(JSON.stringify({status:'PASS',scope:'source-only target-blind original ciphertext inverses',source:'physical p6 immediate black 7-rune word + already frozen p6 page-key-sum grid',p6Black7,alternatives:{representations:3,orientations:2,signs:2,placements:4,total:48,distinctCompleteKeyTriples:signatures.size},cases:cases.map(c=>({page:c.page,start:c.start,original:c.original,removeIndex:c.removeIndex,required:c.required,keysum:c.keysum})),variants}));
