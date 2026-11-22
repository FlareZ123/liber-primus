# Source-numbered two-register GP29 companion cipher: original cross-chapter negative

**Agent12, 22 November 2026. Classification:** one fixed, source-numerically motivated, reversible GP29 two-register inverse tested on all 12,956 genuine unknown runes. The original **does not reveal plaintext**, and the proposed state equation is **not source-authenticated**. This is a one-model decision for [Director #2211](https://github.com/FlareZ123/liber-primus/issues/2211), distinct from the earlier all-secret one-register affine feedback closure.

## The actual possible human clues and their weakest link

The unchanged original p0 red 13-rune title has GP0 indices `[15,8,18,3,6,19,27,0,15,26,18,21,5]`. Its index sum is **181 ≡ 7 mod29**, while its GP-prime weights sum to **662 ≡ 24 mod29**. The authentic p40–55 repeated flower illustrations have two five-dot motifs traditionally interpreted as binary **13** and **31**. The GP29 numeric alphabet, two explicit source ornaments, and red title together suggest *two numerical state registers*, with no hidden key material.

The closest historical reversible cipher precedent is solved p56's source-local additive GP29 inversion. For a concrete, unoptimized companion extension choose **one** ciphertext-feedback two-register equation, with source-derived initial state and ornament-derived coefficients:

[
S_0=7, quad T_0=24,qquad
C_i=P_i+S_ipmod{29},qquad
(S_{i+1},T_{i+1})=(T_i,13S_i+31T_i+C_i)pmod{29}.
]

It has a single state clock across p0–55, including physical page carries; the rune-free p50 advances no state. The 13 and 31 remain literal source motif values rather than tuned mod29 parameters (31≡2). The companion register distinguishes this from #2162's scalar update `S'=aS+bC+d`. Its forward and inverse are unambiguous, and its coefficient matrix has determinant `−13 ≠ 0 mod29`.

**Missing original selector:** An actual human solver is not told to interpret the sums of p0's rune ordinals and primes as the two initial registers, combine floral marks as *linear coefficients*, or feed previous ciphertext into the second component in this exact arrangement. The ornament first appears much later than the p16–21 training corridor. Other equations are equally simple, so success would require coherent original plaintext and an independent holdout before any attribution.

## The frozen experiment and complete original result

The [original-source Windows Node22 SFT](../sims/lp2_two_register_floral13_31_p0title_original_sft.cjs) reads both canonical rune corpus and independent red title annotation, checks the 13 original red rune indices and sums, then decrypts the entire original 12,956-rune unknown manuscript with **no fitted parameter, key, state reset, page boundary edit, clock phase, or rune omission**. Only after fixing the entire rule are four disjoint, author-visible sections evaluated.

| Genuine original scope | Original runes | Ciphertext GP29 IoC | Exact two-register candidate IoC |
| --- | ---: | ---: | ---: |
| p16–21 training corridor | 1,613 | 0.034549465 | **0.034469470** |
| p40–53 floral holdout | 3,008 | 0.034542627 | **0.034441799** |
| p0–2 opening holdout | 729 | 0.034082516 | **0.035450489** |
| p54–55 terminal holdout | 308 | 0.033821228 | **0.034836499** |

Entire original candidate IoC = **0.034529158989**. The first 70 p16 decoded rune labels begin `T G R TH C C E NG NG NG T J R L U C N A NG B L S P P N S IA S Y P TH`, without any continuous readable phrase. Every tested long section remains near the GP29 uniform coincidence baseline (1/29 ≈0.034483), far below authentic solved GP-native text (clear p57 IoC about0.063). The requested **200 contiguous intact GP runes** do not appear in either held-out chapter or the training corridor, so there is no second-page plaintext prediction.

The script checks the original full-source **12,956/12,956 re-encryption**, which only verifies reversibility, and a separate constructive genuine-solved source-positive: original unencrypted p57's actual 95 native GP indices, cycled to exact 1,613 and 3,008 lengths, are encrypted with this very same source-numeric two-register rule and both recover **100%** of their true rune indices. This ensures the source negative is not an implementation or algebra error. [Independent Windows Node22 execution: PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45008546752).

## Decision

Retire only the one exact, externally unselected, p0-title-seeded 13/31 two-register companion cipher. A larger state-parameter search would lack an original source opcode and would not repair the demonstrated failure. The principal missing input for **#2211** is an independently visible update rule or externally recoverable original key, followed by a real unknown-page plaintext passage and a second untouched prediction. The book's 56 unknown LP2 pages remain unsolved, and this negative cannot exclude other two-register laws, cryptographic compression, transposition, language changes, or an unavailable one-time pad.
