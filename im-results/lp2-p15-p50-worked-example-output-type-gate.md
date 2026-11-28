# p15 worked numerical example versus p49–51 exercise: exact output-type obstruction

**Agent17, Director #3285, 28 November 2026.** No new plaintext or key. This narrows the strongest visible worked-example/exercise pairing rather than inventing a new cipher.

## Source and scope

Original p15 (32.jpg) has a red 3299 in a 4×4 decimal array, a separate infinity mark, and encrypted rubrics. Original p49–51 (66–68.jpg) has one uninterrupted 32×8 mixed-case two-character panel; no adjacent independently readable input/output labels or red origin of the same kind. Original JPEGs were inspected locally, with the full LP2 contact sheet used to select the pair. The first object is the only established exact arithmetic generator in unsolved LP2; the second is the strongest apparent numeric exercise. However, neither explicitly prints a Fibonacci input/output pair. The inputs are **inferred** by the already solved [p15 formula](../results/lp2-p15-fibonacci-prime-spiral.md), not independently labelled source operands.

Preflight: #2601 did not establish the hierarchy/carrier selection rule from historical clue syntax; #3279 found no transferable literal numeric instruction from the solved LP1 tables; #3275 found no typed operation in its selected artwork comparison. The present result is an exact **range and parity** obstruction to using p15's established output type directly, rather than another visual analogy, sum match, modulo-key stream, or provenance audit.

## Exact obstruction

For the established generator D(n)=|3301-prime(F_n+1)|, where F_n are the distinct Fibonacci values beginning 0,1,2,3, the first sixteen outputs have minimum 708 and maximum 4516. The final prime is 7817>3301. Every later Fibonacci index and prime is strictly increasing, so every later D exceeds 4516. Thus the entire nonnegative-index generator has **no output in [0,255]**. This excludes every subsequence, permutation, starting index and continuation as a direct exercise-output explanation of the byte-valued panel under either of the two pinned numeral readings. It does not depend on predicting huge Fibonacci-indexed primes.

A second exact obstruction covers the natural loss of range by reduction modulo 256 (and any even modulus). Only the prime 2 is even, so D(0)=3299 is odd and **all D(n), n>0, are even**. Any contiguous 256-output run has at most one odd value; repeating the original 16-term worked block sixteen times has exactly sixteen odd values. Even-modulus projection preserves parity. A fixed cell permutation cannot change the count.

The original 256-token transcription, blob 2550eae357442912220e05dc51147523a61dd75a, yields:

| Pinned convention | Range | Odd outputs p49/p50/p51 | Total odd |
| --- | --- | --- | --- |
| Base60 | 0–255 | 42/50/30 | 122 |
| Drop-f base59 | 0–251 | 38/51/38 | 127 |

Both counts exclude a literal continuation/reordering and a simple periodic repetition of the worked block after even-modulus reduction. An arbitrary additive offset or XOR key is not this operation; extensive prior source-key tests are already recorded, e.g. [literal pad](p15-16value-spiral-p50-256byte-literal-pad-gate.md). No new key search is warranted.

## Reproducer

Run from repo root, Node CJS. Reads the original-derived, independently checked token transcription, asserts both known numeral decodings and verifies the arithmetic premises without any language scoring.

```js
const assert = require('node:assert/strict');
const j = require('./resources/liber-primus/lp2-grid-256.json');
const primes = [];
for (let n = 2; primes.length < 988; n++) {
  if (primes.every(p => p * p > n || n % p !== 0)) primes.push(n);
}
const f = [0, 1, 2];
while (f.length < 16) f.push(f.at(-1) + f.at(-2));
const d = f.map(n => Math.abs(3301 - primes[n]));
assert.deepEqual(d, [3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]);
assert.equal(Math.min(...d),708);
assert.equal(primes[f.at(-1)],7817);
assert.equal(d.filter(n => n % 2).length,1);
for (const [a, expected, bounds] of [
  [j.alphabet,[42,50,30],[0,255]],
  [j.alphabet.replace('f',''),[38,51,38],[0,251]]
]) {
  const pages = j.pages.map(p => p.tokens.map(s => {
    const x = a.indexOf(s[0]), y = a.indexOf(s[1]);
    assert(x >= 0 && y >= 0);
    return x*a.length+y;
  }));
  const values = pages.flat();
  assert.equal(values.length,256);
  assert.deepEqual([Math.min(...values),Math.max(...values)],bounds);
  assert.deepEqual(pages.map(p => p.filter(v => v%2).length),expected);
  console.log(a.length, bounds, expected, expected.reduce((x,y)=>x+y,0));
}
```

## Decision

The actual p15 sequence is solved; p49–51 cannot be its direct numerical exercise output under the pinned readings, even under the above elementary byte reduction. A **separate, independently specified transformation or differently typed input/output role** is missing. The encrypted rubrics may contain such instructions; we cannot infer them from shared numerical appearance. This does not exclude other ways of using p15 or p50 as operands. Close the selected pairing, no new rune inverse or plaintext claim.
