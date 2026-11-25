"use strict";
/*
 * Source-constrained test of the physical p15 4x4 numeric grid as a
 * standard Hill key over the 29-symbol Gematria Primus alphabet.
 *
 * Run from repository root:
 *   node sims/lp2_p15_hill_source_gate_sft.cjs
 *
 * Inputs are the committed canonical LP2 rune corpus and original p15 JPEG.
 * The p15 prime sequence is reconstructed from the printed 4x4 grid using
 * the established 3301 - p_(F+1) relation and the source-visible spiral.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const image = fs.readFileSync(path.join(root, "resources/liber-primus/32.jpg"));
const imageSHA256 = crypto.createHash("sha256").update(image).digest("hex");
assert.equal(imageSHA256, "5543cfce96493b86eece3195b3f5ea6e779ff41551676600b0c2479fc18c0ec5");

const page = n => corpus.pages.find(p => p.page === n);
const fullTape = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const targetTape = corpus.pages.filter(p => p.page >= 16 && p.page <= 22).flatMap(p => p.indices);
const p57 = page(57).indices;
assert.equal(page(15).runic_count, 159);
assert.equal(targetTape.length, 1744);
assert.equal(fullTape.length, 12956);
assert.equal(p57.length, 95);
assert.equal(targetTape.length % 4, 0);
assert.equal(fullTape.length % 4, 0);

const printedGrid = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const spiral = [
  [1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],
  [0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]
];
const fibIndex = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];

function isPrime(n) {
  if (!Number.isSafeInteger(n) || n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
const primes = [];
for (let n = 2; n <= 10000; n++) if (isPrime(n)) primes.push(n);

const primeGrid = Array.from({length:4}, () => Array(4).fill(null));
const signedOffsetGrid = Array.from({length:4}, () => Array(4).fill(null));
const sequence = [];
for (let i = 0; i < fibIndex.length; i++) {
  const p = primes[fibIndex[i]]; // p_(F+1), with zero-based F
  const signedOffset = 3301 - p;
  const [r,c] = spiral[i];
  assert.equal(Math.abs(signedOffset), printedGrid[r][c]);
  primeGrid[r][c] = p;
  signedOffsetGrid[r][c] = signedOffset;
  sequence.push({step:i, fibIndex:fibIndex[i], prime:p, signedOffset, cell:[r,c]});
}
assert.equal(sequence[0].prime, 2);
assert.equal(sequence[15].prime, 7817);
assert.deepEqual(signedOffsetGrid[3], [-4516, -1206, 708, 1820]);

const MOD = 29;
const mod = x => ((x % MOD) + MOD) % MOD;
function egcd(a,b) {
  if (b === 0) return [a,1,0];
  const [g,x,y] = egcd(b,a%b);
  return [g,y,x-Math.floor(a/b)*y];
}
function modInverse(a) {
  const [g,x] = egcd(mod(a), MOD);
  if (g !== 1) throw new Error("noninvertible pivot " + a);
  return mod(x);
}
function determinant(matrix) {
  const a = matrix.map(row => row.slice());
  let det = 1;
  for (let col = 0; col < 4; col++) {
    let pivot = col;
    while (pivot < 4 && a[pivot][col] === 0) pivot++;
    if (pivot === 4) return 0;
    if (pivot !== col) {
      [a[pivot],a[col]] = [a[col],a[pivot]];
      det = mod(-det);
    }
    const value = a[col][col];
    det = mod(det * value);
    const inv = modInverse(value);
    for (let row = col + 1; row < 4; row++) {
      const factor = mod(a[row][col] * inv);
      for (let k = col; k < 4; k++) a[row][k] = mod(a[row][k] - factor*a[col][k]);
    }
  }
  return det;
}
function matrixInverse(matrix) {
  const a = matrix.map((row,i) => [
    ...row,
    ...Array.from({length:4},(_,j) => i === j ? 1 : 0)
  ]);
  for (let col = 0; col < 4; col++) {
    let pivot = col;
    while (pivot < 4 && a[pivot][col] === 0) pivot++;
    if (pivot === 4) throw new Error("singular matrix");
    [a[pivot],a[col]] = [a[col],a[pivot]];
    const scale = modInverse(a[col][col]);
    a[col] = a[col].map(x => mod(x*scale));
    for (let row = 0; row < 4; row++) {
      if (row === col) continue;
      const factor = a[row][col];
      a[row] = a[row].map((x,k) => mod(x-factor*a[col][k]));
    }
  }
  return a.map(row => row.slice(4));
}
function transformBlocks(tape, matrix, vectorConvention) {
  assert.equal(tape.length % 4, 0, "continuous tape must contain complete 4-rune blocks");
  const output = [];
  for (let i = 0; i < tape.length; i += 4) {
    const block = tape.slice(i, i+4);
    if (vectorConvention === "column") {
      output.push(...matrix.map(row => mod(row.reduce((sum,x,j) => sum+x*block[j],0))));
    } else {
      output.push(...Array.from({length:4},(_,j) =>
        mod(block.reduce((sum,x,i) => sum+x*matrix[i][j],0))
      ));
    }
  }
  return output;
}
function ioc(tape) {
  const counts = Array(MOD).fill(0);
  for (const x of tape) counts[x]++;
  return counts.reduce((sum,n) => sum+n*(n-1),0)/(tape.length*(tape.length-1));
}
function topCounts(tape) {
  const counts = Array(MOD).fill(0);
  for (const x of tape) counts[x]++;
  return counts.map((count,index)=>({index,count})).sort((a,b)=>b.count-a.count).slice(0,6);
}

const matrixSources = [
  {name:"printed-magnitudes", values:printedGrid.flat()},
  {name:"recovered-prime-values", values:primeGrid.flat()},
  {name:"signed-3301-offsets", values:signedOffsetGrid.flat()}
];
const outputs = [];
const roundTrips = [];
for (const source of matrixSources) {
  const matrix = Array.from({length:4},(_,i)=>source.values.slice(i*4,i*4+4).map(mod));
  const det = determinant(matrix);
  assert.notEqual(det,0);
  const inverse = matrixInverse(matrix);
  for (const convention of ["column","row"]) {
    const sample = p57.slice(0,92);
    const encrypted = transformBlocks(sample,matrix,convention);
    const recovered = transformBlocks(encrypted,inverse,convention);
    assert.deepEqual(recovered,sample);
    roundTrips.push({matrix:source.name,convention,verified:recovered.length+"/"+sample.length});
  }
  for (const [scope,tape] of [["p16-22",targetTape],["p0-55",fullTape]]) {
    for (const [operation,key] of [
      ["inverse",inverse], // standard Hill decryption if matrix is the encryption key
      ["direct",matrix]    // if the displayed matrix is itself the decryption transform
    ]) {
      for (const convention of ["column","row"]) {
        const decoded = transformBlocks(tape,key,convention);
        outputs.push({
          matrix:source.name,
          determinantMod29:det,
          scope,
          operation,
          convention,
          ioc:ioc(decoded),
          topSymbols:topCounts(decoded)
        });
      }
    }
  }
}
const raw = {
  p16_22:ioc(targetTape),
  p0_55:ioc(fullTape),
  p57:ioc(p57)
};
console.log(JSON.stringify({
  classification:"BOUNDED NEGATIVE FOR THE TESTED PHYSICAL 4x4 GP29 HILL RECEIVER",
  sourceImage:"resources/liber-primus/32.jpg",
  sourceImageSHA256:imageSHA256,
  p15PrimeConstruction:{
    formula:"signedOffset = 3301 - p_(F+1)",
    fibIndices:fibIndex,
    spiralSequence:sequence,
    printedGrid,
    recoveredPrimeGrid:primeGrid,
    signedOffsetGrid
  },
  tapes:{
    p16_22:{runes:targetTape.length,blocks:targetTape.length/4,ioc:raw.p16_22},
    p0_55:{runes:fullTape.length,blocks:fullTape.length/4,ioc:raw.p0_55},
    p57ClearControl:{runes:p57.length,ioc:raw.p57}
  },
  matrixDeterminantsMod29:matrixSources.map(source=>({
    name:source.name,
    determinant:determinant(Array.from({length:4},(_,i)=>source.values.slice(i*4,i*4+4).map(mod)))
  })),
  syntheticRoundTrips:roundTrips,
  outputs
},null,2));
