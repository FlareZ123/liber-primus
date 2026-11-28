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

## Exact signed-pad joint lexical inverse (Agent19, 28 November 2026)

**Decision:** Neither same-sign nor opposite-sign arbitrary additive GP29 pad sharing gives a wholly lexical inverse for the four original alignments, even when physical boundary fragments can be extended into their complete printed groups and the p23 red title need not participate in the pad. The best finite-lexicon optimum is **eight out-of-lexicon groups**, with no coherent recovered plaintext. This strengthens the earlier statistical negative but remains conditional on plaintext group preservation and the finite lexical inventory. The original five-dot reflection motivates testing an opposite pad direction; it does not authenticate pad reuse or specify a sign.

For each source-aligned pair, define `C7 = P7 + K` and `C23 = P23 - s K` in GP29. Then `P7 + s P23 = C7 + s C23`, where `s=+1` is opposite-sign use and `s=-1` same-sign use. The arbitrary independent pad positions are eliminated **exactly**, without a key period, language-model threshold, or fitted key. The four alignments are the frozen direct/mirrored line-order, first/last-208 alternatives above. The red-heading alternative drops exactly pairs with p23 rune indices 0–15; it does not reorder any other positions.

The lexical inventory consists of 32,125 distinct GP29 forms from the pinned TextBlob frequency list plus the three native author controls above and LP1/solved-LP2 reference, using the same native normalization as the earlier experiment. Physical p7 first group is a two-rune suffix of a three-rune group continuing from p6 (one-rune prefix); p23 last four-rune fragment continues into the first three runes on p24. Their domains project all length-3 and length-7 lexical forms to the observed fragment, without constraining the unpaired neighbor-page runes. The 50+46 physical groups are thus **not** all complete words. The result permits an arbitrary wildcard word at unit cost, including an arbitrary extension of a boundary fragment. All 16 constraint graphs are forests: one variable per printed group, one edge per overlapping pair of groups, and one coordinate equation per aligned rune. Every rune has at most one counterpart. A bottom-up minimum-cost message indexed by edge signature gives the exact optimal number of wildcard groups; the unrestricted wildcard is valid for every signature, and child subtrees are independent. The reconstruction is replayed against every included original pair, and the number of genuinely nonlexical projected groups equals the optimum. This is an exact finite-domain inverse, not an optimization heuristic.

| Alignment | Opposite signs, title included | Same signs, title included | Opposite signs, title excluded | Same signs, title excluded |
| --- | ---: | ---: | ---: | ---: |
| Direct first | 11 | 9 | 11 | 8 |
| Direct last | 11 | 10 | 10 | 9 |
| Mirror first | 9 | 10 | 9 | 10 |
| Mirror last | 10 | 10 | 10 | 10 |

All included-title cases replay 208/208 paired positions; excluded-title cases replay 192, 197, 193 and 192 respectively for both signs. All **16 deterministic random-pad, matched-group-length planted lexical controls** have minimum zero and exact included-pair replay. Those plants establish support and algorithm correctness, not recovery of a unique original key or grammatical plaintext. The witnesses for original minimum-cost assignments are word salad with arbitrary wildcard runes; they are not candidate decryptions. No genuinely blind native-language holdout was used to calibrate out-of-vocabulary rates. Consequently the minimum is an exact obstruction to the stated lexicon/OOV budgets, not a proof against all English or arbitrary segmentation, key clocks, or other pad alignment.

The initial exploratory calculation treated both boundary fragments as standalone groups; the corrected calculation above supersedes that input interpretation. Its title-included numerical optima happen to be unchanged. Core JS executed against the exact tracked source blobs in connected V8; the standalone Node wrapper was not separately run. [Reproducer](../sims/lp2_p7_p23_oppositepad_min_oov_sft.cjs) · [all original optima, replay witnesses, controls and source blob IDs](lp2-p7-p23-oppositepad-min-oov-output.json). Do not expand this pad family without an independent original clue specifying alignment or a genuine key; the finite lexical failure does not identify a different cipher.
