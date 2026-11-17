# Nine original LP2 chapter starts: bounded same-pad cancellation gate

## Decision (17 November 2026, source-orthography and editorial reference corrected)

All **36** original chapter-start pairs remain incompatible with a strong shared-pad native-English signal under the two frozen diagnostics tested here. A fixed-rate GP29 additive key cancels from aligned ciphertext differences; a second model marginalizes all lawful plaintext-F-transparent p56-style bypass alignments. Neither original model beats its source-preserving familywise null, and neither recovers plaintext. A related non-additive or externally keyed model remains possible.

Reproducer: [source-native CommonJS test](../sims/lp2_chapter_start_keyreuse_original_sft.cjs). Original ciphertext: [LP2 GP29 corpus](../resources/liber-primus/lp2-corpus.json). Solved calibration: [LP1 plaintext reference](../resources/liber-primus/lp1-plaintext-reference.txt).

## Correct GP29 orthography and reference selection

The original solved LP1 p5 rune transcription contains `ᚠᚢᚾᚳᛏᛡᚾ` = **FUNCTION** and `ᛞᛖᚳᛖᛈᛏᛡᚾ` = **DECEPTION**. Its `ᛡ` glyph (index27, labelled `IA` in the transliteration table) represents Latin `IO` in these words. The 17 November earlier Critic instruction to *expand* `IO` to two symbols was wrong. The decoder now collapses both source-attested `ING→NG` and `IO→IA`, with explicit word regression assertions.

The reference file also contains editorial bracketed lines and repeated continuation summaries. The calibrated corpus removes bracketed lines, ignores reference-only continuation sections **4, 7 and 8**, and uses LP1 reference sections **1,3,5,6,9–16** only. It comprises **2,797** source-derived GP29 rune symbols, with **677** eligible 300-rune windows wholly inside one reference section. Source section labels are editorial groupings and cannot all be treated as true physical page boundaries. Earlier **3,510**, **3,318**, **680** and cross-page calibration claims are superseded. The original LP2 ciphertext is unchanged.

## First diagnostic: ordinary fixed-rate shared additive key

For the original nine printed chapters of lengths **729,1145,1729,1903,1021,1433,1680,3008,308**, a shared key reset at each chapter start would cancel in `(C_a-C_b) mod29`. The finite 36-pair test scores that difference using an add-one-smoothed source-GP29 frequency model.

All 36 original full-length pair scores are negative. The strongest pair of length ≥729 is groups **2/3** over **1,729** runes, score **−0.01322583**. The strongest frozen first-300 pair is **5/6**, score **−0.00024613**. In **5,000** matched within-source offset panels, **3,399** maxima meet or exceed it: empirical familywise **p=(3,399+1)/(5,000+1)=0.67986403**. The direct model has no original language recovery.

## Second diagnostic: exact p56-style plaintext-F transparency

The original ciphertext F may denote a skipped plaintext F or an encrypted non-F, so this model sums permitted pairwise key-clock alignments instead of deleting ciphertext Fs. The corrected LP1 reference plain-F rate is **0.01592357**. For 120 planted same-key source-native pairs the median score is **+0.011554** (fifth percentile **−0.0039809**), versus **−0.007498** (95th percentile **+0.0043069**) for 120 independent-key pairs. These are distributional controls with overlap.

The strongest source-aligned first-300 original pair is **1/8**, score **+0.00449816**. **50 of 75** matched original-offset family maxima are at least this large, giving **p=(50+1)/(75+1)=0.67105263**. The top original candidates weaken on longer windows. No authentic unknown-page plaintext or shared key is recovered.

## Scope

The original chapter-start alignment, 36 pair inventory, full original ciphertext, and bounded negative conclusion remain. These tests cannot exclude different reset positions, genuinely evolving states, non-GP29 plaintext, or another key-sharing rule. An independent first-party mechanism must choose any such extension before renewed searches.
