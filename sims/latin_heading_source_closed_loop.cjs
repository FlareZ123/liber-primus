'use strict';
/**
 * Source-only, self-rooted candidate key circuit in the first 729 LP2 runes.
 *
 * WARNING: the sum-to-root, product and Euler-totient rules were discovered
 * after an external Latin red-title hypothesis had supplied the target keys.
 * A source-only enumeration is a useful constraint; it is not independent
 * evidence of historical cipher intent or an authenticated decryption.
 *
 * SFT: node sims/latin_heading_source_closed_loop.cjs [trials]
 * Defaults to 20000 matched null samples; no packages needed on Node 22.
 * @module latin_heading_source_closed_loop
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const DIM = 27, MOD = 29;
const originalPages = corpus.pages.slice(0, 3).map(p => p.indices);
const original = originalPages.flat();
assert.deepEqual(originalPages.map(p => p.length), [262, 266, 201]);
assert.equal(original.length, DIM * DIM);
const allUnsolved = corpus.pages.filter(p => p.page < 56)
  .flatMap(p => p.indices);
assert.equal(allUnsolved.length, 12956);
const phi = Array(MOD).fill(0);
for (let n = 1; n < MOD; n++) {
  let count = 0;
  for (let k = 1; k <= n; k++) {
    let a = n, b = k;
    while (b) [a, b] = [b, a % b];
    if (a === 1) count++;
  }
  phi[n] = count;
}
const at = (r, c) => r * DIM + c;
const mod = n => (n % MOD + MOD) % MOD;

/**
 * Exhaustively discover each equal-NW/SE source rectangle satisfying all
 * arithmetical and geometric gates. Neither a fixed root nor key labels
 * nor any purported Latin plaintext are supplied to this function.
 *
 * K=[a,b,a,d] = clockwise rectangle corner indices. Let s=sum(K)%29,
 * R=(s,phi(s)) in one-based coordinates. Opposite a-corners equidistant
 * from R; d selects the southeast diagonal step. Middle cell must equal
 * product(K)%29 and endpoint must equal phi(middle). All rules postselected.
 *
 * @param {number[]} grid Exactly 729 GP indices, row-major 27x27.
 * @param {boolean} [detailed=false] Include matched source coordinates.
 * @returns {{counts:number[], circuits:Array<object>}}
 */
function findCircuits(grid, detailed = false) {
  assert.equal(grid.length, 729);
  const locations = Array.from({length: MOD}, () => []);
  for (let i = 0; i < grid.length; i++) {
    const symbol = grid[i];
    assert.ok(Number.isInteger(symbol) && symbol >= 0 && symbol < MOD);
    locations[symbol].push(i);
  }
  // Counts after: equal corners; valid derived root; root equidistance;
  // in-bounds southeast step; two source-symbol arithmetic checks.
  const counts = [0, 0, 0, 0, 0];
  const circuits = [];
  for (let a = 0; a < MOD; a++) {
    const positions = locations[a];
    for (let i = 0; i < positions.length; i++) {
      const nw = positions[i], r1 = Math.floor(nw / DIM), c1 = nw % DIM;
      for (let j = i + 1; j < positions.length; j++) {
        const se = positions[j], r2 = Math.floor(se / DIM), c2 = se % DIM;
        if (r1 >= r2 || c1 >= c2) continue;
        counts[0]++;
        const b = grid[at(r1, c2)], d = grid[at(r2, c1)];
        const rootRow = mod(2 * a + b + d), rootCol = phi[rootRow];
        if (rootRow < 1 || rootRow > DIM ||
            rootCol < 1 || rootCol > DIM) continue;
        counts[1]++;
        const rr = rootRow - 1, rc = rootCol - 1;
        const distNW = (r1 - rr) ** 2 + (c1 - rc) ** 2;
        const distSE = (r2 - rr) ** 2 + (c2 - rc) ** 2;
        if (distNW !== distSE) continue;
        counts[2]++;
        if (d < 1 || rr + 2 * d >= DIM || rc + 2 * d >= DIM) continue;
        counts[3]++;
        const product = mod(a * b * a * d);
        if (grid[at(rr + d, rc + d)] !== product ||
            grid[at(rr + 2 * d, rc + 2 * d)] !== phi[product]) continue;
        counts[4]++;
        if (detailed) {
          circuits.push({
            key4: [a, b, a, d],
            corners: [[r1+1,c1+1], [r1+1,c2+1],
              [r2+1,c2+1], [r2+1,c1+1]],
            derivedRoot: [rootRow, rootCol],
            derivedRootRune: grid[at(rr,rc)],
            diagonalMiddle: [rootRow+d,rootCol+d,product],
            diagonalEnd: [rootRow+2*d,rootCol+2*d,phi[product]],
            key3: [grid[at(rr,rc)], phi[product],
              grid[at(rr+2*d,rc+2*d)]]
          });
        }
      }
    }
  }
  return {counts, circuits};
}
/** @param {number[]} v */
function asGP(v) { return v.map(i => corpus.translit[i]).join(''); }
/** @param {number[]} v @param {number[]} key */
function subtract(v, key) { return v.map((n,i) => mod(n-key[i%key.length])); }
/** @param {number[]} v @param {number[]} key */
function add(v, key) { return v.map((n,i) => mod(n+key[i%key.length])); }
/** xorshift32, fixed seed. @param {number} seed */
function rng(seed) {
  let x = seed >>> 0;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return x >>> 0; };
}
/** Fisher-Yates with a deterministic PRNG; modulo bias is negligible.
 * @param {number[]} v @param {()=>number} random
 */
function shuffle(v, random) {
  const out = v.slice();
  for (let i = out.length-1; i>0; i--) {
    const j = random() % (i+1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
/** Rotate while conserving original symbol order and adjacency except seam.
 * @param {number[]} v @param {number} offset
 */
function rotate(v, offset) {
  return v.slice(offset).concat(v.slice(0,offset));
}
function main() {
  const originalMatch = findCircuits(original, true);
  assert.deepEqual(originalMatch.counts, [4187,3913,15,3,1]);
  assert.equal(originalMatch.circuits.length, 1);
  const circuit = originalMatch.circuits[0];
  assert.deepEqual(circuit.key4, [14,9,14,5]);
  assert.deepEqual(circuit.corners,
    [[6,3],[6,9],[24,9],[24,3]]);
  assert.deepEqual(circuit.derivedRoot, [13,12]);
  assert.equal(circuit.derivedRootRune, 11);
  assert.deepEqual(circuit.diagonalMiddle, [18,17,4]);
  assert.deepEqual(circuit.diagonalEnd, [23,22,2]);
  assert.deepEqual(circuit.key3, [11,2,2]);
  const firstCipher = original.slice(0,8).reverse();
  const secondCipher = original.slice(8,13);
  const firstPlain = subtract(firstCipher, circuit.key4);
  const secondPlain = subtract(secondCipher, circuit.key3);
  assert.deepEqual([asGP(firstPlain),asGP(secondPlain)],
    ['SECUENDI','RATIO']);
  assert.deepEqual(add(firstPlain,circuit.key4),firstCipher);
  assert.deepEqual(add(secondPlain,circuit.key3),secondCipher);

  // Frozen 729-rune windows beginning at the existing source-defined
  // major section starts. The final one lacks 729 available unsolved runes.
  const sections = [0,3,8,15,23,27,33,40,54];
  const windows = sections.map(page => {
    const start = corpus.pages.filter(p=>p.page<page)
      .reduce((sum,p)=>sum+p.indices.length,0);
    const sample = allUnsolved.slice(start,start+729);
    return {startPhysicalPage:page,firstRuneOffset:start,
      runes:sample.length,
      matches:sample.length===729 ? findCircuits(sample).counts[4] : null};
  });
  assert.deepEqual(windows.map(w=>w.matches),
    [1,0,0,0,0,0,0,0,null]);

  const trials = process.argv[2]===undefined ? 20000 : Number(process.argv[2]);
  assert.ok(Number.isSafeInteger(trials) && trials>=1 && trials<=1000000);
  const random=rng(0x14132729);
  const nulls={allInventoryShuffle:0,redTitleFixedShuffle:0,
    pageRotation:0,redTitleFixedPageRotation:0};
  const fixedTitle=original.slice(0,13);
  for(let i=0;i<trials;i++) {
    const shuffled=shuffle(original,random);
    nulls.allInventoryShuffle += Number(findCircuits(shuffled).counts[4]>0);
    const titleRetained=fixedTitle.concat(
      shuffle(original.slice(13),random));
    nulls.redTitleFixedShuffle +=
      Number(findCircuits(titleRetained).counts[4]>0);
    const pageRotated=originalPages.flatMap(page =>
      rotate(page,random()%page.length));
    nulls.pageRotation += Number(findCircuits(pageRotated).counts[4]>0);
    const p0=originalPages[0],tail=p0.slice(13);
    const redFixed= fixedTitle.concat(rotate(tail,random()%tail.length));
    const otherRotations=originalPages.slice(1).flatMap(page =>
      rotate(page,random()%page.length));
    nulls.redTitleFixedPageRotation += Number(
      findCircuits(redFixed.concat(otherRotations)).counts[4]>0);
  }
  const calibrated=Object.fromEntries(Object.entries(nulls)
    .map(([name,hits])=>[name,{hits,trials,
      plusOneConditionalUpperTail:(hits+1)/(trials+1)}]));
  const result={
    status:'Postselected, self-rooted source candidate; unknown LP2 plaintext and mechanism remain unrecovered',
    sourcePages:[0,1,2],
    sourceRuneCount:original.length,
    selector:'Equal NW/SE GP values, sum29 root coordinates with Euler totient, equal-radius root, SW diagonal step, product29 middle and totient endpoint',
    originalStageCounts:originalMatch.counts,
    uniqueCircuit:circuit,
    conditionalLatinTitle:{plaintext:[asGP(firstPlain),asGP(secondPlain)],
      firstCipher,secondCipher,reencryptsExactly:true,
      qualification:'Both Latin words and their algebraic inversion were independently proposed before these source-root/product constraints'},
    predeclaredSectionStarts:windows,
    nulls:{seed:'0x14132729',...calibrated},
    cautions:'All arithmetic/geometric gates were discovered after examining the original candidate. These are scoped conditional nulls, not discovery-wide evidence or proof of an authentic Cicada cipher.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)main();
module.exports={findCircuits,main};
