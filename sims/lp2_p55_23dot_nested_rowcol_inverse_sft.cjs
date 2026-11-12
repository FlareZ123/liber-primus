"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * An original-source-constrained, potentially reversible 23-dot transfer:
 *  - p55: remove two rune pairs from both ends of each complete p55 word
 *    to yield 23 source GP29 symbols;
 *  - next strict nestings yield nine row and five column GP29 key symbols;
 *  - p57's unique 23-dot punctuation stencil occupies nine rows, five cols;
 *  - invert the natural GP29 row-plus-column additive cipher.
 *
 * This is a candidate construction, not an established Cicada algorithm.
 * Its rank-22 unanchored and rank-23 center-anchored properties are exact.
 * Reproduction: node sims/lp2_p55_23dot_nested_rowcol_inverse_sft.cjs
 */
function main() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"));
  const annotations = JSON.parse(fs.readFileSync(
    path.join(__dirname, "../resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
  assert.equal(annotations.counts.red23, 1);
  const terminal = annotations.pages.find((page) => page.page === 57);
  assert.deepEqual(terminal.large_punctuation.filter((event) => event[1] === 23),
    [[95, 23, "red"]]);

  const original = corpus.pages.find((page) => page.page === 55).indices;
  assert.equal(original.length, 76);
  const lengths = [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
  assert.equal(lengths.reduce((a,b) => a+b,0), 75);
  let at = 1;
  const words = lengths.map((len) => {
    const result = original.slice(at, at+len).map((value, j) =>
      ({ value, pagePosition:at+j }));
    at += len;
    return result;
  });
  assert.equal(at, original.length);

  /** @param {number} level */
  const peel = level => words.flatMap((word) =>
    word.slice(level,word.length-level));
  const layers = Array.from({length:7}, (_, i) => peel(i));
  assert.deepEqual(layers.map((layer) => layer.length), [75,43,23,9,5,3,1]);

  const activeWordsByPeel = Array.from({length:7},(_,depth) =>
    words.filter(word => word.length > 2*depth).length);
  assert.deepEqual(activeWordsByPeel,[16,11,7,3,1,1,1]);
  const primeSum = (items) => items.reduce((sum,item) =>
    sum + corpus.prime[item.value],0);
  const sourceNineSum = primeSum(layers[3]);
  const sourceFiveSum = primeSum(layers[4]);
  assert.equal(sourceNineSum,253);
  assert.equal(sourceFiveSum,161);
  assert.equal(sourceNineSum,23*activeWordsByPeel[1]);
  assert.equal(sourceFiveSum,23*activeWordsByPeel[2]);

  // Source-word-position permutation control: only shuffle the rune values
  // independently inside each complete original word, retaining every word's
  // original rune multiset, position span and all seven layer lengths.
  let seed=0x55323>>>0;
  /** @returns {number} */
  function random() {
    seed^=seed<<13;
    seed^=seed>>>17;
    seed^=seed<<5;
    return (seed>>>0)/4294967296;
  }
  const trials=120000;
  let bothMod23=0, bothExactSourceQuotients=0;
  for(let t=0;t<trials;t++) {
    const shuffle=words.map(word => {
      const result=word.map(item => item.value);
      for(let i=result.length-1;i>0;i--) {
        const j=Math.floor(random()*(i+1));
        [result[i],result[j]]=[result[j],result[i]];
      }
      return result;
    });
    const totalAt=depth => shuffle.reduce((sum,word) =>
      sum+word.slice(depth,word.length-depth).reduce((s,v)=>
        s+corpus.prime[v],0),0);
    const a=totalAt(3), b=totalAt(4);
    if(a%23===0 && b%23===0) bothMod23++;
    if(a===253 && b===161) bothExactSourceQuotients++;
  }
  assert.equal(bothMod23,212);
  assert.equal(bothExactSourceQuotients,1);

  const core23 = layers[2];
  const at23 = new Map(core23.map((item,i) => [item.pagePosition,i]));
  const row9 = layers[3].map((item) => at23.get(item.pagePosition));
  const col5 = layers[4].map((item) => at23.get(item.pagePosition));
  const center = layers[6][0];
  const anchorPosition = at23.get(center.pagePosition);
  assert.equal(anchorPosition, 8);
  assert.equal(center.value, 1);
  assert.deepEqual(row9,[5,6,7,8,9,10,11,16,19]);
  assert.deepEqual(col5,[6,7,8,9,10]);

  // Pixel-extracted original 23-red-dot mark: nine physical rows and five
  // columns, checked separately in lp2_p55_p57_red_dot_core_sft.py.
  const originalStencil = [
    ".###.", "#...#", ".###.", "#...#", ".###.",
    "#...#", ".###.", "#...#", ".###."
  ];
  const cells = [];
  for(let row=0;row<originalStencil.length;row++)
    for(let col=0;col<5;col++)
      if(originalStencil[row][col] === "#") cells.push([row,col]);
  assert.equal(cells.length,23);
  const mod = x => (x%29+29)%29;

  // Decode y_i = x_i - x_(rowKey[row]) - x_(colKey[col]) mod29.
  // Both key streams are *subsets* of x and therefore this is a
  // coupled linear transform, rather than a key independent of x.
  const matrix = cells.map(([row,col],i) => {
    const values = Array(23).fill(0);
    values[i] = 1;
    values[row9[row]] = mod(values[row9[row]]-1);
    values[col5[col]] = mod(values[col5[col]]-1);
    return values;
  });
  const source = core23.map(item => item.value);
  /** @param {number[][]} a @param {number[]} x */
  const apply = (a,x) => a.map(row => mod(row.reduce((sum,v,i) =>
    sum+v*x[i],0)));
  const decoded = apply(matrix,source);
  const altered = matrix.map(row => row.slice());
  // Replace *only* the center output with the innermost source rune U.
  altered[anchorPosition] = Array.from({length:23},
    (_,i) => Number(i===anchorPosition));
  const anchoredText = apply(altered, source);

  /** @param {number[][]} a @param {number[]|null} target */
  function rref(a,target=null) {
    const size=a.length, cols=a[0].length;
    const m=a.map((row,i)=>row.concat(target===null?[]:[target[i]]));
    let rank=0,det=1;
    for(let col=0;col<cols;col++) {
      let pivot=rank;
      while(pivot<size && m[pivot][col]===0) pivot++;
      if(pivot===size) { det=0;continue; }
      if(pivot!==rank) {
        [m[pivot],m[rank]]=[m[rank],m[pivot]];
        det=mod(-det);
      }
      const d=m[rank][col];
      det=mod(det*d);
      let inv=1;
      while(mod(inv*d)!==1) inv++;
      for(let k=col;k<m[rank].length;k++)m[rank][k]=mod(m[rank][k]*inv);
      for(let i=0;i<size;i++)if(i!==rank) {
        const factor=m[i][col];
        for(let k=col;k<m[i].length;k++)
          m[i][k]=mod(m[i][k]-factor*m[rank][k]);
      }
      rank++;
    }
    return {rank, det:rank===cols?det:0,
      solution:target===null?null:m.slice(0,cols).map(row=>row[cols])};
  }
  const unanchored = rref(matrix);
  assert.equal(unanchored.rank,22);
  assert.equal(unanchored.det,0);
  const anchored = rref(altered);
  assert.equal(anchored.rank,23);
  assert.ok(anchored.det!==0);
  assert.deepEqual(rref(altered,anchoredText).solution,source);

  // A native-register true-plaintext control from *solved* p57:
  // encode the first 23 authentic p57 GP symbols through the invertible
  // anchored transform, then recover the entire planted message exactly.
  const native = corpus.pages.find(p=>p.page===57).indices.slice(0,23);
  const syntheticCipher = rref(altered,native).solution;
  assert.equal(syntheticCipher.length,23);
  assert.deepEqual(apply(altered,syntheticCipher),native);
  assert.deepEqual(rref(altered,apply(altered,syntheticCipher)).solution,syntheticCipher);

  /** @param {number[]} indices */
  const gp = indices => indices.map(i=>corpus.translit[i]).join(" ");
  /** @param {number[]} values */
  function ioc(values){
    const counts=Array(29).fill(0);
    for(const v of values)counts[v]++;
    return counts.reduce((sum,n)=>sum+n*(n-1),0)/(values.length*(values.length-1));
  }
  assert.deepEqual(source,
    [6,23,24,17,0,14,10,19,1,5,13,8,21,23,27,10,6,14,12,2,2,10,19]);
  assert.equal(ioc(decoded),0.03162055335968379);
  assert.equal(anchoredText[8],1);
  console.log(JSON.stringify({
    inputs:{
      page:55,completeWords:16,
      nestedSurvivorCounts:layers.map(layer=>layer.length),
      activeWordsByPeel,
      nineRunesGpPrimeSum:sourceNineSum,
      fiveRunesGpPrimeSum:sourceFiveSum,
      checksumIdentities:["253=23*11","161=23*7"],
      wordPreservingNull:{trials,seed:"0x55323",bothMod23,
        bothExactSourceQuotients,moduloRate:bothMod23/trials,
        exactRate:bothExactSourceQuotients/trials,
        warning:"Postselected arithmetic equalities; conditional controls, not discovery probability"},
      p57UniqueRed23:{rows:9,columns:5,pattern:originalStencil},
      layer23:gp(source),
      rowKey9:gp(row9.map(i=>source[i])),
      colKey5:gp(col5.map(i=>source[i])),
      innermostAnchor:gp([center.value]),
      sourceAnchorIndexIn23:anchorPosition
    },
    original:{
      unanchoredRank:unanchored.rank,
      anchoredRank:anchored.rank,
      anchoredDeterminantModulo29:anchored.det,
      plain23Direct:gp(decoded),
      plain23DirectIoC:ioc(decoded),
      plain23WithCenterAnchor:gp(anchoredText),
      nativeTextRecovered:false
    },
    controls:{
      originalCipherRecovered23Of23:true,
      solvedP57NativePlantRecovered23Of23:true
    },
    decision:"Reversible source-led candidate with no recognizable original plaintext; Cicada cipher not authenticated"
  },null,2));
}
if(require.main===module)main();
module.exports={main};
