# Corrected p50 degree-nine all-seed original-cipher gate

**22 November 2026, Agent8. Source-corrected negative. No unsolved plaintext, secret seed or intended cipher recovered.**

## Original source and correction

LP2's original p50 32×8 table gives the exact GF29 degree-nine factor
`N9(X)=X^9+12X^8+20X^7+10X^6+5X^5+X^4+9X^3+15X+11`, coefficients ascending `[11,15,0,9,1,5,10,20,12,1]`. The predecessor [all-secret N9 implementation](../sims/lp2_n9_allseed_anyalphabet_singleton_sft.cjs) had mistakenly exchanged `X²` and `X³`, using `[11,15,9,0,1,5,10,20,12,1]`. Its original negative conclusion was not a valid test of the printed factor. The proper **monic reciprocal** is `[8,9,15,22,11,8,14,0,4,1]` (reverse all ten coefficients and scale by the inverse of 11, which is 8 modulo 29). Merely reversing its nonleading nine coefficients is also invalid. The corrected solver now verifies exact polynomial division of the unchanged source table.

## Exact test

Original LP2 p0–p55 contains 12,956 rune tokens, 2,896 printed words and **83 one-rune words**. Under the usual native-English word-boundary assumption, any such word must be one of A, I or generously O. Consider a continuous additive GF29 stream driven by the source N9 polynomial, with **any initial nine-symbol state**, plus an entirely **unknown fixed alphabet permutation** of all 29 intermediate symbols. The inverse branches over every canonical assignment of 83 singleton sites to up to three unknown labels. At each branch it eliminates all consistent GF29 linear equations, preserving rank-deficient free variables. This is an exact all-secret decision for that explicitly delimited cipher, with no secret seed guessed or plaintext selected from original ciphertext.

| Source-selected characteristic polynomial | Original singleton sites | Largest consistent prefix | Full solutions |
| --- | ---: | ---: | ---: |
| True source N9 | 83 | 17 | **0** |
| True source N9 monic reciprocal | 83 | 17 | **0** |
| N9, p15–p22 chapter-local reset | 18 | 17 | **0** |
| Reciprocal, p15–p22 chapter-local reset | 18 | 17 | **0** |

A same-layout source-native Gibran ciphertext positive retains the planted true nine-state seed/permutation and exactly reencrypts 12,956 rune positions. Its first 13 genuine one-rune printed sites admit 8,993 compatible assignments, including the planted one. These 13 constraints do **not** uniquely recover the seed, so the control certifies correct compatibility logic and exact re-encipherment, rather than unique secret-key recovery.

## Research decision

The original contradiction persists after correcting the authentic degree-nine source factor and proper reciprocal. This decisively retires a fixed GP29 additive N9 keystream with any nine-symbol seed and a single stationary alphabet, if the visible 83 one-symbol printed words are true English one-letter words. It does not exclude non-English token semantics, variable key clocks, arbitrary per-page resets, F-transparent symbols, nonadditive methods or an independent source-selected key. No new original plaintext was recovered. The previously completed [p54 red9 chapter inverse](lp2-p54-red9-factor9-backward-chapter-allsecret-gate.md) separately excludes the narrower red9 fixed-state variant. Avoid extending either exhausted family without an independent clue.

Reproduce: [corrected original all-secret solver](../sims/lp2_n9_allseed_anyalphabet_singleton_sft.cjs), [standalone factor-audited copy](../sims/lp2_n9_correctfactor_allseed_anyalphabet_singleton_sft.cjs), [successful Windows Node22 full reciprocal run](https://github.com/FlareZ123/liber-primus/actions/runs/44976627084).
