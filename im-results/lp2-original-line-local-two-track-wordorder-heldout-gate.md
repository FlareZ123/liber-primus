# Original LP2 line-local two-track whole-word read order: bounded heldout negative

**Agent10, 22 November 2026. Classification:** original-source executable negative for five visually plausible **line-local whole-word permutation** rules. No authentic unknown-page plaintext, creator-supplied key or intended continuation is recovered. This report narrows Director #2176 after reviewing the earlier all-secret **whole-line reversal** invariant, which this test does not repeat.

## A distinct original-visible hypothesis

The original unsolved manuscript is printed in physical lines, with entire words separated by dots/hyphens and 420 words physically wrapped across line or page breaks. The previously established [line-direction invariant](lp2-boustrophedon-line-wordlength-invariant.md) exactly rejects *line reversal alone*, since reversing complete lines cannot change the unordered adjacency of intact words within each line. The [14-column word-order heldout gate](lp2-14column-wordorder-inverse-heldout-gate.md) is likewise already negative.

A different, still human-readable operation could weave *whole words inside* each printed line. This changes which word lengths are adjacent, avoiding the above invariant. The new experiment freezes five short line-local rules before source scoring, with no ciphertext-selected word positions, free keys or word modifications:

| Rule | Exact operation within each source line of complete word slots |
| --- | --- |
| Adjacent swap | Swap each pair of neighboring printed word slots |
| Odd-first | Read zero-based word slots 0,2,4,... then 1,3,5,... |
| Even-first | Read word slots 1,3,5,... then 0,2,4,... |
| Interleave halves | Interleave the first ceil(N/2) and last floor(N/2) slots |
| Half swap | Read slots ceil(N/2)...N−1 then 0...ceil(N/2)−1 |

Each line uses only its own original number of word slots; no line, page or chapter is rekeyed. P16–21 is a source-original, independently specified challenge segment; p40–53, the largest ornament-framed section, is the independent disjoint test. The source JPEGs for the first region are 33.jpg–38.jpg and for the second 57.jpg–70.jpg. These scans are visually laid out in ordinary centered blocks with no numbered word-weave instruction. The source image therefore supplies a *reason to inspect* line locality but **no selector for these five particular permutations**.

## Authentic parser and reversible GP29 receiver

The exact printed-line transcription is parsed with its authentic rune alphabet and original word delimiters. A slash is a line wrap, not a word separator; original physical page p50 contributes zero runes and zero words. The reproducer matches the unchanged source rune array **12,956/12,956** and exactly recovers **2,896 whole words** and the **32 cross-page word continuations**. It detects 420 total words whose source glyphs cross a physical printed line (including cross-page words), which remain intact, attached to their source starting line.

The five rules form exact permutations of original printed **word tokens**, not merely length samples. On p40–53, the odd-first readout reorders **all 669 original whole GP29 words**, comprising **3,008 original runes**. The inverse permutation restores all 669 words and 3,008 runes exactly, including any originally wrapped word. Since any whole-word permutation preserves the 29-symbol rune histogram, this readout's low GP29 unigram index of coincidence is necessarily unchanged. Thus a *pure* word-order rearrangement cannot by itself restore native GP English's nonuniform rune marginal; an independent value-changing cipher would still be necessary even if an ordering signal existed.

A separate independently sourced GP-normalized English word-length plant is encrypted under the exact odd-first inverse; the correct word-order reader restores all **669/669** planted lengths exactly and improves the native-language predictive score. This is an execution and detection control, not an original solve.

## Fixed language score and independent page-preserving nulls

The only fit is a source-language **ten-bin, smoothed trigram word-length log-likelihood ratio**, trained on the independently checked-in Gibran and Shakespeare control texts (71,140 encoded words). No unknown ciphertext tuning, local rereading, punctuation relocation or learned permutation is allowed.

Raw score gains are natural logarithmic units relative to the printed original order. Each source region's own exact printed word counts and physical-line masks remain unchanged under the permutations.

| Source region | GP runes | Whole words | Adjacent swap | Odd-first | Even-first | Interleave halves | Half swap |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **p16–21** | 1,615 | 373 | −1.918 | −1.551 | −2.033 | −2.818 | +2.518 |
| **p40–53** | 3,008 | 669 | +3.167 | **+16.060** | +14.774 | +10.509 | +2.420 |
| **Full unknown p0–55** | 12,956 | 2,896 | +11.323 | +9.296 | **+17.824** | +4.653 | +12.415 |

The strongest holdout-only option, odd-first, **fails to transfer** to p16–21: −1.551 there. The best same-rule summed gain across the two disjoint regions is only +14.509.

To calibrate the visibly improved local p40 block against post-hoc selection of the best of five rules, the reproducible seeded null independently shuffles the actual word-length values **within each original physical page**, preserving the page's exact length inventory, number of word slots per printed line and number of lines. The same five fixed operations and max selection are rerun on all nulls; the selected rule is held the same across the two regions for the joint score. The 750-trial nulls and 350-trial whole-book null give:

| Frozen comparison | Original best gain | Null equal or greater | Add-one tail |
| --- | ---: | ---: | ---: |
| Best of five, p40–53 only | +16.060 | 45/750 | **0.06125** |
| Best same rule, p16–21 + p40–53 | +14.509 | 140/750 | **0.18775** |
| Best of five, whole manuscript | +17.824 | 134/350 | **0.38462** |

The p40-only odd/even order spike is a local fluctuation under the stated null; it is absent in the independently selected first region and has no fixed original-image selector. These controlled outcomes do not justify any subsequent arbitrary cipher search based on the p40 winner. The null is a conditional finite comparison, not a general probability for all imagined manuscripts or all cipher families.

## Cryptanalytic decision

The evaluated **line-local two-track whole-word** read orders produce no portable source-selected direction, authentic unknown-page plaintext, source-derived key or new reversible GP29 symbol transformation. The already published *whole-line-direction* invariant eliminates the complementary orientation-only family. The remaining live possibility is a **different clue-selected transform that changes the adjacency of complete words or changes what the source punctuation means**, coupled to a reversible rune-value mapping. The original decorative layout and these score gains alone do not supply that operation.

Reproduction: [single-file Node22 read-only original-input SFT](../sims/lp2_original_line_local_two_track_wordorder_sft.cjs), which asserts the rune/word/page counts, 32 genuine page carries, five exact bijections, all null exceedance counts, synthetic source-positive exact inverse and authentic 3,008-rune roundtrip. Windows GitHub Actions manual runner is available at [Run one read-only CommonJS research SFT](https://github.com/FlareZ123/liber-primus/actions/workflows/manual-readonly-commonjs-sft.yml). Evidence remains intermediate and does not alter the authoritative known-plaintext status in results/README.md.
