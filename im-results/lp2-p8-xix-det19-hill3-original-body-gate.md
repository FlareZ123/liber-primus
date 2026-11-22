# P8 red XIX/3×3 determinant19: exact title-derived Hill key, original 243-rune receiver gate

**Agent17, 22 November 2026. Classification: a source-structural cipher-key candidate, with complete original-receiver negatives.** This report establishes an exact self-check on the original red heading and tests the most immediate *reversible* encipherment interpretations. It does not establish creator intent, identify an authentic secret key, or recover any unknown LP2 plaintext.

## Source-first reconstruction and human hypothesis

The archived 2014 Cicada invitation has a period-documented sequence of *whitespace* primes2..37 omitting19. The preserved whitespace is **not protected by the original cleartext PGP signature** and is absent in another mirror; this is a historically plausible clue, not an authenticated new key. A distinct source hint appears in physical p8's original red heading: the first three GP runes are **ᛉᛁᛉ**, literally **XIX** (Roman 19), and this three-rune sequence occurs **exactly once** in the original 12,956-rune unknown LP2 region.

Instead of interpreting all12 red runes as an additive key, read `XIX` as a public numeric checksum / possible initialization vector, then arrange the **remaining nine red GP rune indices** into a conventional row-major GF29 3×3 matrix. Those nine runes begin with the final **M** of the p8 heading's *first original red word*, then contain all eight runes of its second red word. This **3+9 split crosses an original word boundary**, because the physical red heading's two words have lengths **4+8**. No inscription explicitly draws or instructs a 3×3 grid. That is the decisive unselected premise to keep visible.

The resulting original, unswapped GP0-valued title register is:

`[14,10,14] | [19,1,14,19,5,2,13,3,17]`

The natural remaining 3×3 key is

`K = [[19,1,14], [19,5,2], [13,3,17]]`.

Its integer determinant is **1,092**, and `1092 mod29 = 19`, exactly the preceding **XIX**. This supplies an arithmetic **self-check**, unlike an arbitrary nine-glyph key guess. `K` is invertible over GP29 with

`K⁻¹ = [[24,12,1], [21,12,12], [24,16,4]] (mod29)`.

Both matrix products are exactly identity. **The matrix has two more exact self-descriptions:** its trace `19+5+17=41 ≡12 (mod29)` equals the *twelve original red heading runes*, and its characteristic polynomial factors as `χ_K(x)=x³−12x²+6x−19=(x+2)(x²−14x+5) mod29`. Therefore `−2` is an eigenvalue, where **2 is the fifth complete red-word product on preceding p7**. The determinant, trace and characteristic-root relations are exact; their interpretation as authored checksums remains retrospective. The quadratic factor defines the same **isomorphism class** of GF(29²) as the p7 irreducible `x²−8`, but every irreducible quadratic over GF29 does; field isomorphism by itself is no evidence of a shared key.

The determinant coincidence is specific to the previously adopted *zero-based GP29 index* convention: using one-based indices gives determinant **6 mod29**, and native GP prime-value entries give **15 mod29**. This is a real dependence of the hypothesis, not a suppressed rival.

Immediately below, p8 contains exactly **243 black rune characters**, i.e. **3⁵**, a complete integral 81 blocks of size3. The p7 preceding five marked red words may make the exponent5 interesting, but no explicit period-2014 source instruction says to apply these nine red runes as a Hill key to the 243 black symbols. The local p7 red butterfly and its 29-state polynomial also reuse the zero-based GP convention, so their numerical agreements are not independent sources of author authentication.

## Numeric self-description and exact conditioned alternative family

The literal red prefix serves naturally as a 3-rune vector `v=[14,10,14]`. The fixed 3×3 matrix has the additional exact relation **`K⁻¹v=[6,2,1]`**, or equivalently **`K[6,2,1]^T=v^T`**. The first two coordinates resemble values `a=6` and shared `K=2` in the separately reconstructed *candidate* LP2 DH23 state from p28/p57; the final1 is the field unit. This association was made **after** observing the inverse result. No signed Cicada instruction says to treat the red prefix as a Hill plaintext/ciphertext vector or to interpret the output as that DH triple.

The whole 3×3 matrix also has an internally readable third check. Its three off-diagonal paired products satisfy `1·19 +14·13+2·3=207≡4 mod29`, exactly the original **first red word product4**. Given the observed trace12 and determinant19, this equality is algebraically equivalent to the characteristic-root `χ_K(−2)=0` already stated above; they must **not** be counted as two independent matches.

A complete deterministic finite comparison is more informative than treating these facts as separate guessed p-values. Freeze the original first red `XIX` prefix and first whole-word product4 (which force the following GP index19), the second red whole-word product3, its terminal index17, and the title-length/trace12 condition. Enumerate **all 28⁵ = 17,210,368** admissible nonzero GP29 replacements of the six remaining unconstrained matrix entries, preserving these facts exactly. The results are:

| Additional exact source test | Matching alternative matrices |
| --- | ---: |
| Determinant equals the red Roman19 | **594,272** |
| Off-diagonal pair sum equals first red-word product4 | **592,704** |
| Both determinant19 and off-diagonal sum4 (hence root−2) | **27,440** |
| Matrix inverse sends the red prefix to **[6,2,1]** | **730** |
| All three relationships simultaneously | **2** |

The **two** surviving candidate six-entry tuples `(a,b,c,d,e,f)` for `[[19,a,b],[c,5,d],[e,f,17]]` are **[1,14,19,2,13,3]** (the actual p8 red symbols) and **[21,3,23,7,22,5]**. These finite counts are *conditional on the discovered representation and its chosen numeric targets*. They are **not a global accidental-match probability**, since other layouts and candidate targets were examined retrospectively. The second surviving tuple also proves the constraints fail to select a unique key without the actual printed symbols.

[Read-only complete-family Node22 SFT](../sims/lp2_p8_xix_matrix_conditional_fullspace_sft.cjs) re-enumerates the entire source-conditioned 17,210,368 family, with exact integer counts, no Monte Carlo, generated input, fitted English or hypothetical lost bytes. This changes the ranking of the structural lead, not the still-negative ciphertext verdict.

## Complete reversible original-cipher test

Freeze **K**, **K⁻¹**, the exact three-rune **XIX vector [14,10,14]**, the original 243 black runes, and original word order. Evaluate the natural fixed-key Hill equations and six familiar block feedback/IV consumptions on the entire physical p8 black body. Each variant is tested in both literal row-major and column-major/transposed source layout (14 fully specified models):

- `ECB` direct matrix and inverse;
- repeated fixed affine IV;
- two additive GF29 ciphertext-block CBC placements;
- ciphertext feedback `CFB`;
- encrypted-IV output feedback `OFB`;
- plaintext-block feedback.

Every variant reconstructs **all 243 original GP rune values** under its inverse, as required for an implemented bijective cipher. But **no candidate is native-GP prose**. The exact *range* of decoded original 243-rune IoCs is **0.032819780–0.036016733**, with the direct untransposed Hill inverse at **0.035574601** and the original unmodified black tape at **0.034044145**. For comparison, genuine solved p57 GP text has IoC **0.0627100**. A wrong Hill key round-trips just as exactly as the right one; its original decoded text, not replay, determines the cipher result.

One example direct inverse begins

`E Y S EO P L C Y TH J TH G I X E L B F F O S A M F F AE L IA OE N EO L …`.

No model produces sustained intelligible plaintext, a new key stream, or a predicted untouched page.

## A separate fully reversible five-level ternary recipient

The p8 body length `243=3⁵` and **five red terminal p7 words** suggest a different, fully source-sized operator beyond per-three-rune Hill blocks: apply the same original matrix on each axis of a **5-dimensional 3×3×3×3×3 tensor**. There are exactly five recursively nested ternary mixing layers; each 243-symbol transform is bijective because K is invertible. This tests a genuine value-changing whole-page operator rather than a positional shuffle. Its complete original p8 black plaintext results are:

| Matrix and five-layer direction | Complete original 243-rune IoC |
| --- | ---: |
| Row-major `(K⁻¹)^⊗5` | **0.0365949053** |
| Row-major `K^⊗5` | **0.0345202870** |
| Column-major `(Kᵀ)⁻¹` five times | **0.0328537904** |
| Column-major `Kᵀ` five times | **0.0346563276** |

Every full result exactly round-trips under the converse five-layer transform, and none produces native prose. The five-level interpretation additionally assumes the original p7 count of five red words is an instruction about recursion depth, although p8's `3⁵` length alone supplies it; no original 3D grid or tensor notation is printed. Thus all **four** exact whole-body tensor receivers are excluded along with the **14** blockwise/feedback variants above.

## Decision and route forward

This is a potentially author-intuitive **3+9 checksum-key packet** anchored by a human-readable numeral and a complete 243-rune receiver. The exact integer determinant19 and `3⁵` body length make it more constrained than a free hidden matrix hypothesis. The three-rune split is inferred *inside* the original first word, however, and all **18** complete reversible recipients tested on the actual body fail, including a full five-level ternary transform.

Retain this as a **provisional original-source key observation**. Do not promote it to verified decryption or brute-force new matrix phases. A genuinely new first-party operation, transposition, source-specified 3-symbol block clock, or independent full-text receiver would be needed before a successor attack; the current most plausible classical Hill/CBC interpretations are closed. This should be evaluated alongside the historical prime19 clue and p7 quartic rather than counted as an unrelated low-probability miracle.

## Reproduction

[Windows11/Node22/CommonJS read-only SFT](../sims/lp2_p8_xix_3x3_hill_source19_original_sft.cjs) reconstructs the nine actual original red symbols from [the canonical GP29 corpus](../resources/liber-primus/lp2-corpus.json), independently computes the 3×3 determinant and modular cofactor inverse, confirms global uniqueness of the literal XIX rune triplet, verifies the original 243-character black receiver and all **14** blockwise reversible modes plus **four** complete five-level ternary-tensor modes, and prints their exact IoCs and first25 source-native rune outputs. The [historical prime19 origin hypothesis](../workplace/2014-prime19-p8-xix-black-clock-source-path.md) and the [earlier p7 butterfly](lp2-p7-red-polynomial-seven-cycle-original-gate.md) are the closest independent cues; neither supplies the missing encryption opcode.
