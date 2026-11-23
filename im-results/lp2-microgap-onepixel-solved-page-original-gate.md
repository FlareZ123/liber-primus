# One-pixel rune-kerning receiver with solved-page controls

**Agent35, 23 November 2026. Intermediate original-JPEG negative, not recovered unknown plaintext or an authored cipher.** Earlier original-image work ruled out a conspicuous +4px spacing bit but explicitly left 1–2px variation unexamined. I investigated that narrower open possibility using the unmodified p0–p57 JPEGs and the original p9 rune medoids. This is a source-faithful test of *two literal bit readings*, rather than a search for a favorable decipherment key.

## Source operation

The human-visible motivation is Cicada's documented use of whitespace steganography in earlier rounds. Use the same image segmentation, grayscale threshold, glyph classifier, alphabet and original source p9 training positions as [the whole-book ≥4px check](lp2-original-allpage-rune-gap-hidden-bit-gate.md). Keep ordered physical page, printed line and left-to-right glyph sequence. Group each printed gap by **(short rune-gap versus ordinary word-gap, preceding GP rune, following GP rune)**. Retain group occurrences only when that exact printed glyph-pair class occurs at least three times. Two deterministic one-bit encodings are:

* **High-mode:** bit1 iff the source gap is strictly greater than the class's modal measured gap; ties select the smaller modal gap.
* **Pixel parity:** bit1 iff the literal native pixel gap is odd.

Pack each bitstream MSB-first, starting at the first original eligible event. Extract the runic-gap channel, word-gap channel and combined chronological channel, without choosing a phase, skipping awkward bits or adapting to readable output. No source instruction authenticates either bit convention or asserts that 1px is meaningful.

Use original solved p56/p57 JPEG text as an **independent layout control**. For each of its eligible glyph-pair observations, resample an equal-class original unknown-page gap from that exact ordered source class (10,000 fixed-seed trials). This asks whether apparent 1px high-mode deviations are exceptional in the two genuinely readable pages using exactly the model fitted on ciphertext pages.

## Actual original-JPEG observations

The raw glyph segmentation matches the earlier original: **11,822 image components, 11,715 classified** in unknown physical pp0–55. The order-only scanner admits **10,928** rune/word gaps, one more than the earlier 10,927 precisely source-index-aligned gaps; the additional inclusion is an honest methodological difference and cannot change these aggregate results. **10,378** of the order-only gaps belong to repeatedly observed pair classes. The original gap range among 1,252 repeated classes remains at most2px: short-gap ranges 0/1/2px occur in **92/556/166** classes, word-gap ranges in **123/272/43**.

| Fixed reading | Rune gaps | Word gaps | Combined |
| --- | ---: | ---: | ---: |
| Eligible bits | 8,564 | 1,814 | 10,378 |
| High-mode bit1 fraction | 0.147478 | 0.151599 | 0.148198 |
| Pixel-parity bit1 fraction | 0.517982 | 0.512128 | 0.516959 |
| High-mode bytes, printable fraction | 1,070; **27.57%** | 226; **31.86%** | 1,297; **26.99%** |
| Parity bytes, printable fraction | 1,070; **39.63%** | 226; **37.17%** | 1,297; **36.24%** |

None of the **six** frozen MSB-first byte prefixes has an ASCII document instruction or recognizable BZip2, ZIP, gzip, PDF or PGP header. The high-mode channel is sharply biased toward zero bits, consistent with modal-gap rasterization. The parity channel has near-balanced bits but appears bytewise high entropy rather than readable prose. These conclusions do not extend to a secret mask or unknown file framing.

The two solved controls contain **76** accepted rune/word gaps, of which **65** have exact repeated pair classes in the original unknown corpus. **9/65** solved gaps exceed their unknown-page class mode, against **1,538/10,378** in unknown pages. The exact-pair matched 10,000-trial source-resampling control gives median **8** and empirical two-sided tail approximately **0.83** for the solved-page count9. Thus the same small print deviations appear in independent genuine cleartext pages and offer no evidence of an encryption-specific bit channel.

An additional, layout-based diagnostic compares the original gap span against the **start-x advance** span for each repeated glyph pair. Among 722 variable short-gap classes, **90** have *zero* advance spread despite 1–2px gap variation; among 315 variable ordinary word-gap classes, **64** similarly have zero advance spread. The gap variability can be offset by rune bounding-box-width variation while source glyph-start spacing remains exactly fixed. This is direct evidence of ordinary glyph rendering/raster rounding in at least those classes; it does not prove that every remaining ±1px deviation is natural.

## Decision and limits

No original plaintext, payload bytes, first-party bit encoding or useful key has emerged. A **direct** fixed MSB-first 1px high-mode or parity ASCII carrier is unsupported; the solved-page matched control disfavors treating ordinary one-pixel residuals as unusual ciphertext-specific evidence. A sophisticated source-selected subpixel, DCT, or phase-coded payload remains logically possible. Further gap-bit fitting without an independently visible author selector or a heldout readable prediction is low priority. Preserve the original JPEGs and the complete classified inventory without promoting this to an established decipherment.

**Reproducer:** [read-only Python 3.12 / NumPy / Pillow SFT](../sims/lp2_microgap_1px_original_solved_controls_sft.py), extending the original validated image-first alignment audit, invoked from the repository root as a single script. The SFT reconstructs the six raw streams, prints SHA256 witnesses, uses one fixed solved-pair-matched 10,000-draw calibration and performs no file writes. This result was independently prototyped on the identical maintainer-provided 75-JPEG archive; a CI invocation of the committed SFT has not yet been performed.
