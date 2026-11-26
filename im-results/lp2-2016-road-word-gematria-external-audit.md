# Independent audit of the 2016 “map / road / direction” word-gematria reading

## Scope

An independent study in `Dukotah/cicada3301`, Round 10 lane L3-ROAD, directly tests whether the 2016 signed clause selects LP2 words or a reading order through per-word gematria. The study parses 2,928 words / 12,956 runes and preserves the exact word-length sequence in its shuffled-stream null.

Pinned source and code links are indexed in [resources/external/dukotah-cicada3301-round10-l3-road.md](../resources/external/dukotah-cicada3301-round10-l3-road.md). This is an external result; it has not been independently rerun in this repository. I inspected the pre-registration, main implementation, synthetic gate, results JSON, and solved-plaintext control implementation.

## Method quality

The study separates several plain-English interpretations rather than tuning one decoder:

- T1: per-word and sentence/line/page gematria sums as marked numbers or checksums.
- T2: reduce each word sum to one rune.
- T3: use arithmetic predicates on word sums to select whole words or boundary runes.
- T4: sort words by gematria as a reading path.
- T5: use word sums as pointers into candidate key texts (explicitly low-prior / confirmatory).

Its null shuffles the 12,956-rune stream and re-cuts it into the identical 2,928-word length sequence. This preserves the rune multiset and word lengths while destroying per-word arithmetic. A synthetic validation gate is run before LP2 tests. The pre-registration records that the first absolute-score threshold was dilution-fragile and amends the decision rule before the real tests: retain an absolute readability bar and require z ≥ 8 against the same reading family on matched shuffled corpora.

The code confirms the declared 2,928-word / 12,956-rune parse, implements the word-boundary-preserving null, and runs the pre-registered families. The gate output reports PASS. This supports interpreting the reported nulls for these specific families; it does not validate unrelated cipher hypotheses.

## Results

- **T1a word sums:** no statistic meets its signal rule. Prime fraction z = 0.21 (p = 0.841); emirp z = -1.017; s+1-prime z = 0.476; gematria-prime z = -0.405. No per-word arithmetic marker is supported.
- **T1b group sums:** sentence prime-rate z = 0.668; line and page results are also null. Some sentence sums equal Cicada constants (157, 1033, 3203), but the observed hit count is only z = 2.607 and is not a signal.
- **T2/T3:** 208 readings are tested. Every reading has `HIT=false`; the largest reported z is 3.02, below the amended z ≥ 8 criterion, and the scores remain far below the absolute readability bar.
- **T4 word ordering:** tested orders are null. The study's synthetic gate shows that a wrong order of genuinely English words can still score relatively well because within-word n-grams survive; however, the identity-order LP2 stream itself scores -16.685, so the observed words are not English words merely scrambled by one of the tested gematria orders.
- **T5 book-like pointers:** 30 confirmatory readings are null and remain below the readability bar.
- **T6 source control:** 270 words / 959 runes of solved plaintext do not show significant prime/gematria marking. An apparent emirp excess (z = 3.265) and s+1-prime excess (z = 2.778) are not authorial signals under the ordinary-English controls: 5.0% and 15.8% of those controls, respectively, reach comparable z values. The author's own published sentence sums include composites, so primality was not enforced on those sums.

## Decision

This independently retires the tested **word-sum arithmetic** readings of “their meaning is the road”: word sums as prime-like markers/checksums, word-sum-to-rune reductions, arithmetic word selectors, gematria-sorted word order, and the tested book-pointer family. Do not duplicate these sweeps in the current repository without a new source-selected operation.

The study does **not** rule out the plain-English interpretation that word meaning guides a solver *after* plaintext is recovered; its authors correctly classify that as unfalsifiable from ciphertext alone. It also does not rule out a specific external resource with an independently fixed indexing rule, or any unrelated cipher mechanism. It gives no LP2 plaintext and no key.

## Research consequence

The next useful route must first recover authentic plaintext/key material or identify a concrete source-selected decoding operation. Reinterpreting the 2016 sentence as an unconstrained semantic dictionary, word-sum lookup, or gematria ordering is not a productive next step.

