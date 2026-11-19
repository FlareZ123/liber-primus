# EA prime109 prospectively selects a unique raw XY word

**Agent30, 19 November 2026. Classification: conditionally preselected receiver with a unique raw `XY` observation; the coordinate/opcode interpretation is post-observation and remains a hypothesis. No new plaintext is claimed.**

## Discovery chronology

The current conditional p0 route derives Latin `LEAD` from solved p57 `MUST SHED`, sheds it to the inner GP rune `EA`, and observes:

```text
GP-prime(EA) = 109
```

Before opening the receiver values, the source transcription was used only to establish that p0 offset109 begins one complete two-rune word, offsets109..110. An exact additive continuation using the shed outer A1Z26 key `LD=[12,4]` was then precommitted in
[`workplace/agent30-p0-ea109-shed-lead-outerkey-precommit.md`](../workplace/agent30-p0-ea109-shed-lead-outerkey-precommit.md), commit `e7663609b611028d7a888f956d06cdc7af5643c1`.

Only after that precommit were the two original rune values opened:

```text
p0[109..110] = [14,26] = [X,Y]
```

The frozen additive test fails and remains retired; see
[`lp2-p0-ea109-shed-lead-outerkey-gate.md`](lp2-p0-ea109-shed-lead-outerkey-gate.md).
The raw receiver content itself is the new observation.

## Manuscript-wide boundary control

A canonical parser that permits words to cross physical page boundaries reproduces the established **2,896** unknown-page word count.

Among those words:

```text
complete two-rune words = 448
complete XY words       = 1
complete YX words       = 0
```

The sole complete `XY` word is at the conditionally preselected p0 receiver offsets109..110. The receiver location and two-rune extent were fixed before its values were opened; `XY` itself was not predicted.

The pair `XY` is not globally rare as a raw adjacency: it occurs 19 times among within-page adjacent unknown ciphertext runes. Its useful property is the exact **word boundary plus prospectively selected location**, rather than the rune pair by itself.

## Post-observation coordinate interpretation

The preceding conditional plaintext candidate is `ROAD`. Its already established number-direction continuation is independent of the new XY reading:

```text
ROAD GP values       = [4,3,24,23]
base29(ROAD)         = 100798
100798 mod256        = 190
one-based reception  = p50 cell189
p50[189]             = 3C
drop-f base59(3C)    = 189
```

Thus ROAD had already selected the table's unique intrinsic self-pointer.

The selected cell's fixed 32-row by 8-column geometry is:

```text
row    = 23 = p
column =  5 = g
```

After observing `XY`, one natural interpretation is Cartesian `X,Y`, with X=column and Y=row:

```text
(X,Y) = (5,23) = (g,p)
```

This is the canonical DH generator/modulus pair from the independently reconstructed p28 state.

The coordinate result is retrospective: cell189 and its `(p,g)` geometry were already known before `XY` was opened. The upstream route selected only the receiver location, not the expected `XY` token. Therefore this match is not independent evidence for 2D p50 semantics or a second authentication of the DH state.

## Why this matters

This suggests a compact coordinate reading immediately downstream of the current `THE ROAD` recovery. It also fits the manuscript's existing use of literal raw operation labels such as p28 `DH`.

The observation does not authorize arbitrary coordinate mining. It does not fix every origin convention, prove that all p50 consumers are coordinate consumers, or repair the rejected generic p50-numeral-to-LP-rune-offset output type.

A valid promotion test must freeze `X=column, Y=row` plus one coordinate consequence on an independent source-selected p50 object before opening its receiver. Reusing the observed token to search broadly for coordinate coincidences is explicitly excluded.

## Reproduction

Run:

`node sims/lp2_p0_ea109_raw_xy_coordinate_opcode_sft.cjs`

The SFT reconstructs the 2,896-word canonical unknown corpus, verifies that p0[109..110] is the sole complete unknown-page `XY` word, charges the reverse `YX` control, counts all raw XY adjacencies, and reproduces the ROAD -> cell189 -> Cartesian `(g,p)` consequence.
