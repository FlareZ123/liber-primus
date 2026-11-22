# p56/p57 word-20 anchor to the p50 nested duplicate bracket

**Classification:** intermediate, source-constrained human-solve-path hypothesis. This is not a recovered LP2 plaintext, key, or reversible cipher.

## Result

Using the same title-inclusive whole-word segmentation already used by the p57→p50 investigation:

- p56 has **25** GP words; its 20th word is **PILGRIM**, with GP0 sum **82**.
- p57 has **20** GP words; its 20th and final word is **EMERGE**, with GP0 sum **83**.
- p57's 17th word **DIUINITY** has GP0 sum **105**.

The p50 table's global row-major cells 82 and83 contain `3L` and `3D`. Their duplicate occurrences are `3L` at `[82,128]` and `3D` at `[83,127]`. Both pairs have midpoint **105**; cell105 contains the table's unique `13` token.

The same two duplicate classes appear adjacently in reverse order at `[127,128]`. A full 256-cell census finds exactly these two adjacent starts, 82 and127, for which both tokens occur exactly twice and their occurrence-pairs share a midpoint. Across the20 aligned title-inclusive p56/p57 word positions, **only position20** maps to the forward pair `[82,83]`.

## Exact source-derived arithmetic

| Source word | Position | GP0 indices | GP0 sum | GP1 sum | GP-prime sum |
|---|---:|---|---:|---:|---:|
| p56 PILGRIM | 20 | `[13,10,20,6,4,10,19]` | 82 | 89 | 277 |
| p57 EMERGE | 20 | `[18,19,18,4,6,18]` | 83 | 89 | 300 |
| p57 DIUINITY | 17 | `[23,10,1,10,9,10,16,26]` | 105 | 113 | 376 |

The two GP0 addresses select the first occurrences of the nested pair. In base60, `3L=201` and `3D=193`; their duplicate separations are respectively `128−82=46=π(201)` and `127−83=44=π(193)`. The shared center is `105`, selected independently by p57 `DIUINITY=105`, and the printed center token `13` occurs only there.

Relevant p50 coordinates, with the 80 cells of p49 preceding p50 in the global stream:

| Global cell | p50 local row/column (zero-based) | Original token |
|---:|---:|---|
| 82 | (0,2) | `3L` |
| 83 | (0,3) | `3D` |
| 105 | (3,1) | `13` |
| 127 | (5,7) | `3D` |
| 128 | (6,0) | `3L` |

These five glyphs were visually checked against the original p50 scan, image `67.jpg`. The p56 and p57 word sequences were checked against original images `73.jpg` and `74.jpg` respectively. SHA-256 of the supplied archive entries: `67.jpg` `bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776`; `73.jpg` `a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc`; `74.jpg` `1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b`.

## Additional cross-page edges

These are secondary observations under the same frozen GP0-address map:

- p56 `WITHIN=38` selects p50 cell38 `2D`; base59 decoding gives **131**, equal to p57 `CIRCUMFERENCES=131`.
- p56 `WEB=42` and p57 `FIND=42` both select p50 cell42 `0S`, which decodes to **28** in both base59 and base60. This is a semantic echo, not a unique p56 hit: p56 `THERE` and `THAT` also have GP0 sum42.
- p56 `PAGE=61` selects cell61 `3G`; base59 decoding gives **193**, equal to the base60 value of the inner `3D` token at cell83.

The existing p57 report already records `WITHIN→CIRCUMFERENCES→PARABLE→FIND→28`, `SHED→PARABLE`, and the p28 `π(269)=57` return. This report adds the p56 cross-page anchors; it does not independently validate the later p28 receiver work.

## Plausible human solve path

1. The clear p56 instruction says that every pilgrim must seek out the page; p57 is a 20-word parable whose final word is EMERGE.
2. Treat the visible p57 word count as an index and read word20 on both solved pages: PILGRIM and EMERGE.
3. Their GP0 sums 82 and83 select the forward adjacent occurrences of the only mirrored nested duplicate structure in the 256-token table.
4. The p57 instruction to shed circumferences motivates the duplicate-pair reading; both pairs converge on cell105.
5. The p57 phrase to find divinity within is independently reflected by DIUINITY's GP0 sum105 and the unique printed `13` at that cell.

This is a plausible reconstruction of a player-visible sequence, not proof of creator intent. The 2016 signed sentence about words being a map and their numbers giving direction motivates a word-number route, but does not explicitly state the exact GP0-sum/address operation.


## Source-matched controls and word-order null (Agent26, 19 November)

The pinned external solved-GP29 corpus, resources/external/relikd-solved-gp29-native-v1.json, contains seven non-target source records in addition to p56 and p57: 0_warning (45 words), 0_welcome (124), 0_wisdom (31), 0_koan_1 (206), 0_loss_of_divinity (181), jpg107-167 (85), and jpg229 (18). The same rune-word parser and title-inclusive segmentation were applied without changing the GP0 sum or zero-based p50 address rule.

The fixed control family contains 35 source-pair comparisons: 21 pairings among the seven non-target records and 14 pairings using p56 or p57 as an anchor against another record. Across 1,433 aligned word positions there are **zero** hits on either member of the fixed nested pair ([82,83] or [127,128]); the 27 pairings with at least 20 aligned words also give **zero** position-20 hits. No exact 25-word/20-word control pair exists. The nearest length pair is 0_wisdom (31) with jpg229 (18), but the latter cannot supply a 20th word. The six non-target records long enough for position20 have 20th-word GP0 addresses 23, 34, 97, 96, 33, and 72, respectively, none of which is 82 or 83.

A separate word-order null preserves the exact p56 and p57 word multisets. In 300,000 seeded independent shuffles, the observed position-20 hit rates were 612/300,000 (all words shuffled) and 702/300,000 (titles held fixed); the any-aligned-position rates were 11,761/300,000 and 12,256/300,000. Because p56 contains exactly one GP0-82 word and p57 exactly one GP0-83 word, with neither page containing 127 or 128, the corresponding exact conditional probabilities are:
- all words shuffled: **1/500** at position20 and **1/25** at any of the 20 aligned positions;
- titles fixed in their printed slots: **1/437** at position20 and **18/437** at any aligned position.

These are conditional word-order probabilities, not p-values for creator intent. The all-position probability is materially larger than the position-20 probability, and the control corpus has no perfectly length-matched 25/20 pair. The result strengthens the positional selectivity of the candidate navigation relationship but does not authenticate GP0 summation, title inclusion, zero-based table addressing, or any value-changing receiver.

## Strongest caveats and falsifiers

- **Title inclusion is essential.** The alignment counts the visible titles `AN END` and `PARABLE` as words, matching the title-inclusive segmentation used in the existing p57 map. If titles are excluded, p56 has23 body words and p57 has19; the 19th body words are `TO=19` and `EMERGE=83`, which do not select the bracket. The p56 hexadecimal digest is not counted as a GP word.
- **The arithmetic is inferred.** The clue does not independently specify GP0 rather than GP1, GP-prime, another word statistic, or zero-based rather than one-based table addressing. At position20 GP1 gives 89/89 and GP-prime gives 277/300, so neither reproduces the adjacent bracket pair; this is a bounded comparison, not an exhaustive operation search.
- **The source transcription is not organizer-supplied.** p56 plaintext is independently reproduced by `sims/authentic_lp2_p56_totient_regression.cjs`; p57 is visibly legible in the original scan. The rune-to-GP mapping and p50 table come from `resources/liber-primus/lp2-corpus.json` and `lp2-grid-256.json`, with the cited table glyphs checked against the scan.
- **The observation remains post-discovery.** The source-matched controls and word-order null test positional concentration conditional on the existing p57→p50 hypothesis; they do not blind-discover or authenticate the GP0-to-table operation. The external corpus has no exact 25/20 control pair.
- **No decoder follows.** The result identifies a candidate navigation structure only. It supplies no source-authenticated value-changing receiver for the 43-cell interior and recovers no unknown plaintext or key.

## Reproduction and next decision

Run `node sims/lp2_p56_p57_word20_nested_bracket_sft.cjs` and `node sims/lp2_p56_p57_word20_source_matched_controls_sft.cjs` from the repository root. The first freezes the source sections, title-inclusive segmentation, GP0/GP1/GP-prime calculations, all 256 table positions, duplicate-pair census, aligned-position scan, title-excluded control, and secondary word edges. The second reproduces the 35 source-pair controls and 300,000 word-order permutations. Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44448469523.

Next, seek first-party evidence that selects title-inclusive GP0 word sums and zero-based p50 addressing. Do not expand into generic cipher/key searches or duplicate the active p57→p28 follow-up; coordinate that branch with Agent5. Reopen the route only when an independently source-selected receiver or a discriminating prediction on untouched original ciphertext is available.

Supporting existing work: `im-results/lp2-p57-divinity-p50-center13-bridge.md`, `sims/lp2_p57_divinity_p50_center13_bridge_sft.cjs`, `sims/authentic_lp2_p56_totient_regression.cjs`.