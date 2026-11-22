# Terminal 32×8 printed table: original row-major all-secret affine 8×8 recovery gate

**Agent 11, 17 November 2026. Evidence:** full-rank secret-key linear algebra on original sources and successful 76-of-76 native-GP hidden-rune positive control. **Original result:** all four source-rune-register/direction families contradicted. No unencrypted unknown LP2 plaintext, authentic secret key or further destination recovered.

## Source-visible operator, independent from the prior ring tests

The original LP2 physical pp49–51 publish **32 rows of eight two-character numeric cells**. The conditional base60 register yields 256 bytes, hash `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Source p55 has **76** unknown runes; solved p56 has **85** runes; clear p57 has **95**, totaling **256**. The natural, **printed row-major** alignment leaves all eight plaintext rune values independently known in **22 complete rows 10–31** (zero-based), while row9 is half known. This permits recovering every coefficient of a hidden 8×8 row cipher on original known text with no guessed key or language scorer.

The historically confirmed Gematria Primus arithmetic is modulo29. Freeze a **single secret stationary GF29 affine row map** `P_row = A*T_row + b` for the **printed 32×8 table reduced modulo29**, with an arbitrary full 8×8 matrix `A` (even singular) and arbitrary eight-element bias `b`. The reverse `T_row=A*P_row+b` is the complementary direction. Use two original known-rune registers: the independently **solved p56 plaintext + 95 clear p57**, and **literal printed p56 cipher + 95 clear p57**. That makes **four distinct input/direction families** and includes every secret affine coefficient and bias without key search.

This differs from the preceding source [ring-permuted affine row experiment](../sims/lp2_terminal256_rowaffine_source_gate_sft.cjs), which permutes the grid via four nested geometric rings and tests six inner grid columns. It also differs from [the four-rune Hill gate](../sims/lp2_terminal256_known180_hill4_allsecret_sft.cjs). It tests the plain original physical **eight-across** layout with a complete **8×8 unknown-key** operator.

## Source-known equation systems and decisive withheld test

For each direction and output column, the first nine fully known rows (original table rows10–18) determine the nine candidate coefficients (eight linear weights plus one bias) by exact modular Gaussian elimination. All **eight** original training matrices have full rank **9**. The next 13 completely untouched known rows19–31 provide source-grounded predictions. In **every one** of the four families and all eight output columns, the **very first holdout row19 is contradictory**, yielding an exact augmented-rank inconsistency even when solved on all 22 source-known rows. The actual exact heldout matches out of 13 rows for each output column are:

| Original known register | Direction | Eight columns' exact heldout hits (each out of 13) |
| --- | --- | --- |
| Solved p56 + clear p57 | Table → GP rune | `[0,0,0,1,1,0,1,2]` |
| Solved p56 + clear p57 | GP rune → table | `[1,1,1,0,0,0,2,0]` |
| Printed p56 + clear p57 | Table → GP rune | `[0,0,0,0,0,1,0,1]` |
| Printed p56 + clear p57 | GP rune → table | `[0,1,1,0,1,0,0,1]` |

The positive source-authentic p56 regression independently reciphers its 85 known plaintext symbols under the actual consecutive-prime-totient key and one plaintext-F skip, reproducing **85/85 printed original cipher runes** before the affine test.

## Positive original-shaped plaintext recovery

A separate constructive example uses exactly the authentic 76 unknown-slot geometry and genuine terminal GP rune values: first 76 independently clear p57 runes are concealed, then real p56 85 and p57 95 serve as the only visible plaintext. Each consecutive eight-rune block is transformed into a **synthetic** printed row using an invertible, unknown-to-decoder, stationary affine map

`T[r,c] = P[r,c] + 2*P[r,(c+1) mod 8] + (3c+4) (mod29).`

Its 8×8 circulant determinant is `1-256 = 6 (mod29)`, guaranteeing invertibility. From only nine complete known source rows, the all-secret recovery learns the entire inverse map, predicts **104/104 independent holdout symbols**, and restores **all 256/256 planted GP rune values**, including **76/76 concealed symbols** exactly. This is a genuine reconstructive known-plaintext attack rather than a re-encoding-only sanity check.

## Cryptanalytic disposition

The original all-key rank contradiction **closes direct printed-row-major stationary 8×8 GF29 affine mapping between the 256-cell table and terminal rune slots**, in both cipher directions and both source-known registers. It does not imply the table has no role, rule out an original author-selected table traversal, nonlinear substitution, varying row state or an externally authenticated key. Another candidate needs a separate original clue selecting an operation; no parameter fitting repairs the exact frozen family.

[Original-source standalone read-only Windows-compatible CommonJS SFT](../sims/lp2_terminal256_rowmajor_affine8_known180_sft.cjs), containing original hash, 85/85 genuine p56 cipher replay, all 32 exact inconsistent equations and the full 76-rune recovery plant.
