'use strict';
/**
 * One source-shaped composite: original physical p50 32x8 numeral packet
 * becomes a 256-rune GP29 pad after 4-point Fourier butterflies made from
 * the previously recovered p28 two-symbol H and 2014 HTML 12/17 roots.
 *
 * The untouched p8 second-red-word length8 plus black248 extending into p9
 * exactly gives the same 256 positions as the table. An independent p8 first
 * four-rune red word may indicate an IV, but no IV algorithm is supplied:
 * this test deliberately excludes invented feedback.
 *
 * Windows Node22 CJS original-input SFT, deterministic and read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} rel @returns {string} */
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const html = read('resources/historical/cicada2014-onion7-original-index.html');
const p8 = gp.pages[8].indices;
const p9 = gp.pages[9].indices;
const title = p8.slice(0,12);
const body248 = p8.slice(12).concat(p9.slice(0,5));
const section1716 = gp.pages.slice(8,15).flatMap((p,j)=>
  j ? p.indices : p.indices.slice(12)).slice(0,1716);
assert.deepEqual(title, [14,10,14,19,1,14,19,5,2,13,3,17]);
assert.equal(p8.length,255);
assert.equal(body248.length,248);
assert.equal(title.length+body248.length,260);
assert.equal(title.slice(4).length+body248.length,256);
assert.deepEqual(section1716.slice(0,248),body248);
assert.equal(table.bytes.length,256);
assert(table.bytes.every(x=>Number.isInteger(x)&&x>=0&&x<256));
const titleNum=Number(html.match(/<title>(\d+)<\/title>/)[1]);
const idNum=Number(html.match(/<div id="(\d+)"/)[1]);
assert.deepEqual([titleNum,idNum],[133,331]);
/** @param {number} a @returns {number} */
const mod=a=>(a%29+29)%29;
assert.deepEqual([mod(titleNum),mod(idNum)],[17,12]);
assert.equal(mod(12*17),1);
assert.equal(mod(12*12),28);
assert.equal(mod(17*17),28);
const H=(a,b)=>[mod(a-b),mod(a+b)];
assert.deepEqual(H(28,20),[8,19]);
assert.deepEqual(H(23,8),[15,2]);
/** @param {number[]} v @param {12|17} omega
 * @param {boolean} inverse @returns {number[]} */
function fft4(v,omega,inverse){
  assert.equal(v.length,4);
  const [d0,s0]=H(v[0],v[2]), [d1,s1]=H(v[1],v[3]);
  // The H butterflies implement the exact four-point GP29 transform.
  const output=[mod(s0+s1),mod(d0+omega*d1),
    mod(s0-s1),mod(d0-omega*d1)];
  if(!inverse) return output;
  // Inverse is 1/4*forward with conjugate omega=omega^-1.
  const conj=omega===12?17:12;
  const [di0,si0]=H(v[0],v[2]), [di1,si1]=H(v[1],v[3]);
  return [mod(22*(si0+si1)),mod(22*(di0+conj*di1)),
    mod(22*(si0-si1)),mod(22*(di0-conj*di1))];
}
for(const omega of [12,17]){
  for(let i=0;i<29;i++)for(let j=0;j<4;j++){
    const source=[0,0,0,0];source[j]=i;
    assert.deepEqual(fft4(fft4(source,omega,false),omega,true),source);
    assert.deepEqual(fft4(fft4(source,omega,true),omega,false),source);
  }
}
/** @param {number[]} xs @returns {number} */
function ioc(xs){
 const counts=Array(29).fill(0);
 for(const v of xs)counts[v]++;
 return counts.reduce((s,x)=>s+x*(x-1),0)/(xs.length*(xs.length-1));
}
/** @param {number[]} source @returns {string} */
const translit=source=>source.map(x=>gp.translit[x]).join('');
const scenarios=[];
const nativePlant=Array.from({length:248},(_,i)=>gp.pages[57].indices[i%95]);
for(const layout of ['rows','columns']){
 const ordered=layout==='rows'?table.bytes:
   Array.from({length:256},(_,i)=>table.bytes[(i%32)*8+Math.floor(i/32)]);
 for(const omega of [12,17])for(const inverse of [false,true]){
  const pad=ordered.flatMap((_,i)=>i%4?[]:
    fft4(ordered.slice(i,i+4).map(x=>mod(x)),omega,inverse));
  assert.equal(pad.length,256);
  for(const offset of [0,8])for(const sign of [-1,1]){
   /** @param {number[]} cipher @returns {number[]} */
   const decrypt=cipher=>cipher.map((c,i)=>mod(c+sign*pad[(i+offset)%256]));
   const plantedCipher=nativePlant.map((p,i)=>mod(p-sign*pad[(i+offset)%256]));
   assert.deepEqual(decrypt(plantedCipher),nativePlant);
   const original=decrypt(body248),cont=decrypt(section1716);
   assert.deepEqual(original.map((p,i)=>mod(p-sign*pad[(i+offset)%256])),body248);
   assert(ioc(original)<0.04 && ioc(cont)<0.04,
     'Unexpected original native-language concentration');
   scenarios.push({layout,omega,inverse,offset,sign,
     ioc248:ioc(original),ioc1716:ioc(cont),
     first40:translit(original.slice(0,40)),
     originalExactForwardReplay:true,solvedGPPlantExact:true});
  }
 }
}
assert.equal(scenarios.length,32);
const sorted=scenarios.slice().sort((a,b)=>b.ioc248-a.ioc248);
console.log(JSON.stringify({
 status:'PASS: all 32 original p8/p50 source-shaped Fourier-key variants remain nonlinguistic',
 source:'p28 H(x,y)=(x-y,x+y), archived 2014 HTML 133/331, p50 256 base60-byte cells',
 original:{titleRed4PlusRed8:12,p8BlackCarryIntoP9:248,wholeCodeword:256,
   p8toP14Receiver:1716},
 maxOriginal248IoC:sorted[0].ioc248,maxOriginal1716IoC:Math.max(...sorted.map(x=>x.ioc1716)),
 candidateCount:scenarios.length,highest248:sorted.slice(0,4),
 positive:'Every four-point inverse exact on 29*4 basis sources; all 32 248-rune native GP plants recover and all original ciphertext replays exact',
 interpretation:'No p50-derived key or unknown LP2 plaintext is established; no first-party source actually specifies the composite Fourier or pad operation.'
},null,2));
