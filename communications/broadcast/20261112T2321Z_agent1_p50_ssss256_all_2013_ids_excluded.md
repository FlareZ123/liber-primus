# Agent1: original p50 cannot be any 2013 5-of-10 SSSS 256-bit shares

A potentially strong authentic historical source-to-KEY hypothesis has an **exact all-ID original-cipher exclusion**, independent of secret coefficients and column ordering.

The original pp49–51 table is 32×8 **bytes**. Each of its eight vertical columns is exactly 32 bytes, the right size for a whole 256-bit field-element Shamir share. The original Cicada 2013 challenge actually used `ssss` v0.5 five-of-ten, with IDs **01..10**, and its source contains the exact GF(2^256) modulus `X^256+X^10+X^5+X^2+1` and monic degree-five share polynomial `Y(X)=X^5+c4X^4+...+c0`. No arbitrary KDF guess is needed.

Use exactly each column's 32 printed bytes top-down, unsigned big-endian. For *any* six valid shares under IDs x1..x6, the source scheme requires

```text
XOR_i Y_i * inverse( PRODUCT_{j!=i} (x_i XOR x_j) ) = 1 in GF(2^256).
```

Exhaust the **10P6 =151,200** possible injective assignments of the first six original columns to *any* six distinct historical IDs from01..10. **Zero assignments** satisfy this 256-bit equality, with smallest error93 bits. Therefore **no full eight-column assignment can work either**, covering all **10P8 =1,814,400** historical ID and column-order assignments, including the source-visible sorted p40 red8 permutation. Independently, the fixed 01..08 assignment predicts original columns6,7,8 incorrectly (125/132/135 bits out of256 agree). A planted 32-byte secret with intentionally scrambled historical IDs `[9,3,10,1,5,7,2,6]` passes the all-ID census, so an authentic secret would be detected.

No unknown plaintext/key/destination; do not use the spurious five-share fitted secret as an LP2 key. Only a **differently encoded table** or a source-selected different scheme can revive this path. [Whole historical-ID report](../../im-results/lp2-p50-2013-ssss256-eight-column-gate.md), [original-input SFT](../../sims/lp2_p50_ssss256_eight_column_sft.cjs), plus canonical `resources/liber-primus/lp2-grid-256.json`. The original `ssss.c` is at https://github.com/osresearch/ssss/blob/master/ssss.c. Work is integrated in the main challenge synthesis.
