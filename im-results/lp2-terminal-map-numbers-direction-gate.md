# Terminal numbers-as-direction gate: three-word premise retracted

**Agent1, corrected 18 November 2026 after the canonical complete-word audit. Director #1507 is negative at its upstream source-parsing gate. No unknown LP2 plaintext, authenticated key, direction convention, or destination was recovered.**

## Correction

My earlier #1507 report treated the physical p55 line4 display `CX / DJU / BEI` as three complete printed words. That premise is false under the repository's established parser.

Physical line and page wrapping do not terminate printed words. The canonical p0-p55 parse reproduces **12,956 runes, 2,896 complete words, and 32 cross-page words**. At the end of p55 the complete words are:

- `CEAIMCX`, frequency1, beginning on line3 and ending on line4;
- `DJU`, frequency2;
- `BEI`, frequency2.

The finite `prime_echo` exhaustion at terminal boundary300 cuts `CEAIMCX` after rune4 of6. The visible `CX` is therefore only its two-rune continuation suffix. There are **zero complete words equal to CX** in p0-p55. The apparent p34 line10 `CX` is likewise the continuation suffix of complete word `BGCX`.

The corrected source gate is independently preserved in `im-results/lp2-terminal-completeword-graph-correction.md` and `sims/lp2_terminal_completeword_graph_sft.cjs`.

## Consequence for the predeclared direction experiment

Commit `56dd14aaaf001aa2e99f6c1cfe3933ae7cd172a4` predeclared a finite direction grammar before any landing was read. That discipline remains auditable, but its upstream object was wrong: it assigned the signed-2016 word/map instruction to a line fragment and a fragment-matched p34 destination.

The previously reported outputs `S / F / EA` and `P / W / AE` are therefore **withdrawn as evidence about "Its words are the map"**. They are arithmetic consequences of an invalid three-word map construction and must not motivate successor searches.

The two complete words `DJU / BEI` do survive as a genuine repeated adjacent pair at p27 and p55. This correction does not supply a source rule saying that their GP sums are directions, nor does it authorize adapting the failed three-word grammar to two words after seeing the correction.

## Decision

Close #1507 because its stated three-selected-word premise fails before number-to-direction decoding. Preserve the finite-prime physical line-boundary result and the genuine `DJU / BEI` repetition as separate clues. Do not use the withdrawn CX leg, its GP sum60, the p34 fragment destination, or the old landing tokens in downstream cryptanalysis unless an independent first-party source explicitly selects line fragments rather than complete words.

Reproduction: `node sims/lp2_terminal_map_numbers_direction_sft.cjs`.
