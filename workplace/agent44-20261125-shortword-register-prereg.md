# Pre-registration: GP29 short-word frequency across medieval language controls

**Agent44, 25 November 2026.** This is a descriptive source-register comparison, not a cipher attack and not a language-identification claim.

## Motivation and hypothesis

The external Round45 W1 analysis reports that LP2's printed-group length multiset is broadly English-shaped but has a post-hoc low fraction of two-rune groups (15.5%, versus at least 19.7% in its 480 English windows and 24.1% in its solved-page reference). The exact GP29 alphabet is Anglo-Saxon-runic, so Old English is a source-motivated control; Old Norse, Middle Welsh and Latin are pre-existing medieval controls in this repository. The test asks only whether those already-pinned registers naturally produce a two-rune-group fraction near LP2's.

## Frozen inputs and normalization

Use only the already-versioned local fixtures:

- resources/control/beowulf_oe_gp_profile_corrected.json (source-native Old English; corrected fixture, not the retained legacy profile);
- resources/control/havamal_old_norse_source.txt (pinned Old Norse Hávamál);
- resources/control/pwyll_pendeuic_dyuet_welsh_source.txt (pinned Middle Welsh Pwyll);
- resources/control/latin-vulgate-gp-wholewords.txt (word-preserving GP29 Latin Vulgate);
- LP2 target: first 55 physical LP2 pages from resources/lp2-transcription.txt, using the repository's printed-word segmentation (separator ends a group; /, % and whitespace may continue a rune word, as in sims/lp2_nonenglish_register_bounds_sft.cjs).

For Welsh and Norse, use the exact reversible spelling normalization and longest-match GP29 encoder in sims/lp2_nonenglish_register_bounds_sft.cjs. For Beowulf and Latin, use the precomputed source-native GP29 word lengths / tokens without re-encoding. Do not add languages, change transliteration, discard short words, or normalize word boundaries after seeing results.

## Sole primary statistic

For each source, compute f2 = N(GP29 word length = 2) / N(GP29 words). For sources longer than 2,896 words, also report the full range and 5th/50th/95th percentiles over every contiguous 2,896-word window (overlapping windows are descriptive, not independent). If shorter, report the whole source only. Report corpus sizes and excluded/non-encodable tokens.

## Interpretation frozen in advance

- This is post-hoc relative to the discovery of LP2's 15.5% value. Report descriptive compatibility only; do not attach a confirmatory p-value or call a matching register a hit.
- A match means only that the language's word-length profile does not contradict the observed fraction. It does not identify the plaintext, key, source text, or whether LP2's printed groups are real plaintext words.
- A mismatch does not exclude the language: the cipher may use H-decoy segmentation, a different orthographic convention, or another source.
- No follow-up language or normalization sweep is authorized by this test. Any further test needs an independent manuscript clue that selects the language or orthographic convention.

## Decisive value

The experiment is useful only if it materially changes the next decision: e.g. a source-motivated medieval register has a distinctly LP2-like short-word rate while English controls do not, or all existing medieval controls differ so the 15.5% observation remains a segmentation clue rather than a language lead. It cannot decrypt a page by itself.
