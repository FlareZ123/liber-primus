# Terminal 256 grid: no independent row-wise Möbius decoder of the known interior

**Agent 11, 15 November 2026. Exact original-input obstruction with a complete hidden-border recovery positive. No previously unknown Liber Primus plaintext, authentic key or destination recovered.** [Windows Node 22 successful run](https://github.com/FlareZ123/liber-primus/actions/runs/43775940512) · [read-only original-source reproducer](../sims/lp2_terminal256_rowmobius_known180_sft.cjs).

## Plaintext-producing hypothesis and independent input

The physical LP2 pp49–51 numeric table forms a **32×8** rectangle of **256 original printed two-character cells**. Its one-cell perimeter contains **76** cells, matching the **76 unknown GP29 runes** on terminal p55. The remaining **30×6 interior contains 180 cells**, matching the **85 established GP29 plaintext runes of p56** followed by **95 directly readable p57 runes**. Solved p57 explicitly asks readers to shed their circumferences; LP2 elsewhere depicts a Möbius strip. These are reasons a 2014-era solver *could* try a rowwise projective reconstruction, **not** proof that the authors instructed this mapping. The first p55 rune also completes a word carried over from p54.

A useful cipher in this family could be **recovered from the solved pages before examining p55 at all**. Map the **180 known runes** in their original textual order to interior cells in **printed row-major order**. Reduce each printed table byte to an input (x=B\bmod29); let its paired known GP29 rune index be (y\). Grant every interior row a completely independent secret non-singular projective transform over the field GF(29),

\[
 y = \frac{a_r x+b_r}{c_r x+d_r}\pmod{29},
 \qquad a_rd_r-b_rc_r\not\equiv0\pmod{29}.
\]

No common key, matrix, coefficient, phase or IV is assumed between rows. For a viable map all six known pairs in a row must satisfy (a_rx+b_r-c_rxy-d_ry=0\), with a **nonzero** vector ((a_r,b_r,c_r,d_r)\). The four projective parameters can be solved from three distinct known pairs. A successful row would then predict **two original border cells** without using their p55 ciphertext, ultimately up to **60/76 unknown page runes** from thirty separate rows; the top and bottom sixteen are unaddressed.

## Decisive original-known certificate

For **all thirty interior rows**, the six original known equations have **full rank four** over GF(29). Therefore every row's only solution is the zero coefficient vector, which is not a projective cipher key. There is no secret, per-row Möbius parameter assignment that even reproduces the authentic 180 known symbols under this fixed alignment.

The first four known pairs of the **first interior row** already suffice:

| Interior column | Table byte mod29 (x) | Authentic solved GP index (y) |
|---|---:|---:|
| 1 | 17 | 24 |
| 2 | 11 | 9 |
| 3 | 19 | 18 |
| 4 | 15 | 9 |

The corresponding 4×4 matrix with each row ([x,1,-xy,-y]\) has determinant **22 mod29**, hence is invertible. This single untouched-source certificate excludes any nonzero fractional-linear map even for that one row, independently of the other 176 known symbols, the unknown p55 ciphertext, and any English scoring. The other 29 rows independently give the same rank-four obstruction.

## Positive inversion and decision

The read-only CommonJS SFT verifies the canonical 256 table bytes, GP29 alphabet, p55=76, p56=85, p57=95 and the **exact known p56 plaintext**, then checks all thirty original ranks and the first-row witness. For a positive test, it encrypts the **same actual eight source table residues per row** through thirty distinct, invertible, nonlinear GF29 Möbius maps with no denominator poles. Using **only six generated interior symbols per row**, it infers the unique projective key up to scalar and reconstructs **180/180 known symbols plus all 60/60 concealed side-border symbols exactly**. This establishes that the attempted decoding route would really reveal p55 under its assumptions, and that the original negative is not caused by the solver.

**Retire only the source-row-major, single fractional-linear mapping per row as the decoder of the 180 known source-aligned interior runes.** This family includes row-specific affine maps. Rotating the table to choose an unfixed key, letting the Möbius coefficients change per cell, or replacing the solved plaintext with speculative words would discard the discriminating original constraints. A different authored table consumer would need its own independent selector. The finding does not refute the arithmetic link between the 2013 3301 BASE29 example, p39 red triad and the complete numeric table, nor does it establish that this table is the p55 key.

**Reproduce:** `node sims/lp2_terminal256_rowmobius_known180_sft.cjs`, in the repository root on Windows Node22. Files read are `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp2-grid-256.json`; no files are modified. Successful [manual CI run 43775940512](https://github.com/FlareZ123/liber-primus/actions/runs/43775940512) evaluates original ranks and the 240 reconstructed plant symbols.
