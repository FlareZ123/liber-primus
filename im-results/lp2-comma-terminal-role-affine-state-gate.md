# Comma-terminal grammatical equality and ciphertext-integral state

**Director #3217 — Agent4 — bounded source-role negative.** No new unknown plaintext or key. A genuinely distinct observable role from #3190's aligned clause opening is the terminal word immediately before a single comma and the terminal word at the end of the same punctuation-delimited interval. In solved LOSS OF DIVINITY the numbered first error ends both alternatives with ENOUGH; the held KOAN1 similarly ends both alternatives with ARE. The relation is equality, not either guessed word.

## Frozen inverse

Let (S_i=sum_{j<i}operatorname{GPprime}(C_j)mod29), initially zero, and (C_i=P_i+aS_i+bmod29). The state is ciphertext-observable and the decoder is (P_i=C_i-aS_i-bmod29); the forward encryption updates state after each emitted symbol. This is nonperiodic in general, distinct from a fixed q8/q13 clock. It includes the degenerate constant shift a=0. For paired terminal word positions i,j, plaintext equality implies
[
a(S_i-S_j)=C_i-C_jpmod{29}.
]
A nonzero state difference gives a unique coefficient; other aligned letters test the same coefficient. If every state difference vanishes, either all a survive or none do. The offset b cannot be recovered by this equality; relative plaintext differences at any other positions become determined only if a is uniquely identified.

Source-only role gate: punctuation interval bounded by ordinary full stop or 13-dot marker, exactly one comma inside, complete words directly before comma and interval end, equal terminal widths of at least two runes. This uses literal structural positions rather than searching similar length sequences or donor words. Freeze from native LOSS OF DIVINITY; hold out other native sections.

## Native calibration

Seventeen single-comma intervals in the nine pinned native solved records. Four equal-width terminal pairs pass the selector:

| Section | Native terminal pair | Role | Equality | All 841 synthetic (a,b) | Unique correct a | Unidentifiable | False-admitted |
|---|---|---|---|---:|---:|---:|---:|
| LOSS OF DIVINITY | ENOUGH / ENOUGH | development | yes | 841 | 810 | 31 | — |
| LOSS OF DIVINITY | LUCK / NEED | development | no | 841 | — | — | 0 |
| KOAN1 | ARE / ARE | held | yes | 841 | 667 | 174 | — |
| WELCOME | INSTAR / EMERGE | held | no | 841 | — | — | 0 |

Each plant forward and inverse round-trips its complete native section. All positive cases retain the true coefficient, and whenever uniquely identifiable it is the true one. Once one informative pair determines a, the other two or five pairs in the repeated word give algebraic consistency checks (not independent heldout prose). For unrelated same-width words, no synthetic key pair yields an equality-consistent coefficient. The finite controls illustrate the exact inverse and the distinction between role selection and true grammatical equality: two of four role-selected pairs are false; these counts are not population error estimates. Neither grammar nor punctuation guarantees repetition.

## Original decision

All 12,956 original unknown GP indices match the canonical tape, 2,896 complete physical groups. Corrected punctuation removes the seven already identified false/editorial stop events (indices 57,58,59,60,91,125,127) and uses 13-dot marks as interval boundaries. All four original commas lie singly within an interval:

| Global interval start / comma / end | Terminal word widths |
|---|---|
| 1294 / 1317 / 1428 | 1 / 2 |
| 2833 / 2910 / 2945 | 3 / 4 |
| 4783 / 4967 / 5342 | 8 / 5 |
| 11296 / 11329 / 11526 | 6 / 2 |

**Zero original same-width terminal word pairs.** Thus the native construction supplies no original equality equation at all, much less an identifiable coefficient or independent continuation. No original language score or cipher candidate selected. Do not fit unequal suffix lengths or relax the comma roles after seeing the data; such changes would create a new unmotivated relation. This rules out transfer of this exact structural equality selector, not the affine feedback family in general, nor hidden plaintext segmentation.

Reproduce: `node sims/lp2_comma_terminal_role_affine_state_sft.cjs`. Executed the exact computation on connected V8 against all four checked-in source contents; script uses only Node built-ins. Prior #3190 and #3025 are separate opening/numbered-dialogue role negatives. The authentic grammar samples here do not supply a key to the original unknown stream.
