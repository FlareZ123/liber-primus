# LP2 p22 mirrored-footer glyph reflection: original-source negative

## Decision

The **horizontal mirror of solved-LP1 artwork on physical LP2 p22** (archive \`39.jpg\`) is real source evidence, but applying that same literal horizontal mirror **individually to the 131 adjacent printed p22 rune glyphs** fails to define an invertible 29-symbol alphabet or readable plaintext. Under a separately trained, high-fidelity GP29 source-image classifier, the complete 29-class reflection map has only **17 output classes**. **No cipher or key is recovered.** This closes the narrowly specified experiment in [Director #801](https://github.com/FlareZ123/liber-primus/issues/801). It does not exclude a mirror operation on the *entire text line*, reversed reading order, or another non-GP representation, none of which was tested or selected by this original artwork.

### Source and frozen experiment

- Original byte-identical archive images: p2 \`resources/liber-primus/19.jpg\` (SHA-256 \`74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34\`), p22 \`39.jpg\` (SHA-256 \`e232eb4649f89125d0edeab7022cbe189185d46ccbf0823fd964b6e71e9bafe7\`), solved p57 \`74.jpg\` (SHA-256 \`1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b\`).
- Canonical labels and printed boundaries: \`resources/liber-primus/lp2-transcription.txt\`; p22 physical image is 6 runic lines, exactly **[22,24,23,23,19,20] = 131 runes**. Source row centers \`[727,915,1077,1267,1485,1711]\` from the six original black-ink projection peaks. All 131 observed crops segment without corrections, resizing or OCR.
- **Before using p22**, reuse the separate p2 source gallery of 161 labeled black-font glyphs from rows 1–7 of \`19.jpg\`; it covers all 29 GP rune classes. Exclude p2 rows 0 and 8 as heldout (40 runes). Also apply the same gallery to 65 original black-font runes from solved p57. This is the fixed gallery and exact IoU registration method previously established in \`sims/lp2_p2_literal_glyph_reflection_sft.py\`.
- The new run uses grayscale **<110** threshold and source column projections, tight glyph bounding boxes, unchanged original sizes, left-to-right original rune order, and intersection-over-union over fixed alignment or ±1 original pixel, without per-glyph exceptions. Pixel matching is batched with NumPy matrix multiplication, mathematically equivalent to counting black-pixel intersections individually. Reflect each glyph crop by reversing only its columns. The reflected image is then classified against **unmirrored** GP29 source templates.
- Train one 29-to-29 class-level map by **modal reflected nearest-neighbor predictions on the independent p2 training gallery**. Do not fit its output from p22. Apply the frozen mapping to all original p22 runes with punctuation and word segmentation unchanged. Record independent per-glyph mirrored nearest matches as a stability control.

### Measured controls and original-cipher result

| Test | Exact count / value |
| --- | ---: |
| Unmirrored p2 training glyph leave-one-out | **159 / 161** correct |
| Unmirrored held-out p2 rows 0,8 | **40 / 40** correct |
| Unmirrored solved p57 black glyphs | **65 / 65** correct |
| Unmirrored target p22 original glyphs | **131 / 131** correct |
| Distinct GP29 outputs of 29-class fixed mirror map | **17 / 29** |
| Reflected p22 top-match median IoU | **0.55292034** |
| Reflected p22 top matches with IoU ≥0.9 | **31 / 131** |
| Independently frozen p2-derived mirror map agrees with reflected p22 top match | **112 / 131** |

Source-trained map, exact transliteration labels (GP digraphs are one rune each):

| Input | F | U | TH | O | R | C | G | W | H | N | I | J | EO | P | X |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Reflected best class | X | M | J | S | G | X | G | X | H | N | I | J | EO | E | X |

| Input | S | T | B | E | M | L | NG | OE | D | A | AE | Y | IA | EA |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Reflected best class | O | T | OE | E | E | X | NG | OE | D | OE | S | M | IA | EA |

The direct frozen-map reading starts \`NGEIGJGXSJEJJMXJXJIAEMXJXHJGJOEHNJXGGJOE...\` and is nonlinguistic. Distinct glyphs such as F/C/W/L/X collapse to X, R/G to G, P/E/M to E, and B/OE/A to OE. They cannot be inverted from their GP outputs. Some individual glyph reflections are ambiguous, consistent with the 112/131 cross-page map agreement; allowing exceptions to repair the map would violate the frozen test.

### Reproduction and decision

\`python sims/lp2_p22_literal_glyph_reflection_sft.py\` from repository root, using NumPy/Pillow/SciPy, outputs all **131 source labels, mirrored individual best matches, IoU values**, the entire mapped p22 text and 29-row mapping. The program verifies the four positive controls and asserts the 17-class collapse and 31/131 high-similarity result. Its inherited p2 segmentation and source templates were already independently evaluated in [the prior p2-only report](lp2-p2-literal-rune-reflection-gate.md). The 39.jpg image used here contains 131 runes; it is **physical p22**, distinct from archive filename page39.

**Next research decision:** Retire *per-glyph p22 horizontal reflection into unchanged GP29 alphabet* as a cipher inverse. The page's true artwork mirror may be a section clue or an operation on another input; no direct GP29 key, original unknown plaintext or previously unselected prediction follows. Do not append an unsourced substitution, Atbash, reversal or Vigenère stage to rescue this rejected mapping.
