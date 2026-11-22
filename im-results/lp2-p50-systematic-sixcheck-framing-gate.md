# P50 six-check systematic 250+6 GP29 framing: non-identifiable payload

**Agent11 original-input decision, 16 November 2026.** The genuine 256-cell p49–51 number table passes six previously established source-crosslinked GF29 congruences, but a standard systematic 250-data + six-check-symbol framing is **not uniquely recoverable from those congruences**. All **251 consecutive six-cell parity positions** explain the *same original table exactly*. None of the 32 printed eight-cell rows independently forms such a codeword. The first/last-six payload readouts are unsegmented near-uniform GP29 digits, with no identifiable message. This is a bounded framing failure under [Director #1257](https://github.com/FlareZ123/liber-primus/issues/1257), with no recovered unknown-page plaintext, original cipher key, or authenticated author-instruction.

## Frozen original inputs, prior arithmetic and rival explanation

The original 32×8 field on `66.jpg`–`68.jpg` is transcribed in [base60-grid.json](../resources/liber-primus/base60-grid.json); the conventional 60-digit reading produces 256 bytes with SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The rival B59 reading omits the unobserved lowercase `f` digit from the low-rank alphabet. Neither radix is declared on the original page.

Adopting the already documented hypothetical GF29 source links, define `P(X)=Σ(i=0..255) (B[i] mod29) X^(255−i)`. The original signed 2013 `3QO` maps to `H(X)=3+26X+24X²`, normalized to `X²+18X+11`; p39's three red runes map to `G(X)=27+5X+15X²=15(X−24)²`. The p15 matrix eigenvalues give additional evaluations `P(8)=27` and `P(17)=15`. The six checks, already independently reproduced in [the cross-artifact correction study](lp2-p50-hg-single-residue-correction.md), are `P(24)=0`, `P′(24)=0`, the two coefficients of `P mod H` equal zero, `P(8)=27`, and `P(17)=15`.

The authors have **not** authenticated any instruction to read the table as a polynomial, a systematic error-correcting code, or plaintext. Here those six GF29 conditions are frozen as an **affine** six-check model; we test whether its possible *systematic* sectioning or printed-row grouping identifies a payload.

## Complete finite original-input test

For each possible consecutive six-symbol check interval at zero-based positions `s..s+5` with `s=0..250`, the same fixed six congruences form a 6×6 GF29 linear system. Keep the other 250 original table residues, solve the six unknowns without reading their values, and compare with the actual six hidden source residues. There are no free coefficients, secret key, language-chosen phase, byte patch or post hoc cipher changes.

**All 251/251 six-position matrices are nonsingular, and every solution is exactly the original six residues.** In particular:

| Candidate framing | Original six GF29 check symbols | Outcome |
| --- | --- | --- |
| First six positions, data = last 250 | `[0,28,22,12,10,5]` | Exact valid systematic codeword |
| Last six positions, data = first 250 | `[27,27,6,7,15,22]` | Exact valid systematic codeword |
| Every interior consecutive six positions | Original six residues in that window | Exact valid systematic codeword, 249 additional placements |

The result follows algebraically because the six-check generator `D(X)=H(X)(X−24)²(X−8)(X−17)` has degree six and a nonzero constant coefficient. A difference supported on six consecutive exponents would be `X^e Q(X)` with `deg Q≤5`; divisibility by `D` forces `Q=0`. This proves all placement matrices invertible, while original membership in the affine code supplies the same source codeword for every placement. The 251 possibilities are **indistinguishable by code validity**, so a systematic decoder needs an independent placement selector before any 250-residue output can be identified as intended data. This non-identifiability is structural, not a numerical chance-match.

**Printed 32×8 row alternative:** apply the unchanged six-check polynomial interpretation to each degree-seven eight-cell row separately (same source-ordered row-major direction). **0/32 rows satisfy the four homogeneous H/G conditions and 0/32 satisfy all six conditions**. A row-wise systematic 2-data +6-check interpretation with this same generator is therefore rejected without fitting a separate parity state for each row.

**Radix59 control:** the source-pinned rival alphabet without lowercase `f` yields six check residuals `[20,12,20,17,27,23]` (the first four coincide with the independently documented B59 negative). Thus the exact B59 reading is outside this hypothesized affine code, although that cannot prove the creator selected base60 rather than a different cipher on B59 digits.

## Does the 250-data readout reveal text?

No source chooses which six symbols to remove, or even that the data are GP29 plaintext. Under the frozen simple reading `byte mod29 → original GP rune index`, the two conventional endpoint placements have index of coincidence:

| Systematic payload interpretation | GP29 IoC | First 60 runes in canonical GP-label transliteration |
| --- | ---: | --- |
| First 250 cells, last six as checks | **0.03723694779** | `FEAOEEOICINCBJMSRNNCEASRSNGUFOEAEAAECHAEBEAIADIAEOEBCOEYEASIALAEENGTEUEAYJOEOETHUJ` |
| Last 250 cells, first six as checks | **0.03704417671** | `INCBJMSRNNCEASRSNGUFOEAEAAECHAEBEAIADIAEOEBCOEYEASIALAEENGTEUEAYJOEOETHUJMOEHOEGD` |

Both produce unsegmented symbol streams without a complete recognizable GP-native passage, file format, or independent word mapping. These 250 GP labels are representations for diagnostic comparison, **not asserted plaintext**. They omit the six parity cells as required by the tested code assumption. An original cipher might still encrypt a genuine message in such data, but the table supplies no selector or key to recover it.

## Independent positive controls and decision

[Standalone Windows-compatible CommonJS SFT](../sims/lp2_p50_systematic_sixcheck_original_sft.cjs) asserts the original 256-byte SHA, exact tokens, the complete six-syndrome, 251 consecutive-placement inversions, the rowwise tests and rival radix59 syndrome. It constructs four independent synthetic codewords with **250 data GP residues drawn from the actual clear p57**, placing six check symbols at positions `0,17,125,250`, then decodes their full data and verifies exact forward reconstruction. These positives establish the solver's ability to handle intended codewords at different positions; they do not authenticate any position on the original table. The observed six-check membership is already known and is not independently confirmed by four positive plants.

**Fork:** retire an unmarked **systematic 250+6** payload framing or six-check-per-row framing as a direct decipherment. The existing six global congruences remain reproducible and may still have significance as integrity constraints. A meaningful successor requires an original **first-party framing marker** that chooses one six-cell check placement, defines a data serialization, and predicts a typed original-cipher output. Additional placements or arbitrary hidden data word lengths would have no causal path to plaintext. The overarching state stays: all 56 unsolved LP2 pages remain undeciphered.
