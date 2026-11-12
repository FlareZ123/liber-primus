# Original LP2 GF(29) shared-polynomial-factor gate

**Current decision (Agent 4, 12 November 2026):** A universal fixed polynomial generator factor does not survive the complete original-source chapter comparison. A separate, independently testable **original-page-boundary root surplus** appears in the latter original chapters, maximally from p27: 45 roots where a source-preserving cyclic boundary null expects about 28. The effect survives adjustment across eight printed chapter boundaries (**107/12,956 = 0.00826**). It suggests checking page-dependent roots only if an authentic clue selects the operation. The signal is exploratory and no new plaintext, authentic key, cipher or destination has been recovered.

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

## Independent new result: page-root enrichment begins at a printed chapter boundary

The absence of a universal polynomial factor does not imply original page boundaries are statistically arbitrary under this already source-motivated GF29 register. Count every distinct root \(x \in GF(29)\) of each complete unaltered page polynomial, without fitting a target root, key or phase. Exactly **74** page/root incidences occur across **55** rune-bearing original pages, including known four whole-page double roots; ordinary uniform polynomials would have about one root per page.

To condition on the *actual* near-uniform GP29 ciphertext, its symbol sequence, local transitions and exactly the original page-length multiset, use an exhaustive **cyclic-rotation conditional null**. Hold all 55 original page lengths and their order fixed, rotate the 12,956-rune original book stream by every possible offset **0–12,955**, and re-segment into the same page lengths. The source order remains unmodified *within* the actual (offset-zero) text; the rotations are null controls, not purported decryptions. At each root use exact rolling Horner prefixes to evaluate all page-window polynomials.

The original page layout produces **74** root incidences, compared with a mean of **55.1671** and standard deviation **7.2440** across the 12,956 cyclic placements (exact conditional one-sided tail **94/12,956 = 0.007255**). The enrichment concentrates in the source-defined later part: physical **p0–26**, 27 pages, has **29 roots** (null mean 27.1165; tail 0.38067), whereas physical **p27–55**, 28 rune-bearing pages, has **45 roots** (null mean 28.0506; tail **20/12,956 = 0.001544**).

The p27 boundary is an independently visible transition: it begins the pp27–32 chapter with a 19-rune red title. Nevertheless, p27 was examined after noticing the full-book root count, so the stricter decision corrects for choosing among **all eight original internal chapter start boundaries** (p3, p8, p15, p23, p27, p33, p40 and p54). For each suffix compute its own standardized root-count excess against all 12,956 shifted controls. The largest original suffix excess is **z=3.2690**, at p27; exactly **107 of 12,956 cyclic shifts** obtain an equally large *maximum across all eight boundaries*, yielding a familywise **0.008259** conditional tail. Thus the p27 signal is not solely the result of choosing that one starting point from the eight declared chapter boundaries.

| Original chapter suffix begins | Source pages with runes | Observed root incidences | Null mean | Conditional upper tail |
| --- | ---: | ---: | ---: | ---: |
| p3 | 52 | 70 | 52.1649 | 0.009494 |
| p8 | 47 | 66 | 47.1502 | 0.005017 |
| p15 | 40 | 60 | 40.1242 | 0.002084 |
| p23 | 32 | 47 | 32.0772 | 0.007178 |
| **p27** | **28** | **45** | **28.0506** | **0.001544** |
| p33 | 22 | 33 | 21.9782 | 0.015282 |
| p40 | 15 | 25 | 15.0083 | 0.009802 |
| p54 | 2 | 1 | 1.9773 | 0.862226 |

**Discriminating register check.** Use the same fixed original p27–p55 lengths and cyclic shifts, but replace each ciphertext's GP ordinal index by its corresponding **GP prime value modulo29**, a separate original source-visible numeric register. This source-native alternative has only **32** p27–p55 root incidences versus a conditional mean **27.9858** (exact one-sided tail approximately **0.2474**). The p27 root surplus therefore depends on the **ordinal GP29 coefficient assignment** that previously produced the p29/table common factor; it is not a generic artifact that survives every rune-to-number representation. This comparison was performed after seeing the ordinal result, so it is a discriminating scope check rather than independent confirmation.

**Literal source-operator attempt.** An algebraically canonical way to consume each page's actual roots is polynomial division by **every** corresponding factor \`X-r\`, in ascending GP29 root order, including repeated roots. This executes once on the original entire book without a guessed root selector or fitted key. It removes **78** exact original factors and leaves **12,878** runes, with whole-book GP index of coincidence **0.03447605** versus original **0.03447840**; after p27 alone the stripped candidate is **0.03455397** versus original **0.03445161**. The unchanged near-uniform GP29 profile and nonlinguistic decoded glyphs reject this simple literal factor-stripping inverse as a route to ordinary GP-native plaintext. Every synthetic division checks zero remainder. This is a direct bounded original-cipher decoding failure; it does not invalidate the separate page-boundary count anomaly or preclude a historically selected root choice and operation. [CI original-and-plant execution 43300425363](https://github.com/FlareZ123/liber-primus/actions/runs/43300425363).

**Interpretation and limitation.** This is a source-conditionally unusual property of the current **choice to interpret whole original pages as polynomials**, developed after the remarkable source-linked p29/p50 common double root was already known. It has not been corrected across the project's many other tested registers and transformations. It might reflect an intentionally altered page-production mechanism, or a chance outcome from the wider family of exploratory cryptanalytic tests. In particular, the 44 pages with at least one root offer **multiple possible roots on many pages**; 11 pages have none. There is no source-authenticated rule selecting one root, converting it into a cipher key, or explaining the rootless pages. Do not force such a rule by fitting English.

An actionable advance would be an independent original image instruction or creator-era operation that predicts *which root on a previously untouched page* is key-bearing and defines its inverse. Until then this is a constrained structural clue, **not** a decipherment. [Exact original-input CJS SFT](../sims/lp2_page_roots_original_boundary_sft.cjs) contains all 12,956 exhaustive rotation controls, independent naive original root counts, a planted root positive control and exact familywise count assertions.

## Cryptanalytic consequence

If the intended encryption had appended or multiplied the **same nonconstant GF(29) check/generator polynomial** into each complete printed page or each marked chapter, that polynomial would divide every corresponding ciphertext polynomial. Each pair would then have a nonconstant gcd. The original data violate this necessary condition in both declared registers. No shared stationary factor can be extracted from a complete-chapter gcd under this orientation.

The positive table/p29 double-root coincidence remains a potentially useful **local relationship**; it does not generalize as an unmodified universal chapter code. The distinct root-count enrichment after p27 suggests page-dependent structure worth explaining through an independent clue, but does not supply a decoder. Linear gcd coincidences and the p27/p48 double-linear coincidence do not produce readable quotients or independently selected keys.

The exclusion does **not** cover within-page phase changes, different orientations per page, source-selected offsets/crops, changing factors, a cipher over a different field/register, secret permutations, or nonlinear transformations that destroy polynomial divisibility. A new cipher hypothesis should specify one of those operations from original artifact evidence before testing it, rather than reinterpret these gcds as an encoded message.

**Reproduction:** [single-file CommonJS original-source test](../sims/lp2_crosspage_gf29_gcd_sft.cjs). It reads the canonical JSONs, computes the full page/chapter gcd census, verifies the exact two exceptional pairs and tests a synthetic planted factor. Source page totals are checked before polynomial normalization; the pp15–22 and pp40–53 concatenations have a GP-index-zero leading coefficient that correctly vanishes from their formal polynomial degree. The complete corrected assertions passed on [Node.js 22 CI run 43298330460](https://github.com/FlareZ123/liber-primus/actions/runs/43298330460). The separate root-census and direct-factor quotient pass is [Node.js 22 CI run 43300425363](https://github.com/FlareZ123/liber-primus/actions/runs/43300425363).