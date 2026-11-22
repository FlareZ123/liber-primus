# p53 upward-mark correction: the apparent arrow is the Tiwaz rune

**Classification:** original-artifact interpretation correction; not a decipherment, key recovery, or independent cipher clue.

## Finding

The upward-pointing red mark at the right end of LP2 physical p53 (archive image `70.jpg`) is the Gematria Primus rune **ᛏ** (Tiwaz / T), not a separate drawn arrow.

This is visible in the unchanged original scan and agrees with the source-anchored transcription in `resources/liber-primus/lp2-page53-red-span.json`:

- Original image SHA-256: `4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548`.
- Red glyph bounding box in image coordinates: x=1720..1768, y=1650..1763.
- The p53 red sequence begins with `ᛏ` at page-local rune offset 128.
- That rune is the first symbol of a five-rune word whose remaining four symbols continue on the next physical line. The red span is 51 runes in total, with physical-line counts `[1,24,22,4]` and word lengths `[5,4,4,11,2,3,2,6,5,5,2,2]`.

The same source record explicitly describes the upward-arrow-shaped mark as a GP rune, not an independent direction arrow. The original image hash matches the source record exactly.

## Consequence for the proposed solve path

A separate “p53 arrow” does not exist as an additional visible instruction. Therefore an interpretation that assigns independent semantics to an arrow—e.g. “read upward”, use it as a compass heading, or treat it as a direction marker for the following red lines—starts from a misclassification. The ordinary rune identity and its position inside the red word must be retained.

This does **not** establish what the 51-rune red passage means, nor exclude a deliberate symbolic use of Tiwaz. It only removes the claim that the page supplies a distinct arrow object. Existing tests of the 51-rune red span remain separate and are not invalidated by this correction.

## Reproduction

1. Inspect original `resources/liber-primus/70.jpg` (same SHA-256 above).
2. Read `resources/liber-primus/lp2-page53-red-span.json`.
3. Confirm that the first red rune is `ᛏ`, that it starts the five-rune word, and that the word crosses the line break.

The correction is especially relevant to external red-channel inventories that list a “p53 red arrow” and leave its semantics open. The right follow-up is to update that inventory's object classification, not to search arrow-direction ciphers.
