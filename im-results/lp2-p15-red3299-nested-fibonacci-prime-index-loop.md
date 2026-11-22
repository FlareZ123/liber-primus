# The red 3299 and a nested twin-prime/Fibonacci prime-ordinal loop in the original p15 grid

**Agent31, 22 November 2026. Exact newly identified original-artifact arithmetic; proposed human solve path remains unauthenticated. No unknown LP2 plaintext or key is recovered.**

## The source-defined construction already established

Physical LP2 p15 displays sixteen numbers in a 4×4 arrangement, including **3299 printed in red**. [The established original-image solution](../results/lp2-p15-fibonacci-prime-spiral.md) determines that clockwise outward from the red cell the source has the ordered numbers

```text
3299 3298 3296 3294 3288 3278 3258 3222
3152 3038 2838 2472 1820 708 1206 4516
```

They are exactly `|3301 − p_(F_n+1)|` for the 16 distinct Fibonacci values `[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]`, one-based prime index `p_j`. The red starting cell has printed coordinate (row1,col1), with rows/columns zero-based. All other fifteen displayed values are **even**; the red cell 3299 is the unique odd grid number, and it is itself **prime**.

## Previously unnoticed nested prime-rank identity

The red starting value **3299** and historical Cicada number **3301** are twin primes, with **prime ranks 463 and 464**, respectively. Meanwhile the very same original square includes the **Fibonacci ordinal 89**, so its corresponding source-selected prime index is **90** and its selected prime is **463**:

```text
Fibonacci value 89  ->  rank 89+1 = 90
89th ordinary prime = 461
90th ordinary prime = 463
463rd ordinary prime = 3299 (red p15 cell)
464th ordinary prime = 3301 (historical Cicada name)
```

There are **two nested twin-prime pairs**: **461,463** are twin primes, and **3299,3301** are twin primes. Their prime indices form the sequence `89,90` and `463,464`. The shared value **463** appears both as a **prime at the Fibonacci-selected rank90** and as **the prime ordinal of the red value3299**. The source therefore selects an original square value that references its own red starting prime through the ordinary prime-index function.

The p15 spiral's rank90 selected prime463 is actually printed as the complement **3301−463=2838**, at original coordinate **(row1,col3)**. From the red (row1,col1), this is **exactly two columns to the right**, the same displacement as the **2** separating the red prime3299 from3301. Comparing the two original printed cells gives:

```text
red 3299 − cell 2838 = 461 = 89th prime
3301     − cell 2838 = 463 = 90th prime
π(3299) = 463;  π(3301) = 464
π(π(3299)) = π(π(3301)) = 90
```

Here `π(x)` counts primes ≤x, and `p_j` denotes the jth ordinary prime. The original red cell is the **only** source square cell that can initiate a loop where a prime printed value `x` has another printed cell equal to `3301−π(x)`; its unique partner is 2838. These equalities are independently checked by a prime generator that computes `p_j` and `π(x)` rather than treating the numerical answer as a manually chosen decoding.

## What this does and does not establish

This is an exact, reproducible **structural discovery** beyond the previously established basic Fibonacci-prime formula. A human solver could notice the sole red odd prime, recognize its twin3301, read the cell two spaces right, recover the two nested twin-prime pairs and their Fibonacci-indexed ranks. It strengthens the independently proposed **TWIN PRIME** interpretation of p15's top red 4|5-runic heading, described in [the conditional crib frontier](../workplace/p15-twin-prime-red-heading-crib-frontier.md).

**The source does not explicitly command this two-rightward traversal, application of `π` twice, or use of 90/463 as a rune-decoding key.** Its low arithmetic complexity is a reason to explore the route; it is not a discovery-adjusted statistical proof of deliberate design. Source-selected prime indices may explain *where* to look for a key or ciphertext but supply no authenticated *how* to transform GP29 runes into plaintext.

A simple consumer has already been explored elsewhere: the authentic solved-p56 prime-totient cipher with all start indices0–463 and every plaintext-F skip history, on all nine original unknown LP2 chapters, yields no complete plaintext (see [complete all-464 inverses](lp2-prime-totient-all464-true-Fbranch-original-complete-inverses.md)). Thus choosing **463** as an unmodified prime-totient start is not a justified next experiment. The next material advance must specify a first-party extraction or receiver rule for the original 2838/90/463/3299 loop and independently predict a **second rune passage**; do not fit a new cipher to the upper p15 heading's proposed text.

## Reproduce

[Original-grid, original-red-span and nested-prime-rank CommonJS SFT](../sims/lp2_p15_red3299_prime_rank_loop_sft.cjs). Its input assertions preserve the entire physical 4×4 square, the exact red 9/11 rune-span boundaries, the 16 Fibonacci ranks, and every displayed cell. It checks every printed cell for a competing prime-ordinal partner and asserts the unique original partner2838. CI: [22 November manual Windows Node22 original-input runner](https://github.com/FlareZ123/liber-primus/actions/workflows/agent31-p15-twinprime-crib.yml) (select `prime_rank_only=true`). The mathematical statements and exact pinned data do not depend on a language scorer, dictionary or secret key.
