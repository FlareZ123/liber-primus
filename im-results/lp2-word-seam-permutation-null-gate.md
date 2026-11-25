# Original LP2 directed word seams: conditional shuffle discrimination and exact ambiguity

## Decision

Director [#2679](https://github.com/FlareZ123/liber-primus/issues/2679): the original endpoint-repeat suppression is strongly incompatible with fully exchangeable post-encryption whole-word shuffling within the nine illustrated chapters, conditional on the original word inventory and fixed chapter endpoint words. However, the full directed 29×29 seam matrix supplies **no identified ordering inverse**. Even preserving all 841 counts exactly, every printed word-length slot, the chapter endpoints and all 32 page-carry word positions leaves at least **10^24.25849 distinct rune tapes** through one simple family of permutations. The off-diagonal residuals do not predict a held-out set of chapters.

This changes the decision: prioritize pre-encryption order changes or a source-selected seam-conditioned permutation over an unconstrained exchangeable post-encryption shuffle. Retire seam statistics alone as order-recovery evidence. No unknown plaintext or key recovered.

## Original data and precise null

`resources/liber-primus/lp2-transcription.txt` (blob 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7), `lp2-corpus.json` (blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165). Reuse the #2176 word parser conventions: hyphen/dot and ampersand finish a group, slash/page break do not. Assert exactly 2,896 complete groups, all 12,956 original rune indices in their original order and 32 cross-page word carries. Partition by word-start physical page into illustrated chapters pp0–2,3–7,8–14,15–22,23–26,27–32,33–39,40–53,54–55; group counts 158,255,383,437,224,326,378,669,66. Each group is moved whole, never split.

For a chapter with m interior groups and first/last groups fixed, let A_a count interior end symbol a, B_b count interior start b, and S_ab count interior groups whose end/start are a/b. For uniform interior permutations, the expected interior-to-interior directed seam count is (A_a B_b - S_ab)/m, because distinct ordered interior groups are adjacent with probability 1/m. Add the exact first-to-random and random-to-last contributions B_b/m and A_a/m, respectively. Interchapter seams are fixed. This is a conditional null on actual inventories, not an iid alphabet approximation.

For the 2,887 intrachapter seams, compute diagonal total, full Pearson discrepancy against the analytic conditional expectation, and off-diagonal-only discrepancy. Use 2,000 deterministic Fisher–Yates samples from exactly the specified uniform permutation law; empirical p values use (exceedances+1)/(2001), not enumeration of the full permutation space. Seed 0x33012679. Eight interchapter seams add zero equalities.

## Full directed matrix result and holdout

| Statistic | Original | Conditional reference |
|---|---:|---:|
| Intrachapter diagonal |23|100.03555 expected|
| All 2,895 seams diagonal |23|100.03555 expected|
| Randomized diagonal 2.5/50/97.5% order statistics | |82 / 100 / 120|
| Lower-tail diagonal p | |1/2001 = .00049975|
| Full Pearson discrepancy |855.19594|p=.04698|
| Off-diagonal-only discrepancy |790.68479|p=.19290|

The diagonal is suppressed independently in the first four chapters (6 versus42.233 expected) and last five (17 versus57.802). A pre-fixed off-diagonal cross-chapter prediction uses training weights (M_ab-E_ab)/(E_ab+2) for a≠b, zero on diagonal, and a test statistic sum weight*(M_test-E_test). Held-out score11.16288, p=.22339 from 2,000 within-holdout conditional permutations. No directed off-diagonal rule is supported. The diagonal suppression remains a correlation, not an identified encryption clock.

## Amount of exchangeable post-encryption shuffling

For each percentage, choose that rounded fraction of interior group slots uniformly, permute their whole groups uniformly, and leave all other slots/chapter endpoints fixed. Four hundred draws per percentage; intervals are empirical 2.5/97.5% order statistics. This measures disruption of an existing channel, not an estimator of historical shuffle percentage.

| Fraction eligible | Original seam diagonal mean [interval] | Strict anti-repeat plant mean [interval] |
|---|---|---|
|10%|37.205 [29,46]|18.5875 [11,28]|
|25%|55.905 [44,69]|43.2225 [29,58]|
|50%|80.740 [65,100]|74.3225 [58,94]|
|100%|99.830 [81,121]|99.5575 [81,118]|

The strict plant uses a cyclic stream of genuine native WELCOME, KOAN and AN END words, matched chapter group counts, continuous random additive pads with redraw until output differs from preceding output; this is a constructed positive, not an authenticated LP cipher. It has zero original seam repeats, conditional expectation99.52047, lower-tail p=1/2001 and full matrix p=.003998; off-diagonal p=.15192. No artificial inference of key or plaintext. Native solved controls separately show ordinary unencrypted group seam counts (WELCOME 5 versus4.77 expected; KOAN 5 versus7.58; p56 AN END 1 versus1.35). The 10% strict-plant interval includes original23; large exchangeable permutations of this plant usually erase suppression. This cannot distinguish a mildly shuffled stronger channel from an unshuffled weaker channel.

## Constructive order ambiguity: exact, source-only, all 841 entries

Within each chapter, freeze its first and last group, and all cross-page carry groups. Partition remaining groups by (first rune, last rune, group length). Permute freely inside each class. Every slot retains length and both endpoint symbols, hence every one of the 2,895 ordered seams is individually unchanged, including the eight interchapter seams. The complete 29×29 count matrix is consequently unchanged, not merely its diagonal.

For a class of n groups with equal-content multiplicities m_i, the number of distinct rune sequences is n!/product(m_i!). Multiplying across 79 nontrivial classes gives log10 count **24.258490912174178** (at least 1.81×10^24 distinct sequences). An explicit deterministic alternative changes 76 printed word contents, asserts all length slots unchanged, and exactly reproduces all 841 seam matrix entries. This is a lower bound: it does not include alternative orders with different endpoint positions but the same aggregate matrix. The experiment deliberately retains slot geometry, not just a histogram. Full directed seam preservation is therefore far too weak to recover unique order.

## Reproduction and limits

`node sims/lp2_word_seam_permutation_null_sft.cjs`; source-backed execution from fetched GitHub files succeeded, no CI run claimed. [SFT](../sims/lp2_word_seam_permutation_null_sft.cjs), commit c0ff95a66ce2e6d14d0ec22bfa0bb08bda38fedc. The exact-preservation result is mathematical, the conditional tail estimates Monte Carlo, the historical interpretation a scoped hypothesis. #2176 tested five particular physical line-local order rules against native word-length language models; this is a distinct endpoint-inventory conditional test and all-seam ambiguity construction. Do not repeat it as an order-recovery search.

## Stronger layout-conditioned rank ambiguity (Director #2856, Agent14, 25 November)

This is a strictly stronger conditioning experiment on the existing constructive ambiguity, not a second permutation-null run. The canonical 2,896 complete groups and 12,956 GP29 runes are reconstructed from the image-corrected physical transcription, including 594 rune rows and 32 page-carries. Before choosing any swap, freeze every group spanning a physical line/page, touching the first/last rune of any line, adjoining a non-hyphen separator, touching a recorded red rune or punctuation/literal digit offset (including the conservative derivative punctuation inventory), and every chapter endpoint group. This leaves 1,889 eligible complete groups. Within the declared scope, permit permutations only among the eligible groups with identical (first GP29 rune, last GP29 rune, length), and count distinct contents, not identities of duplicate groups. Exact multinomial counts use BigInt; no Monte Carlo or language score.

| Permutation locality | Nontrivial classes | Exact distinct tapes in this restricted family | log2 count |
|---|---:|---:|---:|
| Illustrated chapter | 33 | 25,769,803,776 | 34.585 |
| Same physical page | 5 | 32 | 5 |
| Same physical line | 2 | 4 | 2 |

Every candidate retains every individual directed word seam, all word length slots, all carried groups, all first/last rune identities of the 594 physical lines, and all frozen ink/mark-associated groups. Page-local swaps additionally retain **every page's 29-bin unigram and 841-bin contiguous bigram count**. Line-local swaps retain those counts **for every individual physical rune line**. This follows because identical endpoint symbols preserve every intergroup transition and swapping complete groups within the same line preserves the multiset of all internal transitions. The code independently enumerates all four line-local witnesses and checks every one of the 594 unigram and bigram matrices.

The two independent, disjoint swaps are:

| Physical page | Zero-based line | Zero-based page rune starts | Original word pair | Prime sums |
|---|---:|---|---|---|
| 12 | 7 | 150, 163 | G R O ↔ G M O | 35, 95 |
| 35 | 11 | 254, 265 | T I U ↔ T AE U | 93, 163 |

The four witness tapes are a counterexample to unique ordering from this full combination of rank-free aggregate and positional features, **not four possible actual plaintexts**. No claim of exact pixel positions, font advances, per-word prime-sum equality, higher-order n-gram equality, or a complete pre-encryption-cipher inverse follows. In particular, if the creator independently assigned word-associated ranks, these two swaps could be distinguished. The exact printed slot coordinates and line numbers do not tell a solver which original order produced a sorted list; a content-keyed stable sort is many-to-one unless the discarded order is recoverable by a separate rule/field. The signed 2016 "numbers are the direction" statement does not state a numeric function, direction, target or ordering convention for these groups. The historically documented 2014 column transposition is a different independently specified operand; earlier #2141's stable square-rank word permutation and #2842's stable prime-residue rune order were negative on their fixed receivers. No new historical seam-conditioned rank assignment is identified, and #2722's within-word cyclic map also does not provide one.

**Decision:** the 23-seam suppression remains meaningful against the exchangeable post-encryption null. Even adding substantial physical layout and all within-line unigram/bigram information leaves at least four exact alternative arrangements. Close #2856 absent a word-associated rank or independent executable ordering operation; do not fit another collision-minimizing shuffle. No unknown plaintext or key recovered.

Reproduce from repo root: `node sims/lp2_word_seam_layout_rank_ambiguity_sft.cjs`. [SFT](../sims/lp2_word_seam_layout_rank_ambiguity_sft.cjs) · [exact counts and coordinate witnesses](lp2-word-seam-layout-rank-ambiguity-output.json). Same function executed on canonical input in connected JavaScript; no CI claim.
