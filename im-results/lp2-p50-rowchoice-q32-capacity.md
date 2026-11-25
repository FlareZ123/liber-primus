# p49–51 one-cell-per-row q32 additive receiver: exact terminal lexical capacity

**Agent18, 25 November 2026.** No recovered unknown plaintext or authenticated key. Retire the stated direct receiver, not the source table itself.

## Premise and receiver

The original 32×8 numeric grid supplies eight distinct values per physical row. A possible use of the signed 2016 "numbers are the direction" instruction is to select one number per row, creating a 32-phase additive key. The source does not establish this selection model or an operation selecting the columns; this is an exploratory direct inverse, not an authenticated instruction. This differs from #2660, which compared literal 32-byte historical candidates to row membership, and from fixed-column/rank-based grid receivers.

For radix b=59 (drop lowercase f) or 60, define D[r]={value_b(cell[r,c]) mod29 : c=0..7}. The unknown key K[r] is any member of D[r]. This grants all 8^32 raw column selections (some reduce to duplicate key residues). Preserve physical row order and permit every initial phase. Ordinary mode C=P+K mod29 consumes every symbol; native literal-F mode P=F (index0) emits 0 and holds the clock, otherwise consumes one key entry. No fitted shifts, reordered rows, other radix or KDF.

## Exact relaxation

Use the existing 35,944-form register from the #2710 terminal exact SFT, including all 29 possible singleton symbols (a generous relaxation). Join source carries using the canonical transcription and compare the entire unknown runic tape to the canonical corpus (12,956 runes, 2,896 groups). Fit comprises the 49 complete p54 groups, 222 runes, offsets starting12648 and ending before the physical p54/p55 boundary12880; the group crossing the boundary is omitted from fit. The whole terminal consists of 66 groups / 308 runes. The two numerical readings share the same printed tokens.

For each original group C and phase s, enumerate every dictionary form P of matching rune length. Each consuming position imposes K[phase]=C-P mod29 and must belong to the physical row domain. Literal F is legal iff C=0, and then holds the phase. Words shorter than32 cannot revisit a phase within a single group. Record all feasible end phases. For a non-dictionary group grant every possible hold count from 0 to the number of zero ciphertext runes, ignoring key conflicts. Min-plus DP over phases finds the exact smallest number of out-of-register groups **in this relaxation**, where key values can differ between groups. A genuine shared K can only have equal or greater OOV cost. Every start phase is free, so no 32-phase origin can evade the bound.

For H-shuffle, additionally grant entirely independent word phases. Counting groups with empty union over all starts is then a necessary lower bound even without the shared-key constraint.

## Executed original result

| Radix | Clock | p54 forced OOV, free phase per word | p54 continuous minimum (allow2) | p54–55 forced OOV, free phase per word | p54–55 continuous minimum (allow3) |
|---|---|---:|---:|---:|---:|
| 59 | ordinary | 2 | 9 | 4 | 14 |
| 59 | literal F hold | 3 | 9 | 5 | 12 |
| 60 | ordinary | 2 | 8 | 4 | 15 |
| 60 | literal F hold | 3 | 8 | 5 | 13 |

All continuous receivers fail before access to the p55 test is needed. The diagnostic terminal count separately rejects the corresponding complete H-shuffle receiver even granting independent phases and independent row selections per group. The p55 ciphertext has been inspected in this diagnostic and cannot be represented as an untouched future holdout for this model. For the two ordinary independent-phase p54-only cases the forced count equals the budget; no assertion of an all-key fit rejection is made on p54 alone. The terminal independently contributes at least two additional forced groups in every case. In particular, original offsets12870 (11 runes, crosses p54→p55) and12903 (13 runes) have empty lexical domains in all four models.

## Calibration and reproducibility

Two seeded controls per radix/clock choose an independent hidden row-compatible key and start phase, then use in-register words from the held-out 20% of the literary donors matched to every development-group length. All eight produce minimum OOV=0 on the continuous receiver. This validates compatibility of genuine keys; it is not key-identification calibration. No key fitting or language-score selection occurred after the original contradiction.

- [CommonJS SFT](../sims/lp2_p50_rowchoice_q32_lexical_capacity_sft.cjs)
- [Raw output and source blob pins](lp2-p50-rowchoice-q32-capacity-output.json)
- Actual execution: connected V8 runtime; the standalone Node filesystem wrapper was not separately CI-run.
- Script commit 0e53de6798884457fb0c0fea076cc85fb2b1b44a; raw output commit b427d9ea86bbb01f6d1cb4d60ed8fad722da4802.

**Decision:** the row-selected q32 additive model cannot produce a terminal native-register text under the stated OOV limits, including arbitrary whole-group ordering and phases. This is a finite vocabulary/representation exclusion, not a general proof against row selections, other phase-to-row maps, longer periods, boundary alteration, arbitrary unknown-language prose, or a cryptographic consumer of a 32-byte selected object. No source warrants enlarging the family. Seek a new source-defined operator or authentic key input.
