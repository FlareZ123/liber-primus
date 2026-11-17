'use strict';
/**
 * Historical 2014 Stage05 14-column whole-word inverse on complete LP2 book.
 * Windows Node.js 22 single-file source test (SFT), read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root,name),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeSet=new Set(corpus.runes);
const source=read('resources/liber-primus/lp2-transcription.txt');
/** @type {Array<{page:number,length:number}>} */
const words=[];
let buffer='',page=0,firstPage=0;
function flush(){
  if(buffer){
    words.push({page:firstPage,length:[...buffer].length});
    buffer='';
  }
}
for(const c of source){
  if(runeSet.has(c)){
    if(!buffer)firstPage=page;
    buffer+=c;
  }else if(c==='%')page++;
  else if(c!=='/'&&!/\s/u.test(c))flush();
}
flush();
const original=words.filter(w=>w.page<55).map(w=>w.length);
assert.equal(original.length,2896);
assert.equal(original.reduce((a,b)=>a+b,0),12956);
assert.deepEqual(
  Array.from({length:14},(_,i)=>original.filter(v=>v===i+1).length),
  [83,448,720,513,317,256,216,156,78,52,32,18,4,3]
);
const key=[2,8,9,1,12,13,11,4,5,7,3,0,6,10];
const width=key.length;
assert.deepEqual([...key].sort((a,b)=>a-b),
  Array.from({length:width},(_,i)=>i));
/**
 * @template T
 * @param {T[]} plaintext
 * @param {number[]} order
 * @returns {T[]}
 */
function encode(plaintext,order){
  const cols=Array.from({length:width},()=>[]);
  plaintext.forEach((v,i)=>cols[i%width].push(v));
  return order.flatMap(i=>cols[i]);
}
/**
 * @template T
 * @param {T[]} ciphertext
 * @param {number[]} order
 * @returns {T[]}
 */
function decode(ciphertext,order){
  const lengths=Array.from({length:width},(_,i)=>
    Math.floor(ciphertext.length/width)+Number(i<ciphertext.length%width));
  const cols=Array(width);
  let at=0;
  for(const i of order){
    cols[i]=ciphertext.slice(at,at+lengths[i]);
    at+=lengths[i];
  }
  assert.equal(at,ciphertext.length);
  const out=[];
  for(let row=0;row<Math.ceil(ciphertext.length/width);row++)
    for(let col=0;col<width;col++)
      if(row<cols[col].length)out.push(cols[col][row]);
  return out;
}
const historical=decode(original,key);
const reverse=decode(original,[...key].reverse());
assert.deepEqual(encode(historical,key),original);
assert.deepEqual(encode(reverse,[...key].reverse()),original);
const labels=['ING',...corpus.translit].sort((a,b)=>b.length-a.length);
/** @param {string} s @returns {number[]} */
function gpLengths(s){
  return (s.toUpperCase().match(/[A-Z]+/g)||[]).map(word=>{
    word=word.replace(/QU/g,'CW').replace(/V/g,'U')
      .replace(/K/g,'C').replace(/Z/g,'S');
    let n=0;
    for(let at=0;at<word.length;n++){
      const token=labels.find(t=>word.startsWith(t,at));
      assert.ok(token,'Unmapped native GP label in '+word);
      at+=token.length;
    }
    return n;
  });
}
/** @param {number} n */
const category=n=>n<=4?n-1:n<=6?4:n<=8?5:6;
/** @param {number[]} lengths @returns {number[][]} */
function model(lengths){
  const c=Array.from({length:7},()=>Array(7).fill(1));
  const row=Array(7).fill(7),col=Array(7).fill(7);
  let total=49;
  for(let i=1;i<lengths.length;i++){
    const x=category(lengths[i-1]),y=category(lengths[i]);
    c[x][y]++;row[x]++;col[y]++;total++;
  }
  return c.map((r,x)=>r.map((n,y)=>
    Math.log2((n/row[x])/(col[y]/total))));
}
/** @param {number[]} lengths @param {number[][]} weights */
function score(lengths,weights){
  let total=0;
  for(let i=1;i<lengths.length;i++)
    total+=weights[category(lengths[i-1])][category(lengths[i])];
  return total/(lengths.length-1);
}
const native={
  LP1:gpLengths(read('resources/liber-primus/lp1-plaintext-reference.txt')),
  Gibran:gpLengths(read('resources/control/gibran_prophet_58585.txt')),
  Emerson:gpLengths(read('resources/control/emerson_essays_2944.txt'))
};
assert.deepEqual(Object.fromEntries(Object.entries(native).map(([k,a])=>[k,a.length])),
  {LP1:942,Gibran:15733,Emerson:77932});
const trained=Object.fromEntries(Object.entries(native).map(([k,a])=>[k,model(a)]));
const results=Object.fromEntries(Object.entries(trained).map(([k,m])=>
  [k,{untransposed:score(original,m),historical:score(historical,m),
    reverse:score(reverse,m),geReverse:0,geFamily:0}]));
let seed=0x20143301;
/** @param {number} n @returns {number} */
function random(n){
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return (seed>>>0)%n;
}
const trials=1800;
for(let t=0;t<trials;t++){
  const shuffled=original.slice();
  for(let i=shuffled.length-1;i>0;i--){
    const j=random(i+1);
    [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }
  const f=decode(shuffled,key),b=decode(shuffled,[...key].reverse());
  for(const [k,m] of Object.entries(trained)){
    const x=score(f,m),y=score(b,m),r=results[k];
    r.geReverse+=Number(y>=r.reverse);
    r.geFamily+=Number(Math.max(x,y)>=Math.max(r.historical,r.reverse));
  }
}
for(const k of Object.keys(results)){
  const r=results[k];
  r.pReverse=(r.geReverse+1)/(trials+1);
  r.pBestOfTwo=(r.geFamily+1)/(trials+1);
  assert.ok(r.historical<0&&r.reverse<0,'No original prose score');
}
const planted=native.Gibran.slice(800,800+original.length);
assert.equal(planted.length,original.length);
const encoded=encode(planted,key);
assert.deepEqual(decode(encoded,key),planted);
assert.ok(score(planted,trained.Gibran)>0.04);
assert.ok(score(encoded,trained.Gibran)<0);
console.log(JSON.stringify({
  source:'Original complete 2896-word LP2; 2014 Stage05 column order',
  sourceRuneCount:12956,numberOfColumns:width,trials,
  positiveControl:{words:planted.length,exactRecovery:true,
    scrambledScore:score(encoded,trained.Gibran),
    restoredScore:score(planted,trained.Gibran)},
  results,conclusion:'No source-native prose order recovered'
},null,2));
