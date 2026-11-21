'use strict';
/**
 * LP2 p7 five red-word products and p8 Roman XIX cubing: original-cipher
 * five-tap reversible consumers. Windows Node22 SFT, no dependencies:
 * node sims/lp2_p7_p8_roman_cuberoot_fivetap_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const gp = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const P = n => gp.pages[n].indices;
const mod = x => ((x % 29) + 29) % 29;
const pow = (v, e) => { let z = 1; for (let j = 0; j < e; j++) z = mod(z * v); return z; };
/** @param {number[]} x */
const ioc = x => { const f = Array(29).fill(0); for (const v of x) f[v]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (x.length * (x.length - 1)); };
assert.deepEqual(ink.pages.find(x => x.page === 7)
  .red_spans.map(x => [x.start, x.length]), [[194,14]]);
assert.deepEqual(ink.pages.find(x => x.page === 8)
  .red_spans.map(x => [x.start, x.length]), [[0,12]]);
const words = [[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
assert.deepEqual(words.flat(), P(7).slice(194));
const w = words.map(a => a.reduce((s, v) => mod(s * v), 1));
assert.deepEqual(w,[11,26,8,15,2]);
assert.deepEqual(P(8).slice(0,8),[14,10,14,19,1,14,19,5]);
assert.equal(P(8).slice(8,12).reduce((s,v)=>mod(s*v),1),3);
const orbit = [2];
for(let i=0;i<6;i++) orbit.push(pow(orbit.at(-1),3));
assert.deepEqual(orbit,[2,8,19,15,11,26,2]);
for(let i=0;i<29;i++) assert.equal(pow(pow(i,3),19),i);
const chapter=gp.pages.slice(8,15).flatMap(p=>p.indices), native=P(57);
assert.equal(chapter.length,1729);
assert.equal(native.length,95);
const modes=['root-before-sum','root-after-sum','cube-previous-sum','root-after-product'];
/**
 * Feedback uses precisely the prior five ciphertext runes. All maps are
 * reversible because ciphertext, including the five-rune IV, is known.
 * @param {number[]} history
 * @param {number[]} weights
 * @param {string} mode
 */
function feedback(history,weights,mode){
 const past=weights.map((_,j)=>history[history.length-j-1]);
 if(mode==='root-after-product')
   return past.reduce((v,x,j)=>mod(v*mod(x+weights[j])),1);
 return mod(past.reduce((s,x,j)=>s+weights[j]*(mode==='cube-previous-sum'?pow(x,3):x),0));
}
/** @param {number[]} data @param {number[]} iv @param {number[]} weights
 * @param {number} sign @param {string} mode @param {boolean} enc */
function transform(data,iv,weights,sign,mode,enc){
 const history=iv.slice(),out=[];
 for(const v of data){
   const f=feedback(history,weights,mode);
   let c,p;
   if(enc){
     p=v;
     c=mode==='root-before-sum'?pow(mod(p-sign*f),3):
       mode==='cube-previous-sum'?mod(p-sign*f):mod(pow(p,3)-sign*f);
   }else{
     c=v;
     p=mode==='root-before-sum'?mod(pow(c,19)+sign*f):
       mode==='cube-previous-sum'?mod(c+sign*f):pow(mod(c+sign*f),19);
   }
   history.push(c);
   out.push(enc?c:p);
 }
 return out;
}
const output=[];
for(const scope of ['carry-p7','p8-red-as-iv']){
 const data=scope==='carry-p7'?chapter:chapter.slice(12);
 const iv=scope==='carry-p7'?P(7).slice(-5):P(8).slice(7,12);
 for(const mode of modes)for(const sign of [-1,1])for(const reverse of [false,true]){
   const weights=reverse?w.slice().reverse():w;
   const plain=transform(data,iv,weights,sign,mode,false);
   assert.deepEqual(transform(plain,iv,weights,sign,mode,true),data);
   const planted=transform(native,iv,weights,sign,mode,true);
   assert.deepEqual(transform(planted,iv,weights,sign,mode,false),native);
   output.push({scope,mode,sign,reverse,ioc:ioc(plain),
     first24:plain.slice(0,24).map(x=>gp.translit[x]).join(' ')});
 }
}
assert.equal(output.length,32);
const top=Math.max(...output.map(x=>x.ioc));
assert.ok(Math.abs(top-0.03478447721868774)<1e-12);
assert.ok(output.every(x=>x.ioc<0.04));
console.log(JSON.stringify({
 source:'canonical original p7 red14, p8 red12, p8-p14 ciphertext',
 p7Products:w,p7CubeOrbit:orbit,originalRunes:chapter.length,
 variants:output.length,originalIoC:ioc(chapter),knownP57IoC:ioc(native),
 recoveredUnknownPlaintextRunes:0,maxCandidateIoC:top,
 exactOriginalReplays:32,exactNativeP57PlantedDecryptions:32,
 outputs:output
},null,2));
