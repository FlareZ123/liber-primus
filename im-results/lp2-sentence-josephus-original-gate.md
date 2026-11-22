# Sentence-local Josephus inversion: exact original LP2 word-order gate

**14 November 2026, Agent 5. Classification:** source-selected finite cryptanalytic negative. **No unknown Liber Primus plaintext, key, operation or destination was recovered.** This tests a sentence-local reading scope absent from the existing [whole-book/chapter Josephus gate](lp2-josephus-29-wordorder-source-gate.md), preserving the actual 175 printed period stops. Its source-frozen original inversion cannot restore native-GP English word-order grammar.

## Player-visible hypothesis and missing step

The manuscript visibly prints full stops, defines a 29-rune Gematria Primus alphabet, shows 256 numeric cells on physical pp49–51, and marks a Fibonacci-prime spiral around the red 3299 on p15. The clear p57 instruction *shed our own circumferences* motivates testing a circular elimination readout, using the displayed numbers as a count. Unlike earlier whole-book/chapter Josephus tests, a solver could reset at each printed period. That is a distinct, bounded, reversible word permutation.

**Weakest premise:** no contemporary Cicada source actually instructs eliminating complete ciphertext words around circles, specifies sentence resets, or names Josephus. This experiment tests whether that simple source-shaped inference can recover the observable order constraints of prose before anyone attempts letter-key search.

Use the original 55 rune-bearing unsolved physical-page transcription, preserving all page-spanning words and line wrapping. Each printed period terminates a sentence; the exact **175 resulting sentences contain 2,896 complete words and 12,956 runes**. One model operates separately inside each sentence: index its words from zero, count the current surviving word as one, repeatedly remove every current step-th word, and read the removed positions in sequence. Its inverse instead places the successive printed words into removed positions. Both directions are bijections and preserve every word's length.

Seven finite source-fixed count lists are each crossed with these two inverse/forward orientations:

| Count source | Exact integer schedule |
|---|---|
| Gematria Primus | 29 |
| Numerical grid size | 256 |
| P15 red square center | 3299 |
| Cicada identifier | 3301 |
| P15 outward square differences | 3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516 |
| P15 underlying prime ordinals | 1, 2, 3, 4, 6, 9, 14, 22, 35, 56, 90, 145, 234, 378, 611, 988 |
| P15 underlying prime values | 2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817 |

The repeating 16-step lists advance within each sentence from their first printed element. The complete **14** source-derived candidate permutations are the frozen test family.

## Independent English-language criterion

A proposed permutation can reorder the original whole-word lengths; any subsequent fixed, arbitrary, length-preserving rune substitution cannot change those length values. Train a fixed source-independent 9×9 **word-length adjacency log-likelihood ratio** on three pinned GP-normalized English controls (Gibran, Shakespeare, Emerson; 1..8 and 9+ rune bins), with half-count smoothing and historical ING/IO spelling contractions. Sum log odds over **pairs belonging to the same original printed sentence**. Higher means more characteristic GP-English source word ordering. Original runes are never used for key fitting.

For null calibration, uniformly shuffle **only the existing lengths inside each original sentence**, preserving all 175 individual length multisets, their stop positions and the global inventory. Independently maximize the same **14** source models in every one of **1,500** deterministic null manuscripts. This is a stronger conditioning than whole-book shuffling, matching the exact proposed sentence boundaries.

## Original-cipher result

| Reading | Independent English-length score |
|---|---:|
| Original printed order | **−79.3362875** |
| Strongest of 14 inverses, **GP29 Josephus inverse** | **−69.7259612** |
| Null mean of best-of-14 optimized scores | **−56.5210712** |

**All 1,500/1,500 shuffled original-word inventories produce a 14-model maximum at least as high as the actual original maximum**. Familywise empirical upper tail is **1,501/1,501 = 1.0**. The exact fixed GP29-inverse upper tail is **604/1,501 ≈ 0.4024**. The source-shaped original order does not restore a prose-like sequence under this test. The other twelve source variants are no better; all scores and separately conditioned p-values appear in the SFT output.

The exact source-shaped positive control uses the same original 175 sentence widths, with **2,896** GP-normalized words selected from each of the three independent literary sources. A 29-step sentence-local Josephus forward permutation followed by the frozen inverse recovers **all 2,896 word lengths exactly** in every control. Untouched controls score **+56.1675 / +37.6761 / +83.4736** (Gibran/Shakespeare/Emerson) and their deliberately scrambled images score **−23.6193 / −38.2064 / −18.1957**, respectively. The controls establish that the proposed inverse can undo a genuine sentence-local Josephus transport and reveal ordered English-length grammar.

## Independent sentence-fingerprint observation

The same 175 printed sentence lengths, measured as word counts, have at most **four** consecutive equal sentence counts against the pinned Gibran *Prophet* edition (source sentence57 versus LP2 sentence60) and **three** against Shakespeare (first 300k characters), Blake's *Marriage of Heaven and Hell* and Crowley's *Book of the Law* II. The four-count Gibran hit does **not** preserve the four full word-length sequences or their per-sentence length multisets. An exact full-sentence length-multiset screen with at least six words finds only isolated nine-word hits in Gibran and Shakespeare, with no adjacent matched sentence. These counts are supplementary exploratory exclusion of a literal source quotation, not discovery-calibrated source attribution; source editions and sentence splitting differ.

## Research decision

Retire this exact **within-sentence whole-word Josephus** family, even with any subsequent unknown letter substitution that keeps the printed word lengths. This excludes no cipher that changes printed word breaks or word lengths, operates across full-stop boundaries, or uses a source-specified distinct counting schedule. The original stop marks alone do not select a useful inverse. A productive successor needs an authenticated text interval, key or a visual operation that changes the word-segmentation architecture. Avoid fitting extra Josephus steps to the same measured English score.

**Reproduce:** [single-file Node.js 22 CommonJS SFT](../sims/lp2_sentence_josephus_original_sft.cjs), using only the repository's canonical original transcript/corpus and three pinned language controls. The SFT asserts original rune/word/sentence counts, exact source-score values, fully 14-model conditioned null, and three positive inversion plants. The input script and original arithmetic were executed in this invocation; no independent GitHub Actions run is claimed here.
