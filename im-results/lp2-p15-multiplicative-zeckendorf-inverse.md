# P15 multiplicative Zeckendorf prime-distance interpolation

## Result

A new **multiplicative**, not additive, extension of the exact p15 prime-distance spiral fails on p15 body through p22, even after blind fitting of all Zeckendorf weights. The blind solver recovers all 102 hidden coefficients and all 11,298 runes on six independent donor plants. It does not recover original LP2 plaintext.

## Source rule and inverse

The 16 printed distances equal |3301-prime[F+1]| at F=0,1,2,3,5,...,987. Their GP29 residues are all nonzero: 22,21,19,17,11,1,10,3,20,22,25,7,22,12,17,21. The next unprinted value (F=1597) has residue 26. Define a multiplicative interpolation through these samples using Zeckendorf digits z_k of n:

    K(n) = K(0) * product_k ((K(F_k)/K(0))^z_k(n)) mod 29
    C_i = P_i * K(j) mod 29

The primitive generator 2 gives a log-domain additive model modulo 28, with 17 coefficients (constant plus 16 digits through 1597). The source key in log coordinates is [26,19,11,23,27,2,25,7,26,0,18,14,0,9,23,19,21]. Both ordinary clocks and transparent-F clocks are evaluated. Here F is a fixed point, so transparent holds are directly observed as ciphertext zeroes, unlike additive clocks. There is no unknown hold mask.

The source explicitly supports the prime-distance samples, not multiplicative interpolation or the cipher law. The latter are hypotheses. No arbitrary extra layer was fitted.

## Blind inversion

For each weight, compare nonzero ciphertext positions at clock distance F_k whose Zeckendorf masks differ only in digit k. In discrete logs all other coefficients cancel. Rank each of 28 possible differences under the corresponding empirical plaintext log-difference distribution, then optimize joint hierarchical trigram likelihood over six deterministic seeded initializations and up to ten coordinate sweeps. Each update scores only changed trigram terms. Native solved GP29, Gibran and Shakespeare are the training language sources; Emerson supplies six separately positioned, unseen plant spans. All key fitting stops at the end of physical p21 (1752 runes of the 1883-rune target), and p22 (131 runes) is decoded with frozen weights. Every highest-order coefficient has at least 91 direct original fitting pairs.

| Clock | Fixed source fit | Fixed source p22 | Blind fit | Blind p22 |
|---|---:|---:|---:|---:|
| Ordinary | -3.186251 | -3.054216 | -2.575792 | -3.107749 |
| F hold | -3.137239 | -3.921411 | -2.548569 | -3.103008 |

Scores are natural log likelihood ratios per rune against uniform GP29. Six donor plants: 102/102 coefficients, 10512/10512 fitting runes and 786/786 held runes recovered; held scores +0.7744 to +1.0783. Neither original fixed nor blind output is readable; blind fits do not generalize to p22. This is a calibrated heuristic rejection of blind arbitrary multiplicative digit weights, not exhaustive UNSAT. The fixed source keys have unique inverses and fail directly. The same result does not exclude other nonzero fixed-point cipher laws.

## Reproduction

`node sims/lp2_p15_multiplicative_zeckendorf_inverse_sft.cjs` from repository root. Raw outputs with frozen input blob SHAs: [JSON](lp2-p15-multiplicative-zeckendorf-inverse.json). Code and raw results executed in the connected JS runtime and committed at c53dca5a and b9ff7a1a. Standalone Windows CI was not run. No new original key, plaintext or destination; no authoritative synthesis update warranted.
