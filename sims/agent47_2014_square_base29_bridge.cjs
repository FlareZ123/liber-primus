#!/usr/bin/env node
'use strict';

/**
 * Cross-round LP1 p5 / 2014 OpenPuff / 2013 BASE29 gate.
 * Checks the exact 5x5 matrix reuse, 1033 <-> 3301 reversal, BASE29 value 3QO,
 * and a bounded first use of 3QO plus the two 2014 5x5 matrices on LP2.
 *
 * Run: node sims/agent47_2014_square_base29_bridge.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const readBuffer = p => fs.readFileSync(path.join(root, p));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const { decode: decodeLp1Page05 } = require('./jpeg05_palindromic_magic.cjs');
const lp1 = decodeLp1Page05(readBuffer('resources/liber-primus/05.jpg'));

const magicSquares = read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\r?\n\s*\r?\n/u)
  .map(block => block.split(/\r?\n/u).map(line => line.trim().split(/\s+/u).map(Number)));
assert.deepEqual(magicSquares.map(m => [m.length, m[0].length]), [[5,5],[7,7],[5,5]]);
const A = magicSquares[0];             // 2014 first 5x5, magic sum 3301
const B = magicSquares[2];             // 2014 third 5x5, magic sum 1033
assert.deepEqual(lp1.square, B);       // Exact cell-for-cell LP1 p5 reuse.
function magicSum(M) { return M[0].reduce((s, _, j) => s + M[0][j], 0); }
function allMagicSums(M) {
  const n = M.length;
  return [
    ...M.map(row => row.reduce((s, x) => s + x, 0)),
    ...Array.from({length:n}, (_,j) => M.reduce((s,row) => s + row[j], 0)),
    M.reduce((s,row,i) => s + row[i], 0),
    M.reduce((s,row,i) => s + row[n-1-i], 0)
  ];
}
assert.ok(allMagicSums(A).every(x => x === 3301));
assert.ok(allMagicSums(B).every(x => x === 1033));
const reverseDigits = n => Number(String(n).split('').reverse().join(''));
const isPrime = n => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};
function primesUpTo(n) {
  const out = [];
  for (let x = 2; x <= n; x++) if (isPrime(x)) out.push(x);
  return out;
}
const primeList = primesUpTo(3301);
const primeOrdinal = n => primeList.indexOf(n) + 1;
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
function toBase29(n) {
  let out = '';
  do { out = alphabet[n % 29] + out; n = Math.floor(n / 29); } while (n > 0);
  return out;
}
assert.equal(reverseDigits(3301), 1033);
assert.ok(isPrime(3301) && isPrime(1033));
assert.equal(primeOrdinal(1033), 174);
assert.equal(174, 29 * 6);
assert.equal(1033 % 29, 18);
assert.equal(3301 % 29, 24);
assert.equal(toBase29(3301), '3QO');
assert.equal(toBase29(1033), '16I');

const mod = x => ((x % 29) + 29) % 29;
const keyDigits = [...toBase29(3301)].map(ch => alphabet.indexOf(ch));
assert.deepEqual(keyDigits, [3,26,24]);
const reverseKey = keyDigits.slice().reverse();
const pages = corpus.pages.filter(p => p.page >= 0 && p.page <= 55 && p.indices.length);
const whole = pages.flatMap(p => p.indices);
const p53PlusAc = [...corpus.pages.find(p => p.page === 53).indices,
  corpus.pages.find(p => p.page === 54).indices[0]];
const knownPlain = [...corpus.pages.find(p => p.page === 56).indices,
  ...corpus.pages.find(p => p.page === 57).indices];
const tableInterior = grid.byte_rows.slice(1,31).flatMap(row => row.slice(1,7)).map(x => mod(x));
assert.deepEqual([whole.length, pages.length, p53PlusAc.length, knownPlain.length, tableInterior.length],
  [12956, 55, 180, 180, 180]);

const tokens = corpus.translit.map((s,i) => ({s,i})).sort((a,b) => b.s.length-a.s.length);
function gpEnglish(text) {
  const normalized = text.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S');
  const out = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i=0; i<word.length;) {
      const token = tokens.find(t => word.startsWith(t.s,i));
      if (!token) break;
      out.push(token.i); i += token.s.length;
    }
  }
  return out;
}
const native = gpEnglish(read('resources/control/shakespeare_first300k.txt'));
const train = native.slice(0,100000);
const trigram = new Uint32Array(29 ** 3), context = new Uint32Array(29 ** 2);
for (let i=2; i<train.length; i++) {
  const pair = train[i-2] * 29 + train[i-1];
  trigram[pair * 29 + train[i]]++;
  context[pair]++;
}
function trigramScore(a) {
  let score = 0;
  for (let i=2; i<a.length; i++) {
    const pair = a[i-2] * 29 + a[i-1];
    score += Math.log((trigram[pair * 29 + a[i]] + 0.1) / (context[pair] + 2.9));
  }
  return score / (a.length - 2);
}
const operations = {
  subtract: (c,k) => mod(c-k),
  add: (c,k) => mod(c+k),
  beaufort: (c,k) => mod(k-c)
};
const base29KeyTests = [];
for (const [keyName,key] of [['3QO',keyDigits],['OQ3',reverseKey]]) {
  for (const [operation,apply] of Object.entries(operations)) {
    const continuous = whole.map((c,i) => apply(c,key[i % 3]));
    const pageReset = pages.flatMap(p => p.indices.map((c,i) => apply(c,key[i % 3])));
    const p53 = p53PlusAc.map((c,i) => apply(c,key[i % 3]));
    const table = tableInterior.map((c,i) => apply(c,key[i % 3]));
    base29KeyTests.push({
      key: keyName, operation,
      wholeTrigram: trigramScore(continuous),
      pageResetTrigram: trigramScore(pageReset),
      p53PlusAcTrigram: trigramScore(p53),
      tableExactMatchesAgainstPp56Pp57: table.filter((v,i) => v === knownPlain[i]).length
    });
  }
}

const mod29 = M => M.map(row => row.map(mod));
const Am = mod29(A), Bm = mod29(B);
function determinant(M) {
  const n=M.length, X=M.map(r=>r.slice());
  let det=1;
  const inv=a=>{for(let x=1;x<29;x++)if(mod(a*x)===1)return x;return null;};
  for(let col=0;col<n;col++){
    let pivot=col; while(pivot<n && X[pivot][col]===0)pivot++;
    if(pivot===n)return 0;
    if(pivot!==col){[X[pivot],X[col]]=[X[col],X[pivot]];det=mod(-det);}
    const p=X[col][col]; det=mod(det*p); const ip=inv(p);
    for(let r=col+1;r<n;r++){
      const f=mod(X[r][col]*ip);
      for(let j=col;j<n;j++)X[r][j]=mod(X[r][j]-f*X[col][j]);
    }
  }
  return det;
}
function matrixMultiply(X,Y) {
  return X.map(row => Y[0].map((_,j) => mod(row.reduce((s,x,k) => s + x*Y[k][j],0))));
}
function matrixInverse(M) {
  const n=M.length, X=M.map((r,i)=>r.concat(Array.from({length:n},(_,j)=>i===j?1:0)));
  const inv=a=>{for(let x=1;x<29;x++)if(mod(a*x)===1)return x;return null;};
  for(let col=0;col<n;col++){
    let pivot=col; while(pivot<n && X[pivot][col]===0)pivot++;
    if(pivot===n)return null;
    [X[col],X[pivot]]=[X[pivot],X[col]];
    const ip=inv(X[col][col]); X[col]=X[col].map(v=>mod(v*ip));
    for(let r=0;r<n;r++)if(r!==col){
      const f=X[r][col]; if(f)X[r]=X[r].map((v,j)=>mod(v-f*X[col][j]));
    }
  }
  return X.map(r=>r.slice(n));
}
function transpose(M) { return M[0].map((_,j)=>M.map(row=>row[j])); }
function applyHill(M, sequence, orientation) {
  const out=[];
  for(let k=0;k<sequence.length;k+=5){
    const block=sequence.slice(k,k+5);
    if(orientation==='column') for(let i=0;i<5;i++)
      out.push(mod(M[i].reduce((s,v,j)=>s+v*block[j],0)));
    else for(let j=0;j<5;j++)
      out.push(mod(M.reduce((s,row,i)=>s+block[i]*row[j],0)));
  }
  return out;
}
const AB=matrixMultiply(Am,Bm), BA=matrixMultiply(Bm,Am);
const identity=Array.from({length:5},(_,i)=>Array.from({length:5},(_,j)=>i===j?1:0));
assert.notDeepEqual(AB,identity);
assert.notDeepEqual(BA,identity);
const matrixCandidates=[
  ['A',Am],['B',Bm],['A*B',AB],['B*A',BA],
  ['A^-1',matrixInverse(Am)],['B^-1',matrixInverse(Bm)],
  ['(A*B)^-1',matrixInverse(AB)],['(B*A)^-1',matrixInverse(BA)]
];
const matrixTableTests=[];
for(const [name,M] of matrixCandidates) for(const orientation of ['column','row']){
  const decoded=applyHill(M,tableInterior,orientation);
  matrixTableTests.push({
    matrix:name,orientation,
    exactMatchesAgainstPp56Pp57:decoded.filter((v,i)=>v===knownPlain[i]).length
  });
}
matrixTableTests.sort((a,b)=>b.exactMatchesAgainstPp56Pp57-a.exactMatchesAgainstPp56Pp57);

const result={
  classification:'exact cross-round matrix identity; candidate key tests negative; no LP2 plaintext recovered',
  crossRound:{
    lp1Page05MatrixEquals2014Third5x5:true,
    first2014MagicConstant:3301,lp1AndThird2014MagicConstant:1033,
    reverse3301:reverseDigits(3301),bothPrime:true,
    primeOrdinal1033:primeOrdinal(1033),174Equals29Times6:true,
    base29_3301:toBase29(3301),base29_1033:toBase29(1033),
    determinantsMod29:{first5x5:determinant(Am),third5x5:determinant(Bm),
      productAB:determinant(AB),productBA:determinant(BA)},
    productsAreIdentity:false
  },
  rawTrigram:{whole:trigramScore(whole),p53PlusAc:trigramScore(p53PlusAc)},
  base29KeyTests,
  matrixTableTests,
  decision:'The exact 2014/LP1 reuse and reverse-3301→BASE29 path are established; 3QO as a simple Vigenere/Beaufort key and the 5x5 matrix/product Hill interpretations do not recover known LP2 plaintext.'
};
console.log(JSON.stringify(result,null,2));
