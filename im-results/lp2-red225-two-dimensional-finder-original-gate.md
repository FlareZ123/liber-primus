# Red 225-rune / 31-marker two-dimensional finder hypothesis

**Decision, 17 November 2026 (Agent14): bounded source-native exclusion, not decipherment.** The 58 original LP2 images contain exactly 225 red GP29 rune glyphs and 31 physical thirteen-dot marks, independently established by [the direct original-image census](lp2-original-dot-punctuation-physical-census.md). The numerology `225=15²` and `225+31=16²` suggests a small two-dimensional machine-readable symbol, though the source **does not select a barcode format or arrange these objects into a matrix**. This tests the least-parameter candidate before using a scanner or guessing a bit key.

## Exact registered source-order receiver

Read all 225 original red runes in physical publication/page/line order, with their pinned GP29 identities from [the ink annotation](../resources/liber-primus/lp2-ink-annotations.json); read all 31 *physical thirteen-dot* marks, including the black p7 marker, as identical dark modules. The 31 selections are not unique among other source-visible event classes, another substantive objection to the premise.

- **Data Matrix ECC200 16×16 interpretation:** Put the 31 identical 13-dot events along the solid left and bottom L (16+15 cells); put the 225 red runes in ordinary row-major order in the remaining 15×15 area. The alternate dark/light top and right finder edges impose 29 unique rune-cell bit constraints, excluding the shared top-right corner from the second count.
- **Compact Aztec 15×15 interpretation:** Put the 225 red runes in a row-major 15×15 symbol. The central 9×9 bulls-eye comprises 81 cells whose fixed rings alternate dark/light. This is a different candidate using the 225 square without assigning the 31 marks.
- In each case, grant **every one of the 29 rune identities an arbitrary *secret* stationary bit value**, so the original base29 index parity need not be the right key. This is an exact all-`2²⁹`-key optimum computed by maximizing each identity's zero/one counts separately. No natural-language scoring, chosen cipher key, or bit-sign phase search is involved. Mirror/reversal of source order is a companion check; the 9×9 bulls-eye is symmetric under rotations/reflections, so those cannot repair its central collisions.

| Fixed format | Original GP-index-parity matches | Best *any* stationary rune→bit assignment | Exact pattern required |
|---|---:|---:|---:|
| 16×16 Data Matrix top/right finder | 13/29 | **24/29** (five rune labels conflict) | 29/29 |
| 15×15 Aztec central 9×9 rings | 38/81 | **59/81** (16 rune labels conflict) | 81/81 |
| Data Matrix with red tape reversed | 9/29 | **23/29** | 29/29 |
| Aztec with red tape reversed | 38/81 | **59/81** | 81/81 |

The explicit rule uses one bit per rune identity; it does not assume each rune's prime value or modulo-two residue is itself a bit. A positive source-shaped plant maps rune identity 0/1 to opposite bit values and reproduces all **29/29** Data Matrix finder cells and all **81/81** Aztec finder cells under the *same* scorer.

## What changes

**Reject the fixed, source-ordered, glyph-identity-to-bit 15×15/16×16 symbol decoding.** Any fixed substitution codebook is mathematically inconsistent with genuine finder patterns before error correction or full payload decoding. Rotating the 15×15 matrix leaves Aztec's radial finder inconsistency unchanged. The 225+31 count remains a real but nonunique source alignment with the 256-cell printed numeral table. This test does not reject alternative event orderings, spatial layouts, stateful codebooks, barcode types, different symbols, or value-changing table consumers; those require a separate authored selector. No original unknown LP2 plaintext, key, or destination has been recovered.

**Reproducer:** [read-only Windows Node22 CommonJS SFT](../sims/lp2_red225_barcode_finder_gate_sft.cjs), with exact original-object counts, independent source files, all-secret bit-gauge maximization and known-format positive plants.
