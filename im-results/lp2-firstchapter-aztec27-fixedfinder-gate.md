# First LP2 chapter 27×27: compact Aztec barcode finder is incompatible with every fixed GP29-to-bit mapping

**Decision (15 November 2026, Agent4).** The opening unsolved physical pages **p0–2** contain exactly **262+266+201 = 729 = 27² runes**. A 27×27 square is the matrix size of a [four-layer compact Aztec Code](https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/aztec/encoder/Encoder.java), a 2014-available two-dimensional barcode related to the barcode operations already present in earlier Cicada rounds. This is a plausible **exploratory** visualization, *not* a verified clue or author instruction. Its compulsory centered 9×9 bullseye can be rejected without choosing an English crib, a secret alphabet, or any computationally searched rune-to-bit key.

## All-key fixed finder theorem and source result

In the standard compact Aztec layout, the outer four-layer symbol is 27×27. The centered finder is a 9×9 square with a dark center and alternately light and dark square rings; for zero-based coordinates `(r,c)`, its required bit is `b(r,c)=1` if `max(|r−13|,|c−13|)` is even, otherwise 0, for rows/columns9..17. This is the actual [ZXing encoder's `drawBullsEye` rule](https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/aztec/encoder/Encoder.java#L337), independently specified in [ISO/IEC 24778:2008](https://cdn.standards.iteh.ai/samples/41548/abdda8bc5cff43ff86a9988b1d784f59/ISO-IEC-24778-2008.pdf). Unlike symbol data, these **81** finder bits are *not* free to choose and must exist for the barcode to decode.

Grant an adversarially chosen **arbitrary static binary interpretation of each of all 29 GP runes**. For every source rune value `s`, count how many finder positions using that source rune require light vs dark. The fewest errors over *all* `2²⁹` candidate binary maps is exactly the sum of the smaller count in each symbol group. Thus the test is an exact all-key lower bound, without enumerating maps or fitting favorable glyph parity. Using unchanged `resources/liber-primus/lp2-corpus.json` source pp0–2:

- The 81 fixed cells contain **27** different GP rune values, of which **20** each occur in positions requiring both dark and light.
- **At least 24 of 81 compulsory finder bits are wrong under every single static rune→bit mapping**. This is exact, not an expected random mismatch.
- Row-major, column-major, alternating-row snake, alternating-column snake, and reversed row-major assignments all yield the same minimum **24** errors. All dihedral rotations/reflections of a 27×27 square preserve the concentric finder, so reorienting the matrix cannot repair its fixed core.
- Explicitly planted 729-rune data with the correct known finder pattern passes with **0/81** required edits. Changing one finder module correctly triggers **1/81**. Hence this method could have found a genuine Aztec-style rune-encoded finder.

[Complete Windows Node22 source-to-finder CJS SFT](../sims/lp2_firstchapter_aztec27_fixedfinder_sft.cjs) · [Passing Actions original-source run 43723879414](https://github.com/FlareZ123/liber-primus/actions/runs/43723879414).

## Implication and precise exclusions

The exact 729-rune chapter size **does not turn the runes into a standard compact-four-layer Aztec barcode via a fixed source-rune binary encoding** under the five natural row/column traversals. Both the required finder and a whole-symbol decoder would fail, so there is no point tuning Aztec Reed–Solomon error correction, bit order, or English interpretation for this model.

This does **not** rule out a position-dependent bit mask, an arbitrary permutation of 729 cells, an encrypted binary Aztec image, or a completely different 27×27 puzzle structure. Those relaxations lack a Cicada-authored opcode/seed and remove the finder as a discriminating prediction; no such escape was fitted. No unknown-page plaintext, key or original destination was recovered. This result is a bounded exploratory exclusion, not an established general claim about the first chapter's enciphering system.
