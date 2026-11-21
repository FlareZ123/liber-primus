"use strict";
/** Frozen 2013 COUNT per original LP2 word, mod29 readout.
 * Precommit workplace/agent5-original-word-primesum-count-stream-precommit.md.
 * Node.js22/CJS, read-only, no dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..","resources","liber-primus");
const source=JSON.parse(fs.readFileSync(path.join(root,"lp2-corpus.json"),"utf8"));
const transcript=fs.readFileSync(path.join(root,"lp2-transcription.txt"),"utf8");
const index=new Map(source.runes.map((r,i)=>[r,i]));
const body=transcript.split(/^\s*%\s*$/m).slice(0,55).join("");
const words=body.split(/[.\-&$]+/).map(text=>[...text].flatMap(r=>index.has(r)?[index.get(r)]:[])).filter(word=>word.length>0);
assert.equal(words.length,2896);
assert.equal(words.reduce((sum,word)=>sum+word.length,0),12956);
assert.equal(words.filter(word=>word.length===1).length,83);
/** @param {number} x */
const m=x=>(x%29+29)%29;
/** @param {number[]} word */
const count=word=>m(word.reduce((sum,rune)=>sum+source.prime[rune],0));
const vals=words.map(count);
/** @param {number[]} symbols */
function ioc(symbols){
  const freq=Array(29).fill(0);
  for(const x of symbols)freq[x]++;
  return freq.reduce((sum,n)=>sum+n*(n-1),0)/(symbols.length*(symbols.length-1));
}
const observedIoc=ioc(vals);
assert.ok(Math.abs(observedIoc-0.03443806715712936)<1e-12);
const positiveSource=source.pages.find(p=>p.page===57).indices;
assert.equal(positiveSource.length,95);
const lookup=Array.from({length:29},(_,v)=>{
  for(let a=0;a<29;a++)if(m(source.prime[a])===v)return [a];
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)if(m(source.prime[a]+source.prime[b])===v)return [a,b];
  throw Error("No synthetic COUNT word for GP29 residue "+v);
});
const plantedWords=positiveSource.map(v=>lookup[v]);
assert.deepEqual(plantedWords.map(count),positiveSource);
console.log(JSON.stringify({
  verdict:"NEGATIVE: original 2896-word COUNT mod29 stream is not GP-native prose",
  printedWords:words.length,cipherRunes:12956,
  outputRunes:vals.length,originalIoc:observedIoc,
  first190:vals.slice(0,190).map(x=>source.translit[x]).join(""),
  sourceNativePlantRecoveredExactly:true,
  positiveControlWordLengths:[...new Set(plantedWords.map(x=>x.length))]
},null,2));
