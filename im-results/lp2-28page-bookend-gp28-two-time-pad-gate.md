# LP2 repeated-bookend GP28 two-time-pad: original-source decision

**Decision.** The duplicated six-rune \`DJU BEI\` string permits a precisely defined, creator-plausible *alignment hypothesis* between the book's two 28-page halves. That alignment does **not** display the expected plaintext-difference signal if both passages are successor-rank-encoded under the **same additive GP28 keystream**, with native GP English beneath. The 28 physical page pairs give a second negative under a separate natural clock. No unknown plaintext, authentic key, or verified rule was recovered.

## Source-selected alignment and conditional encoder

The original \`resources/liber-primus/lp2-corpus.json\` has 12,956 unknown GP29 ciphertext runes across p0–p55. The physical first 28 pages contain 6,761 runes; the second 28 contain 6,195. The exact same six-rune phrase occurs at global zero-based offsets **6,555** and **12,950**, and nowhere else. Align the latter six rune positions with the former, using the source-derived first-half start offset \`6,555 − (6,195 − 6) = 366\`. This gives 6,195 aligned runes before testing any decryption.

For a current GP29 rune \`C[i]\` and its predecessor \`C[i−1]\`, extract \`R[i] = (C[i] − C[i−1] − 1) mod 29\` when the difference is nonzero, giving values \`0…27\`. A zero difference is an **exception** and has no GP28 rank. Source-based hypothesis, **unproven**: for all eligible positions, \`R_A[i] = (P_A[i] + K[i]) mod 28\` and \`R_B[i] = (P_B[i] + K[i]) mod 28\` with *exactly equal* \`K[i]\` under this bookend alignment. Then the observable key-cancelled differences \`D[i] = (R_A[i] − R_B[i]) mod 28\` necessarily equal \`(P_A[i] − P_B[i]) mod 28\`. The six matching ciphertext symbols that selected the alignment are excluded from the score.

This is a **different conditional family** from the earlier direct-GP29-additive and multiplicative-step-ratio bookend screens in \`sims/2016_28page_bookend_ratio_inverse.cjs\`. It explicitly treats the 29-symbol printed alphabet as predecessor-excluding 28-state rank emissions.

## Original result and calibrated controls

A 28-bin difference likelihood is source-fixed from 145,000 Shakespeare GP28 plaintext symbols, using true native GP digraph tokenization, and evaluated against independent uniform differences. The independent positive control encrypts length-matched English spans from Gibran and heldout Shakespeare under a common nonperiodic 28-way pad, preserving the original two ciphertext streams' sparse zero-step exception-site masks. This ensures that the test accepts the declared model when it actually holds.

| Frozen comparison | Eligible original positions | Exact equal-step differences | Difference language log-likelihood ratio |
|:--|--:|--:|--:|
| Original source bookend alignment | 6,108 | 235 (3.8474%) | −109.0454 |
| Planted native-English shared-pad encoder | 6,108 | 367 (6.0085%) | +104.2548 |
| Source 2016 image dimension mean 566: first-half suffix versus complete second half | 6,111 | 232 (3.7964%) | −126.8946 |
| Page p0 with p28, p1 with p29, …; 27 rune-bearing pairs | 5,562 | 172 (3.0924%) | −116.3221 |

The independent 2016 signed image dimensions **563×569** average to **566**, exactly the first-half-minus-second-half rune count. This supplies a second, externally visible, full-length alignment: remove precisely the first 566 runes of p0–27 and compare its complete 6,195-rune suffix to p28–55. It too lacks the GP28 shared-pad signal (6,111 eligible, 232 equal, LLR −126.895); its independent native-English common-key plant scores positively. Unlike the six-rune echo alignment, no echo glyphs are dropped from this complete suffix alignment. Numeric equality alone does not authenticate the 2016 dimensions as a decryption instruction.

The fixed GP28 native English training model predicts 6.1548% equal positions in differences of *independent* plaintext streams, and 3.5714% under independent uniform GP28 symbols. At the source-selected bookend alignment the observed 3.8474% is much closer to the latter. Across **all 6,194 circular shifts** of the original second rank stream, the bookend score is unexceptional (29.27% at or above the observed value, conditional phase-rank comparison). Across **10,000 seeded permutations** of the 27 second-half physical pages, 1.68% give an equal-step rate at or below the true 28-page pairing, in the *opposite* direction from expected same-key English. This is a conditional diagnostic, not an unconditional p-value for the source-selected relationship.

**Bounded rejection.** A continuous identical GP28 additive keystream under the literal six-rune bookend alignment, or under the 566-rune source-dimension suffix alignment, or under same-local-offset p0↔p28 … page pairs, does not generate ordinary GP28 English plaintext differences with the same statistics as the source-native planted controls. These observations do not exclude changed key phase, distinct keys, a nonlinear keyed alphabet, a secret state beyond the displayed predecessor, different word boundaries, or independently transformed plaintext. The bookend phrase itself remains authentic and potentially relevant.

## Reproduce

- [Self-contained read-only Windows Node.js 22 SFT](../sims/lp2_bookend_gp28_twotimepad_original_sft.cjs), consuming checked-in LP2, Shakespeare and Gibran files with fixed seeds.
- [Successful Windows GitHub Actions executions](https://github.com/FlareZ123/liber-primus/actions/runs/44202168611) ([initial source-echo test](https://github.com/FlareZ123/liber-primus/actions/runs/44199538415)).
- Earlier source arithmetic and different GP29 additive / multiplicative hypothesis: [2016 original 28-page bookend gate](../sims/2016_28page_bookend_ratio_inverse.cjs).

**Next decision:** Retire the *equal shared GP28 additive keystream under these two literal public clocks*. Retain the source phrase as an artifact-level lead only if a separate authored operation specifies how to consume it. The missing object remains an original-language key or lossless nonperiodic state transition, and searching more free alignments cannot supply that instruction.
