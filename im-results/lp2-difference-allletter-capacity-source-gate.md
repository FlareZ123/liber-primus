# Stationary first-difference GP29: all-secret capacity and 29 zero-marker test

**Status:** original-source, reversible-family negative. It excludes a defined simple decoder and does not recover any unknown Liber Primus plaintext or historical key.

## Human-readable decoder premise

Across the 12,956 original unsolved LP2 runes, equal adjacent cipher runes occur only 86 times. A natural stateful construction is \`C[i]=C[i-1]+σ(P[i]) (mod 29)\`, with a single unknown bijection \`σ\` of all 29 GP plaintext runes onto the 29 differences; the first source rune independently initializes the state. One plaintext glyph maps to difference zero. This includes **every possible stationary secret 29-rune output alphabet**, without guessing an alphabet or a key. The source clue selecting this mechanism remains hypothetical.

A more general running-key architecture could vary nonzero differences across positions while reserving the same plaintext marker at difference zero. The original plaintext's visible word segmentation would then predict whether the 86 zero-difference sites occur at word beginnings, endings, or interiors. **That all-29 marker exclusion was already carried out with stronger native source controls and 116 source-native plants** in [the pre-existing reserved-repeat study](lp2-reserved-ea-repeat-transport-original-gate.md). The small role-count table below is only an independent replication used to exercise this script; it is **not claimed as a new result**.

## Original-source all-secret bound

Compute all 12,955 predecessor differences \`(C[i]-C[i-1]) mod 29\` over the complete original stream, including physical page and word boundaries. **The largest difference class has 510 occurrences**, and exactly 86 increments equal zero.

A fixed secret bijection cannot change the frequency of its most common plaintext rune: **any one output symbol occurs at most 510 times**. This is exact, independent of which of the 29! key alphabets is chosen.

Encode the native-English reference corpora in the exact GP29 transliteration (including TH/EO/OE/NG/AE/IA/EA and the canonical V/K/Z/QU spellings). Evaluate the GP E count over **every contiguous window of 12,955 runes**:

| Independent GP text | Total native runes | Minimum E in any 12,955-rune window |
|---|---:|---:|
| Gibran, *The Prophet* | 63,114 | **1,407** |
| Emerson, *Essays* | 324,630 | **1,482** |
| Shakespeare sample | 218,800 | **1,397** |
| **Original cipher differences under any fixed alphabet** | **12,955** | **at most 510** |

The exact best-case fixed decoder thus falls at least **887 E glyphs short** of the least E-rich native source window. This directly excludes full-length ordinary GP-English output from a stationary invertible difference lookup. It does not exclude later substitution, compression, binary/plaintext codecs, changing alphabets, or altered symbol count.

## Previously established fixed-marker position exclusion: independent replication

Parse the original 2,896 source words with the canonical cross-page word join. Among the 86 adjacent-equal ciphertext events, **23** occur at word beginnings, **19** at final word positions distinct from beginnings, and **44** at interiors. For every GP marker candidate, use each independent reference's words of the *same rune length* as each original ciphertext word to estimate expected first/final/interior counts. Evaluate the three disjoint counts using the Poisson deviance \`2 Σ[o log(o/e) - (o-e)]\`.

| Reference | Best of 29 candidate zero-markers | Expected beginning / final / interior | Observed | Deviance |
|---|---|---|---|---:|
| Gibran | G | 71.38 / 19.21 / 100.40 | 23 / 19 / 44 | 84.86 |
| Emerson | G | 60.64 / 4.98 / 91.15 | 23 / 19 / 44 | 83.72 |
| Shakespeare | P | 94.60 / 16.21 / 96.13 | 23 / 19 / 44 | 114.08 |
| Solved Cicada sample | B | 108.67 / 10.43 / 39.09 | 23 / 19 / 44 | 106.14 |

The independently repeated all-29 marker search yields mismatched role profiles under all four controls, consistent with the more comprehensive previous study. As a check on the previous EA-only claim, EA itself predicts 10.86 / 2.45 / 106.99 from Gibran (deviance 102.77). These are uncalibrated, source-dependent likelihood-discrepancy diagnostics rather than discovery-wide p-values. Rare long-word classes and the short solved reference limit precision; the main fixed-alphabet frequency obstruction above is exact and does not rely on this statistic.

## Reproducer and reversible positive

[Standalone CJS source test](../sims/lp2_difference_allletter_capacity_sft.cjs) reads the original corpus, cross-page word parser and four existing GP language references. The complete script was executed against **those exact eight remote repository sources** with a runtime adapter providing Node's filesystem, path and assertion interfaces; all source count and model assertions passed.

The SFT also builds a 12,956-GP-rune positive control from real Gibran GP words **in precisely the original 2,896 word-length slots**. It encrypts with the declared invertible chain assigning EA to zero difference, and exactly recovers all **12,956** planted GP symbols. Its ciphertext zero-difference role counts **[9,5,111]** exactly match planted plaintext EA positions. The positive establishes correct detection under a known genuine instance; it does not suggest the original manuscript was encrypted this way.

## Research decision

**The new contribution here is the exact 510-versus-1,397 stationary-difference alphabet capacity obstruction.** The fixed-marker work independently corroborates an already retired family. A changing key or a changed plaintext register needs independent visible instructions before another unconstrained search. No new plaintext, key, intended operation, or destination follows from this bounded exclusion.
