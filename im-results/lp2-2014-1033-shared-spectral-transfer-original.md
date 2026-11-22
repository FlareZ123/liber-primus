# Original 2014 magic-square shared eigenroots and seven-symbol source transfer

**Agent18, 22 November 2026. Exact source-to-source algebra and bounded original-cipher negative.** The original 2014 Stage10 magic-square packet contains three separately printed integer squares. Two have magic sum 1033, of sizes **5×5** and **7×7**. Under the authentic 29-rune field they share **three exact eigenvalues [8,24,18]**. The already established 1033-square/LP1-warning correspondence identifies these as the GP rune indices **H, A, E** within the solved word `CHANGE`. Their root overlap supplies a reproducible source-derived **3+2+2 spectral-coordinate interface** for the 7×7 square. Neither this link nor either complete original-source transform recovers unknown text.

## Source-selected arithmetic and independent objections

Read the unchanged [2014 Stage10 OpenPuff magic-square output](../resources/cicada2014-openpuff-magic-squares.txt). Write `B` for its last, 5×5 sum-1033 square and `C` for its middle, 7×7 sum-1033 square. The historical integer characteristic polynomials factor **before any reduction** as:

- `det(xI−B)=(x−1033)(x²−17077)(x²−15869)`.
- `det(xI−C)=(x−1033)(x³−181161x+57789135)(x³−25297x−8981481)`.

These share only `x−1033` over the rationals. The root 1033 is forced by both row sums and is therefore **not** an independent intentional clue. However, reducing the **entire unchanged matrices** over the native GP29 field gives:

```text
det(xI−B) = (x−5)(x−8)(x−24)(x−21)(x−18)
det(xI−C) = (x−8)(x−24)(x−18)(x²−5x−13)(x²+8x+8)
gcd        = (x−8)(x−24)(x−18)                over GF29
```

The two additionally common roots **8 and 24** are **not forced by the common row sum**. For the 5×5 square their pair lies among the previously identified native `CHANGE` eigenvalues `[5,8,24,21,18]`; the new 7×7 computation gives the independent root overlap. The first 3301-sum 5×5 Stage10 square has `det(xI−A)=(x−3)(x+3)(x+5)(x²−3)` modulo29, sharing root24 with both 1033 squares. In that first square root24 is **already forced** by its magic sum 3301≡24 (mod29). Root24 also occurs as the double root of the known p39 red-triad/p50 table factor `(x−24)²`; this is a cross-source consistency observation, **not recovered key material**. Only the 1033 pair's *extra* roots 8/24 carry the new fact.

A powerful rival explanation remains possible: magic squares are structured, all three matrices are centrosymmetric, and the 1033 pair's shared extra eigenroots were identified retrospectively amid extensive source exploration. A common finite-field eigenvalue does not specify a ciphertext reader, original key, phase or author's intended operation. The integer characteristic polynomials have no extra common factor, and an arbitrary 5↔7 dimensional map would require further choices.

## A frozen reversible 7×7 original-cipher hypothesis

Factor the authentic seven-square characteristic polynomial as three one-dimensional eigenmodes and two irreducible quadratics over GF29. Build a **source-only** basis `S` from:

1. Right eigenvectors for `[8,24,18]` in their already established 5-square warning-word order, each chosen by the first GF29 RREF free-column vector, normalized at its first nonzero coordinate.
2. For `x²−5x−13` and then `x²+8x+8`, take the first RREF kernel vector of the complete matrix polynomial, normalized the same way, followed by its image under `C`.

This specifies an invertible matrix **without fitting any unknown ciphertext**:

```text
S =                    S^-1 =
 1  1  1  0  1  0 26      3 24 20  0  9  5 26
14 10  1  1 18  1 19     13  9 12 19 12  9 13
 7 20  1 11 19 22 11     25 25 25 25 25 25 25
 0 25  1  5 11  0  0     27 19 28 26 28 19 27
22 20  1 11 19  7 18      6 24 21 14 21 24  6
15 10  1  1 18 28 10      5 20  9  0 20  9 24
28  1  1  0  1  0  3     25  8 26  0  3 21  4
```

In this canonical basis `S^-1 C S` has the exact blocks `[8]`, `[24]`, `[18]`, `[[0,13],[1,5]]` and `[[0,21],[1,21]]`. These two companion blocks have the original irreducible quadratic polynomials. Both transfer directions `S·v` and `S^-1·v` are equally natural rival decoding conventions; neither is source-authorized. Since seven is the dimension of the original 2014 square, test complete seven-rune groups, with no padding, fitted phase, dropped rune, altered ink or guessed word.

There are **two whole physical source chapters divisible by seven** relevant to the 2014 square: the seven-page illustrated chapter **p8–p14, 1,729=247×7 runes**, and the cuneiform/numerical chapter **p33–p39, 1,680=240×7 runes**. Both are untouched GP29 ciphertext.

| Complete original source | Original IoC | `S·ciphertext` IoC | `S^-1·ciphertext` IoC |
| --- | ---: | ---: | ---: |
| Physical p8–p14, all 1,729 runes | 0.03446048347 | **0.03428710666** | **0.03435337810** |
| Physical p33–p39, all 1,680 runes | 0.03436002155 | **0.03450041124** | **0.03425721092** |

The four complete outputs remain ciphertext-like, near the uniform 29-symbol baseline `1/29≈0.03448276`, without sustained genuine GP prose. All **3,409/3,409 unchanged original runes** reencrypt exactly in both source-fixed directions. As positive controls, actual solved p57's **95 original clear GP runes** are repeated to each exact input length, genuinely transformed and inverted with **full 1,729/1,729 and 1,680/1,680 recoveries**. The historical 2014 matrix cells, characteristic polynomial products, finite-field matrix inverse, canonical basis and original IoCs are asserted by the same script.

**[Single self-contained Windows Node22 SFT](../sims/lp2_2014_1033_sevensquare_shared_spectrum_original_sft.cjs)** · **[independent Windows Actions PASS, run 45072210392](https://github.com/FlareZ123/liber-primus/actions/runs/45072210392)**.

## Decipherment decision

The two authentic 1033 magic squares share a **new exact native-field spectral relation**, with two extra roots beyond their forced row sum. This is a legitimate source-derived reversible-coordinate candidate and a possible algebraic clue for further *source-selected* routing. **The natural complete original seven-rune consumers do not decrypt either relevant chapter**, and no one has supplied an original author-authenticated instruction to diagonalize the matrices or apply the resulting basis to Liber Primus. The result belongs in intermediate research. Keep any future use dependent on an independent original clue identifying the recipient, eigenmode order and value-changing operation. Do not continue arbitrary basis permutations and phase fitting to make a selected output resemble prose.
