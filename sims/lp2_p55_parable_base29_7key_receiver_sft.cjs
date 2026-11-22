#!/usr/bin/env node
'use strict';

// Test the seven-symbol BASE29 rendering of the 2013 Parable product as a
// p55 receiver, using the original p55/p56 seam and historical 7-position
// permutation. No key rotations or alternative ciphers are searched.

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const transcription=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const alphabet='0123456789ABCDEFGHIJKLMNOPQRS';
const mod=(x,m)=>((x%m)+m)%m;
function base29(n){let out='';do{out=alphabet[n%29]+out;n=Math.floor(n/29);}while(n);return out;}

const clauseSums=[1259,1031,1229];
const parableProduct=clauseSums.reduce((a,b)=>a*b,1);
assert.equal(parableProduct,1595277641);
assert.equal(base29(3301),'3QO'); // signed 2013 BASE29 control
const keyText=base29(parableProduct);
assert.equal(keyText,'2JMEKOO');
const key=[...keyText].map((c)=>alphabet.indexOf(c));
assert.deepEqual(key,[2,19,22,14,20,24,24]);

function parseSegment(segment){
 const indices=[],words=[];let word=[];
 for(const ch of segment){
  if(runeIndex.has(ch)){const x=runeIndex.get(ch);indices.push(x);word.push(x);}
  else if(ch==='/'||/\s/u.test(ch)){}
  else if(word.length){words.push(word);word=[];}
 }
 if(word.length)words.push(word);
 return {indices,words};
}
const p55=corpus.pages.find(p=>p.page===55).indices;
const p56=corpus.pages.find(p=>p.page===56).indices;
const p27=corpus.pages.find(p=>p.page===27).indices;
const matches=transcription.split('%').map(parseSegment).filter(s=>
 s.indices.length===p55.length&&s.indices.every((x,i)=>x===p55[i]));
assert.equal(matches.length,1);
const {indices:cipher,words}=matches[0];
const wordLengths=words.map(w=>w.length);
assert.equal(cipher.length,76);
assert.equal(corpus.translit[cipher[0]],'NG');
assert.deepEqual(cipher.map((x,i)=>x===0?i:-1).filter(i=>i>=0),[15,25,41]);
const stream=cipher.concat(p56.slice(0,1));
assert.equal(stream.length,77);
assert.equal(corpus.translit[p56[0]],'AE');
assert.deepEqual(p27.slice(28,35),stream.slice(70,77));
assert.equal(stream.slice(70,77).map(x=>corpus.translit[x]).join(''),'DJUBEIAE');

const render=a=>a.map(x=>corpus.translit[x]).join('');
function decodeTransparentF(input,sign,mask){
 const f=input.map((x,i)=>x===0?i:-1).filter(i=>i>=0);
 let clock=0,out=[];
 for(let i=0;i<input.length;i++){
  const fOrdinal=f.indexOf(i);
  if(fOrdinal>=0&&(mask&(1<<fOrdinal))){out.push(0);continue;}
  const value=mod(input[i]+sign*key[clock%7],29);
  clock++;
  if(value===0)return null;
  out.push(value);
 }
 return {plain:out,consumed:clock};
}
function transparentCandidates(input,sign){
 const count=input.filter(x=>x===0).length,items=[];
 for(let mask=0;mask<(1<<count);mask++){
  const d=decodeTransparentF(input,sign,mask);
  if(d)items.push({mask,consumed:d.consumed,compact:render(d.plain)});
 }
 return items;
}
const fTransparent=[];
for(const sign of [-1,1]){
 for(const [label,input] of [
  ['p55-full',cipher],
  ['p55-after-leading-carry',cipher.slice(1)],
  ['p55-plus-p56-first-rune',stream]
 ]){
  fTransparent.push({sign,input:label,runeCount:input.length,candidates:transparentCandidates(input,sign)});
 }
}
function addKey(input,sign){return input.map((x,i)=>mod(x+sign*key[i%7],29));}
const directAdditive=[-1,1].map(sign=>({sign,plain:render(addKey(stream,sign))}));

const order=[...key.keys()].sort((a,b)=>key[a]-key[b]||a-b);
const reverseOrder=order.slice().reverse();
function encryptColumnar(input,columns){
 const rows=input.length/columns.length;assert(Number.isInteger(rows));
 const out=[];
 for(const col of columns)for(let r=0;r<rows;r++)out.push(input[r*columns.length+col]);
 return out;
}
function decryptColumnar(input,columns){
 const rows=input.length/columns.length;assert(Number.isInteger(rows));
 const grid=Array.from({length:rows},()=>Array(columns.length));
 let offset=0;
 for(const col of columns)for(let r=0;r<rows;r++)grid[r][col]=input[offset++];
 return grid.flat();
}
assert.deepEqual(decryptColumnar(encryptColumnar(stream,order),order),stream);
const columnar=[
 {order,plain:render(decryptColumnar(stream,order))},
 {order:reverseOrder,plain:render(decryptColumnar(stream,reverseOrder))}
];

const stage05=[0,6,2,5,1,4,3];
const stage05Inverse=stage05.map((_,i)=>stage05.indexOf(i));
function permuteBlocks(input,perm){
 const out=[];
 for(let i=0;i<input.length;i+=7){const b=input.slice(i,i+7);assert.equal(b.length,7);out.push(...perm.map(j=>b[j]));}
 return out;
}
function unpermuteBlocks(input,perm){
 const out=[];
 for(let i=0;i<input.length;i+=7){
  const b=input.slice(i,i+7);assert.equal(b.length,7);const row=new Array(7);
  for(let j=0;j<7;j++)row[perm[j]]=b[j];
  out.push(...row);
 }
 return out;
}
assert.deepEqual(unpermuteBlocks(permuteBlocks(stream,stage05),stage05),stream);
const stage05Tests=[];
for(const perm of [stage05,stage05Inverse]){
 for(const sign of [-1,1]){
  stage05Tests.push({
   permutation:perm,sign,
   unpermuteThenAdd:render(addKey(unpermuteBlocks(stream,perm),sign)),
   addThenUnpermute:render(unpermuteBlocks(addKey(stream,sign),perm))
  });
 }
}
console.log(JSON.stringify({
 source:{
  clauseSums,product:parableProduct,base29Alphabet:alphabet,
  base29Control:'3301 -> 3QO',productBase29:keyText,keyDigits:key,
  p55Runes:cipher.length,p56FirstRune:'AE',combinedRunes:stream.length,
  p55WordLengths:wordLengths,p55CiphertextFPositions:[15,25,41],
  repeatedSevenRuneCrib:'DJUBEIAE',p27Offset:28,p55p56Offset:70
 },
 receiverTests:{
  repeatingAdditiveWithLiteralFTransparent:fTransparent,
  repeatingAdditiveWithoutFSkip:directAdditive,
  stableColumnar:{ascending:order,descending:reverseOrder,outputs:columnar},
  stage05SevenPermutation:{forward:stage05,inverse:stage05Inverse,outputs:stage05Tests}
 },
 conclusion:'The source-authenticated BASE29 conversion is exact; the tested 7-symbol additive, columnar and Stage05 block receivers yield no readable plaintext.'
},null,2));
