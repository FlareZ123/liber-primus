# Historical Stage10 seven- and five-square feedback: complete original-source inversion and all-secret IV exclusion

**Agent11, 22 November 2026. Original-source reversible negative, extended by a mathematically complete unknown-IV decision.** Four explicit feedback modes with the historical 1033 seven-square were tested on three complete original GP29 sections. Independently, the plaintext-feedback mode was tested against **every possible secret initial-state vector** for both historical five-squares and the seven-square, with no fitted key or plaintext crib. No original unknown LP2 plaintext or authenticated new key was recovered.

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

## Stronger all-secret initial-state decision: every IV, without key search

The first twelve direct tests assumed a zero initialization vector. A reasonable counter-hypothesis is that Cicada supplied a secret, nonzero initial vector that changes *all* blocks via plaintext feedback. The exact **linear response to an arbitrary initial vector** allows a much stronger decision. For plaintext feedback `P_j = M⁻¹(C_j − P_{j−1})`, write each source rune `P_t(IV) = P_t(0) + a_t·IV (mod 29)`. For any intact one-rune English word, the decoded symbol must be one of authentic GP29 **A=24, I=10, O=3**. The original word separators and genuine physical chapter boundaries fix the coordinates `t`; none are selected from a candidate plaintext.

Choose `n` linearly independent original singleton response rows `a_t`, where the historical matrix dimension is `n=5` or `7`. Every eligible secret IV is uniquely determined by an assignment of these `n` singleton words to A/I/O. **Enumerating all 3ⁿ assignments therefore covers every one of the 29ⁿ possible secret IVs**, regardless of key entropy. The remaining original singleton words supply untouched equality constraints. Crucially, this is an exhaustive algebraic decision for the fixed cipher and word-preserving native-English register, not a Vigenère key guess or probabilistic language-score optimization.

| Authentic source matrix | Whole original LP2 section | Printed one-rune words | Independent singleton equations | Complete 3ⁿ assignments | IVs passing all singleton constraints |
| --- | --- | ---: | ---: | ---: | ---: |
| 3301 5×5 | p3–7, 1,145 runes | 8 | 5 | 243 | **0** |
| 3301 5×5 | p33–39, 1,680 runes | 9 | 5 | 243 | **0** |
| 1033 5×5 | p3–7, 1,145 runes | 8 | 5 | 243 | **0** |
| 1033 5×5 | p33–39, 1,680 runes | 9 | 5 | 243 | **0** |
| 1033 7×7 | p8–14, 1,729 runes | 11 | 7 | 2,187 | **0** |
| 1033 7×7 | p33–39, 1,680 runes | 9 | 7 | 2,187 | **16** |

On p33–39, all **16** surviving seven-dimensional initial vectors produce complete outputs with GP29 unigram IoC **0.0341749624–0.0351009671**; native clear p57 first91 has **0.0603174603**. These 16 mathematically possible initial vectors still recover no readable original instructions. We refrain from selecting one via arbitrary rescoring. The original p54–55 has only two printed one-rune words, rank2, so the seven-dimensional secret IV is underdetermined by this singleton-only necessary condition. An independent, stricter **finite source-word vocabulary** condition on its first two eight-rune printed words is evaluated below.

### Terminal p54–55: complete two-word test despite only two one-rune words

The terminal **308** original runes do not have seven independent singleton constraints. Their intact printed first three words, however, have a useful original layout:

    p54 local positions: [0] | [1..8] | [9..16]
    printed GP word lengths: 1 | 8 | 8

A plaintext-feedback key with arbitrary unknown seven-rune IV has an exact one-to-one relation with the *first seven plaintext runes*: \`IV = C[0..6] − M P[0..6]\`. Therefore, allowing initial plaintext word A/I/O at position0 and the first six runes of **any predetermined 8-rune source-native word** at positions1–6 enumerates **every possible secret IV** compatible with that native-English start, even if 29⁷ arbitrary keys were possible. No IV can be missed under that vocabulary contract.

An independently pinned finite vocabulary of **4,792 distinct eight-rune GP-native words** was generated from four already archived controls, Shakespeare, Gibran, Emerson and the English frequency text; the source-calibrated spelling maps ING and IO to their authenticated single GP rune forms. All **3×4,792 = 14,376** complete-first-block hypotheses were evaluated. The remaining two runes at original positions7–8, an untouched prediction under the cipher's second block, reduce these to exactly **20** legal first eight-rune words. For all 20, the immediately adjacent untouched original positions9–16 fail to form *any* of the same 4,792 eight-rune words: **0 exact two-word pairs**.

This is a genuine **finite-vocabulary and preserved-word-boundaries exclusion**, substantially weaker than a proof about the set of all possible English words. It is not an unconditional all-IV exclusion of p54–55. Unlisted proper names, unusual constructions, deliberate plaintext gibberish, shifted boundaries or different plaintext encoding can evade it; the source does not authenticate this dictionary as a keyspace. It does prevent selecting an arbitrary high-entropy seven-rune IV from this source-word vocabulary merely to make the first visible word look English.

The [standalone, original-source native-vocabulary SFT](../sims/lp2_2014_p54p55_fulliv_eightword_sft.cjs) fixes original first-word geometry, both word checks, the exact vocabulary and the authentic seven-square. It encrypts a full **308-rune** native GP29 plant with a secret nonzero seven-rune IV and demonstrates that both genuine eight-rune words and the exact secret IV are found by the same procedure. [Windows Node22 Actions run 45074555757](https://github.com/FlareZ123/liber-primus/actions/runs/45074555757) passed with 20 first-word receivers, 0 double-word receivers, and the successful native plant.

For the other three feedback forms, **every nonzero secret IV affects only their initial block**: the recurrence thereafter consumes already-printed ciphertext rather than prior plaintext. Multiple originally printed singleton words farther into each full chapter decode outside A/I/O. For example, with the authentic 1033 seven-square and complete p33–39, all secret IVs produce **TH** at singleton offset138 under inner CBC, **L** at offset367 under outer CBC, and **OE** at offset138 under ciphertext feedback. None can be a one-rune native-English word. This exact source-witness contradiction also applies to each complete p3–7 five-square and p8–14 seven-square test; it is independent of the IV, its length or method of generating it.

**Native positive control:** For each complete tested chapter, the SFT constructs a native GP29 plaintext of that exact original source length, puts A/I/O at every original one-rune site, encrypts it with a **nonzero, unknown-to-the-solver initial vector** derived from the genuine source matrix, then algebraically recovers that very initial vector among the enumerated candidates and recovers every planted plaintext rune. This demonstrates that the exclusion would not reject a correctly constructed message in the proposed family. The [full original-source CommonJS SFT](../sims/lp2_2014_squares_plainfeedback_alliv_sft.cjs) and [passing Windows Node22 run 45074120020](https://github.com/FlareZ123/liber-primus/actions/runs/45074120020) reproduce every source singleton, matrix, full-rank certificate, candidate count and IV-independent witness. The original direct twelve-model SFT also [passed on Windows in run 45074115790](https://github.com/FlareZ123/liber-primus/actions/runs/45074115790).

**Scope:** Both exclusions assume the original printed separators really mark one-symbol plaintext words in English spelled in the source-native GP29 register. They do **not** exclude changed word segmentation, non-English text, a binary intermediary, pre/post Hill transformations, a secret matrix rather than the genuinely historical matrix, or any ciphertext mode requiring external side information. They do eliminate *any arbitrary initial-vector rescue* for these fixed full-source intact-word native-English block-chaining models. No plaintext recovered.

## Cryptanalytic decision

The matrices are independently supplied by Cicada and these are executable, lossless transformations that would recover original plaintext if the corresponding model were right. Their **complete original outputs remain indistinguishable from near-uniform GP29 at the unigram level**, so none establishes a solution or a key. Retire **all IVs** of the four literal seven-square feedback laws with unchanged source order on whole original p8–14 and, under intact-word native-English hypothesis, p33–39; for the two five-squares likewise retire these feedback laws on whole p3–7 and p33–39. For p54–55, retire only the tested zero-IV decoders because too few singleton constraints exist. The source does not select any alternate mode, IV or cipher order; introducing one merely because the outputs are random-like would be an unconstrained rescue.

This fills a narrowly distinct blind spot in the existing direct 2014-matrix work. The remaining challenge is to find an independent creator-visible instruction that selects a value-changing operation, side information or external key and that succeeds on untouched original prose.
