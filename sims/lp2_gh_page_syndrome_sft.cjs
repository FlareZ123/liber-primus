"use strict";
/**
 * Source-fixed GF(29) page syndromes, original LP2 pp0–55.
 *
 * The signed 2013 BASE29(3301)=3QO and original p39 red GP29 triad
 * select H=3+26X+24X^2 and G=27+5X+15X^2. The original p49–51
 * 256-byte table is divisible by both in descending-coefficient order.
 *
 * This deliberately tests a single missing-payload hypothesis: read
 * the four H/G remainder symbols of every original rune-bearing page
 * as one 220-rune GP29 channel. No key, language fit or phase is tuned.
 *
 * Reproduce: node sims/lp2_gh_page_syndrome_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const table = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const P = 29;
const H = [3,26,24];
const G = [27,5,15];

/** @param {number} x @returns {number} */
function mod(x) { return (x % P + P) % P; }
/** @param {number} a @returns {number} */
function inverse(a) {
  assert.notEqual(mod(a), 0);
  for (let x=1; x<P; x++) if (mod(x*a)===1) return x;
  throw new Error("GF29 inverse failed");
}
/**
 * @param {number[]} coefficients Descending coefficients.
 * @param {number[]} factor Ascending degree-2 coefficients.
 * @returns {number[]} Descending remainder pair.
 */
function residue(coefficients, factor) {
  assert(coefficients.length>=2);
  const v=coefficients.map(mod), inv=inverse(factor[2]);
  for (let i=0; i<v.length-2; i++) {
    const scale=mod(v[i]*inv);
    for (let k=0; k<3; k++)
      v[i+k]=mod(v[i+k]-scale*factor[2-k]);
  }
  return v.slice(-2);
}
/** @param {number[]} indices @returns {number[]} */
function syndrome(indices) {
  return [...residue(indices,H), ...residue(indices,G)];
}
/** @param {number[]} indices @returns {number} */
function coincidence(indices) {
  const count=Array(P).fill(0);
  for (const x of indices) count[x]++;
  return count.reduce((s,x)=>s+x*(x-1),0)/
    (indices.length*(indices.length-1));
}
/**
 * Gauss–Jordan over GF(29), four unknowns.
 * @param {number[][]} matrix 4 by 4, in equation-row order.
 * @param {number[]} rhs Four desired differences.
 * @returns {number[]}
 */
function solve4(matrix, rhs) {
  const a=matrix.map((row,i)=>[...row,rhs[i]]);
  for (let col=0; col<4; col++) {
    let pivot=col;
    while (pivot<4 && a[pivot][col]===0) pivot++;
    assert(pivot<4, "source factors must have independent syndromes");
    [a[col],a[pivot]]=[a[pivot],a[col]];
    const scale=inverse(a[col][col]);
    for (let j=col; j<=4; j++) a[col][j]=mod(a[col][j]*scale);
    for (let i=0; i<4; i++) if (i!==col) {
      const q=a[i][col];
      for (let j=col; j<=4; j++) a[i][j]=mod(a[i][j]-q*a[col][j]);
    }
  }
  return a.map(row=>row[4]);
}
/**
 * This is an independent embedded-message positive control.
 * Leave every source page position except the final FOUR untouched,
 * and choose those four so that H/G remainders encode a known GP text.
 *
 * @param {number[]} original Original GP index page.
 * @param {number[]} target The four desired H/G remainder symbols.
 * @returns {number[]}
 */
function embed(original,target) {
  const base=[...original.slice(0,-4),0,0,0,0];
  const start=syndrome(base);
  const basis=Array.from({length:4},(_,col)=>{
    const x=[...base];
    x[x.length-4+col]=1;
    return syndrome(x).map((v,i)=>mod(v-start[i]));
  });
  const matrix=Array.from({length:4},(_,row)=>
    basis.map(column=>column[row]));
  const correction=solve4(matrix,target.map((v,i)=>mod(v-start[i])));
  for(let col=0;col<4;col++)
    base[base.length-4+col]=correction[col];
  assert.deepEqual(syndrome(base),target);
  return base;
}
assert.equal(table.bytes.length,256);
assert.equal(crypto.createHash("sha256")
  .update(Buffer.from(table.bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
assert.deepEqual(syndrome(table.bytes.map(x=>x%P)),[0,0,0,0]);
assert.notDeepEqual(
  residue(table.bytes.map(x=>x%P),[...H].reverse()),[0,0]);
assert.notDeepEqual(
  residue(table.bytes.map(x=>x%P),[...G].reverse()),[0,0]);

const pages=corpus.pages.filter(page=>page.page<=55&&page.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((n,page)=>n+page.indices.length,0),12956);
assert.equal(corpus.pages[50].indices.length,0);
const actual=pages.flatMap(page=>syndrome(page.indices));
assert.equal(actual.length,220);
assert.deepEqual(syndrome(pages.find(page=>page.page===29).indices).slice(2),
  [0,0]);

const solved=corpus.pages[57].indices;
assert.equal(solved.length,95);
const desired=Array.from({length:220},(_,i)=>solved[i%solved.length]);
const planted=pages.map((page,j)=>
  embed(page.indices,desired.slice(4*j,4*j+4)));
const decodedPlant=planted.flatMap(syndrome);
assert.deepEqual(decodedPlant,desired);

const result={
  classification:"BOUNDED NEGATIVE: source-fixed H/G page-syndrome plaintext channel",
  input:{pages:pages.length,runes:12956,syndromeSymbols:actual.length,
    originalGridSha256:"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
    coefficientOrder:"original descending rune indices; H and G ascending",
    H,G},
  original:{runes:actual.map(v=>corpus.translit[v]).join(""),
    gpIndexOfCoincidence:coincidence(actual),
    directSolvedTextMatches:actual.filter((v,i)=>v===desired[i]).length,
    p29GZero:true},
  positiveControl:{source:"solved LP2 p57 GP rune text repeated to 220 positions",
    changedRrunes:"four tail runes per source page; no page length changed",
    exactRecovered:decodedPlant.length,expected:desired.length,
    gpIndexOfCoincidence:coincidence(decodedPlant)},
  interpretation:"No legible GP prose, and the original 220-rune stream has near-uniform GP symbol collisions. Direct native-GP syndrome-as-plaintext is unsupported, even up to a fixed 29-symbol permutation; do not infer a key or completed decryption."
};
assert(Math.abs(result.original.gpIndexOfCoincidence-0.03424657534246575)<1e-12);
assert(Math.abs(result.positiveControl.gpIndexOfCoincidence-0.06832710668327106)<1e-12);
assert.equal(result.original.directSolvedTextMatches,7);
console.log(JSON.stringify(result,null,2));
