# LP2 158-word / 158-flank-rune bridge: bounded source test

**Status:** intermediate structural observation; no plaintext or key recovered.

## Hypothesis and human solve-path rationale

LP2 p0–2 contain 158 complete printed words when parsed with the repository's canonical parseLP2Words routine, including the two red headings (156 body words). The rune-bearing flanks around the numeric table contain 66 runes on p49 and 92 on p51, also 158. A scan of every pair of nonempty LP2 pages finds **p49+p51 is the only pair** whose rune counts sum to 158. The intervening p50 page is the 32×8, 256-byte numeric table.

This makes a one-to-one relation among the p0–2 word register, the p49/p51 flank-rune stream, and the p50 table a plausible human-solver hypothesis. The 2016 signed message's words/map/numbers/direction language gives a possible conceptual prompt. The apparent 2013 COUNT ab=158 echo is known to be unrelated: it is a participant's test of the literal phrase ab, whose GP0 value is 97+61=158, not a count of LP2 words. It supplies no independent evidence for this alignment and is not a Cicada-signed instruction.

The weakest premise is the pairing itself: no first-party clue currently says to align these streams, identifies a direction/sign, or specifies how the p50 table participates. The experiment therefore freezes only the most direct source-order interpretations rather than searching arbitrary offsets or fitted transforms.

## Exact source inputs

- p0–2: 158 words, 729 runes; the first two red-heading prime sums are 347 and 315.
- p49: 66 rune indices.
- p50: 32×8 = 256 base60-derived byte entries in resources/liber-primus/lp2-grid-256.json.
- p51: 92 rune indices.
- p49 then p51, in physical order, gives a 158-rune stream. P50 contributes no rune positions.
- The 158-pair uniqueness check uses all nonempty page entries in lp2-corpus.json.

The p50 byte interpretation remains conditional: the grid resource itself distinguishes the current base60 reading from the unresolved base59 alternative. The 158 cardinality equality does not depend on that radix choice, nor is it supported by the unrelated 2013 ab=158 participant test.

## Bounded tests

The reproducer tests:

1. **One-symbol-per-word additive pad.** For each p0–2 word, compute either its GP0 sum or GP-prime sum; pair it in source order with the corresponding p49/p51 rune, represented either by GP0 index or GP-prime weight; test both additive signs modulo 29. This is the eight-combination direct family.
2. **Word-pointer direction.** Test f(i) = (wordNumber[i] ± flankNumber[i]) mod 158, using the first two red headings as the two source-derived seeds. This tests the simplest interpretation of each flank rune as a direction offset on the 158-word map.
3. **Table-mediated byte pad.** Index the p50 byte table by each word number modulo 256, then add or subtract the corresponding flank-rune value modulo 256. Test both word-number systems, both rune-number systems, and both signs.
4. **Direct table-pointer readout.** Test word number → p50 byte table → flank-rune index, and the reverse flank-rune → p50 byte table → word index, using the same base60 table reading.
5. **Two-dimensional table coordinates.** Since p50 is physically 32 rows × 8 columns, test word-number mod 32 as row with flank-number mod 8 as column, and the reverse orientation. Test GP0 and prime representations on both sides. Score the resulting 158-symbol streams with the repository's source-native LP1 trigram model and a deterministic 2,000-stream GP29 random control.

## Results

- The eight direct GP29 streams have IoC between **0.031928 and 0.037572** (uniform GP29 expectation is 1/29 ≈ 0.034483). None yields readable plaintext.
- The eight pointer-graph variants produce different cycle decompositions rather than a stable source-selected route. Depending on the number systems and sign, the cycle-length multisets are:
  - GP0 words / GP0 flanks: [1,1,16] or [16]
  - GP0 words / prime flanks: [7,8] or [1,2,6,7]
  - prime words / GP0 flanks: [1,1,8,18] or [1,2,9]
  - prime words / prime flanks: [6] or [3,4,4,12]
  These do not reproduce the separate 23-cycle or 5-cycle in the existing p0–2 word-map work.
- The eight table-mediated byte streams have printable-ASCII ratios from **0.304 to 0.437** and no coherent ASCII text. The best ratio is not a plaintext result.
- Direct word→table→flank readout selects only 27 or 29 distinct flank symbols and has IoC 0.044828 or 0.037007; it is not readable. The reverse flank→table→word readout selects only 26 or 28 distinct words, with GP0-output IoC 0.086108 or 0.060711; the repeated selections do not form a plaintext or bijective word map.
- The eight 2D coordinate readouts score from **−3.437784 to −3.389564** under the source-native trigram model. The deterministic random-control mean is −3.416493 and its 95th percentile is −3.383156; none of the candidate orientations reaches that 95th percentile. All are far below the known p57 holdout score of −2.468145. The best printable-ASCII ratio is 0.481, without readable text.
- No test recovers an address, authentic key, unknown-page plaintext, or reusable inverse.

## Decision

Preserve the 158/158/256 alignment as an **interesting, uniquely located structural coincidence**, not as a decipherment. Retire these direct additive, pointer-offset, byte-additive, direct table-pointer, and 2D coordinate consumers. Do not expand the family with arbitrary offsets, reorderings, nonlinear functions, or fitted key schedules absent a new source-visible selector.

A genuinely useful successor would need to explain, from original artifact or historically available clue, why p49/p51 pair with p0–2, which number representation is intended, and what role p50's 256 entries play. Without that, more arithmetic over this alignment risks the streetlight effect.

## Reproduction

From the repository root:

~~~sh
node sims/lp2_158_word_flank_table_bridge_sft.cjs
~~~

The script asserts the source counts and unique page-pair result, then emits all tested outputs and metrics, including the direct table-pointer and 2D coordinate readouts. The 2D score uses the existing LP1 source-native trigram model and a deterministic random control. It uses the existing sims/lp2_word_pages.cjs parser and the canonical corpus/grid resources.
