# LP2 p8: the source-fixed 243-entry ternary tensor has maximal polynomial degree

**Agent 36, 22 November 2026. Classification: exact original-cipher structural exclusion for two specified interpolation registers. No recovered plaintext, original key, intended operation or destination.**

## Independent source operands and competing interpretation

Original physical LP2 p7 ends in five separate red words with lengths **2, 4, 3, 2, 3**; their GP29 ordinal products are **[11, 26, 8, 15, 2]**. The next physical p8 starts with 12 red runes (first word `XIXM`), followed by exactly **243 black GP29 runes = 3⁵**. The adjacent red inscriptions also supply the already documented cubic GF29 orbit `2 → 8 → 19 → 15 → 11 → 26 → 2`, with p8 M19 completing the five p7 products.

One materially different explanation from an enciphered 243-rune sentence is a **polynomial evaluation table**: five trit coordinates, three samples per coordinate, with the 243 printed symbols representing outputs of an unknown *low-total-degree* GF29 function. This would provide a compact source-defined key/function rather than a direct human-language plaintext. A previously tested five-dimensional Vandermonde inverse gave nonlinguistic coefficients; this test asks the stronger **language-independent question** of whether the *entire original table* could have come from a polynomial of total degree below the maximum.

The source does **not** state that p8 is a polynomial table, choose a coordinate order, or prescribe interpolation. Thus the check is a strict conditional decision, with no claim of creator intent.

## Exact no-secret degree certificate

For 243 printed black runes, number positions with five ternary digits in the natural reading order, first axis changing fastest: `i=t0+3*t1+9*t2+27*t3+81*t4`. Interpolate the unique polynomial that has degree at most 2 in each of the five variables, using one of two frozen, independent coordinate schemes:

1. **Canonical:** each axis is evaluated at the standard field points `[0,1,2]`.
2. **Source-cubing:** each axis `j` uses the three field points `[rj,rj³,rj⁹] mod29` for the p7 red-word products `r=[11,26,8,15,2]` in printed order. The five exact triplets are `[[11,26,2],[26,2,8],[8,19,15],[15,11,26],[2,8,19]]`.

Both grids have distinct points in every axis, so the five separable 3×3 Vandermonde matrices are invertible. Every candidate table has a **unique polynomial** in the 243 monomial basis slots. The last coefficient (index242), attached to `x0²*x1²*x2²*x3²*x4²`, must be **zero for every possible polynomial of total degree at most 9**. This requirement is independent of all polynomial coefficients, keys, native-language assumptions, and ciphertext scoring.

| Fixed original-source interpolation | Top degree-10 coefficient | Zero coefficients in all 243 positions | Zeros among 96 coefficients of degree 6–10 |
| --- | ---: | ---: | ---: |
| Canonical trits 0/1/2 | **16** | 16 | 8 |
| Printed five-product cubing axes | **10** | 8 | 3 |

Both original top coefficients are **nonzero**, proving that each unique interpolant has the **maximum possible total degree 10**. The whole table therefore cannot equal any lower-total-degree polynomial function on **either exact five-axis point set**, regardless of how its coefficients are chosen. In particular, a Shamir-like degree-four/five lookup polynomial cannot literally explain the complete original body in these two source-fixed representations.

The checked-in test reconstructs all 243 original source symbols exactly after **inverse then forward interpolation** in both coordinate systems. For a separate independent positive plant, it creates a genuine degree-four-or-less GF29 polynomial coefficient tensor, evaluates it on each complete 243-point grid, interpolates the ciphertext back to **243/243** original coefficients, and asserts that all coefficients of degree at least six vanish. The test is an actual positive for the model it excludes on p8, rather than a language-likeness check.

## Consequence and limits

This is an exact exclusion for **literal polynomial-table generation** under the two source-fixed evaluation grids, independent of language or secret polynomial coefficients. It cannot exclude a genuine polynomial table whose outputs were subsequently encrypted with a separately sourced keystream, a different coordinate assignment or point set, binary encoding, non-polynomial generator, or the more ordinary interpretation that p8 is encrypted prose. It does not turn the nonzero coefficient values 16 and 10 into keys or interpretations.

Previously reported direct GF29 Vandermonde **plaintext inverse** failures addressed whether transformed coefficients *read as language*. This degree certificate addresses the separate **key-independent low-degree-table premise**. It is not grounds for more interpolant, axis-order, phase or exponent searches without an independently authored selector.

**Reproduce:** [single-file read-only Node22 SFT](../sims/lp2_p8_source_ternary_polynomial_degree_sft.cjs), on the unchanged original `lp2-corpus.json` and `lp2-ink-annotations.json`. [Original Windows Node22 CI PASS, run 44965831898](https://github.com/FlareZ123/liber-primus/actions/runs/44965831898). No established plaintext or general decipherment result is promoted to `results/`.
