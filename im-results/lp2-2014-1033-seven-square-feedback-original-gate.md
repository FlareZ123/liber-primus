# Historical 1033 seven-square: direct full-chapter feedback decryptions

**Agent11, 22 November 2026. Original-source reversible negative.** None of the tested four block-feedback models recovers unknown LP2 plaintext, an authenticated new key, or a continuation. This is a bounded test of complete decoder candidates with a specific genuine source matrix, rather than a key or phase sweep.

## Typed clue and possible cipher path

The original Cicada 2014 Stage10 OpenPuff output contains a 7×7 square whose seven rows each sum to 1033. Its reduction modulo the author's genuine **29-sign** runic alphabet is an invertible 7×7 matrix M. Complete LP2 physical sections **p8–14 (1,729 runes)**, **p33–39 (1,680 runes)** and **p54–55 (308 runes)** each partition exactly into 7-rune blocks. Those locations are original page/chapter boundaries and the p33–39 section also visibly contains the 1033 and 3301 numerals.

A standard recognition path would be a Hill cipher *with* block chaining, which can eliminate the strong language-like single-symbol statistics left by ordinary Hill on raw text. The existing [historical-matrix tests](lp1-p16-order56-pagepower-gate.md) cover direct Hill, block-/page-indexed powers and additive matrix-orbit pads, but these **four original-cipher feedback operations** are distinct. No original instruction explicitly names these feedback rules, so their legitimacy rests on the 2014 source matrix and an otherwise conventional cipher vocabulary.

## Four frozen reversible equations

For each seven-rune block index j, let C_j be the unchanged original ciphertext vector, P_j the proposed plaintext vector, C_{-1}=0, P_{-1}=0. All operations are over GF(29); M is the exact original seven-square and M^{-1} its exact modular inverse.

| Name | Original-source inverse P_j | Exact forward encoder C_j |
| --- | --- | --- |
| CBC, inner feedback | M^{-1}C_j − C_{j-1} | M(P_j + C_{j-1}) |
| CBC, outer feedback | M^{-1}(C_j − C_{j-1}) | MP_j + C_{j-1} |
| Ciphertext feedback | C_j − MC_{j-1} | P_j + MC_{j-1} |
| Plaintext feedback | M^{-1}(C_j − P_{j-1}) | MP_j + P_{j-1} |

All four keep the printed 29-rune alphabet and the original vector order, use the standard zero IV, and do **not** add a fitted offset, unknown secret, word-dependent resynchronization, plaintext crib or per-page tuning. Each section is evaluated as one whole tape.

## Exact original outputs

GP29 symbol index of coincidence after the complete cipher inverse:

| Full original section | Runes | CBC inner | CBC outer | Cipher-feedback | Plain-feedback |
| --- | ---: | ---: | ---: | ---: | ---: |
| p8–14 tree chapter | 1,729 | 0.03428443 | 0.03453211 | 0.03452609 | 0.03461244 |
| p33–39 numbered chapter | 1,680 | 0.03466633 | 0.03430401 | 0.03477268 | 0.03435364 |
| p54–55 terminal two-page group | 308 | 0.03489995 | 0.03464614 | 0.03458268 | 0.03358856 |

The **maximum over all 12 full-source decryptions is 0.03489995**. At that candidate p54–55 output the first 14 proposed GP29 symbols are P G R S R C S L AE O S TH EO EO; no coherent native-GP English span emerges. For comparison the authentic *unenciphered* solved p57 PARABLE has **GP29 IoC 0.06031746** on its first 91 runes.

The [single-file Windows Node22 CommonJS reproducer](../sims/lp2_2014_sevensquare_feedback_original_sft.cjs) reads the original source square and corpus, asserts the original 7-block alignment and each exact numerical outcome, computes the matrix inverse, and restores all **1,729 / 1,680 / 308** original runes under every wrong candidate by exact forward replay. More importantly, it *genuinely encrypts* 91 native, source-authentic GP29 p57 runes with each of the four operations and recovers all **91/91** from each planted ciphertext. Re-encoding by itself would not establish the historical operation.

## Cryptanalytic decision

The matrix is independently supplied by Cicada and these are executable, lossless transformations that would recover actual original plaintext if the corresponding model were right. Their **complete original outputs remain indistinguishable from near-uniform GP29 at the unigram level**, so none establishes a solution or a key. Retire only the **four literal seven-square feedback laws with source order and zero IV on the three original whole chapters**. The source does not select any alternate mode, IV or cipher order; introducing one merely because the outputs are random-like would be an unconstrained rescue.

This fills a narrowly distinct blind spot in the existing direct 2014-matrix work. The remaining challenge is to find an independent creator-visible instruction that selects a value-changing operation, side information or external key and that succeeds on untouched original prose.
