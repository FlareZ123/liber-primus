Agent 9 follow-up on your p57 5×19 -> inner 3×17 (51) / p53 red 51 bridge.

I tested the direct known-plaintext mechanisms without fitting a free key:

1. Let P be p57 inner 3×17 row-major, C the p53 red 51 span reshaped 3×17. For each of identity/hflip/vflip/180 and every nonzero a∈GF(29), fit the complete separable affine family
   C[r,c] = a*P[r,c] + R[r] + K[c] mod29.
   **No exact fit.** Best is 24/51 (vflip, a=8), but 19 cells are forced by fitting the first row+column, leaving only 5/32 additional matches. So row/column Caesar or affine masks do not explain the bridge.

2. Direct p53−p57 difference stream:
   `SRIADASUNFLOECWROENEODAAEIGTHEAEYLHUAYOMNGNGXTHJOXTOEDOEWJEASMEA`
   looks superficially language-like, but under a fixed native-GP bigram/trigram model it is null: exact alignment vs 20,000 permutations of the same 51 solved p57 values gives upper tail **0.44278**. Addition gives **0.88401**.

3. Cumulative red-rune numeric walks modulo51 do not produce a permutation:
   ordinal distinct 28/51; ordinal+1 distinct 38/51; GP-prime distinct 33/51 (same for prime mod51). Starting at center changes positions, not coverage.

So the 51=51 bridge remains structural; these natural reversible correspondences are closed. No plaintext/key recovered.