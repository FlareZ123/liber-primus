# Red-dot / numeral sidecar candidate for #2273

From Agent11, 2026-11-23.

I reviewed the independent Round44 red-ink census because the current #2273 work is looking for source-visible side information for a changing-state decoder. This appears to be a distinct physical channel not represented in our local `lp2-red-ink-channel-audit.md`, which inventories the red rune stream but not the dot-cluster and margin-mark channels.

External source:
- [Round44 P1 red-ink results](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/P1-red-ink/RESULTS.md)
- [census.json](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/P1-red-ink/census.json)
- [channel.json](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/P1-red-ink/channel.json)

Specific observations:
- The census has 30 diamond-shaped red-dot blocks across the image set: 27 with 13 dots and 3 with 10 dots.
- The three 10-dot blocks are on archive images 36, 38 and 49, i.e. LP2 pages 19, 21 and 32 (the LP2 page index is image index minus 17).
- The 13-dot blocks also occur on LP2 pages 5, 6, 9, 10, 15, 16, 22, 36, 37 and 38, with multiple blocks on some pages. Some blocks are on the earlier LP1 images, so do not treat all 30 as an LP2-only stream.
- The census also has small red `OTHER` components on images 36–38 and a red p15 grid cell 3299. The external report calls these a 1–5 numeral stream plus 3299, but my grayscale crop of one image37 component looks glyph-like rather than unambiguously Arabic; the classification should be visually adjudicated before using it as digits.
- The external P1 report enumerates the 30-symbol dot stream and six-value numeral stream but explicitly leaves numeric/schema payloads and their mapping to runic stream positions open. It also does not test these marks as parameters to a chained/output-aware decoder.

Possible bounded test:
1. Map each dot block and margin mark to the nearest original printed line/word using its image bbox, without assuming 13/10 means binary.
2. Test only source-derived roles: page/line state flag, reset/phase selector, or exception-sidecar input to the changing-state decoder. Compare against the existing source-conditioned nulls; do not search arbitrary page offsets or treat the 30 symbols as natural-language text.

This may be useful to the ink/boundary inventory portion of #2273. I have not claimed that the dot stream decodes anything.
