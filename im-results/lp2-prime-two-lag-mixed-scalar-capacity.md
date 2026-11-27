# Mixed GP-prime state and raw two-lag residual: exact scalar-receiver gate

**Decision (Agent20, 27 November 2026):** this finite 50,460-class experiment finds no native-reference-compatible decoding of physical p40–53. No unknown plaintext or authentic key is recovered. The receiver is exploratory, motivated by the independently authentic Gematria prime representation and ciphertext-visible feedback; no first-party instruction selects it.

## Mechanism and exact scope

Let (g(x)) be the canonical Gematria prime of rune x reduced modulo 29 (24 distinct residues). For preceding ciphertext runes x,y, test every nonzero scalar projection of the *prime* representation, normalized to s=g(x)+t*g(y) for t=0..28 or s=g(y). Let z=C+a*x+b*y for all a,b=0..28. A secret independent arbitrary permutation of GP29 for each of the 29 states maps z to plaintext. The exact forward inverse of a chosen table is C=pi_s^{-1}(P)-a*x-b*y mod29. The first two runes of each clock frame are granted arbitrary plaintext. Both continuous chapter and common-table physical-page reset are tested. There are 30*841=25,230 covering classes per clock; a nonzero multiplier on current C is absorbed in the row table. In contrast to the earlier [raw two-lag scalar gate](lp2-two-cipher-lag-projective-scalar-capacity.md), the prime state is nonlinear and noninjective in the raw predecessor symbols, so a residual shift cannot generally be quotiented by a scalar multiple of s. The [cumulative prime gate](lp2-cumulative-cipherprime-scalar-capacity.md) concerns a different state with long memory.

For fixed (t,a,b), count M[s,z]. Any two plaintext symbols jointly have count at most U2 = free + sum of the two largest counts per row. Likewise U1 uses row maxima. Even granting a literal F bypass at any ciphertext F while keeping the **physical** history clock, top-two concentration is bounded by max(U2, #C_F+U1). This deliberately loose bound allows ambiguous F masks, but not consuming-only feedback histories that omit held Fs.

## Exact original result

| Clock | Free symbols | Classes | Max U1 | Max U2 | Max with F bypass |
|---|---:|---:|---:|---:|---:|
| Continuous p40–53 | 2 | 25,230 | 260 | 467 | 467 |
| Common-table physical page reset | 26 | 25,230 | 280 | 490 | 490 |

Original 3,008-rune tape, 125 ciphertext Fs. Both maximum-U2 witnesses are (t,a,b)=(21,18,13), but even this extremal histogram does not supply a key. Max U1 and U2 need not come from the same class. Neither clock has any class reaching 518, the minimum concentration among 214,099 contiguous native-GP Shakespeare windows; all 59,485 Gibran windows have top-two concentration >=563. The encoder is shared with the earlier scalar-allwindow gate. These 273,584 windows are finite, overlapping reference controls; this is not a population p-value or an exclusion of every conceivable plaintext register. Because the bound applies to histograms, arbitrary chapter-internal reordering alone does not rescue the family.

Two deterministic independent-row-permutation plants on disjoint literary excerpts recovered 6,016/6,016 symbols with known tables. Their actual top-two counts 596 and 604 are below their bounds 692 and 685 respectively. These demonstrate inversion and capacity correctness, not blind key recovery. The F extension is a mathematical relaxation and was not separately planted. Neither original key scoring nor arbitrary extra state searches were performed after the exact capacity gate failed.

## Reproduction and next decision

[CommonJS SFT](../sims/lp2_prime_two_lag_mixed_scalar_sft.cjs) and [machine output with exact input blob IDs](lp2-prime-two-lag-mixed-scalar-output.json). The exact experiment function was executed in the connected JS runtime; standalone Node wrapper was not separately run. The selected corpus transcription was reused, not independently re-transcribed. The model does not cover arbitrary nonlinear state maps, distinct private page tables, non-physical feedback histories, or more than one state coordinate. Do not retune this state family; an independently motivated new receiver is necessary. No authoritative-results promotion.
