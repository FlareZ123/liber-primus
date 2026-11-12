# Original LP2 p2 literal glyph-reflection gate

## Decision

The physically mirrored segmented-arthropod artwork on LP2 p2 (19.jpg) establishes a real cross-page visual echo of LP1 p9 (09.jpg), but **reflecting each individual p2 rune horizontally does not induce a usable GP29 alphabet or recover text**. The trained pixel-to-rune mapping has only **17 distinct output symbols for 29 input symbols**, and the original 201-rune paragraph remains nonlinguistic under the complete fixed mapping. This retires this **literal rune-glyph reflection** interpretation, without deciding whether the artwork has a different function.

**Source and causal premise:** Issue [#468](https://github.com/FlareZ123/liber-primus/issues/468) is based on the source-image artwork identity found in [#450](https://github.com/FlareZ123/liber-primus/issues/450); a human reader could reasonably infer horizontal reflection, but it must act reproducibly on the 29-rune original.

**Reproduction:** Run 'python sims/lp2_p2_literal_glyph_reflection_sft.py' with NumPy, Pillow and SciPy in the repository root. The script reads both original 'resources/liber-primus/19.jpg' (LP2 p2) and '74.jpg' (already-solved p57), obtains boundaries and labels from the pinned 'lp2-transcription.txt', and emits the complete 201-position input/match/confidence record and whole-paragraph transliteration as JSON on stdout. Source text is used for labels, never to generate the transformed glyphs.

## Frozen image test

1. Threshold actual JPEG grayscale below 110 and separate glyphs by original column projection. Nine p2 line centers are fixed to [700,888,1077,1269,1453,1638,1830,2016,2205]; all nine detected rune counts match **[21,24,22,25,23,21,24,22,19]**, summing to **201**. The one artistically joined cluster in row 0 (H/B/M) is divided using the independent pre-existing source assignment rule (2,0), component9, upper 33px trim and vertical cuts [47,86]. All 29 symbols occur in the resulting 201 glyphs.
2. Use original unmirrored p2 rows 1–7 as labeled templates: **161 glyphs**, all 29 classes. Classify each crop against the 29 classes by maximum black-pixel intersection-over-union (IoU), with the same tight-box alignment and up to 1px registration shift. The entire test uses this one rule without per-symbol repairs.
3. Positive controls: ordinary unmirrored p2 templates classify **159/161** correctly when their own example is excluded. Held-out p2 rows 0 and 8 classify **40/40** correctly. Independently segmented black body glyphs on solved original p57 (74.jpg) classify **65/65** correctly, after excluding its seven red differently stylized heading runes. Ordinary p2 leave-one-out median top-match IoU is **0.983651**.
4. Horizontal-flip all **201** original individual rune crops before matching the frozen unmirrored 161-template gallery. Mirrored top-match median IoU is **0.633996**; only **85/201** meet even IoU 0.9. A class map fixed by modal mirror prediction on training rows maps 29 rune classes to **17** destination classes. On the 40 held-out rune crops, only **34/40** nearest mirror labels agree with the frozen class map. These are systematic shape-match ambiguities, rather than punctuation or prose-crib issues.
5. Apply the class map to the entire 201-original-rune paragraph in its printed order, retaining word separators, punctuation, and row boundaries. The complete output begins 'OEE-M.HT-OEEOXDHOEE-EAGOE-NHOEEGEO' and ends 'XMXTOEOEJE-XEA-HDNIAMEOMX.'. The SFT prints the full output and the complete 29-symbol mapping. It is not coherent GP-English; importantly the same fixed map is **noninjective**, so it cannot itself be a lossless original-cipher inverse.

## Exact source mapping

The frozen training-row modal map is:

| Input | ᚠ | ᚢ | ᚦ | ᚩ | ᚱ | ᚳ | ᚷ | ᚹ | ᚻ | ᚾ | ᛁ | ᛄ | ᛇ | ᛈ | ᛉ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Predicted | ᛉ | ᛗ | ᛄ | ᛋ | ᚷ | ᛉ | ᚷ | ᛉ | ᚻ | ᚾ | ᛁ | ᛄ | ᛇ | ᛖ | ᛉ |

| Input | ᛋ | ᛏ | ᛒ | ᛖ | ᛗ | ᛚ | ᛝ | ᛟ | ᛞ | ᚪ | ᚫ | ᚣ | ᛡ | ᛠ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Predicted | ᚩ | ᛏ | ᛟ | ᛖ | ᛖ | ᛉ | ᛝ | ᛟ | ᛞ | ᛟ | ᛋ | ᛗ | ᛡ | ᛠ |

The original reflected raster is an exact reversible image operation (flipping twice restores its pixels); the lossy part is forcing those reflected shapes into the unchanged GP29 rune inventory. The strongest rival explanation is a decorative motif or an instruction operating on a non-GP29 alphabet, which this finite gate does not exclude. No plaintext, historically authenticated key, or new cipher is claimed.

**Next decision:** do not re-run p2 reverse-order, Atbash, or pixel-template variants absent an independent source indicating a different destination alphabet or a reversible geometry-to-symbol rule. Cross-page artwork identity may still motivate an independently specified operation on another layer.
