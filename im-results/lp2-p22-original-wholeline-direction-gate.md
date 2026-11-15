# LP2 p22: source-native text reading direction versus mirrored footer

**Agent3, 15 November 2026, Director [#1009](https://github.com/FlareZ123/liber-primus/issues/1009).** The original p22 corpse figure is a verified horizontal mirror of the solved LP1 p14–16 footer. The original **runic text above the figure does not itself carry a corresponding reversal**: all six lines retain conventional left-anchored paragraph composition, the last line is shorter on the right, the original glyphs remain unreflected, and neither punctuation nor section boundary supplies a specific alternate line-reading order. **No plaintext, creator key, or source-selected text permutation is recovered.** This is a bounded source-reading decision, not an exclusion of every possible reverse-reading cipher.

## Exact original artifacts and the discriminating image observation

Only the stable original JPEGs and transcriptions were used:
- Source LP2 p22: `resources/liber-primus/39.jpg`, **512,143 bytes**, SHA-256 `e232eb4649f89125d0edeab7022cbe189185d46ccbf0823fd964b6e71e9bafe7`.
- Solved LP1 p14 comparison: `resources/liber-primus/14.jpg`, **625,668 bytes**, SHA-256 `de2bebe1d06421d94f3dd2b2b5f838ee4cdb5f51b07b14e880e0108f7b79c14e`.
- LP1 p15 and p16 reuse the same original footer figure as p14. The prior original-art study established a horizontal reflection with **443/453 SIFT matches** and registered **0.992524** gray correlation; its independent image-registration test found no added high-contrast figure instruction. See [source-plate decision](lp2-p22-corpse-source-plate-decision.md). The separate GP29 glyph study correctly recognized **131/131** unreflected p22 rune glyphs using the frozen unmirrored source gallery, while reflecting individual glyphs collapsed 29 source classes to **17 output classes**. See [literal reflection control](lp2-p22-literal-glyph-reflection-original-gate.md).

The [new original-JPEG line-direction SFT](../sims/lp2_p22_original_text_reading_direction_sft.py) SHA-locks both images, uses the established p22 six line centers, and counts dark pixels in one fixed horizontal frame `x=500..1999`, each `y_center±85`, grayscale threshold less than 125, with at least five dark pixels of column support. The exact source-side spans are:

| p22 source line | Center y | Leftmost ink x | Rightmost ink x | Width px |
|---|---:|---:|---:|---:|
| 1 | 727 | 601 | 1772 | 1172 |
| 2 | 915 | 600 | 1766 | 1167 |
| 3 | 1077 | 601 | 1778 | 1178 |
| 4 | 1267 | 601 | 1762 | 1162 |
| 5 | 1485 | 601 | 1779 | 1179 |
| 6 | 1711 | 601 | 1668 | 1068 |

The six source lines start at **x=600 or x=601**, independent of their width. Line six ends **at least 94 original image pixels sooner on its right** than any earlier line. This is conventional **left-anchored, right-ragged final-line** typesetting. A source selected right-to-left line reversal would need an additional, previously unspecified reading-order instruction, since the mirrored footer is visually separate from this normally composed text block. Reversing every glyph's physical orientation is separately excluded by the earlier unmirrored 131/131 source control.

The full-resolution original visibly places **one double quotation mark inside text line four and one inside line five**, preserving a quoted passage across normally ordered lines. The derived `resources/liber-primus/lp2-transcription.txt` drops these two non-rune quotation marks, so the JPEG is the controlling source for punctuation-direction decisions. Their shapes alone do not mathematically prove left-to-right reading, since a full page reverse could also interchange opening and closing. They provide no positive right-to-left cue. The last line also ends in the original red vertical dot ornament, in the ordinary source-visible position of a section terminator.

## Exact implications and Director decision

**Established:** LP1→LP2 figure mirroring is a real internal illustration reuse. **Source-constrained reading:** the p22 text is presented in conventional left-anchored glyph orientation and page order, so the mirror gives no positive selection of right-to-left, bottom-to-top, line-order reversal, or a particular start marker. **Unestablished:** whether any creator separately intended a non-obvious text permutation. No original author instruction, key, known plaintext anchor or holdout is identified to distinguish these permutations, and the same artwork appears on three solved LP1 pages whose paragraphs differ.

A literal reverse of complete ciphertext lines is an invertible **permutation of rune positions**. It cannot independently change native GP29 rune frequency, so it does not explain LP2's near-uniform GP29 ciphertext or generate plaintext without an additional, source-selected value-changing cipher. Such an extra key is currently missing. We deliberately **did not** fit a new key, select one line reversal for language score, or interpret output as a decryption.

[Passing manual original-raster CI](https://github.com/FlareZ123/liber-primus/actions/runs/43669095714) reproduces the exact six spans, SHA values and last-line margin. Close Director #1009 as **no source-selected whole-line reversal**; retain only the true artwork reflection as a cross-release correspondence. Revisit only if a genuinely new original instruction specifies a textual order *and* a decryption operation against which an unseen interval can be checked.
