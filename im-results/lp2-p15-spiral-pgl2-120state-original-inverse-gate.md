# P15 infinity + Fibonacci-prime spiral: a complete 120-state projective cipher gate

**Agent 10, 22 November 2026. Status: source-motivated conditional negative, no recovered unknown plaintext or key.** This exact study tests a nonlinear mathematical interpretation of the original p15 ornament and printed spiral. The 16 number values are established facts; treating consecutive spiral quadruples as fractional-linear transformations is a **hypothesis, not a documented instruction from Cicada**.

## Why this operation is intelligible to a human solver

Original LP2 p15 scan 32.jpg displays a red 3299 inside a 4×4 number square and an infinity/Möbius-like symbol below. The numerical generator and its clockwise outward spiral order are already fully verified in [the established p15 result](../results/lp2-p15-fibonacci-prime-spiral.md). The GP alphabet contains 29 symbols; adding a formal infinity state gives the standard 30 points of P¹(F29). A specific, small hypothesis is to group the sixteen **source-ordered** integers into four 2×2 matrices and interpret each as a Möbius map x → (ax+b)/(cx+d) modulo 29.

In original outward spiral order, reducing coefficients modulo29 gives:

| Transition | Coefficient matrix [[a,b],[c,d]] | Determinant mod29 |
| --- | --- | ---: |
| M0 | [[22,21],[19,17]] | 4 |
| M1 | [[11,1],[10,3]] | 23 |
| M2 | [[20,22],[25,7]] | 25 |
| M3 | [[22,12],[17,21]] | 26 |

All maps are invertible. Their four-step composite T=M3×M2×M1×M0 is exactly **[[11,8],[13,7]] mod29**, determinant **2**. The first positive projective scalar power is **T³⁰=2I mod29**; no earlier power is scalar. Hence T has **projective order 30**. Starting at the illustrated infinity point, a cyclic succession of the four maps visits **120 distinct (phase, projective-state) pairs** before returning to its original state. That is a mathematical property of this *chosen* grouping, and does not by itself establish creator intention.

## Exact original-cipher exclusion for deterministic state

Even with a nonlinear Möbius update, an output table driven only by this fixed 120-state orbit is a 120-phase GP29 substitution. Grant each of the 120 state/phase pairs a **completely secret, independently selected full permutation of all 29 rune identities**, with no restrictions on the keys. Within each state class, a bijection cannot alter equal-value pair counts. Thus within-state coincidence is an exact ciphertext-only necessary invariant for **all 29!^120 candidate secret table assignments**.

| Original runes | Equal pairs / eligible pairs | Exact within-state IoC | Smallest IoC in 270 matched genuine-GP controls |
| --- | ---: | ---: | ---: |
| p16–p21, **1,613** runes | 391 / 10,049 | **0.0389093442** | **0.0528410787** |
| Independent floral p40–p53, **3,008** runes | 1,246 / 36,200 | **0.0344198895** | **0.0561602210** |

Controls are 90 complete 12,956-rune, original-word-length-matched native GP streams each from Gibran, Shakespeare and Latin Vulgate, preserving all 2,896 original printed word slots and both exact original chapter cuts. **Zero of 270** matches or falls below original on either section. For positive controls, 120 random independently secret 29-rune alphabets encrypt genuine-GP passages; each original-length native passage (1,613 or 3,008 runes) is recovered **exactly**, with ciphertext and plaintext class-local equality agreeing identically.

This is a native-text register exclusion of **the deterministic p15-inspired 120-state system**, not a universal proof that a cipher cannot be projective or an alternative plaintext alphabet could not be used. The [13 November all-secret 16-phase original gate](lp2-p15-period16-allsecret-source-gate.md) had already excluded the stationary 16-phase system. This study addresses a **different source-derived 120-state nonlinear orbit** and its disjoint-page receiver.

## The actual source-visible origin and an adaptive F-skipping inverse

Solved original p56 supplies one period-authenticated nonlinear scheduling exception: a recovered plaintext F rune holds its prime/totient key cursor. To test that **specific** state-changing behavior without an arbitrary feedback function, take the four p15 Möbius matrices as above, use state ∞ as zero additive shift, and decode each original rune P=(C−key) mod29. If recovered P is **F=GP ordinal 0**, hold the current Möbius state and matrix phase; otherwise apply the next M and advance the phase. Punctuation and printed line breaks consume no GP state. Encryption reverses this rule exactly from plaintext, and genuine source-native positive controls roundtrip all runes.

The infinity symbol physically precedes **p15's second red heading**. Accordingly, use its first rune at local p15 index **9** as the actual source-visible start, then process the following **150 intact p15 runes** before entering p16–p21. The decoded 11-rune red heading starts:

    L N NG I OE B F NG J E TH

Carrying the same exact state through original p16–p21 yields **1,613/1,613** cipher symbols on forward replay, yet its proposed plaintext is nonlinguistic: **global IoC 0.0346648432**, top-five rune occupancy **341/1,613**. Its first p16 decoded symbols begin:

    G J OE H U X G E A G EA EO J EA TH G I E Y A H B TH T EO B EA I G W C C TH ...

The simpler, weaker page-local p16 infinity restart has IoC **0.0349186741** and top-five 352/1,613. An independently restarted floral p40–p53 test likewise yields no prose (IoC **0.0345691613**, top-five 604/3,008). The positive source-native F-skip plant decrypts exactly; correct forward replay alone is **not** proof of an original manuscript solution.

## Decision and next required source

**Both fully specified operations fail to recover unknown GP-native plaintext:** the all-secret deterministic 120-state projective readout is sharply excluded on two intact chapters, while a genuine changing-state reader borrowed from solved p56 produces no coherent text on the physical p15-seeded original.

The image does not specify grouping numbers into 2×2 maps, how projective infinity emits a GP rune, the 2014 author's actual F exception beyond the separately solved p56 scheme, ciphertext/plaintext feedback, secret start, or chapter reset. More arbitrary Möbius conjugacies, seeds, retuned state arithmetic and unspecified nonlinear lookup tables are not justified by the printed source. The next meaningful advance is **independently authenticating a state update or source-derived key** that predicts original prose on a withheld chapter; absent this, treat the square as a solved number puzzle, with no claimed rune decoder.

**Exact reproducer:** [complete Node.js22 CommonJS GP-native script](../sims/lp2_p15_spiral_mobius120_original_gp_native_sft.cjs) and [Windows GitHub Actions PASS, run 45013673166](https://github.com/FlareZ123/liber-primus/actions/runs/45013673166). Sources are the original p15 32.jpg and canonical original LP2 corpus plus transcription.
