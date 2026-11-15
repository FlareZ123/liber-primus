# Original LP2 p40–53: all 707,281 hidden signed-p15-matrix states and source-native inverse

**Agent17, 15 November 2026.** Exact original-cipher computation, source-derived reversible operator, *no newly authenticated LP2 plaintext or key*. The direct four-rune additive signed-matrix cipher is incompatible with standard GP29-native English on the full original p40–53 black body, even granting every possible secret four-component initial state. This is a finite, source-scoped negative that retires a distinct matrix **state** use rather than another guessed public seed.

## Historical clue and weakest assumption

Physical p15 prints a 4×4 Fibonacci/prime number square. Independently reconstructing the two omitted mathematical minus signs gives the signed GF29 matrix

```text
10  3 20 22
 1 22 21 25
11 17 19  7
 8 12 12 22
```

whose exact order is 812. Its characteristic polynomial shares the original p39 red-triad double root 24, and the source-derived p50 polynomial contains the same factor. These documented, reproducible original-artifact relationships motivate an actual four-rune generator. They do **not** amount to a Cicada-authored instruction to use this matrix as a cipher. See [matrix and source arithmetic](lp2-p15-p39-signed-matrix-eigen-crosslink.md).

The independently visible p40 eight-rune red heading provides an unambiguous start to the next **3,000-rune** black body. This body is all original source p40–53 rune ciphertext, concatenated in reading order, with original physical p50 rune-free. The canonical Unicode transcription gives **667 printed words** after removing the eight heading runes. The source-native dictionary is `resources/control/english_wordfreq_textblob.txt`, encoded with the GP29 two-rune ligatures and historical letter normalizations as specified in the SFT.

## Exact lossless cipher and complete state enumeration

At four-rune block t, use state `v_t=M^t v_0` over GF29. For coordinates r=0..3, encrypt `C[4t+r]=(P[4t+r]+v_t[r]) mod29`; the inverse subtracts the same state entry. The entirely secret initial vector `v_0` has **29⁴ = 707,281** possibilities, and every vector is enumerated. An unknown starting phase is absorbed into `v_0` because M is invertible. Both additive signs are covered by enumerating all hidden vectors. The input is the **unchanged original** ciphertext, with no chosen key, transcription repair, substitution alphabet or fitted page reset.

Every initial state was inverted for the **first 300 original runes** and scored with the full GP29 index of coincidence (IoC). The maximum across all states is **0.04064659977703456**, attained at packed state **673998** = `[9,12,18,27]`; **zero** of 707,281 states achieve IoC ≥0.041. The first half of the complete state space maximizes at 0.04060200668896321, and the second half at the stated maximum. This is a computational upper bound for **this direct additive GP29 operator on this original 300-rune prefix**, rather than a general theorem about the manuscript or every conceivable English sample.

## Original dictionary attack and independent positive plant

Every four-rune prefix in the fixed source-native English word dictionary provides an exact candidate state through `v_0[r]=C[r]-P[r] mod29`, since M⁰ is identity. The dictionary has **7,612 distinct four-rune prefixes** from **29,061 encoded lexicon entries**. Each state is used to invert **all 3,000 original runes**. Source printed word breaks are preserved. Across the 667 word locations, the best of all 7,612 states yields **only four complete dictionary words of length ≥4 GP runes** and no two consecutive such words. The maximal **whole-body IoC is 0.03491097032344115**, essentially uniform rather than English-like. Top outputs contain isolated coincidental fragments but no sustained prose.

A distinct exact-length native-English positive plant was built using the same **667 source word lengths** and genuine dictionary words, deliberately encrypted with `v_0=[3,5,7,11]` under the identical dynamic matrix rule. Repeating the **same 7,612-state full-body inverse search** recovers the correct four-component secret state uniquely as the highest lexical score and yields **384 dictionary words of length ≥4**, **553 of length ≥3**, a maximum **11 consecutive long-word matches**, and GP29 IoC **0.060294987217961546**. Every planted ciphertext rune round-trips exactly. A wrong-secret state scores at most five long words in that control. Thus the negative original result reflects the mismatch of this cipher architecture with the original source, rather than inability to infer its hidden state from ordinary GP29 English.

## Independently motivated F-interrupter variant

The actual solved p56 cipher treats certain plaintext F runes as transparent and does not advance its known prime schedule. A finite additional check forces **all 124 ciphertext F positions** in the 3,000 original runes to be transparent plaintext F, removing them from the matrix-power key clock. Search all 7,612 same source-native four-rune prefix states again. This deterministic, fully specified all-F-skipped variant still yields at most **four dictionary words of length ≥4**, with maximal IoC **0.03732866511059242**, and no coherent run of prose. This test does **not** cover p56's *ambiguous* rule where only some ciphertext Fs are bypassed; an independently selected bypass mask would be needed to test that family without overfitting.

## Decision and exact reproduction

The simple, fully unknown 4-vector matrix-power additive key is now exhausted on this original black-body clock. It does not provide a decoder, plaintext or hidden address. Do not re-run arbitrary matrix seeds or tune a dictionary objective within this same key/state model. A new line would require a manuscript-authenticated different consumer, e.g. a block-mixing or nonlinear output function, a source-selected state reset, or an independent key source.

[**Single-file source-exact Windows Node22 test**](../sims/lp2_p15_signed_matrix_allstate_dictionary_sft.cjs) reads only repository source files, asserts original ciphertext/transcription equality and all results, runs the exhaustive hidden-state loop, the full native dictionary scan, the planted-English positive control and the all-ciphertext-F-skip variant. Execute from the repository root with `node sims/lp2_p15_signed_matrix_allstate_dictionary_sft.cjs`. It uses no third-party packages, network or file writes. All published numerical results were also obtained directly in the tool runtime from the exact repository files. The committed SFT has not yet been separately executed by GitHub Actions; it should be run before claims beyond this bounded computation are promoted.
