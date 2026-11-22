# P0–p2 opening 729-rune register as a 56×13 candidate page-key table

**Status:** Source-motivated alignment; direct receiver tests reject the simplest
page-key decoders on authentic unknown pages. **No LP2 plaintext or authentic key
recovered.** This is a bounded decision, not an established cipher.

## Original source and human-recognizable cue

The authentic LP2 opening image is archive `17.jpg` (physical p0).
Its first **13 red runes** form two printed words of lengths 8+5; a
13-dot mark follows those runes, and the black body starts immediately
after. The p0–p2 continuous three-page unit contains **729 GP29 runes**:
262 on p0, 266 on p1, and 201 on p2.

The exact identity is

    729 = 56*13 + 1 = 13 + 55*13 + 1.

There are 56 unsolved **physical** pages p0–p55, including rune-free p50.
Thus a naive page-key reading could take the first 728 runes as 56 rows
of length 13. Its first row is **exactly the red heading**, and one
final rune remains. Alternatively, the first rune is a framing seed and
the following 728 runes are the rows. The same 729 also equals 3^6 and
27^2, already investigated elsewhere; its arithmetic alone does **not**
select a 56×13 array or specify a cipher. No original instruction maps
these rows to corresponding page plaintext.

The two source-visible row arrangements are:

- **Final residual:** key for page `p` is opening rune offsets
  `13p ... 13p+12`, with offset 728 unused. This preserves the complete
  13-rune original red heading as key0.
- **Initial residual:** key for page `p` is offsets
  `1+13p ... 13+13p`, with offset0 unused.

This is a deliberately limited test. It does not try unconstrained
shifts, arbitrary key permutations, secret KDFs, or simulated state
fitting.

## Full original source inverse

Use [the self-contained CommonJS SFT](../sims/lp2_p0p2_56x13_pagekey_original_sft.cjs).
Input is `resources/liber-primus/lp2-corpus.json`; the test uses all
original rune-bearing physical pages **p3–p55**, excluding rune-free p50.
This gives **52 untouched pages, 12,227 genuine ciphertext runes**.
P0–p2 supply keys and are not counted as independent ciphertext tests.

For each page, test both key orientations, both signs, and these three
standard fully reversible, length-preserving receivers, with
`k` the original 13-rune page row and indices modulo 29:

1. Periodic Vigenère `P_i = C_i ± k_(i mod13)`.
2. Ciphertext autokey at lag13 `P_i = C_i ± (i<13 ? k_i : C_(i−13))`.
3. Plaintext autokey at lag13 `P_i = C_i ± (i<13 ? k_i : P_(i−13))`.

The 2 residual placements × 2 orientations × 2 signs × 3 receivers
give **24 frozen original-stream trials**. Each has a precise forward
inverse. All 24 independent synthetic encryptions of the genuine native
95-rune solved p57 control decrypt **exactly 95/95 runes**.

## Measured result

Across the 24 original-source inverses:

| Diagnostic | Original unknown ciphertext decoded |
| --- | --- |
| GP29 IoC across all 12,227 decoded runes | **0.034447–0.034515** |
| Pages with at least 100 runes | 49 |
| Long pages attaining GP29 IoC ≥ 0.050 | **0 / 49 in every trial** |
| Largest original long-page IoC in any trial | **0.038843** |
| Solved native p57 language control | 95 runes, GP29 IoC above 0.050 |
| Synthetic native p57 encrypt/decrypt plant | **24/24 exact reversals** |

The resulting strings remain near uniformly distributed over GP29.
This is decisive against these **direct** row-key readers as
self-contained recoveries of ordinary GP-native prose. It does not
exclude a deliberately encoded key table, a nonlinear state update,
a different output alphabet, a different grouping, or another way to
interpret the final rune.

## Decision

Preserve the exact source alignment as a possible clue but **do not
promote 56×13 to an authored key schedule**. Any successor needs an
independent original-image or first-party operation selecting how the
13-rune row controls a page, and must recover meaningful withheld
original plaintext with exact inverse reconstruction. A new
unmotivated KDF/clock sweep on this correspondence would duplicate the
broader key-search failures. The source count is an observation,
not cryptographic evidence of a selected key.
