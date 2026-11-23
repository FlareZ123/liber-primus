'use strict';

/**
 * Original LP2 p50 H*G quotient -> historical 2014 1033-square 7-to-5
 * Frobenius trace and physical intertwiner -> terminal p56+p57 known 180
 * GP29 symbols. Genuine-original negative with full lossless positive plant.
 *
 * Node.js 22, CommonJS, Windows 11, read-only, zero dependencies.
 * Run: node sims/lp2_p50_q252_sevenfive_terminal180_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const source = read('resources/cicada2014-openpuff-magic-squares.txt');
const squares = source.trim().split(/\r?\n\s*\r?\n/).map(block =>
  block.trim().split(/\r?\n/).map(line => line.trim().split(/\s+/).map(Number)));

const mod = x => ((x % 29) + 29) % 29;
/** @param {number} v @returns {number} */
function inverseScalar(v) {
  for (let i = 1; i < 29; i++) if (mod(i * v) === 1) return i;
  throw Error('nonunit GF29 scalar');
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function polynomialProduct(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] = mod(result[i + j] + a[i] * b[j]);
    }
  }
  return result;
}
/**
 * Polynomial high-degree-first exact division, preserving coefficient width.
 * @param {number[]} numerator
 * @param {number[]} denominator
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(numerator, denominator) {
  const left = numerator.map(mod);
  const divisor = denominator.map(mod);
  const q = [];
  const inv = inverseScalar(divisor[0]);
  for (let i = 0; i <= left.length - divisor.length; i++) {
    const multiplier = mod(left[i] * inv);
    q.push(multiplier);
    for (let j = 0; j < divisor.length; j++) {
      left[i + j] = mod(left[i + j] - multiplier * divisor[j]);
    }
  }
  return { quotient: q, remainder: left.slice(q.length) };
}
/** @param {number} n @returns {number[][]} */
const identity = n => Array.from({length:n}, (_,i) =>
  Array.from({length:n}, (_,j) => Number(i === j)));
/** @param {number[][]} A @param {number[][]} B @returns {number[][]} */
function multiply(A, B) {
  assert.equal(A[0].length, B.length);
  return A.map(row => B[0].map((_,j) =>
    mod(row.reduce((sum,v,k) => sum + v * B[k][j], 0))));
}
/** @param {number[][]} M @param {number[]} v @returns {number[]} */
const transform = (M, v) => M.map(row =>
  mod(row.reduce((sum,x,j) => sum + x * v[j], 0)));
/** @param {number[][]} A @returns {number[][]} */
function invert(A) {
  const n = A.length;
  assert(A.every(row => row.length === n));
  const M = A.map((row,i) => [...row.map(mod), ...identity(n)[i]]);
  for (let i = 0; i < n; i++) {
    let pivot = i;
    while (pivot < n && M[pivot][i] === 0) pivot++;
    assert(pivot < n, 'finite-field transform must be invertible');
    [M[i], M[pivot]] = [M[pivot], M[i]];
    const scale = inverseScalar(M[i][i]);
    M[i] = M[i].map(v => mod(v * scale));
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const multiplier = M[j][i];
      M[j] = M[j].map((v,k) => mod(v - multiplier * M[i][k]));
    }
  }
  return M.map(row => row.slice(n));
}
/** @param {number[][]} M @returns {number[][]} */
const transpose = M => M[0].map((_,j) => M.map(row => row[j]));
/** @param {number[][]} M @param {number[]} p @returns {number[][]} */
function polynomialOfMatrix(M, p) {
  const n = M.length;
  let acc = Array.from({length:n}, () => Array(n).fill(0));
  let power = identity(n);
  for (const coefficient of p) {
    acc = acc.map((row,i) => row.map((v,j) => mod(v + coefficient * power[i][j])));
    power = multiply(power, M);
  }
  return acc;
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const value of a) counts[value]++;
  return counts.reduce((acc,v) => acc + v * (v - 1), 0) / (a.length * (a.length - 1));
}
/** @param {number[]} a @param {number[]} b @returns {number} */
function matches(a, b) {
  assert.equal(a.length, b.length);
  return a.reduce((n,value,i) => n + Number(value === b[i]), 0);
}

/* Both polynomial factors are independently present in the original sources. */
assert.deepEqual(squares.map(M => M.length), [5,7,5]);
for (const i of [1,2]) {
  assert(squares[i].every(row => row.reduce((acc,x) => acc+x, 0) === 1033));
}
const H = [3,26,24];             // Authentic 2013 signed BASE29(3301) low first
const G = [27,5,15];             // Physical original p39 red runes low first
const GF29 = polynomialProduct(H,G).reverse();
assert.deepEqual(GF29, [12,17,11,21,23]);
assert.deepEqual(gp.pages[39].indices.slice(119,122), G);
assert.equal(grid.bytes.length, 256);
const {quotient:q, remainder} = divide(grid.bytes, GF29);
assert.deepEqual(remainder, [0,0,0,0]);
assert.equal(q.length, 252);
assert.deepEqual(q.slice(0,16), [0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21]);
assert.deepEqual(q.slice(-8), [18,2,14,8,27,19,4,6]);

/*
 * Formal 7-to-(5+2) irreducible-factor trace packet, in source-derived
 * C,H,A,NG,E order. The last two coordinates are indispensable for an
 * invertible transport and are explicitly retained.
 */
const F = [
 [2,5,22,1,1,18,16],
 [1,8,6,19,7,27,13],
 [1,24,25,20,16,7,23],
 [2,21,19,28,1,0,21],
 [1,18,5,3,25,15,9],
 [0,1,5,9,23,0,9],
 [0,1,21,27,22,14,2]
];
const Fi = invert(F);
assert.deepEqual(multiply(F,Fi),identity(7));
assert.deepEqual(multiply(Fi,F),identity(7));

/*
 * Independently previously established full-rank physical intertwiner of
 * original printed seven- and five-squares: L*T(M)=B*L.
 */
const L = [
 [22,18,28,21,20,18,19],
 [10,7,1,2,23,9,7],
 [19,27,10,25,11,23,2],
 [14,12,27,19,20,14,11],
 [2,3,1,0,22,3,28]
];
const M7 = squares[1].map(row => row.map(mod));
const M5 = squares[2].map(row => row.map(mod));
const T = polynomialOfMatrix(M7,[19,25,22,1,14,3,3]);
assert.deepEqual(multiply(L,T),multiply(M5,L));

/** @param {number[][]} matrix @param {number[]} input @returns {number[]} */
function packets(matrix, input) {
  assert.equal(input.length % 7, 0);
  const output=[];
  for (let offset=0; offset<input.length; offset+=7) {
    output.push(...transform(matrix,input.slice(offset,offset+7)));
  }
  return output;
}
const sourceFull = packets(F,q);
const formal = Array.from({length:36},(_,i)=>sourceFull.slice(i*7,i*7+5)).flat();
const side = Array.from({length:36},(_,i)=>sourceFull.slice(i*7+5,i*7+7)).flat();
const physical = packets(L,q);
assert.deepEqual([formal.length,side.length,physical.length],[180,72,180]);

/* Reconstruct p56's exact historical solved-language register independently. */
const p56English =
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO ' +
  'IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE';
const gpMap = new Map(gp.translit.map((token,i)=>[token,i]));
gpMap.set('ING',21);
/** @param {string} plaintext @returns {number[]} */
function encodeGP(plaintext) {
  const result=[];
  for (let word of plaintext.toUpperCase().match(/[A-Z]+/g) || []) {
    word=word.replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');
    for (let i=0; i<word.length;) {
      let found=false;
      for (const n of [3,2,1]) {
        const k=gpMap.get(word.slice(i,i+n));
        if (k !== undefined) {
          result.push(k);
          i+=n;
          found=true;
          break;
        }
      }
      assert(found,'invalid historical GP encoding');
    }
  }
  return result;
}
const p56=encodeGP(p56English);
const p56cipher=gp.pages[56].indices;
const p57=gp.pages[57].indices;
const p55=gp.pages[55].indices;
assert.deepEqual([p55.length,p56.length,p56cipher.length,p57.length],[76,85,85,95]);
const known=[...p56,...p57];
const hybrid=[...p56cipher,...p57];
assert.equal(known.length, 180);
assert.equal(76+85+95, 256);

/* Authentic p56 cipher cross-check with correct literal-F skipped prime clock. */
const primes=[];
for (let n=2;primes.length<85;n++) {
  let prime=true;
  for (let d=2;d*d<=n;d++) if(n%d===0){prime=false;break;}
  if (prime) primes.push(n);
}
let clock=0;
for (let i=0;i<p56.length;i++) {
  if(p56[i]===0) {
    assert.equal(p56cipher[i],0);
  } else {
    assert.equal(p56cipher[i],mod(p56[i]+primes[clock]-1));
    clock++;
  }
}
assert.equal(clock,84);
assert.equal(p56.indexOf(0),56);
const observedKey=p56cipher.map((c,i) => p56[i]===0?null:mod(c-p56[i]));
/** @param {number[]} stream @returns {number} */
function bestKnownKeyMatches(stream) {
  let best=0;
  for (const reverse of [false,true]) {
    const data=reverse?stream.slice().reverse():stream;
    for (let offset=0;offset<=data.length-85;offset++) {
      for (const sign of [-1,1]) {
        let count=0;
        for(let i=0;i<85;i++) {
          if(observedKey[i]!==null && mod(sign*data[offset+i])===observedKey[i]) count++;
        }
        best=Math.max(best,count);
      }
    }
  }
  return best;
}
assert.equal(bestKnownKeyMatches(formal),8);
assert.equal(bestKnownKeyMatches(physical),7);

/* Original source data, exact untouched terminal checks. */
const observation={
  sourceBytes:256,sourceFactorDegree:4,zeroRemainder:remainder,
  coefficientQuotient:q.length,sevenRunePackets:36,
  terminalOriginalLengths:[76,85,95],
  projectionDimensions:[180,72,4],
  knownTerminalIoC:ioc(known),
  formal:{
    ioc:ioc(formal),
    exactKnownPlaintext:matches(formal,known),
    exactHybridCipherPlain:matches(formal,hybrid),
    exactP57Plaintext:matches(formal.slice(85),p57),
    bestKnownP56TotientKeyMatch:bestKnownKeyMatches(formal)
  },
  physical:{
    ioc:ioc(physical),
    exactKnownPlaintext:matches(physical,known),
    exactHybridCipherPlain:matches(physical,hybrid),
    exactP57Plaintext:matches(physical.slice(85),p57),
    bestKnownP56TotientKeyMatch:bestKnownKeyMatches(physical)
  },
  sidecar:{
    firstFourOmittedP55:matches(side,p55.slice(4)),
    lastFourOmittedP55:matches(side,p55.slice(0,72)),
    firstFourOmittedP55Reversed:matches(side,p55.slice(4).reverse()),
    lastFourOmittedP55Reversed:matches(side,p55.slice(0,72).reverse())
  }
};
assert.equal(observation.formal.exactKnownPlaintext,6);
assert.equal(observation.formal.exactHybridCipherPlain,5);
assert.equal(observation.formal.exactP57Plaintext,3);
assert.equal(observation.physical.exactKnownPlaintext,6);
assert.equal(observation.physical.exactHybridCipherPlain,8);
assert.equal(observation.physical.exactP57Plaintext,5);
assert.deepEqual(observation.sidecar,{
  firstFourOmittedP55:2,
  lastFourOmittedP55:3,
  firstFourOmittedP55Reversed:6,
  lastFourOmittedP55Reversed:4
});
assert(Math.abs(observation.formal.ioc-0.035381750465549346)<1e-14);
assert(Math.abs(observation.physical.ioc-0.034698944754810675)<1e-14);
assert(Math.abs(observation.knownTerminalIoC-0.0675356921166977)<1e-14);

/*
 * Genuine solved-original p56+p57 positive, 180 GP runes, with 72
 * independently fixed zero sidecar values. F^-1 constructs the 252
 * symbols; the SAME F recovers 180/180 and 72/72 with exact roundtrip.
 */
const plantedQ=[];
for(let i=0;i<36;i++) {
  const packet=[...known.slice(5*i,5*i+5),0,0];
  plantedQ.push(...transform(Fi,packet));
}
assert.equal(plantedQ.length,252);
const planted=packets(F,plantedQ);
const restored=Array.from({length:36},(_,i)=>planted.slice(i*7,i*7+5)).flat();
const plantedSide=Array.from({length:36},(_,i)=>planted.slice(i*7+5,i*7+7)).flat();
assert.deepEqual(restored,known);
assert.deepEqual(plantedSide,Array(72).fill(0));
assert.deepEqual(packets(Fi,planted),plantedQ);
assert.equal(matches(restored,known),180);

/* The source-terminal alignment is real; the proposed receiver fails. */
console.log(JSON.stringify({
  status:'PASS: source-terminal direct projection negative; no unknown plaintext or key',
  observation,
  plantedPositive:{recoveredKnownGP:180,sidecarRecovered:72,roundtrip:true}
},null,2));
