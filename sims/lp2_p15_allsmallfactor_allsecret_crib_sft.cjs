'use strict';

/**
 * Complete all-secret GP29 small-factor LFSR and GP28 nonzero-step
 * original-cipher inversion on the 18 printed singleton words of p15-22.
 *
 * Source: original LP2 GP29 ciphertext, the original word boundaries, and
 * every monic degree <= 9 divisor of the printed p49-51 256-byte table.
 * Node.js 22; CommonJS, no external dependencies, no writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {parseLP2Words} = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
const readJSON = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = readJSON('resources/liber-primus/lp2-corpus.json');
const grid = readJSON('resources/liber-primus/lp2-grid-256.json');
const parsed = parseLP2Words(
  fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8'));
const mod = n => (n % 29 + 29) % 29;
const mod28 = n => (n % 28 + 28) % 28;
const C = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(C.length, 12956);
assert.equal(parsed.runeCount, C.length);
assert.equal(parsed.words.length, 2896);
assert.equal(grid.bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const start = corpus.pages.filter(p => p.page < 15)
  .reduce((n, p) => n + p.indices.length, 0) + 9;
const end = corpus.pages.filter(p => p.page < 23)
  .reduce((n, p) => n + p.indices.length, 0);
const body = C.slice(start, end);
assert.equal(body.length, 1894);
const singleton = [];
let runePosition = 0;
for (const word of parsed.words) {
  if (word.length === 1 && runePosition >= start && runePosition < end)
    singleton.push(runePosition - start);
  runePosition += word.length;
}
assert.deepEqual(singleton,
  [126,171,269,394,530,536,564,605,621,746,862,1021,1087,1139,
    1182,1641,1707,1724]);
assert.equal(runePosition, C.length);
const alphabet = [24,10,3]; // Original GP indices A/I/O
const factors = [
  [5,1],
  [11,18,1],
  [24,16,14,1],
  [11,15,0,9,1,5,10,20,12,1]
];

/** @param {number} x */
function inverse(x) {
  for (let i = 1; i < 29; i++) if (mod(x * i) === 1) return i;
  throw new Error('attempted inversion of zero');
}

/** @param {number[]} a @param {number[]} b */
function multiply(a,b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i=0;i<a.length;i++) for(let j=0;j<b.length;j++)
    out[i+j]=mod(out[i+j]+a[i]*b[j]);
  return out;
}

/** @param {number[]} polynomial */
function gridDivides(polynomial) {
  const quotient = grid.bytes.slice().reverse().map(v => v%29);
  const d = polynomial.length-1;
  for(let i=quotient.length-1;i>=d;i--) {
    const lead=quotient[i];
    for(let j=0;j<=d;j++)
      quotient[i-d+j]=mod(quotient[i-d+j]-lead*polynomial[j]);
  }
  return quotient.slice(0,d).every(v=>v===0);
}

/** @param {number[][]} src */
function rank(src) {
  if(!src.length)return 0;
  const A=src.map(r=>r.slice());
  let h=0;
  for(let col=0;col<A[0].length&&h<A.length;col++) {
    let pivot=h;
    while(pivot<A.length&&A[pivot][col]===0)pivot++;
    if(pivot===A.length)continue;
    [A[h],A[pivot]]=[A[pivot],A[h]];
    const mult=inverse(A[h][col]);
    for(let j=col;j<A[0].length;j++)A[h][j]=mod(A[h][j]*mult);
    for(let r=h+1;r<A.length;r++){
      const factor=A[r][col];
      for(let j=col;j<A[0].length;j++)
        A[r][j]=mod(A[r][j]-factor*A[h][j]);
    }
    h++;
  }
  return h;
}

/** @param {number[][]} matrix */
function invert(matrix) {
  const n=matrix.length;
  const A=matrix.map((row,i)=>[
    ...row,...Array.from({length:n},(_,j)=>Number(i===j))]);
  for(let col=0;col<n;col++){
    let pivot=col;
    while(pivot<n&&A[pivot][col]===0)pivot++;
    assert.ok(pivot<n,'selected source singleton rows must be independent');
    [A[col],A[pivot]]=[A[pivot],A[col]];
    const mult=inverse(A[col][col]);
    for(let j=col;j<2*n;j++)A[col][j]=mod(A[col][j]*mult);
    for(let r=0;r<n;r++)if(r!==col){
      const factor=A[r][col];
      for(let j=col;j<2*n;j++)
        A[r][j]=mod(A[r][j]-factor*A[col][j]);
    }
  }
  return A.map(row=>row.slice(n));
}

/** @param {number[]} row @param {number[]} state */
const dot=(row,state)=>mod(row.reduce((sum,x,j)=>sum+x*state[j],0));

/**
 * Keystream state matrix for any monic source-field factor.
 * @param {number[]} polynomial
 * @param {number} n
 */
function recurrence(polynomial,n) {
  const d=polynomial.length-1;
  const vectors=Array.from({length:n},(_,i)=>i<d?
    Array.from({length:d},(_,j)=>Number(i===j)):null);
  for(let i=d;i<n;i++)
    vectors[i]=Array.from({length:d},(_,j)=>mod(
      -polynomial.slice(0,d).reduce((sum,v,k)=>sum+v*vectors[i-d+k][j],0)));
  return vectors;
}

const log15=Array(29).fill(-1);
const exp15=Array(28);
{
  let p=1;
  for(let i=0;i<28;i++) {
    log15[p]=i;
    exp15[i]=p;
    p=mod(p*15);
  }
  assert.equal(p,1);
  assert.ok(log15.slice(1).every(i=>i>=0));
}

/**
 * Model source observations, including original zero-step escapes.
 * @param {number[]} cipher
 * @param {number[][]} vectors
 * @param {'additive'|'exponent'} kind
 * @param {'every'|'skip-repeat'} clock
 */
function observed(cipher,vectors,kind,clock) {
  const values=[],rows=[];
  let previous=0,time=0,repeats=0;
  for(const c of cipher){
    const delta=mod(c-previous);
    previous=c;
    rows.push(vectors[time]);
    values.push(kind==='additive'?c:(delta===0?-1:log15[delta]));
    if(delta===0)repeats++;
    if(kind==='additive'||clock==='every'||delta!==0)time++;
  }
  return {values,rows,repeats};
}

/**
 * Recover ALL possible secret states satisfying source A/I/O words.
 * Use adaptively selected linearly independent singleton equations; this
 * handles the exceptional rank-deficient first d p15 word positions.
 *
 * @param {number[]} cipher
 * @param {number[][]} vectors
 * @param {'additive'|'exponent'} kind
 * @param {'every'|'skip-repeat'} clock
 */
function recover(cipher,vectors,kind,clock) {
  const observation=observed(cipher,vectors,kind,clock);
  const source=singleton.map(i=>({
    at:i,value:observation.values[i],row:observation.rows[i]
  }));
  assert.ok(source.every(x=>x.value>=0),'source singletons must not be escape');
  const d=vectors[0].length;
  const selection=[],basis=[];
  for(let i=0;i<source.length&&selection.length<d;i++)
    if(rank([...basis,source[i].row])>basis.length){
      selection.push(i);
      basis.push(source[i].row);
    }
  assert.equal(selection.length,d,'the eighteen source one-rune words span full state');
  const inv=invert(basis);
  const held=source.filter((_,i)=>!selection.includes(i));
  let candidates=0,survivors=0,minErrors=Infinity,atMinimum=0;
  const survivorStates=[];
  const mismatchCount=Array(held.length+1).fill(0);
  for(let mask=0;mask<3**d;mask++){
    let digits=mask;
    const keyOptions=selection.map(i=>{
      const plain=alphabet[digits%3];
      digits=Math.floor(digits/3);
      const key=kind==='additive'?mod(source[i].value-plain):
        mod28(source[i].value-plain);
      return kind==='exponent'&&key===0?[0,28]:[key];
    });
    const variants=keyOptions.reduce((n,options)=>n*options.length,1);
    for(let alias=0;alias<variants;alias++){
      let a=alias;
      const keyKnown=keyOptions.map(opts=>{
        const key=opts[a%opts.length];
        a=Math.floor(a/opts.length);
        return key;
      });
      const seed=inv.map(row=>dot(row,keyKnown));
      candidates++;
      let errors=0;
      for(const v of held){
        const key=dot(v.row,seed);
        const plain=kind==='additive'?mod(v.value-key):
          mod28(v.value-key%28);
        if(!alphabet.includes(plain))errors++;
      }
      mismatchCount[errors]++;
      if(errors<minErrors){minErrors=errors;atMinimum=1;}
      else if(errors===minErrors)atMinimum++;
      if(errors===0){
        survivors++;
        survivorStates.push(seed);
      }
    }
  }
  assert.equal(mismatchCount.reduce((n,v)=>n+v,0),candidates);
  return {stateDimension:d,selectedSingletonIndices:selection,candidates,
    survivors,minErrors,atMinimum,survivorStates,sourceRepeats:observation.repeats};
}

/**
 * Generate synthetic ciphertext with exact source-shaped native GP plaintext.
 * @param {number[]} plain
 * @param {number[][]} vectors
 * @param {number[]} seed
 * @param {'additive'|'exponent'} kind
 * @param {'every'|'skip-repeat'} clock
 */
function encrypt(plain,vectors,seed,kind,clock) {
  const out=[];
  let previous=0,t=0;
  for(const p of plain){
    const k=dot(vectors[t],seed);
    const c=kind==='additive'?mod(p+k):
      p===28?previous:mod(previous+exp15[mod28(p+k%28)]);
    out.push(c);
    if(kind==='additive'||clock==='every'||p!==28)t++;
    previous=c;
  }
  return out;
}

/**
 * Inverse known-state cipher for source-native planted recovery.
 * @param {number[]} cipher
 * @param {number[][]} vectors
 * @param {number[]} seed
 * @param {'additive'|'exponent'} kind
 * @param {'every'|'skip-repeat'} clock
 */
function decrypt(cipher,vectors,seed,kind,clock) {
  const out=[];
  let previous=0,t=0;
  for(const c of cipher){
    const k=dot(vectors[t],seed);
    const delta=mod(c-previous);
    const p=kind==='additive'?mod(c-k):
      delta===0?28:mod28(log15[delta]-k%28);
    out.push(p);
    if(kind==='additive'||clock==='every'||delta!==0)t++;
    previous=c;
  }
  return out;
}

/** @param {'additive'|'exponent'} kind */
function plant(kind) {
  const native=corpus.pages.find(p=>p.page===57).indices;
  assert.equal(native.length,95);
  const plain=Array.from({length:body.length},(_,i)=>{
    const p=native[i%native.length];
    return kind==='exponent'&&p===28?18:p;
  });
  if(kind==='exponent') {
    let previous=0,repeats=0;
    for(let i=0;i<body.length;i++){
      if(body[i]===previous){plain[i]=28;repeats++;}
      previous=body[i];
    }
    assert.equal(repeats,10);
  }
  singleton.forEach((i,j)=>{plain[i]=alphabet[j%3];});
  return plain;
}

function run() {
  const sourcePolys=[];
  for(let lin=0;lin<=2;lin++)
    for(let quad=0;quad<=1;quad++)
      for(let cubic=0;cubic<=1;cubic++)
        for(let nonic=0;nonic<=1;nonic++){
          const signature=[lin,quad,cubic,nonic];
          const degree=lin+2*quad+3*cubic+9*nonic;
          if(degree<1||degree>9)continue;
          let polynomial=[1];
          signature.forEach((exponent,i)=>{
            for(let e=0;e<exponent;e++)
              polynomial=multiply(polynomial,factors[i]);
          });
          assert.equal(polynomial.length,degree+1);
          assert.equal(polynomial.at(-1),1);
          assert.ok(gridDivides(polynomial));
          sourcePolys.push({signature:signature.join(''),degree,polynomial});
        }
  assert.equal(sourcePolys.length,12);
  const models=[];
  let totalSecretStates=0;
  for(const factor of sourcePolys){
    for(const direction of ['forward','reciprocal']){
      const polynomial=direction==='forward'?factor.polynomial:
        factor.polynomial.slice().reverse().map(c=>mod(c*inverse(factor.polynomial[0])));
      const vectors=recurrence(polynomial,body.length);
      for(const kind of ['additive','exponent']){
        for(const clock of kind==='additive'?['every']:['every','skip-repeat']){
          const found=recover(body,vectors,kind,clock);
          assert.equal(found.survivors,0,'all original plaintext singleton cribs rejected');
          totalSecretStates+=found.candidates;
          // Prove complete source-register plaintext and planted *secret-state*
          // recovery under the exact original singleton constraints.
          const plaintext=plant(kind);
          const seed=Array.from({length:factor.degree},(_,i)=>(3+7*i)%29);
          const cipher=encrypt(plaintext,vectors,seed,kind,clock);
          const recovered=recover(cipher,vectors,kind,clock);
          assert.ok(recovered.survivorStates.some(
            state=>state.every((v,i)=>v===seed[i])),
            'the planted unknown secret state must be recovered from cribs');
          assert.deepEqual(decrypt(cipher,vectors,seed,kind,clock),plaintext,
            'source-sized planted plaintext must decode exactly');
          assert.deepEqual(encrypt(plaintext,vectors,seed,kind,clock),cipher,
            'the original forward operator must reconstruct every symbol');
          models.push({
            signature:factor.signature,degree:factor.degree,
            direction,kind,clock,
            candidateSecretStates:found.candidates,
            matched18Words:found.survivors,
            minHeldoutWordErrors:found.minErrors,
            selectedSingletonWordIndices:found.selectedSingletonIndices,
            plantedSecretRecovered:true,
            plantedSymbolsRecovered:body.length
          });
        }
      }
    }
  }
  assert.equal(models.length,72);
  assert.equal(totalSecretStates,205137);
  return {
    sourceOriginalRunes:body.length,
    sourceOneRuneWordOffsets:singleton,
    fullMonicFactors:sourcePolys,
    models,modelCount:models.length,
    totalExhaustiveSourceCompatibleSecretStates:totalSecretStates,
    totalOriginalSurvivingModels:models.filter(x=>x.matched18Words>0).length,
    positiveControlRecoveredOriginalSizeEveryModel:true
  };
}

if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
