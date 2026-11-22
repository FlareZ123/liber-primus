'use strict';
/**
 * Single runnable test: fixed 2014 maxim key on original fourth numbered passage.
 * Historical connection is a conjecture; no plaintext has been recovered.
 * Node.js 22, CommonJS, read-only, no dependencies.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
/** @type {{translit:string[],pages:{page:number,indices:number[]}[]}} */
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
/** @param {number} n @returns {number[]} */
const page=(n)=>data.pages.find((entry)=>entry.page===n).indices;
const source=page(37).slice(189).concat(page(38).slice(0,57));
const start=data.pages.filter((p)=>p.page<37).reduce((sum,p)=>sum+p.indices.length,0)+189;
assert.equal(start,9133);
assert.equal(source.length,96);
const maxim='TOBELIEVETRUTHISTODESTROYPOSSIBILITY'.replace(/V/g,'U');
const labels=[...data.translit].sort((a,b)=>b.length-a.length);
const letterIndex=new Map(data.translit.map((value,index)=>[value,index]));
/** @type {number[]} */
const key=[];
for(let i=0;i<maxim.length;){
  const label=labels.find((token)=>maxim.startsWith(token,i));
  assert.ok(label);
  key.push(letterIndex.get(label));
  i+=label.length;
}
assert.equal(key.length,35);
/** @param {number[]} items @param {number} sign @returns {number[]} */
const apply=(items,sign)=>items.map((symbol,i)=>(symbol+sign*key[i%key.length]+29)%29);
/** @param {number[]} items @returns {number} */
const pairNumerator=(items)=>{
  /** @type {number[]} */
  const counts=Array(29).fill(0);
  items.forEach((value)=>counts[value]++);
  return counts.reduce((sum,count)=>sum+count*(count-1),0);
};
const minus=apply(source,-1),plus=apply(source,1);
assert.deepEqual(apply(minus,1),source);
assert.deepEqual(apply(plus,-1),source);
assert.equal(pairNumerator(minus),348);
assert.equal(pairNumerator(plus),288);
// The clear LP2 p57 is an independent native-GP plaintext positive control.
const solved=page(57);
assert.equal(solved.length,95);
const plant=solved.concat([solved[0]]);
assert.deepEqual(apply(apply(plant,1),-1),plant);
assert.deepEqual(apply(apply(plant,-1),1),plant);
for(const [label,text] of [['minus',minus],['plus',plus]]){
 const pairs=pairNumerator(text);
 console.log(label+': IoC='+(pairs/(96*95)).toFixed(12)+' pairs='+pairs);
 console.log('first64='+text.slice(0,64).map((x)=>data.translit[x]).join(' '));
}
console.log('PASS: 96/96 original forward reconstruction and p57 source-native plant');
