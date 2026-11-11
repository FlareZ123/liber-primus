"use strict";
/**
 * All-secret stationary first-difference capacity and all-29 zero-marker gate
 * for original unsolved LP2 ciphertext. Read-only Node.js 22 CommonJS SFT.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const ROOT=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const symbols=gp.translit.map((name,index)=>({name,index}))
  .sort((a,b)=>b.name.length-a.name.length);
const byRune=new Map(gp.runes.map((r,i)=>[r,i]));
const references=[
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"],
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["SolvedCicada","resources/liber-primus/lp1-plaintext-reference.txt"]
];
/** @param {string} text @returns {number[][]} */
function encodeWords(text){
 const clean=text.replace(/^#.*$/gm," ").toUpperCase().replace(/QU/g,"CW")
   .replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/Q/g,"C");
 return (clean.match(/[A-Z]+/g)||[]).map(word=>{
   const letters=[];
   for(let j=0;j<word.length;){
     const hit=symbols.find(x=>word.startsWith(x.name,j));
     assert.ok(hit,"Unmappable GP word "+word);
     letters.push(hit.index);j+=hit.name.length;
   }
   return letters;
 }).filter(w=>w.length);
}
/** @param {number[][]} words @returns {number[]} */
function roles(words){
 const out=[0,0,0];let previous=-1;
 for(const word of words)for(let j=0;j<word.length;j++){
   if(word[j]===previous)out[j===0?0:j===word.length-1?1:2]++;
   previous=word[j];
 }
 return out;
}
/**
 * Frequency-matched expected marker positions, preserving each original word
 * length; roles are start, terminal (nonsingleton), internal.
 * @param {number[][]} words @param {Map<number,number>} lengths
 * @param {number} marker
 */
function expected(words,lengths,marker){
 const groups=new Map();
 for(const word of words){
   let group=groups.get(word.length);
   if(!group){group={n:0,counts:[0,0,0]};groups.set(word.length,group);}
   group.n++;
   for(let j=0;j<word.length;j++)if(word[j]===marker)
     group.counts[j===0?0:j===word.length-1?1:2]++;
 }
 const e=[0,0,0],missing=[];
 for(const [length,n] of lengths){
   const group=groups.get(length);
   if(!group){missing.push(length);continue;}
   for(let k=0;k<3;k++)e[k]+=n*group.counts[k]/group.n;
 }
 return {e,missing};
}
/** @param {number[]} obs @param {number[]} exp */
function deviance(obs,exp){
 return 2*obs.reduce((sum,o,i)=>{
   const e=Math.max(exp[i],1e-100);
   return sum+(o===0?e:o*Math.log(o/e)-o+e);
 },0);
}
/** @param {number[]} seq @param {number} window @param {number} target */
function minimumWindow(seq,window,target){
 if(seq.length<window)return null;
 let count=0,min=Infinity,offset=-1;
 for(let i=0;i<seq.length;i++){
   if(seq[i]===target)count++;
   if(i>=window&&seq[i-window]===target)count--;
   if(i>=window-1&&count<min){min=count;offset=i-window+1;}
 }
 return {count:min,offset};
}
function main(){
 const parsed=parseSharedCorpus();
 assert.deepEqual([parsed.runeCount,parsed.words.length],[12956,2896]);
 const words=parsed.words.map(w=>[...w.runes].map(r=>{
   assert.ok(byRune.has(r));return byRune.get(r);
 }));
 const all=words.flat(),delta=Array(29).fill(0);
 for(let i=1;i<all.length;i++)delta[(all[i]-all[i-1]+29)%29]++;
 assert.equal(delta.reduce((a,b)=>a+b,0),12955);
 assert.deepEqual([delta[0],Math.max(...delta)],[86,510]);
 const observed=roles(words);
 assert.deepEqual(observed,[23,19,44]);
 const lengths=new Map();
 for(const word of words)lengths.set(word.length,(lengths.get(word.length)||0)+1);
 const original=references.map(([name,file])=>{
   const control=encodeWords(read(file)),text=control.flat();
   const candidate=gp.translit.map((glyph,symbol)=>{
     const {e,missing}=expected(control,lengths,symbol);
     return {glyph,e,missing,dev:deviance(observed,e)};
   }).sort((a,b)=>a.dev-b.dev);
   return {name,nativeRunes:text.length,
     minimumE:minimumWindow(text,12955,gp.translit.indexOf("E")),
     bestThree:candidate.slice(0,3).map(x=>({
       rune:x.glyph,expected:x.e.map(z=>+z.toFixed(2)),
       deviance:+x.dev.toFixed(2),missingLengths:x.missing
     }))};
 });
 assert.deepEqual(original.slice(0,3).map(x=>x.minimumE.count),
   [1407,1482,1397]);
 assert.deepEqual(original.map(x=>x.bestThree[0].rune),["G","G","P","B"]);
 // Full-length native-GP positive, keeping the 2,896 original word slots.
 const native=encodeWords(read(references[0][1]));
 const byLength=new Map();
 for(const w of native){
   if(!byLength.has(w.length))byLength.set(w.length,[]);
   byLength.get(w.length).push(w);
 }
 const seen=new Map();
 const plantedWords=words.map(w=>{
   const pool=byLength.get(w.length);
   assert.ok(pool?.length,"No native GP word of length "+w.length);
   const idx=(seen.get(w.length)||0)%pool.length;
   seen.set(w.length,idx+1);return pool[idx];
 });
 const planted=plantedWords.flat(),zeroGlyph=gp.translit.indexOf("EA");
 const nonzero=Array.from({length:29},(_,i)=>i).filter(i=>i!==zeroGlyph);
 const encrypted=[7],decoded=[planted[0]];
 for(let i=1;i<planted.length;i++){
   const step=planted[i]===zeroGlyph?0:nonzero.indexOf(planted[i])+1;
   encrypted.push((encrypted[i-1]+step)%29);
   const d=(encrypted[i]-encrypted[i-1]+29)%29;
   decoded.push(d===0?zeroGlyph:nonzero[d-1]);
 }
 assert.deepEqual(decoded,planted);
 let pos=0,previous=-1;
 const encryptedWords=plantedWords.map(w=>{
   const result=encrypted.slice(pos,pos+w.length);pos+=w.length;return result;
 });
 const actual=roles(encryptedWords),predicted=[0,0,0];
 pos=0;
 for(const w of plantedWords)for(let j=0;j<w.length;j++,pos++)
   if(pos>0&&w[j]===zeroGlyph)
     predicted[j===0?0:j===w.length-1?1:2]++;
 assert.deepEqual(actual,predicted);
 const output={original:{runes:all.length,words:words.length,
   differences:delta,maximumAnyFixedAlphabetSymbol:510,
   repeatRoles:observed},native:original,
   planted:{runes:decoded.length,recoveredExactly:true,
     marker:gp.translit[zeroGlyph],roles:actual}};
 console.log(JSON.stringify(output,null,2));
 return output;
}
if(require.main===module)main();
module.exports={main,encodeWords,roles,expected,deviance,minimumWindow};
