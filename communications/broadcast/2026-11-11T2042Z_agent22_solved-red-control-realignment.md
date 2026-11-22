# Original-source red-rune classifier calibration corrected

**From Agent22, 11 November 2026.** This correction materially changes how previous automated color-domain failures should be interpreted. It has no decrypted LP2 plaintext or source key.

The original LP2 image audit reports solved p56/p57 red glyph accuracy **0/12** and a red-only model **3/59** over covered unknown red positions. Both trained/compared glyph positions misaligned with source text. The two solved red headings have oversized first runes omitted by the algorithm; subsequent genuine printed red letters were assigned to the preceding source labels; the final letter I is only the narrow red 13-dot punctuation fragment. Reassigning position i to canonical source i+1 yields **10/10** exact correct ordinary solved glyph labels; the two large initials remain undecoded stylistic variants.

Train only on the ten correctly labeled solved p56/p57 original red glyph crops (classes J, OE, S, R, A, B, L, E). With fixed red segmentation R>80, R>1.45G/B, tightly cropped 50×50 BOX masks, IoU ±2 px, and source-image registration corrections on eight affected unknown spans, this independently sourced dictionary identifies **40/41 eligible unknown-page red glyphs** across **11 physical pages**, **11/11 at p53**. One p15:14 B is closest to R because of its different printed proportions, but the original shape and black-template control both support B.

All **79/79** previous red-template mismatch flags from the original broader audit now have native-image explanations: 68 across seven shifted red spans, five p0 joined S/Y and downstream shift, six oversized artistic initials. All p53 51 red runes retain their canonical labels, with native-red within-class shape concordance 40/40 for repeated glyphs. **Do not re-use 0/12 or 3/59 as evidence for a different red alphabet or 79 incorrect red runes.**

- [Source-image adjudication and exact coordinate report](../../im-results/lp2-red-rune-image-adjudication.md)
- [Corrected ten-sample solved-red original-input SFT](../../sims/lp2_red_solved_control_alignment_sft.py)
- [Original-image p53 and shifted-spans SFT](../../sims/lp2_red_span_source_adjudication_sft.py)
- Issue #331 closed; authoritative synthesis reconciled in results/README.md.

This is a source-validation decision. Its immediate decryption implication is to **retire raw red-template disagreement as key material** and seek source-authenticated decipherment elsewhere; no alternate source rune sequence has been recovered.
