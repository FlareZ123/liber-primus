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

## The entire five-symbol CHANGE spectrum is the seven-square factor-trace spectrum

The two original 1033-square characteristic polynomials have a stronger, **exact algebraic relation** than their three common linear roots. Over GF29 the 7-square has **five irreducible factors**, three of degree one and two irreducible quadratics:

```text
7-square irreducible factor   Sum of its roots in GF29   Native GP rune
x−8                          8                            H
x−24                         24                           A
x−18                         18                           E
x²−5x−13                     5                            C
x²+8x+8                      21                           NG
```

The two quadratic sums are the GF(29²)-to-GF29 field traces of their two conjugate eigenvalues: `5` and `−8≡21`. **The resulting unordered multiset `{5,8,18,21,24}` equals the *entire* independently supplied 5-square 1033 spectrum, `GP(CHANGE)`.** This relation uses every one of the seven-square eigenmodes through the canonical irreducible factorization and does not choose letters by fitting ciphertext. It is a possible matrix-to-matrix source selector, with no authenticated ordering. Importantly, it is **not statistically independent** of the shared roots8/24: the original two nontrivial integer cubic factors have zero quadratic coefficients, so their reduction modulo29 forces each complementary quadratic's trace to equal the negative of its paired linear root. The second square's ± eigenvalue pairs are likewise explained by its integer polynomial. The notable unexplained coincidence is still that the *two 1033 matrices share the original linear eigenvalues* 8 and24.

The factorization gives one canonical **five-symbol output per seven ciphertext runes**. For an original source packet `c∈GF29^7`, calculate `z=S^-1 c` using the unique RREF-normalized source 7×7 basis above. Apply the intrinsic quadratic field traces, with the five symbols in the *known source-word* order:

```text
TR_7to5(c) = [
  2*z[3] + 5*z[4],    // quadratic x²−5x−13, C
  z[0],               // linear root 8, H
  z[1],               // linear root 24, A
  2*z[5] + 21*z[6],  // quadratic x²+8x+8, NG
  z[2]                // linear root 18, E
] mod 29
```

This is a **rank-five noninvertible projection**, which could be a real human-designed 7-symbol ciphertext to 5-symbol plaintext code if the artifact specified it. It discards exactly two extension-mode degrees of freedom per packet. Test both intact original 7-rune-compatible chapters with no chosen ciphertext shift. Their native-GP frequency results are:

| Unchanged 7-rune ciphertext receiver | Trace-only 5-rune output | After genuine 5-square physical basis `V` | After inverse `V^-1` |
| --- | ---: | ---: | ---: |
| p8–p14, **1729→1235** runes | **0.03431649814** | 0.03432043517 | 0.03450416341 |
| p33–p39, **1680→1200** runes | **0.03433416736** | 0.03445232138 | 0.03462885738 |

All six whole-register outputs are frequency-flat and **none recovers sustained native GP29 plaintext**. A full-length source-native positive plant converts any genuine 5-rune p57 text packet `[c,h,a,ng,e]` into a 7-rune matrix-coded packet `S·[h,a,e,c/2,0,ng/2,0]`; the identical fixed trace decoder recovers **all 1,235/1,235 and 1,200/1,200** original-shaped positive symbols exactly.

A sharp algebraic limitation prevents conflating the field-trace *value* map with a true linear **cipher-state conjugacy**. For a 5×7 GF29 matrix `T` that intertwines the original magic square actions, `B*T=T*C`, the four-dimensional pair of irreducible quadratic modes of C must lie in T's kernel, because B has **no** corresponding quadratic invariant factors. Consequently the full vector space of commuting transfer maps has dimension exactly **three**, supported only on common eigenroots **H,A,E**, and **every such map has rank at most three**. A full five-dimensional change-of-state key would need a nonlinear/stateful operation selected elsewhere; the factor-trace map above cannot secretly serve as a five-dimensional intertwiner.

That separate three-mode *state-reuse* proposal was tested directly on the only obvious original size-compatible sections: **p3–p7=1145=229×5**, **p8–p14=1729=247×7** and **p33–p39=1680=240×7**. After each original matrix's canonical eigenbasis, preserve the shared `[H,A,E]` modes, with either start-aligned packets or end-aligned packets (offset18 or11, the exact surplus packet counts). Across **687 compared GP29 symbols** in each original registration:

| Source five-section versus source seven-section | Start alignment matches | End alignment matches |
| --- | ---: | ---: |
| p3–p7 versus p8–p14 | **22/687**, zero complete triplets | **23/687**, zero complete triplets |
| p3–p7 versus p33–p39 | **19/687**, zero complete triplets | **19/687**, zero complete triplets |

The uncorrelated uniform expectation is about **23.69** symbol matches out of 687. A separate authentic p57 3-symbol source-native plant embedded through the **real 5-square and 7-square eigenvector bases** reproduces **687/687 symbols and all 229 complete triplets**. Thus neither actual packet alignment reveals a reused original three-mode source state, and the natural seven-to-five trace loses rather than reveals language structure. These tests limit only these specific receiver assumptions, without excluding a missing source-selected nonlinear operation.

## A genuine known-key receiver: original 252-symbol quotient versus solved p56

A source-level conjecture could make the seven-square transfer meaningful beyond a ciphertext-only visual transform. The original 256-cell numeric table's native GP29 polynomial divides exactly by the source factors `H=[3,26,24]` and `G=[27,5,15]`, leaving **252 quotient coefficients**. The separately authenticated solved p56 prime/totient cipher consumes exactly **84 known consecutive key residues**: `K[i]=(prime[i]−1) mod29`, with one F-transparent rune at ciphertext position56. Thus the quotient can be read as **three 84-rune lanes**, and the seven-square key transfer can act on each complete `84=12×7` lane. This is an independently checkable authentic-key target, unlike ranking prospective English fragments.

Freeze all three lane indices, the two source-natural serializations (three consecutive 84-coefficient blocks, or three every-third interleaved subsequences), and three operations (identity, `S`, `S^-1`). Exactly **18 source-defined 84-value streams** enter a direct test against the complete independently known p56 key. To avoid mistaking an unknown constant alphabet permutation for failure, give every candidate **all 29! possible secret GP29 bijections** without searching them: the relation `candidate[i]=candidate[j]` must be exactly equivalent to `key[i]=key[j]` at all `84×83/2=3,486` unordered position pairs under *every* such bijection.

| Original-source transfer result | Exact original result |
| --- | ---: |
| Entire p50 table / quotient | 256 cells / 252 coefficients |
| H×G polynomial division remainder | `[0,0,0,0]` |
| Authentic solved p56 prime-totient key | 84 residues, no guessed prefix |
| Complete fixed layouts | 18 |
| Best untransformed literal-key hits of 84 | 8 |
| **Smallest key-independent equality-pattern disagreement** | **191 / 3,486 pairs** |
| Best equality-pattern case | second consecutive 84-symbol lane under `S` |
| Complete known-key matches under **any fixed secret alphabet** | **0 / 18** |

An affine secret re-encoding `7×K+3 mod29` retains the authentic key's **zero** pairwise conflicts; a planted seven-square stream `S×K` recovers exactly under `S^-1`. Both are explicitly tested, alongside all four zero polynomial-remainder coefficients and the true p56 F position. This shows that the 191 residual contradictions are a hard all-secret obstruction in the declared whole-lane model, rather than a decoder bug or a failed keyword guess.

This receiver is *not* selected explicitly by a Cicada instruction: it combines three separately original source counts/operations. Earlier work already excluded static 3×84 direct/symbol and quadratic-Shamir transfers; the new check specifically adds the **source-derived 7×7 spectral-coordinate operation**, so it is an independent bounded gate rather than a repeat of that direct analysis. It cannot rule out changing alphabets by seven-rune group, a different source key, or a stateful nonlinear transform. The updated [Windows PASS run 45072589763](https://github.com/FlareZ123/liber-primus/actions/runs/45072589763) executes this complete known-key comparison on the unchanged original files.

## Decipherment decision

The two authentic 1033 magic squares share a **new exact native-field spectral relation**, with two extra roots beyond their forced row sum. Every factor's GF29 root trace in the 7-square also reproduces the full 5-square CHANGE eigenvalue multiset, although no plaintext or cipher-state conjugacy follows. This is a legitimate source-derived reversible-coordinate candidate and a possible algebraic clue for further *source-selected* routing. **The natural complete original seven-rune and seven-to-five trace consumers do not decrypt either relevant chapter, the directly comparable common three modes show no shared state, and the 18 fixed quotient-to-authentic-p56-key transfers have at least 191 key-independent pair conflicts**, and no one has supplied an original author-authenticated instruction to diagonalize the matrices or apply the resulting basis to Liber Primus. The result belongs in intermediate research. Keep any future use dependent on an independent original clue identifying the recipient, eigenmode order and value-changing operation. Do not continue arbitrary basis permutations and phase fitting to make a selected output resemble prose.
