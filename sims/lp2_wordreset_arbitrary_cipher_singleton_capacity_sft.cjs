'use strict';
/** @typedef {{value:number,page:number,global:number}} Site */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus','lp2-corpus.json'),'utf8'));
const source=fs.readFileSync(path.join(root,'resources','liber-primus','lp2-transcription.txt'),'utf8');
const sections=source.split(/\r?\n%\r?\n/);
const ids=corpus.pages.filter(p=>p.runic_count>0).map(p=>p.page);
const runes=new Map(corpus.runes.map((r,i)=>[r,i]));
const sizes=[729,1145,1729,1903,1021,1433,1680,3008,308];
const chapterEnds=sizes.map((_,i)=>sizes.slice(0,i+1).reduce((a,b)=>a+b,0));
assert.equal(chapterEnds.at(-1),12956);
assert.equal(sections.length,57);
const words=[];
/** @type {Site[]} */
let token=[];
let global=0;
sections.forEach((part,k)=>{
 const page=ids[k];
 let count=0;
 for(const ch of part){
  if(runes.has(ch)){token.push({value:runes.get(ch),page,global:global++});count++;}
  else if('-.,;:!?&$§'.includes(ch)&&token.length){words.push(token);token=[];}
 }
 assert.equal(count,corpus.pages[page].runic_count);
});
if(token.length)words.push(token);
assert.equal(global,12956+85+95);
const unknown=words.filter(w=>w[0].page<=55&&w.at(-1).page<=55);
assert.equal(unknown.length,2896);
assert.equal(unknown.reduce((n,w)=>n+w.length,0),12956);
const singles=unknown.filter(w=>w.length===1).map(w=>w[0]);
assert.equal(singles.length,83);
assert.equal(new Set(singles.map(s=>s.value)).size,28);
/** @param {'book'|'chapter'|'page'} scope @param {Site} s */
function key(scope,s){
 if(scope==='book')return 0;
 if(scope==='page')return s.page;
 return chapterEnds.findIndex(x=>s.global<x);
}
/** @param {'book'|'chapter'|'page'} scope @param {Site[]} sites */
function bound(scope,sites){
 const groups=new Map();
 for(const s of sites){const k=key(scope,s);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(s.value);}
 let forced=0;
 const violating=[];
 for(const [k,a] of groups){
  const counts=new Map();
  for(const v of a)counts.set(v,(counts.get(v)||0)+1);
  const top=[...counts.values()].sort((x,y)=>y-x).slice(0,3).reduce((x,y)=>x+y,0);
  const minExceptions=a.length-top;
  forced+=minExceptions;
  if(minExceptions)violating.push({key:k,count:a.length,distinct:counts.size,minExceptions});
 }
 return {scope,scopeCount:groups.size,forced,violating};
}
const result=['book','chapter','page'].map(x=>bound(x,singles));
assert.deepEqual(result.map(x=>x.forced),[68,45,4]);
assert.deepEqual(result.map(x=>x.violating.length),[1,8,3]);
assert.deepEqual(result[2].violating,[
 {key:17,count:5,distinct:5,minExceptions:2},
 {key:19,count:4,distinct:4,minExceptions:1},
 {key:28,count:4,distinct:4,minExceptions:1}
]);
// Positive control: native GP A,I,O encrypt via a secret invertible map
// independently chosen in each scope. 7 inverse is 25 mod 29.
for(const scope of ['book','chapter','page']){
 const plant=singles.map((s,i)=>{
  const plain=[24,10,3][i%3], b=(13*key(scope,s)+5)%29;
  const value=(7*plain+b)%29;
  assert.equal(25*((value-b+29)%29)%29,plain);
  return {...s,value};
 });
 assert.equal(bound(scope,plant).forced,0);
}
console.log(JSON.stringify({originalWords:unknown.length,runes:12956,
 singletonWords:83,distinctCipherGlyphs:28,
 nativePlaintextWords:'A/I/O',results:result,plantedControls:'pass'},null,2));
