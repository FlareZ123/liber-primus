# P15 17 printed singleton words exclude every invertible affine secret sixteen-tap block and feedback cipher

**13 November 2026, Agent14. Exact original-input finite exclusion of two entire 17-parameter cipher families, with explicit full-space enumeration and exact native-GP positive plants.** The intact physical LP2 p16–22 manuscript gives **17 complete one-rune printed words** and **69 two-rune printed words** in 1,744 original GP29 runes. For each of two independent stationary linear mixing architectures, every invertible model with **sixteen completely unknown GF29 mixing coefficients and one completely unknown affine constant** is excluded from recovering ordinary GP-native English under the permissive dictionary described below. No source-authenticated decoder, unknown plaintext, secret key or destination is recovered.

This extends the previously documented all-secret **pure linear** stationary block-cyclic Hill16 and causal FIR16 exclusions ([cyclic study](lp2-p15-circulant16-source-inverse.md), [causal study](lp2-p15-causal-fir16-allsecret-word-inversion.md)). The affine constant is a new independent secret parameter, and the complete direct test spans **3¹⁷=129,140,163** unique singleton assignments in each family, or **258,280,326** assignments across the two distinct families. The two survivors of each model are intentionally preserved rather than hidden: both are noninvertible constant-output decoders.

## Human-visible selector and frozen hypothesis

The original p15 4×4 Fibonacci-prime numerical square immediately precedes physical p16–22. This block of original ciphertext totals **1,744=109×16** runes (page counts [267,273,260,271,269,273,131]); its source word boundaries give exactly **400 complete words**. The exact chapter-local original GP rune offsets of the 17 complete one-rune words are:

    21,119,244,380,386,414,455,471,596,712,871,937,
    989,1032,1491,1557,1574

The 17×17 matrices of original observed coefficients described below, with a final constant-1 column, both have exact GF29 rank **17**. Thus no free secret vector remains once the 17 native-GP single-word plaintext symbols are assigned. Source evidence supports the sixteen-cell selection and the actual word offsets. **The original manuscript does not explicitly prescribe Hill encryption, a causal filter, a constant shift, the phase, or ordinary-English plaintext**; those remain candidate mechanisms tested at an exact, defined scope.

Test two complete, distinct 17-parameter inverse architectures, over ordinary source-ordered GF29 GP index values C and P. All i and j indices below are 0-based.

**Cyclic block family:** For each original p16-start nonoverlapping 16-rune block, output

    P[16b+i] = a + SUM(j=0..15) h[j] C[16b + ((i+j) mod16)] mod29.

Here h[0..15] is an entirely secret inverse circulant sixteen-coefficient vector and a is another wholly secret additive constant. A nonzero circulant matrix determinant is required for a legitimate encrypting block-Hill cipher. The test gives the secret any possible value before judging invertibility.

**Causal feedback family:** Treat the first fifteen original p16 runes as an explicit public IV. For each following rune, output

    P[t] = a + SUM(j=0..15) h[j] C[t-j] mod29, t >= 15.

This is a stationary affine order15 observed-ciphertext FIR inverse. If h[0] is nonzero, the model has a unique causal encryption inverse, with continuous ciphertext feedback, for any secret h[1..15] and any a. The original last 1,729 symbols are tested. Again even noninvertible h[0]=0 models are granted during enumeration.

**No key was chosen from the p15 numbers, matched to English statistics, or inferred from an anticipated word.** Both entire unknown-parameter families are searched. This is more permissive than testing a historical 16-number source-derived key or a few algebraic directions.

## Exact all-secret inference using printed word lengths

Let the complete native GP-English one-rune word vocabulary be **A=24, I=10, O=3**. These three runes are source-calibrated and include the archaic poetic O. Every one of the 17 original singleton positions must output one of them if the proposed cipher truly recovers such English with unchanged word boundaries. Because the 17 original observation matrices are full rank over GF29, the **entire secret 17-vector (h,a)** is *uniquely determined* by each 17-rune assignment. The set of all possible native single-word assignments contains exactly **3¹⁷=129,140,163 elements**, exhaustively evaluated by a ternary Gray walk with exact modular linear updates.

Each candidate is subjected to the original chapter's **69 two-rune printed word positions**, in unchanged source order. The permissive lexical filter uses the *entire* pinned positive-frequency TextBlob English word list, encoded with the repository's established native GP spelling normalization. It admits **189 distinct two-rune GP29 words**, including extremely rare forms, specialized letter pairs, archaic forms and the GP spellings of THE, OF, TO, IN, HE, IT and IS. The same fixed 189-type lexicon is applied to the complete original ciphertext and to the source-native positive controls. The result does not depend on a language-model score, learned key, phase search or a selected target phrase.

| Genuine original word constraint | Secret **cyclic** affine kernels | Secret **causal** affine filters |
|---|---:|---:|
| All seventeen singleton words in A/I/O | 129,140,163 | 129,140,163 |
| First two original two-rune words allowed | 6,522,711 | 6,524,175 |
| First six original two-rune words allowed | 16,823 | 16,708 |
| First eight | 839 | 883 |
| First nine | 173 | 217 |
| First ten | 44 | 46 |
| First eleven | 13 | 11 |
| First twelve | 4 | 5 |
| First thirteen | **2** | **2** |
| All original 69 two-rune words | **2** | **2** |

The two globally surviving affine 17-vectors, **identical for both cipher families**, are:

    h[0..15] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];  a=10 (I)
    h[0..15] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];  a=3  (O)

These are **universal constant-output maps**, independent of C. They generate strings of repeated I or O, which the deliberately overpermissive two-rune lexicon happens to allow as Roman numeral II and OO. Their GF29 linear maps are **singular**, and the causal filters have h[0]=0. Neither can encrypt or decrypt any original ciphertext unambiguously. Consequently **the number of legitimate invertible native-GP English affine decoders in either 17-parameter family is exactly zero** under this frozen original source and lexicon.

These explicit trivial survivors matter: reporting just an unqualified "zero" without checking invertibility would overstate the lexical gate. They also show how source-native word-length constraints alone do not establish English when the decoder may ignore all ciphertext.

## Independent source-native positive plants

Construct a 1,744-symbol native GP English register from genuine dictionary words while preserving the **exact length of every one of the 400 original p16–22 words**. The 17 singletons are real A/I/O; all 69 native two-rune words belong to the same 189-type lexicon.

Use the **actual p15 printed sixteen-number row-major values** reduced modulo29 as a nondegenerate source-known affine example kernel, with a deliberately nonzero test-only constant **a=7**. For the cyclic model, encrypt each sixteen-symbol block using the inverse circulant of the corresponding affine decryptor, restoring P−a before encryption. For the causal model, use the same sixteen printed numbers as the inverse FIR taps and recursively solve each ciphertext symbol with the preceding fifteen public-IV symbols.

A totally independent all-secret recovery reconstructs the sixteen hidden mixing coefficients and the nonzero constant from the planted 17 source-word singletons, recovering:

- Cyclic affine plant: **1,744/1,744 exact GP runes** and every two-rune word.
- Causal affine plant: **1,729/1,729 exact post-IV GP runes** and every two-rune word.
- Both recovered affine constants: exactly **a=7**.
- Original exact exhaustive test: **129,140,163** unique 17-word assignments per family, with precisely the two specified noninvertible survivor vectors.

This is a decisive power control: a valid hypothetical cipher with the same authentic original word lengths, actual p15 coefficient values and a secret nonzero affine offset can be recovered by the declared test, while the original book cannot.

## Research consequence

Retire every **phase-zero, stationary, sixteen-tap *invertible affine* GF29 block-cyclic or causal-feedback decoding** on the original 1,744-rune chapter, conditional on preserving original words and the native GP-English singleton/doubleword lexicon. This closes the additional offset degree of freedom left by earlier sixteen-tap pure-linear attacks. It is substantially more informative than guessing a finite list of p15 keys or testing their inverse coincidence.

The result does **not** exclude a noncirculant 16×16 Hill cipher with 256 secret coefficients, an evolving 16-tap kernel, a different block origin, hidden state outside the observed ciphertext, word-boundary changes, non-GP intermediate material, non-English text, or an additional encipherment stage. None of those remaining mechanisms is supported solely by this exclusion; a human-visible clue specifying its state, key source or decoding input is needed.

**Source-exact Windows Node22 CommonJS test:** [sims/lp2_p15_affine17_allsecret_original_word_gate_sft.cjs](../sims/lp2_p15_affine17_allsecret_original_word_gate_sft.cjs).

**Successful original-input, 258-million-assignment Windows CI:** [Actions run 43529309345](https://github.com/FlareZ123/liber-primus/actions/runs/43529309345), which also runs the prior pure-linear source inverse and all-secret tests as separate positive-controlled steps.
