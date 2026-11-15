"use strict";
/**
 * Original 2013 GP chart: source-row-preserving 15x2 -> 5x6 SPARE board.
 *
 * The published diagram has left GP indices 0..14 and right indices 15..28
 * opposite them; bottom-right is blank. Consecutive triples of chart rows
 * form five rows of six cells without sorting or fitting ciphertext.
 *
 * Hypothesis only: use the single vacant cell for explicit SPACE and apply
 * lossless five-symbol mixed-radix Bifid (both independently frozen directions).
 * The 2013 chart itself prescribes neither Bifid nor the 5x6 refolding.
 *
 * Run: node sims/lp2_2013_gp_visual_fiveby6_source_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const source=JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
const raw=fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-transcription.txt"),"utf8")
 .split("%").slice(0,55).join("%");
const rune=new Map(source.runes.map((x,i)=>[x,i]));
const words=[];
let current=[],position=0;
function endWord(){
 if(current.length){words.push({start:position-current.length,end:position,runic:current});current=[];}
}
for(const c of raw){
 if(rune.has(c)){current.push(rune.get(c));position++;}
 else if(!("%/\r\n\t ".includes(c)))endWord();
}
endWord();
assert.equal(position,12956);
assert.equal(words.length,2896);
const first=source.pages.slice(0,23).reduce((n,p)=>n+p.indices.length,0)+16;
const last=first+1005;
const bodyWords=words.filter(w=>w.start>=first&&w.end<=last);
assert.equal(first,5522);
assert.equal(last,6527);
assert.equal(bodyWords.length,220);
assert.equal(bodyWords[0].start,first);
assert.equal(bodyWords.at(-1).end,last);
assert.equal(bodyWords.reduce((s,w)=>s+w.runic.length,0),1005);
// Physical table: 15 printed rows with the GP alphabet split 15+14.
// Fold each source-visible triple of rows into one six-cell matrix row.
const board=[];
for(let group=0;group<5;group++)for(let k=0;k<3;k++){
 const row=3*group+k;
 board.push(row,row<14?row+15:29);
}
assert.deepEqual(board,[0,15,1,16,2,17,3,18,4,19,5,20,6,21,7,22,8,23,9,24,10,25,11,26,12,27,13,28,14,29]);
const toCell=Array(30);
board.forEach((symbol,cell)=>toCell[symbol]=cell);
assert.equal(new Set(board).size,30);
function digits(value,base,length){
 const out=Array(length);
 for(let i=length-1;i>=0;i--){out[i]=value%base;value=Math.floor(value/base);}
 assert.equal(value,0);return out;
}
/**
 * Bijective fold on all 30^5 blocks; +1 encodes Bifid, -1 decodes it.
 * @param {number[]} cells exactly five indices 0..29
 * @param {number} direction +1 or -1
 * @returns {number[]} five indices 0..29
 */
function fold(cells,direction){
 if(direction===1){
  let r=0,c=0;
  for(const cell of cells){r=5*r+Math.floor(cell/6);c=6*c+cell%6;}
  return digits(7776*r+c,30,5);
 }
 let value=0;for(const cell of cells)value=30*value+cell;
 const rows=digits(Math.floor(value/7776),5,5),cols=digits(value%7776,6,5);
 return rows.map((r,i)=>6*r+cols[i]);
}
/** @param {number[]} input GP indices or SPACE=29 */
function transform(input,direction){
 assert.equal(input.length%5,0);
 const out=[];
 for(let i=0;i<input.length;i+=5){
  const mapped=input.slice(i,i+5).map(x=>toCell[x]);
  out.push(...fold(mapped,direction).map(cell=>board[cell]));
 }
 return out;
}
function stats(data){
 const hist=Array(29).fill(0),lengths=[];
 let currentLength=0,spaces=0;
 for(const x of data)if(x===29){spaces++;lengths.push(currentLength);currentLength=0;}
 else{hist[x]++;currentLength++;}
 if(currentLength)lengths.push(currentLength);
 const n=hist.reduce((a,b)=>a+b,0);
 return {symbols:data.length,spaceCount:spaces,words:lengths.length,
  maxRunicWord:Math.max(...lengths),wordsAtLeast40:lengths.filter(x=>x>=40).length,
  runicIoC:hist.reduce((s,v)=>s+v*(v-1),0)/(n*(n-1)),
  first30:data.slice(0,30).map(x=>x===29?"[SP]":source.translit[x]).join(" ")};
}
const original=bodyWords.flatMap(w=>[...w.runic,29]);
assert.equal(original.length,1225);
assert.deepEqual({spaces:stats(original).spaceCount,max:stats(original).maxRunicWord},{spaces:220,max:14});
for(let i=0;i<30;i++){
 const block=[i,(i+1)%30,(i+5)%30,(i+13)%30,(i+21)%30];
 assert.deepEqual(fold(fold(block,1),-1),block);
}
const observed=[];
for(const direction of [-1,1]){
 const decoded=transform(original,direction);
 assert.deepEqual(transform(decoded,-direction),original);
 observed.push({direction,...stats(decoded)});
}
assert.deepEqual(observed.map(x=>[x.spaceCount,x.maxRunicWord,x.wordsAtLeast40]),
 [[49,91,12],[51,104,9]]);
const sourceTokens=source.translit.map((s,i)=>({s,i}))
 .concat([{s:"ING",i:21},{s:"IO",i:27}]).sort((a,b)=>b.s.length-a.s.length);
function nativeWord(word){
 const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
  .replace(/[KQ]/g,"C").replace(/Z/g,"S");
 const symbols=[];
 for(let i=0;i<s.length;){
  const token=sourceTokens.find(t=>s.startsWith(t.s,i));
  assert(token,"unknown token in "+word);symbols.push(token.i);i+=token.s.length;
 }
 return symbols;
}
const pools=new Map();
for(const name of ["shakespeare_first300k.txt","gibran_prophet_58585.txt","emerson_essays_2944.txt"]){
 const book=fs.readFileSync(path.join(__dirname,"../resources/control",name),"utf8");
 for(const match of book.matchAll(/[A-Za-z]+/g)){
  const word=nativeWord(match[0]);
  if(!pools.has(word.length))pools.set(word.length,[]);
  pools.get(word.length).push(word);
 }
}
const planted=bodyWords.flatMap((w,i)=>{
 const pool=pools.get(w.runic.length);
 assert(pool,"no source-native control word of length "+w.runic.length);
 return [...pool[(17*i+5)%pool.length],29];
});
assert.equal(planted.length,1225);
for(const direction of [-1,1]){
 const ciphertext=transform(planted,direction);
 assert.deepEqual(transform(ciphertext,-direction),planted);
 assert(stats(ciphertext).spaceCount<120);
}
console.log(JSON.stringify({
 decision:"One exact source-row-preserving 2013 GP chart fold fails direct English inverse; 2013 source does not fix 5x6 folding or Bifid",
 original:{pages:"p23-p26",redHeadingRunes:16,bodyRunes:1005,printedBodyWords:220,terminalSpaceHypothesis:true},
 sourceBoardSymbolIds:board,predeclaredDirections:observed,
 plantedNativeControls:"Both directions recover all 1225 authentic-register GP-plus-SPACE symbols",
 recoverableUnknownPlaintextRunes:0,
 caveat:"A conditional test of this one 2013 visual reflow and full30 mixed-radix operation; distinct boards, layers and alphabets are not excluded."
},null,2));
