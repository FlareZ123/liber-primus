'use strict';

/**
 * Source-led p57 circumference / p50 32x8 ring / p53-p55 moth glyph test.
 * Physically marked registers [p55 76, p53-black 68, p53-black 60,
 * p53-red51+p54 enlarged Ac 1] fit the original table's four concentric
 * perimeters [76,68,60,52]. Apply the table bytes modulo29 as a one-use
 * additive pad under source-natural corner, winding and black-half ordering.
 *
 * Attempts direct original GP29 plaintext recovery, with untouched original
 * page positions, fixed signs, all 16 ring traversals, and authentic English
 * held-out scoring. The source does not authenticate additive pad semantics.
 *
 * Run: node sims/lp2_p50_fourrings_moth256_additive_original_sft.cjs
 * Node.js 22, CommonJS, original repository resources only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} name */
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
/** @param {string} name */
const load=name=>JSON.parse(read(name));
const corpus=load('resources/liber-primus/lp2-corpus.json');
const marks=load('resources/liber-primus/lp2-ink-annotations.json');
const table=load('resources/liber-primus/base60-grid.json');
const p53=corpus.pages.find(x=>x.page===53).indices;
const p54=corpus.pages.find(x=>x.page===54).indices;
const p55=corpus.pages.find(x=>x.page===55).indices;
const red=marks.pages.find(x=>x.page===53).red_spans;
assert.deepEqual([p53.length,p54.length,p55.length],[179,232,76]);
assert.deepEqual(red.map(x=>[x.start,x.length]),[[128,51]]);
assert.equal(p54[0],24);
const black=p53.slice(0,128);
const groups=[p55,black.slice(0,68),black.slice(68),[...p53.slice(128),p54[0]]];
assert.deepEqual(groups.map(x=>x.length),[76,68,60,52]);
const bytes=table.byte_rows.flat();
assert.equal(bytes.length,256);
const MOD=29,mod=n=>(n%MOD+MOD)%MOD;
/** @param {number} depth */
function ring(depth){
 const a=[],top=depth,bottom=31-depth,left=depth,right=7-depth;
 for(let x=left;x<=right;x++)a.push(top*8+x);
 for(let y=top+1;y<=bottom;y++)a.push(y*8+right);
 for(let x=right-1;x>=left;x--)a.push(bottom*8+x);
 for(let y=bottom-1;y>top;y--)a.push(y*8+left);
 return a;
}
const rings=[0,1,2,3].map(ring);
assert.deepEqual(rings.map(x=>x.length),[76,68,60,52]);
assert.equal(new Set(rings.flat()).size,256);
const corners=[[0,0],[0,7],[31,7],[31,0]];
/** @param {number[]} a */
function ioc(a){
 const freq=Array(29).fill(0);
 for(const x of a)freq[x]++;
 return freq.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));
}
const runeMap=new Map(corpus.translit.map((x,i)=>[x,i]));
/** @param {string} text */
function encode(text){
 const out=[];
 for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){
  word=word.replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');
  for(let i=0;i<word.length;){
   let found,advance=0;
   for(const len of [3,2,1]){
    const rune=runeMap.get(word.slice(i,i+len));
    if(rune!==undefined){found=rune;advance=len;break;}
   }
   if(found!==undefined)out.push(found);
   i+=advance||1;
  }
 }
 return out;
}
const shakespeare=encode(read('resources/control/shakespeare_first300k.txt'));
const cutoff=Math.floor(shakespeare.length*.75);
const counts=new Float64Array(MOD**3).fill(.1);
const totals=new Float64Array(MOD**2).fill(2.9);
for(let i=2;i<cutoff;i++){
 const code=(shakespeare[i-2]*MOD+shakespeare[i-1])*MOD+shakespeare[i];
 counts[code]++;
 totals[Math.floor(code/MOD)]++;
}
/** @param {number[]} symbols */
function score(symbols){
 let sum=0;
 for(let i=2;i<symbols.length;i++){
  const k=(symbols[i-2]*MOD+symbols[i-1])*MOD+symbols[i];
  sum+=Math.log(counts[k]/totals[Math.floor(k/MOD)]);
 }
 return sum/(symbols.length-2);
}
const controlWindows=[];
for(let i=cutoff;i+256<=shakespeare.length;i+=256)
 controlWindows.push(score(shakespeare.slice(i,i+256)));
assert(controlWindows.length>=100);
const nativePositive=shakespeare.slice(cutoff,cutoff+256);
const results=[];
for(let corner=0;corner<4;corner++){
 for(const direction of [-1,1]){
  for(const reverseBlack of [false,true]){
   const streams=reverseBlack
    ?[groups[0],black.slice(60),black.slice(0,60),groups[3]]:groups;
   const key=[],cipher=[];
   for(let d=0;d<4;d++){
    const r=rings[d],[oy,ox]=corners[corner];
    const y=Math.max(d,Math.min(31-d,oy)),x=Math.max(d,Math.min(7-d,ox));
    const start=r.indexOf(8*y+x);
    assert(start>=0);
    for(let i=0;i<r.length;i++){
     const cell=r[(start+direction*i+r.length*2)%r.length];
     key.push(bytes[cell]%MOD);
    }
    cipher.push(...streams[d]);
   }
   assert.equal(cipher.length,256);
   assert.equal(key.length,256);
   for(const sign of [-1,1]){
    const plain=cipher.map((v,i)=>mod(v+sign*key[i]));
    const reconstructed=plain.map((v,i)=>mod(v-sign*key[i]));
    assert.deepEqual(reconstructed,cipher);
    const plantedCipher=nativePositive.map((v,i)=>mod(v-sign*key[i]));
    assert.deepEqual(plantedCipher.map((v,i)=>mod(v+sign*key[i])),nativePositive);
    const p55Decoded=plain.slice(0,76);
    results.push({
     corner,direction,reverseBlack,sign,
     score256:score(plain),ioc256:ioc(plain),
     scoreP55:score(p55Decoded),iocP55:ioc(p55Decoded),
     firstP55: p55Decoded.map(i=>corpus.translit[i]).join('').slice(0,85),
    });
   }
  }
 }
}
assert.equal(results.length,32);
const bestFull=[...results].sort((a,b)=>b.score256-a.score256);
const bestP55=[...results].sort((a,b)=>b.scoreP55-a.scoreP55);
const minNativeScore=Math.min(...controlWindows);
assert(bestFull[0].score256<minNativeScore);
assert(bestP55[0].scoreP55<0);
console.log(JSON.stringify({
 source:{
  markP53:[[128,51]],mothPages:[53,55],interveningEnlargedGP:p54[0],
  ringLengths:[76,68,60,52],originalCiphertextSymbols:256,
  tableBytes:256,testedNaturalReceiverModels:32,
  sourceChosenAdditiveOperation:false,
 },
 score:{
  minHeldoutNative256:minNativeScore,
  medianHeldoutNative256:controlWindows.sort((a,b)=>a-b)[Math.floor(controlWindows.length/2)],
  bestOriginalFull:bestFull.slice(0,4),
  bestOriginalP55:bestP55.slice(0,4),
  maxOriginalFullIoC:Math.max(...results.map(x=>x.ioc256)),
 },
 plantedNativeExact:32,
 originalReencryptedExact:32,
 newUnknownPlaintextRecovered:false
},null,2));
