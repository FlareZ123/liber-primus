# The original fourth scroll-word anagram equality under a fitted GF4/radix59 correction

**Agent 4, 22 November 2026; Critic source-selection reconciliation, 22 November 2026. Classification:** Reproducible original-source structural constraint on an earlier *fitted* correction, using a fourth source-word pair outside the three original key-fitting equalities. **No plaintext, authenticated key or confirmed author-selected cipher.** The fourth comparison is new to that key fit, but its recognition during subsequent exploration is not an independently preregistered prediction.

## A source-constrained, previously untested fourth comparison

Prior [Agent14's source GF4/radix59 SFT](../sims/lp2_scroll255_gf4_radix59_source_collision_sft.cjs) identified three literally repeated GP29 scroll-word pairs, [47,240], [48,231], [235,236], across the original p3–p7's 255 complete printed words. The following original p8 has exactly 255 runes, whose differences at these pairs are [8,18,14] (HEX). The five original p7 red GP29 ordinal products [11,26,8,15,2] can produce a 255-state GF4 cycle **under the hypothesized convention** that the first four are recurrence taps and the fifth is an initial seed. The equally source-first five-coefficient GF4 polynomial is reducible, so the taps/seed split is essential and unauthenticated. The p49–p51 numeral field supplies 256 printed cells, but turning them into radix59 key values requires deleting lowercase `f` from the ordinary digit alphabet; the conventional radix60 interpretation is also available. Neither that deletion nor the whole-word→rune consumer was selected by any located first-party instruction. [The independent source-selection decision for #2299](lp2-p7-p8-dual-field-original-source-selector.md) explicitly rejects the phrase *fully source-determined* for this composite key. Only one of 64 nearby source-key variants matched all three earlier pairs. Adding its key to each p8 rune modulo29 gives identical corrected rune values for each repeated word pair, [20,20], [8,8] and [2,2]. All this was in the repository **before this invocation's new discovery**.

I enumerated the **unordered GP29 rune multisets (Parikh classes)** of *all* original 255 scroll words. Exactly 251 multiset classes occur, with **four** collision classes: the three original identical-word pairs and an additional **nonidentical two-rune anagram**. Source word 88 is GP29 EO·X = [12,14], in **black ink**. Source word 179 is X·EO = [14,12], in **red ink**. They share a multiset while differing in printed rune order, ink and original word location.

Their original source-aligned p8 ciphertext indices are [9,13]. The **previously frozen, empirically selected GF4/radix59 configuration** visits addresses [57,147] for those two positions, reading conditional radix59 values **[116,170]**. No key parameter or target phase changes. Therefore both original corrected GP29 output runes equal

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

The unique 4/4 configuration is precisely the **earlier fitted GF4/radix59 setting**: source-order taps under the chosen four-tap split, seed at first GF4 position, forward original addresses, positive correction sign. This uniqueness is within the 64-model family and does not select the family itself. Reading the same panel in conventional radix60 instead predicts differences **[8,18,15,26]**, only 2/4.

With fixed RNG seed 0x3301A14C, a **1,000,000-trial source-page histogram-preserving randomization** samples eight distinct genuine original p8 positions without replacement. For each set it computes four ordered rune differences and asks whether **any of the same 64 prior key signatures** matches all four. Exactly **78/1,000,000 = 0.000078** trials match the four-pair family, while the earlier three-pair family matches **2,542/1,000,000**. Only **3/1,000,000** match the one specific observed four-difference string. Positive synthetic original-word checksums generated with 29 fixed arbitrary secret rune weights pass **all 255/255 source word entries**, including all four equivalence classes.

A second physically matched control, using the same fixed random seed and one million trials, draws all eight unrelated runes exclusively from the **243 original black p8 rune positions**, since every p8 site used in the four pair constraints is black. This stricter ink-conditioned null produces **85/1,000,000 = 0.000085** any-of-64 four-equality matches. It avoids mixing the distinct p8 red title ink into the symbol baseline. The two original-histogram calibrations therefore agree closely.

**Interpretation of probability:** This 0.000078 is a *conditional four-pair, 64-key-family null*, rather than a global multiple-hypothesis-adjusted discovery probability. The fourth pair was newly discovered while inspecting the same source scroll after the key was selected; it was *unused by the previous key fit*, yet its recognition was exploratory, and thousands of unrelated LP2 interpretations have been considered by the community. The result strengthens the conditional link without proving intention.

## Untouched adjacent-chapter direct-pad transfer (Agent4, 22 November, negative)

The four p3–p8 original word-multiset equalities were used to select the earlier conditional GF(4)/radix59 moving pad. A later separate test kept **that exact existing 255-address orbit, same positive correction sign, numeral normalization and starting phase** and applied it directly to two contiguous untouched seven-page chapters. This is a proposed *direct additive* use of the existing pad, not an authenticated creator instruction.

| Complete original chapter | GP29 runes | Fixed continuous 255-clock decoded IoC | Reset pad at each original page decoded IoC |
| --- | ---: | ---: | ---: |
| p8–p14 | 1,729 | **0.0346760330** | **0.0343808239** |
| p15–p21 | 1,772 | **0.0346783455** | **0.0345821124** |

These full-chapter outputs remain ciphertext-like; the original p8 255-rune additive correction itself has IoC **0.0372703412**. The p8→p21 direct pad therefore fails to produce a *native GP29 English* chapter in either visible clock convention. It does not invalidate the four original fitted Parikh equalities, nor does it exclude nonlinear state-dependent recipients. A separate hypothetical polynomial two-register mechanism derived from the same p7 coefficients also fails; see the [p7/p8 source polynomial study](lp2-p7-p8-original-red-polynomial-fixedpoint.md#one-source-inspired-two-register-consumer-agent4-22-november-negative).

The [combined read-only original-corpus Node22 SFT](../sims/lp2_p7_original_two_state_downstream_sft.cjs) asserts exact p7 products, p8 red heading, four p8 corrected equivalences, all **3,501** unmodified chapter rune inputs, both continuous/reset original outputs and all computed IoCs. A solved-p57-source GP29 plant of 1,717 runes including an imposed adjacent repeat is recovered exactly by both frozen inverse operations. The complete SFT executed against the remote canonical repository source bytes and passed; no separate Actions run is claimed. **No plaintext or new author-selected key.**

## Mechanistic consequence and stop condition

An intended source algorithm, if these four equalities are meaningful, plausibly maps each whole scroll word to a **commutative rune-multiset digest**; the original 255→255 alignment would then be independently motivated beyond three exact repeat-word constraints. The already fitted setting predicts this fourth relation **without refitting parameters**, an informative original-data consistency check that leaves the first-party key-selection gap intact.

The repository's **earlier, stronger** [up-to-twelve-secret-codebooks original checksum exclusion](../sims/lp2_scroll255_gf4_radix59_secret_wordhash_obstruction_sft.cjs) already excludes GP29 rune-position **additive** word hashes even with **360 free secret coefficients** and 12 word-length intercepts (52 original contradictions at the widest phase). An independent [five-family replication and first/last-effect extension](lp2-scroll255-gf4radix59-allsecret-rune-weighted-wordhash-original-gate.md) also finds contradictory full-original systems with 29–88 parameters. That rules out a simple constant per-rune additive checksum as the missing operation. An arbitrarily secret 251-entry dictionary would fit tautologically and has no cryptanalytic value. A genuinely intended mechanism requires an **independently source-selected nonlinear commutative accumulator or external word digest**, yielding additional original positions or authentic plaintext under one frozen decoder.

**Decision:** Preserve the fourth original black/red anagram equality as a distinct, conditionally unlikely source constraint. The subsequent [all-secret abelian-group word-hash obstruction](lp2-scroll255-commutative-29state-exact-obstruction.md) and [#2299 historical-source decision](lp2-p7-p8-dual-field-original-source-selector.md) make further GF4/radix59-dependent key hunting inappropriate without a new, independently visible tap/seed and radix instruction or an untouched original plaintext-producing receiver. Four correct equalities do not establish the book's encryption algorithm.
