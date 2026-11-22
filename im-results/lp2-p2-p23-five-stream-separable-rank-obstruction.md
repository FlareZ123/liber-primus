# Physical p2 versus pp23–26: two complete five-stream algebraic obstructions

**Agent25, 12 November 2026. Classification: exact key-independent original-input exclusion.** This result recovers no unknown LP2 plaintext, historical key, or destination.

## Source-selected question

Physical p2 is the only unknown LP2 page containing exactly **201 GP29 runes**. On physical p23, five printed dots precede a red heading of 16 runes. Starting after this heading, physical pp23–26 contain exactly **1,005 runes = 5 × 201**. The five-dot design also appears on p7 and solved p56, so the graphic does not independently establish a p2/p23 cipher relation. It does supply a reasonable original-artifact reason to test five 201-position inputs against p2.

Two frozen layouts consume all 1,005 original source runes: **201 consecutive quintets** or **five consecutive 201-rune strands**. Independently reverse either full source or the 201-rune p2 target, yielding eight tests in total.

## Model and exact exclusion

Let each source rune be a label in the 29-element alphabet Σ. Permit **five arbitrary, independent, stationary secret tables** f_0,...,f_4: Σ → GF(29). The output is the modular sum of their five values followed by **any unknown bijection** π: GF(29) → Σ:

**Y(j) = π(Σ[k=0..4] f_k(X(j,k)) mod 29).**

This is a stronger family than fixed Hill/Shamir coefficients, and permits any secret nonlinear per-lane rune relabeling. The target Y is the unchanged 201-symbol original p2 ciphertext. Every repeated target rune Y(i)=Y(j) forces

**Σ[k=0..4] (f_k(X(j,k)) − f_k(X(i,k))) = 0 (mod 29).**

Use each of the 29 p2 rune identities' first occurrence as anchor for all its other occurrences. This gives exactly **172 GF29 linear equations** in **145 unknown function values**. The exact matrix ranks are:

| Source layout | Reverse full source | Reverse p2 | Rank of 172×145 matrix | Nullity |
| --- | --- | --- | ---: | ---: |
| Adjacent quintets | either | either | **139** | **6** |
| Five contiguous 201-rune strands | either | either | **140** | **5** |

This table exhaustively summarizes all **eight** input orientations. The five constant lookup functions are always independent null vectors. The quintet layout additionally leaves the rune **H** absent from lane 1 (zero-based), giving exactly one *unused* table entry and one additional free null vector. All other 144 or 145 lane entries are observed. The rank reaches the maximum compatible with these necessary null directions. Accordingly, **every possible assignment of all secret tables makes their sum constant on every observed input**. A bijective output renderer can output only one rune; the authentic p2 sequence uses **all 29 distinct runes**. Thus this entire stationary, separable-additive 201×5→201 family is **impossible on the original printed ciphertext** in either fixed layout, even with arbitrary hidden per-lane and output alphabets.

This proof is language independent. It does not require p2 to be readable plaintext. It excludes a proposed transformation between two original ciphertext units.

## Independent cross-lane polynomial degree boundary (original ciphertext, all secrets)

The additive theorem above permits five arbitrary independent nonlinear unary tables but has **no cross-input interactions**. A separately natural candidate takes the five original GP29 rune indices as a five-variable input and lets the entire unknown ciphertext-to-ciphertext consumer be **any stationary polynomial of total degree d**, rendered through an arbitrary secret **bijective output alphabet**:

\[
Y_j=\pi\big(F(X_{j,0},X_{j,1},X_{j,2},X_{j,3},X_{j,4})\big),
\quad F\in\mathbb F_{29}[x_0,\ldots,x_4], \quad \deg F\leq d.
\]

The source-selected candidate includes arbitrary secret *cross-lane* quadratic, cubic and quartic coefficients. The 2013 five-share Shamir precedent used a polynomial of degree four in **one share coordinate**; the five-variable polynomial here is a genuinely different hypothetical consumer and is not implied by that historical step. Exact original H/G factors from the numeric table separately demonstrate finite-field polynomial arithmetic, but do not prescribe this specific p2/p23 map.

Let M_d be all monomials of total degree at most d in five variables. Their dimensions for d=1..5 are \(\binom{d+5}{5}=[6,21,56,126,252]\). Each repeated original p2 output rune forces the equality \(F(X_i)=F(X_j)\), independently of \(\pi\). There are 172 exact linear constraints over GF29 in the unknown monomial coefficients. Compute their rank with the original 201 paired input quintets or five original 201-rune strands, with both source orientations and both target orientations.

| Degree bound d | Monomial coefficients | Rank, all 8 original input orientations | Nullity | Meaning |
| ---: | ---: | ---: | ---: | --- |
| 1 | 6 | **5** | 1 | Constant functions only |
| 2 | 21 | **20** | 1 | Constant functions only |
| 3 | 56 | **55** | 1 | Constant functions only |
| 4 | 126 | **125** | 1 | Constant functions only |
| 5 | 252 | **172** | 80 | Equality gate underdetermined |

For every d≤4, the constant polynomial is the **entire nullspace**, since its coefficients always satisfy all equality equations. Thus **all unknown source-key polynomial coefficients of total degree ≤4**, including every nonlinear cross-lane term within that degree, yield an identical value at all 201 original source rows. No output-alphabet bijection can transform one fixed value into 29 distinct original p2 rune identities. This is an **exact mathematical impossibility**, without relying on English scoring or guessing coefficients.

The threshold is sharp for this fixed input. The degree-five **201×252 original input evaluation matrix has row rank exactly 201**, in either source layout and either source orientation. Therefore a degree-five GF29 polynomial can be explicitly interpolated to **any desired 201 rune labels**, including the entire original p2 ciphertext, with 51 or more free coefficients. That perfect 201/201 synthetic fit cannot authenticate an intended cipher or recover plaintext. It instead quantifies where unconstrained polynomial fitting begins.

The [independent original-input polynomial SFT](../sims/lp2_p2_p23_polynomial_degree_gate_sft.cjs) verifies all eight degree-one through degree-five ranks, the original source row ranks, and a constructive degree-five interpolant that exactly regenerates every p2 rune. On the **actual original 201×5 inputs**, the positive control instead plants a genuine nonconstant **degree-four** polynomial \(F=x_0x_1x_2x_3+2x_4^2+7x_2+3\pmod{29}\) followed by the secret output permutation \(\pi(z)=7z+11\pmod{29}\). Across all four source layouts/orientations, it has 29 distinct output symbols, exact known forward/inverse transformation, and repeated-output equation rank **124**, one below the real ciphertext's maximal **125**. This demonstrates that the rank obstruction detects the exact family it purports to test, rather than merely rejecting every degree-four polynomial by construction.

**Interpretation:** for the fixed GP-index register and the two source-native five-way layouts, the original p2 ciphertext is incompatible with every low-degree polynomial decoder through total degree four, with any arbitrary key coefficients and secret final alphabet. This polynomial result allows cross-input terms that the earlier separable lookup theorem does not; conversely it fixes the GP input field labels that the separable theorem lets each lane freely relabel. The two exclusions are complementary and do **not** prove the source pair was intended as a cipher.

## Source exactness, positive control and limits

[Runnable standalone Node.js/CJS reproducer](../sims/lp2_p2_p23_five_stream_separable_rank_sft.cjs) pins canonical corpus Git blob **054f2a0f780b7d46901acbe3d9bf4f0ac1801165**, asserts the original page lengths (p2 201, p23 213, p24 270, p25 273, p26 265), and calculates all eight ranks independently. It tests the same exact original 201×5 inputs with a genuinely valid nonlinear positive plant: f_k(s)=s²+(k+1)s+7k mod29, output renderer π(s)=7s+11 mod29, all 29 outputs present. The positive plant round-trips exactly. Its equality-matrix ranks **138 and 139** are one below the respective constant-only ceilings, as required by its nonconstant original-input outputs. This checks the algebraic gate against a decoder that genuinely works.

Related prior work [five-dot original art and historical Shamir transfer](lp2-five-dot-three-page-art-and-phi-transfer.md) ruled out historically specified fixed five-of-ten interpolation and a shared unknown input-alphabet permutation. This result permits **five completely different nonlinear lookup tables**, each with 29 unknown values. It is not the previous IoC-based Hill5 exclusion and is strictly stronger for the proposed p2 cross-page output identity.

**Decision:** stop investigating the original p2 output as either (a) a stationary separable-additive combination of five arbitrary secret unary GP29 maps or (b) a stationary GP29 multivariate polynomial of total degree at most four, with arbitrary secret coefficients and secret final output alphabet, under these two source-native 201×5 segmentations. Higher-degree interpolation can reproduce p2 exactly but is mathematically unconstrained and supplies no recoverable key or authentic plaintext. Secret nonlinear input relabeling with cross-lane interactions, position-dependent state, different payload framing and other historical encodings remain outside these exact theorems. A new original-source-selected operation is needed to advance this cross-page connection. A new source-selected consumer is required before promoting any alternative to a plausible decoder.
