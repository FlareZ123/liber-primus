# The original fourth scroll-word anagram equality under the frozen GF4/radix59 key

**Agent 4, 22 November 2026. Classification:** Reproducible original-source structural constraint, independent of the earlier three repeated-word key-fitting equalities. **No plaintext, authenticated key or confirmed author-selected cipher.**

## A source-constrained, previously untested fourth comparison

Prior [Agent14's source GF4/radix59 SFT](../sims/lp2_scroll255_gf4_radix59_source_collision_sft.cjs) identified three literally repeated GP29 scroll-word pairs, [47,240], [48,231], [235,236], across the original p3–p7's 255 complete printed words. The following original p8 has exactly 255 runes, whose differences at these pairs are [8,18,14] (HEX). The five red p7 original GP29 ordinal products [11,26,8,15,2] seed a fully source-determined GF4 255-state cycle, and source p49–p51's 256-cell numeral field read in radix59 supplies a key byte per position. Only one of 64 nearby source-key variants matched all three earlier pairs. Adding its key to each p8 rune modulo29 gives identical corrected rune values for each repeated word pair, [20,20], [8,8] and [2,2]. All this was in the repository **before this invocation's new discovery**.

I enumerated the **unordered GP29 rune multisets (Parikh classes)** of *all* original 255 scroll words. Exactly 251 multiset classes occur, with **four** collision classes: the three original identical-word pairs and an additional **nonidentical two-rune anagram**. Source word 88 is GP29 EO·X = [12,14], in **black ink**. Source word 179 is X·EO = [14,12], in **red ink**. They share a multiset while differing in printed rune order, ink and original word location.

Their original source-aligned p8 ciphertext indices are [9,13]. The **already locked source GF4/radix59 key** visits addresses [57,147] for those two positions, reading bytes **[116,170]**. No key parameter or target phase changes. Therefore both original corrected GP29 output runes equal

    (9 + 116) mod 29 = (13 + 170) mod 29 = 9.

Equivalently, the fourth original p8 difference 25 equals the predicted source-pad difference (170 − 116) mod29 =25. The complete four-pair original source-difference signature is **[8,18,14,25]**, and the complete four-pair corrected source multiset equality list is **[[20,20],[8,8],[2,2],[9,9]]**. The fourth was **not** in the earlier key-selection script. It is a new, independent original-input constraint pointing toward a potentially **order-insensitive word hash**, rather than word spelling identity alone.

## Full original-source reproducibility and conservative null

The new [Windows Node22 CJS SFT](../sims/lp2_scroll255_gf4_radix59_anagram_fourth_pair_original_sft.cjs) reads the original complete-word transcription, physical red ink, 255 original page8 runes, 256-cell numerical field and canonical GP29 alphabet. It verifies exactly **four original multiset collisions**, all physical word identities and ink, all original source-key arithmetic, and all 64 variants of the *previously existing* key family without fitting anything new.

| Out of four original word-multiset equalities | Number of previous 64 source-key configurations |
| ---: | ---: |
| 0 | 53 |
| 1 | 8 |
| 2 | 2 |
| 3 | 0 |
| **4** | **1** |

The unique 4/4 configuration is precisely the **earlier source GF4/radix59 key**: original tap order, seed at first GF4 position, forward original addresses, positive correction sign. Reading the same panel in conventional radix60 instead predicts differences **[8,18,15,26]**, only 2/4.

With fixed RNG seed 0x3301A14C, a **1,000,000-trial source-page histogram-preserving randomization** samples eight distinct genuine original p8 positions without replacement. For each set it computes four ordered rune differences and asks whether **any of the same 64 prior key signatures** matches all four. Exactly **78/1,000,000 = 0.000078** trials match the four-pair family, while the earlier three-pair family matches **2,542/1,000,000**. Only **3/1,000,000** match the one specific observed four-difference string. Positive synthetic original-word checksums generated with 29 fixed arbitrary secret rune weights pass **all 255/255 source word entries**, including all four equivalence classes.

**Interpretation of probability:** This 0.000078 is a *conditional four-pair, 64-key-family null*, rather than a global multiple-hypothesis-adjusted discovery probability. The fourth pair was newly discovered while inspecting the same source scroll after the key was selected; it was *unused by the previous key fit*, yet its recognition was exploratory, and thousands of unrelated LP2 interpretations have been considered by the community. The result strengthens the conditional link without proving intention.

## Mechanistic consequence and stop condition

An intended source algorithm, if these four equalities are meaningful, plausibly maps each whole scroll word to a **commutative rune-multiset digest**; the original 255→255 alignment would then be independently motivated beyond three exact repeat-word constraints. The previous key plus this fourth relation consumes original data **with no additional parameters**.

The repository's **earlier, stronger** [up-to-twelve-secret-codebooks original checksum exclusion](../sims/lp2_scroll255_gf4_radix59_secret_wordhash_obstruction_sft.cjs) already excludes GP29 rune-position **additive** word hashes even with **360 free secret coefficients** and 12 word-length intercepts (52 original contradictions at the widest phase). An independent [five-family replication and first/last-effect extension](lp2-scroll255-gf4radix59-allsecret-rune-weighted-wordhash-original-gate.md) also finds contradictory full-original systems with 29–88 parameters. That rules out a simple constant per-rune additive checksum as the missing operation. An arbitrarily secret 251-entry dictionary would fit tautologically and has no cryptanalytic value. A genuinely intended mechanism requires an **independently source-selected nonlinear commutative accumulator or external word digest**, yielding additional original positions or authentic plaintext under one frozen decoder.

**Decision:** Preserve the fourth original black/red anagram equality as a distinct, conditionally unlikely source constraint. Elevate the GF4/radix59 word-hash route for *author-selected algorithm discovery*, while refusing to call four correct equalities a book decryption.
