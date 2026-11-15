"use strict";
/**
 * Five-dot 5x6 *thirtieth cell as SPACE* lossless block inverse.
 * Test exactly four source-fixed orientations on original p23-26
 * (visible heading16, body1005 runes, 220 printed complete words).
 * This is a different candidate from 29-of-30 cycle-walking.
 * Run: node sims/lp2_fivedot_space30_wordshift_original_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const source=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const page=source.pages.filter(p=>p.page<56);
const rune=new Map(source.runes.map((x,i)=>[x,i]));
const raw=read("resources/liber-primus/lp2-transcription.txt")
 .split("%").slice(0,55).join("%");
const wordSpans=[];let now=[],offset=0;
/** Record complete source words; physical-page and line breaks join. */
function endWord(){
 if(now.length){wordSpans.push({from:offset-now.length,to:offset,runes:now});now=[];}
}
for(const ch of raw){
 if(rune.has(ch)){now.push(rune.get(ch));offset++;}
 else if(!("%/\r\n\t ".includes(ch)))endWord();
}
endWord();
assert.equal(offset,12956);assert.equal(wordSpans.length,2896);
const start=page.filter(p=>p.page<23).reduce((sum,p)=>sum+p.indices.length,0)+16;
const stop=start+1005;
const chapter=wordSpans.filter(x=>x.from>=start&&x.to<=stop);
assert.equal(chapter.length,220);
assert.equal(chapter.reduce((n,x)=>n+x.runes.length,0),1005);
assert.equal(chapter[0].from,start);
assert.equal(chapter.at(-1).to,stop);
/** Source terminal punctuation is treated as one explicit block-padding SPACE. */
const original=chapter.flatMap(w=>[...w.runes,29]);
assert.equal(original.length,1225);
const numbers=(v,b,n)=>{const a=Array(n);for(let i=n-1;i>=0;i--){a[i]=v%b;v=Math.floor(v/b);}assert.equal(v,0);return a;};
/** @param {number[]} x @param {number} sign */
function fold(x,sign){
 if(sign===1){let r=0,c=0;for(const z of x){r=r*5+Math.floor(z/6);c=c*6+z%6;}return numbers(7776*r+c,30,5);}
 let v=0;for(const z of x)v=v*30+z;
 const r=numbers(Math.floor(v/7776),5,5),c=numbers(v%7776,6,5);
 return r.map((n,i)=>6*n+c[i]);
}
const toCell=(x,m)=>m==="row"?x:6*(x%5)+Math.floor(x/5);
const fromCell=(x,m)=>m==="row"?x:5*(x%6)+Math.floor(x/6);
/** @param {number[]} s @param {number} sign @param {string} layout */
function transform(s,sign,layout){
 assert.equal(s.length%5,0);const out=[];
 for(let i=0;i<s.length;i+=5)
  out.push(...fold(s.slice(i,i+5).map(x=>toCell(x,layout)),sign)
   .map(x=>fromCell(x,layout)));
 return out;
}
/** @param {number[]} symbols */
function lengths(symbols){
 const w=[];let current=0,spaces=0;
 for(const z of symbols)if(z===29){w.push(current);current=0;spaces++;}else current++;
 if(current)w.push(current);
 return {spaces,words:w.length,maxRuneWord:Math.max(...w),
  wordsAtLeast20:w.filter(n=>n>=20).length,
  wordsAtLeast40:w.filter(n=>n>=40).length,
  wordsAtLeast60:w.filter(n=>n>=60).length};
}
assert.deepEqual(lengths(original),{spaces:220,words:220,maxRuneWord:14,
 wordsAtLeast20:0,wordsAtLeast40:0,wordsAtLeast60:0});
for(let i=0;i<30;i++){
 const x=[i,(i+1)%30,(i+5)%30,(i+13)%30,(i+21)%30];
 assert.deepEqual(fold(fold(x,1),-1),x);
}
const readings=[];
for(const layout of ["row","column"])for(const sign of [-1,1]){
 const p=transform(original,sign,layout);
 assert.deepEqual(transform(p,-sign,layout),original);
 readings.push({layout,sign,...lengths(p),
  first50:p.slice(0,50).map(i=>i===29?"[SP]":source.translit[i]).join(" ")});
}
assert.deepEqual(readings.map(x=>x.spaces),[53,71,59,61]);
assert.deepEqual(readings.map(x=>x.maxRuneWord),[88,94,81,72]);
assert(readings.every(x=>x.wordsAtLeast40>=5));
/** GP29 with fully explicit English word dividers as literal thirtieth symbol. */
const tokens=source.translit.map((s,i)=>({s,i}))
 .concat([{s:"ING",i:21},{s:"IO",i:27}]).sort((a,b)=>b.s.length-a.s.length);
function englishWord(x){
 const norm=x.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
  .replace(/[KQ]/g,"C").replace(/Z/g,"S"),r=[];
 for(let i=0;i<norm.length;){const t=tokens.find(z=>norm.startsWith(z.s,i));
  assert(t);r.push(t.i);i+=t.s.length;}return r;
}
const wordPool=new Map();
for(const file of ["resources/control/shakespeare_first300k.txt",
 "resources/control/gibran_prophet_58585.txt",
 "resources/control/emerson_essays_2944.txt"])
 for(const w of read(file).match(/[A-Za-z]+/g)||[]){
  const runes=englishWord(w);
  if(!wordPool.has(runes.length))wordPool.set(runes.length,[]);
  wordPool.get(runes.length).push(runes);
 }
const plant=chapter.flatMap((w,i)=>{
 const pool=wordPool.get(w.runes.length);
 assert(pool&&pool.length>0);
 return [...pool[(17*i+5)%pool.length],29];
});
assert.equal(plant.length,1225);
assert.equal(lengths(plant).spaces,220);
const cipherControls=[];
for(const layout of ["row","column"])for(const sign of [-1,1]){
 const encrypted=transform(plant,sign,layout);
 assert.deepEqual(transform(encrypted,-sign,layout),plant);
 cipherControls.push({layout,sign,plaintextSpaces:220,
  ciphertextSpaces:lengths(encrypted).spaces});
}
assert(cipherControls.every(x=>x.ciphertextSpaces<100));
console.log(JSON.stringify({
 decision:"direct 30-symbol five-dot inverse yields nonlinguistic 19-23-rune average words",
 original:{chapter:"p23-26",bodyRunes:1005,printedWords:220,
  terminalStopAsOneSpace:true,sourceSymbolLength:1225},
 fourUnfittedSourceVariants:readings,sourceEnglishPlantedCipherControls:cipherControls,
 originalForwardReconstructionSymbols:4*1225,
 recoverableOriginalUnknownPlaintextSymbols:0,
 limitations:"Only canonical row/column board, direct five-symbol mixed-radix fold, printed separators (one per word), and terminal SPACE padding; no unknown secret alphabet, hidden clock or different source language."
},null,2));
