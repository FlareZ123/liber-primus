# Original 32×8 base-60 grid as a binary elementary-automaton keystream

**Agent 38, 17 November 2026. Decision:** a literal 64-bit cellular-automaton evolution from row to row **does not generate the original pp49–51 256-byte table**. All 256 one-dimensional radius-one Wolfram rules fail on the full printed table. This excludes one compact source-generated stream architecture with a recoverable one-row seed. It recovers **no unknown LP2 plaintext** or authentic key.

## Specific human-visible premise and falsifiable decoder

Original LP2 physical pp49–51 display **32 printed rows × eight conventional base-60-looking values**, each representing a byte in `0..255`. The manuscript extensively illustrates life, plants and regeneration. A human solver might recognize each line as a **64-bit state** (eight bytes) of an elementary cellular automaton. Elementary rule 30 is a historically established deterministic pseudorandom-state generator (Wolfram, before the 2014 puzzle); a 64-bit first state could then generate arbitrarily many subsequent key bits, a potential path from a compact visible numerical table to a full-length cipher key. The original page never explicitly says “automaton,” “rule 30” or “64-bit,” so the illustration link remains conjectural.

**Fixed source method.** Take the existing source-adjudicated conventional base60 byte conversion in `resources/liber-primus/lp2-grid-256.json`, with the original **10+13+9 physical row boundaries retained**. Convert each eight-byte row to a binary width-64 row. Predict every bit in the next row from the previous row's three neighboring bits with the same binary truth table (“Wolfram elementary rule”) at all **31 transitions**. Require an exact match to a printed next row for a source-generating mechanism. Exhaust all **256** possible radius-one deterministic binary truth tables, both conventional within-byte bit directions and two non-fitted edge conventions (64-cell periodic wrap, or fixed-zero exterior). This is **1,024 total rule/bit-order/edge interpretations**, each compared to **1,984 actual consecutive-row bit positions**.

## Original-input results

| Within-byte bit order | 64-bit boundary | Best rule of 256 | Wrong predicted bits / 1,984 | Original Rule 30 wrong bits |
| --- | --- | ---: | ---: | ---: |
| Most-significant-bit first | Cyclic wrap | 194 | **939** | 1,007 |
| Most-significant-bit first | Exterior zero | 192 | **938** | 1,008 |
| Least-significant-bit first | Cyclic wrap | 136 | **945** | 994 |
| Least-significant-bit first | Exterior zero | 136 | **948** | 997 |

**Best-case exact compatibility is zero across all 1,024 models.** The 938+ wrong bits are distributed across the printed table; no model comes close to the necessary zero bit errors. The source-related alternate rule numbers also fail in the natural MSB/wrapped interpretation: the red p15 Fibonacci-start value **3299 mod256 = rule 227** has **976** errors; 3301→rule229 **991**; 1033→rule9 **1,015**; original 2014 HTML numbers 133→rule133 **1,012**, 331→rule75 **990**. These source numbers are illustration- or history-derived possible parameters, rather than postselected matches.

## Exact positive and limits

The [self-contained Node.js 22 CommonJS original-source SFT](../sims/lp2_p50_table_rule30_eca64_original_sft.cjs) checks all 256 untouched source bytes and printed row dimensions, enumerates all four 256-rule families, and asserts the complete best-rule and Rule30 error counts. It also generates 32 consecutive synthetic **64-bit** rows from one deterministic first-state pattern under authentic Rule30 wrap evolution and verifies **0 errors across all 31 transitions**. Wrong Rule110 fails that same plant and a planted one-bit error is detected. Thus a real elementary-automaton source would be detected exactly by this routine.

**Research decision:** the actual table should **not** be treated as consecutive plain Rule30, Rule90, Rule110, red3299-derived, or any other stationary elementary-automaton state frames under the original row/byte organization. This removes one genuinely generative, compact-key candidate without arbitrary plaintext guessing or KDF searches. It **does not** exclude a table whose rows are already encrypted/whitened, higher-radius automata, nonlinear multirow state, skipped time steps, nonconsecutive rows, or a separately supplied external pad. No source instruction currently selects any of those extra freedoms, so this branch stops at the direct generator test.
