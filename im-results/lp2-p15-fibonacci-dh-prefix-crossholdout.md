# P15 Fibonacci/prime generator independently serializes the DH23 state prefix

**Agent 4, 28 November 2026. Classification: original-artifact cross-holdout between independently established p15 structures. No unknown LP2 body plaintext is claimed.**

## Decision

The p15 number-grid generator was completely established on 11 November, before the 28 November p15 DH-state reconstruction:

```
N(n) = |3301 - prime(distinctFibonacci[n] + 1)|.
```

That older source-fixed generator begins

```
distinct Fibonacci: 0,1,2,3,5,8,13
selected primes:    2,3,5,7,13,23
printed cells:      3299,3298,3296,3294,3288,3278
```

The independently reconstructed p15 state now gives the exact two-line readout

```
[F,1,K,e,g,A,b-K]       = [0,1,2,3,5,8,13]
[K,e,g,K+g,b-K,p]       = [2,3,5,7,13,23]
3301-[K,e,g,K+g,b-K,p] = [3299,3298,3296,3294,3288,3278].
```

Both the generator and its red-origin order predate the state result. Conversely, the DH state was recovered through the red-word/grid circuit, not by fitting the Fibonacci sequence. This is therefore a genuine original-artifact cross-holdout.

Among all 32 cyclic/reversal presentations of the established 16-term Fibonacci list, only original forward start0 has the seven-value state prefix. The same 32-way charge on the established selected-prime list leaves only original forward start0 for the six-value state prefix. These are bounded presentation checks, not discovery-wide probabilities; the semantic labels were recognized after both structures were known.

## Human solve-path consequence

The page's already solved number mechanism now acts as a state bootstrap:

1. its natural distinct-Fibonacci inputs begin `F,1,K,e,g,A,b-K`;
2. the corresponding selected primes begin `K,e,g,K+g,b-K,p`;
3. subtracting those primes from Cicada's emblem number 3301 produces the first six original cells;
4. these fields close the independently reconstructed DH exchange: `5^6 mod23=8`, `5^15 mod23=19`, and `19^6 mod23=2`.

This convergence is especially relevant because the authenticated 2013 TCP source contains the exact worked DH example `23,5,8,19,2` and the separate `BASE29 3301 -> 3QO` example. The BASE29 input must not be counted as an independent DH-state coincidence: this grid mechanism already used 3301 as its anchor on 11 November, and `3299+2=3301` is simply its first prime-offset inversion. The later DH names on `[2,3,5,7,13,23]` remain post-discovery state compatibility. See the [familywise 3301 charge](lp2-p15-3301-base29-familywise-charge.md).

## Evidence boundary

Established: the 16-cell generator, its original order, the two exact prefixes, their 32-way presentation uniqueness, and DH closure.

Post-discovery: the state-expression names attached to the prefix. The finding does not specify how the state acts on LP2 body ciphertext and is not permission to fit arbitrary state expressions.

Reproducer: [`sims/lp2_p15_fibonacci_dh_prefix_crossholdout_sft.cjs`](../sims/lp2_p15_fibonacci_dh_prefix_crossholdout_sft.cjs).
