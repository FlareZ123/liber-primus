# p15 Fibonacci-prime orbit: exact affine rank28 inverse

## Decision

No original key or plaintext recovered. All six rank/clock combinations have zero candidates by the tenth printed singleton in p16–18, and the eighth nonrepeat singleton already eliminates the entire domain. This is an exact finite-domain negative **conditional on native A/I/O singleton membership**, not a general source or rank28 exclusion.

## Frozen source-derived family

The p15 spiral is exactly the 16 absolute differences |3301 − prime[F+1]|, with distinct Fibonacci indices 0,1,2,3,5,…,987. The prior GP29 direct/F-hold transfer (`sims/lp2_p15_fibonacci_mod3301_prime_clock_sft.cjs`) already tested the finite Fibonacci orbit modulo 3301; its receiver is distinct from this repeat-escape transport. Here generate the entire 1650-state orbit F modulo 3301 and use either signed or absolute prime distance as a rank28 shift:

```
K[t] = (a * D[(phase+t) % 1650] + b) mod 28
D[t] = 3301 - prime[F[t]+1]  or  abs(3301 - prime[F[t]+1])
```

All 1650 phases and all 28^2 affine coefficient pairs, including nonunits; signed prime and prime-minus-one are equivalent to the signed distance under this affine domain. Initial rune is public; equal adjacent ciphertext runes encode one fixed escape e (all 29), either holding or consuming the clock. Otherwise use cyclic nonzero difference, log base 15 in GF29, or sorted rank excluding the predecessor; subtract the shift in Z28 and unrank excluding e. Exact inverse and forward encoder are implemented. The source establishes the numeral generator, not the additional modulo-3301 orbit or its use as a rank28 key.

Original target p16–22 has 1,744 runes; train p16–18 (800), freeze before p19–22 (944). A/I/O is imposed only at printed singletons in the fit. The first nonrepeat singleton supplies every possible b for each a/phase/e/transport; other singleton masks are checked exactly. Equal-mask escape groups are quotiented for speed, then expanded before scoring. This counts parameter tuples, including equivalent keys, not necessarily distinct streams. No holdout information enters fitting.

## Executed evidence

| Dataset | Fit singletons | Fit-compatible parameter tuples | Frozen holdout runes recovered |
|---|---:|---:|---:|
| Original | 10 | 0 | no candidate |
| Gibran | 15 | 26 | 943/944 |
| Emerson | 10 | 130 | 944/944 |

Original survivors after nonrepeat singleton constraints 1 through 8: 46,569,600; 4,538,144; 611,309; 170,770; 1,708; 202; 28; **0**. Both planted truth parameter tuples survive. Fit-only trigram ranking, trained on independent Shakespeare, recovers the exact Emerson key and all 944 withheld runes. For Gibran it selects the correct clock/transport/escape/phase/offset but coefficient a=3 instead of planted a=17; the fit language score is identical. Except at Fibonacci index zero, prime[F+1] is odd, so both signed and absolute distances to odd 3301 are even, making a and a+14 indistinguishable at those positions. Their predictions can differ when F=0 (prime 2), so 943/944 is reported rather than perfect key recovery. Exact replay verified for both selected controls. Neither is evidence of an original key.

The initial unoptimized execution and then sparse-window control execution timed out. The final implementation groups equivalent escape constraints and uses the previous experiment's explicitly recorded donor offsets (Gibran 1400, Emerson 12400), rather than the initial sparse offsets; original split unchanged. Final full run completed in V8 in 6.2 seconds. Node wrapper not separately executed. No nearby orbit or clock sweep recommended absent an independent source selector.

## Reproduce

- [CommonJS SFT](../sims/lp2_p15_fibprime_orbit_rank28_affine_sft.cjs)
- [Executed output](lp2-p15-fibprime-orbit-rank28-affine-output.json)
- `node sims/lp2_p15_fibprime_orbit_rank28_affine_sft.cjs` from the repository, using checked-in source/control inputs.
