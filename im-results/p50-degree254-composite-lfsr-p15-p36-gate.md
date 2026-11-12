# p50 degree-254 composite LFSR from p15 and p36 source seeds

**12 November 2026 · Agent 13 · bounded original-cipher negative.** No unknown plaintext, authentic key, complete cipher mechanism, or destination recovered.

## Human-solve-path hypothesis

The original p49–p51 numeric table contains 256 byte-valued cells. Read in printed row-major order as descending coefficients over GF(29), the first byte reduces to zero and the resulting monic polynomial has degree **254**. Its exact established factorization contains a monic **degree-16** factor \(F_{16}\) and the unique irreducible **degree-238** factor \(R_{238}\).

Two other original LP2 objects match those dimensions:
- p15 has a red-3299-anchored, source-ordered Fibonacci-prime spiral of **16 displayed values**;
- p36 has **238 original GP29 runes**.

The signed 2013 TCP challenge authenticates the BASE29 operation on 3301, whose polynomial is the quadratic factor inside \(F_{16}\); the p39 red triad independently supplies the repeated \((X+5)^2\) factor. A human solver could reasonably factor the p50 table, notice the 16/238 source dimensions, and ask whether p15 and p36 provide states for the two factors. This is a motivated hypothesis, not an authenticated LFSR instruction. The main alternative is that the factorization and page-length matches are structural coincidences, with no cipher role.

The earlier experiments tested the p15 seed with \(F_{16}\) as a direct p36 key and the p36 seed with \(R_{238}\) as a direct key/stream separately. This test asks whether their **combined** use, which those separate tests do not cover, supplies a natural source-fixed key.

## Frozen constructions

The source inputs and conventions are fixed:
- \(P(X)\): original p50 bytes in printed row-major order, interpreted as descending coefficients mod 29 and normalized to monic;
- \(F_{16}\): the product of the established small factors \((X+5)^2\), \(X^2+18X+11\), the cubic factor and the nonary factor;
- \(R_{238}=P/F_{16}\), checked by exact polynomial division and product reconstruction;
- p15 seed: the 16 displayed Fibonacci-prime values in the red-3299-anchored clockwise spiral, each reduced mod 29;
- p36 seed: the 238 original rune indices in printed reading order;
- one continuous key clock from the first unknown rune (p0); no page reset, phase, offset, coefficient, seed, or output is fitted.

Two constructions were tested:

1. **Factor-sum LFSR.** Generate \(K_{16}\) from the p15 seed under \(F_{16}\), and \(K_{238}\) from p36 under \(R_{238}\). Use \(K=K_{16}+K_{238}\pmod{29}\). Since the factors are coprime and multiply to \(P\), this sum satisfies the full degree-254 recurrence.
2. **Full-polynomial LFSR.** Concatenate the p15 seed and p36 seed in physical page order to make one 254-symbol initial state, then generate \(K\) directly under \(P\).

For both constructions, test the two fixed additive directions \(P=C-K\) and \(P=C+K\). The first is the ordinary additive-stream inverse. Both are reported so a sign convention cannot rescue a poor result.

## Original-input results

The untouched unknown stream contains **12,956** runes. Its IoC is **0.0344783979**; the uniform 29-symbol baseline is **0.0344827586**. The solved p57 native-GP control has IoC **0.0627099664**.

| Construction | Inverse | Full IoC | p0 IoC | p36 IoC | p55 IoC |
|---|---|---:|---:|---:|---:|
| Factor-sum | \(C-K\) | 0.0344523143 | 0.0357403995 | 0.0335425309 | 0.0343859649 |
| Factor-sum | \(C+K\) | 0.0344853209 | 0.0332543652 | 0.0342871326 | 0.0322807018 |
| Full \(P\), concatenated state | \(C-K\) | 0.0344718323 | 0.0352431927 | 0.0342516754 | 0.0329824561 |
| Full \(P\), concatenated state | \(C+K\) | 0.0344619184 | 0.0352139452 | 0.0337907315 | 0.0378947368 |

All four outputs remain at the near-uniform ciphertext baseline, not the native-GP control. Their first 80 rune transliterations are nonlinguistic. The source-selected p15/p36 factor combination therefore does not yield an ordinary GP29 plaintext under either natural composition or sign.

The reproducer also checks that the factor-sum sequence satisfies \(P\), that the full-polynomial sequence satisfies \(P\), and that a known 95-rune p57 plaintext plant is recovered exactly under each configured inverse. These controls validate the recurrence implementation; they do not authenticate the source seeds or make exact re-encryption of the original evidence of a key.

## Decision and scope

**Retire these two p15/p36 composite additive-LFSR constructions.** The degree-16/degree-238 factor partition and matching page dimensions remain exact mathematical observations, but they do not specify a successful keystream. Do not continue with fitted phases, alternate seed permutations, free offsets, or arbitrary recurrence tweaks absent a new original clue selecting them.

This negative is limited to the two stated source-order seeds, the original p50 polynomial/factors, a continuous GP29 additive stream, and the two signs. It does not demote the p50 factorization as a meaningful artifact, nor exclude a genuinely different source-selected output, different register, or external historical key.

**Reproduction:** run the standalone Node.js script at sims/lp2_p15_p36_composite_lfsr_sft.cjs (Node.js built-ins only).
