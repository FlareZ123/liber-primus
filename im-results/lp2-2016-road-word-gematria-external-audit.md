# Independent L3-ROAD word-gematria audit: historical nulls, superseded segmentation

## Scope

An independent study in `Dukotah/cicada3301`, Round 10 lane L3-ROAD, directly tests numeric readings of the 2016 signed clause “the map, their meaning is the road, and their numbers are the direction.”

The original Round 10 study parses 2,928 words / 12,956 runes and uses a word-length-preserving shuffled-stream null. It is a useful pre-registered historical experiment, but **its word segmentation is superseded by later work in the same external repository**. The pinned source and all later corrections are indexed in [resources/external/dukotah-cicada3301-round10-l3-road.md](../resources/external/dukotah-cicada3301-round10-l3-road.md).

## What the historical study did well

The study separated several plain-English interpretations rather than tuning one decoder:

- T1: per-word and sentence/line/page gematria sums as marked numbers or checksums.
- T2: reduce each word sum to one rune.
- T3: use arithmetic predicates on word sums to select whole words or boundary runes.
- T4: sort words by gematria as a reading path.
- T5: use word sums as pointers into candidate key texts (explicitly low-prior / confirmatory).

Its null shuffles the rune stream and re-cuts it into the same word-length sequence. A synthetic validation gate passes: the planted T2 sum-mod-29 decoder recovers 99.76% of held-out symbols, and the planted T3 selector reaches z=79.7. The pre-registration records an amendment to the absolute-score threshold after calibration and before the real LP2 tests: retain an absolute readability bar and require z ≥ 8 against the same reading family on matched shuffled corpora.

This validates power for the declared synthetic families and segmentation. It does **not** validate that the declared segmentation is the correct plaintext grouping.

## Historical Round 10 results

Under the original 2,928-word parse:

- **T1a word sums:** no statistic meets its signal rule. Prime fraction z = 0.21 (p = 0.841); emirp z = -1.017; s+1-prime z = 0.476; gematria-prime z = -0.405.
- **T1b group sums:** sentence prime-rate z = 0.668; line and page results are also null. Some sentence sums equal Cicada constants (157, 1033, 3203), but the observed hit count is only z = 2.607.
- **T2/T3:** 208 readings; every reading has `HIT=false`; maximum reported z = 3.02, below the amended z ≥ 8 criterion, with scores below the absolute readability bar.
- **T4 word ordering:** no tested order hit. The study's own controls show that wrong orders of genuinely English words can retain within-word n-grams, so order scores need careful interpretation.
- **T5 book-like pointers:** 30 confirmatory readings are null and remain below the readability bar.
- **T6 solved-plaintext control:** 270 words / 959 runes of solved plaintext do not show significant prime/gematria marking. Apparent emirp (z = 3.265) and s+1-prime (z = 2.778) excesses are not authorial signals under the ordinary-English controls: 5.0% and 15.8% of those controls, respectively, reach comparable z values. The author's published sentence sums include composites.

## Later corrections that change the interpretation

The same external repository's later rounds materially qualify the word-indexed nulls:

1. **Round 45:** twelve order tests with intact English controls found that LP2's printed word breaks are not the plaintext's words in order at any tested scale. LP2's order statistic was z = -1.2, versus solved-page controls around +7.5. The best description was an English-like length multiset over a contiguous rune stream, with order destroyed or lengths drawn from another text. This makes a literal reading of the printed word sequence as the road suspect.
2. **Round 46:** the correct printed-word loader gives **2,896 words**, not 2,928. It joins 420 wrapping words (388 across lines, 32 across pages). The old 2,928-word loaders made 32 extra cuts at page-wrap boundaries. The L3-ROAD word sums and selectors therefore use a superseded segmentation.
3. **Round 47:** for bounded word-indexed key families, the (b′) loss can be a decoder limitation rather than an information barrier. With an unknown key from a 65,536-key family, ranking plus an arrangement-aware beam recovers 78–88/100. Older word-indexed negatives are qualified pending re-adjudication with the corrected loader and an arrangement-aware decoder.

The T6 solved-plaintext control is independent of LP2's segmentation, but its conclusion remains limited to that control corpus and its English controls.

## Current decision

**Do not treat the Round 10 L3-ROAD word-indexed nulls as a current closure** of word-gematria, word-selector, ordering, or book-pointer readings. They are useful historical, calibrated tests of specific operations on a now-superseded parse. A serious revisit must use the 2,896-word loader and address the arrangement/decoder caveat; it must also keep the pre-registered operation and controls fixed.

The external work does not establish a semantic road, recover plaintext, or provide a key. It also does not rule out semantic guidance after plaintext is recovered or a source-fixed external pointer. No independent rerun of the external code has been performed in this repository.
