# First-party source-text boundary donor test: bounded negative

**Decision:** neither ordered word boundaries nor the later exact consecutive sentence inventories select a qualifying donor crib from the pinned Book of the Law or Self-Reliance witness. No spacing-free cipher inverse was run because both donor gates failed.

## Hypothesis and frozen donor set

The tested hypothesis is that the original printed LP2 word groups preserve a contiguous word-boundary sequence from a Cicada-linked source text. A fixed boundary donor would preserve the sequence of GP29 rune counts per word; exact matching also preserves every cumulative rune boundary. A qualifying result was fixed in advance as at least 20 consecutive exact word-length matches, with original and donor offsets identified. A donor would still need an independently selected, feasible spacing-free inverse before it could be used as a plaintext crib.

The new long-form source set was limited to:
- The three chapter transcriptions of the 2013 Book of the Law, from the pinned word-length JSON and its original source URLs/blob SHAs.
- The 2014 Self-Reliance book-code witness, normalized with the same GP29 digraph rules.

The 2012 Britannica, Agrippa and Mabinogion donor tests, and the authenticated 2013 NEXT signed-message test, were already run in earlier scripts and are not repeated here. No generic Gutenberg or post-hoc donor search was added.

## Original LP2 boundaries

The corrected continuous transcription contains 2,896 printed groups, 12,956 runes and 32 cross-page words. The nine physical chapter word counts are [158,255,383,437,224,326,378,669,66]. Chapter 8 is the p40–53 unknown chapter: 669 groups and 3,008 runes.

## Exact donor matches

The longest exact contiguous match anywhere in the nine LP2 chapters against the new donor set is **nine words**. No complete chapter matches a donor interval, and no match reaches the 20-word crib threshold.

For p40–53 specifically, the best match is **eight words** from 2013 Book of the Law, chapter 2:
- LP2 global word start: 2217
- LP2 cumulative rune start: 9880
- Donor word start: 1040
- Donor cumulative rune start: 3721
- Exact shared rune span: 28

The eight-word match is not source-specific: matched continuous Shakespeare/Gibran windows of the same donor search volume and within at most five percent of its total rune length produce runs up to nine words. Across all chapters, the donor maximum (nine) is no greater than the sampled native-control maximum (nine). The separate 2014 Self-Reliance match in p40–53 is also eight words.

The 24-word positive plant is recovered at its exact target and donor offsets, confirming the matcher detects a planted long boundary sequence. The native controls use contiguous text windows matched by donor word count and approximate total GP29 rune length; the raw output records each tolerance, available window count and sampled maximum/95th percentile.

## Interpretation

The p40–53 chapter does not inherit a long exact boundary sequence from either new source. The nine-word global maximum is comparable to matched native controls and is not a usable donor selector. The earlier 2012 and 2013 NEXT screens likewise produced only short matches. There is therefore no independently selected source interval from which to derive a key or plaintext crib, and no spacing-free inverse was attempted.

This rejects the tested first-party boundary-donor route, not every possible transposition or external text dependency. The result is conditional on the pinned LP2 transcription and the documented donor normalizations; this run did not independently re-transcribe the original JPGs.

## Reproduction

- SFT: [agent46_lp2_donor_boundary_match_sft.cjs](../sims/agent46_lp2_donor_boundary_match_sft.cjs)
- Raw output: [lp2-firstparty-donor-boundary-gate.json](lp2-firstparty-donor-boundary-gate.json)
- Original word parser: [lp2_word_pages.cjs](../sims/lp2_word_pages.cjs)
- New donor sources: [2013 Book of the Law GP29 word lengths](../resources/external/cicada2013-crowley-book-of-law-2013-gp-wordlengths.json) and [2014 Self-Reliance witness](../resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt)
- Native controls: Shakespeare and Gibran pinned text files under resources/control.

**Conclusion:** the new first-party source texts do not supply a long p40–53 boundary donor. Retire this route unless an independently authenticated text or source instruction selects a different donor.

## Conserved sentence inventories (#2975, Agent19, 26 November 2026)

**Decision: no adjacent-sentence inventory donor in either of the two named first-party sources, even allowing arbitrary within-span word permutations and unequal/short sentence sizes.** This is distinct from the ordered-boundary gate above and from the earlier [two-sentence source-bag test](lp2-two-sentence-orderless-source-crib-gate.md), whose source set omitted this Self-Reliance witness and required at least 13 words in each of the two spans.

The original partition is the image-corrected 173 nonempty punctuation spans; all 55 rune-bearing pages are compared exactly to the corpus indices, all 2,896 groups and 12,956 runes retained. The fixed original delimiters are `.`, `&`, `$`, `§` as in the preceding source-bag study. On the named donor texts only, use `[.!?]` as sentence terminators, remove the Book of the Law's initial verse labels, preserve chapter boundaries, and do not split at colons, semicolons or print wrapping. Native GP29 conversion uses the established greedy multigraph convention including ING→NG, IO→IA and QU→CW. Apostrophe-bearing lexical words remain one printed group, with each mark's interior GP rune offset recorded. The four actual LP2 apostrophe strokes come from the image-adjudicated source annotation. The six literal digits 7,1,2,3,4,5 are non-consuming anchors. For any compared sentence pair, compare the multiset of (word length, apostrophe position) or numeral values if that kind of anchor occurs on both sides. This allows absent anchors, a deliberately permissive gate. No added donor corpus, approximate matching, or post-result punctuation variant is tested.

Before scoring the original, freeze a minimum of two consecutive exact sorted-length signatures, at least 20 total words and 60 runes, a familywise maximum word-span statistic and a 1% add-one null cutoff. The sorted-length signature implies both group count and rune total. Enumerate every adjacent pair, extend maximally, and compare complete exact signatures and the anchor constraints (not a probabilistic hash).

| Pinned donor | Sentence spans | GP word groups | Native runes | Exact runs of ≥2 spans |
|---|---:|---:|---:|---:|
| 2013 Book of the Law I | 142 | 1,896 | 6,958 | 0 |
| 2013 Book of the Law II | 193 | 1,967 | 7,059 | 0 |
| 2013 Book of the Law III | 154 | 1,998 | 7,484 | 0 |
| 2014 Self-Reliance witness | 510 | 10,146 | 41,181 | 0 |

The 2,000 whole-family control draws each use four contiguous independently authored Gibran/Shakespeare windows of exactly the corresponding donor sentence counts. Prefer total groups and GP runes within 15% of donor volume; such windows exist for Law I/III and Self-Reliance (478, 440 and 579 options). Law II has no 15%-volume match and uses all 3,631 exact-sentence-count windows instead. Gibran and Shakespeare are fixed independent authors; windows can overlap across trials, so this is a finite empirical source-window null, not 2,000 independent author samples. All 2,000 null-family maxima and the original-donor family maximum are zero words (add-one tail 1). Hence even relaxing the crib threshold would provide no consecutive pair. All 24 independently selected positive plants, six per historical donor, recover their exact target and source offsets after shuffling words within 2–4 spans; every plant includes a span shorter than 13 words to exercise the newly admitted domain.

No donor interval crosses the selector. The predeclared follow-on — infer one continuous eight-rune additive consuming-F key from the ordered donor rune tape and predict the next untouched source sentence — was not opened. This does not exclude H-decoy or arbitrary segmentation, source paraphrase, alternative GP spelling, source borrowing with moved punctuation, or a genuinely new authored source. It does retire these two specific source-donor transfers under the frozen inventory convention. No unknown LP2 plaintext or key.

Reproduction: [SFT](../sims/lp2_firstparty_sentence_inventory_sft.cjs) · [raw exact scan, controls, source blobs and plant offsets](lp2-firstparty-sentence-inventory-output.json). The function executed in the connected JavaScript runtime against the pinned source blobs; the standalone Node wrapper has not separately been run.
