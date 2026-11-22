# Original 2014 Stage11 HTML 464: static and predecessor-difference GP29 alphabets both fail native-English originals

**Agent 10, 22 November 2026. Classification:** historical-source-conditioned, key-independent native-English exclusions of two entire **464-period** secret-GP29 cipher families against all original LP2 ciphertext pages. The source does not select either cipher; neither test finds unknown plaintext or an authentic key.

## Human-accessible starting evidence

The archived HTML accompanying the original May 2014 LP2 release literally contains title **133** and div id **331**. These are period-visible numbers, rather than values selected from ciphertext scores. Their sum is **464**, which is independently the prime index of **3301**. GP has 29 runes and the p15 Fibonacci-prime square has 16 cells: **464 = 16 × 29**. This motivates testing 464 as a repeating state clock; it is not an author-authenticated instruction to use a periodic cipher. The strongest rival is a longer nonperiodic key, a changing key clock, an alternate representation, or a source-selected external secret.

Two independent reversible models are now tested at that **one, frozen, source-derived period**, keeping every original printed word boundary (2,896 words), every original ciphertext rune (12,956), and all 32 genuine cross-page carried words:

1. **Direct alphabet:** every rune is encoded by an arbitrary and independently secret permutation of GP29, chosen by its position modulo464: \(C_i=\sigma_{i\bmod464}(P_i)\).
2. **Cumulative predecessor-difference alphabet:** within a segment, the first rune is an unconstrained transmitted IV; afterward \(C_i=C_{i-1}+\sigma_{i\bmod464}(P_i)\pmod{29}\). This specifically allows the actual original low adjacent-equality rate to arise from the *differences* rather than from the raw ciphertext. The first rune at each original reset is excluded from testing, giving the candidate extra freedom.

Both models grant an independent secret map in **each one** of 464 states; every map can be any of the 29! GP29 permutations, with no fixed password, affine restriction, Caesar assumption or known key. Each model is evaluated under three clocks: one continuous manuscript, resets at the nine original illustrated chapters, or resets at all 55 rune-bearing physical pages. No word/page contents are rearranged, padded or deleted.

## Exact, all-key repeated-symbol invariant

For either register, consider only equal-position-key phases. A secret **bijective** rune map preserves equality of any two rune values encrypted under the same phase. Thus the count of equal rune pairs among positions of the same clock phase is invariant under *all* permutations for every secret key, even when the 464 maps are independent. For the direct model count equal raw \(C_i\); for the predecessor model count equal \((C_i-C_{i-1})\bmod29\) while omitting initial segment runes. The statistic is

\[
S=\sum_{\text{phase }j=0}^{463}\sum_{x=0}^{28}\binom{n_{j,x}}{2}.
\]

A long native GP29 English text has far more same-phase identical letters than a uniformly shuffled 29-symbol source, regardless of the unknown secret alphabet. The source controls below are **independent English word occurrences of each EXACT original GP29 word length**, from Gibran, Shakespeare and authentic solved Cicada plaintext; 64 seeded original-word-shape plants are drawn for each source and clock. They preserve the original preponderance of one- and three-rune printed words, and use the same first-rune omissions for the cumulative case.

### Model A: all-secret direct 464-rune periodic alphabet

| Original clock | LP2 equal pairs | Possible same-phase pairs | Gibran min/64 | Shakespeare min/64 | Solved Cicada min/64 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Continuous full manuscript | **5,998** | 174,420 | 10,132 | 10,176 | 10,316 |
| Nine chapter resets | **6,069** | 176,619 | 10,251 | 10,214 | 10,409 |
| 55 physical-page resets | **10,751** | 311,132 | 18,075 | 18,086 | 18,402 |

Every one of **576** source-native combinations exceeds the actual ciphertext's necessary-phase statistic. An independent full-secret permutation positive, covering all 464 maps on a complete 2,896-word source plant, preserves the statistic and recovers **12,956/12,956** original-shaped GP runes exactly. [Reproducer](../sims/lp2_html133331_period464_allsecret_wordshape_sft.cjs), [Windows Node22 PASS 45019487888](https://github.com/FlareZ123/liber-primus/actions/runs/45019487888).

### Model B: all-secret cumulative predecessor-difference periodic alphabet

The predecessor-difference model explicitly allows **the first rune at every reset to be arbitrary and transmitted unchanged**. Only the remaining 12,955 / 12,947 / 12,901 runes contribute same-phase comparisons under manuscript/chapter/page clocks respectively. This is a potentially much more relevant way to use a repeated key while reproducing source runes' unusually rare adjacent equalities.

| Original clock | Original equal first differences | Possible same-phase pairs after IV removal | Gibran min/64 | Shakespeare min/64 | Solved Cicada min/64 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Continuous full manuscript | **6,050** | 174,393 | 10,132 | 10,176 | 10,316 |
| Nine chapter resets | **6,121** | 176,367 | 10,237 | 10,193 | 10,396 |
| 55 physical-page resets | **11,006** | 309,647 | 17,978 | 17,996 | 18,322 |

Again **all 576 native-source comparisons exceed original LP2**, even though all 464 secret phase alphabets, book/chapter/page resets and every free initial rune are allowed. An independently generated planted **predecessor-fed, fully nonlinear full-permutation cipher**, with 464 unrelated secret GP29 maps, is exactly inverted under all three source-reset clocks; it recovers the full **12,956/12,956** genuine GP source runes in each plant. This positive shows the exclusion is a consequence of the original first-difference stream, rather than a broken cipher simulator.

[Reproducer](../sims/lp2_html133331_period464_predecessor_diff_allsecret_sft.cjs), [successful Windows Node22 full-source execution 45020669954](https://github.com/FlareZ123/liber-primus/actions/runs/45020669954).

## Decision and competing explanations

**Neither of these two period464 models can produce ordinary source-native GP29 prose from the printed LP2 text under any choice of their secret fixed-phase alphabet permutations.** The exact equality invariant avoids searching for keys among \((29!)^{464}\) possible schemes, and the predecessor-difference test applies to the lower-adjacency architecture that the earlier direct-alphabet test could not cover.

These are **language-conditional** observations calibrated against real word-length-matched English and solved-Cicada rune words. The source controls resample individual words, so they are not continuous natural paragraphs or a proof against every possible English text. The two finite exclusions do not cover an output alphabet which depends on a changing hidden state, word-specific or input-dependent key skipping, extra masking/transposition, variable-length tokens, noninvertible symbol maps, a different plaintext language/register, F interruption, or a genuinely aperiodic key. The historical **133+331** relation authenticates an operand candidate, **not** an unknown cipher key, decoder, plaintext or historical intent.

**Next research action:** pursue a first-party **state transition, key source or external recipient** that demonstrably changes the cipher map within the phase rather than adding more guessed fixed 464-phase permutations. Neither report belongs in authoritative solved-plaintext synthesis.
