"use strict";
/**
 * LP2 pp29-30 polynomial-factor split of the signed p15 Fibonacci matrix.
 * Reproduce on Windows with Node.js 22:
 *   node sims/lp2_p29_p30_eigenfactor_original_sft.cjs
 * Reads original GP29 values and an independently archived rune-line transcript.
 * No external packages, mutation, fitted keys, or unknown plaintext assumptions.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const archive = read("resources/external/Liber Primus 57.txt");
const mod = n => (n % 29 + 29) % 29;
const pages = gp.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 12956);

/** Descending coefficients; the derivative is accumulated simultaneously. */
function evaluate(v, x) {
  let value = 0, derivative = 0;
  for (const c of v) {
    derivative = mod(derivative * x + value);
    value = mod(value * x + c);
  }
  return [value, derivative];
}
/** Divide by a monic quadratic in descending coefficient order. */
function divide(v, f) {
  const a = v.slice(), quotient = [];
  for (let i = 0; i < v.length - 2; i++) {
    const c = mod(a[i]);
    quotient.push(c);
    a[i + 1] = mod(a[i + 1] - c * f[1]);
    a[i + 2] = mod(a[i + 2] - c * f[2]);
  }
  return { quotient, remainder: a.slice(-2) };
}
/** Multiply arbitrary descending polynomials over GF(29). */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++) out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return out;
}
function ioc(v) {
  const f = Array(29).fill(0);
  for (const c of v) f[c]++;
  return f.reduce((s, x) => s + x * (x - 1), 0) / (v.length * (v.length - 1));
}
const aPage = pages.find(p => p.page === 29).indices;
const bPage = pages.find(p => p.page === 30).indices;
assert.equal(aPage.length, 277);
assert.equal(bPage.length, 263);

/* Factor pair of the independently established SIGNED p15 4x4 charpoly.
 * A=(x-24)^2=x^2+10x+25, B=(x-8)(x-17)=x^2+4x+20. */
const A = [1, 10, 25], B = [1, 4, 20];
assert.deepEqual(multiply(A, B), [1, 14, 27, 10, 7]);
assert.deepEqual(evaluate(aPage, 24), [0, 0]);
assert.equal(evaluate(bPage, 8)[0], 0);
assert.equal(evaluate(bPage, 17)[0], 0);
const aHits = pages.filter(p => evaluate(p.indices, 24).every(x => x === 0)).map(p => p.page);
const bHits = pages.filter(p => evaluate(p.indices, 8)[0] === 0 &&
  evaluate(p.indices, 17)[0] === 0).map(p => p.page);
assert.deepEqual(aHits, [29]);
assert.deepEqual(bHits, [30]);
assert.deepEqual(pages.filter(p => p.indices.at(-1) === p.indices.at(-2)).map(p => p.page), [30]);
const qa = divide(aPage, A), qb = divide(bPage, B);
assert.deepEqual(qa.remainder, [0, 0]);
assert.deepEqual(qb.remainder, [0, 0]);
assert.deepEqual(multiply(qa.quotient, A), aPage);
assert.deepEqual(multiply(qb.quotient, B), bPage);
assert.equal(qa.quotient.length, 275);
assert.equal(qb.quotient.length, 261);
assert(Math.abs(ioc(qa.quotient) - 0.034054412740544125) < 1e-12);
assert(Math.abs(ioc(qb.quotient) - 0.03524904214559387) < 1e-12);

/** Independently archived line-split rune transcription, physical scans 46/47. */
function getLines() {
  const runs = new Map(), index = new Map(gp.runes.map((r, i) => [r, i]));
  let current = -1;
  for (const line of archive.split(/\r?\n/)) {
    const tag = /^%(\d\d)\s*$/.exec(line);
    if (tag) {
      current = Number(tag[1]);
      if (current === 29 || current === 30) runs.set(current, []);
      continue;
    }
    if (current !== 29 && current !== 30) continue;
    const glyphs = [...line].filter(c => index.has(c)).map(c => index.get(c));
    if (glyphs.length) runs.get(current).push(glyphs);
  }
  return runs;
}
const printed = getLines();
for (const [p, source] of [[29, aPage], [30, bPage]]) {
  const lines = printed.get(p);
  assert.equal(lines.length, 12);
  assert.deepEqual(lines.flat(), source);
}
assert.deepEqual(printed.get(29).map(l => l.length), [22,26,22,23,23,23,23,23,24,22,24,22]);
assert.deepEqual(printed.get(30).map(l => l.length), [20,22,20,22,22,24,22,23,22,19,23,24]);

/** Exhaustive dynamic programming over 12! complete printed-line permutations.
 * Preserves every line's exact rune order, histogram and total length.
 * State is a pair of polynomial evaluation syndromes modulo 29.
 * The final contribution of a line appended after mask depends on mask only. */
function linePermutationCount(lines, which) {
  const n = lines.length, N = lines.flat().length, full = (1 << n) - 1;
  const roots = which === "A" ? [24] : [8, 17];
  const powers = new Map();
  for (const x of roots) {
    const p = Array(N + 1).fill(1);
    for (let i = 1; i <= N; i++) p[i] = mod(p[i - 1] * x);
    powers.set(x, p);
  }
  const evals = lines.map(l => roots.map(x => evaluate(l, x)));
  const length = new Uint16Array(1 << n);
  for (let mask = 1; mask <= full; mask++) {
    const bit = 31 - Math.clz32(mask & -mask);
    length[mask] = length[mask ^ (1 << bit)] + lines[bit].length;
  }
  const dp = Array.from({ length: full + 1 }, () => new Uint32Array(29 * 29));
  dp[0][0] = 1;
  for (let mask = 0; mask < full; mask++) {
    const src = dp[mask];
    for (let j = 0; j < n; j++) {
      if (mask & (1 << j)) continue;
      const e = N - length[mask] - lines[j].length;
      let a, b;
      if (which === "A") {
        const [v, d] = evals[j][0], pw = powers.get(24);
        a = mod(v * pw[e]);
        b = mod(d * pw[e] + (e ? e * v * pw[e - 1] : 0));
      } else {
        a = mod(evals[j][0][0] * powers.get(8)[e]);
        b = mod(evals[j][1][0] * powers.get(17)[e]);
      }
      const target = dp[mask | (1 << j)];
      for (let u = 0; u < 29; u++)
        for (let v = 0; v < 29; v++) {
          const count = src[u * 29 + v];
          if (count) target[((u + a) % 29) * 29 + (v + b) % 29] += count;
        }
    }
  }
  const total = dp[full].reduce((s, c) => s + c, 0);
  assert.equal(total, 479001600);
  return { valid: dp[full][0], total, fraction: dp[full][0] / total };
}
const line29 = linePermutationCount(printed.get(29), "A");
const line30 = linePermutationCount(printed.get(30), "B");
assert.equal(line29.valid, 569950);
assert.equal(line30.valid, 578294);

/** Page-cyclic-rotation control: preserves every page's complete rune tape
 * up to selection of its starting point. No rune identity is resampled. */
function rotateCategories(v) {
  const counts = [0,0,0,0];
  for (let shift = 0; shift < v.length; shift++) {
    const rotated = v.slice(shift).concat(v.slice(0, shift));
    const aa = evaluate(rotated, 24).every(x => x === 0);
    const bb = evaluate(rotated, 8)[0] === 0 && evaluate(rotated, 17)[0] === 0;
    counts[(aa ? 1 : 0) | (bb ? 2 : 0)]++;
  }
  return counts;
}
const rotation = pages.map(p => ({ page: p.page, n: p.indices.length, counts: rotateCategories(p.indices) }));
assert.equal(rotation.find(p => p.page === 29).counts[1], 3);
assert.equal(rotation.find(p => p.page === 30).counts[2], 1);
/** Exact probability of an A-page immediately followed by a B-page,
 * accounting for testing all physical adjacent rune-bearing pages. */
function adjacentProbability(either) {
  let states = [1,0,0,0], prior = null;
  for (const p of rotation) {
    const next = [0,0,0,0];
    for (let old = 0; old < 4; old++) {
      for (let now = 0; now < 4; now++) {
        if (prior !== null && p.page === prior + 1 &&
          (((old & 1) && (now & 2)) || (either && (old & 2) && (now & 1)))) continue;
        next[now] += states[old] * p.counts[now] / p.n;
      }
    }
    states = next;
    prior = p.page;
  }
  return 1 - states.reduce((s, v) => s + v, 0);
}
const allForwardRotationP = adjacentProbability(false);
const bothOrientationRotationP = adjacentProbability(true);
assert(allForwardRotationP > 0 && allForwardRotationP < 0.001);
assert(bothOrientationRotationP > allForwardRotationP && bothOrientationRotationP < 0.002);

/** GF29 4x4 matrix operators; original p15 signed Fibonacci-derived matrix. */
const matrix = [[10,3,20,22],[1,22,21,25],[11,17,19,7],[8,12,12,22]];
const identity = Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => Number(i === j)));
const blank = () => Array.from({ length: 4 }, () => [0,0,0,0]);
function matmul(a,b) {
  const out = blank();
  for (let i=0;i<4;i++) for (let j=0;j<4;j++) {
    let z=0; for (let k=0;k<4;k++) z+=a[i][k]*b[k][j];
    out[i][j]=mod(z);
  }
  return out;
}
function matplus(a,b) { return a.map((row,i)=>row.map((x,j)=>mod(x+b[i][j]))); }
function matpoly(coeff) {
  let m=blank();
  for (const c of coeff) {
    m=matmul(m,matrix);
    for (let i=0;i<4;i++) m[i][i]=mod(m[i][i]+c);
  }
  return m;
}
function matrixRank(input) {
  const a=input.map(r=>r.slice());
  let rank=0;
  for (let col=0;col<4;col++) {
    let k=rank;
    while (k<4 && a[k][col]===0) k++;
    if (k===4) continue;
    [a[k],a[rank]]=[a[rank],a[k]];
    let inv=1;
    while (mod(a[rank][col]*inv)!==1) inv++;
    for (let j=col;j<4;j++) a[rank][j]=mod(a[rank][j]*inv);
    for (let i=0;i<4;i++) if(i!==rank) {
      const z=a[i][col];
      for (let j=col;j<4;j++) a[i][j]=mod(a[i][j]-z*a[rank][j]);
    }
    rank++;
  }
  return rank;
}
function inverse(input) {
  const a=input.map((row,i)=>row.concat(identity[i]));
  for(let j=0;j<4;j++) {
    let k=j;
    while (k<4 && a[k][j]===0) k++;
    assert(k<4, "Source-derived matrix should be invertible");
    [a[j],a[k]]=[a[k],a[j]];
    let inv=1;while(mod(a[j][j]*inv)!==1) inv++;
    for(let col=0;col<8;col++) a[j][col]=mod(a[j][col]*inv);
    for(let i=0;i<4;i++) if(i!==j) {
      const z=a[i][j];
      for(let col=0;col<8;col++) a[i][col]=mod(a[i][col]-z*a[j][col]);
    }
  }
  return a.map(r=>r.slice(4));
}
assert.deepEqual(matpoly([1,14,27,10,7]),blank());
const ma=matpoly(aPage), mb=matpoly(bPage);
assert.equal(matrixRank(ma),2);
assert.equal(matrixRank(mb),2);
assert.deepEqual(matmul(ma,mb),blank());
const K=matplus(ma,mb), Kinv=inverse(K);
assert.equal(matrixRank(K),4);
assert.deepEqual(matmul(K,Kinv),identity);
function hill(v,key) {
  assert.equal(v.length%4,0);
  const out=[];
  for(let p=0;p<v.length;p+=4) {
    for(let i=0;i<4;i++) {
      let z=0;for(let j=0;j<4;j++) z+=key[i][j]*v[p+j];
      out.push(mod(z));
    }
  }
  return out;
}
const following = pages.filter(p=>p.page>=33&&p.page<=39).flatMap(p=>p.indices);
const later = pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
assert.equal(following.length,1680);
assert.equal(later.length,3008);
const after = hill(following,Kinv), heldout = hill(later,Kinv);
assert.deepEqual(hill(after,K),following);
assert.deepEqual(hill(heldout,K),later);
assert(Math.abs(ioc(after)-0.03482586006409711)<1e-12);
assert(Math.abs(ioc(heldout)-0.034500615584911805)<1e-12);

/* Planted genuine solved-p57 register checks both exact source-selected
 * polynomial division and the induced Hill key. Not an original LP2 solution. */
const solved = gp.pages.find(p=>p.page===57).indices;
assert(solved.length>=90);
for(const [n,f] of [[275,A],[261,B]]) {
  const plant=Array.from({length:n},(_,i)=>solved[i%solved.length]);
  const cipher=multiply(plant,f);
  assert.deepEqual(divide(cipher,f).quotient,plant);
  assert.deepEqual(divide(cipher,f).remainder,[0,0]);
}
const solvedHill=Array.from({length:4*24},(_,i)=>solved[i%solved.length]);
assert.deepEqual(hill(hill(solvedHill,K),Kinv),solvedHill);

console.log(JSON.stringify({
  status:"Original page-pair eigenfactor split: exact; no unknown plaintext or selected cipher",
  sourcePages:{p29:aPage.length,p30:bPage.length,sourceIndependentTranscription:true},
  charpoly:[1,14,27,10,7], factors:{p29:A,p30:B},
  originalExactMatchPages:{doubleRoot24:aHits,roots8and17:bHits},
  sourceQuotients:{p29:{length:275,ioc:ioc(qa.quotient)},p30:{length:261,ioc:ioc(qb.quotient)}},
  lineNull:{p29:line29,p30:line30,jointFraction:line29.fraction*line30.fraction},
  cyclicShiftNull:{sourcePairFraction:3/(277*263),anyAdjacentForward:allForwardRotationP,anyAdjacentEither:bothOrientationRotationP},
  matrix:{leftRank:matrixRank(ma),rightRank:matrixRank(mb),productZero:true,sumFullRank:true,key:K,inverse:Kinv},
  conditionalDirectHill:{nextChapterIoC:ioc(after),heldoutChapterIoC:ioc(heldout)},
  syntheticPositive:"Exact p57-derived 275+261 polynomial-symbol and 96 Hill-symbol recoveries"
},null,2));