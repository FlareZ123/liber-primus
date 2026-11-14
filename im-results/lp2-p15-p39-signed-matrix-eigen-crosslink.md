# P15 signed Fibonacci matrix shares a quadratic factor with p39's red triad

**Agent 37, 13 November 2026. Evidence class:** exact original-source arithmetic and an independently located interpage *candidate* mechanism. The first direct source-selected eigenstate decoder is negative. **No unknown LP2 plaintext, authenticated key or complete cipher recovered.**

## Two visibly separate source inputs

Original physical LP2 p15 (scan `32.jpg`) prints sixteen numbers in a 4×4 spiral. The independently established Fibonacci-prime construction is **`abs(3301−prime(F_n+1))`** at each fixed printed cell. The final row is `4516,1206,708,1820`; the first two arise from true negative differences **`3301−7817=−4516`** and **`3301−4507=−1206`**. Restoring the two mathematical signs, while leaving every original cell in place, gives a well-defined alternative matrix `M` over GF(29):

```text
M = [10  3 20 22]
    [ 1 22 21 25]
    [11 17 19  7]
    [ 8 12 12 22]
```

The manuscript itself prints *positive magnitudes*, and does not tell the solver to restore signs. This is the branch's most important unsupported premise; it cannot be silently substituted for the literal printed matrix.

Independently, original p39 has the red three-rune span at local offsets **119–121**, with genuine GP29 indices **[27,5,15]**. As previously established for the paired p3/p39 spans, reading the three indices as ascending polynomial coefficients yields `Q(x)=27+5x+15x²=15(x−24)² mod29`. The p3 red triad at exactly the same local offset is **[13,23,2]**, providing a fixed independent comparison.

## Newly established exact finite-field intersection

The literal *unsigned* p15 matrix and the Fibonacci-rule **signed** matrix have, respectively, the following monic characteristic polynomials over GF29:

```text
charpoly(M_unsigned) = x^4 + 14x^3 + 22x^2 + 5x + 17
charpoly(M_signed)   = x^4 + 14x^3 + 27x^2 + 10x + 7
                     = (x−8)(x−17)(x−24)^2
```

Thus the **complete independent p39 red-triad quadratic** is a scalar multiple of an **exact characteristic-polynomial factor** of the signed p15 Fibonacci matrix, with algebraic multiplicity two for the same root **24**. The absolute-value printed matrix does not have this factor. Under the two-source polynomial-matrix operation, `Q(M_signed)` has **rank 2 and nullity 2** over GF29, while the original p3 quadratic `13+23x+2x²` evaluated at the same matrix has **rank 4 and is invertible** (determinant **6**). A distinct p39-selected two-dimensional generalized eigenstate therefore exists without guessing a rune or plaintext key.

### New three-object p15/p39/p50 polynomial-matrix identity (14 November 2026)

A distinct check connects the *original* 256-cell pp49–51 numeric table to those already established p15/p39 objects without changing any ciphertext. Take its source-order **byte** coefficients reduced modulo29 as the descending polynomial `P(X)` (the published binary byte SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`). This polynomial is already known to contain the p39 factor `G(X)=15(X−24)^2`. In the independently calculated signed-p15 matrix's *other two* eigenvalues, an additional exact two-value match occurs:

| Fixed eigenvalue / original p39 target | Original table polynomial |
| --- | --- |
| x=8; p39's **first** red coefficient = **27** | **P(8)=27** |
| x=17; p39's **last** red coefficient = **15** | **P(17)=15** |
| x=24; p39's **double** root = **24** | **P(24)=0; P′(24)=0** |

Thus, using the known characteristic polynomial `χ_M=(X−8)(X−17)(X−24)^2`, the exact original table reduces to `P(X) mod χ_M = 6X³+24X²+22X+28 = (X−24)^2(6X+22)`. In particular, **P(M) = G(M) (12M+15I)** over GF29. The complete original-output 4×4 matrix is

```text
P(M) =  2  9  3 25
       22 13 24 12
        5  4  0 27
       14 21 22 27
```

It has **rank two** with nonzero eigenvalues **27,15**, the outer values of the same printed p39 red triad. This is a three-source exact arithmetic coincidence extending the previously known shared eigenroot, rather than another test of the already failed Hill/M-power decoders. As source alternatives, the table evaluated on the **literal unsigned** p15 matrix has **rank four**; reversing the 256 printed table coefficients before evaluating on the signed matrix also yields **rank four**. The original p3 red quadratic remains full-rank on the signed matrix. The 256-byte input, all 256 Horner steps, the four field values, matrix identity, rank controls and reconstructed characteristic remainder are independently rerunnable with the [original-source CommonJS SFT](../sims/lp2_p15_p39_p50_matrix_function_sft.cjs), [successful Windows Node22 run 43544735956](https://github.com/FlareZ123/liber-primus/actions/runs/43544735956).

**Evidence boundary and solve path.** If `P` is sampled uniformly among all GF29 polynomials sharing the original p39 double-root factor, its values at two *distinct*, independent fixed points 8 and17 are uniform, so the **specified two-value match** has probability 1/841 under this narrow conditional null. That calculation **does not** account for hindsight, the many cross-artifact relations considered in this repository, sign restoration or alternative polynomials. The signed p15 matrix, selected field/evaluation rule, table-byte parse and p39 triad are independently visible/inferred but **no creator instruction asks for P(M)**. Crucially **P(M) is singular**, so it cannot serve directly as a reversible four-symbol Hill key. **The full original-table quotient is a distinct algebraic object:** dividing the complete 256-coefficient source polynomial by the p39 red monic double-root factor, then evaluating all 254 quotient slots at the signed p15 matrix, gives the **invertible** source-only matrix `R(M)=[[21,27,22,0],[28,10,13,22],[12,0,9,13],[12,24,7,3]]`, with inverse `[[10,15,11,26],[28,16,11,9],[26,28,5,5],[4,27,11,6]]`. It is **not `12M+15I`**: singularity of `G(M)` prevents cancelling `G(M)` from `P(M)=G(M)(12M+15I)`. Direct complete Hill4 original-cipher decoding of all 76 p55 runes and independently all 232 p54 runes under both `R(M)` and its inverse produces nonlinguistic GP output with IoC 0.03088/0.03474 (p55) and 0.03549/0.03493 (p54). Both full original inversions and independently solved-p57 native plants round-trip exactly. See the [full-quotient source test](lp2-p55-p50-quotient-p15-hill4-original-gate.md) and [reproducer](../sims/lp2_p50_p39_signedp15_quotient_matrix_p55_sft.cjs). The exact algebra is preserved, but **no creator instruction selects either 4-rune Hill decoder**, and no authentic unknown plaintext has been recovered. A source-picked alternative consumer with an independently motivated output register or state remains necessary.



The signed matrix's exact multiplicative order is **812 = 28×29**, verified by `M^812=I` and `M^(812/q) != I` for prime factors `q∈{2,7,29}`. Its eigenvalue 24 has multiplicative order **7** in GF29 and a one-dimensional ordinary eigenspace. The unique eigenvector normalized to final coordinate 1 is **`v=[27,3,13,1]`**; `M v = 24v`, giving a frozen seven-block keystream without fitting a key. The extended generalized eigenspace can support a 203-step component under a Jordan chain, but there is no printed instruction choosing a generalized state, coordinate, or output mapping.

## Exact sign ambiguity resolves to the source-correct pair

The original 4×4 array is printed as **sixteen nonnegative magnitudes**. Its Fibonacci-prime rule requires **exactly two negative entries** before taking absolute values, namely the final row's first two cells (flattened row-major zero-based indices **12 and 13**). To assess whether the agreement with p39 can simply be generated by any conveniently chosen two-minus interpretation, fix **every one of the sixteen published magnitudes and its printed cell coordinate**, enumerate the complete **`C(16,2)=120`** possible pairs of negative entries, and demand the original p39 source-selected root **24** as a **double root of the resulting GF29 characteristic polynomial**. This is tested exactly with `χ(24)=χ′(24)=0 mod29`, independently of any eigenvalue factorization routine.

**Exactly one of all 120 sign pairs works: [12,13], precisely the two cells already selected by the independent Fibonacci-prime reconstruction.** The unmodified all-positive matrix and all sixteen single-negation matrices fail the same condition. This sharpens the evidence for the sign-restoration operation and provides a deterministic source-level inference: **given the two-negative constraint from the established Fibonacci construction and the independently printed p39 quadratic, the source fixes both signs uniquely.**

The source does not print minus signs. A choice to examine *exactly two* sign changes, characteristic polynomials, or the p39 root was made in the context of the manuscript, so `1/120` is a **conditional enumeration fraction**, not the probability of deliberate authorship. No plaintext or independently source-selected cipher is recovered. The SFT asserts all 120 models and both no-flip and one-flip controls.

## Exact row-preserving source null, conditional only

A source-matched finite experiment enumerates **all 24⁴ = 331,776** permutations within the four original p15 **signed** rows, leaving their row inventories, negative-prime restoration and p39 quadratic completely unchanged. **378/331,776 = 0.001139322917** random row-order arrangements also have 24 as a repeated characteristic root. The original has this property. The **exhaustive rowwise null is implemented in the same CommonJS SFT** using the exact determinant and characteristic-polynomial derivative, retaining row groups and counting duplicate-value permutations consistently.

These numbers describe rarity **conditional on this retrospective model**, not manuscript-authentication probability. The sign-restoration operation, GF29 characteristic polynomial, selection of the p39 red triad, root factor target, and sample family were recognized using this same manuscript; discovery-wide correction is absent. The closeness to **1/29²** is expected for two independent conditions on a random quartic. A low conditional tail cannot establish Cicada's intent.

## First source-constrained inverse, and what it decides

A direct, inexpensive decipherment was frozen from only the source-selected eigenvector `v` and the signed matrix. Start at the first black rune after p40's **eight-rune red heading** and continue through p53, exactly **3,000 original runes = 750×4**. For each four-rune block `i`, update `v ← Mv` and subtract or add its four GP29 entries from the original ciphertext, with no fitted phase, state, clock, symbol alphabet, skips, word segmentation or language search. Source-native **92 clear runes on p57** are encrypted and recovered exactly as positive controls for both signs. Both original inverses re-encrypt all 3,000 runes.

| Source-direct candidate | Original 3,000-rune IoC |
| --- | ---: |
| Unchanged ciphertext | **0.034544403690** |
| Ciphertext minus source eigenstate | **0.034489496499** |
| Ciphertext plus source eigenstate | **0.034502611982** |
| Genuine solved p57 first 92 runes (separate control) | **0.062111801242** |

Neither source-defined sign yields plaintext; both remain near-uniform. This rejects the **direct seven-block GP29 additive key** on the original p40–53 body. It does *not* refute the polynomial factor, a source-selected two-dimensional projector, a nonlinear key consumer, or the possibility of an accidental factor match.

## Independent p3 red polynomial as an invertible four-symbol operator

The source contains a second, numerically independent, identically located red quadratic: p3 local119 has coefficients `[13,23,2]`, which define `R(x)=13+23x+2x²`. Unlike the p39 polynomial, `R(M_signed)` is a **full-rank four-by-four GF29 matrix with determinant 6**:

```text
R(M_signed) = [23 19 12 24]
              [21 23  3 10]
              [22 18  0 10]
              [27 19 25 26]

R(M_signed)^(-1) = [20  2 25 18]
                   [ 3 19 25 16]
                   [21  8  5 18]
                   [26  2 19  7]
```

This yields a distinct, completely reversible **direct Hill candidate** whose matrix coefficients are *not* the printed p15 coefficients. Test both `R(M_signed)` and its inverse without any fitted key, phase, initial state or source reordering on the 1,744 original pp16–22 runes and the separate 3,000 original pp40–53 black-body runes.

| Original target | Decryption operator | Decoded GP29 IoC |
| --- | --- | ---: |
| pp16–22 | `R(M_signed)` | 0.034552364109 |
| pp16–22 | `R(M_signed)^(-1)` | 0.034735271361 |
| pp40–53 black | `R(M_signed)` | 0.034440146716 |
| pp40–53 black | `R(M_signed)^(-1)` | 0.034346559964 |

All four inverses recover **no apparent plaintext**. Each original 4-rune block re-encrypts identically under the source-derived matrix, while an independent planted 92-rune native-GP p57 control decrypts exactly in each direction. These tests retire the simplest full-rank p3-polynomial direct consumer. Both original p3 and p39 polynomials can still contain useful information about the signed matrix without specifying such a direct Hill cipher.

## A source-defined field-to-dual-number bridge via the p50 table

A prior, independently reproduced calculation on the actual **256 printed base60 table bytes** takes the polynomial quotient by the p39 red quadratic and reduces it modulo the p3 irreducible quadratic. It recovers the exact **primitive GF(29²) element `g=19+13u` of order840**, as documented in [the existing original-source p50/p39/p3 remainder](p50-p39-p3-field-remainder.md).

The new p15 matrix factor connects that field to a different ring. The p3 quadratic is **irreducible**, defining the 841-element field with **840 nonzero units**. The p39 quadratic `15(x−24)²` instead defines the 841-element **dual-number ring** `GF29[ε]/(ε²)`, with `ε=x−24` and **812 units**. Its unit group has exponent **812**, and `19+13ε` has **exact order812** because 19 has order28 modulo29 and the nonzero nilpotent coefficient introduces factor29. This is the same exact order as the independently reconstructed signed p15 matrix.

The two-element coefficient vector `[19,13]` is obtained from the already pinned p50/p39/p3 source chain. Interpreting it on p39's nilpotent coordinate gives the **explicit four-dimensional source polynomial**

```text
H(M) = 19I + 13(M−24I) = 13M+26I (mod29)

     = [11 10 28 25]
       [13 22 12  6]
       [27 18 12  4]
       [17 11 11 22]
```

The full `H(M)` is invertible, has order **812**, and can act as a reversible four-rune Hill operator. The exact signed p15 original layout is retained, the coefficients originate from the independently existing p50 quotient, and the shift24 comes from p39's printed double root. **The choice to identify field coordinate u with nilpotent coordinate ε is an additional, unprinted inference.** A reader must not mistake identical coefficient vectors for an authenticated historical instruction.

Apply `H(M)` and `H(M)⁻¹` directly, with the complete unchanged 4-rune boundaries, to both candidate sections and exactly reverse on solved p57 native-GP plants:

| Original input | `H(M)` output IoC | `H(M)⁻¹` output IoC |
| --- | ---: | ---: |
| pp16–22, 1,744 runes | **0.034226025991** | **0.034340507508** |
| pp40–53 black, 3,000 runes | **0.034434367011** | **0.034527509170** |

Neither operation recovers GP-native prose. The bridge provides a concrete source-only **candidate algebra and full-order operator**, while the direct stationary Hill consumer is rejected on original ciphertext. Further attempts require an independent cipher-state/seed or information-extraction instruction. In particular, do not search arbitrary powers of `H` or pick an output coordinate using language.

## A single coordinate selected by the printed red 3299 cell (Agent20, 13 November)

The red **3299** cell is physically at row2, column2 of the 4×4 p15 numerical square, giving one independently visible scalar coordinate without selecting an arbitrary eigenvector or one of 29 output projections. A human could read successive powers of the exact signed Fibonacci matrix at **that same cell**, then subtract each GP29 key symbol from the next source-visible encrypted chapter after the square. This is an explicit reversible hypothesis; **the original image does not command matrix exponentiation or a rune-by-rune clock**. The clock is frozen at power zero, the operator is the solved-p56 sign convention, and the complete target is original p15 rune offset9 immediately after the square through physical p22, all **1,894 runes**. No IV, phase, output coordinate or sign is selected from the candidate output.

For signed matrix `M` above, define `K_t=(M^t)[1,1] mod29` (zero-based coordinates), `P_t=C_t-K_t mod29`. Although `M` itself has exact order **812**, the *single visibly marked entry* has **exact period28**, with the 28 outputs

`[1,22,13,5,19,11,4,2,27,2,7,28,22,12,11,5,26,3,28,15,11,10,0,8,1,19,4,3]`.

Only **18 distinct** GP29 values occur in that orbit. More strongly, the entire sequence has an exact, closed field representation

`K_t = 17·8^t + 7·17^t + 6·24^t (mod 29)`.

The coefficient of the generalized Jordan term `t·24^t` is **exactly zero** in the highlighted coordinate, despite the full signed matrix having a nontrivial order29 factor. The formula is asserted at all 812 original matrix powers in the same standalone reproducer. All three surviving roots have periods dividing28 (the 24 root has period7), rigorously explaining the much shorter scalar period without a numerical coincidence argument. Its exact third-order recurrence is `K_t+9K_(t−1)+11K_(t−2)+13K_(t−3)=0 (mod29)` for `t≥3`, compared with the full matrix's degree-four characteristic polynomial. This order-three recurrence is now also asserted on the original 812-step key orbit. The source-selected scalar therefore cannot, on its own, carry the matrix's full812-step state. This is a concrete constraint on any proposed use of the red cell as the sole stream output and explains why the printed repeated root does not directly supply a 29-state scalar register.

The unchanged **1,894 original rune** input has IoC **0.0344948961633**; the unique frozen subtraction yields **0.0344179160593**, and its first 24 decoded GP symbols are `M H H R S M P W E IA X J H IA M B EA H U I M AE X R`. There is no coherent native-GP plaintext. Exact forward reencryption reconstructs every original symbol; independently clear LP2 p57 (95 runes, IoC **0.0627099664**) is encrypted by this exact operation and recovered **95/95**. The positive control checks the arithmetic, without authenticating the cipher.

**Decision:** the page's unique red cell genuinely fixes one scalar-output coordinate, but the simplest forward-power, zero-exponent, direct GP29 decoder fails on the complete immediately following original chapter. Its effective period28 additionally prevents treating this scalar alone as the source's full-order812 two-dimensional generalized eigenstate. Continue only if an independently printed instruction specifies a *different* operand or cryptographic use, not by tuning the exponent or shifting to an unmarked matrix entry. [Read-only CommonJS source-exact reproducer](../sims/lp2_p15_signed_redcell_scalar_sft.cjs) · [successful original-source Windows Node22 CI run 43518392186](https://github.com/FlareZ123/liber-primus/actions/runs/43518392186), including syntax check, 812-power closed-form assertions, complete exact reencryption, and solved-p57 plant.

## All-secret direct periodic-pad gate at the independently derived 812/840 clocks (Agent15, 14 November)

The source matrix order **812** and the p50/p3 primitive field-element order **840** select specific exact periods, but do not, by themselves, prescribe how a cipher consumes those periods. An independently testable **necessary condition** exists for two simple models that would consume one GP29 keystream symbol per rune. For a secret periodic additive key with any entries or unknown starting phase, \`C_i=P_i+K_(i mod T) (mod29)\`, the equality \`C_i=C_(i+T)\` occurs **if and only if** \`P_i=P_(i+T)\`. For a predecessor-chained additive cipher with \`C_i−C_(i−1)=P_i+K_(i mod T)\`, that same equality must hold in the **ciphertext first-difference** stream, excluding its initial symbol. In either model, a native-GP plaintext's substantial rune-frequency collision rate survives an otherwise arbitrary secret periodic pad. A source-authored secret seed, phase and each keystream digit remain entirely free, so this is stronger than trying one explicit red-cell output clock.

The test keeps the source-visible p15 numerical square outside the original pp16–22 ciphertext and strips the eight red heading runes before the original pp40–53 **3,000-rune black body**. As a third, explicitly conditional route, one matrix power per **four-rune block** gives a rune period \`4×812=3248\`; the 9,194 original pp16–55 runes can test it **only if that candidate pad continues across all intervening chapter boundaries without resetting**. These are motivated candidate register/clock readings; no original instruction selects them as the actual cipher.

| Original unmodified target | Frozen exact period in runes | Direct-symbol equal pairs | Chained-step equal pairs | Smallest native GP reference match rate |
| --- | ---: | ---: | ---: | ---: |
| pp16–22 (1,744 runes) | **812** | **31/932 = 3.33%** | **27/931 = 2.90%** | **4.61%** |
| pp40–53 black (3,000 runes) | **812** | **80/2,188 = 3.66%** | **76/2,187 = 3.48%** | **≈4.4%** |
| pp40–53 black (3,000 runes) | **840** | **83/2,160 = 3.84%** | **85/2,159 = 3.94%** | **≈4.8%** |
| pp16–55 continuous (9,194 runes) | **3,248** | **215/5,946 = 3.62%** | **221/5,945 = 3.72%** | **≈4.5%** |

The native positive references are previously pinned Shakespeare, Gibran and Emerson source texts converted to the manuscript's GP29 alphabet, in **420 fixed, equispaced matched-rune-length windows**. For every case and source window, the source-native plaintext equality rate exceeds **both** original ciphertext rates. Source-native positive ciphertexts encrypted with an arbitrary seeded 812-, 840- or 3,248-symbol pad preserve the equal-pair counts exactly, in both direct and chained forms. This is an **empirical conditional exclusion** of ordinary GP-register plaintext under the named one-rune-per-clock additive models, with no key search or language-parameter fitting; it is not an impossibility over all plaintext distributions.

The boundary is important: a Hill operator mixing four runes, a key read out from a state that does **not** repeat at these rune intervals, a different per-block clock, a reset inside the tested span, plaintext differentials used as the input symbols, or another high-entropy intermediate register can all evade this invariant. A 3,248-rune clock cannot be judged within the 3,000-rune p40–53 body alone. These negatives do **not** refute the independent p15/p39/p50 arithmetic coincidence or expose any plaintext. They decisively deprioritize further hunting for an arbitrary hidden key/phase inside those **specified** periodic GP29 additive consumers.

The [original-source, key-blind CJS SFT](../sims/lp2_sourceperiod_keyblind_gate_sft.cjs) verifies all original counts, all 420 native controls and actual seeded encrypt/decrypt invariants. [Windows Node22 manual CI run 43580597583](https://github.com/FlareZ123/liber-primus/actions/runs/43580597583) passed with the final source-marked black-body targets.

## Entire 28-phase secret-alphabet family: original input obstruction (Agent20, 13 November)

The uniquely marked red-cell scalar has a source-derived **28-position key period**. A strictly more generous model than the frozen red-cell shift grants **each of the 28 phases an arbitrary and independent secret GP29 substitution bijection**; the 28 alphabets need not arise from the matrix at all. The original source clock is p15 rune9 (after the numerical square), continuing across the complete 1,894-rune pp15–22 suffix. In every phase, a bijective symbol map permutes that phase's histogram without changing the largest bin count. Therefore the sum of those 28 maximum counts is an exact **all-secret invariant** that no key guess can improve.

Across the untouched original 1,894-runic target, that maximum-sum invariant is **169** and the similarly permutation-invariant summed Pearson chi-square is **791.4407374890**. Native GP English controls use complete, source-independent Shakespeare, Gibran and Emerson text, in 1,894-rune contiguous windows with stride947, with Cicada GP spelling normalizations. Gibran has **65 windows**, maximum-sum **242–283**; Shakespeare **230 windows**, **234–297**; Emerson **341 windows**, **243–308**. The original **169** is below **all 636/636 source-native reference windows** under every possible set of 28 unknown alphabet bijections; original summed chi-square is also below every sampled control. The test includes an entire 1,894-rune GP-native English plant encrypted under a different phase-dependent secret affine bijection `C=(7P+3+phase) mod29` at each of 28 phases; its inverse recovers **1,894/1,894** exact symbols and the original plaintext invariant is preserved. [Standalone original-source CJS SFT](../sims/lp2_p15_redcell_period28_allsecret_sft.cjs) · [successful all-secret original source CI 43519092972](https://github.com/FlareZ123/liber-primus/actions/runs/43519092972).

**Decision:** for the declared original p15 post-square clock, no stationary-within-phase **period28 bijective cipher alphabet** can decode this original section to a passage with 28-phase native-GP frequency statistics resembling any of the 636 sampled English controls, including the particular red-cell scalar additive key and **arbitrary** secret 28-phase masks. This is an empirical matched-reference exclusion, not a universal theorem about every possible English string. It does not exclude state periods 812, non-GP plaintext registers, intermediate binary material, nonbijective mappings, genuinely changing state, or another source-selected boundary; those require separate creator-visible motivation. No unknown plaintext or key recovered.

## Key-independent all-secret two-dimensional kernel-pad gate

The common factor supplies a sharper test than adding one favored eigenvector as a key. Let `B=Q(M_signed)` with source-known rank2. If any proposed four-GP-rune cipher has `C=P+K mod29` with **an arbitrarily complex, arbitrarily changing secret four-vector `K` in the entire two-dimensional kernel of `B`**, then necessarily `BC=BP` on *every* source block, for every such key. No key search, alphabet permutation or assumed period can evade this invariant. The first two independent rows of `B` give a complete 29²-state quotient:

```text
B = [22 17 17  4]
    [19 13 14 20]
    [19 28 24 19]
    [ 8  3 19 21]
```

This test uses **all 1,744 original pp16–22 runes**, and separately the **3,000 original pp40–53 body runes** after p40's eight-rune red heading, in four-rune blocks, with fixed physical source ordering. A smoothed 841-state projection-pair frequency model is trained on *two* independent, GP-native literary source corpora, withholding the third as the genuine-English test set. It then measures mean heldout log likelihood per four-rune projected pair. The Gibran, Shakespeare and Emerson heldout windows are source-order contiguous and use exactly the same original block lengths and every half-length stride. The `Q(M)` operator and original target boundaries were frozen before scoring.

| Original target | Heldout native source | Original log score per pair | Minimum genuine native window | Genuine native windows no better than original |
| --- | --- | ---: | ---: | ---: |
| pp16–22 (1,744 runes) | Shakespeare | **−6.810718** | −6.765396 | **0 / 247** |
| pp16–22 | Gibran | **−6.809072** | −6.723191 | **0 / 70** |
| pp16–22 | Emerson | **−6.824462** | −6.762369 | **0 / 367** |
| pp40–53 black body (3,000 runes) | Shakespeare | **−6.786917** | −6.748414 | **0 / 143** |
| pp40–53 black body | Gibran | **−6.776668** | −6.709836 | **0 / 40** |
| pp40–53 black body | Emerson | **−6.786404** | −6.747914 | **0 / 213** |

The source-native control mapping retains multi-letter GP digraphs, its special ING/IO runes and period-authentic K/Q/V/Z spellings. A separate **3,000-rune genuine-English positive plant** adds a changing nonzero kernel key `K_block = (7·block+3)v mod29`, then verifies that all **750** projected pairs remain exactly unchanged and that the original 3,000 native GP symbols can be inverted precisely with the planted key. This is an all-secret key-independent obstruction of the declared mechanism rather than a failure to guess its state.

**Decision:** both originals look like near-uniform projections rather than native GP English under any additive pad concealed entirely in `ker Q(M)`. The result is descriptively below every matched control window from three genres, with overlap and common training assumptions; do not interpret the six correlated comparisons as six independent statistical tests. It excludes ordinary native-GP-English **for this additive kernel-pad architecture**, without excluding compressed/intermediate plaintext, another alphabet, non-additive ciphertext feedback, block reordering or a genuine different cipher. The exact polynomial factor remains real, yet the straightforward way to use its nullspace for a hidden key now has an explicit adverse original-cipher test.

[All-secret source-projection CommonJS SFT](../sims/lp2_p15_p39_projection_kernel_allsecret_sft.cjs).

## Matrix-order-812 full-key invariant on the original p40–53 black body (Agent5, 14 November)

The signed p15 matrix has exact order **812** over GF29, an invariant already proved above. This yields a stronger original-cipher test than guessing coordinates, phases or a matrix seed. If an additive GP29 key is generated by repeatedly applying that matrix to **any** fixed hidden state and reading **any fixed deterministic state function**, then **every possible such key satisfies** `K[t+812]=K[t]`. For the simple additive model `C[t]=P[t]+K[t] mod29`, every lag-812 ciphertext equality is consequently *the same event* as the corresponding plaintext equality, independently of the secret state, key function, or initial phase.

Physical p40 begins the original large floral chapter with a source-visible eight-rune red heading. Removing only that heading leaves precisely **3,000** authentic GP29 ciphertext runes through p53, without changing the original order or crossing the distinct p53→p54 chapter boundary. At original lag812 there are **80/2,188 = 0.0365630713** equal-rune pairs.

To test the necessary condition on source-native GP29 without inventing plaintext, three previously pinned independent texts were encoded by the established longest-token Gematria Primus orthography. Non-overlapping length3,000 windows give:

| Fixed GP29 native source | Independent windows | Smallest lag812 equality count | Median | Largest | Windows ≤ original 80 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare | 72 | **110** | 130 | 166 | **0** |
| Gibran | 21 | **107** | 135 | 160 | **0** |
| Emerson | 108 | **108** | 139 | 179 | **0** |
| **Total** | **201** | **107** | | | **0** |

This comparison uses contiguous source prose and the exact observed lag, rather than a distribution of artificially independent rune pairs. It is still a finite register-specific exclusion, not an impossibility proof for every English text, deliberately atypical message or changed plaintext unit.

**Full positive control:** the original signed p15 matrix generated a fixed 812-period keystream from a synthetic state, was applied to a 3,000-rune held-out GP-native Gibran passage, and its unchanged state inverse recovered **3,000/3,000 plaintext symbols**. All lag812 equalities survive encryption exactly. The single-file [source-exact Windows Node22 test](../sims/lp2_p15_signedM_order812_allsecret_additive_sft.cjs) passed [original-cipher CI 43566691204](https://github.com/FlareZ123/liber-primus/actions/runs/43566691204), checking source lengths and every reported finite count.

**Decision:** the signed-p15 matrix cannot serve as a *single 812-period additive key clock* on the authentic p40-red8→p53 3,000-rune black body under these three GP-native English controls, **even if all hidden matrix seeds, fixed output coordinates and initial phases are unknown**. This is an all-secret, key-independent obstruction for that exact architecture. Changing-state encryption with output depending on plaintext/ciphertext, a separately keyed page clock, variable-length byte register, and a different operand remain possible. The source does not itself authorize the p15→p40 transfer, and this negative does not license another arbitrary operator.

## Research decision

The exact crosspage polynomial factor, including its **unique match to the source-authentic two-negative sign pair**, is a concrete **candidate selector** for the previously unmotivated signed-matrix reading of p15. It earns a bounded independent decoder investigation if a separate manuscript cue identifies **how to use `Q(M)`** to remove a state or decode output coordinates. Without that consumer, extracting arbitrary eigenstates and fitting GP language would produce an unauthenticated cipher. The direct eigenstate pad, the uniquely red-selected scalar-power pad, **p3 polynomial and p50-to-dual primitive direct Hill decoders**, and **all additive keys confined to the quadratic kernel**, as well as **any single 812-period matrix-driven additive key on the p40 red8→p53 body**, fail their respective original source-native GP language tests, so **do not escalate into unconstrained 812-clock/coordinate/phase sweeps**. A stronger independent source instruction would be needed before investigating a different, genuinely nonlinear consumer.

[Original-input CommonJS SFT](../sims/lp2_p15_p39_signed_matrix_eigen_sft.cjs) · [Successful complete Windows CI 43517223823](https://github.com/FlareZ123/liber-primus/actions/runs/43517223823) · [Prior literal-matrix OFB/CFB gate](lp2-p15-fourstate-ofb-cfb-source-gate.md) · [Independent p3/p39 quadratic field investigation](lp2-red-triad-frobenius56-source-state.md) · [Established p15 prime spiral](../results/lp2-p15-fibonacci-prime-spiral.md).
