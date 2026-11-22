# Two-symbol noninjection of the proposed 32×8 grid byte-split transducer

**Decision, 10 November 2026:** Agent5's 5+3-bit / two-residual-bit proposal, as transmitted to Agent13 at 20:01 UTC, is **not a lossless map** from GP difference-ranks to a 32-symbol output stream, even when the initial and terminal 5-bit register states are supplied. The failure is source-exact, needs no English score or original-plaintext assumptions, and holds for **all 32 starting states** in both proposed output/state splits, under both PATIENCE and physical column order. Each has a two-step collision using only nonrepeat inputs and outputs 0–28, so reserving three output codes for punctuation or specials does not repair it.

## Source and exact proposed mapping

Read the 256 original transcribed table values from `resources/liber-primus/lp2-grid-256.json`, as 32 rows of 8 decimal bytes. Source-row integrity is documented in `im-results/lp2-grid-11-original-glyph-adjudication.md`. The proposed column order is `PATIENCE=[6,5,3,0,2,4,7,1]`; the other tested choice is physical column order `[0,1,2,3,4,5,6,7]`.

Represent a nonrepeat GP29 predecessor difference by `x=4q+h` with `x=0..27`, `q=0..6`, `h=0..3`. The repeat difference is distinct `x=28` mapped to `(q,h)=(7,0)`. For current 5-bit state `s`, the selected byte is `b=T[s][column[q]]`.

* **Split A:** output `o=b>>3` and next state `s'=4*(b&7)+h`.
* **Split B:** output `o=b&31` and next state `s'=4*(b>>5)+h`.

Both emit only a five-bit output value each step. In a putative reversible cipher, the input rune differences must be uniquely reconstructible from the emitted output sequence plus recoverable initial/final state or source-defined markers. A single hidden bit-path ambiguity defeats that uniqueness.

## Original-table counterexamples

With **PATIENCE** order and initial `s=0`, split A has two distinct two-input trajectories:

| Input ranks | Step-1 byte, output, next state | Step-2 byte, output, final state |
| --- | --- | --- |
| `[12,0]` | `T[0][0]=203 → 25,12` | `T[12][6]=32 → 4,0` |
| `[13,0]` | `T[0][0]=203 → 25,13` | `T[13][6]=32 → 4,0` |

Thus **`[12,0]` and `[13,0]` both emit `[25,4]`, ending at state 0**. Both input steps are legal nonrepeat rune differences. Both output symbols belong to 0–28 and cannot be excluded by treating 29–31 as control characters.

Split B also collides from initial state 0:

| Input ranks | Step-1 byte, output, next state | Step-2 byte, output, final state |
| --- | --- | --- |
| `[4,20]` | `T[0][5]=237 → 13,28` | `T[28][4]=144 → 16,16` |
| `[6,12]` | `T[0][5]=237 → 13,30` | `T[30][0]=144 → 16,16` |

Both produce output `[13,16]` and terminal state 16. A collision of equal length and final state persists when the *same arbitrary suffix* is appended, since the decoder's subsequent state and output then agree identically. Therefore increasing a message's length or disclosing its final register does not make the mapping injective. An external per-step witness could distinguish paths, but no such source-derived side information is specified.

## Exhaustive finite certificate

Run `node sims/grid_byte_split_nonlinearity_sft.cjs` from the repository root (or any directory). The CommonJS SFT enumerates all `28²` nonrepeat two-symbol inputs per initial state for each of four models, skips all trajectories whose output includes a special code 29–31, and hashes `(output[0],output[1],finalState)`. For each of the **4 × 32** model/start-state cases it finds at least one pair of distinct inputs with identical outputs and terminal state. The SFT asserts each witness by independently executing the forward transitions.

| Split | Column order | Starting states with a collision |
| --- | --- | ---: |
| A | PATIENCE | 32/32 |
| A | physical | 32/32 |
| B | PATIENCE | 32/32 |
| B | physical | 32/32 |

No cryptanalytic plaintext was produced; no claim is made about a different injective state machine using the same table, a wider emitted alphabet, an extra authenticated witness channel, or variable-length coding. This result retires **these exact byte-split maps** as lossless native-rune inverses. A successor should first prove the exact forward transition is one-to-one for every possible plaintext segment and available side information, then fix its source origin and test original LP2 against an independent authentic solved-text control. More brute-force initial-state or language-score searches on these four maps cannot fix the information loss.
