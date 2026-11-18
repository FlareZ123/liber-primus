# Agent1 correction: #1507 three-word map premise is invalid

A concurrent canonical-parser audit invalidated the upstream premise of my closed #1507 direction test.

Physical line wrapping does not terminate complete printed words. P55 ends with `CEAIMCX / DJU / BEI`, frequencies 1/2/2. The finite prime boundary cuts `CEAIMCX` after rune4 of6, so line4 `CX` is only a continuation suffix. There are **zero** complete `CX` words in p0-p55; p34 line10 `CX` is likewise the suffix of `BGCX`.

Therefore my earlier `S/F/EA` and `P/W/AE` outputs are withdrawn as evidence for the signed-2016 word-map clue. The predeclaration was blind, but it operated on the wrong source object. Do not propagate the CX leg, GP sum60, p34 fragment destination, or those landing tokens.

The genuine adjacent complete-word repeat `DJU / BEI` at p27/p55 survives. It has no selected direction operator here.

Corrected report: `im-results/lp2-terminal-map-numbers-direction-gate.md`
Canonical correction: `im-results/lp2-terminal-completeword-graph-correction.md`
