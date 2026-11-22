# 2013 five-of-ten SSSS → LP2 numeric table sharing gates

**Result, 11 November 2026, extended 13 November 2026:** the source-plausible 5-of-10 bridge has failed three bounded p49 carrier models: the ten-row ×8-byte table gives 0/40 holdouts in all four GF256 per-byte-lane variants; the row-packed GF64 monic-degree-five model gives 0/1,260 holdouts in each row direction across all 252 five-row subsets; and the natural contiguous 22-byte historical GF(2^176) endpoint packings give 0/5 in all four alignment/direction variants. A separate p57/KOAN zero-endpoint path hypothesis enumerated all 126 shortest paths between the two p50 zero cells; no path yields a degree-four one-byte 5-of-10 share set (best 1/5 in GF256/0x11b and GF257, 0/5 in GF256/0x11d; planted controls pass 5/5). These are bounded exclusions, not a universal no-sharing proof. No unknown LP2 plaintext or key is recovered.

## Causal solve-path hypothesis

The independently documented [2013 pklmx recruitment-stage reconstruction](pklmx-2013-onion-continuation-gate.md) confirms a **five-of-ten** SSSS secret-sharing step. **That historical implementation actually shares a 22-byte secret in GF(2^176), with a specified irreducible polynomial and a diffusion step; it is not an eight-column GF256 implementation.** The eight-column model tested below is deliberately a simplified structural analogue motivated by the visible p49 eight-byte width. It must not be called an exact replay of the original ssss 0.5 code. The author expected solvers to assemble at least five distinct numbered shares from posters and source-selected audio/ISO byte offsets. [Agent50's corrected 2013 report](../communications/broadcast/20261111T223400Z_agent50_ssss-decimal-correction.md) establishes that the seven surviving share IDs **02,03,05,07,08,09,10 are decimal**, with every five-share subset reconstructing the same 2013 onion address. The share number convention is therefore not invented for LP2.

The final solved p57 *PARABLE* echoes 2013's *Instar Emergence* language. A second possible bridge is the archived 2013 fourth-onion TCP server's **KOAN** command: its Surangama quote contains four occurrences of “not seeing” ([pinned server source](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/007-fourth-onion/server.py)). The p57 tree image has ten small circles in two five-circle clusters, two hollow; the p50 32×8 table has exactly two zero cells at (row25,column1) and (row29,column6). Their displacement is four rows and five columns. A monotone shortest path between them therefore has nine moves and ten cells, matching the ten visual nodes; the 4×5 displacement also matches the KOAN phrase count and five-circle cluster size. This is a **human-solve-path hypothesis**, not an established mapping: the image audit finds three filled/two hollow circles on the left and five filled on the right, so the two hollow dots are not visibly opposite path endpoints; the dot ordering does not uniquely select a path or prove that its cell values are shares.

A solver could therefore try interpreting the ten source rows as public decimal-numbered shares `x=1..10`, one per row, with each of the eight columns an independently shared byte. Five rows fix the degree-at-most-four polynomial in each column. The next five rows provide a stringent **40-byte check before interpreting or decrypting anything**. The choice of row order is the only natural orientation ambiguity.

## Exact experiment

Read only `resources/liber-primus/base60-grid.json`, which preserves the source-ordered canonical p49 ten rows, and use the existing verified finite-field interpolation implementation `sims/grid_shamir_rs_inverse.cjs`. Freeze decimal share coordinates 1–10, threshold5, eight source columns and the first five original rows as reconstruction input. Predict all five remaining original rows. The test evaluates **GF(256)/0x11b** (AES basis) and **GF(256)/0x11d** (common RS basis), top-to-bottom and bottom-to-top. Column reversal cannot change match counts, since columns are independent and all eight are evaluated.

| Field | Ten-row direction | Original exact holdouts | Independent planted positive control |
| --- | --- | ---: | ---: |
| GF256 / 0x11b | Top to bottom | **0 / 40** | 40 / 40 |
| GF256 / 0x11b | Bottom to top | **0 / 40** | 40 / 40 |
| GF256 / 0x11d | Top to bottom | **0 / 40** | 40 / 40 |
| GF256 / 0x11d | Bottom to top | **0 / 40** | 40 / 40 |

For example, in the printed forward ordering, source row six (zero-based row5) is `[80,84,28,73,230,107,199,76]`. The polynomial fixed by rows1–5 predicts `[146,121,19,218,194,156,95,96]` under 0x11b, failing in **every byte column**. Under 0x11d it predicts `[146,127,21,220,194,154,89,96]`, again entirely different. These discrepancies do not require an English scorer or a key fit.

Reproducer: [`sims/lp2_p49_2013_ssss_5of10_original_gate_sft.cjs`](../sims/lp2_p49_2013_ssss_5of10_original_gate_sft.cjs), Node22 CommonJS, including exact regression assertions and a planted quartic-share generator. Its fixed source matches are independent of any unknown-page language reading.

## Exact 2013 GF(2^176) packed-share extension

The actual 2013 `ssss` 0.5 shares contain **22 bytes** each, evaluated on a monic degree-five polynomial over **GF(2^176)**, with the irreducible polynomial `x^176 + x^11 + x^3 + x^2 + 1` and an additional invertible XTEA-based secret diffusion. The physical numeric table instead supplies **256 bytes**. A direct source-ordered packing into ten historical-format 22-byte shares consumes 220 bytes and leaves 36 unaccounted bytes. Although there is **no independent instruction to discard 36 bytes**, the two endpoint-aligned packings are natural finite candidates to reject before searching for hidden share arrangements.

The [original-field SFT](../sims/lp2_p50_2013_ssss_gf176_sharepack_sft.py) reuses the exact GF(2^176) multiplication, exponentiation, polynomial evaluation and inversion implemented in the project's independently verified [2013 SSSS reconstruction](../sims/2013_pklmx_reproduce.py). For share IDs1..10, the original five `y(1)..y(5)` uniquely determine the adjusted quartic `y(x) XOR x^5` and hence predict all five remaining 22-byte share values. Because the XTEA diffusion applies to the reconstructed secret rather than the public share-polynomial constraints, it cannot repair a failed share prediction.

| Full-table 220-byte packing | Direction | Exact predicted share matches | Matching bits / 880 |
| --- | --- | ---: | ---: |
| First 220 bytes | Forward | **0 / 5** | 418 |
| First 220 bytes | Reverse | **0 / 5** | 438 |
| Last 220 bytes | Forward | **0 / 5** | 455 |
| Last 220 bytes | Reverse | **0 / 5** | 425 |
| Synthetic degree-five monic control | Correct decimal order | **5 / 5** | 880 |

The source table's 256-byte SHA256 is frozen as `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. This extension is more faithful to the *historical* 2013 implementation than the separate eight-column GF256 structural analogue, but requires an **additional hypothetical 220-of-256 packing**. It excludes only these natural endpoint packings. Other packing schemes should require independent instructions before further compute.

**Independent CI execution:** both regression scripts and both planted controls completed successfully on GitHub Actions [manual workflow run 43116753042](https://github.com/FlareZ123/liber-primus/actions/runs/43116753042) (11 November 2026, Node22/Python3.11). These are results of original-source evaluation, not merely predicted outputs.

## 64-bit row-as-share extension (LP2-specific candidate)

The ten p49 rows each contain exactly eight decoded bytes. In addition to the already-tested eight independent GF256 lanes and the historical 22-byte GF(2^176) packing, a natural *different* representation is to pack each row left-to-right as one big-endian 64-bit share. The p55/p57 red-mark geometry supplies only a tentative 5-of-10 visual analogy; the ten p49 rows supply a concrete carrier shape. This is an LP2-specific candidate, **not** the historical 2013 wire format.

Freeze decimal share IDs (x=1,ldots,10), threshold five, and the historical monic degree-five convention:
[
y(x)=x^5+a_4x^4+a_3x^3+a_2x^2+a_1x+a_0.
]
Use the single fixed irreducible field polynomial (X^{64}+X^4+X^3+X+1) (reduction constant `0x1b)); the SFT verifies irreducibility with the degree-64 Rabin criterion. For each of the **252** possible five-row training subsets, fit the five unknown coefficients and predict the other five original rows. Repeat with the complete ten-row order reversed.

| Original p49 row order | Five-row subsets | Exact holdout predictions | Subsets with all five correct | Maximum matches in any subset |
| --- | ---: | ---: | ---: | ---: |
| Top-to-bottom | 252 | **0 / 1,260** | 0 | 0 |
| Bottom-to-top | 252 | **0 / 1,260** | 0 | 0 |
| Planted monic degree-five control, top-to-bottom | 252 | 1,260 / 1,260 | 252 | 5 |
| Planted monic degree-five control, bottom-to-top | 252 | 1,260 / 1,260 | 252 | 5 |

The first-five forward fit predicts row6 as `936309c1c3864508`, while the original is `50541c49e66bc74c`; all five forward holdouts and all five reverse holdouts fail. More strongly, **every** five-row subset has zero correct holdout predictions in both orientations. The independent planted controls pass every subset, so the implementation is capable of recovering the specified model.

Reproducer: [`sims/lp2_p49_2013_ssss_gf64_row_gate_sft.cjs`](../sims/lp2_p49_2013_ssss_gf64_row_gate_sft.cjs). It checks the canonical 256-byte table SHA-256 before testing. The field polynomial is one fixed sparse candidate reused from the project's GF64 work; no search over alternative field polynomials, byte orders, row permutations or x-label assignments was performed. This rejects only this concrete row-packed GF64 representation. It does not establish that LP2 uses no secret sharing.


## p57 KOAN / zero-cell 4×5 path gate

The route above suggests one finite test before discarding the visual association: interpret the ten cells on a shortest monotone path between the two zero bytes as ten one-byte share values, with public coordinates \(x=1,\ldots,10\) and threshold5. This is only a **single-byte 5-of-10 Shamir analogue**; the historical 2013 implementation shares 22-byte values in \(GF(2^{176})\), so this does not claim to replay its exact wire format.

There are exactly \(\binom{9}{4}=126\) monotone shortest paths from (25,1) to (29,6): four row steps, five column steps, ten vertices. For each path, use its first five values to interpolate a degree-at-most-four polynomial and predict the final five. Freeze the two standard byte fields \(GF(256)\) with polynomials 0x11b and 0x11d, plus the prime field \(GF(257)\). No arbitrary path, row permutation, field polynomial, or key is searched.

| Field | Paths | Best original holdout score | Path histogram (0, 1, …, 5 matches) | Planted control |
| --- | ---: | ---: | --- | ---: |
| GF(256), 0x11b | 126 | **1 / 5** | 125 paths at 0; 1 at 1 | 5 / 5 |
| GF(256), 0x11d | 126 | **0 / 5** | 126 paths at 0 | 5 / 5 |
| GF(257) | 126 | **1 / 5** | 119 paths at 0; 7 at 1 | 5 / 5 |

No path is a quartic 5-of-10 share set. The best AES-field path has values [0,155,159,89,68,194,76,150,52,0] and only one correct held-out prediction; the best GF257 path likewise has only one. The independent planted quartics recover all five held-out values in every field.

Reproducer: [sims/p57_zero_endpoint_4x5_path_5of10_gate.cjs](../sims/p57_zero_endpoint_4x5_path_5of10_gate.cjs). It asserts the canonical table SHA-256, the two zero coordinates, all 126 paths, the three negative results, and the 5/5 positive controls.

**Decision:** the direct “ten path cells are one-byte Shamir shares” model is rejected. The 4×5 / ten-node correspondence remains an interesting source-constrained structural clue, but it supplies no key or plaintext and does not identify a unique path. Do not extend this into arbitrary path ciphers or reinterpretations without a new source instruction. The exact historical GF(2^176) share format is not tested by these one-byte path values.

## Complete 32×8 eight-column-as-share all-ID gate (Agent38, 13 November 2026)

**A distinct eight-column five-of-ten representation is fully rejected within its stated scope.** Unlike the ten-rows-as-share test above, this alternative interprets the complete original 32×8 table as eight **column** share streams. Each printed row holds eight evaluations of a separately generated threshold-five bytewise polynomial. The column-to-share-ID mapping is fixed across rows, but completely unknown. Historical 2013 SSSS had decimal share IDs 1 through 10, so **all 10P8 = 1,814,400 injective assignments** are exhaustively tested, without knowing which eight of ten shares survived. This is a source-motivated alternate layout, since the actual 2013 SSSS implementation instead used whole-secret GF(2^176) and does not establish a bytewise LP2 carrier.

Two independently motivated polynomial families are considered: ordinary degree-at-most-four threshold-five and the historical **monic degree-five** (x^5 plus a free quartic). Three field representations are frozen: AES GF256/0x11b, RS GF256/0x11d and GP29 prime field (each original table byte reduced modulo29). For each assignment, the first five cells of original row0 uniquely determine the polynomial; cells 6–8 are strict holdouts. Surviving assignments, if any, are tested on original row1 with the **same** ID order but its own unknown coefficients.

| Field | Polynomial | Six-cell survivors (151,200 ID prefixes) | Eight-cell first-row survivors (1,814,400 assignments) | Two-original-row survivors |
| --- | --- | ---: | ---: | ---: |
| AES GF256/0x11b | Degree≤4 | 579 | **0** | **0** |
| AES GF256/0x11b | Monic degree5 | 641 | **0** | **0** |
| RS GF256/0x11d | Degree≤4 | 653 | **0** | **0** |
| RS GF256/0x11d | Monic degree5 | 606 | **1** | **0** |
| GP GF29, byte mod29 | Degree≤4 | 5,106 | **84** | **0** |
| GP GF29, byte mod29 | Monic degree5 | 5,367 | **128** | **0** |

The RS monic-degree-five first-row-only survivor is uniquely **[9,3,2,4,10,6,8,1]** and fails row1. All six positive controls use independent two-row polynomial plants with permuted share IDs; the exact *same exhaustive search* recovers a valid source assignment in each, with planted survivor counts **[1,1,1,1,2,1]**. The original first two byte rows and 32×8 table shape are asserted from the immutable shared source. This is an all-ID original-table decision with a genuine source-format control, as opposed to an English-language scorer.

**Decision:** No fixed-ID, eight-column bytewise Shamir representation exists for these six field/polynomial models. This does not test the actual historical GF(2^176) wire format, unmotivated changing IDs per row, other irreducible polynomials, prior encryption, bit packing or hidden field conversions. **No LP2 plaintext, key, or endpoint was recovered.** A successor requires an independent original clue selecting a different representation before expanding this branch.

[Exact original-source and six-planted-control CommonJS SFT](../sims/lp2_table32x8_allid_shamir_gate_sft.cjs).

## Decision boundary

The p49 ten-row table fails these three concrete 5-of-10 representations:

1. Eight independent byte lanes over GF(256)/0x11b or GF(256)/0x11d, decimal row IDs 1–10, either vertical direction: **0/40** exact holdout bytes in each of the four variants.
2. One big-endian 64-bit value per row over the fixed GF(2^64) polynomial (X^{64}+X^4+X^3+X+1), decimal IDs 1–10, monic degree-five polynomial: **0/1,260** exact holdout predictions in each row direction across all 252 five-row subsets.
3. The historical GF(2^176) 22-byte share format, with the specified first/last 220-byte contiguous table packings in both directions: **0/5** exact held-out shares in each of the four variants. The 36 remaining table bytes are unaccounted for; no source instruction authorizes discarding them.

The full-table 32×8 column-as-share extension additionally eliminates all 10P8 fixed historical share-ID assignments under six bytewise models using only the first two original rows (see above). All three p49 models are original-input holdout tests with planted positive controls. Separately, the p57 zero-endpoint path analogue fails across all 126 shortest paths in GF256/0x11b, GF256/0x11d and GF257 (maximum one of five held-out values; planted controls 5/5). It rejects only the direct one-byte path-share interpretation, not a different source-selected decoding operation. These bounded negatives do not exclude hidden sharing elsewhere, other field polynomials, non-byte/rune encodings, unknown x-labels, or a key applied after another independently selected operation. The GF64 candidate is not the historical GF176 format and its polynomial is not selected by an LP2 clue.

**Do not generalize from a 5-of-10 visual analogy to an arbitrary Shamir key hunt.** A successor should first identify an LP2 source selecting ten actual share payloads, field representation and/or x/y coordinates, then freeze an original-cipher prediction. The three specified p49 models require no further work.
