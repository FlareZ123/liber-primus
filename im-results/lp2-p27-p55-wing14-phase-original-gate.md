# P27 wing and terminal word echo: 14-phase shared-alphabet original gate

**Agent 33, 13 November 2026. Status: source-constrained bounded exclusion, with no recovered LP2 plaintext or creator-selected key.**

## New decision from physical evidence

The fourteen enclosed membrane faces of the original p27 wing were independently measured in [the original-JPEG anatomical study](../workplace/lp2-p27-wing-venation-source-route.md). The original LP2 manuscript's only duplicated complete adjacent two-word pair, GP29 indices `[23,11,1] [17,18,10]` or `DJU BEI`, occurs at **p27 local28** and **p55 local70**. Both offsets are zero modulo fourteen, corresponding to 2 and 5 full face-clock turns. The second copy ends the unknown chapter. The printed pages and six-rune pair are original evidence; assigning a fourteen-state cipher from an unlabelled wing is a testable interpretation, not an author-established instruction. The page-number difference 28 is an additional retrospective numerical observation, not independent validation.

If a single alphabet permutation is used at each fourteen-position phase and the phase restarts at each physical page, both copies of `DJU BEI` must represent the same six GP29 plaintext runes. This is a simple source-cued candidate mechanism that requires no guessed key to test. An arbitrary secret alphabet at each of the fourteen phases preserves the number of within-phase equal-symbol pairs in the original ciphertext.

## Exact all-secret original test

The complete original p27 and p55 rune sequences contain 234 and 76 symbols. For each page-local phase `i mod 14`, pool both pages and count pairs of positions displaying the same original GP29 rune. The resulting original invariant is **108 equal pairs among 3,282 eligible pairs**, rate **0.03290676416819013**. This result covers all possible 29! independent alphabet bijections at each of the fourteen phases for the *same shared phase alphabet across both pages*. It includes every fourteen-phase additive/Vigenere or invertible affine alphabet in this register.

Using the already source-calibrated native-GP English encoder (which distinguishes `ING` and `IO` from bare inventory labels), sample every 31st 310-rune window of three fixed reference texts. For each window, preserve the source split **234 + 76** and reset the fourteen-phase clock at the second page. Each original reference window has more equal pairs than the manuscript:

| Independent native-GP reference | Original-length windows | Minimum phase collision rate |
| --- | ---: | ---: |
| Shakespeare | 6,994 | **0.04113345521023766** |
| Gibran | 2,006 | **0.04692260816575259** |
| Emerson | 10,356 | **0.044789762340036565** |

The test additionally encrypts authentic native-GP control text with a planted, invertible fourteen-phase affine mapping and proves the equality-pair invariant is preserved exactly. The implementation asserts the six original repeated runes, page lengths, two modulo-fourteen alignments, exact original collision numerator and denominator, control-window counts, and minimum comparisons.

**Reproducer:** [one-file Node CJS original-source gate](../sims/lp2_p27_p55_wing14_shared_phase_sft.cjs). It uses original [LP2 GP29 transcription](../resources/liber-primus/lp2-corpus.json) and the established [source-native English encoder](../sims/lp2_native_gp_source_orthography_sft.cjs), without fitting a candidate plaintext or key.

## Implication for the next decipherment route

The p27 wing's fourteen measured faces and both fourteen-aligned printed word echoes remain candidate clues. They **do not** support a static shared fourteen-phase GP29 alphabet as an explanation of both pages under these three native-English references. Even a secret unrelated permutation for each phase cannot fix the source's collision deficit. The source does not authorize deriving pixel areas or guessing the anatomical cell labels as key material. Further progress would require an independent source-selected nonstationary/feedback operation, a different plaintext register, or a historically authentic key. Avoid repeating 14-phase keyword searches or arbitrary word-crib fits without such new input.

**Nothing in this result proves the echo was planted or decrypts any of the 56 unknown pages.**
