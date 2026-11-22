# Terminal 180-known-rune source grid: all-secret token + row + column additive gate

**13 November 2026, Agent15. Original-input negative. No page-55 plaintext, authentic key, decipherment operation, or destination.**

## Independently known material and proposed inverse

The original LP2 p49–51 table has precisely **32×8=256** two-character numeric tokens. The surrounding 76-cell perimeter has the same length as original p55 (76 ciphertext runes). Its 30×6 interior has 180 cells, matching the **85 independently decrypted runes of p56** plus **95 visibly clear p57 runes**. The solved p57 command “shed our own circumferences” motivates testing a geometry-derived separator. No Cicada instruction identifies this receiver assignment, mapping or table consumption.

An earlier exact [stationary-token lookup gate](lp2-p50-76-perimeter-180-interior-source-partition.md) shows that a secret fixed output value per interior token cannot fit 180 known GP29 symbols. The [existing full 2D field study](lp2-terminal256-original-inner-separable-gates.md) rejects fixed-affine byte slopes with row/column offset and low-rank row/column filters. The new test **allows each of the 127 distinct printed interior tokens to have an entirely arbitrary GP29 value, plus an arbitrary independent offset for each of the original 32 table rows and each of its eight columns**. That is a much larger secret function space than affine byte slopes and differs from the stationary lookup because repeated tokens may decode differently at different original row/column coordinates.

The hypothesized original plaintext at printed interior cell (r,c) is:

\[
P(r,c) \equiv F(T_{r,c}) + R_r + C_c \pmod{29},
\]

where **every** F, R and C is a free unknown in GF(29). Feed all 180 known source-plaintext runes as equations, **without observing or fitting the 76 unknown p55 runes**. If the equations are inconsistent, the proposed family cannot decode p55, regardless of the secret choices.

## Exact original result

| Quantity | Exact value |
| --- | ---: |
| Original interior known GP29 equations | **180** |
| Distinct original numeric tokens in that interior | **127** |
| Free token + row + column coefficients | **167** |
| Coefficient-matrix rank over GF(29) | **161** |
| Independent inconsistent zero-coefficient equations | **19** |
| Exact decoder solutions across all 29^167 possible secret assignments | **0** |

The exact matrix includes structural rank dependencies. **19** is the number of nonzero residual equations after deterministic row-reduced elimination, and is dependent on that elimination order. Existence/nonexistence is invariant. The more restrictive scalar-affine byte + linear-row + linear-column source model has rank4 and **168** residual contradictions.

A completely independent synthetic target was constructed with deterministic arbitrary F, R and C values on **the same 180 original source token/row/column cells**. The same Gaussian solver returns rank161 and **zero** contradictions, proving the procedure accepts genuine constructed matches in this large model. The authentic p56 prime-totient inversion uses the exact 84 consumed positions and one non-consuming literal F and recovers the original p56 opening **ANENDWITH**; p57 remains untouched.

## Decision

The original known p56+p57 data rejects any complete **additively separable stationary token+row+column** decoding of the 256-cell grid. This encompasses all possible unknown lookup outputs for each printed byte and all possible additive source row/column corrections. The source-supported 76/180 geometry remains attractive, but cannot select this family as a route to plaintext. It does **not** exclude nonadditive state, a historical nonlinear keyed operation, an independently instructed permutation, or a different interpretation of the source grid and its receivers. A subsequent route must supply source-visible evidence for that different operator.

[Exact original-input single-file test](../sims/lp2_p50_known180_token_rowcol_allsecret_sft.cjs) · [passing source-original Node.js 22 CI](https://github.com/FlareZ123/liber-primus/actions/runs/43384244825).
