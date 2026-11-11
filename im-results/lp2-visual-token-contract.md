# LP2 source-visible word-token contract: 2,896 words selected

**Decision:** the unsolved LP2 source-visible token contract is **12,956 runes in 2,896 words**. The proposed 2,900-token alternative came from four alleged internal dots that are absent from the correct original page scans. No unknown plaintext is recovered by this audit. Its value is to remove a false indexing fork before future word-map work.

## Source correction

The original-image archive contains LP1 material before LP2. For LP2, physical page N is archive scan **N+17**. This mapping is already documented in the transcription provenance and implemented by the repository's image-audit tooling.

The earlier four-dot morphology report inspected archive files `04.jpg`, `21.jpg`, `35.jpg` and `41.jpg` as though those filenames were LP2 physical pages. The disputed LP2 pp4, 21, 35 and 41 are actually scans **21, 38, 52 and 58**.

The four derived rune cuts and their canonical words are:

| LP2 page | Global rune cut | Canonical word | Historical synthetic split |
| ---: | ---: | --- | --- |
| 4 | 1,110 | `ᛗᛉᛁᚹ` | `ᛗᛉᛁ` + `ᚹ` |
| 21 | 5,138 | `ᚫᚩᚣ` | `ᚫᚩ` + `ᚣ` |
| 35 | 8,515 | `ᛈᛖᛏ` | `ᛈᛖ` + `ᛏ` |
| 41 | 10,089 | `ᛉᛚᛄᚳ` | `ᛉᛚᛄ` + `ᚳ` |

On the correct original-image lines, the frozen separator-sized component criterion finds **6, 4, 7 and 5** detached square components. Each total is fully accounted for by punctuation already represented in the canonical transcription: one component per ordinary word separator and four components per four-dot stop. There is no additional separator-sized component at any disputed cut.

The current canonical transcription and the preserved 2017 KrisoYotam transcription both place adjacent rune characters at all four cuts, with no intervening punctuation.

## Reproduction contract

[`sims/lp2_visual_token_contract_sft.py`](../sims/lp2_visual_token_contract_sft.py) verifies all of the following from repository sources:

- the four physical-page to archive-scan mappings;
- SHA-256 identity of each inspected original JPEG against `SHA256SUMS.txt`;
- 12,956 unsolved runes and 2,896 canonical words;
- the exact four global/local rune cuts and canonical words;
- absence of a transcript character at each cut in both current and 2017 transcriptions;
- the complete detached-square component count on each target source line.

The image criterion matches the repository's existing punctuation audit: dark connected components 6–12 px wide and high, area 40–130 px, within a frozen native-image crop. The target-line counts exactly equal canonical punctuation counts, so no extra source separator remains to support the four splits.

## Exact indexing consequence

The rejected 2,900-token construction would have inserted one extra token after zero-based canonical word indices **242, 1158, 1912 and 2265**. Under that artificial contract, later global token ordinals would shift by +1, +2, +3 and +4 across those four boundaries.

Since the four source splits are absent, those shifts are not part of the manuscript. Existing consumers of `parseSharedCorpus()` retain the 2,896-word sequence without a dual-tokenization branch.

Specific research consequences:

- `lp2_plaintext_wordsum_progressive_sft.cjs` may keep its all-word 2,896-token contract; the previously raised four-split sensitivity concern is resolved.
- `lp2_word_prime_difference_affine_gate.cjs` remains unchanged. Its reported long-word filters were already insensitive to the four short candidate words.
- Absolute word-address proposals based on the 2016 signed clue should use the existing canonical source parser unless an independent source instruction supplies a different boundary rule.
- The 2,900-token / 87-singleton arithmetic in `apostrophe_quote_29_accounting.md` is retained only as a synthetic historical construction.
- The four-hole 32×405 clock loses its source selector. Its old inverse tests remain reproducible finite negatives under artificially inserted gaps, while the branch itself should be retired.

## Decision for future work

Treat **2,896** as the selected source-visible unsolved-LP2 word count. Do not rerun word-index hypotheses under 2,900. Any future claim that introduces an internal boundary at one of these four rune cuts must provide new independent source evidence for that boundary.
