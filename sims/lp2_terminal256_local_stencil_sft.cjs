"use strict";

/**
 * Source-motivated local finite-field stencil gate for the terminal 256 runes.
 *
 * SFT: node sims/lp2_terminal256_local_stencil_sft.cjs
 *
 * The 32x8 pp49-51 numerical table might encode the last 256 runes through a
 * constant 2D linear filter. In the source-visible outer-ring / inner-ring
 * layout, p55 occupies 76 border slots and solved pp56-57 occupy all 180
 * interior slots. A radius-1 3x3 or radius-2 5x5 stencil (with an optional
 * constant) can be tested *without guessing any key* against independently
 * known GP29 plaintext:
 *
 *    plaintext(r,c) = k0 + sum k[dy,dx] * (byte(r+dy,c+dx)%29) (mod29).
 *
 * The historical 2014 Wisdom square motivates checking the 5x5 arity.
 * The unknown 9/25 filter weights are fitted exactly by GF29 linear algebra;
 * failure of the full all-secret family rules out a literal square kernel.
 * We restrict output cells to positions where the complete neighborhood is
 * printed, avoiding any arbitrary boundary conventions.
 *
 * All 512 choices of independent corner/winding in the three inner rings
 * are tested. A positive 180/112-output original-table plant is recovered
 * exactly for both sizes.
 *
 * This does NOT reject nonlinear/stateful or intermediate-alphabet ciphers.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
/** @param {string} f */
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const db = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const Q = 29;
/** @param {number} x */
const mod = x => ((x % Q) + Q) % Q;
const B = bytes.map(x => x % Q);

function primes() {
  const result = [];
  for (let n = 2; result.length < 100; n++) {
    let prime = true;
    for (let f = 2; f*f <= n; f++) {
      if (n % f === 0) { prime = false; break; }
    }
    if (prime) result.push(n);
  }
  return result;
}
const primeList = primes(), p56 = db.pages[56].indices,
  p57 = db.pages[57].indices;
assert.deepEqual([db.pages[55].indices.length, p56.length, p57.length],
  [76,85,95]);
let clock = 0;
const known = p56.map((c,i) =>
  i === 56 ? 0 : mod(c - primeList[clock++] + 1)).concat(p57);
assert.equal(clock, 84);
assert.equal(known.length, 180);

const rings = [];
for (let depth = 0; depth < 4; depth++) {
  const ring = [];
  for (let x=depth;x<=7-depth;x++) ring.push(8*depth+x);
  for (let y=depth+1;y<=31-depth;y++) ring.push(8*y+7-depth);
  for (let x=6-depth;x>=depth;x--) ring.push(8*(31-depth)+x);
  for (let y=30-depth;y>depth;y--) ring.push(8*y+depth);
  rings.push(ring);
}
assert.deepEqual(rings.map(r=>r.length), [76,68,60,52]);
const corners = [[0,0],[0,7],[31,7],[31,0]];
const routes = [[],[],[],[]];
for (let depth = 1; depth <= 3; depth++) {
  const ring = rings[depth];
  for (const [y0,x0] of corners) {
    for (const direction of [-1,1]) {
      const y = Math.max(depth, Math.min(31-depth,y0));
      const x = Math.max(depth, Math.min(7-depth,x0));
      const start = ring.indexOf(y*8+x);
      assert.ok(start>=0);
      routes[depth].push(ring.map((_,i) =>
        ring[(start+direction*i+ring.length*2)%ring.length]));
    }
  }
}
const inverses=Array.from({length:Q},(_,a)=>{
  if(a===0)return 0;
  for(let x=1;x<Q;x++)if(a*x%Q===1)return x;
  throw new Error("Nonzero field element lacked inverse");
});

/** @param {number} radius */
function stencil(radius) {
  const X = [], positions = [];
  for(let row=radius;row<32-radius;row++){
    for(let col=radius;col<8-radius;col++){
      if(row<1||row>30||col<1||col>6)continue;
      const features=[1];
      for(let dy=-radius;dy<=radius;dy++){
        for(let dx=-radius;dx<=radius;dx++){
          features.push(B[8*(row+dy)+col+dx]);
        }
      }
      X.push(features);
      positions.push(8*row+col);
    }
  }
  return {radius,X,positions};
}
/**
 * RREF with all 180 or 112 output equations.
 * Fixes all free coefficients to zero (there are none in these full-rank
 * original feature matrices). Returns number of violated observations
 * when the uniquely specified leading-rank system is evaluated.
 * @param {number[][]} X
 * @param {number[]} Y
 */
function solve(X,Y) {
  const rows=X.length, cols=X[0].length;
  const M=X.map((r,i)=>r.concat([Y[i]]));
  const pivots=[];
  let rank=0;
  for(let col=0;col<cols;col++){
    let pivot=rank;
    while(pivot<rows&&M[pivot][col]===0)pivot++;
    if(pivot===rows)continue;
    [M[rank],M[pivot]]=[M[pivot],M[rank]];
    const inv=inverses[M[rank][col]];
    for(let j=col;j<=cols;j++)M[rank][j]=mod(M[rank][j]*inv);
    for(let i=0;i<rows;i++){
      if(i===rank)continue;
      const factor=M[i][col];
      if(factor===0)continue;
      for(let j=col;j<=cols;j++){
        M[i][j]=mod(M[i][j]-factor*M[rank][j]);
      }
    }
    pivots.push(col);
    rank++;
  }
  const coefficients=Array(cols).fill(0);
  pivots.forEach((column,i)=>{coefficients[column]=M[i][cols];});
  let errors=0;
  X.forEach((features,i)=>{
    const sum=features.reduce((s,value,j)=>s+value*coefficients[j],0);
    if(mod(sum)!==Y[i])errors++;
  });
  return {rank,errors,coefficients};
}
const specs=[stencil(1),stencil(2)];
assert.deepEqual(specs.map(s=>[s.X.length,s.X[0].length]),
  [[180,10],[112,26]]);
const controls=specs.map(spec=>{
  const key=spec.X[0].map((_,i)=>mod(i*17+5));
  const fakePlain=spec.X.map(features=>
    mod(features.reduce((a,x,i)=>a+x*key[i],0)));
  const found=solve(spec.X,fakePlain);
  assert.equal(found.errors,0);
  assert.equal(found.rank,key.length);
  assert.deepEqual(found.coefficients,key);
  return {radius:spec.radius,length:fakePlain.length,exact:true};
});
const cases=specs.map(spec=>({
  radius:spec.radius, observations:spec.X.length,
  freeCoefficients:spec.X[0].length,
  minErrors:Number.POSITIVE_INFINITY, bestRoute:null,
  fitCount:0,minRank:Number.POSITIVE_INFINITY,maxRank:0
}));
const plaintextAt = new Int16Array(256);
for(let p=0;p<8;p++)for(let q=0;q<8;q++)for(let r=0;r<8;r++){
  const route=routes[1][p].concat(routes[2][q],routes[3][r]);
  assert.equal(new Set(route).size,180);
  route.forEach((position,i)=>{plaintextAt[position]=known[i];});
  specs.forEach((spec,i)=>{
    const y=spec.positions.map(pos=>plaintextAt[pos]);
    const found=solve(spec.X,y),result=cases[i];
    result.minRank=Math.min(result.minRank,found.rank);
    result.maxRank=Math.max(result.maxRank,found.rank);
    if(found.errors===0)result.fitCount++;
    if(found.errors<result.minErrors){
      result.minErrors=found.errors;
      result.bestRoute=[p,q,r];
    }
  });
}
assert.deepEqual(cases.map(c=>({
  radius:c.radius,minErrors:c.minErrors,bestRoute:c.bestRoute,
  fitCount:c.fitCount,minRank:c.minRank,maxRank:c.maxRank
})),[
  {radius:1,minErrors:157,bestRoute:[3,6,5],
   fitCount:0,minRank:10,maxRank:10},
  {radius:2,minErrors:79,bestRoute:[0,5,3],
   fitCount:0,minRank:26,maxRank:26}
]);
process.stdout.write(JSON.stringify({
  tableByteSHA256:"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
  ringLengths:[76,68,60,52],knownPlaintext:180,
  testedIndependentInnerRoutes:512,
  controlExactRecovered:controls,
  cases
},null,2)+"\n");
