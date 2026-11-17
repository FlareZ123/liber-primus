# Complementary original p29/p30 GF29 spectral factors and a finite Hill4 inverse

**Agent43, 17 November 2026. Evidence class:** exact new cross-page arithmetic observation, with an original-source direct inverse that yields no plaintext. The known physical p29/p50 double-root relationship is prior art. **No p0–55 plaintext, cipher key selected by Cicada, or destination recovered.**

## Independently available selectors and source facts

The source-visible p15 Fibonacci-prime 4×4 grid has an independently reconstructed mathematical sign orientation (the original ink prints positive magnitudes) with signed matrix

```
M = 10  3 20 22
     1 22 21 25
    11 17 19  7
     8 12 12 22                (entries mod 29)
```

The known characteristic polynomial is `(X−8)(X−17)(X−24)^2` over GF29. The original red p39 triad is `[27,5,15]`, defining the existing conditional polynomial `G(X)=15(X−24)^2`. Independent previous work established that the complete **277-rune physical p29** polynomial, coefficients in original descending rune order, has `(X−24)^2` as a factor, as does the original 256-cell p50 table polynomial. This prior source relationship picks **p29** and an exact **other source-derived factor**, `J(X)=(X−8)(X−17)=X²+4X+20`, without first consulting its neighbor.

**New adjacent-page observation:** the unmodified **263-rune physical p30**, immediately following p29 in original page order, has **both** `P30(8)=0` and `P30(17)=0`, hence `J(X)` divides its full original ciphertext polynomial with zero remainder. Across all **55** rune-bearing unsolved physical pages, p30 is the **only** page with both these roots; p29 is the only page with a *double* root24. the original `47.jpg` image also ends physically in two identical adjacent GP runes `EO EO` (indices12,12), followed by the printed punctuation/separator mark. p30 is the **only** unknown physical page whose last two ciphertext runes are identical. This is verifiable from the original JPEG and complete original corpus, rather than an imputed plaintext crib. **Source-disfavored CRC interpretation:** the original transcription visibly carries one printed word **across the p29→p30 page break**: p29 ends `GHM` without a word separator, and p30 begins `DAPE` before the next separator. The algebraic constraints therefore sit at a compositor's cut **inside a word**. Treating the last two p29 symbols as independently appended page-level parity would alter that printed word's ciphertext; an original instruction for per-page checksum generation is missing. It is a conspicuous independent visual feature but does **not** itself supply a mathematical opcode.

The two original ciphertext page polynomials thus carry complementary factors of the independently reconstructed p15 signed matrix's characteristic polynomial:

| Original polynomial | Rune count | Exact conditions | Factor |
| --- | ---: | --- | --- |
| physical p29 | 277 | `P29(24)=P29′(24)=0` | `(X−24)^2` |
| physical p30 | 263 | `P30(8)=P30(17)=0` | `(X−8)(X−17)` |

For uniformly independent GP29 coefficient polynomials, the probability a **particular** successor page has both prescribed root conditions is `1/29²`; this is **not** a discovery-adjusted p-value. The polynomial reading, signed sign restoration and all relationships were developed through retrospective searches. The unusual terminal doublet may also be a postselected correlation. Do not multiply these fractions into a probability of Cicada intent.

## Consequence: two rank-two components combine into a nonsingular 4×4 source matrix

With literal original descending coefficients, Horner evaluation at the signed p15 matrix gives

```
A = P29(M) =  9 24 17 15     B = P30(M) = 25  5  6  3
               20  9  5  6                  27  7 27 19
                5  7  2 21                  19 11  7 21
               17  3 20 26                  15 12 11  2

K = A+B =     5  0 23 18     K^−1 =          25 13 26 11
              18 16  3 25                     20  3  4 23
              24 18  9 13                     28 18 25  3
               3 15  2 28                     25  4 14  6
```

All arithmetic is over GF29. Both `A` and `B` have rank **2**; `AB=0` exactly. Their images occupy complementary eigenspaces, and `K=A+B` has rank **4** with `K·K^−1=I`. This produces a concrete reversible linear transformation using the original p15, p29 and p30 source objects with no fitted matrix entries. **The choice to sum them and apply Hill4 is exploratory; no source instruction asks for this construction.**

## Direct original-cipher readouts

Use `K` and its inverse to process consecutive **four-rune column blocks**, always starting at the printed beginning and preserving the source GP29 indices. Test the original table as 256 byte residues reduced mod29, in its actual row-major and conventional column-major orders. As separate natural receivers, test complete original pp33–39 (1,680 runes), pp54–55 (308 runes) and the original short terminal p55 alone (**76 runes = 19 four-rune blocks**). These are **five source-fixed receivers × two opposite directions**, plus the equally conventional row-vector orientation on p55, with no unknown phase, symbol mapping, word reshuffle or language-score parameter.

| Original receiver | N | `K·C` IoC | `K^−1·C` IoC |
| --- | ---: | ---: | ---: |
| table row-major | 256 | 0.03403799 | 0.03492647 |
| table column-major | 256 | 0.03431373 | 0.03501838 |
| original chapter p33–39 | 1,680 | 0.03429621 | 0.03482586 |
| original chapter p54–55 | 308 | 0.03384238 | 0.03564026 |
| original p55 alone, column-vector | 76 | 0.03228070 | 0.03754386 |
| original p55 alone, row-vector | 76 | 0.03614035 | 0.03789474 |

Each output is ciphertext-like and begins with nonlinguistic GP symbols; **none recovers native prose or an authentic instruction**. Both directions reconstruct every original GP29 rune exactly under the algebraic inverse. For the table they reconstruct only the original **byte residues mod29**, since the required 256-byte→GF29 reduction loses information; the matrix is not a reversible operator on the original 8-bit cells. A separate positive control encrypts and recovers **92/92 clear-source p57 GP29 runes** under the same full-rank Hill4 matrices. No plaintext claim is justified by exact roundtripping alone.

## Decision and reproducibility

The **new p30 complementary roots** are a specific, reproducible original-cipher relationship that extends the existing p29/p39/p50 and p15 source algebra. They change which page pair would be worth examining **if** a human-visible source selector for matrix/polynomial operations is independently found. The explicit invertible matrix combined from both pages did **not** directly decode the original table, either tested chapter or p55's independently ink-bounded 76-rune body. It cannot be promoted to a Cicada key merely because it is invertible.

Do not repeat the failed raw p29 quotient, whole-chapter H×G factor divisions, p15-only Hill4 transfers or unselected matrix permutations. The necessary next input is an independently authored instruction selecting a consumer of these two complementary page objects, a source-positioned crib that constrains a nonlinear second stage, or a genuinely new test with a locked original-cipher prediction. Without one, this relationship is an intermediate observation and a candidate clue.

**Exact SFT:** [`sims/lp2_p29_p30_complementary_polynomial_hill4_sft.cjs`](../sims/lp2_p29_p30_complementary_polynomial_hill4_sft.cjs), reading the canonical unchanged GP29 corpus and 256-cell source table. Source JPEG `resources/liber-primus/47.jpg` displays the terminal doublet. Existing related prior art: [p29/table cross-page factor census](lp2-crosspage-polynomial-root-frontier.md), [signed-p15 and p39 spectral factor](lp2-p15-p39-signed-matrix-eigen-crosslink.md), [original root-surplus null](lp2-crosspage-gf29-polynomial-gcd-gate.md).
