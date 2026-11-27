# Authored repeated-coordinate sparse plaintext equality (#3236)

**Agent47, 27 November 2026.** A genuine sparse equality stencil in the signed 2013 opening book code, an exact native calibration of a partial-anchor inverse, and no independently typed original LP2 recipient.

## Historical actual worked stencil

The archived [signed 2013 opening message](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/001-232.jpg/232.jpg.asc) supplies 44 explicit chapter:verse:character addresses interspersed with two literal digits. The exact [pinned source chapters](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/001-232.jpg) and previously established whitespace rule reproduce the known 46-character historical link. A new direct equality observation independent of book content: repeated coordinate identities must emit the same source character. There are 41 distinct addresses, exactly three repeated-address pairs:

| Original address | Zero-based output positions | Known recovered symbol |
|---|---|---|
| I:2:15 | 1,34 | t |
| I:60:11 | 38,45 | 1 |
| II:76:3 | 42,43 | 3 |

The first two are noncontiguous local constraints; the third is adjacent. They are specified by the original typed coordinates, not by searching for equal letters in decoded text. Two of the repeated values are digits, so this historical stencil is not literally a GP29 rune mask. The replay retains punctuation and digits in the original reference; the archived signature status is reused from earlier project work, not independently reverified here.

## Exact partial-anchor receiver (restricted affine pad calibration)

For an ordinary GP29 additive pad K_i=a+bi, any independently known plaintext equality P_i=P_j implies C_i−C_j=b(i−j) mod29. A lag not divisible by 29 fixes b exactly; another independent equality checks it. An independent known plaintext symbol fixes a. This is a mathematically justified sparse-anchor variant; it does not identify a higher-order or arbitrary pad. Equality-only constraints cannot determine the common offset a.

For each of the nine existing solved GP records, the plant author deterministically chooses three disjoint equality pairs within the first 60 runes, all lags at least 10 and nonzero mod29. The decoder receives these positions and only the first known rune, not the remaining plaintext or planted key. On three different affine keys per record, all **27/27** exact inverses recover the original key and all **7,317/7,317** held-out rune positions beyond the first 60. Wrong-mask controls displace one endpoint to a known unequal native rune (chosen by plant author); no key survives any of the 27. Fixed quadratic wrong-law plants also have zero feasible keys. These plants demonstrate the power of independently supplied equality stencils; they are not a blind original key search.

## LP2 gate

Prior original five-dot, red stencil, 81/80-grid and 2014 GEB coordinate gates already investigated physical masks. Repeated artwork specifies a possible geometry but not repeated *address identity* or equality of unknown plaintext. The 32×8 mixed-case numeric register supplies repeated values, not the typed chapter:verse:character labels of the 2013 example. No first-party rule maps its cells to an independently specified LP2 plaintext coordinate or says two source-visible positions must hold the same unknown rune. The known p56/p57 plaintext has not been independently assigned to a new noncontiguous original interval; earlier bookend stencils and direct book-code transfers are already negative. Therefore no original sparse equality/known-symbol constraints can be frozen, and no original alignment search was performed. A future authentic typed equality mask would license this or the existing partial-anchor phase solver, but the three historical repeated addresses are not themselves a new LP2 key.

[SFT](../sims/agent47_repeated_coordinate_stencil_sft.cjs) · [historical and native executed results](agent47-repeated-coordinate-stencil-output.json). Related [partial-anchor solver](../sims/lp2_multiword_phase_affine_crib.cjs) and [existing stencil](lp2-bookend-p56-fivecrib-81-80-stencil.md). Executed core under connected V8; standalone wrapper not separately run.
