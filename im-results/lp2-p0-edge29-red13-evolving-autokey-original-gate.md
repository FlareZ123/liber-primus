# Original p0–2 edge-alphabet × red13 evolving-autokey receiver

**Agent7, 23 November 2026. Classification: original-input, source-operand-fixed negative for two distinct lag13 evolving Vigenère inverses; no authenticated unknown plaintext, historical key, cipher, or destination.** Reproducer: [read-only CommonJS SFT](../sims/lp2_p0_edge29_red13_plaincipher_autokey_original_sft.cjs). This is independent follow-up to [#2394 first-appearance 29-symbol source operand](lp2-opening-line-edge-complete-alphabet.md) and distinct from the periodic custom-tabula receiver assigned in [#2401](https://github.com/FlareZ123/liber-primus/issues/2401). It does not claim or close #2401.

## Source-side, deliberately frozen operands

Original JPEGs 17–19.jpg contain 33 black rune lines across physical LP2 p0–2. Their first/last rune positions form a 66-rune source shell; the first 46 shell positions already introduce all 29 GP symbols. Extract their unique first-appearance order in the exact printed order (GP canonical indices):

\`\`\`text
A = [2,22,3,27,13,0,15,10,25,9,18,6,17,11,21,28,12,16,7,24,8,19,20,1,4,23,5,26,14]
\`\`\`

The **separate** p0 red title has 13 original runes with the independent, source-locked indices:

\`\`\`text
K0 = [15,8,18,3,6,19,27,0,15,26,18,21,5]
\`\`\`

Remove the 13 red heading runes and extract exactly the two outside runes of every remaining black line, yielding **650 untouched interiors**. The first **225** are p0; the subsequent **425** are original p1–2, untouched by key selection. The 66 exterior runes and all 13 title runes are excluded from the decipherment target. The program verifies full source-preserving reconstruction of all 33 lines, including their widths, and asserts the transcription matches the 262/266/201 original page-index arrays.

## Two finite historical operation proposals

The author-era primitive is subtractive GP Vigenère under a specified alphabet. Previous [#2401](https://github.com/FlareZ123/liber-primus/issues/2401) tests this exact unusual source alphabet with **periodically repeated** red13. Here the two distinct, genuinely evolving variants are tested with the same two independent source operands and no input-fitting:

Let \`rank_A\` invert permutation \`A\`, and let \`C_i\` be the unchanged original 650-rune interior in reading order. Under either variant:

\[
P_i=A[(\operatorname{rank}_A(C_i)-\operatorname{rank}_A(K_i)) \bmod 29].
\]

The first 13 key symbols are the actual red heading, \`K_i=K0_i\`. At later positions the **plaintext autokey** rule uses \`K_i=P_{i-13}\`; the **ciphertext autokey** rule uses \`K_i=C_{i-13}\`. Each key clock starts once at the first black interior rune and runs continuously through p0, p1 and p2. F is ordinary at every position, with no invented special skip. Both orientations were frozen as distinct classic autokey variants; no key phase, offset, page reset, alphabet permutation, language-ranked candidate or word break is tuned.

**Causal limit:** Original images provide the two operands, and the 2014 corpus historically authenticates GP Vigenère, but neither establishes a *custom* tabula recta nor selects either autokey rule. Thus these are conditional inverse tests, rather than evidence of an authored operation. Prior #2305 tested canonical-GP red13/autokey, while the present test changes the entire 29-symbol arithmetic alphabet to the unusually complete opening line-edge order.

## Actual original ciphertext result

| Source-exact tape | Unchanged | Plaintext autokey | Ciphertext autokey |
| --- | ---: | ---: | ---: |
| All 650 interior runes, GP29 IoC | **0.034149579234** | **0.035206827071** | **0.035282683418** |
| First 225 p0 interiors | — | **0.035039682540** | **0.035357142857** |
| Disjoint 425 p1–2 interiors | — | **0.034239733629** | **0.034994450610** |

Plaintext-autokey first 13 decoded GP rune spellings are \`I H Y IA O T C P P H O F N\`; after the key starts changing, the first 60 runes remain nonprose. Ciphertext-autokey begins with the same first13 (the seed is identical), then also remains nonprose. The SFT prints the **complete 650 recovered GP transliterations under each frozen operation**, so this diagnosis can be independently checked without language-model synthesis or cropped excerpts.

Every recovered 650-rune candidate exactly re-encrypts to the original 650 untouched ciphertext runes under the declared formula. To test actual end-to-end inversion separately, the full **95 known-clear original p57 GP runes** are tiled into a synthetic 650-rune plaintext, encrypted with each candidate rule and its source title/alphabet, and then recovered **650/650** each. The two source inverses function correctly, but the original candidate outputs and disjoint p1–2 continuation stay near uniformly distributed. Their IoCs fall well below the original native-GP prose register represented by the source p57 (0.06271) and the external authentic-text controls in related studies. Original plaintext and independent held-out prose are absent.

## Decision

Retire precisely these two **source-first-occurrence-alphabet + red13 + lag13 plain/cipher autokey** decoders for the original p0–2 interiors. A different state-changing alphabet rule or concealed external key is still possible, but needs an independently visible instruction specifying how the source operands are consumed. This negative neither resolves the unusual 46-edge complete-alphabet observation nor changes the established status that **all 56 LP2 unknown pages remain unsolved**. Do not spin new alphabet-key lag, key phase, F-skip or page-reset trials from this result.
