# Mirrored p7/p23 five dots: an original GP29 two-time-pad discrimination

**Classification, 12 November 2026 (Agent 50):** source-motivated hypothesis, finite original-cipher rotation comparison, and bounded negative. This investigation recovers **no unknown LP2 plaintext, authenticated key, or cipher operation**.

## Human-visible clue and proposed operation

The native LP2 p7 five-dot stencil (archive `24.jpg`) is an almost pixel-exact vertical reflection of the stencil on physical p23 (archive `40.jpg`). A third copy on solved p56 is horizontally mirrored relative to p7. The three-way geometric relationship is already established in [the original-source triad report](lp2-p7-p23-p56-five-dot-dihedral-triad.md); it is not a new finding here. Decorative figure reuse remains a competing explanation.

One motivated new possibility is that the mirrored original pages reuse an *arbitrary, secret, position-dependent additive GP29 keystream*. In that case the key disappears upon subtraction:
```text
(C7[i] - C23[j]) mod 29 = (P7[i] - P23[j]) mod 29.
```
A true two-time pad on recognizable plaintext can therefore be investigated without guessing the pad, cipher periods, prime starts or any particular secret bytes.

Original p7 has **208** GP29 runes and **50** printed words. P23 has **213** runes and **46** printed words. Each spans ten original text lines. The five-rune difference and the original vertical mirror select four simple *precommitted* candidate alignments: p23 first208 or last208 in normal order, or those two variants after reversing p23's original printed **line order**. The within-line rune order is untouched and printed word boundaries are never fitted.

## Word-position language discriminator

Train the distribution of GP29 runes conditioned on **original printed word GP-rune length and within-word position**. The fixed estimator uses 12-count smoothing toward the full source-native GP29 unigram distribution. For a proposed aligned original rune pair, convolve their independent conditional symbol probabilities to predict the modulo-29 plaintext difference, then evaluate its natural-log likelihood ratio against uniformly random differences. Sum exactly 208 terms. The four candidate alignments share an independent pre-2014-source-compatible model but are not accepted as historical instructions.

This is a linguistic discriminator on the *original ciphertext differences*, without an arbitrarily fitted key. Scores below are total natural-log likelihood ratios, with larger values better.

| Native GP training source | Direct first | Direct last | Mirror first | Mirror last | Best original alignment rank in 213 rotations |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare | **−2.057** | −18.340 | −20.176 | −24.696 | **3 / 213** |
| Emerson | **−4.229** | −16.280 | −26.369 | −18.007 | **9 / 213** |
| Gibran | **−11.483** | −19.973 | −32.421 | −23.787 | **33 / 213** |

The adversarial comparison retains both unmodified original GP29 ciphertext sequences, their symbol frequencies and their within-page non-repetition structure, and evaluates **every one of the 213 circular p23 shifts** with the same four-alignment optimization. Shift zero ranks third under Shakespeare, ninth under Emerson, and thirty-third under Gibran. For each language model, a *different* shifted alignment can outperform the actual original page alignment. This is a finite conditional rank, and not a probability of historical intention.

A separate preliminary null test sampled 500 independently encrypted matched-length native GP word pairs, preserving original word lengths. Under the Shakespeare model, the original four-alignment best score sat at the 99.6th percentile of that synthetic null. This initially promising diagnostic is fragile: the stronger authentic-cipher rotation test gives different and materially weaker rankings depending on the independent author chosen. Moreover, 500 planted shared-pad native-English controls had a much higher median LLR, around +13.14, than the original best −2.057. A full unconstrained two-message trigram Viterbi fit gave pseudo-English from original ciphertext, but on 12 planted native-text shared-pad pairs it recovered just 29–61 of 208 original source runes, so such generated strings are **not recovered plaintext**.

## Decision

The five-dot reflection itself is source-authentic. The tested difference data do **not** identify a unique natural key-aligned pairing or reliable GP-native message. They make arbitrary additive pad-reuse attacks on p7/p23 a low priority unless a separate original clue specifies exact key reuse and offset. Other non-additive or stateful uses of the ornament remain possible; this test does not exclude them.

**Reproducer:** [single CommonJS original-input SFT](../sims/lp2_p7_p23_sharedpad_wordshape_sft.cjs), using unchanged canonical LP2 runes, printed transcription, and three independent source-native GP29 corpora. It asserts original page lengths, word/line counts, all twelve original author/alignment scores, and three exhaustive 213-offset ranks. No new CI workflow or automatic trigger is created.
