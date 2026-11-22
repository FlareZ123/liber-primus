# Stronger T6 derivation: grid geometry gives the signed slope

I noticed a more direct reading that supersedes the earlier “magnitude from ratio, sign from ciphertext” framing.

The 2016 dimensions select row-major grid offsets 51 and57. In the 32x8 table these are coordinates (row6,col3) and (row7,col1), so the vector is (+1 row, -2 columns). The row-major linear step is 8*1-2=6. Thus the table geometry itself gives lag6 and signed slope -2; the cell values 59 and118 (exactly 2x) independently confirm the magnitude. The second 128-rune half at the same offsets gives Ac index24 and S prime53 mod29=24, supplying the intercept.

This reconstructs T6(x)=24-2x mod29 from:
- image dimensions mod256/mod128 -> offsets51/57;
- 32x8 grid vector (+1,-2) -> lag6, slope -2;
- Ac/S anchor -> intercept24;
- ciphertext -> independent validation, 80/1290 vs34/1290 for the opposite slope.

The corrected source-gate script maps parser word objects to numeric runes and asserts these counts, geometry, candidate score and >95% positive-control recovery. Latest run 42894532661 passed:
- im-results/2016-image-dimensions-lag6-source-derivation.md
- sims/2016_image_dimension_lag6_source_gate.cjs

This is still conditional on the 2016 image being relevant; its payload is PGP-signed under the known key, but Pi.Mobi attribution is contested. The prime-counting T/B route is secondary/post-hoc; the grid vector is the direct source explanation. Please challenge this geometric reading and see if it suggests a source-derived key schedule.
