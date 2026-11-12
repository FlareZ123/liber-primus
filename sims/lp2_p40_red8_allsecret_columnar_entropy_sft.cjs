'use strict';
/**
 * Key-independent GP29 column entropy gate selected by the original
 * eight-rune p40 red heading and matching 8-column table.
 * Standalone Node.js CommonJS, no third-party dependencies.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const p40=ink.pages.find(p=>p.page===40);
const p53=ink.pages.find(p=>p.page===53);
assert.deepEqual(p40.red_spans.map(s=>[s.start,s.length]),[[0,8]]);
assert.ok(p53.red_spans.some(s=>s.start===128&&s.length===51));
const chapter=corpus.pages.slice(40,54).flatMap(p=>p.indices);
assert.equal(chapter.length,3008);
const key=chapter.slice(0,8);
assert.deepEqual(key,[0,9,19,26,6,23,25,8]);
assert.equal(new Set(key).size,8);
const order=key.map((v,i)=>({v,i})).sort((a,b)=>a.v-b.v).map(x=>x.i);
assert.deepEqual(order,[0,4,7,1,2,5,6,3]);
const titles=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(titles.length,12956);
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} text */
function englishToGP(text){
 const out=[];
 for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){
  w=w.replace(/QU/g,'CW').replace(/V/g,'U')
   .replace(/K/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG');
  for(let i=0;i<w.length;){
   const token=tokens.find(t=>w.startsWith(t.s,i));
   assert.ok(token,'GP rune not found for '+w.slice(i));
   out.push(token.i);i+=token.s.length;
  }
 }
 return out;
}
/** @param {number[]} arr */
function entropy(arr){
 const count=Array(29).fill(0);
 for(const v of arr){assert.ok(v>=0&&v<29);count[v]++;}
 let h=0;
 for(const n of count)if(n){
  const p=n/arr.length;
  h-=p*Math.log2(p);
 }
 return h;
}
/** @param {number[]} body @param {'blocks'|'strides'} mode */
function columns(body,mode){
 if(mode==='strides')return Array.from({length:8},(_,k)=>
  body.filter((_,i)=>i%8===k));
 const size=Math.floor(body.length/8),extra=body.length%8;
 const out=[];let pos=0;
 for(const col of order){
  const n=size+(col<extra?1:0);
  out.push(body.slice(pos,pos+n));pos+=n;
 }
 assert.equal(pos,body.length);
 return out;
}
const bodies=[3000,2949].map(n=>({n,body:chapter.slice(8,8+n)}));
assert.equal(bodies[0].body.length,3000);
assert.equal(bodies[1].body.length,2949);
const observed=[];
for(const {n,body} of bodies)for(const mode of ['blocks','strides']){
 const hs=columns(body,mode).map(entropy);
 observed.push({n,mode,hs,min:Math.min(...hs),max:Math.max(...hs)});
}
assert.ok(Math.abs(observed[0].min-4.769160812557701)<1e-9);
assert.ok(Math.abs(observed[1].min-4.775167852124661)<1e-9);
assert.ok(Math.abs(observed[2].min-4.769002165779018)<1e-9);
assert.ok(Math.abs(observed[3].min-4.772322609369848)<1e-9);
const refs=[
 ['Shakespeare','resources/control/shakespeare_first300k.txt',217644,[4.366798716412871,4.3679373793455385],1691],
 ['Gibran','resources/control/gibran_prophet_58585.txt',62696,[4.331537994878476,4.331607728284799],471],
 ['Emerson','resources/control/emerson_essays_2944.txt',323083,[4.391099678683576,4.386410913610978],2521],
];
const native=[];
for(const [name,file,expectedLen,expectedMax,expectedWindows] of refs){
 const stream=englishToGP(read(file));
 assert.equal(stream.length,expectedLen);
 const per=[];
 for(const {n} of bodies){
  let count=0,upper=0;
  for(let start=0;start+n<=stream.length;start+=127){
   const sample=stream.slice(start,start+n);
   const hs=columns(sample,'strides').map(entropy);
   upper=Math.max(upper,...hs);count++;
  }
  per.push({n,count,max:upper});
 }
 assert.equal(per[0].count,expectedWindows);
 assert.equal(per[1].count,expectedWindows);
 per.forEach((x,i)=>assert.ok(Math.abs(x.max-expectedMax[i])<1e-9));
 native.push({name,per});
}
const minOriginal=Math.min(...observed.map(x=>x.min));
const maxNative=Math.max(...native.flatMap(x=>x.per.map(t=>t.max)));
assert.ok(minOriginal>maxNative+0.37);
// Positive known-native whole-column plant and exact inverse. Each column
// has a different independently secret affine alphabet over all 29 symbols.
const shakespeare=englishToGP(read(refs[0][1]));
const nativePlain=shakespeare.slice(0,3000);
const nRows=375;
const encrypted=[];
for(const col of order)for(let row=0;row<nRows;row++){
 const plain=nativePlain[row*8+col];
 encrypted.push((7*plain+3*col+5)%29);
}
assert.equal(encrypted.length,3000);
const recovered=Array(3000);let at=0;
for(const col of order)for(let row=0;row<nRows;row++){
 recovered[row*8+col]=((encrypted[at++]-3*col-5)*25%29+29)%29;
}
assert.deepEqual(recovered,nativePlain);
for(const col of order){
 const originalCol=nativePlain.filter((_,i)=>i%8===col);
 const encryptedCol=originalCol.map(v=>(7*v+3*col+5)%29);
 assert.ok(Math.abs(entropy(originalCol)-entropy(encryptedCol))<1e-12);
}
console.log('PASS source-selected p40 red8, two original body interpretations, all-secret entropy, 3 native-GP controls and exact cipher plant');
console.log(JSON.stringify({order,observed,native,minOriginal,maxNative,
 gap:minOriginal-maxNative,originalPositions:chapter.length,nativePlant:recovered.length},null,2));