# LP2 external pp49–51 / p27:93 source-discrepancy adjudication

**Date:** 2026-11-14  
**Evidence class:** direct original-pixel reading, source-transcription comparison, and external independent image-reader corroboration.  
**Decision:** the three table values identified by the external correction are already present in this repository's canonical printed-token table; p27 local rune offset 93 is **U (ᚢ)**, as the repository already records. No canonical resource changes or local inverse reruns are warranted. No unknown plaintext, key, cipher mechanism, or destination was recovered.

## 1. pp49–51: the three-byte difference is already resolved in this repository

The 32×8 printed table is ordered row-major across original scans 66.jpg (physical p49, 10 rows), 67.jpg (p50, 13 rows), and 68.jpg (p51, 9 rows). The external Dukotah Round 33 B1 preregistration reports that its earlier canon_256.bin differs from its pixel-resolved payload at global indices 45, 50, and 246: 81→107, 21→47, and 224→198.

The repository's current resources/liber-primus/base60-grid.json and lp2-grid-256.json already contain the resolved printed tokens and corresponding base-60-derived bytes:

| Global index | Physical page / scan | Zero-based row, column | Printed token | Base-60 value | Original second-glyph crop (inclusive bounds) |
|---:|---|---:|:---:|---:|---|
| 45 | p49 / 66.jpg | 5, 5 | **1l** | 107 | x=1442–1448, y=2140–2212 |
| 50 | p49 / 66.jpg | 6, 2 | **0l** | 47 | x=1028–1034, y=2319–2391 |
| 246 | p51 / 68.jpg | 7, 6 | **3I** | 198 | x=1566–1572, y=1884–1950 |

The exact token-to-value rule in lp2-grid-256.json is 60*digit(first)+digit(second). At the disputed positions, the old values correspond to the alternative case readings **1L**, **0L**, and **3i**; the printed original glyphs are instead lowercase l, lowercase l, and capital I.

### Original-pixel measurements

The source images are the repository's unchanged 2400×3600 JPEGs. Their hashes match resources/liber-primus/SHA256SUMS.txt:

- 66.jpg: aa3f89156756edf8b796a470a14a3db96516ad2fedf1ed98ccabc1a1cddc0335
- 67.jpg: bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776
- 68.jpg: 2b9d60f62b2bc65d040f7ae1bc0960d5a44ca251d2730d049a618074a83e208b

Reproducing the committed row/cell projection and native-pixel geometry at the three locations gives:

- Index 45: the second glyph is 7×73 pixels, one continuous vertical strip. The same-font lowercase-l control at p49 row 0, column 2 is also 7×73; the uppercase-L control at p49 row 3, column 6 is 26×67 with a broad foot.
- Index 50: the second glyph is likewise 7×73 pixels, one continuous strip. It is lowercase l, not uppercase L.
- Index 246: the second glyph is 7×67 pixels, one continuous strip. Independent capital-I controls at indices 25, 165, and 175 are also 7×67 and continuous. The lowercase-i control at p49 row 9, column 0 is 10×63 and has two vertically separated strips (the dot). Index 246 is capital I, not lowercase i.

This agrees with the repository's earlier eleven-cell original-glyph adjudication and its independent external blind reread. See the [consolidated eleven-cell pixel audit](lp2-grid-11-original-glyph-adjudication.md), its [reproducer](../sims/lp2_grid_11_glyph_adjudication.py), Dukotah [Round 19 C1](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round19/C1/RESULTS.md), [Round 28 L2](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round28/L2/RESULTS.md), and [Round 33 B1 preregistration](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round33/B1-payload-resolved/PREREG.md).

### Why the external byte triplet differs

The old triplet [81, 21, 224] also occurs at exactly these three positions in this repository's separately preserved resources/cicada2014-sexagesimal-source.json historical 2014 solver-derived byte witness. That historical witness is a distinct source object, not the printed LP2 token table. This is a concrete compatibility explanation for the old values and is consistent with the alternative-serialization hypothesis. It does **not** establish that the external canon_256.bin is byte-identical to the complete 2014 witness; only the three disputed positions were compared here.

The manuscript's printed token readings at these three cells are image-supported. The numeric values above remain conditional on the repository's base-60 interpretation; this result does not resolve the separate radix-59/radix-60 ambiguity or establish that the table is a key.

## 2. p27 local rune offset 93: U, not B

The repository's lp2-corpus.json records p27 as 234 runes and indices[93] = 1; rune index 1 maps to ᚢ / U. In lp2-transcription.txt, p27 offset 93 is line 5, the 17th rune on that line (zero-based row 4, column 16).

The original resources/liber-primus/44.jpg is 2400×3600 and has SHA-256 c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e, matching the repository manifest. The exact glyph crop is x=1404–1456, y=1671–1783 (53×113 pixels; 2,077 dark pixels at threshold 90). Its open, single-diagonal form is the U rune, not the two-lobed B rune.

Same-page original controls make the distinction direct rather than relying on a classifier label:

| Rune offset | Canonical rune | Original crop (half-open bounds) | Dimensions |
|---:|:---:|---|---:|
| 93 | U / ᚢ | (1404, 1671, 1457, 1784) | 53×113 |
| 149 | B / ᛒ | (832, 2234, 866, 2348) | 34×114 |
| 151 | B / ᛒ | (945, 2234, 979, 2348) | 34×114 |

The two B controls show the characteristic paired triangular bowls absent from offset 93. This is a direct comparison among original glyphs on the same page and in the same typeface.

Dukotah's independent [Round 33 B2 p27:93 audit](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round33/B2-lp1-audit/p27_93.md) also resolves U. It traces the former T1 B call to a contaminated singleton exemplar: bitmap 421, sourced from p13, is itself U but was labelled B after an alignment error beside a merged C+B glyph. The target is 6 Hamming pixels from that false B exemplar, 11 from a repeated U exemplar, and 2,862–2,903 from the actual B exemplars. The external audit's verdict agrees with the original same-page comparison above. No transcription correction is needed.

## 3. Downstream impact and decision

**Actual affected local inverse gates: none.** The repository's canonical table resources already contain bytes 107, 47, and 198, and its canonical p27 corpus already contains U at offset 93. Therefore this adjudication changes no local inverse input. Do not re-feed the table or rune corpus through broad key/period sweeps, and do not overwrite the historical 2014 witness. The external Dukotah Round 33 B1 results are useful context but are not local gate runs; that report records no verdict change in its tested B-04, R17, E-01, or E-02 rows and explicitly leaves R16-KDF un-re-fed.

No changes were made to base60-grid.json, lp2-grid-256.json, lp2-corpus.json, or the original images. This issue is closed as a source-convention compatibility resolution, not as a cryptanalytic breakthrough.

## Reproduction

From the repository root:

- Run: *python sims/lp2_grid_11_glyph_adjudication.py*
- Run: *sha256sum resources/liber-primus/{44,66,67,68}.jpg*

To inspect p27:93 beside its two same-page B controls, crop the original 44.jpg with Pillow using half-open bounds:
- U: (1404, 1671, 1457, 1784)
- B: (832, 2234, 866, 2348)
- B: (945, 2234, 979, 2348)

**Scope limit:** this adjudicates only the three named table cells and p27:93. It does not settle the intended radix, derive a key, or recover any unknown plaintext.
