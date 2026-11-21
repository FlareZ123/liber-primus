'use strict';

/**
 * LP2 original 256-cell table: tiny 2-cycle basin as conditional
 * four-coordinate HG parity placement. Pure mathematical gate;
 * no unknown plaintext, author opcode, or source key is claimed.
 *
 * Windows Node.js22, read-only, exact GF(29) operations.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const src = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const bytes = src.pages.flatMap(p => p.bytes);
const tokens = src.pages.flatMap(p => p.tokens);
assert.equal(bytes.length, 256);
assert.equal(tokens.length, 256);
const modulus = 29;
const mod = n => ((n % modulus) + modulus) % modulus;
/** @param {number} a */
function inverse(a) {
  assert.notEqual(mod(a),0);
  for(let b=1;b<29;b++) if(mod(a*b)===1) return b;
  throw new Error('Noninvertible nonzero field member');
}

/**
 * Original 2013 signed-base29 H and p39 red G factors:
 * H(X)G(X) = 12X^4 + 17X^3 + 11X^2 + 21X + 23 mod29.
 * Return four low-degree coefficients of X^exponent mod HG.
 *
 * @param {number} exponent
 * @returns {number[]}
 */
function monomial(exponent) {
  const highCoefficient=12;
  const factor=[23,21,11,17,highCoefficient];
  let rem=[1,0,0,0];
  const invHigh=inverse(highCoefficient);
  for(let j=0;j<exponent;j++) {
    const high=rem[3]*invHigh;
    rem=[
      mod(-high*factor[0]),
      mod(rem[0]-high*factor[1]),
      mod(rem[1]-high*factor[2]),
      mod(rem[2]-high*factor[3]),
    ];
  }
  return rem;
}
const powers=Array.from({length:256},(_,i)=>monomial(i));
/** @param {number[]} x */
function combine(x) {
  const out=[0,0,0,0];
  for(let i=0;i<256;i++) {
    for(let row=0;row<4;row++) out[row]=mod(out[row]+mod(x[i])*powers[255-i][row]);
  }
  return out;
}
assert.deepEqual(combine(bytes),[0,0,0,0],'source H×G must divide exact original table');
const next=bytes;
const small=new Set();
/** @param {number} i */
function entersTiny(i) {
  const visited=new Set();
  while(!visited.has(i)) {
    if (i===158||i===249) return true;
    visited.add(i);
    i=next[i];
  }
  return false;
}
for(let i=0;i<256;i++) if(entersTiny(i))small.add(i);
const coords=[...small].sort((a,b)=>a-b);
assert.deepEqual(coords,[9,158,227,249]);
assert.deepEqual(coords.map(i=>tokens[i]),['49','49','49','2c']);
assert.deepEqual(coords.map(i=>mod(bytes[i])),[17,17,17,13]);

const M=Array.from({length:4},(_,r)=>coords.map(i=>powers[255-i][r]));
assert.deepEqual(M,[
  [23,15,25,23],[3,28,15,7],[25,25,2,17],[0,24,16,24],
]);
const nullvector=[12,20,12,1];
assert.deepEqual(M.map(row=>mod(row.reduce((s,v,i)=>s+v*nullvector[i],0))),
  [0,0,0,0]);

/**
 * Reduce arbitrary GF29 equations to RREF, with augmented right sides.
 * Returns rank, unique vector when full rank, and consistency.
 * @param {number[][]} coefficients
 * @param {number[]} target
 */
function solve(coefficients,target) {
  const equations=coefficients.map((row,i)=>[...row.map(mod),mod(target[i])]);
  const width=coefficients[0].length;
  const pivots=[];
  let rank=0;
  for(let col=0;col<width;col++) {
    const pivot=equations.findIndex((row,i)=>i>=rank&&row[col]!==0);
    if(pivot===-1)continue;
    [equations[rank],equations[pivot]]=[equations[pivot],equations[rank]];
    const inv=inverse(equations[rank][col]);
    for(let j=col;j<=width;j++)equations[rank][j]=mod(equations[rank][j]*inv);
    for(let i=0;i<equations.length;i++) {
      if(i===rank)continue;
      const v=equations[i][col];
      if(v===0)continue;
      for(let j=col;j<=width;j++)equations[i][j]=mod(equations[i][j]-v*equations[rank][j]);
    }
    pivots.push(col);
    rank++;
  }
  const consistent=equations.every(row=>row.slice(0,width).some(v=>v!==0)||row[width]===0);
  const unique=rank===width&&consistent
    ? pivots.reduce((a,col,i)=>(a[col]=equations[i][width],a),Array(width).fill(null)):null;
  return {rank,consistent,unique};
}
assert.equal(solve(M,[0,0,0,0]).rank,3,'basin4 coordinates supply only three of four independent parity checks');

const known=bytes.map((value,i)=>small.has(i)?0:mod(value));
const knownRemainder=combine(known);
const target=knownRemainder.map(mod).map(x=>mod(-x));
const parity=solve(M,target);
assert.equal(parity.rank,3);
assert.equal(parity.consistent,true);
assert.equal(parity.unique,null);

// An independently *visible graph fan-in relation* supplies one more
// equation, the three literal '49' values on addresses 9,158,227.
const joint=solve([...M,[1,28,0,0]],[...target,0]);
assert.equal(joint.rank,4);
assert.equal(joint.consistent,true);
assert.deepEqual(joint.unique,[17,17,17,13]);
const reconstructed=known.slice();
coords.forEach((coordinate,j)=>reconstructed[coordinate]=joint.unique[j]);
assert.deepEqual(combine(reconstructed),[0,0,0,0]);
assert.deepEqual(reconstructed,bytes.map(mod),'full original 256-codeword recovery');
const otherValid=coords.map((i,j)=>mod(joint.unique[j]+nullvector[j]));
const other=known.slice();
coords.forEach((coordinate,j)=>other[coordinate]=otherValid[j]);
assert.deepEqual(combine(other),[0,0,0,0],
  'the four factor checks alone leave a full one-dimensional ambiguity');
assert.notEqual(other[9],other[158],
  'source 49/49 fan-in equality excludes the changed parity state');

console.log(JSON.stringify({
  classifier:'conditional exact original-source algebra; no LP2 plaintext or key',
  original_byte_count:bytes.length,
  small_basin:coords,
  printed_small_basin_tokens:coords.map(i=>tokens[i]),
  original_small_basin_gp29:coords.map(i=>mod(bytes[i])),
  hg_matrix:M,
  hg_matrix_rank:parity.rank,
  nullvector,
  extra_graph_fanin_constraint:'cell9 = cell158 (both literally 49), rank4 jointly',
  uniquely_recovered_small_basin:joint.unique,
  full_original_table_reconstructed:true,
  alternative_factor_valid_but_fanin_invalid:otherValid,
},null,2));
