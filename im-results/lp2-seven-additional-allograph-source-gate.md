# Original-JPEG allograph source gate: sixteen selected classes beyond A/R/E

**Current original-source decision, 11 November 2026:** Fixed solved-page glyph images account for all **7,264 ordinary occurrences** of sixteen GP29 rune classes beyond the separately studied A/R/E classes. The seven remaining source-count instances of these classes are original-image enlarged red initials. The source evidence does not reveal an additional ordinary glyph-state alphabet, source-derived key, plaintext or decrypting operation. This is a bounded typographic finding.

## Exact source and method

Original inputs: 58 JPEGs (archive scans 17.jpg–74.jpg, physical p0–p57), the canonical `resources/liber-primus/lp2-corpus.json`, and the already-solved p56 scan 73.jpg. The normalized transcription supplies per-page expected rune counts; count agreement is conditional on that transcript and does not independently authenticate the entire transcription. Fixed rectangular, single-glyph crops from the solved image are compared with binarized source images (grayscale less than 160). Normalized correlation must be at least 0.90; spatial nonmaximum filtering and at most two-pixel tie deduplication avoid double-counting an adjacent maximum.

The previously reported C/NG/AE audit uses the p56 solved-page templates and its own image sensitivities. The seven-class audit uses the same source and a 105×36px nonmaximum region; it has one deduplicated J maximum on p20. The new six-class audit uses the same region with strict two-pixel spatial deduplication. In particular the p56 B glyph crop ends at x1361: extending it to x1377 includes a neighboring black punctuation mark and creates spurious mismatches on actual original pages. This false positive was corrected before evaluating the whole source.

| Classes | Source occurrences | Ordinary matched | Original-image enlarged red initials |
| --- | ---: | ---: | --- |
| C, NG, AE | 1,363 | 1,361 | NG p33:91; AE p56:0 |
| U, G, N, Y, F, J, IA | 3,204 | 3,201 | U p23:0; IA p39:119; F p40:0 |
| EO, X, S, B, OE, EA | 2,704 | 2,702 | X p8:0; S p0:0 |
| **Total (16 classes)** | **7,271** | **7,264** | **Seven marked initials** |

The six new classes, with original source counts and independent ordinary-image matches:

| Glyph | Source occurrences | Ordinary matches | Lowest accepted NCC |
| --- | ---: | ---: | ---: |
| EO | 400 | 400 | 0.93358 |
| X | 460 | 459 | 0.94142 |
| S | 442 | 441 | 0.94219 |
| B | 447 | 447 | 0.94064 |
| OE | 493 | 493 | 0.91785 |
| EA | 462 | 462 | 0.94018 |
| **Total** | **2,704** | **2,702** | |

The two new exceptions are the clearly oversized first red heading glyphs p0 S and p8 X, each visible as a large red symbol in its original scan. Every remaining page-by-class count matches exactly without a per-page template fit or ad hoc glyph exception. All 58 original images were tested using eight disjoint segments in the local supplied ZIP, and all six classes passed each segment. The standalone source test enforces the complete count if run on all 58 images, or a bounded segment if given `--start` / `--stop`; it checks the encoded class-count strings against the repository's canonical corpus whenever the latter is available.

The earlier seven-class complete original audit found 3,201/3,201 ordinary glyphs and scale-normalized red initial IoU **0.95183** (U), **0.96016** (IA) and **0.93360** (F), with minimum ordinary NCC between **0.91691 and 0.96683** across the seven classes. The earlier C/NG/AE audit accounted for 1,361/1,361 ordinary glyphs; it identified p33:91 as oversized NG and the following p33:92 as ordinary TH, resolving a previous crop-attribution error.

## Cryptanalytic consequence and limits

The tested letters show no repeated alternate **ordinary glyph morphology** large enough to defeat these fixed image templates. A decoder depending on a visually distinct binary glyph form in these classes now lacks a source-positive state signal at this resolution. This does **not** exclude subtle chromatic, DCT, punctuation, spacing, kerning, non-GP or steganographic image channels, nor does count equality demonstrate identical pixels. Neither this census nor the original author's intent selects a lossless operation on the 12,956 unknown runes. A fresh positive source clue is needed before proposing a font-state cipher.

**Not yet covered by this whole-source template census:** TH, O, W, H, I, P, T, M, L, D, as well as the three earlier A/R/E classes under their distinct source studies. The other ten ordinary classes had ambiguous local template partial matches and were not promoted to exact allograph exclusions. In particular short vertical/diagonal motifs such as I and L need full-glyph alignment to avoid incidental hits inside other runes.

**Reproducers:** `sims/lp2_selected_allograph_original_sft.py` (C/NG/AE), `sims/lp2_seven_additional_allograph_sft.py` (U/G/N/Y/F/J/IA), `sims/lp2_six_more_allograph_sft.py` (EO/X/S/B/OE/EA). The new reproducer operates directly on the original provided ZIP with `--archive`.
