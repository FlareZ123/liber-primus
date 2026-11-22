# GF257 page-length root correspondences: complete corpus control

**Critic audit, 22 November 2026. Evidence classification:** original-data algebra and deterministic conditional permutation control. No unknown-page plaintext, key, or intended LP2 operation has been recovered.

## The decision that changes

The p29 coefficient polynomial has a unique GF257 root at **121**, equal to physical p32's length; the conventional base60 p50 table polynomial has a unique GF257 root at **213**, equal to physical p23's length. Both equalities are exact. Both roots and their target pages were identified **after examining the original sources**. The already-known p29 and p50 GF29/GF841 polynomial factor constraints are separate facts; the test below does not condition on them. It tests whether root-matches-page-length is a rare *whole-book phenomenon* by itself.

## All original-source roots against the same target family

Parse 55 original rune-bearing physical pages p0–p55 (p50 is numeric-only) from `resources/liber-primus/lp2-corpus.json`, plus the 256 conventional base60 byte values in `resources/liber-primus/lp2-grid-256.json`. Interpret each original ordered symbol array as highest-degree-first coefficients over GF257, and evaluate at **every** x=0..256 with Horner's rule. Compare roots against every distinct physical unsolved-page rune length that lies in the field: **21 distinct target lengths** among 55 pages (36 distinct page lengths overall).

Six of the 56 original source arrays have a root matching at least one allowed physical page length:

| Original coefficient source | All GF257 roots | Root that matches target length | Physical target |
| --- | --- | --- | --- |
| p19 | 238 | 238 | p36 |
| p26 | 22,169,197,201,227,228 | 201; 228 | p2; p37 and p38 |
| p29 | 121 | 121 | p32 |
| p36 | 196 | 196 | p6 |
| p51 | 0,214,225 | 214 | p33 |
| p50 numeric table | 213 | 213 | p23 |

**Four** root-matching sources have exactly one GF257 root: p19, p29, p36 and the p50 table. Thus uniqueness of the root and equality to *some* page length also occurs without the highlighted p29/p50 relationship.

## Conditional no-cipher null

For each of 1,200 deterministic trials, independently shuffle the exact symbols **inside each of the 56 original source arrays** with Fisher–Yates (xorshift32 seed `0xC1CADA26`). Preserve each array's length and entire symbol histogram and preserve the 21 allowed target lengths. Count how many of the 56 resulting polynomials have at least one GF257 root matching any target length. The null has mean **4.31917**, SD **1.96315**; **304/1200 = 0.25333** trials have at least six such matches, versus **six observed**. This is a descriptive conditional tail, **not a discovery-adjusted design probability**. It does not assess the specific source-chosen p29/p50 factors, G(x), the later GF841 carrier, or the p55 length/Fourier-bin alignment.

Reproduce the source census, the exact six matches, and the deterministic full-distribution control with [the read-only Node22 CommonJS SFT](../sims/lp2_gf257_root_page_length_global_critic_sft.cjs). Its assertions pin the original root list and the 304/1200 tail, making changes in source text or arithmetic visible. **Original-source Windows Node22 run [44980097475](https://github.com/FlareZ123/liber-primus/actions/runs/44980097475) completed successfully** and printed `observedMatchedSources: 6` and `nullTailAtLeastSix: 304`. No artificial English plants are needed for this source-only false-positive calibration.

## Research consequence

The *family* “some original polynomial has a GF257 root equal to some LP2 page length” is demonstrably common enough under this fixed-symbol multiset null that it cannot be used alone as a source selector. Do not infer an authored p29→p32 or p50→p23 cipher handoff from root/length equality or unique-root status alone. The independently visible p39 red G factor and the p50 32×8 physical rectangle may still motivate particular experiments, but a claimed **cross-field decoder** must derive an operation/key from independent source clues and predict previously unseen plaintext or held-out original symbols **without importing root targets or syndrome constants measured on the full data**.

In particular, the [two-field erasure demonstrations](lp2-crossfield-erasures-p29-p50.md) reconstruct original suffixes **after using check relationships learned from complete source arrays**. Their exact matches demonstrate consistency of chosen equations, not prospectively derived manuscript error-correction instructions.
