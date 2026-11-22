'use strict';
/**
 * Original-source LP2 red-title attack: enumerate every unlabeled equal-corner
 * rectangle at the fixed 27x27 opening anchor; derive second key by the
 * rectangle's final index along its SE diagonal; select only using an
 * independent public-domain Latin GP trigram scorer. No plaintext crib enters
 * the candidate generator or language scoring.
 *
 * Run: node sims/latin_heading_unlabeled_inverse.cjs [shuffleCount]
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(base, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const latin = JSON.parse(fs.readFileSync(
  path.join(base, 'resources/control/latin-vulgate-gp-trigrams.json'), 'utf8'));
const all = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
const N = 29, rootR = 13, rootC = 12;
const at = (r, c) => 27 * (r - 1) + c - 1;
const rootIndex = at(rootR, rootC);
const U = Float64Array.from(latin.u), B = new Float64Array(N*N),
  T = new Float64Array(N*N*N);
for (const [i, v] of latin.b) B[i] = v;
for (const [i, v] of latin.t) T[i] = v;
const uni = new Float64Array(N), bi = new Float64Array(N*N),
  tri = new Float64Array(N*N*N);
for (let x = 0; x < N; x++)
  uni[x] = Math.log((U[x] + 1)/(latin.n + N));
for (let x = 0; x < N; x++)
  for (let z = 0; z < N; z++)
    bi[x*N+z] = Math.log((B[x*N+z]+12*Math.exp(uni[z]))/(U[x]+12));
for (let x = 0; x < N; x++) for (let y = 0; y < N; y++)
  for (let z = 0; z < N; z++)
    tri[(x*N+y)*N+z] = Math.log((T[(x*N+y)*N+z] +
      9*Math.exp(bi[y*N+z]))/(B[x*N+y]+9));
const mod = x => (x % N + N) % N;
/** @param {number[]} runes */
function score(runes) {
  let s = 0;
  for (let i = 0; i < runes.length; i++) {
    const v = runes[i];
    s += i === 0 ? uni[v] : i === 1 ? bi[runes[0]*N+v]
      : tri[(runes[i-2]*N+runes[i-1])*N+v];
  }
  return s;
}
/** @param {number} n Original GP index */
function phi(n) {
  if (n === 0) return null;
  let m = n, result = n;
  for (let p = 2; p*p <= m; p++) {
    if (m % p) continue;
    while (m % p === 0) m /= p;
    result -= result/p;
  }
  if (m > 1) result -= result/m;
  return result;
}
const rectangles = [];
for (let r1 = 1; r1 < 27; r1++)
  for (let r2 = r1 + 1; r2 <= 27; r2++)
    for (let c1 = 1; c1 < 27; c1++)
      for (let c2 = c1 + 1; c2 <= 27; c2++)
        if ((r1-rootR)**2+(c1-rootC)**2 ===
            (r2-rootR)**2+(c2-rootC)**2)
          rectangles.push([at(r1,c1),at(r1,c2),at(r2,c2),
            at(r2,c1),r1,c1,r2,c2]);
assert.equal(rectangles.length, 909);

/**
 * Score all frozen-key-family candidates. Original text and root cell are
 * never altered during a null. Enumerating all mirror labels is the new
 * uncribbed key search: no X,N,C or Latin target words are supplied.
 * @param {number[]} grid First 729 runes from a section.
 * @param {number} firstLength Length of red heading's first physical word.
 * @param {number} secondLength Length of second physical word.
 */
function enumerate(grid, firstLength, secondLength) {
  assert.equal(grid.length, 729);
  const firstCipher = grid.slice(0, firstLength).reverse(),
    secondCipher = grid.slice(firstLength, firstLength+secondLength);
  const out = [];
  for (const [nw, ne, se, sw, r1, c1, r2, c2] of rectangles) {
    if (grid[nw] !== grid[se]) continue;
    const k4 = [grid[nw],grid[ne],grid[se],grid[sw]], step = k4[3];
    if (step < 1 || rootR+2*step > 27 || rootC+2*step > 27) continue;
    const center = grid[at(rootR+step,rootC+step)];
    if (center === 0) continue;
    const k3 = [grid[rootIndex],phi(center),
      grid[at(rootR+2*step,rootC+2*step)]];
    const p1 = firstCipher.map((v,i) => mod(v-k4[i%4]));
    const p2 = secondCipher.map((v,i) => mod(v-k3[i%3]));
    out.push({score:(score(p1)+score(p2))/(p1.length+p2.length),
      key4:k4,key3:k3,step,rectangle:[[r1,c1],[r2,c2]],
      plaintext:[p1,p2]});
  }
  out.sort((a,b) => b.score-a.score);
  return out;
}
const p0 = all.slice(0, 729);
const start8 = corpus.pages.filter(p => p.page < 8)
  .reduce((s,p) => s+p.indices.length, 0);
const p8 = all.slice(start8,start8+729);
assert.equal(start8, 1874);
assert.equal(p0[rootIndex], 11);
const rank0 = enumerate(p0,8,5),rank8=enumerate(p8,4,8);
const asWord = p => p.map(i => corpus.translit[i]).join('');
assert.equal(rank0.length,6);
assert.equal(rank8.length,10);
assert.deepEqual(rank0[0].key4,[14,9,14,5]);
assert.deepEqual(rank0[0].key3,[11,2,2]);
assert.deepEqual(rank0[0].plaintext.map(asWord),['SECUENDI','RATIO']);
assert.ok(rank0[0].score > rank0[1].score + 1.9);
assert.ok(rank8[0].score < -5);
const summary = (a) => a.map(x => ({
  scorePerRune:Number(x.score.toFixed(8)),
  plaintext:x.plaintext.map(asWord),
  rectangle:x.rectangle,key4:x.key4,key3:x.key3,
  step:x.step
}));
const num = process.argv[2] ? Number(process.argv[2]) : 100000;
assert.ok(Number.isSafeInteger(num)&&num>=0&&num<=1000000);
function rng(seed) {let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
const rnd=rng(0x2411a77e);
const movable=[];
for(let i=13;i<729;i++)if(i!==rootIndex)movable.push(i);
const originalValues=movable.map(i=>p0[i]);
const bestOriginal=rank0[0].score;
let better=0,empty=0,totalCandidates=0;
let bestNull=-Infinity;
for(let t=0;t<num;t++){
  const values=originalValues.slice();
  for(let j=values.length-1;j>0;j--){
    const k=rnd()%(j+1);
    [values[j],values[k]]=[values[k],values[j]];
  }
  const grid=p0.slice();
  for(let j=0;j<movable.length;j++)grid[movable[j]]=values[j];
  const found=enumerate(grid,8,5);
  totalCandidates+=found.length;
  if(found.length===0){empty++;continue;}
  if(found[0].score>=bestOriginal)better++;
  bestNull=Math.max(bestNull,found[0].score);
}
console.log(JSON.stringify({
  description:'Unlabeled original-source geometric Latin inverse. Retrospectively chosen family, not authenticated decryption.',
  source:{pages:[0,1,2],p0First13:p0.slice(0,13),
    root:[rootR,rootC],rootRune:p0[rootIndex],
    validEquidistantRectangles:rectangles.length,
    latinGPTrainingRunes:latin.n},
  originalP0:{firstWordLength:8,secondWordLength:5,
    candidateCount:rank0.length,ranked:summary(rank0),
    bestGapPerRune:rank0[0].score-rank0[1].score},
  independentP8:{start8,firstWordLength:4,secondWordLength:8,
    candidateCount:rank8.length,ranked:summary(rank8)},
  frozenModelMaxNull:{seed:'0x2411a77e',trials:num,
    fixedFirst13:true,fixedRoot:true,movable:movable.length,
    nullBetterOrEqual:better,empty,
    meanCandidateCount:num?totalCandidates/num:null,
    bestNullScore:Number.isFinite(bestNull)?bestNull:null,
    addOneUpperTail:(better+1)/(num+1)},
  caveat:'Language and mirror/rectangle/step geometry chosen retrospectively from p0. No independent LP2 plaintext recovered.'
},null,2));
