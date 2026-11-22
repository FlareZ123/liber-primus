# LP2 word-length sequence: source-native syntax signal and fixed 2014 row operation

**Scope:** original unsolved LP2 printed-word order under source-attested GP word segmentation. This is a bounded mechanism-discrimination result; it recovers **no plaintext, authentic LP2 key or decryption**. It belongs in intermediate evidence.

## A decision with an original-cipher consequence

A meaningful word-order transform is one possible explanation for the cryptographically unusual unknown LP2 register. If the 2,896 printed rune-word lengths preserve original English prose in their natural order, their adjacent length pairs should often retain ordinary language syntax, independently of any reversible rune-letter substitution. A source-selected word permutation could recover that signal even when its letter cipher remains unknown.

This tests a source-blind observable, without guessing any decoded word: the original 55 rune-bearing physical pages contain **12,956 GP runes in 2,896 canonical words**, with 2,895 immediately neighboring word-length pairs. The source parser ignores only physical line/page wrapping, preserving the printed hyphen/period boundaries. Eight nonempty original text sections are delimited by the source manuscript's section marks. The p50 numerical page has no rune words.

The control converts independently preserved Shakespeare, Gibran and Emerson texts, plus editor-normalized solved Cicada LP1/LP2, to native GP29 word lengths. A seven-category word-length bigram model is trained on each source separately: 1, 2, 3, 4, 5–6, 7–8, 9+. The model measures per-pair log2 odds of source-trained adjacent lengths versus their source-trained independent frequencies, with Laplace smoothing. This guards against calling mere original unigram length differences a scrambled order. Each original test is calibrated against **600 full shuffles of the exact original word-length multiset**.

## Observation on the untouched original

| Training text | Original sequence log-odds, bits per pair | Original random-order comparison | Result |
| --- | ---: | --- | --- |
| Solved-Cicada LP1 reference | -0.054795 | Similar to original exact-multiset shuffles | No detected native syntax signal |
| Shakespeare | -0.025799 | Similar to original exact-multiset shuffles | No detected source syntax signal |
| Gibran | -0.077587 | Similar to original exact-multiset shuffles | No detected source syntax signal |
| Emerson | -0.057732 | Similar to original exact-multiset shuffles | No detected source syntax signal |

The fixed-seed exploratory 350-shuffle checks returned respective standardized values about **+0.04, -0.50, -1.36, -0.84**. These near-null results are striking against linguistic positive controls: the Gibran and Emerson GP-word sequences score more than **five shuffled standard deviations** above their own order-randomized controls under models trained on the separate solved-Cicada and Shakespeare sources. The native-reference model's own solved prose also has substantial internal word-order structure. The source models therefore detect real grammatical length ordering in previously unseen literary material.

Per-section source-native checks separately examine each of the **eight nonempty original printed sections**. Every section's standardized score stays within 2.5 shuffled standard deviations of its own word-length multiset under the solved-Cicada author model. The book-wide result is thus not simply driven by a single scrambled section. This says only that the tested language-source association is undetectable. A different language, unusual intended prose, source-specific vocabulary, changed word boundaries or local word-order operations all remain possible.

## One genuinely historical, frozen inverse trial

The authenticated original **2014 Stage5 OutGuess plaintext** supplies a real operation, rather than an invented word permutation. Its seven-column hint **1736254** was decoded by rearranging *each consecutive seven-symbol row* in source-defined order **[0,6,2,5,1,4,3]**. See [original Stage5 recovery](2014-stage5-avowy-archive-audit.md). This operation is historically real, although the source does not instruct transferring it to LP2 words.

Transfer its fixed row permutation, without key or phase optimization, to blocks of seven **whole printed LP2 word lengths** and examine the original order and opposite orientation under exactly three plausible fixed reset modes:

| Original source reset | Historical permutation, solved-Cicada model | Opposite permutation, solved-Cicada model |
| --- | ---: | ---: |
| One whole-book stream | -0.047537 | -0.052106 |
| At printed text-section marks | -0.054303 | -0.058428 |
| At rune-bearing physical page starts | -0.064399 | -0.068336 |

The unchanged original score is **-0.054795**. All six outputs remain nonlinguistic under the independently trained Shakespeare model too (scores below zero). A Gibran GP-native 2,896-word synthetic plant is *actually scrambled* by the inverse 2014 permutation, then exactly recovered by the historical permutation: **2,896/2,896 words** match and the source-trained syntax signal is restored. The planted positive verifies that the operation and detector would recognize the proposed kind of word-order scrambling.

The source's historical seven-position cipher is therefore **insufficient by itself** to restore native word-order evidence for original LP2, under the three original reset conventions and both fixed directions. Do not rescue this with arbitrary row offsets, permutations or new ciphers until an original instruction chooses them.

## Complete-book 2014 Stage05 historical 14-column word inverse (Agent28, 17 November)

**Decision: no native GP-English word-order recovery from the original 2,896-word source.** This tests a fixed historically authored 14-column transposition at a previously untested *whole-book* scope, distinct from the prior p40–53 667-word trial ([narrower original comparison](lp2-p40-stage05-14column-wholeword-gate.md)). The LP2 unknown manuscript has **56 physical pages**, divisible into four groups of 14. That numerical fit gives a clue-shaped reason to check a 14-column whole-book transform, but the historical 2014 Stage05 source does not say to apply it here or to use words as units.

The exact historical column reading order is `[2,8,9,1,12,13,11,4,5,7,3,0,6,10]`. Parse the complete original source into 2,896 joined printed words and 12,956 runes (2,896 source lengths with histogram exactly `[83,448,720,513,317,256,216,156,78,52,32,18,4,3]` for 1–14). Freeze the 14-column source order and its one opposite ordering, using row-major assignment of plaintext *whole words* and contiguous historical-column ciphertext concatenation, including the unequal final row. Both inverses re-encode the intact original word list, with no rune change, plaintext guess, key fit or reset. Score the resulting word-length adjacency by the independently trained same three source-native seven-bin GP English models already used elsewhere in this report, **without retraining models to the LP2 results**.

| Independent GP training source | Unchanged order (bits/pair) | Historical inverse | Opposite inverse | Opposite one-sided shuffled tail | Best of two shuffled tail |
| --- | ---: | ---: | ---: | ---: | ---: |
| Solved-Cicada LP1 | **−0.057744** | −0.060222 | −0.051208 | 0.2482 | 0.4264 |
| Gibran | **−0.077587** | −0.071189 | −0.053078 | 0.0311 | 0.0705 |
| Emerson | **−0.057732** | −0.062146 | −0.038666 | 0.0105 | 0.0272 |

The tails are plus-one proportions from **1,800 deterministic Fisher–Yates permutations of the exact original 2,896 word-length multiset** (`0x20143301` seed), with the fixed operation run on each. The opposite reading mildly improves two literary comparisons, but the historically recorded orientation does not, all six original inverse scores remain **below zero**, and solved-Cicada LP1 sees no relevant signal. Selection among the three training sources and two directions, plus the broader many-branch history, forbids interpreting the smallest one-control tail as a genuine decipherment. These permutations are not a language-independent model of exotic prose, and word-length bigrams alone cannot establish plaintext. The result therefore **does not justify** a second stage of fitted alphabets, free column-order search, or word-boundary exceptions.

**Complete source-native positive control:** 2,896 authentic GP-rendered Gibran word lengths are encrypted under the *same fixed historical 14-column order*. The exact inverse recovers every original length; the source-trained Gibran score rises from approximately **−0.029735 scrambled** to **+0.048010 restored** bits/pair. This establishes that the operation and statistic have power against a genuine same-sized native text.

**Reproduce:** [original-source CommonJS SFT](../sims/lp2_book14_wordlength_historical_sft.cjs), Windows Node.js 22; [manual-only Windows job](https://github.com/FlareZ123/liber-primus/actions/runs/44057594711) (submitted; do not assume CI succeeded before confirmation). The result adds a finite historical source-operation negative without recovering an LP2 rune, cryptographic key, instruction or destination.

## Original 2014 Wisdom 5×5 outer-to-inner spiral on complete words

**Agent31, 14 November 2026.** A separate, clue-constrained whole-word inverse asks whether the already-known loss of ordinary GP-English word-length bigram association could reflect a *spiral* rather than the 2014 seven-position historical transposition. The actual **2014 LP1 Wisdom 5×5** is a source object. The original LP2 p57 PARABLE instructs solvers to shed "circumferences" and seek what is within, and physical p15 prints a clockwise spiral. Together these motivate the familiar 25-slot, outer-ring-to-inner-ring reading, without selecting a plaintext or secret key. The weakest premise is that this spatial instruction applies to **25 consecutive entire words** from unsolved LP2; no authored source explicitly assigns that unit or clock.

The exact original input is the complete **2,896 printed LP2 words**/12,956 GP runes, joining 32 physical-page-spanning words, and the original eight text section markers. Freeze the standard row-major 5×5 versus outer-to-inner 5×5 spiral mapping from top-left, in the clockwise direction fixed by physical p15 and counterclockwise as the one opposing orientation. For each, test reading the row-major-filled block by the spiral and the exact inverse filling a spiral then reading row-major. Apply unchanged 25-word blocks with one of **three fixed reset modes**: continuous original book, printed text sections, and physical source page. Retain any incomplete 25-word block unchanged. These source choices give **12** complete, reversible word permutations, no guessed columns, words or phase.

The previous fixed, pretrained seven-bin GP-native word-length bigram models are reused from solved Cicada LP1 (author text) and independent Shakespeare/Gibran literary controls. Under the LP1 model, the untouched original order scores **−0.05774388 bits per adjacent-word pair**. The best of twelve variants, whole-book counterclockwise spiral read, scores **−0.04501419**, an apparent lift of **+0.01272969 bits/pair**. Its Shakespeare score remains **−0.02583066**, similar to unchanged original **−0.02579850**; no GP-native word-order structure is restored. The historically favored *clockwise* complete-book reading scores **−0.05815159**, a slight decrease relative to unchanged original. The full twelve-variant table and all three language scores are printed by the SFT; the fixed orientation and reverse conventions are pinned in code.

To account for choosing the strongest of twelve routes *after* seeing the source, 600 deterministic control books (xorshift32 seed `0x20143301`) independently permute the **complete original 2,896 word-length multiset**. Each control is evaluated over the **same twelve frozen routes**, selecting its own LP1-model maximum. **243/600** controls reach or exceed the original-best model score, giving finite plus-one tail **244/601 = 0.40599002**. The control null median maximum is **−0.04609010**, 95th percentile **−0.03784738**, so the source original is typical even for the *best-selected* route. This global-multiset shuffle does not preserve page- or section-specific length inventories; the original itself shows no positive source-native syntax signal under earlier chapter-controlled tests.

**Full source-native positive:** a separate 2,896-word Gibran GP passage is encrypted using the exact clockwise 5×5 spiral-fill operation, then decoded by the literal inverse clockwise spiral-read; all **2,896/2,896 whole words** are recovered with original order. Shakespeare-model length-bigram score increases from **+0.00013025 scrambled** to **+0.02966293 recovered**, establishing that this measurement can recognize restored native word order under a correct inverse.

**Decision:** reject this bounded complete-word, source-motivated **5×5 spiral route** as a plaintext-order recovery on original LP2. Preserve the manuscript 5×5 square as an authentic clue, but do not infer that it operates on consecutive 25 whole words. A separately authenticated map from page typography to symbols or a different key-selected unit could justify an independent test; rotationally scanning more origins and arbitrary paths would be a weak retuning of the present negative.

**Reproducer:** [one-file CommonJS SFT](../sims/lp2_wisdom25_word_spiral_order_sft.cjs) and [passing Windows Node22 CI run 43562973606](https://github.com/FlareZ123/liber-primus/actions/runs/43562973606). The exact SFT asserts the historical 25-slot clockwise spiral, native source word counts, original source segmentation, planted exact inverse, all twelve original models and familywise 600-shuffle control. It does not purport to invert an unknown ciphertext alphabet.

## Original 2014 three-magic-square numerical-rank word order (Agent 36, 15 November)

The surviving 2014 Cicada Stage10 submission specifies three actual, published squares, **5×5 / 7×7 / 5×5**, with 25, 49 and 25 numeric cells. Unlike the manuscript's hypothetical 5×5 spiral, these matrices provide **explicit numerical values**. A separate direct, reproducible hypothesis is to sort the printed cells by increasing value and read corresponding successive whole ciphertext words in that order. Its strongest objection is that no original Cicada instruction transfers those historical square values to LP2's **2,896 printed words**, and the squares contain repeated values, so any precise rank permutation requires a tie convention. This frozen test uses stable row-major tie breaks, never fits ties or ranks to language.

For each of the **three original matrices**, construct its ascending stable rank permutation; apply both rank-read and exact inverse rank-fill to consecutive blocks of 25/49 complete words. Independently reset at manuscript book start, at the eight genuine printed text-section marks, or at physical page starts, retaining incomplete blocks unchanged. These are **18** source-fixed reversible possibilities, scored using exactly the established, separate source-native LP1, Shakespeare and Gibran word-length bigram models. No GP29 key, plaintext, phrase or 2016 word-map guess enters the selection.

On the unchanged original cipher's 2,896 word lengths, the **best LP1 grammar score** is **−0.043034823 bits/pair**, obtained by reading the third (1033-sum) 5×5 in rank order with page resets; the original unchanged score is approximately **−0.055 bits/pair**. The corresponding Shakespeare score is **−0.018606153** and Gibran score **−0.066042322**: neither establishes restored native word order. Crucially, under **400 exact-multiset shuffled controls** using the same **best-of-18** selection, **163 controls attain or exceed the original best**, with plus-one tail **164/401 = 0.408977556**. All **nine** original matrix/reset rank-read versus rank-fill positive controls exactly restore independently selected Gibran word-length sequences; this checks that the proposed inverse works when correctly applied.

**Decision:** The source-concrete 2014 magic-square numerical-rank ordering fails to restore detectable ordinary GP-English word-order structure, even selecting the best of 18 frozen directions and resets. As with the previous seven-column and spiral routes, the rank alignment provides no original plaintext or new LP2 key; future word-order proposals require a first-party choice of transfer, tie handling and text unit. Reproduce from the unaltered original rune transcription and 745-byte square source with [the standalone source-native CJS test](../sims/lp2_2014_three_squares_wordrank_sft.cjs), successfully executed on [GitHub Actions 43708616208](https://github.com/FlareZ123/liber-primus/actions/runs/43708616208).

## Research use and limits

This is evidence against simply taking the **printed word order** as an intact register of ordinary source-native English prose. It is compatible with a word transposition, deliberately altered punctuation/word segmentation, an unusual plaintext language, binary transport with simulated breaks, or other mechanisms. The data do **not** prove that spaces are false; the distinctive vocabulary and style of original Cicada prose may depart from the training controls.

A productive follow-up requires a **more explicit source-selected reversible word order**, an authentic image or historical artifact that specifies its units, clock and direction, and a held-out original segment showing restored syntax and eventually plaintext under exact re-encryption. Both the historical 2014 seven-slot transposition and the source-motivated 5×5 complete-word clockwise/counterclockwise spirals fail this native grammar gate. Without that selector, the observed lack of a source-language length-order signal does not justify searching free permutations.

**Reproducer:** [single-file source-native GP controls and planted inverse](../sims/lp2_wordlength_order_native_control_sft.cjs). The method reuses the repository's canonical original corpus and pinned literary texts. It does not alter manuscript transcription.
