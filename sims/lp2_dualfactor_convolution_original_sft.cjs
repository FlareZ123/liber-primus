'use strict';
// Reversible source-factor convolution over original LP2 ciphertext.
// Status: candidate decoder, not an authenticated historical mechanism.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const H=[3,26,24]; // Signed 2013 BASE29 3301 -> 3QO digits, ascending
const G=[27,5,15]; // Original LP2 p39 red three-rune sequence, ascending
const lengths=[729,1145,1738,1894,1021,1433,1680,3316];

/** @param {number} x */
function mod(x){return (x%29+29)%29;}
/** @param {number} x */
function inv(x){for(let i=1;i<29;i++)if(mod(i*x)===1)return i;throw Error('nonunit');}
/** @param {number[]} a @param {number[]} b */
function mul(a,b){const z=Array(a.length+b.length-1).fill(0);for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)z[i+j]=mod(z[i+j]+a[i]*b[j]);return z;}
/** @param {number[]} a @param {number[]} b */
function rem(a,b){const z=a.slice();const ib=inv(b[b.length-1]);for(let i=z.length-b.length;i>=0;i--){const t=mod(z[i+b.length-1]*ib);for(let j=0;j<b.length;j++)z[i+j]=mod(z[i+j]-t*b[j]);}return z.slice(0,b.length-1);}
/** @param {number[]} p @param {number[]} k */
function enc(p,k){return p.map((_,i)=>{let x=0;for(let j=0;j<k.length&&j<=i;j++)x+=k[j]*p[i-j];return mod(x);});}
/** @param {number[]} c @param {number[]} k */
function dec(c,k){const p=[],ik=inv(k[0]);for(let i=0;i<c.length;i++){let x=c[i];for(let j=1;j<k.length&&j<=i;j++)x-=k[j]*p[i-j];p.push(mod(x*ik));}return p;}
/** @param {number[]} p */
function ioc(p){const ct=Array(29).fill(0);p.forEach(v=>ct[v]++);return ct.reduce((s,v)=>s+v*(v-1),0)/(p.length*(p.length-1));}
const HG=mul(H,G);
assert.deepEqual(HG,[23,21,11,17,12]);
assert.equal(grid.bytes.length,256);
assert.deepEqual(rem(grid.bytes.map(x=>x%29).reverse(),HG),[0,0,0,0]);
assert.deepEqual(rem(grid.bytes.map(x=>x%29),HG),[25,8,18,24]);
assert.deepEqual(corpus.pages.find(p=>p.page===39).indices.slice(119,122),G);
const pages=corpus.pages.filter(p=>p.page<=55&&p.runic_count>0);
const whole=pages.flatMap(p=>p.indices);
assert.equal(pages.length,55);
assert.equal(whole.length,12956);
const sections=[];let start=0;
for(const n of lengths){sections.push(whole.slice(start,start+n));start+=n;}
assert.equal(start,whole.length);
const known=corpus.pages.find(p=>p.page===57).indices;
assert.equal(known.length,95);
const keys={H,G,HG};
for(const k of Object.values(keys)){const c=enc(known,k);assert.deepEqual(dec(c,k),known);}
const wrong=dec(enc(known,H),HG).filter((v,i)=>v===known[i]).length;
assert.ok(wrong<known.length);
const outcomes={};
for(const [clock,parts] of Object.entries({book:[whole],sections,pages:pages.map(p=>p.indices)})){
 outcomes[clock]={};
 for(const [name,key] of Object.entries(keys)){
  outcomes[clock][name]={};
  for(const direction of ['forward','reverse']){
   const p=parts.flatMap(x=>{
    const c=direction==='reverse'?x.slice().reverse():x;
    const q=dec(c,key);assert.deepEqual(enc(q,key),c);
    return direction==='reverse'?q.reverse():q;
   });
   outcomes[clock][name][direction]=Number(ioc(p).toFixed(12));
  }
 }
}
const zero=[0,0,0,0],hits=[];
for(const p of pages){
 if(rem(p.indices,HG).every((v,i)=>v===zero[i]))hits.push('p'+p.page+':forward');
 if(rem(p.indices.slice().reverse(),HG).every((v,i)=>v===zero[i]))hits.push('p'+p.page+':reverse');
}
assert.deepEqual(hits,[]);
console.log(JSON.stringify({H,G,HG,p50ForwardRemainder:[25,8,18,24],p50ReverseRemainder:zero,
 wholeForwardRemainder:rem(whole,HG),wholeReverseRemainder:rem(whole.slice().reverse(),HG),
 exactPageFactorHits:hits,solvedP57PlantRunes:known.length,wrongFactorPlantMatches:wrong,
 rawIoC:Number(ioc(whole).toFixed(12)),decodedIoCs:outcomes},null,2));
