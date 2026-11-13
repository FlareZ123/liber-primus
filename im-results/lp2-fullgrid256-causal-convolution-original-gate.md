# Full original 256-cell table as a causal GF(29) rune filter

**Decision (13 November 2026, Agent31):** A direct full-table convolution and its legally reversible causal orientation yield no LP2 unknown plaintext under three original-visible clocks. This is a finite negative gate for one complete source-anchored transform; no source instruction selects it.

## Source-led question

LP2 physical pp49–51 (66.jpg–68.jpg) contain the complete 32×8, 256-token numerical table. Its base60 interpretation is recorded, with image-adjudicated transcription, in [the source grid](../resources/liber-primus/lp2-grid-256.json). The original GP alphabet has 29 elements, so reduce the 256 table byte values modulo 29. This tests whether the whole grid is a finite-impulse-response / causal polynomial key applied to the manuscript's 12,956 original unsolved rune indices. It is different from the previously tested **short H, G, HG** two/five-tap filters ([prior report](lp2_dualfactor_convolution_original_gate.md)) and the terminal **32×8 spatial ring** models ([prior report](lp2-terminal256-knowninterior-ring-gate.md)).

For key coefficients k0...k255, define zero-initialized causal convolution C[i] = sum(k[j]*P[i-j]) mod29 for j=0..min(255,i). Apply the source table in its printed 256-cell order and its reversal. The printed first coefficient is **0**, making this direct causal map non-invertible as written; the reversed table starts with **22**, so its original-cipher inverse is uniquely recoverable: P[i] = inverse(22)*(C[i]-sum(k[j]*P[i-j],j>=1)) mod29. As a separate possible output filter, test forward convolution for both orientations.

Test three source-visible reset registers: whole book, nine image-adjudicated visual chapters with rune lengths 729,1145,1729,1903,1021,1433,1680,3008,308, and each of 55 nonempty original physical rune pages. There is no fitted phase, learned coefficient, key search or original-plaintext postselection.

## Results on unchanged original ciphertext

| Table orientation | Operation | Continuous IoC | Chapter IoC | Page IoC |
|---|---|---:|---:|---:|
| Printed | Forward filter | 0.03447302 | 0.03448702 | 0.03449910 |
| Reversed | Forward filter | 0.03447519 | 0.03446679 | 0.03447563 |
| Reversed | Causal inverse | 0.03451133 | 0.03448052 | 0.03448505 |

The original 12,956-runic ciphertext has index of coincidence **0.03447840**; solved original LP2 p57 native GP text has **0.06270997**. All nine outputs remain near uniform-GP ciphertext rates. Original GP E+O runes occur only **850–918** times in the candidates across 12,956 positions; no coherent unknown text is recovered. Every reversed original inverse re-encrypts exactly, as required by its algebra but insufficient to authenticate its historical key. A 95-rune solved p57 forward-encoded positive plant is recovered **95/95** by the same reversed inverse.

**Key-independent strengthening:** Index of coincidence depends only on the 29 rune multiplicities. Consequently **every possible globally fixed secret 29-symbol output permutation**, including any affine GP29 postmap with nonzero slope and arbitrary offset, has *exactly the same* displayed IoC as its corresponding filtered output. No hidden static substitution alphabet can repair those nine low-coincidence outputs into ordinary high-coincidence GP-native text. This still permits an independent *changing* alphabet, an unselected state register or another encoding layer.

**Boundary:** These results reject the direct zero-IV 256-tap source-table interpretation under the three tested clocks as a route to ordinary native-GP plaintext. A source-selected nonlinear use, distinct byte-to-rune representation, keyed register or unknown prefilter remains outside this test. The source has not established that the numbers were intended as cipher coefficients.

**Exact executable input and gate:** [single-file original-source CommonJS reproducer](../sims/lp2_fullgrid256_causal_convolution_original_sft.cjs), which loads the canonical original ciphertext and source table, performs all three partition tests, verifies exact original inverse reencryption and the authentic solved-text positive plant.
