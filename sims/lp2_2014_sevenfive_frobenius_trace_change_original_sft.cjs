'use strict';
/**
 * Original 2014 two 1033 magic squares: seven-square GP29 Frobenius
 * factor-traces equal the five-square CHANGE eigenvalue multiset.
 *
 * Source-generated full-rank 7 -> 5 GP trace plus 2 residual coefficients,
 * tested directly on three source-complete independent LP2 chapters.
 * No fitted key, synthetic plaintext on original, extra workflow, or I/O.
 * Node.js 22 / Windows 11 / read-only CommonJS single file.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(path.join(root,
  'resources', 'cicada2014-openpuff-magic-squares.txt'), 'utf8');
const squares = source.trim().split(/\r?\n\s*\r?\n/).map(block =>
  block.trim().split(/\r?\n/).map(line =>
    line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(s => s.length), [5, 7, 5]);
for (const [i, sum] of [[0, 3301], [1, 1033], [2, 1033]]) {
  assert(squares[i].every(row => row.reduce((a, b) => a + b, 0) === sum));
}
const mod = n => ((n % 29) + 29) % 29;
/** @param {number} x @returns {number} */
function invertUnit(x) {
  for (let v = 1; v < 29; v += 1) if (mod(v * x) === 1) return v;
  throw Error('Nonunit GF29 scalar');
}
/** @param {number} n @returns {number[][]} */
const identity = n => Array.from({length:n}, (_, i) =>
  Array.from({length:n}, (_, j) => +(i === j)));
/** @param {number[][]} A @param {number[][]} B @returns {number[][]} */
const multiply = (A, B) => A.map(row =>
  B[0].map((_, j) => mod(row.reduce((s, x, k) => s + x*B[k][j], 0))));
/** @param {number[][]} M @param {number[]} x @returns {number[]} */
const vector = (M, x) => M.map(row =>
  mod(row.reduce((s, a, i) => s + a*x[i], 0)));
/** @param {number[][]} B @returns {number[][]} */
function inverse(B) {
  const n = B.length, I = identity(n);
  const a = B.map((row, i) => [...row.map(mod), ...I[i]]);
  for (let col = 0; col < n; col += 1) {
    let pivot = -1;
    for (let k = col; k < n; k += 1) if (a[k][col]) {pivot=k;break;}
    assert(pivot >= 0, 'Invertible 7-symbol source carrier');
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const scale = invertUnit(a[col][col]);
    a[col] = a[col].map(v => mod(v*scale));
    for (let r = 0; r < n; r += 1) {
      if (r === col) continue;
      const q = a[r][col];
      a[r] = a[r].map((v, j) => mod(v-q*a[col][j]));
    }
  }
  return a.map(row => row.slice(n));
}
/** Low-degree-first polynomial multiplication modulo29. */
function product(a, b) {
  const out = Array(a.length+b.length-1).fill(0);
  for (let i=0;i<a.length;i+=1) for (let j=0;j<b.length;j+=1) {
    out[i+j] = mod(out[i+j]+a[i]*b[j]);
  }
  return out;
}
/** Remainder of low-degree-first polynomial division by monic b. */
function remainder(a, b) {
  const out = [...a.map(mod)];
  for (let i=out.length-1;i>=b.length-1;i-=1) {
    const v=out[i];
    for (let j=0;j<b.length;j+=1) out[i-b.length+1+j] =
      mod(out[i-b.length+1+j]-v*b[j]);
  }
  const lower = out.slice(0,b.length-1);
  while (lower.length>1 && lower[lower.length-1]===0) lower.pop();
  return lower;
}
/** Polynomial on square matrix, low-degree-first coefficients. */
function atMatrix(poly, M) {
  const n=M.length, out=Array.from({length:n},()=>Array(n).fill(0));
  let power=identity(n);
  for (const scalar of poly) {
    for(let i=0;i<n;i+=1) for(let j=0;j<n;j+=1) {
      out[i][j]=mod(out[i][j]+scalar*power[i][j]);
    }
    power=multiply(power,M);
  }
  return out;
}
/** Exact monic characteristic polynomial, low-degree-first, via traces. */
function characteristic(M) {
  const n=M.length, trace=[0];
  let power=identity(n);
  for (let j=1;j<=n;j+=1) {
    power=multiply(power,M);
    trace.push(mod(power.reduce((sum,row,i)=>sum+row[i],0)));
  }
  const c=[1];
  for(let j=1;j<=n;j+=1) {
    let sum=0;
    for(let i=1;i<=j;i+=1) sum=mod(sum+c[j-i]*trace[i]);
    c.push(mod(-sum*invertUnit(j)));
  }
  return c.reverse();
}
const B=squares[2].map(row=>row.map(mod));
const M=squares[1].map(row=>row.map(mod));
const factors=[
  {gp:'C',  symbol:5,  poly:[16,24,1], degree:2, norm:16},
  {gp:'H',  symbol:8,  poly:[21,1],    degree:1},
  {gp:'A',  symbol:24, poly:[5,1],     degree:1},
  {gp:'NG', symbol:21, poly:[8,8,1],  degree:2, norm:8},
  {gp:'E',  symbol:18, poly:[11,1],   degree:1},
];
assert.deepEqual(factors.map(f=>corpus.translit[f.symbol]),
  factors.map(f=>f.gp));
const sevenPoly = factors.map(f=>f.poly).reduce(product,[1]);
assert.deepEqual(characteristic(M), sevenPoly);
const fiveRoots=factors.map(f=>f.symbol);
assert.deepEqual(characteristic(B),
  fiveRoots.map(x=>[mod(-x),1]).reduce(product,[1]));
assert.deepEqual(fiveRoots,[5,8,24,21,18]);
// The two quadratics are irreducible. Their Frobenius conjugate-pair
// traces are exactly C=5 and NG=21. The other three factors are linear.
for(const f of factors.filter(f=>f.degree===2)) {
  assert(Array.from({length:29},(_,x)=>
    f.poly.reduceRight((s,c)=>mod(s*x+c),0)).every(v=>v!==0));
}
const tracePolynomial=[19,25,22,1,14,3,3];
for (const f of factors) {
  assert.deepEqual(remainder(tracePolynomial,f.poly),[f.symbol]);
}
const traceOperator=atMatrix(tracePolynomial,M);
assert.deepEqual(atMatrix(characteristic(B),traceOperator),
  Array.from({length:7},()=>Array(7).fill(0)));
assert.deepEqual(characteristic(traceOperator),
  [[5,2],[8,1],[24,1],[21,2],[18,1]].reduce((poly,[root,m])=>
    Array.from({length:m}).reduce(p=>product(p,[mod(-root),1]),poly),[1]));
// This link is source-native, but neither source square instructs a GP29
// plaintext receiver or field-trace order. Test just its shortest canonical
// seven-coefficient interpretation rather than tuning cipher parameters.
/** Evaluate polynomial in a linear factor x-root over GF29. */
function evaluate(a,root) {
  return a.reduceRight((s,v)=>mod(s*root+v),0);
}
/** Low-degree remainder modulo x^2 -t*x + norm, as a+b*x. */
function quadraticRemainder(a,t,norm) {
  let x0=0,x1=0;
  for(let i=a.length-1;i>=0;i-=1) {
    [x0,x1]=[mod(a[i]-norm*x1), mod(x0+t*x1)];
  }
  return [x0,x1];
}
/** Input 7 original GP29 rune values as ascending polynomial coefficients.
 * Output 5 trace symbols in CHANGE order and 2 lossless residual symbols.
 */
function fieldTrace(a) {
  const [c0,c1]=quadraticRemainder(a,5,16);
  const [n0,n1]=quadraticRemainder(a,21,8);
  return [mod(2*c0+5*c1),evaluate(a,8),evaluate(a,24),
    mod(2*n0+21*n1),evaluate(a,18),c1,n1];
}
const map=Array.from({length:7},()=>[]);
for(let col=0;col<7;col+=1) {
  const e=Array(7).fill(0);e[col]=1;
  fieldTrace(e).forEach((v,row)=>map[row].push(v));
}
assert.deepEqual(map,[
  [2,5,22,1,1,18,16],
  [1,8,6,19,7,27,13],
  [1,24,25,20,16,7,23],
  [2,21,19,28,1,0,21],
  [1,18,5,3,25,15,9],
  [0,1,5,9,23,0,9],
  [0,1,21,27,22,14,2],
]);
const unmap=inverse(map);
assert.deepEqual(multiply(map,unmap),identity(7));
assert.deepEqual(multiply(unmap,map),identity(7));
/** @param {number[]} tape @param {boolean} backwards */
function compress(tape,backwards) {
  assert.equal(tape.length%7,0);
  const gp=[],sidecar=[];
  for(let offset=0;offset<tape.length;offset+=7) {
    const block=tape.slice(offset,offset+7);
    const symbols=fieldTrace(backwards?[...block].reverse():block);
    gp.push(...symbols.slice(0,5));
    sidecar.push(...symbols.slice(5));
    let restored=vector(unmap,symbols);
    if(backwards) restored.reverse();
    assert.deepEqual(restored,block);
  }
  return {gp,sidecar};
}
/** @param {number[]} source */
function ioc(source) {
  const counts=Array(29).fill(0);
  for(const v of source) counts[v]+=1;
  return counts.reduce((a,n)=>a+n*(n-1),0)/(source.length*(source.length-1));
}
/** Reversible GF29 Hill receiver using the unique factor-trace polynomial. */
function hillBlocks(M, tape) {
  assert.equal(tape.length%M.length,0);
  const out=[];
  for(let i=0;i<tape.length;i+=M.length) {
    out.push(...vector(M,tape.slice(i,i+M.length)));
  }
  return out;
}
const transpose=M=>M[0].map((_,j)=>M.map(r=>r[j]));
const originalChapter=corpus.pages.filter(p=>p.page>=33&&p.page<=39)
  .flatMap(p=>p.indices);
assert.equal(originalChapter.length,1680);
const native91=corpus.pages.find(p=>p.page===57).indices.slice(0,91);
const traceInverse=inverse(traceOperator);
const hillOperators=[
  ['T(M)',traceOperator,traceInverse],
  ['T(M)^-1',traceInverse,traceOperator],
  ['T(M)^T',transpose(traceOperator),transpose(traceInverse)],
  ['T(M)^-T',transpose(traceInverse),transpose(traceOperator)],
];
const hillOutcomes=[];
for (const [name,op,undo] of hillOperators) {
  const decoded=hillBlocks(op,originalChapter);
  assert.deepEqual(hillBlocks(undo,decoded),originalChapter);
  const plant=hillBlocks(undo,native91);
  assert.deepEqual(hillBlocks(op,plant),native91);
  hillOutcomes.push({name,sourceRunes:originalChapter.length,
    decodedIoc:ioc(decoded),opening:decoded.slice(0,30)
      .map(v=>corpus.translit[v]).join(' ')});
}
assert(hillOutcomes.every(o=>o.decodedIoc<0.04));

const outputs=[];
for(const [begin,end,expected] of [[8,14,1729],[33,39,1680],[54,55,308]]) {
  const input=corpus.pages.filter(p=>p.page>=begin&&p.page<=end)
    .flatMap(p=>p.indices);
  assert.equal(input.length,expected);
  for(const backward of [false,true]) {
    const result=compress(input,backward);
    const record={
      chapter:`p${begin}-${end}`, backwards:backward,
      sourceRunes:input.length, gpRunes:result.gp.length,
      residualRunes:result.sidecar.length,
      sourceIoc:ioc(input), gpIoc:ioc(result.gp),
      sidecarIoc:ioc(result.sidecar),
      gpOpening:result.gp.slice(0,30).map(i=>corpus.translit[i]).join(' '),
    };
    assert(record.gpIoc<0.04);
    outputs.push(record);
  }
}
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(p57.length,95);
const planted=[];
for(let i=0;i<p57.length;i+=5) {
  planted.push(...vector(unmap,[...p57.slice(i,i+5),0,0]));
}
assert.equal(planted.length,133);
const recovered=compress(planted,false);
assert.deepEqual(recovered.gp,p57);
assert(recovered.sidecar.every(x=>x===0));
assert(ioc(p57)>0.06);
console.log(JSON.stringify({
  source:'original 2014 two 1033-sum magic squares',
  sevenCharacteristicAscending:sevenPoly,
  fiveCharacteristicAscending:characteristic(B),
  factors:factors.map(({gp,symbol,poly,degree})=>({gp,symbol,poly,degree})),
  exactSharedFactorTraces:fiveRoots,
  uniqueTracePolynomialAscending:tracePolynomial,
  traceCarrierMatrix:map,
  realSourceOutputs:outputs,
  sevenSquareTraceHillOriginalChapter:hillOutcomes,
  solvedP57Plant:'95/95 trace symbols recovered from 133 encoded runes',
  verdict:'Original-source spectral coincidence and lossless field-trace carrier; no unknown LP2 plaintext or authenticated key.',
},null,2));
