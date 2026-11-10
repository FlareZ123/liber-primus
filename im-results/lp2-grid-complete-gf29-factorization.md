# Exact full GF(29) factorization of LP2's 256-byte numerical grid

**Classification: newly extracted complete original-source factorization and positional correlations. The factor arithmetic is exact. An intended cipher, key or plaintext remains unproved. Agent 32, 10 November 2026.**

## Canonical original inputs

The original LP2 page-49–51 printed table is a 32×8 layout of 256 two-digit base-60 entries. The repository source normalizes those entries to 256 unsigned bytes in row-major order. SHA-256 of the byte stream is:

3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290

Over GF(29), define the polynomial with exactly those 256 bytes as descending-power coefficient slots,

\[
P(X)=\sum_{i=0}^{255}(b_i\bmod29)X^{255-i}.
\]

The first byte \(b_0=203=7×29\) vanishes mod29, so this is canonically a polynomial of degree **254**. The choice of GF29 is suggested by the 29-symbol GP alphabet and the independently established p39 double-root factor.

## Complete factorization, not just the previously known roots

[Portable complete-factorization SFT](../sims/lp2_grid_gf29_factorization_sft.py) uses documented [SymPy finite-field factorization](https://docs.sympy.org/latest/modules/polys/reference.html) and reconstructs the full polynomial from all factors, preserving the mod29 unit \(28=-1\). The [successful manual CI run 42913117385](https://github.com/FlareZ123/liber-primus/actions/runs/42913117385) confirms the original source input and every exact coefficient invariant.

\[
\begin{aligned}
P(X)={}&28(X+5)^2(X^2+18X+11)\\
&\times(X^3+14X^2+16X+24)\\
&\times(X^9+12X^8+20X^7+10X^6+5X^5\\
&\qquad+X^4+9X^3+15X+11)\\
&\times Q_{238}(X)\pmod{29}.
\end{aligned}
\]

The complete monic irreducible factor degrees and multiplicities are exactly **(1,2), (2,1), (3,1), (9,1), (238,1)**. \(Q_{238}\) is monic and irreducible of degree 238. SHA-256 of its 239 byte-valued coefficients, high to low, each normalized 0–28, is:

9cb443bed228623bbd522efcd73888d3a4870c3db0ddcc147011765f3c8a9eb3

The repeated linear factor \(X+5=X-24\) and the quadratic \(X^2+18X+11\) are **already documented** as source-derived roots by Agents 39/24. The **additional irreducible cubic, nonic and degree-238 residual** complete that decomposition. The result cannot be obtained by merely dividing out the two earlier known factors.

## New numerical alignments and intended-path hypothesis

The degree of the product of *all factors except \(Q_{238}\)* is **16 = 2+2+3+9**, which matches the number of cells in the separate **4×4 Fibonacci-prime square on LP2 p15**.

The residual degree is **238 = 2×119**. The *only two source red three-rune inscriptions*, on LP2 pp3 and 39, each begin after exactly **119** preceding runes within their respective pages. The factor degrees **3** and **9** likewise match the marked-triple span length and the independent p15 first red title's **nine** runes. All of these source-position facts are verified from the original transcriptions in the SFT.

The readings above offer a concise testable hypothesis: the red triads might instruct how to remove recognizable polynomial factors and the residual 238 coefficients might represent **119 two-coordinate symbols over GF(29²)**, indexed by the repeated offset119. The displayed numeric agreements are exact but **retrospectively selected**. They do not establish this as a human puzzle route without an authenticated decoding that follows.

## Cross-artifact 119×2 affine register inverse

The 238 nonleading coefficients of \(Q_{238}\) form 119 pairs. Two independent printed source dimensions offer a specific geometrical test: p53's **128 black** runes become **119** after dropping the p15 red title's **9** runes at either edge; the terminal **127** (51 p53-red + 76 p55) become **119** after dropping the grid's **8** columns at either edge. Test both edge choices, adjacent/half-block source pairing, source reversal/swap, and target reversal/swap: **128 exact original geometric alignments**.

For each geometry, allow a completely *unknown* affine two-coordinate map \(Y_i=AX_i+b\) over GF29. Derive all six secret matrix/offset coordinates from the first **three affinely independent** aligned pairs, then test the remaining 116 original pairs without refitting. The maximum is only **4/119 fully matched original pairs**, including the **three** forced fit pairs; the sole additional hit is insufficient to identify a map or plaintext. In a native positive control, an independently planted nonsingular 2×2 affine map and source-fixed margins recover **119/119** pairs. This is an all-secret-key exclusion for **this affine 119-pair interpretation**, and it is distinct from the previously tested 127-target stationary pair lookup.

The source-to-target relationship could still be nonlinear, position dependent or differently indexed. The negative preserves the meaningful 2×119 clue while blocking a simple direct field-map claim. The [complete factorization SFT](../sims/lp2_grid_gf29_factorization_sft.py) includes both exact inversions and their plant.

## Immediate original-payload checks and outcome

Using the monic \(Q_{238}\) factor, discard its formal leading one and read the remaining **238 coefficients as GP29 indices**. Their index of coincidence is only **0.034633100102**, close to the uniform-symbol baseline \(1/29\). Interpret those same base29 coefficients as one big-endian integer and serialize as bytes: it produces **145 bytes**, of which **49** are printable 7-bit ASCII; no plain-language payload or recognized header is present. Pairing 238 coefficients as 119 GF29² elements and projecting their trace or norm in the natural adjacent/half-block layouts also produces near-uniform GP29 data, not text (exploratory direct controls).

The direct 119-column shared-pad interpretation \(A_i-B_i\bmod29\) has IoC **0.032474006552**, with no plaintext; \(A_i+B_i\bmod29\) has IoC **0.034895314058**. Thus neither direct pairwise sum/difference nor its straightforward field projections identifies the intended language.

**Research decision:** the source factorization produces a more constrained 119-pair artifact worth testing against *independently signaled transformations*. It has not decrypted the source. A successful next step must specify which factor(s), 119-pair reading and operation are pointed to by the original artwork or inscriptions, and must recover reproducible native plaintext. More unsourced affine key sweeps over these 119 pairs would repeat earlier failures.
