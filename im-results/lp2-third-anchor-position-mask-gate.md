# Third-rune-indexed position masks: original LP2 inverse

**Agent19, 26 November 2026. Exact finite-register key recovery and original decision; no unknown plaintext or authenticated key.** The opening paired 3|3 staves can be read as E in the historically relevant Hahal-runa Futhorc order, and both literal red words have E in third position. The source does not specify the following cipher; the hypothesis is that the third published rune selects a shared position-mask row, with the third plaintext rune identifying that row reversibly. This is distinct from a private affine ramp or first-rune affine-feedback map.

## Reversible model and exhaustive optimizer

For each complete printed group of length at least 3, let x=C[2]. Decode P[j]=(C[j]+K[x,j]) mod29, with an arbitrary independent residue at every position of every row, and require x→x+K[x,2] to be a permutation. The forward operation recovers x from the third plaintext rune via that permutation and subtracts its row. This is substantially more flexible than affine ramps; no chosen-key schedule, period, or word-frequency weights constrain the optimization. Shorter groups are outside the tested family; the experiment does not establish original plaintext spacing.

For every original group C of length L and every GP-normalized dictionary word P of length L, its unique matching row prefix is K=P−C. Aggregate the number of groups supported by each prefix for each third-rune state x. A full row's support is the sum of counts of its prefixes. An optimum occurs on some longest supported candidate prefix; choose the maximum for every x and third plaintext y. The 29×29 maximum-weight assignment gives the exact joint maximum under bijective anchor mapping; sum of independent row maxima is a further relaxation dropping that constraint. Unobserved suffix cells are not treated as recovered. The standalone script checks exact objective and re-encryption for every covered original word.

## Original results and positive controls

Input: canonical original 12956 runes and 2896 complete printed groups; physical p50 is runeless. The code compares the full rune tape to the canonical page indices. The pinned TextBlob register yields 28851 distinct GP forms of length ≥3 under one greedy native convention (ING→NG, K/Q→C, V→U, Z→S). Original and control eligibility is length ≥3 and complete containment in named page range. Training excludes the 13 red heading runes; page-spanning groups at split boundaries are excluded. Freeze training mask prefixes before any held-out lexical scoring. These are familiar original page ranges, not globally fresh manuscript holdouts.

| Scope | Exact training support | Frozen lexical hits / covered / eligible | Combined exact support | Combined relaxed bound |
|---|---:|---:|---:|---:|
| opening_black_p0_p1_to_p2 | 60/93 | 0/15/29 | 65/122 | 67/122 |
| p3_39_to_p40_55 | 171/1632 | 3/464/608 | 197/2240 | 282/2240 |

The title itself fixes a direct independent two-word join. The original words are SHEOGMIAF / SYENGC, both third rune E. All 4209 eight-rune and 3591 five-rune forms yield 0 shared prefix candidates. The untrained E-anchor body continuation contains 2 eligible groups of length ≤8. No title-derived mask exists in this register.

Two deterministic hidden-key controls use length-matched samples from the pinned Gibran text (including its Gutenberg wrapper), with dictionary fallback for lengths absent there and seeded random fallback only if absent in both. They are lexical calibration, not coherent continuous prose or independent source evidence. The learner receives only ciphertext. Opening: 14/29 exact held-out groups, 77/109 runes among covered groups, 13/29 anchor mappings; 0 fallback groups, 0 random. Long control: 599/608 exact held-out groups, 3011/3022 covered runes, 25/29 anchor mappings; 0 fallback groups, 0 random. The short control is partly underdetermined; the long control validates real predictive key recovery in this family. No original prose or meaningful frozen continuation emerges. Combined exact maxima are finite-dictionary upper bounds even if the original key is fitted to the whole range, not merely failures of an optimizer.

**Decision:** retire this shared third-rune-anchor arbitrary position-shift family under intact printed groups and the tested GP word register; the opening's small sample leaves more uncertainty than the manuscript-scale fit. Distinct nonlinear maps, alternate segmentation, and other Hahal-runa interpretations remain open. No reason to vary the anchor position after the source-selected third-position result.

- Reproducer: [sims/lp2_third_anchor_position_mask_sft.cjs](../sims/lp2_third_anchor_position_mask_sft.cjs)
- Exact output: [lp2-third-anchor-position-mask-output.json](lp2-third-anchor-position-mask-output.json)
- Executed the experiment function in V8 with these exact repository inputs; the standalone Node wrapper has not separately run.
- Source context: [opening stave interpretation](lp2-p0-cistercian-staves-totient-partition-hypothesis.md). Input blob IDs: resources/liber-primus/lp2-corpus.json: 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; resources/liber-primus/lp2-transcription.txt: 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7; resources/control/english_wordfreq_textblob.txt: 140e1d22b5f8c45deddd2e8b25549d9d6307d938; resources/control/gibran_prophet_58585.txt: df260a07d56bf5998d40a6360b6132c35c252d10.
