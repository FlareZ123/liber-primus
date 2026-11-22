# Fixed-zero multiplicative GP29 difference cipher: a key-independent original-cipher exclusion

**Status:** bounded original-input negative, source-native literary-register conditional, 22 November 2026. The attack identifies no unknown plaintext, authentic creator key, or intended operation.

## Why this is a distinct reversible family

For every physical rune-bearing page `p`, and for every position `i > 0` within that page, define the cipher

```
C[p,i] = C[p,i-1] + k[p,i] * (P[p,i] - b) mod 29,
```

where `b` is one unknown but **globally fixed** GP rune index and every `k[p,i]` is an independently arbitrary member of GF(29)^×. The first rune on each page has its own unconstrained seed. Given `k,b` and a page seed, this is completely reversible via `P[p,i] = b + (C[p,i]−C[p,i−1])/k[p,i] (mod29)`.

The independent nonzero key factors may change every symbol, page, word, chapter, or nonperiodically; there are no restrictions on their entropy or source. **Yet the exact equivalence**

`C[p,i] == C[p,i−1]  ⇔  P[p,i] == b`

holds for every such secret. A search for particular keys is therefore unnecessary. The family is related to differential encryption with a stationary zero residue, and genuinely differs from the earlier static predecessor-permutation and affine plaintext-feedback tests. The zero-marker equivalence gives a key-independent original-input decision before tuning a decipherment.

## Original evidence and an independent lexical anchor

The canonical 55-rune-bearing LP2 unknown pages contain **12,956** GP29 glyphs and **12,901** same-physical-page adjacent comparisons. Exactly **86** such pairs are equal. Even granting the 55 page starts as arbitrary source symbols, the full 12,956-rune unknown plaintext can therefore contain **at most 141** copies of the unique fixed marker `b`.

The original p27 12-rune source word `EORNSOOCAEYEE` (GP transliteration with multigraph tokens) has **exactly two** equal-adjacent events, at second-symbol offsets **5 and 11**. In this model its plaintext must have `b` at positions5 and11, and nowhere else. This necessary condition is tied to the printed source word and is independent of all 12,901 hidden multipliers.

A source-native GP lexicon was constructed from the repository's pinned TextBlob frequency list, Shakespeare, Gibran, Emerson, Blake and solved LP1 references, with the authenticated solved p57 word CIRCUMFERENCES. It uses the source-calibrated GP mapping (`ING→NG`, `IO→IA`, original `K/V/QU` orthography). Among **32,230** encoded word types, **872** have GP length12. Exactly eight GP plaintext markers admit any length12 word whose marker appears at positions5 and11 and nowhere else: **C, N, S, T, E, L, D, A**. The SFT preserves the full list of compatible words for each marker.

## Whole-book control, including every contiguous window

All contiguous **12,956-GP-rune** windows in three pinned, source-native encoded English corpora were examined. The minimum number of occurrences of each of the eight eligible plaintext markers across **any** window is:

| GP marker | Shakespeare | Gibran | Emerson |
|---|---:|---:|---:|
| C | 391 | 289 | 408 |
| N | 642 | 767 | 795 |
| S | 730 | 653 | 660 |
| T | 643 | 685 | 794 |
| E | 1408 | 1416 | 1491 |
| L | 473 | 415 | 422 |
| D | 407 | 463 | 416 |
| A | 748 | 789 | 809 |

The **lowest** observed reference count in any eligible corpus-window/marker combination is **289**, over twice the maximal **141** permissible under this original ciphertext. This is a joint necessary-condition contradiction: the original p27 word forces `b` into a set of common letters, and the original book-wide repeat-event count forces that same `b` to be exceptionally rare. The proof permits arbitrary changing secret multipliers and all physical page-start symbols.

A genuinely reversible **12,956-rune positive plant**, encoding native Gibran GP29 prose under changing nonzero multipliers and independent page seeds, passes full 12,956/12,956 inverse recovery and forward reencryption, and exhibits **880** repeated-cipher transitions as algebraically predicted. The original-cipher test and positive control both passed Windows Node 22: [Action run 44981261437](https://github.com/FlareZ123/liber-primus/actions/runs/44981261437).

## Exact scope and decision

**Excluded, conditionally on a conventional source-native literary plaintext:** every GP29 page-continuous single-fixed-zero-marker multiplicative-difference encoder of the displayed form, even with wholly unconstrained secret nonzero per-rune keys and all 55 page starts free. The source-attested p27 word constraint holds conditional on the pinned 32,230-word lexicon; the corpus-wide count calibration holds for all contiguous windows of the three named literary samples, not for every possible English composition.

**Unexcluded:** novel or archaic words outside the finite lexicon, a differently structured language, position-dependent or section-dependent zero markers, symbol remapping before/after the difference layer, external changes in length, a secret transposition, and general feedback mechanisms. A different plaintext word distribution could have a fixed marker count ≤141. The historical Cicada instructions do not specify this `k*(P-b)` rule, so the result is an architecture exclusion rather than evidence that this is the author's cipher.

**Decision:** cease searching secret keys for this fixed-zero differential family under the tested original-literary register. Focus on models where the zero state changes for a source-readable reason or where the ciphertext does not leak one fixed plaintext symbol at every adjacent equality. Seek an original-source-selected operation before adding parameters.

**Reproducer:** [`sims/lp2_multiplicative_delta_fixedzero_english_gate_sft.cjs`](../sims/lp2_multiplicative_delta_fixedzero_english_gate_sft.cjs). Uses only pinned repository source data and positive controls; does not write generated files.
