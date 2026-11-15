# Original p49–51 byte-pointer graph: two source-selected cycles, no plaintext yet

**Decision (15 November 2026):** Under the simple *candidate* instruction `next_cell = the base60 byte printed in the current cell`, the original 256-cell p49–51 numeric table forms a complete directed functional graph with just **two disjoint cycles**. Original text geometry supplies a reason to examine **both cycles**: cell0, the first printed number, is on an exact **11-cycle**, and the **sum of the adjoining rune passage lengths 66+92=158** is itself a cell index on the **other two-cycle**, `158↔249`. The pre-table 66-rune paragraph also has exactly six times the first cycle length. This is a notable source-coupled numerical pattern, but **the byte-to-index interpretation has no authenticated original instruction, the stronger post-hoc pattern is not discovery-adjusted, and the simplest single-ring and combined-ring GP29 additive inverses fail**. No unknown-page plaintext/key/destination has been recovered.

## Source-grounded candidate operations

Physical LP2 pages49–51 (2014 scans `66.jpg`–`68.jpg`) print **256 two-character numeric cells**, 80+104+72 over a continuous **32×8** field. They are directly preceded on p49 by **66 original GP29 cipher runes** before the red ten-dot separator, and followed on p51 by **92 GP29 cipher runes** after another red ten-dot separator; rune-free p50 is the middle table page. The table's **conditional conventional base60** codec gives one byte (0–255) per cell, in source row-major order, with independently corrected original cells documented in `resources/liber-primus/lp2-grid-256.json`.

A contemporary player presented with the authenticated 2016 phrase “their numbers are the direction” could reasonably test the **minimal direct byte pointer** `next(i)=byte[i]` on zero-based grid indices. The creator has not actually instructed this operation; other byte/keypad interpretations and the competing radix59 remain viable. The source defines two natural starting cells independently of the table entries: the **very first printed cell0**, and a **cell numbered by the total rune count flanking the 256 numbers**, `66+92=158`.

The entire directed graph has exactly two cycles:

```
start0   → 0 → 203 → 68 → 199 → 47 → 76 → 114 → 197
                 → 115 → 247 → 192 → 0
              [11 distinct cells, no transient]

flank count   66 + 92 = 158
start158 → 158 → 249 → 158
             printed tokens: 49 → 2c → 49...
             base60 values: 249 → 158 → 249...
              [2 distinct cells, no transient]
```

Every other table cell feeds one of these two cycles. The original cell158 happens to display token **`49`**, which is also the physical number of the page on which the 256-cell table begins; however token `49` occurs **three** times in the table and its base60 value is decimal249, so the interpretation as a page pointer is speculative. Conversely the unique token `2c` occupies cell249, with base60 value158, closing the exact loop. The arithmetic `66=6×11` and `66+92=158` uses source-fixed physical rune counts; their relevance was observed after investigating the graph, so it does not constitute a locked independent prediction.

## Direct frozen GP29 cipher consumer fails

Reading the eleven visited bytes at indices `0,203,68,199,47,76,114,197,115,247,192` modulo29 gives the GP29 repeating key:

```
[0, 10, 25, 18, 18, 27, 23, 28, 15, 18, 0].
```

Test exactly `P[i]=(C[i]±key[i mod11]) mod29`, resetting the key clock at each original page. The source p49 66-rune prologue, p51 92-rune post-table prose and independent p52 263-rune continuation all remain nonlinguistic:

| Original physical page | Rune count | Subtract-key GP29 IoC | Add-key GP29 IoC |
|---|---:|---:|---:|
| p49 | 66 | 0.034498834499 | 0.031235431235 |
| p51 | 92 | 0.036072623029 | 0.033683707597 |
| p52 (held-out passage) | 263 | 0.034336632514 | 0.034975183583 |

Exact re-encryption of every tested rune and an authentic clear-p57 source cipher plant establish that the code really executed this frozen invertible family. There is **no actual LP2 plaintext recovery**. The two rings have relatively prime lengths **11 and 2**, so a joint source-selected repeating key has `lcm(11,2)=22` rune positions. The p49 66-rune prologue is exactly **three** complete joint cycles, a tighter source-motivated arithmetic fit than six independent 11-turn laps. Give the two-cycle byte residues `[249 mod29, 158 mod29]=[17,13]`; test **all four sign choices** for the two source-derived keys, `P[i]=(C[i]±A[i mod11]±B[i mod2]) mod29`. No secret multiplier, free offset, clock phase or word fitting was used. The resulting original IoCs were:

| Original page | Both keys added | 11 added, 2 subtracted | 11 subtracted, 2 added | Both subtracted |
|---|---:|---:|---:|---:|
| p49, 66 rune prologue | 0.028904428904 | 0.029370629371 | 0.034965034965 | 0.027972027972 |
| p51, 92 rune postlude | 0.032489249881 | 0.032489249881 | 0.036311514572 | 0.037267080745 |
| p52, 263 independent runes | 0.034191507271 | 0.033611006298 | 0.035613734653 | 0.034713958146 |

No complete source-native words or coherent original plaintext emerge under any fixed joint key. The full original input round-trips exactly under each of the four invertible compositions. Thus even the natural **22-key paired-cycle Vigenère consumer is negative**.

No arbitrary key phases, diagonal transpositions or rescored alphabets were added to rescue the candidate.

## 150,000 conditional original-byte shuffle controls

A predeclared deterministic SFT compares the **source original table** with **50,000 shuffles for each of three nulls**, preserving the full 256-value byte multiset globally, the eight source entries in each of 32 rows, or the 32 source entries in each of eight columns. Keep the fixed first cell0, the literal flanking count158, original row/column boundaries, pointer rule and source source-page counts unchanged. `flankTwo` requires the exact two edges `byte[158]=249` and `byte[249]=158`. Joint tests require that **and** a direct source-first cycle of exactly length11 or of length dividing the p49 prologue length66.

| Matched original-byte shuffle | First-cell cycle length=11 | First-cell cycle length divides66 | `flankTwo` exact 158↔249 | Joint exact11 and 158↔249 | Joint divisor66 and 158↔249 |
|---|---:|---:|---:|---:|---:|
| Global, n=50,000 | 326 | 2,088 | **1** | **0** | **0** |
| Within original rows, n=50,000 | 450 | 2,585 | **771** | **7** | **39** |
| Within original columns, n=50,000 | 298 | 3,068 | **42** | **0** | **5** |

The global `flankTwo` event is ~1/50,000 sampled, compared with 771/50,000 in the more restrictive row-preserving null, because the source rows already contain both required reciprocal byte values. These frequencies are **conditional diagnostics, not unconditional p-values**: the cycle graph and its relevance to 158 were proposed only after previous exploration, and the matching index 158 was recognized after the unrelated 11-cycle. The more conservative row-preserving **joint divisor66 and reciprocal flank** occurs 39/50,000; seemingly startling global outcomes may reflect byte placement rather than historical intention. A random 256-byte table inevitably has directed cycles. No source verifies that this table should be traversed as direct integer addresses.

## Research decision

This is a **narrow, fully reproducible potential human solve-path**, with two starting addresses derived solely from the printed source layout and two distinct original graph cycles. It makes the table's direct byte-pointer interpretation more interesting than an arbitrary hand-selected starting index. However it does not tell the player *which rune ciphertext stream is plaintext*, *which operation on the cycles yields a key*, *what success output is*, or *why the author would choose the graph*. Do **not** promote the cycle pattern as a decipherment or fit new phase variations. Advance with an original signed/rune instruction that independently selects the byte→index mapping, or an externally grounded key that predicts a complete unknown-page paragraph.

**Reproduction:** [single Node22 source-original SFT](../sims/lp2_p50_direct_byte_pointer_firstcycle_sft.cjs) and [passing original-source Windows CI 43708751724](https://github.com/FlareZ123/liber-primus/actions/runs/43708751724). This is distinct from the older unproven [base60 q/r keypad graph](lp2-p50-directional-functional-graph-prime-ordinal-starts.md).
