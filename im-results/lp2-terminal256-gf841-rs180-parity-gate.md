# Terminal 256-symbol ring: frozen GF(29²) 180-data / 76-parity test

**Research classification:** finite original-cipher negative, 12 November 2026. No unknown plaintext, authentic key or original decoding rule has been recovered. The explicit field interpolation architecture below is *proposed*, not an authenticated Cicada operation.

## A motivated human-visible possibility

The original 32×8 printed grid occupies physical pp49–51 and has four successive rectangular clockwise rings containing **76, 68, 60 and 52 cells**. The final three LP2 pages are **76** unknown runes on p55, then **85+95=180** solved runes on pp56–57. Thus the first 76 positions of an outside-in ring read could hold the unknown outer ring and the remaining 180 the source-solved inner rings. In this order the innermost 52 slots begin at p57's solved word **SHED**, matching the explicit solved "shed our own circumferences" language. This supplies a concrete geometry, although the source does not say to combine three pages into an error-correcting code.

Separately, the original p3 red quadratic defines the extension field GF(29²) in basis `1,u` with `u²=3u+8`. The conventional base60 reading of the source pp49–51 table, followed by the p39/p3 polynomial quotient, gives the primitive field element **g=19+13u**, of multiplicative order **840**. These facts were established before this test in [the exact field analysis](p50-p39-p3-field-remainder.md). The source does not prescribe Reed–Solomon coding, polynomial degree 179, or evaluation points in geometric progression; the cross-artifact proposal is an exploratory candidate with a clear independent prediction.

## Frozen candidate, original input and positive control

For the 256 clockwise ring positions, choose **x[j]=g^j**, j=0,…,255. All 256 points are distinct. Interpret each original GP29 rune index as the subfield value `(rune,0)` in GF(29²). If the 256 final runes formed a systematic **[256,180] polynomial evaluation codeword**, the known 180 GP29 rune values at positions 76–255 uniquely determine a degree-at-most-179 polynomial. Newton interpolation over the exact GF841 arithmetic then fixes **all 76** unknown outer slots *without inspecting the original p55 ciphertext*. This is a decisive original-input prediction rather than a fitted language score.

The original p56–57 values interpolate exactly by construction. Of the 76 predicted outer symbols, only **2** lie in the GP29 subfield; neither matches the actual GP29 rune at its position. The complete original p55 ciphertext therefore matches **0/76** field-code predictions. For four fixed, natural field-to-GP29 projections, the observed matches are:

| Fixed output map | Matches to original p55 | Output IoC |
| --- | ---: | ---: |
| First basis coordinate `a` | 6/76 | 0.03368421 |
| Second basis coordinate `b` | 5/76 | 0.03263158 |
| Field trace `2a+3b` | 4/76 | 0.03333333 |
| Field norm `a²+3ab−8b²` | 0/76 | 0.03824561 |

These match counts are chance-scale, with no plaintext evidence or identified recovery map. The first 20 unprojected outer predictions are `(4,4),(7,10),(16,3),(16,18),(18,10),(10,0),(19,12),(20,22),(10,7),(18,6),(4,8),(21,13),(18,10),(2,8),(1,16),(27,11),(1,26),(10,26),(11,22),(20,9)`, so the full-source result can be independently spot-checked.

As a positive control, 180 frozen GF841 polynomial coefficients `(11j+7 mod29,17j+5 mod29)` were evaluated at all 256 `g^j` points. Interpolating only the final 180 planted evaluations recovers the withheld first 76 field symbols **76/76 exactly**.

The complete self-contained CommonJS source-input reproducer is [sims/lp2_terminal256_gf841_rs180_parity_sft.cjs](../sims/lp2_terminal256_gf841_rs180_parity_sft.cjs). It reads the canonical [LP2 corpus](../resources/liber-primus/lp2-corpus.json), checks printed geometry, performs exact field arithmetic and evaluates all four output projections. The original arithmetic was separately run before the reproducer was committed.

## Cryptanalytic consequence

This **rules out exactly** the direct GP29-subfield polynomial-evaluation reading with 180 solved trailing symbols and 76 original outer symbols, using the original ring order and published grid-derived primitive element. Its four fixed coordinate/trace/norm readouts also fail to predict the existing p55 rune sequence. A different degree, permutation, information register, field, evaluation ordering or secret projection would be a different model; the manuscript has not supplied a selector for any of those freedoms.

The geometry remains a useful *candidate clue*. A concrete original instruction choosing a different ECC consumer, field map or framing would make a new finite test worthwhile. The present negative has no causal implication that the actual unknown p55 plaintext must be an error-correcting parity block, and should not lead to a general Reed–Solomon parameter sweep.
