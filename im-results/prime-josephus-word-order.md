# Prime-derived Josephus transpositions of intact LP2 words

**Status (Agent 13, 2026-11-10): bounded negative, with exact inverse positive control.** No unknown LP2 rune plaintext, source key, or valid decryption was obtained.

## Source-motivated candidate

The manuscript repeatedly calls out primes and the Euler totient, and the original magic squares expose numbers such as 91, 809, 1033 and 3301. This finite test asks whether the scrambled order of *whole ciphertext words* comes from a Josephus elimination permutation, with a step specified by one of ten already available clue-related integers:

`5, 23, 29, 53, 91, 256, 809, 1033, 3299, 3301`.

For each step, construct the standard Josephus elimination order in an indexed list of words. Test its forward and inverse application, resetting at each of the 55 physical rune-page groups, eight `$` sections, or once over all 2,896 words. This is exactly **60 deterministic candidate decoders**, defined before choosing a winner. The manuscript does not independently establish that a Josephus permutation is used, so the family is hypothetical.

All 32 words spanning physical page boundaries remain intact and are assigned to their **starting** page using [the canonical page-aware parser](../sims/lp2_word_pages.cjs). The source contains 12,956 unknown runes in 2,896 words; the eight `$` section counts are **[158, 255, 385, 435, 224, 326, 378, 735]**. Numeric-only physical page 50 contributes zero rune words.

## Statistic and matched controls

Without trying to hallucinate English runes, score the plausibility of adjacent **GP-style word-length pairs** in a candidate reading order. The independent reference model is a nine-bin, additive-one-smoothed length bigram estimated from the first 180,000 characters of the committed Shakespeare excerpt. The GP-length approximation contracts `ING, TH, EO, OE, AE, IA, EA, NG` and caps at nine. Each candidate gets a mean adjacent log-likelihood ratio relative to independently sampled word lengths. Higher scores mean more source-like local word-length structure.

For **1,500** deterministic null trials, shuffle the observed whole word lengths separately **inside each physical page**, retaining the exact word-length inventory and all original page sizes, then rescore all 60 permutations and retain the **maximum**. Thus the familywise comparison accounts for selecting the best step, direction and grouping. Seed `0x13093301`.

| Measure | Value |
| --- | ---: |
| Original published word order score | **-0.02273548** |
| Best of 60, global Josephus step 23 forward | **-0.01447353** |
| Null maximum mean | **-0.01202823** |
| Null maximum median | **-0.01217431** |
| Null trials meeting/exceeding selected winner | **1,456 / 1,500** |
| Familywise upper-tail fraction | **1,457 / 1,501 = 0.970686** |
| Fixed pagewise step-809 forward score | **-0.01844692** |
| Fixed step-809 null upper-tail fraction | **613 / 1,501 = 0.408394** |

The best-looking real permutation is **less** source-like than the typical maximum of this candidate search applied to shuffled ciphertext word lengths. No recoverable word-order key emerged. The apparent raw score improvement over the original order does not survive matched selection.

## Constructive positive control

Take 2,896 consecutive *held-out* Shakespeare words (characters after offset 220,000, excluded from the reference-model training window). Apply a **page-reset Josephus 809 forward encryption** to their GP-approximated word lengths, then rank every one of the 60 inverse candidates without seeing the planted original order.

The correct **page-reset Josephus 809 inverse** ranked **1st / 60** and recovered the exact original length sequence. Its source score was **+0.01209041**, the scrambled score **-0.01075167**, and the recovered score **+0.01209041**. This is a meaningful power control for actual word-order inversion at the planted strength, albeit only in this English source register.

## Limits and reproduction

This result tests only *standard constant-step Josephus elimination*, both directions, with the specified ten steps and three reset scales. It leaves open variable-step elimination driven by prime or totient *streams*, per-line rearrangement, different transposition families, changed visible word boundaries, and external keys. It does not establish that LP2 uses any word transposition. The Shakespeare model is a register-specific measuring instrument, not a source attribution.

Run [`sims/prime_josephus_word_order.cjs`](../sims/prime_josephus_word_order.cjs) with Node.js 22, optional first argument `1500`. Source files are already in `resources/`, no dependencies or network needed. CI completed and reproduced the declared sample, source corpus, positive control and familywise statistic: [GitHub Actions run 42766559429](https://github.com/FlareZ123/liber-primus/actions/runs/42766559429). The [manual-only workflow](../.github/workflows/prime-josephus-word-order.yml) prevents automatically rerunning a statistically unproductive search.

**Next useful work:** seek a mechanism that emits or recovers *rune plaintext or external key material*; further unmotivated word permutations are lower priority than source-derived cryptographic transforms.
