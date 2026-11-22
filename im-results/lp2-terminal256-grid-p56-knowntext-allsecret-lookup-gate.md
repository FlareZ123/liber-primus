# Terminal 256 runes and the numeric-grid perimeter: complete arbitrary-byte-key p56 known-text obstruction

**Agent21, 18 November 2026.** A visually motivated but unproven correspondence is exact: the original final LP2 unknown page **p55 has 76 runes**, solved encrypted **p56 has 85 runes**, and clear **p57 has 95 runes**. Thus **76+85+95=256**, matching the **256 distinct printed cells** (not distinct byte values) of the physically separate p49–51 numeric table. The table is 32×8; its four nested rings have **76,68,60,52 cells**, so the outer ring has exactly the length of p55, while all inner rings contain **68+60+52=180 cells**, exactly the p56/p57 combined rune length. The final known p56 solution supplies a legitimate 85-rune GP29 plaintext/ciphertext pair for a direct test of this candidate key-consumer.

**Result:** Every one of eight frozen printed/perimeter and key-clock interpretations **contradicts even an arbitrary, wholly unknown, stationary byte→GP29 additive-key lookup** on authentic p56. No unknown p55 plaintext, key, or intended grid protocol is recovered. This is a test of a specific key function, not a rejection of the visual 256-unit matching itself.

## Source input and candidate receiver

Use the original [32×8 table as base60 bytes](../resources/liber-primus/base60-grid.json) and the unchanged [original p55, p56, p57 GP29 source](../resources/liber-primus/lp2-corpus.json). The known p56 GP plaintext, precisely restored in the existing [authentic solved p56 regression](../sims/authentic_lp2_p56_totient_regression.cjs), is:

> AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE

It comprises 85 GP29 runes, matching the ciphertext, with the **single known plaintext-F bypass at p56 rune offset 56**. For each ordinary nonbypassed p56 rune, exact required shift is `K_i=(C_i−P_i) mod29`. Hypothesize a *single arbitrary lookup* `K_i=f(B_j)` where `B_j` is the grid byte at the corresponding position of the **256-cell terminal correspondence**. No assumption about `f` being linear, additive, known or cryptographically simple is needed: the same original source byte must require the **same GP shift** every time it reappears. Source p55 occupies the first 76 grid positions; p56 begins at position76. Test four exact natural orders: original table row-major, its reverse, clockwise peel of four nested rings (top-left first), and its reverse. Also test both p56 key clocks: **position advance** at the transparent-F symbol and **authentic non-consuming F** at that source position.

## All-secret collision contradictions

| Source 256-byte reading | F advances byte clock? | Distinct p56 training bytes | Repeated-source-byte events | Conflicting required GP shifts |
| --- | --- | ---: | ---: | ---: |
| Printed row-major | Yes | 70 | 14 | **14** |
| Printed row-major | No | 71 | 13 | **13** |
| Reverse printed | Yes | 72 | 12 | **12** |
| Reverse printed | No | 72 | 12 | **12** |
| Clockwise concentric peel | Yes | 73 | 11 | **10** |
| Clockwise concentric peel | No | 73 | 11 | **9** |
| Reverse concentric peel | Yes | 72 | 12 | **12** |
| Reverse concentric peel | No | 72 | 12 | **12** |

All cases use the 84 p56 rune positions with a required consumed key and omit the one literal plaintext-F exception. In every source-shaped arrangement, an identical table byte demands incompatible shifts at different independently known p56 cipher/plaintext positions. Therefore **no function whatsoever of that byte alone** can explain the known p56 encryption, even after choosing a completely secret 256-entry GP29 lookup. The observation rejects any direct *stationary byte-to-additive-rune* consumer of these eight complete source assignments before the unknown p55 is touched.

[Read-only original-source Windows Node22 SFT](../sims/lp2_terminal256_p50_arbitrary_bytekey_p56_sft.cjs) · [reproduction CI run](https://github.com/FlareZ123/liber-primus/actions/runs/44329204016).

## Remaining plausible mechanisms

The matching original 256-unit counts and **76/180 outer/inner-ring partition** are exactly reproducible, but coincidences of sizes do not themselves specify a cryptographic consumer. The experiment does not exclude a *state-dependent* key evolution; a 256-byte one-time pad interpreted as position-specific symbols, which need not give equal shifts for repeated bytes; a KDF or stream cipher applied to the grid; different reader clocks; source data that are not base60 byte values; or a cipher using the solved p56 with a key intentionally independent of the unknown preceding page. The next productive question is whether an original-authenticated source describes a changing-key operation or table-consuming procedure, rather than adjusting arbitrary alignments to the clear p56 words.