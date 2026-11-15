# Five-bit rune plus three-bit direction: an independent numeric-grid decoding route

**Agent 6, 15 November 2026. Evidence class: original-source, finite competing decoder architecture; no plaintext or authenticated key.** The original numeric grid on physical LP2 pp49–51 has 32 rows and eight columns, containing exactly 256 two-character conventional base60 tokens. The 2016 signed message mentions words, numbers and direction. An eight-bit table admits a mechanically simple operation independent of the earlier analyst-defined `29q+r` / nine-keypad proposal: **five bits for a GP29 rune and three bits for one of eight neighboring compass directions**. A five-bit register has three spare states, which must remain *unassigned controls* until an original source gives them a meaning.

This is a complete, cheap test of the table as a **direct finite-state navigation/key generator**, not a claim that Cicada intended bit packing. No source prescribes binary splitting, how the three spare states act, which compass direction is first, or whether the table wraps at its edges. The original repeated botanical border includes groups of five dots, but those are reused identical decoration on all three numeric pages; their appearance cannot authenticate the proposed bitfield operation. The 32×8 table dimensions provide the substantive source clue.

## A source-selected entry, before reading any outputs

An independently original-visible four-rune `GEMY` appears in physical LP2 p48, zero-based rune offsets139–142, immediately before the table. Taking the published GP prime of its final Y gives **103**, so one-based table cell103 is an available *candidate* initial state. The cell's literal token `0W` has canonical base60 byte value **32**. This pointer and its limitations are already documented in [the existing original p48/table report](lp2-p50-directional-functional-graph-prime-ordinal-starts.md); the new test leaves it unchanged.

For the raw byte `B`, test exactly two bit-order conventions:

- **A:** GP label `B >> 3` (five most significant bits); direction `B & 7` (three least significant bits).
- **B:** GP label `B & 31` (five least significant bits); direction `B >> 5` (three most significant bits).

Rune labels 0–28 follow the original 2013 GP rune order. Labels **29–31 are explicit unresolved controls**, never reduced modulo29 or quietly replaced with English letters. Compass directions are the eight neighboring grid offsets N, NE, E, SE, S, SW, W, NW. To avoid selecting an attractive orientation after the fact, the experiment includes all **eight rotations**, both clockwise/counterclockwise orientations and either **no wrap at the physical table edge** or **toroidal row/column wrap**. For each variant, follow its uniquely determined path until it first revisits a cell or exits the physical grid.

The only purpose of the full 256-start census is to determine whether this finite graph is even capable of supplying a long, nonrepeating key from *some* start. It does not search for a favorable English-looking start.

## Exact original-byte results

| Original 32×8 graph family | Total variants | Longest distinct-cell path from any of 256 starts | Minimum to maximum distinct cells from frozen cell103 |
| --- | ---: | ---: | ---: |
| Stop at physical edge | 32 | **19** | **2–13** |
| Wrap row and column | 32 | **24** | **2–13** |

With the most literal N=0, NE=1, ..., NW=7 clockwise direction chart, physical edges and source start103, the complete table paths are:

| Bit packing | One-based visited cells | Original GP rune readout | Stop condition |
| --- | --- | --- | --- |
| A, high-five rune | 103→95→87→78→70→63→71→64 | **R W P E N S NG G** | Exits grid |
| B, low-five rune | 103→96 | **F O** | Exits grid |

The full input stream has **25** bytes with reserved high-five rune labels29–31 under A, and **16** with reserved low-five labels under B. These unassigned outputs reinforce that the five-bit alphabet is not a complete GP29 decoder without an additional first-party rule.

Across **64 graph conventions × 256 starts**, no direct walk visits even 25 distinct cells before it terminates or cycles. The p48-suggested one-based cell103 visits at most13. Thus **no such one-pass route can supply 76 distinct table positions for the complete 76-rune p55 ciphertext**, irrespective of the direction rotation, handedness, or edge treatment. A *repeating* short-cycle keystream is mathematically possible; this study does not claim to rule it out, because no source gives a key-consumption clock, GP combination rule or plaintext target.

The natural binary alternative does not replicate the `GEM` three-cycle previously obtained by the *different* `29q+r` keypad interpretation. That difference matters: the table dimensions and signed message do not uniquely choose the latter graph. It is unsafe to treat one appealing three-rune loop as proof of a particular original table opcode.

## Research decision

The source-motivated 5+3-bit operation is **computationally complete as a direct, one-pass numeral-table path**, and it yields neither unknown plaintext nor a complete key. Retain it as a rival way to interpret 32×8/GP29/eight directions; do not spawn arbitrary secret start, compass, padding or reroute searches. An independently visible page instruction defining a control code or a source-selected continuation rule could justify reopening it. The broader central objective remains recovering an authentic original unknown-page inverse and its key.

**Reproducer:** [read-only Node22/CommonJS SFT](../sims/lp2_p50_packed_5plus3_compass_sft.cjs) asserts the untouched source `lp2-corpus.json`, `base60-grid.json`, p48 prime103 pointer, all 64 graph families, every original cell start, path-length maxima, exact default routes and both spare-code counts. The underlying table byte source was independently verified against all 256 original printed tokens in [the existing source report](lp2-p50-directional-functional-graph-prime-ordinal-starts.md). This report intentionally does not alter the authoritative `results/README.md` because no manuscript plaintext, cipher key or confirmed author instruction was discovered.
