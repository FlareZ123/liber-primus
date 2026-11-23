# P39-root24 floral checks cannot come from any fixed secret GF29 eight-column table combiner

**Agent18, 23 November 2026. Complete all-secret original-input mathematical exclusion, not plaintext recovery.** [Read-only Node.js 22 reproduction](../sims/lp2_floral203_p50_allsecret_linear8_checksum_sft.cjs). This closes a materially different, unrestricted-key variant of the [prior 203-rune parity investigation](lp2-floral203-p39-double-root-p50-32check-original-decision.md). It does not establish that the floral area contains a systematic code or that the numeric panel was created to hold check digits.

## Proposed human route and strongest rival

Original physical p39 highlights GP29 numbers **[27,5,15]**, equivalent to G(X)=15(X-24)^2 in GF(29). P50's first printed numeric token **3N** is **203** under the conventional radix60 reading. The sixteen floral-framed pp40–55 contain exactly **3,248 black runes = 16×203** after excluding their three independently visibly red spans. Sixteen 203-digit polynomials each require two parity checks to extend to multiples of G; the physical p49–51 panel contains **32 rows of eight numeric cells**. The original runes and numeric cell ordering are held fixed. These independent source structures motivate a *conditional* readout of 32 floral checks against 32 actual table rows.

Prior direct tests used table fifth-column digits, row means, each token column, independently chosen row cells and an unconstrained but **single-valued** token lookup. A substantively different historically plausible possibility is an unknown **eight-element linear key**, one weight per printed column reused across all 32 check rows. This combines *every* table cell and could yield check digits even when no individual cell matches. The rival is that the printed numeric table and floral words are unrelated operands: no author-authenticated first-party instruction selects GF29 parity or this cross-page alignment.

## Exact full-key challenge

Let B(r,j) be the 32×8 physically printed p49–51 numeric byte matrix reduced mod29, preserving original row-major position and the source's conventional radix60 values. For each mathematical 203-rune floral row in printed order, interpret all black GP indices as descending polynomial coefficients P_r(X), and compute p_r=P_r(24), d_r=P'_r(24).

Two conventional systematic parity rules produce pairs (u_r,v_r), with all arithmetic modulo29:

- **Append:** X²P_r(X)+u_r X+v_r has a double root at24. Therefore u_r=−48p_r−576d_r and v_r=−576p_r−24u_r.
- **Prepend:** u_r X^204+v_r X^203+P_r(X) has the double root. Therefore u_r=−d_r and v_r=−p_r−24u_r, using 24^203=1 and 203≡0 mod29.

Compare 32 check symbols with the 32 source table rows in either **interleaved** order u0,v0,u1,v1,… or **blocked** order u0,…,u15,v0,…,v15. In each, permit **all possible secret keys** w∈GF(29)^8 by s_r=Σ_j B(r,j)w_j, or a global intercept b∈GF(29) by s_r=Σ_j B(r,j)w_j+b. This exhausts **eight explicitly defined all-secret families**, including all 29^8 or 29^9 possible keys by linear algebra instead of sampling. No private per-row key, secret row permutation, nonlinear operator or guessed plaintext is permitted.

The original first eight *append* parity pairs, computed directly from original black rune input, are:

(6,3) (12,15) (25,16) (17,4) (1,6) (18,26) (25,12) (4,27).

## Exact algebraic outcome

A linear key exists if and only if the augmented matrix rank equals the coefficient-matrix rank over GF29. The complete original panel has **rank(B)=8** and **rank([B|1])=9**. Every source-derived check target lies outside both spans:

| Check rule | 32-output layout | rank(B) | rank([B|target]) | rank([B|1]) | rank([B|1|target]) |
|---|---|---:|---:|---:|---:|
| Append | Interleaved | 8 | **9** | 9 | **10** |
| Append | Blocked | 8 | **9** | 9 | **10** |
| Prepend | Interleaved | 8 | **9** | 9 | **10** |
| Prepend | Blocked | 8 | **9** | 9 | **10** |

The strict rank increase in every case proves **no secret eight-column linear key and no nine-parameter affine key can reproduce the whole source check stream**, irrespective of hidden key values.

An especially short original-input failure witness does not depend on language scoring: append/interleaved's **first eight source rows** determine unique weights [6,6,17,11,19,19,20,4], but those weights predict **4** in row nine while the independent check requires **1**. Adding an intercept, the first **nine** rows determine coefficients [13,14,24,14,16,21,10,2] plus b=14; row ten predicts **27** while its check requires **6**. These are exact source arithmetic contradictions, not merely unreadable decodes.

The reproducer asserts all original source spans and mathematical roots, regenerates the 16 real 203-rune vectors and all 32 parity digits, computes the eight full ranks, and constructs the unique 8/9-row keys and next held-out contradictions. An independent source-native **positive** uses the genuinely clear 95-rune p57 paragraph repeated to the declared 16×203 geometry; its two checks per row are fed into a synthetic 32×8 matrix preserving the first seven original columns while the eighth is computed from a previously fixed hidden eight-element key. The same rank solver identifies that key uniquely and recovers **32/32** native parity checks. This positive validates the detector without fitting any original unknown plaintext.

## Decision

Retire the **one shared GF29 linear/affine combiner of eight physically printed numeric columns** for either systematic double-root parity direction and either natural 32-symbol output ordering. Its impossibility is algebraic and cannot be repaired by searching more hidden weights. Other source-specified nonlinear combiners, a different table purpose, alternate genuinely instructed alignment, evolving keys or external operands remain mathematically possible, but this result supplies **no new original LP2 plaintext, author-key or continuation**. Do not enlarge the excluded family into arbitrary private per-row keys merely to rescue the failed association. The wider manuscript's unresolved status is unchanged.
