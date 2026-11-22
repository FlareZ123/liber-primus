#!/usr/bin/env node
'use strict';

/**
 * LP2 p36 norm-2 linearized-field inverse.
 *
 * Source-selected inputs: p50 numerical table -> GF(29^238) polynomial;
 * p36 original 238 runes -> field element K with exact norm 2.
 *
 * Test the reversible characteristic-29 linearized polynomial
 * C = P + sign*K*P^29, with both signs, both original coefficient
 * orientations and both plausible original block origins.
 * Its invertibility is independently guaranteed by Norm(K)=2!=1
 * for printed K; the script constructs the actual inverse.
 *
 * No hidden plaintext/key should be inferred from a positive roundtrip
 * alone. All original outputs are compared with native-GP language IoC.
 *
 * Run as one file from any working directory: node
 * sims/p36_norm2_linearized_frobenius_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {any} */
const resource = name => JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', name), 'utf8'));
const grid = resource('base60-grid.json');
const corpus = resource('lp2-corpus.json');
const bytes = grid.byte_rows.flat();
const D = 238;
const Q = 29;
/** @param {number} n @returns {number} */
const mod = n => (n % Q + Q) % Q;
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function polyMul(a, b) {
  const output = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      output[i+j] = mod(output[i+j] + a[i]*b[j]);
  return output;
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function divMonic(a,b) {
  const remainder = a.slice();
  const quotient = Array(a.length - b.length + 1).fill(0);
  assert.equal(b.at(-1),1);
  for(let i = a.length-1; i>=b.length-1; i--){
    const coeff=mod(remainder[i]);
    quotient[i-b.length+1]=coeff;
    for(let j=0;j<b.length;j++)
      remainder[i-b.length+1+j]=mod(remainder[i-b.length+1+j]-coeff*b[j]);
  }
  assert(remainder.slice(0,b.length-1).every(v=>v===0));
  while(quotient.at(-1)===0) quotient.pop();
  return quotient;
}
const small = [[5,1],[5,1],[11,18,1],[24,16,14,1],
  [11,15,0,9,1,5,10,20,12,1]].reduce(polyMul,[1]);
const polynomial = divMonic(bytes.map(b=>b%Q).reverse(),small).map(v=>mod(-v));
assert.equal(polynomial.length,D+1);
assert.equal(polynomial[D],1);

/**
 * Field multiplication in GF(29)[X]/polynomial.
 * @param {ArrayLike<number>} a
 * @param {ArrayLike<number>} b
 * @returns {Uint8Array}
 */
function multiply(a,b) {
  const terms=new Float64Array(2*D-1);
  for(let i=0;i<D;i++)if(a[i])
    for(let j=0;j<D;j++)terms[i+j]+=a[i]*b[j];
  for(let k=terms.length-1;k>=D;k--){
    const value=mod(terms[k]);
    if(value)for(let j=0;j<D;j++)terms[k-D+j]-=value*polynomial[j];
  }
  return Uint8Array.from(terms.slice(0,D),mod);
}

/**
 * Compute X^29 * a modulo the same polynomial.
 * @param {Uint8Array} a
 * @returns {Uint8Array}
 */
function shift29(a) {
  const terms = new Int32Array(D+29);
  for(let i=0;i<D;i++)terms[i+29]=a[i];
  for(let k=terms.length-1;k>=D;k--){
    const value=mod(terms[k]);
    if(value)for(let j=0;j<D;j++)terms[k-D+j]-=value*polynomial[j];
  }
  return Uint8Array.from(terms.slice(0,D),mod);
}
const unity=new Uint8Array(D); unity[0]=1;
const frobeniusBasis=[unity];
for(let i=1;i<D;i++)
  frobeniusBasis.push(shift29(frobeniusBasis[i-1]));

const inverses=Array(29).fill(0);
for(let i=1;i<29;i++)for(let j=1;j<29;j++)
  if(i*j%29===1){inverses[i]=j;break}

/**
 * Invert a square GF29 matrix with complete augmented-row elimination.
 * @param {Uint8Array[]} matrix
 * @returns {Uint8Array[]}
 */
function invert(matrix){
  const a=matrix.map((r,i)=>{
    const expanded=new Uint8Array(D*2);
    expanded.set(r);expanded[D+i]=1;return expanded;
  });
  for(let c=0;c<D;c++){
    let pivot=c;
    while(pivot<D&&a[pivot][c]===0)pivot++;
    assert(pivot<D, 'linearized-field map is singular');
    if(pivot!==c)[a[pivot],a[c]]=[a[c],a[pivot]];
    const chosen=a[c],factor=inverses[chosen[c]];
    for(let j=c;j<2*D;j++)chosen[j]=chosen[j]*factor%Q;
    for(let i=0;i<D;i++)if(i!==c){
      const r=a[i],scale=r[c];
      if(scale)for(let j=c;j<2*D;j++)
        r[j]=mod(r[j]-scale*chosen[j]);
    }
  }
  return a.map(r=>r.slice(D));
}

/**
 * Apply one GF29 matrix to field coefficients.
 * @param {Uint8Array[]} matrix
 * @param {Uint8Array} input
 * @returns {Uint8Array}
 */
function apply(matrix,input){
  const output=new Uint8Array(D);
  for(let i=0;i<D;i++){
    let sum=0;const row=matrix[i];
    for(let j=0;j<D;j++)sum+=row[j]*input[j];
    output[i]=sum%Q;
  }
  return output;
}
/** @param {number[]} array @returns {number} */
function ic(array){
  const totals=Array(29).fill(0);
  for(const value of array)totals[value]++;
  return totals.reduce((s,n)=>s+n*(n-1),0)/(array.length*(array.length-1));
}
const original=corpus.pages.filter(p=>p.page<=55&&p.page!==50)
  .flatMap(p=>p.indices);
const afterP36=corpus.pages.filter(p=>p.page>=37&&p.page<=55)
  .flatMap(p=>p.indices);
const p57=corpus.pages.find(p=>p.page===57).indices;
const plant=Uint8Array.from(Array.from({length:D},(_,i)=>p57[i%p57.length]));
assert.equal(corpus.pages[36].indices.length,D);
assert.equal(original.length,12956);
assert.equal(p57.length,95);

const outputs=[];
for(const [keyOrder,key] of [
  ['printed',corpus.pages[36].indices],
  ['reversed',corpus.pages[36].indices.slice().reverse()]]) {
  const kFrobenius = frobeniusBasis.map(a=>multiply(key,a));
  for(const sign of [1,-1]){
    const matrix=Array.from({length:D},()=>new Uint8Array(D));
    for(let j=0;j<D;j++)for(let i=0;i<D;i++)
      matrix[i][j]=mod(sign*kFrobenius[j][i]+(i===j?1:0));
    const inverse=invert(matrix);
    const encodedPlant=apply(matrix,plant);
    assert.deepEqual(Array.from(apply(inverse,encodedPlant)),
      Array.from(plant),'authentic native-p57 source plant');
    for(const [start,input] of [['book',original],['after-p36',afterP36]])
      for(const order of ['printed','reversed']){
        const blockCount=Math.floor(input.length/D);
        const decoded=[];
        for(let k=0;k<blockCount;k++){
          const block=Uint8Array.from(input.slice(k*D,(k+1)*D));
          if(order==='reversed')block.reverse();
          const plain=apply(inverse,block);
          assert.deepEqual(Array.from(apply(matrix,plain)),Array.from(block),
            'exact original ciphertext roundtrip');
          decoded.push(...plain);
        }
        outputs.push({keyOrder,sign,start,order,blocks:blockCount,
          runes:decoded.length,ic:ic(decoded),
          first20:decoded.slice(0,20).map(v=>corpus.translit[v]).join(' ')});
      }
  }
}
assert.equal(outputs.length,16);
const best=outputs.slice().sort((a,b)=>b.ic-a.ic)[0];
assert(best.ic<0.036,'unexpected language concentration warrants investigation');
console.log(JSON.stringify({
  field:'GF(29^238)', operator:'C=P+sign*K*P^29',
  p36_key_length:D, norm_printed_K:2,
  positive_native_p57_238_rune_plant_exact:true,
  raw_book_ic:ic(original),raw_after_p36_ic:ic(afterP36),
  original_best:best,original_all:outputs,
  verdict:'No recovered original unknown plaintext or selected key',
},null,2));
