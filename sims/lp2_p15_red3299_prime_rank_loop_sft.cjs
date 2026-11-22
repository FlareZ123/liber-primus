"use strict";
/**
 * p15 original square's unexpected prime-rank/Fibonacci loop.
 * All inputs are literal, source-documented, and checked using an
 * independent small prime generator. No plaintext or key is fitted.
 *
 * Windows 11, Node 22 CJS SFT:
 * node sims/lp2_p15_red3299_prime_rank_loop_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = path.join(__dirname, "..", "resources", "liber-primus");
const c = JSON.parse(fs.readFileSync(path.join(base, "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(base, "lp2-ink-annotations.json"), "utf8"));
assert.equal(c.pages[15].runic_count, c.pages[15].indices.length);
assert.deepEqual(ink.pages.find(x => x.page === 15).red_spans.map(x => [x.start, x.length]), [[0,9],[9,11]]);

function prime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}
function pi(n) {
  let count = 0;
  for (let k = 2; k <= n; k++) if (prime(k)) count++;
  return count;
}
function nthPrime(index) {
  assert.ok(Number.isInteger(index) && index >= 1);
  let n = 1, count = 0;
  while (count < index) {
    n++;
    if (prime(n)) count++;
  }
  return n;
}
const table = [
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820],
];
// The original red-cell-led clockwise outward spiral.
const spiral = [
  [1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],
  [0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0],
];
const fib = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const sourceValues = spiral.map(([i,j]) => table[i][j]);
assert.equal(sourceValues.length, 16);
const selectedPrimes = fib.map(f => nthPrime(f + 1));
assert.deepEqual(selectedPrimes,
  [2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]);
assert.deepEqual(sourceValues, selectedPrimes.map(x => Math.abs(3301 - x)));

// The established printed source highlights this single odd prime cell.
const odd = [];
for (let i=0;i<4;i++) for(let j=0;j<4;j++){
  if(table[i][j]%2) odd.push({row:i,col:j,value:table[i][j]});
}
assert.deepEqual(odd, [{row:1,col:1,value:3299}]);
assert.equal(prime(3299), true);
assert.equal(prime(3301), true);
assert.equal(nthPrime(pi(3299)), 3299);
assert.equal(pi(3299), 463);
assert.equal(pi(3301), 464);
assert.equal(nthPrime(463), 3299);
assert.equal(nthPrime(464), 3301);

// The literal prime selected by the F=89 entry is the rank of red3299.
// Its printed absolute complement is the original cell 2838, two
// columns right of red3299 in the same printed row.
const hits = [];
for (let i=0; i<selectedPrimes.length; i++) {
  if (selectedPrimes[i] === pi(3299)) {
    hits.push({
      spiral_zero_based_index:i,
      fibonacci:fib[i],
      prime_rank:fib[i]+1,
      selected_prime:selectedPrimes[i],
      original_coordinate:spiral[i],
      printed_number:sourceValues[i],
    });
  }
}
assert.deepEqual(hits,[{
  spiral_zero_based_index:10,
  fibonacci:89,
  prime_rank:90,
  selected_prime:463,
  original_coordinate:[1,3],
  printed_number:2838,
}]);
assert.equal(table[1][3], 3301 - pi(3299));
assert.equal(table[1][1] - 3301, -2);
assert.deepEqual([1,3],[1,1 + (3301 - 3299)]);
// Two-level nested twin-prime ladder, sourced by the F=89 grid term.
assert.equal(nthPrime(89),461);
assert.equal(nthPrime(90),463);
assert.equal(nthPrime(90)-nthPrime(89),2);
assert.equal(table[1][1]-table[1][3],461);
assert.equal(pi(461),89);
assert.equal(pi(463),90);
assert.equal(pi(464),90);
assert.equal(pi(pi(3299)),90);
assert.equal(pi(pi(3301)),90);
assert.equal(nthPrime(90), pi(3299));
assert.equal(nthPrime(nthPrime(90)),3299);
assert.equal(nthPrime(nthPrime(90) + 1),3301);

// Exhaust every possible candidate cell under the same FIRST-PARTY
// red-number->prime-ordinal->another printed complement grammar.
const chains=[];
for(let i=0;i<4;i++) for(let j=0;j<4;j++){
  const v=table[i][j];
  if(!prime(v)) continue;
  const ordinal=pi(v);
  for(let y=0;y<4;y++)for(let x=0;x<4;x++){
    if(table[y][x]===3301-ordinal){
      chains.push({from:[i,j],to:[y,x],from_value:v,to_value:table[y][x],ordinal});
    }
  }
}
assert.deepEqual(chains,[{
  from:[1,1],to:[1,3],from_value:3299,to_value:2838,ordinal:463
}]);
console.log(JSON.stringify({
  status:"Exact original-artifact prime-rank loop; no LP2 plaintext recovered",
  original_grid:table, source_spiral:sourceValues,
  sole_odd_red_cell:odd[0],
  twin_prime_pair:[3299,3301],
  prime_ranks:{rank_3299:pi(3299),rank_3301:pi(3301)},
  source_selected_prime_rank_chain:[
    {fibonacci:89,ordinal:90,prime:nthPrime(90)},
    {ordinal:463,prime:nthPrime(463)},
    {ordinal:464,prime:nthPrime(464)}
  ],
  nested_twin_prime_ladder:{
    first:{lower:nthPrime(89),upper:nthPrime(90),prime_ranks:[89,90]},
    second:{lower:nthPrime(463),upper:nthPrime(464),prime_ranks:[463,464]},
    original_printed_difference:[table[1][1]-table[1][3],3301-table[1][3]],
    second_prime_index_of_both_twin_members:[pi(pi(3299)),pi(pi(3301))]
  },
  interior_grid_echo:hits,
  source_qualified_cell_pairs:chains,
  interpretation:"A new source-visible prime-rank/Fibonacci self-reference. The right-two-column route is a possible retrospectively noticed solve-path cue, not an instruction authenticated by Cicada or a rune decryption.",
},null,2));
