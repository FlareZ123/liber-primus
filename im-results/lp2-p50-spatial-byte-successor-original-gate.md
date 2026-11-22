# LP2 pp49–51 numerical-table successor paths: exploratory original-source spatial gate

**Classification (14 November 2026, Agent 6):** A reproducible **spatial ordering anomaly** exists in the 256 source byte cells. It does not recover unknown runic plaintext, a key, a decipherment operation or a destination. Its null-model strength depends on what features of the printed grid are held fixed, and the motivating upper-tail example was selected on inspection. It must not be read as a confirmatory cryptographic p-value.

## Original object and discriminating question

Original LP2 physical p49–p51 (archive scans **66.jpg, 67.jpg, 68.jpg**) print 80, 104 and 72 base60 tokens in eight columns, totaling **32×8 = 256** cells. Use the existing canonical `resources/liber-primus/base60-grid.json`; no OCR correction, alternate radix or interpolation. The decoded 256 source bytes have SHA256
`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, with 161 distinct byte values.

An original-image inspection shows the top-end tokens `4D`, `4E`, `4F` on consecutive/nearby grid rows in p49, and `48`, `49`, `4A`, `4B` grouped near the end of p50. Because these are numerically consecutive under the **already established** base60 decoder, ask whether **all** consecutive byte-value pairs preferentially occupy neighboring cells in the original 32×8 geometry. This tests a possible human-visible *numeric route* instead of fitting a key to runic ciphertext.

Define an edge from grid cell i to any horizontal, vertical or diagonal neighbor j iff `B[j] = B[i] + 1`. Count all directed edges, length-two walks (three cell values consecutively increasing), and the longest strictly increasing-by-one walk. No start address, direction order, alphabet, key, or unknown plaintext is optimized.

## Exact original observation

- **14** directed +1 neighbor edges; **four** three-cell walks; maximum walk contains **four cells**.
- p49: **49→57→66**, original tokens `4D→4E→4F`, base60 bytes **253→254→255**, printed row/column **(7,1)→(8,1)→(9,2)** in the joined 32×8 grid.
- p50: **160→159→167→158** and **168→159→167→158**, both reading **248→249→250→251**, namely `48→49→4A→4B`. The two starts are the `48` tokens at joined-grid **(20,8)** and **(21,8)**.
- The four three-cell walks consist of the p49 253–255 path, the p50 249–251 path, and both possible p50 248–250 prefixes. **252 (`4C`) is absent from the canonical 256 bytes.** This absence is a descriptive fact, not proof that a missing byte or letter is a cipher clue.

The observed three-cell count covers every source byte and every spatial direction under this frozen edge definition. It is more informative than citing one attractive upper-tail triple. It is still a selected metric: the near-maximum sequence motivated the test.

## Finite source-preserving comparisons

The reproducer `sims/lp2_p50_spatial_byte_successor_sft.cjs` uses a fixed-seed Fisher–Yates implementation, frozen whole-grid metric, exact source SHA, and a source-multiset-preserving positive plant with a detectable six-cell ordered path. It runs **10,000** controls in each named stratum when executed, printing exact means, exceedance counts and add-one tails. The exploratory calculations that motivated the script, using independent 6,000/7,000-control streams, produced:

| Null (exact bytes retained, permutations limited to) | N | Mean edges | Mean triples | Tail for ≥14 edges | Tail for ≥4 triples |
| --- | ---: | ---: | ---: | ---: | ---: |
| Whole table | 6,000 | 7.080 | 0.196 | 0.01250 | 0.00050 |
| Each physical table page | 6,000 | 6.694 | 0.177 | 0.00667 | 0.00050 |
| Each eight-cell printed row | 6,000 | 6.858 | 0.478 | 0.00217 | 0.00133 |
| Each printed column | 6,000 | 7.896 | 0.218 | 0.02216 | 0.00017 |
| Each base60 high-digit band | 7,000 | 8.529 | 0.535 | 0.04442 | 0.00671 |
| Each GP29 quotient band | 7,000 | 8.432 | 0.344 | 0.03957 | 0.00214 |
| Each high nibble | 7,000 | 8.981 | 0.648 | 0.05985 | 0.01086 |
| **Each printed row AND base60 high-digit band** | 7,000 | **11.937** | **2.959** | **0.19854** | **0.34995** |

The stringent final null preserves both every row's high-digit placements and its exact within-band byte inventory. It makes the observed ordered triples comparatively ordinary. Thus the signal is largely attributable to how high-valued token *bands* are spatially grouped; it is **not** independent evidence that their *low digits* encode a deliberate successor walk. Nor do any of these exploratory tails correct for choosing +1 and eight-neighbor geometry after noticing the 253–255 example, or for other investigated numeric patterns.

## Separate visible high-digit concentration in the same original ink

The numeric path above led to a second, **simpler source-visible** question. Original **p50 scan67.jpg** prints row10 `3p 0X 0E 1q 0q 4B 49 48`, followed by row11 `3r 3b 3C 1M 1j 0I 4A 48`. These are original p50-local rows10–11, the joined grid rows20–21. In their last three columns, **five of six printed two-digit tokens start with literal `4`**, the highest attainable sexagesimal high digit for a byte ≤255. The actual values are `4B,49,48 / 0I,4A,48`, a compact original-image cluster that needs no proposed keypad graph or rune key. Only **17 of 256** cells in the whole original table have high digit4.

Scanning **every contiguous 2×3 rectangle** in the full 32×8 printed grid, the **unique** maximum is **five digit4 tokens** at joined row20/column6. A 25,000-draw exact-byte source-row permutation comparison originally gave **312/25,000** arrangements reaching a maximum of five (add-one tail **0.01252**); an independent 30,000-draw source-row comparison gave **355/30,000**, tail **0.011866**. The latter also checked the joint original conditions: maximum digit4 occupancy at least5 **and** at least four successive-value three-cell paths occurred in **21/30,000**, add-one **0.0007333**. For the same exact 30,000 source-row null, ≥14 directed edges had tail **0.0015333**, ≥4 triples **0.0016333**, and ≥2 four-cell walks **0.0044332**. Each shuffle preserves every eight-cell printed row's **complete original byte multiset**, so the local top-band cluster exceeds simple random left/right placement within its original two rows.

The second table is a *post-discovery metric on the same unusual region*; the joint tail cannot be interpreted as prospective independent evidence or multiplied with the earlier tails. The `4` band is rare by construction, the 2×3 rectangle and threshold were noticed after inspection, and the whole table's high digits may have been arranged under an unknown fixed image or layout process. The much weaker **p≈0.35** low-byte successor result when *all original high-digit positions are preserved* remains the strongest warning against treating the pretty `48→49→4A→4B` path as an authenticated navigation code. The visual high-digit hotspot is a useful **source-region localization** for future independent clues; it does not identify a start, a direction, a key or a reverse transform.

A hexadecimal-only reinterpretation of the seven printed tokens produces ASCII `H/I/J/K` and `M/N/O`, with the unseen `4C` corresponding to `L`. This is a retrospective second radix that the original signed 2013 BASE29 and the manuscript's canonical base60 convention do **not** authorize; it supplies no readable instruction or unknown LP2 plaintext. Refrain from inventing the missing letter or adding it to ciphertext.

The same [spatial original-source SFT](../sims/lp2_p50_spatial_byte_successor_sft.cjs) checks the unique high-digit hotspot, a 6/6 synthetic high-digit positive, and **30,000** fixed-seed within-row shuffles with the joint criteria above. Its original and regression runs use the same pinned source bytes and are published through the dispatch-only [p50 source workflow](../.github/workflows/lp2-p50-original-spatial-manual.yml).

## Relevance to original-cipher inversion and decision

The 2016 authenticated sentence about the book's **numbers** giving **direction** makes a spatial numeric traversal a plausible question, and the original table literally has eight printed columns. But nothing first-party specifies an increasing-by-one rule, the 253/248 starting values, a direction when paths branch, an interpretation of the missing 252, or how a seven-cell upper-tail path supplies an inverse for 12,956 unknown runes. The earlier 29q+r keypad/GEM graph is a different, explicitly provisional geometric interpretation; do not combine their postselected readouts into a decoder.

**Next causal gate:** seek an independently authenticated original-page instruction or historical source identifying an ascending byte walk, fixed starting index and how its visited cells produce a complete key or plaintext-bearing operation. If such a selector is found, freeze the algorithm and test on withheld original LP2 ciphertext; otherwise retire only this numeric-neighborhood read as an interesting but undecoded source pattern. Do not launch brute-force start/rotation/offset menus or promote `4C` to a missing “L” plaintext claim.

## Reproduction

Run `node sims/lp2_p50_spatial_byte_successor_sft.cjs` from the repository root. It reads only the unchanged canonical grid, checks its SHA256, validates the exact paths and a planted ordered six-cell path, then prints each conditional permutation comparison. No external downloads or mutable files are required. The exploratory numbers above came from direct JS execution on the same canonical source before the standalone file was authored; the standalone's separately seeded 10,000-draw tails may differ modestly.
