# Standard cyclic BWT on complete printed-group lengths: exact negative (#2718)

## Decision

The nine original LP2 chapter length tapes and the full 2,896-group tape are **not valid last columns of a standard cyclic BWT on numerical group lengths**. The result is independent of any primary index, rune key, cipher clock, or language model. Retire this specific whole-group permutation. This does not rule out H-shuffle, H-decoy, a sentinel-bearing transform, different sort alphabet, or nonstandard subdivisions. No unknown plaintext or authentic key was recovered.

This is the separate group-length alphabet required by #2718, rather than the raw GP29 rune tape previously excluded by #2680 or the historical 729-rune object studied in #1477. No generic permutation search or key sweep was run.

## Fixed model and exact obstruction

Let the plaintext objects be g[0..n-1] with numerical lengths x[i]. Sort all cyclic rotations of x lexicographically, stably by starting index. Emit the full preceding group object from each row; its length is the last-column token L. Define LF(i)=C(L[i])+Occ(L[i],i), using zero-based occurrence ranks and C as the number of strictly smaller tokens. LF is a permutation, independent of the primary index.

If x has minimal period d dividing n, there are exactly d distinct rotation classes, each with multiplicity n/d. Each class has a unique predecessor class under cyclic shift; stable matching by the equal-token occurrence ranks maps the kth copy to the kth copy of that predecessor class. Hence every LF cycle has length d (and all cycle label necklaces coincide). In particular a primitive input has one n-cycle. Unequal cycle lengths are impossible under this model, even with periodic input. No primary index can alter LF. No arbitrary tie ordering among full objects can alter this necessary length-only condition.

If primitive, starting from the primary row and taking successive last-column objects backwards gives a full inverse. Periodic lengths may restore the lengths but lose object identity under this simple LF walk: e.g. four distinct objects with lengths 1,2,1,2 yield two length-two cycles, and choosing a row cannot visit all four objects. This is why a periodic exception cannot simply be treated as a full reversible object inverse without an explicit tie convention and additional recovery state. The original tapes fail even the weaker necessary length criterion.

## Original result

Canonical image-corrected transcription: carry across line/page punctuation except actual word delimiters [-.&]; compare flattened GP indices to the canonical 12,956-rune p0–55 tape. No chapter clips. Input blobs: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; image-corrected f7b534a33edeb212d427329798438325307463d7; solved native controls 1b064ef6d85819b7d96adaff31a82d1ec551598f.

| Physical pages | Groups | LF cycle lengths (multiplicity expanded) |
|---|---:|---|
| 0–2 | 158 | 1,1,1,2,3,22,128 |
| 3–7 | 255 | 1,1,1,1,10,117,124 |
| 8–14 | 383 | 1,6,8,12,44,59,99,154 |
| 15–22 | 437 | 3,49,117,268 |
| 23–26 | 224 | 1,1,222 |
| 27–32 | 326 | 1,1,10,87,227 |
| 33–39 | 378 | 1,2,5,10,26,36,74,224 |
| 40–53 | 669 | 1,2,2,14,35,55,86,474 |
| 54–55 | 66 | 1,1,4,17,43 |
| 0–55 | 2,896 | 4,5,50,60,98,1011,1668 |

Even the most nearly primitive chapter p23–26 has two fixed points beside its 222-cycle, so dropping them would not be a lossless inverse. All ten tapes fail exactly. Scoring a fabricated reconstruction or running a value-changing inverse is unjustified.

## Calibration

- Nine solved native GP source sections transformed as full objects, then LF-inverted with the known primary index: all nine have a single cycle; every group object recovered exactly (740 total groups: 45,124,31,208,181,88,18,25,20; sum 740).
- Exhaustively enumerate every ternary length sequence for n=1..8 (9,840 sequences) as both forward inputs and candidate last columns. Compare cycle/necklace criterion to the exact set of forward outputs: zero discrepancies. All 135 nonprimitive input sequences preserve lengths but fail the simple distinct-object inverse, as expected. Every primitive distinct-object case recovers exactly.
- These are deterministic constructed controls, not blind investigator controls. The exact necessary condition makes statistical power, length-likelihood comparisons and independent plaintext continuation moot; no target-selected parameter is used.

Reproduce with `node sims/lp2_group_length_cyclic_bwt_sft.cjs`. Core executed against live repository input blobs through connected JS; standalone Node/Windows execution has not been independently run. The SFT prints exact diagnostics. Do not infer a broader BWT-family exclusion from this fixed alphabet and segmentation.
