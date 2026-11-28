# P15 Fibonacci/prime generator cross-holds DH23 values but does not source-select the role packet

**Consolidated 28 November 2026. Classification: exact original-artifact value compatibility with three direct authenticated DH-value anchors; Director #3469 rejects the stronger claim that the generator independently fixes the full DH role packet. No unknown LP2 body plaintext is claimed.**

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

The numerical prefix and its original forward presentation are genuine source facts. The state-expression labels are post-discovery compatibility: #3399/#3422 already showed that p15 descriptor→role provenance is not source-selected.

Director #3469 now charges the generator against the independently authenticated 2013 transcript **without** using descriptor roles. Three selected-prime values are literal public DH values: `2=K`, `5=g`, and `23=p`. But the two generator lanes cannot share a transcript-ordered traversal. Exact public-value matches in the Fibonacci lane (`K,g,A`) realize transcript projection `g→A→K` only in forward presentations, whereas exact matches in the selected-prime lane (`K,g,p`) realize `p→g→K` only in reversed presentations. No one of the 32 common cyclic/reversal presentations satisfies both lanes.

The derived prime labels are likewise non-identifying in a small state-expression family. With atoms `{0,1,K,g,a,A,b,B,p}` and one modular-29 addition/subtraction, values3,7,13 have respectively 4,7,6 minimum-cost expressions; the published `e,K+g,b-K` are only one choice each. The next selected prime43 reduces to14 and has six minimum-cost interpretations, so it does not validate a unique continuation.

Thus the correct claim is a source-exact generator with three direct authenticated public-value anchors and a striking conditional state compatibility—not an independently recovered role packet. [#3469 role gate](lp2-p15-prime-difference-dh-role-gate.md).

## Human solve-path consequence

The page's solved number mechanism still gives a plausible historical cross-reference. Its prime lane literally contains three values from the signed 2013 DH worked example (`K=2,g=5,p=23`), and its anchor3301 independently selects the same source's BASE29 example. What it does **not** supply is an authored rule that labels the remaining primes or turns the forward spiral into the protocol's role order. DH closure remains a compatibility check after the tuple is known, not a role-recovery algorithm.

This convergence is especially relevant because the authenticated 2013 TCP source contains the exact worked DH example `23,5,8,19,2` and the separate `BASE29 3301 -> 3QO` example. The BASE29 input must not be counted as an independent DH-state coincidence: this grid mechanism already used 3301 as its anchor on 11 November, and `3299+2=3301` is simply its first prime-offset inversion. The later DH names on `[2,3,5,7,13,23]` remain post-discovery state compatibility. See the [familywise 3301 charge](lp2-p15-3301-base29-familywise-charge.md).

## Evidence boundary

Established: the 16-cell generator, its original order, the exact numerical Fibonacci/prime prefixes, three literal prime-to-transcript value anchors `2=K,5=g,23=p`, the 3301 historical-source contact, and DH closure of the known tuple.

Post-discovery/non-identifying: the complete labels `[F,1,K,e,g,A,b-K]` and `[K,e,g,K+g,b-K,p]`. #3469 finds no common transcript-ordered presentation across the two generator lanes and no unique low-description labels for 3,7,13 or the later residue14. The finding does not specify how the state acts on LP2 body ciphertext.

Reproducer: [`sims/lp2_p15_fibonacci_dh_prefix_crossholdout_sft.cjs`](../sims/lp2_p15_fibonacci_dh_prefix_crossholdout_sft.cjs).
