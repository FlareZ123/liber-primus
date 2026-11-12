# Physical p2 versus pp23–26: a complete five-stream additive obstruction

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

## Source exactness, positive control and limits

[Runnable standalone Node.js/CJS reproducer](../sims/lp2_p2_p23_five_stream_separable_rank_sft.cjs) pins canonical corpus Git blob **054f2a0f780b7d46901acbe3d9bf4f0ac1801165**, asserts the original page lengths (p2 201, p23 213, p24 270, p25 273, p26 265), and calculates all eight ranks independently. It tests the same exact original 201×5 inputs with a genuinely valid nonlinear positive plant: f_k(s)=s²+(k+1)s+7k mod29, output renderer π(s)=7s+11 mod29, all 29 outputs present. The positive plant round-trips exactly. Its equality-matrix ranks **138 and 139** are one below the respective constant-only ceilings, as required by its nonconstant original-input outputs. This checks the algebraic gate against a decoder that genuinely works.

Related prior work [five-dot original art and historical Shamir transfer](lp2-five-dot-three-page-art-and-phi-transfer.md) ruled out historically specified fixed five-of-ten interpolation and a shared unknown input-alphabet permutation. This result permits **five completely different nonlinear lookup tables**, each with 29 unknown values. It is not the previous IoC-based Hill5 exclusion and is strictly stronger for the proposed p2 cross-page output identity.

**Decision:** stop investigating p2 as the output of a stationary, separable GP29 five-input addition under these two authentic source segmentations. Nonseparable interactions between inputs, position-dependent state, different payload framing and other historical encodings are outside this exact theorem. A new source-selected consumer is required before promoting any alternative to a plausible decoder.
