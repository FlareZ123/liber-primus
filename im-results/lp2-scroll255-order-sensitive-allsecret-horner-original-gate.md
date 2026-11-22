# Scroll255→p8: complete all-secret ordered Horner and quadratic-root half-trace gates

**Agent 7, 22 November 2026. Exact original-cipher exclusion, conditional on a separately unauthenticated GF4/radix59 correction. No new unknown LP2 plaintext, authentic key or final cipher.**

## Cryptanalytic premise

The original p3–p7 scroll prints **255 whole GP29 words**, and the adjacent p8 has **255 runes**. An earlier proposed use of the five authentic p7 red-word products [11,26,8,15,2] as a GF4 feedback register, followed by a radix59 reading of the original p49–p51 table, produces a fixed p8 additive correction. Under that *unconfirmed* correction, three repeated scroll words and one word-order-reversed anagram pair each map to equal outputs: **20=20, 8=8, 2=2, 9=9**.

An ordered word hash could preserve these four coincidences while distinguishing different rune orders. The familiar Horner rolling-word hash is a small, easily implemented operation; it was not covered by the prior commutative-associative obstruction. A more source-specific version uses the quadratic **X²−8** from the exact p7 terminal red-word polynomial factorization.

## Entire secret-key families tested

For each authentic word of length L, test every ordered rolling checksum over GF29:

\[
\sum_{j=0}^{L-1}b^{L-1-j} A[r_j]+D[L]+E[page]+F\cdot red=B[Y_i].
\]

All **29 input rune labels A**, all **29 output rune labels B**, all 12 real word-length offsets D, all five source-page offsets E, and the red-ink offset F are independent, arbitrary hidden elements of GF29. **B must be injective** for any meaningful 29-symbol decoding. All 255 original words and corrected output runes Y are kept fixed. Test every base **b=0,…,28**, and both genuine word-start and word-end page clocks. This exhausts **58 original systems, each 255 equations in 76 unknowns**, without searching individual keys.

**Every original system has exact rank73 and nullity3.** Explicit full nullspace construction shows *all 29 secret output labels B[y] have the same value in every solution*, irrespective of base, direction, hidden input alphabet, word length, red status or source-page key. No injective B exists. This is an all-key algebraic contradiction, independent of language statistics.

The p7 polynomial additionally supplies the two roots of **t²=8 in GF(29²)**, a genuine source-local field already studied as a possible clock. Give each input rune an *arbitrary secret pair* of GF29 coefficients a[r]+t·c[r], and take the canonical **half-trace** of the whole ordered field-Horner word to obtain a physical GP29 symbol. For an exponent e, the coefficient of a[r] is 8^(e/2) for even e; the coefficient of c[r] is 8^((e+1)/2) for odd e. Negating t simply negates the secret c labels, so both source roots are exhaustively covered by the same original equation family. Give the same arbitrary 29 secret output labels, 12 length, five page and one red corrections.

Both original-source **255×105** systems have **rank101, nullity4** and again *every output label B[y] is forced identical*. This eliminates the whole GF841 source-quadratic half-trace ordered-word family with arbitrary secret input/output alphabets.

| Hidden-key family | Original equations / rank / variables | 29 output glyphs distinct? |
| --- | --- | --- |
| Horner over GP29, every one of 29 bases, two clocks | 255 / **73** / 76 for all58 | **Impossible** |
| Source t²=8, GF841 Horner half-trace, two clocks | 255 / **101** / 105 for both | **Impossible** |
| Genuine independent Horner plants on the same original words | 58 complete plants | **Possible**, all58 |
| Genuine independent source-quadratic half-trace plants | Two complete plants, rank100/105 | **Possible**, both |

All **60 positive controls** independently encrypt the exact original 255 source words and original word-boundary/red/page layout with secret input labels and a genuine invertible 29-symbol output permutation. The solver accepts their nonconstant output alphabets. This is an exact necessary-condition result, rather than a comparison with synthetic language statistics.

## What the decision changes

Under the *provisional* p7-GF4/p50 correction, **no stationary GP29 Horner or source-quadratic half-trace word checksum with any hidden input or output rune alphabet and these generous layout offsets can map the original 255 scroll words to p8's 255 corrected runes**. Hence simply allowing secret rune weights, tuning the Horner base, or moving from GF29 to the p7-root extension field cannot recover plaintext through this registration.

The test does not authenticate the GF4/radix59 correction, which was fitted retrospectively. It does not exclude a genuinely source-selected nonlinear compression hash, nonstationary transducer, noninjective high-state emission with real side information, changed word boundaries, or a different source-to-p8 pairing. Any successor needs an independent first-party opcode and a held-out original-cipher prediction; adding arbitrary secret parameters to this mathematically inconsistent word-hash family cannot resolve it.

**Reproducer:** [read-only Windows Node22 single-file test](../sims/lp2_scroll255_horner_allsecret_original_sft.cjs). It reconstructs all 255 original words and the unchanged 256-cell table, verifies all four source collisions, performs exact GF29 nullspace elimination across 60 original systems and all 60 original-layout positive plants. [Windows CI run45072024462](https://github.com/FlareZ123/liber-primus/actions/runs/45072024462), plus passing [GP29-only run45071808123](https://github.com/FlareZ123/liber-primus/actions/runs/45071808123).
