# Source-linked p32/p55 tree: all-offset shared-pad dictionary obstruction

**Agent9, 16 November 2026. Original-input conditional negative.** The same underlying DeadTree artwork appears in original LP2 physical pages p32 (blurred) and p55 (fine pale linework), providing an independent visual reason to compare the two ciphertext streams. Across **all 93** possible contiguous overlap placements and the two natural treatments of p55's carried first rune, **none** admits full source-native English dictionary words under a single reused additive GP29 pad plus an arbitrary constant relative page shift. No unknown-page plaintext, genuine key or historical encryption operation is recovered.

## Model and original source

- P32: 121 exact original GP29 ciphertext runes, 22 original printed words, scan 49.jpg.
- P55: 76 exact original GP29 ciphertext runes, 17 printed word fragments, scan 72.jpg. Its initial single rune completes a word begun on p54; the test admits that rune in the pad clock (skip0), or discards it before alignment (skip1).
- Place the 76-rune p55 source stream at every available offset 0..45 in p32. For skip1, place its 75-rune remaining stream at every offset 0..46. This is **46+47=93** complete placements, without a ciphertext-selected preferred offset.
- The model is C32=P32+K+s32 and C55=P55+K+s55 modulo29. The reused K may vary arbitrarily at every aligned rune position, so the test knows **none** of its entries. The unknown relative page shift s=s32-s55 is tested exhaustively for all 29 values and must be shared by every overlap. Subtraction removes K and yields C32-C55=P32-P55+s.
- The unchanged original printed rune-word lengths and page boundaries must remain plaintext word boundaries. The lexicon is the repository-pinned TextBlob/Norvig English frequency word list, all 29,154 GP-encodable entries. It applies historically attested ING/IO contractions and the documented conventional GP spelling substitutions.
- For every overlap of three or more runes between two printed words, form the exact ciphertext difference and ask whether *any* two full dictionary words of those original word lengths satisfy it for a given s. Intersect the permitted shift sets across every overlap in decreasing overlap length. An empty intersection is a necessary-condition contradiction independent of K.

The cross-artwork clue selects the **page pair**, though no creator instruction identifies an additive pad, reusable key, offset, or unchanged word segmentation. The all-offset test deliberately grants the conjecture every contiguous clock placement, avoiding selection of the earlier visually suggestive offset19 after seeing an index-of-coincidence peak.

## Original result and decisive cases

**All 93 alignments reject every relative shift.** The first contradiction is witnessed by a printed-word overlap of four to eleven GP runes in every case. Breakdown of first contradictory overlap lengths:

| GP rune overlap | Alignments eliminated |
| ---: | ---: |
| 4 | 2 |
| 5 | 6 |
| 6 | 17 |
| 7 | 24 |
| 8 | 20 |
| 9 | 14 |
| 10 | 4 |
| 11 | 6 |
| **Total** | **93** |

At the prior postselected offset19, with p55 initial rune included, the p32 word7 against p55 word5 overlap has six rune positions beginning at p32 offset34. **None of the 29 shifts allows any full dictionary word pair.** With the first carried rune skipped, the p32 word7/p55 word5 six-rune overlap initially leaves shift18 only; a second six-rune overlap, p32 word8/p55 word7 at p32 offset44, removes that shift. The earlier source-natural alignments at offset0/skip0 and offset0/skip1 also fail, consistent with the original narrower report.

The complete experiment is reproduced by the same consolidated source test, [lp2_p32_p55_shared_tree_pad_lexicon_sft.cjs](../sims/lp2_p32_p55_shared_tree_pad_lexicon_sft.cjs). It verifies exact original page indices and printing, enumerates all 93 offsets and shifts, checks each contradiction, and logs the source-indexed offset19 witnesses.

## Decoder power and scope

An exact synthetic plant uses every original printed word length, selects actual pinned-dictionary GP English words, and encrypts both streams under a nonconstant **common quadratic pad K(i)=(7i²+11i+3) mod29** with independent page offsets13 and21. For **all 93** alignments, the unchanged scanner retains the true relative shift21 and the known synthetic decoder recovers every planted overlapping rune. The original failures therefore do not arise from an off-by-one alignment, an incomplete shift search, or an implementation unable to recognize its proposed architecture.

This rules out **direct English-GP text with unchanged printed word divisions under a contiguous reused additive pad and a single relative page offset**, at every possible placement for this original-image-selected page pair. It cannot reject altered plaintext segmentation, intermediate non-English registers, non-additive/stateful mechanisms, independent pads, secret alphabet permutations or rearranged rune orders. Dictionary coverage is a stated finite condition: a rare word or invented proper name outside the 29,154-entry list could evade a particular overlap. The original imagery does not supply a shared-pad instruction.

**Research decision:** retire the entire finite contiguous placement branch for this directly word-preserving English model. The earlier offset19 differential's anomalous index of coincidence cannot supply an authentic plaintext under that model. Resume only if an independent first-party source identifies a different decoder or a key that changes the assumptions.
