"use strict";
/**
 * Transfer the three authentic 2014 submission magic squares to LP2 whole-word
 * order, using numerical rank as a completely fixed route.
 * No rune decryption or key fitting; evaluate native syntax and matched null.
 *
 * Run: node sims/lp2_2014_three_squares_wordrank_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root,file),"utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const symbols = new Set(corpus.runes);
const originalText = read("resources/liber-primus/lp2-transcription.txt").split("%").slice(0,55).join("%");
const matrixText = read("resources/cicada2014-openpuff-magic-squares.txt");
const matrices = matrixText.trim().split(/\r?\n\s*\r?\n/)
  .map(group => group.trim().split(/\r?\n/).map(line => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(matrices.map(m=>[m.length,m[0].length]),[[5,5],[7,7],[5,5]]);
for(const matrix of matrices) {
  assert.ok(matrix.every(row=>row.length===matrix.length));
  assert.ok(matrix.flat().every(Number.isInteger));
}
/** @typedef {{length:number, page:number, section:number}} Word */
/** @returns {Word[]} */
function wordsFromOriginal() {
  /** @type {Word[]} */
  const words=[];
  let page=0,section=0,length=0,firstPage=0,firstSection=0;
  function end() {if(length) words.push({length,page:firstPage,section:firstSection});length=0;}
  for(const ch of originalText) {
    if(symbols.has(ch)){if(!length){firstPage=page;firstSection=section;}length++;}
    else if(ch==="%")page++;
    else if(ch==="$"){end();section++;}
    else if(ch!=="/" && !/\s/u.test(ch))end();
  }
  end();
  assert.equal(words.length,2896);
  assert.equal(words.reduce((s,w)=>s+w.length,0),12956);
  assert.equal(section,8);
  return words;
}
const words=wordsFromOriginal();
const original=words.map(w=>w.length);
/**
 * For duplicate values, retain first printed row-major position.
 * This tie rule is an unverified assumption, not an authored instruction.
 * @param {number[][]} square
 */
function rankOrder(square) {
  const values=square.flat();
  return values.map((n,i)=>({n,i})).sort((a,b)=>a.n-b.n||a.i-b.i).map(v=>v.i);
}
const orders=matrices.map(rankOrder);
orders.forEach((order,i)=>{
  assert.equal(order.length,matrices[i].length**2);
  assert.equal(new Set(order).size,order.length);
});
const tokens=corpus.translit.slice().sort((a,b)=>b.length-a.length);
/** @param {string} raw */
function gpLengths(raw) {
  return (raw.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{
    const letters=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C")
      .replace(/Z/g,"S").replace(/ING/g,"NG");
    let count=0;
    for(let i=0;i<letters.length;){
      const token=tokens.find(x=>letters.startsWith(x,i));
      assert.ok(token);
      i+=token.length;
      count++;
    }
    return count;
  });
}
const references={
  LP1:gpLengths(read("resources/liber-primus/lp1-plaintext-reference.txt")),
  Shakespeare:gpLengths(read("resources/control/shakespeare_first300k.txt")),
  Gibran:gpLengths(read("resources/control/gibran_prophet_58585.txt"))
};
/** @param {number} n */
const category=n=>n<=4?n-1:n<=6?4:n<=8?5:6;
/** @param {number[]} text */
function bigramModel(text) {
  const counts=Array.from({length:7},()=>Array(7).fill(1));
  const rows=Array(7).fill(7),cols=Array(7).fill(7);
  let total=49;
  for(let i=1;i<text.length;i++){
    const a=category(text[i-1]),b=category(text[i]);
    counts[a][b]++;rows[a]++;cols[b]++;total++;
  }
  return counts.map((line,a)=>line.map((v,b)=>Math.log2((v/rows[a])/(cols[b]/total))));
}
const models=Object.fromEntries(Object.entries(references).map(([k,v])=>[k,bigramModel(v)]));
/** @param {number[]} source @param {number[][]} model */
function grammarScore(source,model) {
  let sum=0;
  for(let i=1;i<source.length;i++)sum+=model[category(source[i-1])][category(source[i])];
  return sum/(source.length-1);
}
/**
 * @param {number[]} input
 * @param {number[]} route
 * @param {boolean} reverse
 * @param {"book"|"section"|"page"} mode
 */
function transform(input,route,reverse,mode) {
  assert.equal(input.length,words.length);
  const output=input.slice();
  let queue=[];
  function flush() {
    for(let at=0;at+route.length<=queue.length;at+=route.length) {
      const block=queue.slice(at,at+route.length);
      for(let i=0;i<route.length;i++){
        if(reverse) output[block[route[i]]]=input[block[i]];
        else output[block[i]]=input[block[route[i]]];
      }
    }
    queue=[];
  }
  for(let i=0;i<words.length;i++) {
    const previous=queue.length?words[queue[queue.length-1]]:null;
    if(previous && ((mode==="section"&&previous.section!==words[i].section)
        || (mode==="page"&&previous.page!==words[i].page)))flush();
    queue.push(i);
  }
  flush();
  return output;
}
const variants=[];
for(let square=0;square<3;square++)
  for(const reset of ["book","section","page"])
    for(const inverse of [false,true]){
      const perm=transform(original,orders[square],inverse,reset);
      variants.push({
        square:square+1,dimension:matrices[square].length,reset,
        direction:inverse?"rank-fill":"rank-read",
        LP1:grammarScore(perm,models.LP1),
        Shakespeare:grammarScore(perm,models.Shakespeare),
        Gibran:grammarScore(perm,models.Gibran)
      });
    }
const baselines=Object.fromEntries(Object.entries(models).map(([k,m])=>[k,grammarScore(original,m)]));
let state=0x33011033;
/** @param {number} n */
function randomIndex(n){state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n;}
const trials=400;
let exceed=0,bestNull=-Infinity;
const best=Math.max(...variants.map(v=>v.LP1));
for(let t=0;t<trials;t++){
  const shuffle=original.slice();
  for(let i=shuffle.length-1;i>0;i--){
    const j=randomIndex(i+1);[shuffle[i],shuffle[j]]=[shuffle[j],shuffle[i]];
  }
  let max=-Infinity;
  for(let sq=0;sq<3;sq++)for(const reset of ["book","section","page"])
    for(const inverse of [false,true]){
      max=Math.max(max,grammarScore(transform(shuffle,orders[sq],inverse,reset),models.LP1));
    }
  if(max>=best)exceed++;
  bestNull=Math.max(bestNull,max);
}
const plant=references.Gibran.slice(0,words.length);
assert.equal(plant.length,words.length);
let check=0;
for(let sq=0;sq<3;sq++)for(const reset of ["book","section","page"]){
  const enc=transform(plant,orders[sq],false,reset);
  const dec=transform(enc,orders[sq],true,reset);
  assert.deepEqual(dec,plant);
  check++;
}
variants.sort((a,b)=>b.LP1-a.LP1);
console.log(JSON.stringify({
  source:"2014 OpenPuff 5x5/7x7/5x5 magic-square integers, ascending numerical rank",
  weakness:"Original Cicada never instructed applying numerical rank of the 2014 squares to LP2 words; repeated square values require the assumed stable row-major tie rule.",
  originalWords:words.length,
  originalRunes:12956,
  originalBaseline:baselines,
  rankOrders:orders,
  candidateCount:variants.length,
  candidateBest:variants[0],
  controls:{sourceNativePositiveInversions:check,exactRankReadToFill:true,
    matchedOriginalWordMultisetShuffles:trials,
    nullBestEqualsOrBeatsOriginal:exceed,
    plusOneTail:(exceed+1)/(trials+1),
    greatestNullBest:bestNull},
  candidates:variants,
  result:"No plaintext is claimed without a full original-cipher inverse and source-selected rank-order rule."
},null,2));
