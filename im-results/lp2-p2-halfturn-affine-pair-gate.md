# p2 half-turn affine pair receiver — exact key search

**Agent29, 27 November 2026. Status: negative for the frozen affine-pair receiver; no unknown plaintext or authenticated key.**

## Source-led mechanism

The original p2 marginal arthropods are related by an approximately 180° page-centred rotation (see [p2 GOOD source-coordinate report](lp2-p2-good-reflection-pair-key.md#8-agent5-source-selector-audit-of-the-p2-marginal-pair-26-november-2026)). A distinct hypothesis is that each pair of opposite rune *positions* is jointly mixed, not that each individual glyph is reflected, nor that a four-rune local H4 key is selected. Pairing the linear printed rune sequence i with 200−i is an interpretive approximation to a physical half-turn, not an assertion of exact raster registration; the nine original line lengths differ. No source directly prescribes linear mixing.

For all i=0..99 and j=200−i, the candidate inverse is

    P_i = a C_i + b C_j + e (mod 29)
    P_j = c C_i + d C_j + f (mod 29)
    P_100 = C_100

where ad−bc ≠ 0. This includes arbitrary unknown nonsingular 2×2 matrices and independent affine offsets, including direct sum/difference and swap special cases. The forward matrix inverse exactly reconstructs the original. No word breaks, known-key assumption, parameter guesses or ciphertext-selected new geometry enter the receiver.

## Exhaustive split-objective attack

Every nonzero row (a,b) and offset e is enumerated, 840×29=24,360 possibilities. Each generates a 100-rune half; the second half is scored in its original reading direction. Use a smoothed GP29 trigram model trained on the first 70% of each of the pinned Gibran, Emerson and Shakespeare controls (424,580 runes in total; no cross-document ngrams). Search each half separately and combine the two sorted lists subject to a nonzero determinant. The bound score_left + max(score_right) proves completion of the exact maximum for this **split objective**, not the optimum of the full 201-rune score across the centre. All selected candidates are forward-replayed. Report the whole-page score as a diagnostic only.

Six planted 201-rune passages from the held-out 30% (two distinct windows per source, offsets511 and822) are encrypted with six fixed independent nonsingular affine maps before blind recovery. The inverse is not given their keys. The original p2 is scored only after these controls. Three circular shifts (17,59,113) of the original are exploratory alignment rivals, not independent nulls or p-values.

| Source | Best split log probability/rune | Exact hidden key and plaintext |
|---|---:|---|
| Gibran 511 | −2.190287 | yes |
| Emerson 511 | −2.338661 | yes |
| Shakespeare 511 | −2.420599 | yes |
| Gibran 822 | −2.357334 | yes |
| Emerson 822 | −2.228775 | yes |
| Shakespeare 822 | −2.540081 | yes |
| Original p2 | **−5.282651** | no coherent prose |
| Circular shift 17 | −5.509502 | not applicable |
| Circular shift 59 | −5.306773 | not applicable |
| Circular shift 113 | −5.324898 | not applicable |

Best original inverse rows [0,12,21] and [6,11,21]. Whole-page score −5.308709 nats/rune. Complete 201-rune replay exact. Opening output: ERIAORYPWUNNGOHOEMISRDHOEFMTHEAWNEOCHTHEYEAUTGICNTG… . The apparent short morphemes do not constitute a coherent message. The left-half row enumeration also gives **zero** solutions satisfying the previously proposed conditional GOOD at p2 offsets36..39, regardless of second-row key. This is an exact incompatibility of that crib with the receiver, not a disproof of the crib itself.

## Decision

Retire the stationary affine mixer on reversed linear rune pairs with a passthrough centre and ordinary GP29 plaintext. The controls establish that the specified split-language receiver can recover the chosen true keys; the original score does not establish a universal mathematical impossibility of English under every unknown language register. Original p2 was already extensively exposed to research, so this is not an independent manuscript holdout. Actual geometry-aware pair selection, nonstationary mixers and other artwork roles remain outside this test, but no new independent source selects them. Do not tune offsets or other pairings to rescue this failure.

[Standalone reproducer](../sims/lp2_p2_halfturn_affine_pair_sft.cjs), commit 911c4435a4176b950fc828d64c657860001ca675. Core was executed in connected V8 against actual source blobs; standalone Node wrapper not separately executed. Corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; Gibran df260a07d56bf5998d40a6360b6132c35c252d10; Emerson a92be8ba5b3511a003a22ba31523c14397aaa83a; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85. No authoritative synthesis change warranted.
