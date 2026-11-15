# Original LP2 p40–53: exhaustive signed-p15-matrix states, including every legal F bypass

**Agent17 and Agent18, 15 November 2026.** Exact original-cipher computation, source-derived reversible operator, *no newly authenticated LP2 plaintext or key*. The original direct four-rune matrix model first failed an all-secret native-GP English search. A stronger independent **all-state, all-four-phases, exact plaintext-F branch test** now rejects every nonzero source-matrix secret state on unchanged original ciphertext **without any language model**. The sole feasible secret is the zero state, equivalent to identity/no encryption. This is a specific and fully exhausted matrix **state** hypothesis, contingent on its unauthenticated source-selection and a continuous clock.

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

The actual solved p56 cipher treats certain plaintext F runes as transparent and does not advance its known prime schedule. A finite additional check forces **all 124 ciphertext F positions** in the 3,000 original runes to be transparent plaintext F, removing them from the matrix-power key clock. Search all 7,612 same source-native four-rune prefix states again. This deterministic, fully specified all-F-skipped variant still yields at most **four dictionary words of length ≥4**, with maximal IoC **0.03732866511059242**, and no coherent run of prose. That initial fixed-mask experiment was weaker than the now-completed exact all-secret branching experiment below. Its lexical scores remain prior independent context.

## Exact all-secret inversion with every legal F skip and four unknown component phases (Agent18)

This is a **new source-cipher obstruction** replacing the earlier gap for *ambiguous ciphertext F*. It tests the same signed p15 matrix and the exact same **3,000 original black-body runes** across physical pp40–53. The source's preceding red p40 heading has eight GP runes and is excluded from the frozen input, as in the prior study. All **124 ciphertext Fs** remain in place. The p49–51 numerical field has no rune symbols; its bytes do not consume the runic key clock, consistent with p56's authenticated typed-field separation. The nine printed chapter boundaries are not invented as reset events.

Define secret v∈GF(29)^4 and an unknown intra-block component phase h∈{0,1,2,3}. For consumed key count k≥0, the emitted additive pad is

    K(k;v,h) = row_((k+h) mod4)(M^floor((k+h)/4)) · v (mod29).

A complete four-component phase change can be absorbed into v because the signed M is invertible, so these **four h choices are exhaustive** for arbitrary initial phase. Subtracting or adding a pad sign is also exhaustive under v→−v, because the state update is linear. This covers **4×29^4=2,829,124** state/phase options without guessing a key. For *each* ciphertext rune C, the inverse retains **every attainable consumed-clock count**:

1. If C≠F/index0, a consuming inverse P=(C−K) mod29 is allowed exactly when P≠F; k advances.
2. If C=F/index0, authentic plaintext-F passthrough permits P=F and k unchanged. An additional consuming interpretation P=(−K) mod29 is allowed when K≠0, and k then advances.

Dynamic-programming state sets are deduplicated only at identical clock counts. **No F mask, language model, lexical score, beam, initial four-rune crib or score threshold** influences which paths survive. One seed producing one feasible complete prefix suffices to keep it. The method is exact for the defined additive generator and original source stream.

| Unknown within-block phase h | All-key candidates surviving 50 runes | 200 runes | 500 runes | 1,000 runes | 1,500 runes | 3,000 runes | Longest *nonzero* seed prefix |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 274,216 | 8,768 | 419 | 11 | **1** | **1** | 1,269 |
| 1 | 273,838 | 8,711 | 399 | 6 | **1** | **1** | 1,221 |
| 2 | 274,102 | 8,721 | 411 | 7 | **1** | **1** | 1,440 |
| 3 | 274,172 | 8,703 | 414 | 7 | **1** | **1** | 1,269 |

The single survivor at 1,500 symbols in **every** phase is **v=[0,0,0,0]**, giving K(k)=0 forever. This decodes P=C with F passthrough, and therefore satisfies the mechanics vacuously while explaining none of the manuscript's ciphertext structure. The best nonzero seed at phase2 has packed integer102029 and dies at zero-based original black-body rune1440. The other best packed seeds are 665553, 507277, and 695576 for phases0,1,3 respectively. **All 2,829,120 nonzero secret-vector/phase combinations fail before rune1500**. Every feasible F branch history was included, even histories that would not form natural English text.

**Independent exact-function controls:** 95 genuine solved p57 GP runes are tiled to an exact 3,000-rune source-native plaintext. The forward rule uses a nonzero seed v=[3,5,7,11], transparently passes 94 plaintext Fs and consumes 2,906 other runes. Across h=0..3, it creates **99,105,117,99 ciphertext Fs from encrypted non-F plaintext** in addition to those 94 transparent symbols, demonstrating the inverse must retain both F interpretations. All four positive ciphers are feasible for the entire 3,000 symbols under the correct unmodified secret. A separately implemented exhaustive *recursive* F-branch oracle agrees with the DP on original and planted short prefixes at six frozen seeds in each phase.

**Reproduction:** [single-file Node22 CommonJS source-exact test](../sims/lp2_p15_matrix_ambiguousF_allstate_original_sft.cjs), successfully executed with original tracked JSON and positive controls on **Windows/Node22** in [run 43731862339](https://github.com/FlareZ123/liber-primus/actions/runs/43731862339). Its assertions fix every phase's threshold counts, maximal nonzero prefix and positive recovery. These direct ciphertext-only feasibility counts supersede the prior report's language-dependent all-F-skipped result as the decision on this exact matrix generator.

**Result and boundaries:** The continuously consuming four-output-per-matrix-power additive architecture is now exactly rejected for **all hidden seeds, signs, within-block phases and authentic F masks**, apart from the no-encryption identity. Nothing in the source commands using the restored-sign matrix as this cipher, and the signed form itself is a mathematical inference from the original Fibonacci-prime construction. Changing the state update to every *single* rune, independently resetting at each page/word, using a nonlinear matrix consumer, selecting an alternate plaintext code or adding external key material are different untested models. This result supplies no unknown LP2 plaintext, historical key or destination.

## Distinct keyless, block-mixing dynamic Hill gate

The same source matrix gives a different fully reversible model that mixes all four GP29 symbols in each block. Instead of using its vector as a key, decrypt the original ciphertext block by applying **M^(phase + direction × block)** over GF29. Because M has exact order **812**, all original phase choices and both independently meaningful exponent directions comprise **2 × 812 = 1,624** complete reversible clocks. There is no additional secret matrix, additive key or language-fitted phase. The inverse of one direction is available because M is invertible.

On the unchanged **3,000 original ciphertext runes and 667 printed words**, the strongest of all 1,624 clocks gives **four dictionary words of length ≥4 GP runes**, no two consecutive, and the **maximum IoC across all clocks is 0.03483627875958653**. The best dictionary clock is phase **455**, exponent direction **−1**, with four long word matches and decoded IoC **0.03468311659442036**. All outputs remain near-uniform and fail to reveal coherent original plaintext.

For an independent positive control, take the same genuinely native 3,000-rune word-length-matched English plant as above, encrypt each four-rune block with **M^(103 + block)**, then decrypt using **M^(709 − block)**. The exact **3,000/3,000** native symbols round-trip, and all **384** original long dictionary words are recovered. The extended single-file SFT reproduces this 1,624-clock gate after the full secret-state experiment.

The **all-phase dynamic Hill decoder** is consequently a second, distinct scoped negative from the secret additive-state decoder. Neither gives the missing author-selected operation. An arbitrary different GF29 matrix or source-independent block shuffle is outside this test and would require its own historical selector.

## Decision and exact reproduction

The original 4-vector matrix-power additive pad is exhausted on this full continuous black-body clock, **including the complete authentic F-skip ambiguity and all four component phases**. It yields no author-selected decoder, plaintext or hidden address. Do not restart matrix-vector seed searches, F-mask fitting, or dictionary phase tuning within this model. A new line would require a manuscript-authenticated different consumer, e.g. a block-mixing or nonlinear output function, a source-selected state reset, or an independent key source.

Earlier dictionary and dynamic-Hill experiments remain independently reproducible in [their original CJS](../sims/lp2_p15_signed_matrix_allstate_dictionary_sft.cjs); those are separate, weaker operator-level results. The newly completed exact F-branch source gate is [here](../sims/lp2_p15_matrix_ambiguousF_allstate_original_sft.cjs), with a [verified Windows/Node22 run](https://github.com/FlareZ123/liber-primus/actions/runs/43731862339). Both scripts read tracked original source and write no files.
