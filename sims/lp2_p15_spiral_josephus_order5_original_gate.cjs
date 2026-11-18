"use strict";
/**
 * P15 Fibonacci-prime spiral -> one deterministic Josephus-ordered GP alphabet.
 *
 * Narrow hypothesis: the cipher's lag-five equality has a source-authored
 * 5-cycle g, made by partitioning Josephus-ordered 29 runes into five
 * consecutive 5-cycles and four fixed points. The 16 printed p15 values,
 * their Fibonacci prime ranks, and their recovered primes are three source
 * operands. Repetition of 16 source steps is an explicitly provisional
 * completion rule; no source text specifies it.
 *
 * An order-five g used as a progressive substitution yields a ciphertext
 * doublet at neighboring *within-word* positions only when p_prev=g(p_next).
 * Thus the GP plaintext bigram table determines the exact expected rate
 * independently of any unknown per-word base permutation.
 *
 * Standalone test: node sims/lp2_p15_spiral_josephus_order5_original_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} rel @returns {string} */
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const N = 29;
const source = [
  {name: "fibonacci_prime_indices", steps:
    [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]},
  {name: "prime_values", steps:
    [2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]},
  {name: "printed_3299_spiral", steps:
    [3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,
     1820,708,1206,4516]}
];
assert.equal(gp.translit.length, N);
const alphabet = gp.translit.map((s,i) => ({s, i}))
  .sort((a,b) => b.s.length-a.s.length);
/**
 * Historical GP transliteration is many-to-one for Latin spellings.
 * @param {string} word
 * @returns {number[]}
 */
function native(word) {
  const s = word.toUpperCase().replace(/ING/g,"NG").replace(/K/g,"C")
    .replace(/Q/g,"CW").replace(/V/g,"U").replace(/Z/g,"S")
    .replace(/[^A-Z]/g,"");
  const result=[];
  for(let i=0;i<s.length;) {
    const m=alphabet.find(x=>s.startsWith(x.s,i));
    if(!m)return [];
    result.push(m.i);i+=m.s.length;
  }
  return result;
}
/**
 * @param {string[]} tokens
 * @returns {{matrix:number[][],count:number}}
 */
function countBigram(tokens) {
  const matrix=Array.from({length:N},()=>Array(N).fill(0));
  let count=0;
  for(const word of tokens) {
    const a=native(word);
    for(let i=1;i<a.length;i++){matrix[a[i-1]][a[i]]++;count++;}
  }
  return {matrix,count};
}
const shakespeare=read("resources/control/shakespeare_first300k.txt")
  .match(/[A-Za-z]{2,}/g);
assert(shakespeare && shakespeare.length>1000);
const historical=read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\r?\n/).filter(line=>!/^\s*[#\[]/.test(line)&&!/\d/.test(line))
  .join("\n").match(/[A-Za-z]{2,}/g);
assert(historical && historical.length>100);
const prose=countBigram(shakespeare);
const solved=countBigram(historical);
assert.equal(prose.count,162527);
assert.equal(solved.count,2274);
/**
 * @param {number[]} steps
 * @param {number} direction
 * @param {number} start
 * @param {number} orientation
 * @returns {number[]}
 */
function sourceG(steps,direction,start,orientation) {
  const remaining=Array.from({length:N},(_,i)=>i);
  const order=[];
  let cursor=start;
  for(let t=0;t<N;t++) {
    cursor=((cursor+direction*(steps[t%16]-1))%remaining.length
      +remaining.length)%remaining.length;
    order.push(remaining.splice(cursor,1)[0]);
    if(direction<0&&remaining.length)
      cursor=(cursor-1+remaining.length)%remaining.length;
  }
  const g=Array.from({length:N},(_,i)=>i);
  for(let base=0;base<25;base+=5)
    for(let j=0;j<5;j++)
      g[order[base+j]]=order[base+(j+orientation+5)%5];
  assert.equal(new Set(g).size,N);
  for(let i=0;i<N;i++){
    let x=i;for(let j=0;j<5;j++)x=g[x];
    assert.equal(x,i);
  }
  return g;
}
/**
 * @param {number[]} g
 * @param {{matrix:number[][],count:number}} sample
 * @returns {number}
 */
function rate(g,sample) {
  let hits=0;
  for(let i=0;i<N;i++)for(let j=0;j<N;j++)
    if(i===g[j])hits+=sample.matrix[i][j];
  return hits/sample.count;
}
const tested=[];
for(const {name,steps} of source)
 for(const direction of [-1,1])
  for(const start of [0,1,14,28])
   for(const orientation of [-1,1]){
    const g=sourceG(steps,direction,start,orientation);
    tested.push({source:name,direction,start,orientation,
      shakespeare:rate(g,prose),lp1:rate(g,solved)});
   }
assert.equal(tested.length,48);
const minProse=tested.reduce((a,b)=>a.shakespeare<b.shakespeare?a:b);
const minLP1=tested.reduce((a,b)=>a.lp1<b.lp1?a:b);
assert(Math.abs(minProse.shakespeare-0.018156983147415505)<1e-12);
assert(Math.abs(minLP1.lp1-0.01759014951627089)<1e-12);
const observation={observedWithinWordDoubletRate:0.0063,
  corpus:"LP2 12,956 original runes, within-word rate ~0.0063 from source transcription"};
const result={
  hypothesis:"p15 Fibonacci/prime/printed-source Josephus key, 5x5-cycles + 4 fixed points",
  scope:"48 source-completed candidate order-five g permutations, no fitted key",
  sourceSpiral:source,
  controls:{shakespeareWithinWordPairs:prose.count,lp1WithinWordPairs:solved.count},
  ...observation,
  tested:tested.length,
  lowestShakespearePredicted:minProse,
  lowestSolvedLP1Predicted:minLP1,
  survivorsProse:tested.filter(x=>x.shakespeare<=0.01).length,
  survivorsSolvedLP1:tested.filter(x=>x.lp1<=0.01).length,
  decision:"All 48 particular source-derived 5-cycle assignments are incompatible with observed LP2 adjacent-repeat suppression. This says nothing about other source alphabets, changing g per word, or an active collision preventer."
};
console.log(JSON.stringify(result,null,2));
