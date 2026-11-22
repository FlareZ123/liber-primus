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

## Exact all-secret tensor-rank bound

A second **basis-independent** structural question is whether the p8 243-rune object is a sum of the **five** separable terms suggested by p7's five red words, possibly after *unknown invertible 3×3 substitutions on each axis*. Unlike an additive cipher search, this has a strict all-key necessary condition. If the tensor is a sum of `r` pure five-axis products over GF29, **every** matrix flattening into two ternary axes (9 rows) versus the other three axes (27 columns) has rank at most `r`. Applying any invertible 3×3 operator independently to each axis preserves **all flattening ranks** by invertible left/right matrix multiplication. This encompasses any per-axis unknown invertible Vandermonde or 3×3 secret basis.

Enumerate the **ten** unordered choices of two row axes among the five source-order ternary digits. The exact original 9×27 matrix for each one has **full rank 9 over GF29**:

| Source-order row axes | (0,1) | (0,2) | (0,3) | (0,4) | (1,2) | (1,3) | (1,4) | (2,3) | (2,4) | (3,4) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Original rank | **9** | **9** | **9** | **9** | **9** | **9** | **9** | **9** | **9** | **9** |

The canonical tensor rank of this original input is therefore **at least 9**, so *no* sum of eight or fewer separable five-axis GF29 products could have generated it under the frozen source-order tensor interpretation, **even granting arbitrary unknown invertible 3×3 basis changes on every axis**. The SFT also generates an independently planted *five-term separable tensor* and verifies ranks at most five in all ten flattenings. Full rank is common for a random source tensor; this is an exact lower bound on the specified construction, never statistical evidence of intended cipher design.

This result is **independent** of the preceding maximal-degree certificate: a tensor could have low polynomial total degree but high rank, or maximal degree and low rank. Together they reject two distinct low-complexity explanations of p8 as a raw five-variable table. They leave intact the possibility of an additional encrypting layer or a wholly different ciphertext register.

## A distinct 238+5 original-source keystream prediction

The full p49–51 256-byte numeric table has an established, exact GF29 polynomial factorization that leaves a unique irreducible **degree-238** quotient `Q238` after removing the four documented small factors of combined degree16. P8's exact **243 black runes** then create a strictly source-sized candidate: its first **238** runes could be a complete hidden LFSR seed, with the remaining **five** runes serving as observable, unchosen held-out predictions. The five visually distinct red-word values on p7 provide an independently visible five-slot motif. This is a different direct hypothesis from interpreting the 243 runes as a five-variable interpolation table.

The exact original 256-byte factor reconstruction is
`P(X)=28(X+5)^2(X²+18X+11)(X³+14X²+16X+24)(X⁹+12X⁸+20X⁷+10X⁶+5X⁵+X⁴+9X³+15X+11)Q238(X)` modulo29, with **zero remainder**. Interpret the monic `Q238` as the 238-state homogeneous linear recurrence and initialize from the first 238 unchanged black p8 rune indices. The actual five untouched trailing p8 black indices are **`[10,28,26,9,12]`**. The direct original-factor recurrence predicts **`[4,5,26,1,4]`**, matching exactly **1/5** original positions. The monic reciprocal-factor recurrence predicts **`[25,13,12,8,19]`**, matching **0/5**. No key or unknown prefix is fitted. Each recurrence independently succeeds on a separate correctly generated 238-state and five-heldout symbol plant, while the original p50 table's GF29 source factorization roundtrips exactly.

The [single-source Node22 SFT](../sims/lp2_p8_q238_fiveword_recurrence_heldout_sft.cjs) implements the complete original polynomials, reproduces both held-out predictions and independent controls. [CI result](https://github.com/FlareZ123/liber-primus/actions/runs/44969251878). **Decision:** the physically motivated direct and reciprocal `Q238` linear recurrences **fail to predict the p8 black body** under this frozen first238/last5 split. No claim about an alternative authored clock, a separate encrypted layer or altered source register follows. The 238+5 size agreement remains an interesting hypothesis prompt and supplies no key or plaintext.

## Consequence and limits

This is an exact exclusion for **literal polynomial-table generation** under the two source-fixed evaluation grids, independent of language or secret polynomial coefficients. It cannot exclude a genuine polynomial table whose outputs were subsequently encrypted with a separately sourced keystream, a different coordinate assignment or point set, binary encoding, non-polynomial generator, or the more ordinary interpretation that p8 is encrypted prose. It does not turn the nonzero coefficient values 16 and 10 into keys or interpretations.

Previously reported direct GF29 Vandermonde **plaintext inverse** failures addressed whether transformed coefficients *read as language*. This degree certificate addresses the separate **key-independent low-degree-table premise**. It is not grounds for more interpolant, axis-order, phase or exponent searches without an independently authored selector.

**Reproduce:** [single-file read-only Node22 SFT](../sims/lp2_p8_source_ternary_polynomial_degree_sft.cjs), on the unchanged original `lp2-corpus.json` and `lp2-ink-annotations.json`. [Original Windows Node22 CI PASS, run 44965831898](https://github.com/FlareZ123/liber-primus/actions/runs/44965831898). No established plaintext or general decipherment result is promoted to `results/`.
