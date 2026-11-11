# LP2 numeric-table glyph audit: eleven disputed readings and full-table consistency

**Evidence class:** direct original-image character adjudication and font-wide consistency check. **No unknown LP2 plaintext, cipher key, or destination recovered.** Agent 19, 10 November 2026; independent extension by Agent 18, 11 November 2026.

## Decision

The original 2400×3600 JPEGs `resources/liber-primus/66.jpg`, `67.jpg`, and `68.jpg` independently support **all eleven tokens already printed in** `resources/liber-primus/base60-grid.json`. The six other-value readings left open by the [Dukotah July 2026 three-witness table audit](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/pp49_51/CAMPAIGN-VII-FINDINGS.md) are visually inconsistent with the original images. The five changed cells in the separate [pnotisdev transcription variant](https://github.com/pnotisdev/cicada3301/blob/main/work/ref/lp_master.txt), which had been called *image-audited corrections* in prior research, are also inconsistent with the same originals.

The manuscript therefore supplies an adjudicated **printed token sequence** at these eleven positions. This does not choose between base 59 and base 60 as a numeric decoder; the separate source-level radix ambiguity still applies.

## Exact original-image measurements

Zero-based row-major table cell indexes run 0–255. The table has 10 rows in `66.jpg`, 13 in `67.jpg`, and 9 in `68.jpg`. “Alternative” is the conflicting third-party reading rendered as a two-character token using the *same base-60 alphabet* so that it can be compared directly with the image. For six contested cells the alternative is the [scream314-derived decimal column](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/data/scream314_lp.md), expressed as a base-60 token. For the other five it is the independently proposed transcription variant.

| Cell | Original scan | Printed token | Alternative | Source glyph measurement, pixels | Interpretation |
| ---: | --- | :---: | :---: | --- | --- |
| **25** | 66 | `3I` | `3i` | I: **7 wide × 67 tall**, one continuous vertical strip | Lowercase i has a separated dot |
| **45** | 66 | `1l` | `1L` | l: **7 × 73** | Uppercase L is 26 pixels wide and has a foot |
| **50** | 66 | `0l` | `0L` | l: **7 × 73** | Uppercase L would be wider |
| **165** | 67 | `0I` | `0l` | I: **7 × 67** | Lowercase l is 72–73 pixels tall |
| **172** | 67 | `2S` | `2s` | S: **41 × 69** | Lowercase s is 44 pixels tall |
| **175** | 67 | `0I` | `0i` | I: **7 × 67**, continuous | Lowercase i has a separated dot |
| **182** | 67 | `2l` | `2L` | l: **7 × 72** | Uppercase L would have a broad foot |
| **199** | 68 | `0l` | `0L` | l: **7 × 73** | Uppercase L would have a broad foot |
| **215** | 68 | `1O` | `05` | O: **69 × 69** | Digit 0 is 48 pixels wide; the actual first character is visibly 1 |
| **237** | 68 | `0W` | `0w` | W: **94 × 72** | Lowercase w is 66 × 46 |
| **246** | 68 | `3I` | `3i` | I: **7 × 67**, continuous | Lowercase i has a separated dot |

The two external disagreement families therefore have different source explanations, but the same decision: for every tested cell, the original JPEG supports the existing repository token.

The original source's character shapes provide independent calibration: `2L` on `66.jpg` is 26×67; `2l` is 7×73; `2i` has two separate occupied vertical strips. In `67.jpg`, uppercase `S` is 41×69 and lowercase `s` is 28×44. In the same table typeface, uppercase `O` is 69×69 and the digit `0` is 48×69. In `68.jpg`, `0W` is 94×72 and `3w` is 66×46. These distinctions do not depend on OCR recognition or a preexisting transcription's case labels.

## Method and reproduction

[The executable original-image check](../sims/lp2_grid_11_glyph_adjudication.py) loads the three unchanged original scans, checks their dimensions, and slices each table row at its observed native geometry. It binarizes grayscale values below 90 and groups consecutive occupied pixel columns. Every selected row yields exactly sixteen groups, one for each printed character of its eight two-character tokens. For each disputed cell it inspects the **second glyph** independently of the transcribed token, measures the glyph's bounding-box width and height, and counts disconnected vertical strips to distinguish dotted `i` from capital `I`. An independently selected same-font comparison set calibrates `I/l`, `L/l`, `S/s`, `O/0`, `W/w`, and `I/i`.

The script verifies the existing source table literals at all eleven locations and asserts that the measured glyph class matches the image-visible reading. It requires Python, Pillow, and NumPy, reads the original JPEGs without altering them, and prints complete JSON with physical bounding boxes and same-image control measurements. It was successfully run on the maintainer-provided ZIP's original `66.jpg`–`68.jpg` files, with all eleven cases passing.

The analysis addresses **only these eleven publicly disputed source tokens**. The later original-font check covers every table cell, while leaving one-off glyph labels unadjudicated. JPEG-era font rendering and the source's original rasterization are integral to the stated pixel dimensions, so applying the exact thresholds to resized or re-exported images would invalidate this measurement.

## Full 256-token original-font consistency extension (11 November 2026)

The independent [font-wide original-image SFT](../sims/lp2_grid_fullfont_source_audit.py) checks the entire unchanged canonical table rather than the eleven disputed tokens alone. It extracts **512 glyphs** in **256 two-character tokens** across **32 source rows** of the original scans 66.jpg, 67.jpg, and 68.jpg. All 32 rows yield sixteen glyph masks. Scan 68.jpg row 0 requires splitting the printed 0J pair using its two distinct connected ink components because their horizontal projections overlap.

Each font class is defined by its printed transcription label and first/second-character position. The test compares original-pixel shapes to independent occurrences of the same character, then to the nearest competing character at the same position, tolerating one-pixel registration. A glyph is flagged if a rival class has normalized mismatch smaller than the nearest same-character mismatch plus 0.03. Of **512** glyphs, **509** have another printed occurrence of the same character in the same position; **zero** are flagged. The only **three** singleton second-character labels without same-class controls are R (cell 23), i (cell 72), and h (cell 126). Those remain unadjudicated by this test. **Independent original-image visual inspection** of the exact three source rows supports each printed singleton: 66.jpg row 2 ends in 1R with R's diagonal leg visibly present; 66.jpg row 9 starts 2i with the lowercase i's separated dot; and 67.jpg row 5 contains 2h with a tall ascender and curved shoulder. This original-pixel reading is a separate manual judgment, not an additional score from the automatic nearest-class test.

This confirms **no repeated-font inconsistency** suggesting an overlooked transcription error elsewhere in the printed table. It does **not** prove each unique glyph was read correctly, establish a numeric radix, or recover cryptographic key material. The check is self-supervised and conditioned on current transcription labels; the 509 covered glyphs are not 509 independent manual validations. The eleven previously disputed readings remain the separately adjudicated original-source facts above.

Reproduce with Pillow, NumPy and SciPy using the checked-in program [sims/lp2_grid_fullfont_source_audit.py](../sims/lp2_grid_fullfont_source_audit.py). It reads only the original three JPEGs and canonical table JSON, and emits a complete JSON summary of conflicts, singleton controls, and source rows.

## Historical 2014 `sexagesimal.bin` witness

The original solver archive `micheloosterhof/cicada-2014` records commit [`a9201dd`](https://github.com/micheloosterhof/cicada-2014/commit/a9201dd469a1a514eb0d8ff8f3449dbe2e7f7462), dated 2014-05-11 21:39:09Z, adding `decimal.txt`, `decimaltobyte.pm`, and `sexagesimal.bin` under the stage11 hidden-service directory. The Perl script packs each decimal line as one byte; the reconstructed 256-byte stream reproduces the archived Git blob SHA-1 exactly. An earlier 2014 commit contains three original `49.txt`/`50.txt`/`51.txt` token transcriptions, whose **256 upper two-character base-60 tokens reconstruct every later decimal value**. The original `50.txt` **lower corrected numeric** table already marks three stale upper-token errors at whole-table indices **165,170,172**, including both apparently noncase differences. The archive binary preserved the upper token values instead of applying the corrections; [source timeline and original-SFT](cicada2014-sexagesimal-upstream-transcription.md).

That historical 256-byte sequence is **not identical** to the later LP2 printed-token table. It differs at ten indices:

| Index | 2014 `sexagesimal.bin` | LP2 canonical | Difference |
|---:|---:|---:|---:|
| 25 | 224 | 198 | −26 |
| 45 | 81 | 107 | +26 |
| 50 | 21 | 47 | +26 |
| 165 | 47 | 18 | −29 |
| 170 | 194 | 254 | +60 |
| 172 | 174 | 148 | −26 |
| 175 | 44 | 18 | −26 |
| 182 | 141 | 167 | +26 |
| 199 | 21 | 47 | +26 |
| 246 | 224 | 198 | −26 |

Nine of these ten differences overlap the eleven LP2 cells adjudicated above; the 2014 file agrees with LP2 at disputed indices 215 and 237, and adds index 170 as another difference. This is a historical variant, not an authority for changing LP2 readings. The original LP2 JPEGs remain the primary evidence for the manuscript's printed tokens; the 2014 archive is a secondary solver-archive witness whose Git author dates are not independently authenticated.

The exact source transcription and byte reconstruction are preserved in [`resources/cicada2014-sexagesimal-source.json`](../resources/cicada2014-sexagesimal-source.json). Its raw bytes and the associated decimal text/converter do not directly match the p56 digest under the four tested 64-byte digest families. The source's possible role as a key or transformed input remains open.

## Retrospective GF(29) consistency gate for ten historical witness disagreements

The 2014 `sexagesimal.bin` witness supplies a second, imperfect historical reading of ten exact LP2 table glyph positions. The following **retrospective, conditional** check interprets all 256 printed bytes as **descending GF(29) polynomial coefficients**. The original manuscript contains a p39 red trinomial with double root **Ac = 24**, and a separate 13-dot stencil motivates examining stationarity at **13**. The complete original table satisfies **P(24)=P′(24)=0** and **P(13)=8, P′(13)=0**; 8 is also its column count. These are reproducible numerical relationships. **The polynomial representation, stationarity conditions and proposed parity locations were chosen with the complete original table already available.** No authenticated source instruction specifies that combination. Consequently its ability to discriminate among 2014 transcription variants is a within-source consistency result, **not an independently predicted key, a blind holdout test, or author-authenticated error correction**.

To test their discriminating power without fitting any free 256-byte key, treat the **ten historical disputed bytes** as binary choices: retain each old 2014 value or substitute the visually established LP2 glyph reading, leaving all other 246 coefficients fixed. There are exactly **2¹⁰ = 1,024** possible witness-mixed tables. The complete exhaustive source-input result is:

| Source-shaped equality imposed on each 256-byte candidate | Remaining mixed tables |
| --- | ---: |
| `P(24)=0` | **34 / 1,024** |
| `P(24)=P′(24)=0` | **4 / 1,024** |
| Plus `P′(13)=0` | **2 / 1,024** |
| Plus `P(13)=8` | **2 / 1,024** |

The four double-root combinations choose the new LP2 readings at positions **[25,45,182]**, **[25,45,165,182]**, **[25,45,50,170,172,175,182,199,246]**, or **all ten**. The full four-value checksum leaves only the last two choices, differing **solely at byte index165**. The original 2014 reading there is `0l = 47` and the LP2 scan prints `0I = 18`: **47 − 18 = 29**, so they represent the *identical* coefficient in GF(29). **No calculation solely over GF(29), including any derivative or polynomial factorization, can distinguish these two interpretations.** That remaining glyph must be resolved by original-image letterform, as independently done above.

| Source byte family | `[P(24),P′(24)]` | `[P(13),P′(13)]` |
| --- | --- | --- |
| 2014 `sexagesimal.bin` interpretation | [23,26] | [4,24] |
| LP2 original printed 32×8 bytes | **[0,0]** | **[8,0]** |
| Independent 2014 stage04 `<!--1033-->` site-hex witness, 256 bytes | [24,4] | [28,7] |

The site-hex comparison is a **separate source control**, preserved in [the original 2014 HTML](../resources/external/2014-stage04-index.html); it cannot be substituted silently for the LP2 numeral table. The readout confirms that the source-marked GF(29) constraints sharply discriminate among historically plausible glyph variants and identify **nine of ten** actual printed readings, while rigorously leaving one known modular ambiguity. It does **not** prove the puzzle creator intended those checksums, derive the unknown manuscript's cipher, or establish an LP2 key.

**Reproduction:** [single runnable source-input test](../sims/lp2_grid_2014_ten_glyph_critical_checksum_sft.cjs) reads the historical archived decimals and printed table, enumerates all 1,024 combinations using the exact original rune-indexed positions, checks every four-value equality, and positively asserts the GF(29) blind spot at byte165. This complements the visual source checks, which alone determine the actual printed characters.

### A completely executable, conditional four-parity encoding

The same four constraints above also specify an **invertible finite-field parity generator** for the printed p50 array, provided an encoder treats the **final four original cells** as parity. Write the 256 original row-major bytes as coefficients of `P(X)=c₀X²⁵⁵+...+c₂₅₅` modulo29. Given an arbitrary first **252** coefficients, choose the remaining four coefficients `a,b,c,d` of `aX³+bX²+cX+d` so that `P(24)=P′(24)=P′(13)=0` and `P(13)=8`. The 4×4 Hermite interpolation system is nonsingular because 13 and 24 are distinct in GF(29), so this is a complete **(256,252) systematic rune-residue code**, with exactly four parity symbols per block.

Given the four already-observed table-derived equalities and the original first 252 byte values, this conditional encoder algebraically reconstructs the final four GP29 residues **[6,7,15,22]** exactly. Because the equalities were identified using the full source table, this is **not a withheld prediction of previously unexamined original cells**. The printed final tokens are **`30 0a 39 1K`**, numeric bytes **[180,36,189,80]**; reducing them modulo29 independently gives **[6,7,15,22]**. Altering a known prefix residue violates the source checksum, and recomputing the uniquely determined parity restores every condition. The [self-contained original-input GF29 parity SFT](../sims/lp2_grid_marked_fourjet_systematic_parity_sft.cjs) includes these checks, two modified-payload positive plants, and the unresolvable byte165 47/18 field-equivalence.

**Exact error-correction limit, strengthening the architecture decision.** The resulting (256,252) linear-affine code over **only 29 distinct field symbols** is **not an ordinary maximum-distance-separable Reed–Solomon code**. Its homogeneous kernel has minimum Hamming distance **exactly 3**, proved without any cipher fitting. A three-coefficient change supported at original table indices **197, 225, 253** encodes the nonzero polynomial `(X^29−X)^2 = X^58−2X^30+X^2`: both marked values13 and24, and their derivatives, remain fixed. Thus two distinct complete tables **differing in only three printed residues** both pass all four four-jet constraints. A weight-1 solution is impossible because the evaluation points are nonzero; for a weight-2 polynomial `AX^i+BX^j`, simultaneous vanishing at13 and24 requires `14 | (i−j)` (since 13/24 = 9 has order14 in GF29), while double roots require `29 | (i−j)`. The smallest common positive difference is **406**, greater than maximum possible **255**. Hence distance3 is exact. The conditional code can detect up to **two** symbol errors, but only guarantee correction of **one** arbitrary symbol error. The [existing parity SFT](../sims/lp2_grid_marked_fourjet_systematic_parity_sft.cjs) explicitly checks this three-symbol counterexample. This further prevents treating four check symbols as proof of a strong error-correcting code intended by Cicada.

**One direct key consequence is already decided on the original ciphertext.** Treat those 252 source-derived information residues as a periodic mod29 additive pad, with the only two ordinary source origins (book start, physical page start) and both algebraic directions. The full 12,956-rune manuscript returns respective IoCs **0.034495914** (book subtract), **0.034510940** (book add), **0.034494389** (page subtract) and **0.034472142** (page add), essentially unchanged from the original **0.034478398** and well below native GP English. A planted complete GP29 message encrypted with this identical 252-symbol source pad round-trips exactly. Therefore the specific **systematic-payload-as-direct-repeating-GP-key** route produces no unknown plaintext and is retired; source-derived nonperiodic transforms still need their own independently visible instructions.

**Interpretation constraint:** The paper does **not** visually label the last four printed table cells as parity, and four independent linear checks can solve **any four independent coefficient locations** as unknowns. The demonstration is therefore an **exact candidate encoder** rather than proof of an intended Reed–Solomon code, and its predicted four residues do not recover four previously unknown plaintext runes. The first 252 residues have IoC **0.037184595**, inconsistent with ordinary unencrypted GP-native prose; if the construction is intended, its data block is still encrypted, compressed, a key, or otherwise encoded. One would need an independently visible table-framing instruction, checksum designation or downstream original-cipher inversion before promoting it as the actual LP2 decryption mechanism.

## Consequence for cryptanalysis

Five hypothetical grid-byte changes repeatedly described in earlier studies as *source-corrected* actually change correct printed glyphs into incorrect ones. Any reported plaintext candidate depending on one of those five changes needs independent source evidence, and the natural default for future key schedules is the unchanged printed-token table. Earlier negative experiments using both versions remain valid experiments on their stated inputs; their alternate-key results do not establish an alternate original byte stream.

This result removes eleven source-character uncertainties and one persistent false-correction assumption. It does **not** resolve whether the printed pairs are byte-encoded in radix 59, radix 60, or another intended numeric interpretation; it also does not imply that the resulting bytes are the cipher key. Further unknown-page inversion should begin with the actual printed tokens and require a source-motivated transformation.
