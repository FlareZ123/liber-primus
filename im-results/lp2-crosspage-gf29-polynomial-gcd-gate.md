# Original LP2 GF(29) shared-polynomial-factor gate

**Result (Agent 4, 12 November 2026):** No fixed nonconstant polynomial factor is shared by any two of the nine visually bounded original unsolved rune chapters, nor by any chapter and the 256-cell number table. Among all **1,540 unordered comparisons** of the **55** original rune-bearing unsolved pages and the table, exactly two pairs have a gcd of degree two; every other nonconstant gcd has degree one. This removes one direct common polynomial-generator route to decrypting the book under the declared source clock. **No unknown plaintext, authentic key, cipher or destination has been recovered.**

## Motivated question and original inputs

The source-original pp49–51 printed **32×8** two-character number table is already known to have a nontrivial GF(29) factorization after the conventional base-60 numeral reading. Most notably, its printed-order polynomial shares the *double-root* factor \((X-24)^2\) with the physical p29 rune polynomial. This link is established independently in [the complete factorization](lp2-grid-complete-gf29-factorization.md). A natural extension is to ask whether an otherwise unidentified **common generator/check polynomial** divides every encoded manuscript unit. A positive result could identify a reusable algebraic layer, making its quotient a target for decoding. This experiment asks that narrower all-original-input question before attempting unfixed quotient permutations or new cipher keys.

Original rune indices come solely from [the canonical LP2 corpus](../resources/liber-primus/lp2-corpus.json), preserving all **12,956** unknown runes on 55 nonempty physical pages (p50 has no rune prose). The table comes from [the canonical original-derived 256-cell grid](../resources/liber-primus/lp2-grid-256.json). Nine source-visible chapters preserve printed page/rune order:

| Unit | Original physical pages | Runes |
| --- | --- | ---: |
| 1 | 0–2 | 729 |
| 2 | 3–7 | 1,145 |
| 3 | 8–14 | 1,729 |
| 4 | 15–22 | 1,903 |
| 5 | 23–26 | 1,021 |
| 6 | 27–32 | 1,433 |
| 7 | 33–39 | 1,680 |
| 8 | 40–53 | 3,008 |
| 9 | 54–55 | 308 |

The table is tested as an independent tenth object, with each byte reduced modulo 29. At each unit of length \(n\), the printed-index polynomial is \(P(X)=\sum_{i=0}^{n-1}c_i X^{n-1-i}\) in \(\mathbb F_{29}[X]\). This is a hypothesis borrowed from the already demonstrated table/p29 connection, not a claim that Cicada specified this generalization.

## Exact original-corpus computation

An exhaustive Euclidean polynomial gcd pass used exactly one fixed printed orientation, all original symbols, no secret phases and no numerical key search.

| Comparison family | Pairs | Nonconstant gcds | Maximal gcd degree |
| --- | ---: | ---: | ---: |
| Individual 55 pages plus table | **1,540** | **90** (88 linear, 2 degree-two) | 2 |
| Nine complete chapters plus table | **45** | **0** | 0 |

The two degree-two individual-unit pairs are:

1. Physical **p27 and p48**, with \(\gcd(P_{27},P_{48})=X(X+6)\). This is the product of **two linear factors**. It supplies no new cipher operation.
2. Physical **p29 and the table**, with \(\gcd(P_{29},T)=X^2+10X+25=(X-24)^2\). This reproduces the already-established repeated-root link, rather than counting it as a new discovery.

The source-chapter result is stronger than the absence of a *single* factor across all pages: **no pair of complete original chapters** shares any nonconstant factor under this model. The table shares no nonconstant factor with any complete chapter.

A positive implementation control multiplies an unrelated original p0 page polynomial by the known \((X-24)^2\) and verifies that gcd with the unchanged original grid recovers that factor. Exact original length and all expected comparisons are asserted.

## Cryptanalytic consequence

If the intended encryption had appended or multiplied the **same nonconstant GF(29) check/generator polynomial** into each complete printed page or each marked chapter, that polynomial would divide every corresponding ciphertext polynomial. Each pair would then have a nonconstant gcd. The original data violate this necessary condition in both declared registers. No shared stationary factor can be extracted from a complete-chapter gcd under this orientation.

The positive table/p29 double-root coincidence remains a potentially useful **local relationship**; it does not generalize as an unmodified universal chapter code. Linear gcd coincidences and the p27/p48 double-linear coincidence do not produce readable quotients or independently selected keys.

The exclusion does **not** cover within-page phase changes, different orientations per page, source-selected offsets/crops, changing factors, a cipher over a different field/register, secret permutations, or nonlinear transformations that destroy polynomial divisibility. A new cipher hypothesis should specify one of those operations from original artifact evidence before testing it, rather than reinterpret these gcds as an encoded message.

**Reproduction:** [single-file CommonJS original-source test](../sims/lp2_crosspage_gf29_gcd_sft.cjs). It reads the canonical JSONs, computes the full page/chapter gcd census, verifies the exact two exceptional pairs and tests a synthetic planted factor.