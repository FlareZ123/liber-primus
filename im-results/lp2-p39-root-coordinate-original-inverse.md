# P39 repeated-root coordinate inverse: original LP2 negative

**Agent 3, 24 November 2026.** Finite source-motivated experiment, no unknown plaintext or authentic decoder. [Runnable Node CommonJS reproducer](../sims/lp2_p39_root_coordinate_sft.cjs).

The actual p39 highlighted triple [27,5,15] gives G(X)=27+5X+15X²=15(X+5)² over GF29, with double root r=3301 mod29=24. Earlier work established the matching root of the numeric table's F16 factor and p15 spiral [source relation](lp2-p39-p50-r238-red5-lag16-original-alignment.md). It rejected direct R238/E235 additive consumers and direct quotient/circulant transforms. A distinct natural mathematical operation is the *coordinate translation* X→X+r, which places the source repeated root at zero. Treat the recipient's complete original rune tape as polynomial coefficients C in printed or reverse order. The candidate decoder computes P(X)=C(X+r); re-encoding uses C(X)=P(X−r). Both signs are natural coordinate conventions. This is full triangular cross-rune mixing, distinct from the previous quadratic FIR or derivative-clock pad. No author instruction selects the operation or its receiver.

For low-first coefficients, P_j=Σ_{i≥j} binom(i,j) r^(i−j) C_i mod29. Lucas' theorem and Frobenius reduce this to a 29-wide digitwise triangular transform, retaining all original coefficient positions and running in O(29 N log_29 N). Independent Horner evaluation agrees on authentic p57; the 95-rune native plant is recovered exactly. All original modes re-encrypt exactly.

| Original source | N | Raw IoC | Best of four source modes |
| --- | ---: | ---: | ---: |
| p39 | 240 | .035774059 | .036576011 |
| p34–39, continuous | 1466 | .034473318 | .034528261 |
| p0 black body, offset13 | 249 | .034363259 | .035399663 |
| p0–55, continuous | 12956 | .034478398 | .034500490 |
| Genuine clear p57 (control) | 95 | .062709966 | exact recovery |

The 220 separate physical-page modes (55 rune-bearing pages × 2 signs × 2 coefficient orders) have highest IoC .042148760 on p32 (r24 reverse), with opening GP output `L-H-H-EA-E-U-E-H-TH-U-H-EA-IA-Y-I-H-E-IA-B-O-NG-A-D-B-S`. Next highest p55 .040350877. No visible sustained native prose in the original outputs inspected; all continuous receiver scores remain close to uniform 1/29. IoC and opening inspection are only diagnostics, not a comprehensive language test or a general theorem about polynomial transforms.

**Decision:** retire this particular direct root-coordinate decoder on the specified original tapes. A shared root is an exact algebraic fact but does not establish this cipher. Further arbitrary coordinates, hidden rescalings and post-selected polynomial operations are low priority absent an independent source instruction. No claim of a CI run; core arithmetic executed against the canonical original corpus in the JavaScript runtime.
