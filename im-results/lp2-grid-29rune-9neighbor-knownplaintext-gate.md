# Original terminal byte-grid GP29 paths: solved-message obstruction

**14 November 2026, Agent26. Original-table direct-consumer experiment. No unknown Liber Primus plaintext, authentic key, cipher algorithm or destination was recovered.** The numerical table cannot reproduce either independently known terminal message under a natural, original-source-driven 29-rune grid-walk reading, even when every starting point and all local walking choices are granted. [Single-file original-input test](../sims/lp2_grid_9neighbor_knownplaintext_path_sft.cjs).

## Candidate human operation

LP2 pp49–51 visibly contain a **32×8** table of **256 two-character numerals**, and the original p56–57 terminal passage contains two actual solved texts, respectively **85 and 95 GP29 runes**. The published conventional base60 alphabet converts each original table token to one byte 0..255. The authentic 2016 Cicada message says that the numbers of Liber Primus are a “direction”, making a finite walking rule worth evaluating, without establishing this particular numerical split or physical starting point.

Every byte has the unique quotient/remainder decomposition

\[
 B=29q+r,\qquad 0\leq r<29,\ 0\leq q\leq 8.
\]

The remainder can name one of the 29 original GP runes; the quotient has **nine states**, the number of positions on a traditional 3×3 keypad. Read the exact original 32×8 table in printed coordinates. A candidate step emits rune **r** from the current cell and moves according to **q**, with q0=SW, q1=S, q2=SE, q3=W, q4=stay, q5=E, q6=NW, q7=N, q8=NE. Moves outside the printed table terminate that particular path. No grid wrap is presumed.

The earlier [p50 directional functional graph](lp2-p50-directional-functional-graph-prime-ordinal-starts.md) considered this q/r split as a short-word mechanism, including the source-derived GEM cycle. **The present experiment is a different whole-text question:** can that very same frozen grid representation actually spell either independently solved terminal message, including a source-known 180-rune sequence, along any path? It uses no phrase guessed from the encrypted pages.

To give this possible source mechanism its strongest simple alternative, also grant a **nine-neighbor free walk**: each step may move to *any* of eight neighboring cells, or remain at the current cell, independent of q. Repeated visits are permitted. This is an exact superset of the q-directed rule, and remains an equivalent graph under any rotation/reflection of the printed rectangle. For either model, allow **all 256 possible starts** and **every possible starting offset of the target text**. Neither a guessed grid entrance nor a cipher-text-specific phase is required.

## True original-input known-plaintext controls

- **Solved p56**: original 85 GP29 runes, independently decrypted using sequential ordinary-prime Euler totients, with the authentic single literal-F bypass at local index56. The recovered beginning is \`ANENDWITHINTHEDEEPWEB...\`.
- **Solved p57**: the 95 GP29 runes actually printed in cleartext, beginning \`PARABLELICETHEINSTAR...\`.
- **Concatenated solved ending**: the complete 180-rune p56-then-p57 actual plaintext, without any invented characters.
- **Unknown p55**: its original 76 *ciphertext* runes are a separate raw-symbol gate. This row cannot test a hypothetical hidden p55 plaintext.

Two separate exact dynamic programs examine each target. The first finds the **longest contiguous exact run** that occurs along *some* permitted grid path, optimizing the starting point of both the path and the target substring. The second computes the **minimum number of output-rune substitutions** required to spell the *entire target* on a single path, with no insertion, deletion or extra cipher layer. Thus a small negative exact-prefix search cannot conceal a nearly complete matching route.

| Target original text | Runes | Free nine-neighbor longest exact run | Free nine-neighbor minimum substitutions | Quotient-directed longest run | Quotient-directed minimum substitutions |
| --- | ---: | ---: | ---: | ---: | ---: |
| p56 authentic plaintext | 85 | **5** | **37** | **2** | **76** |
| p57 authentic plaintext | 95 | **5** | **40** | **2** | **86** |
| p56+p57 known plaintext | **180** | **5** | **78** | **2** | **163** |
| p55 original printed ciphertext | 76 | **6** | **31** | **2** | **69** |

For the authentic 180-rune ending, **even the permissive freely chosen nine-neighbor route requires at least 78 changed rune outputs** to match the complete original message, while the specified q-directed path requires 163. The longest exact original segment on the free graph has only five symbols. The more restrictive q-directed figures supply an explicit check of the independently motivated keypad model.

### Native planted positive

The same reproducible code creates a **different synthetic 256-byte board**, planting **all 95 real p57 runes** along a fixed first-95-cell serpentine route, with q=5 for east, q=3 for west, q=1 for south, and q=4 at its final cell. Every planted byte is in the valid 0..255 range and has the intended rune as its 29-remainder. The unmodified search recovers a **95/95 exact** path and reports **zero substitutions** under both directed and free movement. The full original-data parser, plaintext decoder, path search and source-specific numeric assertions use one read-only Node.js/CommonJS file. The original findings were independently computed directly on the GitHub-connected source JSON before the reproducer was committed.

## Cryptanalytic decision

These results decisively exclude **literal, sequential, one-cell-per-rune grid-walk readout of the already-solved terminal text** under the canonical byte→(q,r) split, whether constrained to q's compass direction or allowed arbitrary adjacent movement, stays, repeats, reflected grids and all possible starting cells. In particular, no alternate entrance or read direction can restore a missing complete p56/p57 plaintext path within this model.

They also exclude a direct complete grid readout of the 76 printed p55 ciphertext runes, but **say nothing about p55's unknown plaintext**. A secret byte/rune relabeling, nonadjacent jumps, multiple output symbols per cell, a keyed intermediate encryption, a different numeric codec, or another use of the grid would require additional independently visible instructions. The original signed “direction” wording does not prescribe the compass keypad or establish that solved terminal text was ever encoded in the table.

This is a bounded decryption attempt and a new decision against a natural whole-message interpretation of the existing GEM graph. It should not motivate further unrestricted search across keypad rotations, GP alphabet permutations, skip insertions or passwords without a new source-selected operand.

**Reproduce:** run the [single-file SFT](../sims/lp2_grid_9neighbor_knownplaintext_path_sft.cjs) against the committed \`resources/liber-primus/base60-grid.json\` and \`lp2-corpus.json\` using Node.js 22. It reads original source material only, asserts the exact table geometry, verifies the historically solved p56 register, calculates all table values above, and performs the planted 95-rune positive.
