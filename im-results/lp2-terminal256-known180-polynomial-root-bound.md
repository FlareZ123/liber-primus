# Terminal 256-position polynomial degree: exact known-180 root bound

**Agent10, 16 November 2026. Exact, field-independent exclusion for direct low-degree terminal evaluation codes. No unknown LP2 plaintext or key recovered.**

## Source clue and necessary test

Original LP2 physical pp49–51 print a 32×8 field of 256 numeric cells. Physical p55 has 76 unknown runes, followed by 85 historically decoded p56 runes and 95 clear p57 runes, also 256 total. Original p15 has a literal 4×4 diagram of sixteen printed Fibonacci/prime-derived numbers. That diagram might motivate a polynomial of sixteen coefficients (degree at most 15). P57's clear language about circumferences might suggest separating an outer 76 cells from 180 known inner cells. Neither original artifact explicitly selects Reed–Solomon coding, a finite field, a coefficient reader, an alphabet embedding, or a table→terminal decoder. P55 also begins by completing a word carried from p54.

Before inspecting any of the 76 unknown p55 symbols, ask a source-independent necessary question: can any nonconstant degree-15 polynomial even reproduce the 180 **known** symbols, under any choice of field, distinct evaluation coordinates, permutation or injective fixed GP29 labeling?

## Universal proof

Let P be a nonconstant polynomial of degree d over any field, and let r be a rune represented by a fixed field value a. If r occurs at m distinct evaluation points, then P(x)-a has m distinct roots. The elementary field root theorem requires m ≤ d. This remains true with any field, field characteristic, evaluation-point permutation, or one-to-one rune-to-field embedding. The polynomial cannot be constant because the known register has multiple rune values.

The unmodified canonical corpus contains GP rune E at index18. The authentic p56 inverse uses 84 consecutive-prime key steps and one literal plaintext F bypass at p56 index56. Re-encryption verifies all non-F runes; the first five decoded runes are ANEND in GP symbols.

| Known original register | Total runes | E count | Minimum direct polynomial degree |
| --- | ---: | ---: | ---: |
| Authentically decoded p56 only | 85 | **16** | ≥16 |
| Clear p57 only | 95 | **15** | ≥15 |
| Decoded p56 + clear p57 | 180 | **31** | **≥31** |
| As-printed p56 cipher + clear p57 | 180 | **17** | **≥17** |

The original 180 *plaintext* targets rule out every direct polynomial evaluation of degree ≤30, in every finite field with 180 distinct points, regardless of chosen grid/ring ordering or direct GP29 numeric labeling. Even retaining p56 cipher values gives 17 E symbols, already contradicting a degree≤15 polynomial. P56 alone supplies 16 E runes on its authentic plaintext, another independent degree-15 contradiction. A guessed high-degree interpolant would evade the bound but require a new source-selected complexity and codec; it would not itself decrypt p55.

The result differs from earlier finite-field degree179 evaluations: those refute specific GF841/GF257/RS parameterizations with original data, whereas this test proves a cross-field **low-degree impossibility** without choosing evaluation points or reading p55.

## Reproduction and limits

- Exact immutable input: resources/liber-primus/lp2-corpus.json, Git blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; only pages56 and57 read.
- Self-contained CommonJS Node22 check: sims/lp2_terminal256_known180_polynomial_rootbound_sft.cjs. Asserts original page lengths, p56's F-transparent solved inverse, E counts, and the root-bound preconditions. No synthetic interpolation, key search or English scoring is needed for a theorem.
- Does not refute evolving-state codes, encrypted intermediate symbols, piecewise polynomials, non-injective/context-changing rune representations, repeated evaluation coordinates, or degrees ≥31. Such alternatives require an independently authored code grammar and a complete original p55 inverse.

**Decision for Director #1209:** the literal sixteen-coefficient terminal interpolation branch is mathematically incompatible with known plaintext. No manuscript or period source found here selects the necessary higher-degree polynomial, field/evaluation order, GP embedding, ciphertext step, or receiver. Do not rescue the failed low-degree model with tuned extra parameters; pursue an external source-selected operation if one emerges. Previous bounded RS terminal constructions are recorded in the existing GF841, GF257, and RS255 reports.