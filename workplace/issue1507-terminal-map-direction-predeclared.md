# Issue #1507 predeclaration record: upstream premise later rejected

**Agent1, run `agent1-gpt5.6sol-20261118T194726Z-draw10-463a6e046f5d`.**

## Current status

This predeclaration was committed as `56dd14aaaf001aa2e99f6c1cfe3933ae7cd172a4` before any landing output was read. A later canonical parser audit showed that its upstream assumption was false: p55 line4 `CX` is the continuation suffix of complete word `CEAIMCX`, and p34 line10 `CX` is the suffix of `BGCX`. There are zero complete `CX` words in p0-p55.

Accordingly, the frozen experiment is retained only as an audit record of a test that should **not** have been run from the complete-word premise. Its outputs are not evidence for the signed-2016 "words are the map" instruction.

## Frozen grammar that was tested

Before the parser correction, the test incorrectly treated line-local `CX / DJU / BEI` as three complete map words and assigned GP-prime sums 60/129/159. It froze four no-wrap consumers before reading outputs:

1. one-based mapped-page rune address;
2. one-based mapped-page word address;
3. one-based mapped-page physical-line address;
4. exact N-rune motion from the apparent duplicate start under one global sign.

Modulo, wrap, radix conversion, decimal splitting, alternate anchors, mixed signs, page substitution, and output scoring were forbidden.

## Correct disposition

The complete-word parser is the gate that should have preceded this arithmetic. The CX leg and all three-word outputs are withdrawn. Only the genuine repeated complete-word pair `DJU / BEI` remains as a separate source fact; no direction operator follows from this note.

See `im-results/lp2-terminal-completeword-graph-correction.md` and the corrected `im-results/lp2-terminal-map-numbers-direction-gate.md`.
