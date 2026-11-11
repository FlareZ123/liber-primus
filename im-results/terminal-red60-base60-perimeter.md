# Original 60 red runes as base60 digits for the terminal table perimeter

**Classification (11 November 2026):** original source-exact cross-clue hypothesis and six negative, fully reversible p55 inverses. No recovered unknown LP2 plaintext, authentic key, cipher or destination.

## Causal clue path

The original pages after the 32×8 numerical table display two conspicuous red spans: **51 GP runes on physical p53**, followed by **9 red runes opening physical p54**. Their physical reading order contains **exactly 60 source symbols**. The printed table has a 60-character positional numeral alphabet, `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`. This suggests a possible human-usable dictionary `red[base60Digit]` from each positional numeral digit to a GP29 key value, independently fixing the radix-60 interpretation of the printed grid.

The solved *PARABLE* refers to shedding circumferences. The table's outer 32×8 ring contains **76 printed cells**, exactly the **76 runes of the last unknown physical p55**. Using the 60 red runes as a digit-to-rune key alphabet and the perimeter as its 76-word numeric schedule is a source-motivated way to connect the full artifact. Unlike an unrestricted password sweep, the next test has no inferred plaintext, secret phrase or fitted key.

**Weakest assumptions:** the red 60-rune count alone does not instruct a specific codebook, the 60 source entries contain repeated rune values, and neither physical page directs clockwise table reading. The printed base-60 digit `f` happens to be unused in the table. We therefore test only transparent arithmetic constructions, not declare a recovered intended instruction.

## Frozen exact original inverses

Read all **76 table cells clockwise from the top-left corner**, yielding each printed token `(hi,lo)` in the base60 alphabet. Under the source-position mapping `D[k]=GP-index(red60[k])`, compute one p55 additive GP29 key rune per original table cell using three predeclared direct options:

- **Low digit:** `K=D[lo]`.
- **Digit sum:** `K=(D[hi]+D[lo]) mod29`.
- **Positional radix60 value:** `K=(2×D[hi]+D[lo]) mod29`, since `60≡2 mod29`.

Decode each original p55 GP rune under either plus or minus key mod29; all 76 output runes exactly reencrypt. An independently solved p57 76-rune plaintext excerpt also encrypts and recovers **76/76** exactly under each model.

| Key formula | Decode sign | Original 76-rune IoC |
|---|---|---:|
| Low digit | minus | 0.02947368 |
| Low digit | plus | 0.03614035 |
| Digit sum | minus | 0.02947368 |
| Digit sum | plus | **0.04105263** |
| Radix60 positional | minus | 0.03192982 |
| Radix60 positional | plus | 0.03157895 |

Unchanged p55 ciphertext IoC is **0.03789474**; authentic solved p57 GP text has IoC **0.06270997**. No candidate displays coherent prose. The highest coincidence value 0.04105 remains far from the native source and was selected from six configurations.

## Decision

A **60-rune red sequence and 60-digit numeral system** is a concrete correspondence across original ink and printed table, and the terminal **76/76** ring match supplies a further source-based possible key alignment. The six obvious byte-digit-to-rune masks fail as direct p55 decipherments. This does not rule out the red60 codebook as an input to a cryptographic or stateful mapping, different ring traversal, or non-GP register. A future attempt must find a source-visible instruction selecting such an operation before tuning exceptions or key rotations.

The [original-input, planted-positive CommonJS reproducer](../sims/terminal_red60_base60_perimeter_sft.cjs) freezes all relevant offsets, exact table bytes, base60 alphabet, circumference coordinates and six arithmetic functions. The table's historical alternative base59 reading is not tested here because this particular hypothesis **derives the digit alphabet's size from exactly 60 highlighted runes**.
