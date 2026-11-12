"use strict";
/**
 * Source-authentic LP1 p5 square -> LP2 p55 full Hill-5 inverse gate.
 * Usage: node sims/lp1_wisdom5_hill_p55_sft.cjs
 * - Original LP1 p5 moth is reused on LP2 p55.
 * - The actual 2014 Stage04 OOB Wisdom square is a 5x5 matrix.
 * - P55 contains 76 GP29 runes with its literal F at position25.
 * - Skip exactly F25 as in the independently solved p56 interruption,
 *   leaving fifteen 5-rune blocks, no fitted key or cipher phase.
 * - Standard Hill cipher column-vector multiplication over GF(29).
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const squareText = fs.readFileSync(
  path.join(root, "resources/cicada2014-openpuff-magic-squares.txt"), "utf8");
const matrices = squareText.trim().split(/\r?\n[ \t]*\r?\n/).map(chunk =>
  chunk.trim().split(/\r?\n/).map(row => row.trim().split(/\s+/).map(Number)));
const source = matrices[2];
assert.deepEqual(source, [
  [272,138,341,131,151],
  [366,199,130,320,18],
  [226,245,91,245,226],
  [18,320,130,199,366],
  [151,131,341,138,272]
]);
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const cipher = corpus.pages.find(p => p.page === 55).indices;
const plantedNative = corpus.pages.find(p => p.page === 57).indices.slice(0,75);
assert.equal(cipher.length,76);
assert.equal(plantedNative.length,75);
assert.equal(cipher[25],0);
const mod = x => (x % 29 + 29) % 29;
const key = source.map(row => row.map(mod));
/**
 * Exact Gauss-Jordan inverse over the GP29 prime field.
 * @param {number[][]} input square matrix 5x5
 * @returns {{inverse:number[][], determinant:number}}
 */
function inverseMatrix(input) {
  const m = input.map((row,i) => [...row,...Array.from({length:5},(_,j)=>Number(i===j))]);
  let det=1;
  for(let i=0;i<5;i++){
    let pivot=i;
    while(pivot<5 && m[pivot][i]===0)pivot++;
    assert.ok(pivot<5, "Source square is singular");
    if(pivot!==i){[m[pivot],m[i]]=[m[i],m[pivot]];det=mod(-det);}
    const x=m[i][i];
    det=mod(det*x);
    const inv=Array.from({length:28},(_,j)=>j+1).find(q=>mod(q*x)===1);
    assert.ok(Number.isInteger(inv));
    for(let j=0;j<10;j++)m[i][j]=mod(m[i][j]*inv);
    for(let row=0;row<5;row++)if(row!==i){
      const scale=m[row][i];
      for(let j=0;j<10;j++)m[row][j]=mod(m[row][j]-scale*m[i][j]);
    }
  }
  return {inverse:m.map(row=>row.slice(5)),determinant:det};
}
const {inverse,determinant}=inverseMatrix(key);
assert.equal(determinant,3);
assert.deepEqual(inverse, [
  [23,22,15,2,17],
  [24,25,4,2,24],
  [20,28,12,28,20],
  [24,2,4,25,24],
  [17,2,15,22,23]
]);
/** @param {number[][]} matrix @param {number[]} input 75 GP29 symbols */
function hill75(matrix,input) {
  assert.equal(input.length,75);
  const out=[];
  for(let at=0;at<75;at+=5)
    for(let row=0;row<5;row++)
      out.push(mod(matrix[row].reduce((sum,x,col)=>sum+x*input[at+col],0)));
  return out;
}
/** @param {number[]} input */
function ioc(input){
  const f=Array(29).fill(0);
  for(const n of input)f[n]++;
  return f.reduce((sum,k)=>sum+k*(k-1),0)/(input.length*(input.length-1));
}
const originalWithoutF=cipher.filter((_,i)=>i!==25);
assert.equal(originalWithoutF.length,75);
const plain=hill75(inverse,originalWithoutF);
assert.deepEqual(hill75(key,plain),originalWithoutF);
const roundTripNative=hill75(inverse,hill75(key,plantedNative));
assert.deepEqual(roundTripNative,plantedNative);
const translated=plain.map(x=>corpus.translit[x]).join("");
assert.equal(translated,"WUEARFRNGWNSOEOOEIALFYAEEAROEOEALWSUBYPMAEEAJNGAPREAAEDNGOEOEJOEASAITHDUBWNGTHORPTLSTHNJILJEJAAENY");
assert.ok(Math.abs(ioc(plain)-0.03855855855855856)<1e-14);
console.log(JSON.stringify({
  source:"Original 2014 LP1 p5 Stage04 OOB Wisdom 5x5 magic square and reused moth on LP2 p55",
  ciphertext:"Exact original LP2 physical p55, 76 GP29 runes with literal F at pos25",
  matrixMod29:key,determinantMod29:determinant,inverseMod29:inverse,
  removedFPosition:25,completeBlocks:15,
  decryptedGPTransliteration75:translated,
  originalNoFIndexOfCoincidence:ioc(originalWithoutF),
  decodedIndexOfCoincidence:ioc(plain),
  originalCiphertextRoundtrip:75,solvedSourcePlantRecovered:75,
  originalUnknownPlaintextRecovered:false,
  decision:"The standard source-matrix GP29 Hill inverse yields no coherent native GP plaintext."
},null,2));
