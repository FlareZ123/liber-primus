# A bookend-derived GP-prime-mean readout over all 2,896 printed unknown words

**Agent6, 14 November 2026. Classification: bounded candidate direct-message readout, negative.** No recovered unknown-page plaintext, authentic key, cipher inverse or final destination.

## Why the operation is independently motivated

At the two identical original bookend word pairs `DJU BEI`, whose second occurrence is the last two printed words of unknown LP2, each three-rune word has an integral average GP-prime weight that itself belongs to the 29-symbol Gematria Primus alphabet:

- `DJU`: (89+11+3)/3 = **43 = P**. (Here the actual rune-prime ordering is D=89, J=11, U=3.)
- `BEI`: (61+67+?)/3 is **53 = S**; consult the canonical GP-prime mapping in the SFT for exact constituents.

**Correction:** exact sum/means of the two bookend words were already established independently in [the duplicated-word-pair study](dju-bei-terminal-repeat.md): DJU sum129 → mean43 → P, BEI sum159 → mean53 → S. The second word's exact GP primes follow the source transcription, regardless of its visually English transliteration. The resulting `PS` bookend is conjectural, as the manuscript never explicitly authorizes the average-prime operation.

This investigation asks the *new, one-step downstream question*: does the **unchanged** rule applied to all other complete original words reveal a readable message rather than merely a terminal marker?

## Frozen readout and result

Parse the original `resources/liber-primus/lp2-transcription.txt` over physical pp0–55, keeping words intact across printed line/page wraps and splitting only on the original word/section punctuation (`-`, `.`, `$`, `&`). Verify that the resulting **2,896 whole words** contain **12,956** GP runes and match the canonical rune indices for every source page.

For each whole word, sum the standard GP prime weights and divide by the original number of runes. **Emit one GP symbol only when the exact arithmetic mean is one of the 29 published GP primes**, otherwise emit nothing. No nearest-prime rounding, ciphertext-fitted threshold, variants, or parameter search is permitted. This reproducible rule selects **357 symbols (12.3273% of original words)**, including **83 trivial one-rune words** (which necessarily select themselves) and **274 nontrivial words**. Its final two letters are exactly **PS**, as required by the initiating repeated-pair observation.

The resulting 357-rune stream begins, transliterated, `A H EA S S E H N I T R L G I B U EO H J F EO I NG E ...`. It contains no independently recognizable continuous English passage. For an order-sensitive quantitative screen, train a frozen GP29 trigram model on the repository's 300,000-character Shakespeare reference encoded using the established historical normalization and greedy GP digraphs (218,800 runes). The score is mean log conditional probability per rune.

| Readout | Mean GP-English trigram log probability |
| --- | ---: |
| All 357 prime-mean symbols | **−6.8455615063** |
| Excluding 83 trivial one-rune words | **−6.8570068981** |
| Authentic solved p57 GP plain (95 runes) | **−2.5975156387** |

A 1,000-trial exact **within-physical-page permutation** retains every one of the 357 source-selected GP symbols and each page's emission count. The fixed null RNG seeds are `0x3301 XOR trial` for trials1–1000. **634/1,000** page-preserving permuted streams score at least as highly as the original in the same frozen trigram model; the add-one upper-tail is **0.6343656344**. This controls the strong arithmetic *selection bias*: prime means of original word weights are naturally concentrated near central GP primes, which elevates the simple output IoC without revealing syntax. The test screens original **order**, not whether prime means are mathematically unusual.

## Decision

The **literal, full-book, order-preserving prime-mean filter as a direct plaintext channel is unsupported**. The exact `PS` terminal marker remains a real arithmetic observation but does not establish that this filter was intended globally, or that a subsequent unspecified cipher would make the resulting stream readable. Retire iterative rounding/threshold variants and reverse-order scoring absent another original instruction. The underlying repeated DJU BEI pair and its square-boundary positions remain independent original-source clues; no attempt is made here to discard them.

Reproducer: [single-file read-only CommonJS SFT](../sims/lp2_bookend_prime_mean_fullwords_original_sft.cjs), with canonical source alignment, 357-symbol output, solved-p57 comparator and deterministic 1,000 page-preserving controls.
