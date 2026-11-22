"use strict";
/**
 * Exhaustive-coefficient GF29 inside-out ring affine gate on original LP2
 * terminal pp55–57 and pp49–51 numeric grid.
 *
 * This is an exact linear-algebra necessary-condition test of one possible
 * circumference-to-text decoder, not a claimed original cipher.
 * Node.js 22, CommonJS. No network or file writes.
 * Execute: node sims/lp2_terminal256_ring_affine_knownplain_gate.cjs
 */
const assert = require("node:assert/strict");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const grid = require("../resources/liber-primus/lp2-grid-256.json");
const MOD = 29;
const STARTS = [0,76,144,204];
const LENGTHS = [76,68,60,52];
const EXPECTED_P56 =
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO "
  + "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";

/** @param {number} x @returns {number} */
function mod(x) { return ((x % MOD) + MOD) % MOD; }

/** @param {number} x @returns {number} */
function inv(x) {
  for (let i=1;i<MOD;i++) if (mod(i*x)===1) return i;
  throw new Error("Non-invertible GF29 scalar " + x);
}

/** @param {string} text @returns {number[]} */
function gp(text) {
  const tokens = corpus.translit.map((token,index)=>({token,index}))
    .sort((a,b)=>b.token.length-a.token.length);
  const out = [];
  for (const word of text.split(" ")) {
    for (let i=0;i<word.length;) {
      const match=tokens.find(({token})=>word.startsWith(token,i));
      assert.ok(match, "Missing GP grapheme: "+word.slice(i));
      out.push(match.index);
      i+=match.token.length;
    }
  }
  return out;
}

/**
 * NW-start, clockwise perimeter, contracting one cell on each side.
 * @param {number[]} printed
 * @returns {number[][]}
 */
function clockwiseRings(printed) {
  assert.equal(printed.length,256);
  return Array.from({length:4},(_,ring)=>{
    const indices=[],top=ring,bottom=31-ring,left=ring,right=7-ring;
    for (let x=left;x<=right;x++) indices.push(top*8+x);
    for (let y=top+1;y<=bottom;y++) indices.push(y*8+right);
    for (let x=right-1;x>=left;x--) indices.push(bottom*8+x);
    for (let y=bottom-1;y>top;y--) indices.push(y*8+left);
    assert.equal(indices.length,LENGTHS[ring]);
    return indices.map(index=>printed[index]);
  });
}

/**
 * A free six-coefficient affine rule on one outer ring position:
 * P = a*C_outer + b*B_outer + c*P_inner +
 *     d*B_inner + e*C_inner + f (mod 29).
 * @param {number} ring
 * @param {number} position
 * @param {number[]} cipher
 * @param {number[]} known
 * @param {number[][]} bytes
 * @returns {number[]}
 */
function feature(ring,position,cipher,known,bytes) {
  const j=position%LENGTHS[ring+1];
  const oi=STARTS[ring]+position,ii=STARTS[ring+1]+j;
  assert.notEqual(known[ii],null);
  return [
    cipher[oi],bytes[ring][position],known[ii],bytes[ring+1][j],
    cipher[ii],1
  ].map(mod);
}

/**
 * Exact Gaussian elimination, not a sampled or parameter-grid search.
 * @param {number[][]} input
 * @param {number[]} targets
 * @returns {{rank:number,contradictions:number,first:number|null,coefficients:number[],agreements:number}}
 */
function solve(input,targets) {
  const vars=6;
  assert.equal(input.length,targets.length);
  const matrix=input.map((x,i)=>[...x,targets[i]]),basis=[];
  let lead=0;
  for(let c=0;c<vars;c++) {
    let pivot=lead;
    while(pivot<matrix.length&&matrix[pivot][c]===0) pivot++;
    if(pivot===matrix.length) continue;
    [matrix[lead],matrix[pivot]]=[matrix[pivot],matrix[lead]];
    const scale=inv(matrix[lead][c]);
    matrix[lead]=matrix[lead].map(x=>mod(x*scale));
    for(let r=0;r<matrix.length;r++) {
      if(r===lead||matrix[r][c]===0) continue;
      const factor=matrix[r][c];
      matrix[r]=matrix[r].map((x,j)=>mod(x-factor*matrix[lead][j]));
    }
    basis.push(c);
    lead++;
  }
  const contradictions=matrix.map((row,i)=>({
    index:i,
    error:row.slice(0,vars).every(x=>x===0) && row[vars]!==0
  })).filter(x=>x.error);
  const coefficients=Array(vars).fill(0);
  basis.forEach((column,i)=>{coefficients[column]=matrix[i][vars];});
  const agreements=input.filter((v,i)=>
    mod(v.reduce((sum,x,j)=>sum+x*coefficients[j],0))===targets[i]).length;
  return {
    rank:lead,contradictions:contradictions.length,
    first:contradictions[0]?.index??null,coefficients,agreements
  };
}

function main() {
  const bytes=clockwiseRings(grid.pages.flatMap(page=>page.bytes));
  const p56=gp(EXPECTED_P56);
  assert.equal(p56.length,85);
  const p55=corpus.pages[55].indices;
  const c56=corpus.pages[56].indices;
  const p57=corpus.pages[57].indices;
  assert.deepEqual([p55.length,c56.length,p57.length],[76,85,95]);
  const cipher=[...p55,...c56,...p57];
  const known=[...Array(76).fill(null),...p56,...p57];
  assert.equal(cipher.length,256);
  assert.equal(known.length,256);
  assert.equal(LENGTHS.reduce((a,b)=>a+b,0),256);

  // Full source-pinned ring1: 68 independently decoded p56 runes.
  const x1=Array.from({length:68},(_,j)=>feature(1,j,cipher,known,bytes));
  const y1=p56.slice(0,68);
  const rejected=solve(x1,y1);
  assert.equal(rejected.rank,6);
  assert.equal(rejected.contradictions,61);
  assert.equal(rejected.first,6);
  assert.equal(rejected.agreements,7);

  // Ring2 has 17 independently solved p56 + 43 already-clear p57 runes.
  // Its inner 52-symbol ring is exactly p57's 'SHED ... EMERGE' suffix.
  const x2=Array.from({length:60},(_,j)=>feature(2,j,cipher,known,bytes));
  const y2=known.slice(144,204);
  const rejected2=solve(x2,y2);
  assert.equal(rejected2.rank,5); // Inner ring3 P and C are identical.
  assert.equal(rejected2.contradictions,54);
  assert.equal(rejected2.first,5);

  // Positive control: encode authentic 68 GP-native p56 runes using one
  // planted fully invertible affine rule, then recover all six coefficients.
  const planted=[7,11,13,17,19,23];
  const controlCipher=cipher.slice();
  for(let j=0;j<68;j++) {
    const feat=feature(1,j,controlCipher,known,bytes);
    const rest=planted.slice(1).reduce((s,k,i)=>s+k*feat[i+1],0);
    controlCipher[76+j]=mod((y1[j]-rest)*inv(planted[0]));
  }
  const xp=Array.from({length:68},(_,j)=>
    feature(1,j,controlCipher,known,bytes));
  const positive=solve(xp,y1);
  assert.equal(positive.rank,6);
  assert.equal(positive.contradictions,0);
  assert.equal(positive.agreements,68);
  assert.deepEqual(positive.coefficients,planted);
  for(let j=0;j<68;j++) {
    const decoded=mod(xp[j].reduce((s,x,i)=>s+x*planted[i],0));
    assert.equal(decoded,y1[j]);
  }
  console.log(JSON.stringify({
    geometry:LENGTHS,
    knownRuneCount:180,
    ring1KnownP56:68,
    ring1Original:rejected,
    ring2KnownP56AndClearP57:60,
    ring2Original:rejected2,
    nativeGPPositivePlant:positive,
    status:"PASS: entire six-coefficient source-ring affine class rejected"
  },null,2));
}
main();
