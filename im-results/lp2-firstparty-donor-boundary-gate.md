# First-party source-text boundary donor test: bounded negative

**Decision:** no qualifying donor-boundary crib was found. No spacing-free cipher inverse was run because the donor gate failed.

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
