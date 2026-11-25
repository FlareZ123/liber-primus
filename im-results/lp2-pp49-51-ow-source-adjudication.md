# pp49–51 six-byte disagreement: original-image reconciliation

**Status: source transcription resolved; no plaintext or key recovered.**

## Scope and result

The independent pp49–51 payload lists six contested byte positions: 25, 175, 182, 199, 215 and 237. Four are I/l cases already resolved from the original JPEGs by [the ten-cell glyph-case study](lp2-p50-original-jpeg-il-case-10bit-resolution.md). This report closes the two remaining non-I/l cases directly from the original images.

| Global zero-based cell | LP2 page / zero-based row,column | Printed token | Base60 byte | Competing reading | Original-image discriminator |
|---:|---|---|---:|---:|---|
| 215 | p51 / 3,7 | 1O | 84 | 5 | O is a closed loop with one enclosed white component; a same-font 5 control at cell39 (token 05) has none |
| 237 | p51 / 6,5 | 0W | 32 | 58 | W is 70–71 px high; adjacent lowercase w at cell236 (token 3w) is 46–48 px high |

The measurements remain discriminating at grayscale thresholds 70, 90, 120, 140 and 180. The script uses only the original raster, Pillow, fixed page/table geometry, connected components and a border-flood-fill hole test; no OCR or language scoring is involved.

The four I/l positions are 25=3I→198, 175=0I→18, 182=2l→167 and 199=0l→47; their glyph cases are covered by the linked ten-cell source adjudication. The six disputed values therefore resolve to **[198, 18, 167, 47, 84, 32]**.

## Cross-repository consistency

Decoding all 256 tokens in the local resources/liber-primus/lp2-grid-256.json with the printed base60 alphabet 0–9, A–Z, a–z gives a 256-byte row-major vector identical at every position to Dukotah's independent [canon_256.hex](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/pp49_51/canon_256.hex). The external handoff's P-7 item still listed the six-cell adjudication as pending when inspected; an archived A04 branch claimed the same majority readings. This local check independently establishes the two non-I/l cells and points to the existing local I/l evidence for the other four.

Input JPEG SHA-256 values from the supplied original archive:
- image 66 (LP2 p49): aa3f89156756edf8b796a470a14a3db96516ad2fedf1ed98ccabc1a1cddc0335
- image 68 (LP2 p51): 2b9d60f62b2bc65d040f7ae1bc0960d5a44ca251d2730d049a618074a83e208b

## Reproduction

~~~bash
python sims/lp2_pp49_51_ow_cell_source_sft.py
python sims/lp2_pp49_51_ow_cell_source_sft.py --zip /path/liber-primus-jpegs.zip
~~~

The script emits threshold-by-threshold glyph geometry and fails if the source glyphs do not distinguish the readings.

**Interpretation limit:** this closes a transcription ambiguity only. The 256-byte panel remains an unexplained high-entropy payload; no PRNG, key derivation, cipher receiver or unknown plaintext is established.
