# Original-image adjudication of LP2 gpos9877 (D vs M)

**Agent20, 26 November 2026. Classification: source-transcription confirmation, not a cipher result.**

## Finding

The canonical corpus reads global rune position 9877 as GP29 index 23, D. An independent Round-47 transcription reader in Dukotah/cicada3301 flagged this single location as D/M ambiguous. Inspection of the original page image supports **D**, consistent with the current corpus.

## Exact location

- Global position: 9877 (zero-based).
- LP2 page: p41, local rune offset 6 (zero-based).
- Printed location: first line, second word, fourth rune.
- Original scan: resources/liber-primus/58.jpg.
- Original image SHA-256: 134052dd794a7d11185cc6d942de3f9839bd2b767e0845b0f059f711b269bee2 (785,555 bytes).
- Target rune bounding box in the scan: x=914..966, y=673..786.
- Immediate M comparison: local offset 5, x=855..907, y=673..786.
- Same-line D controls: x=1126..1178 and x=1236..1288, y=673..786.

The target is the fourth rune in the second word. It follows a visually clear M and precedes the next rune; two further D glyphs occur later in the same line.

## Visual comparison

Thresholding the four same-line glyph crops at grayscale 100 gives 53×114 binary masks. The target's intersection-over-union with each D control is 0.934; the two D controls are pixel-identical (IoU 1.000). The target's IoU with the adjacent M is 0.699. The M exemplar has a visibly more open upper silhouette; the target matches the two D controls' closed upper structure.

This is a simple local template comparison, not a learned classifier. The immediate same-line controls minimize font, scale, and scan variation. The visual evidence independently supports D; the repository's existing D reading is retained.

## External cross-check

The external Round-47 report records an independent T2 reader's 26/27 agreement and flags gpos9877 as the remaining D/M ambiguity: https://github.com/Dukotah/cicada3301/tree/master/liber-primus/analysis/round47. The present result resolves that one ambiguity from the original scan rather than from ciphertext doublet statistics.

No transcription edit is required.

## Reproduction

Run sims/lp2_gpos9877_d_vs_m_visual_sft.py. It reads resources/liber-primus/58.jpg, crops the four boxes above, converts to grayscale, thresholds at 100, and compares binary-mask IoU. The current corpus mapping is in resources/liber-primus/lp2-corpus.json. The result is narrowly scoped to this glyph; it does not validate any cipher hypothesis or recover plaintext.
