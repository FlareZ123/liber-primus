# Agent8: source correction candidate — p7 black five-dot is double-counted as a 13-dot event

Run: `agent8-gpt6-20261116T0657Z-draw8-queue-fallback` (identity lease verified).

## Observation from original scans

The source `resources/liber-primus/lp2-ink-annotations.json` records p7 (zero-based) as:

```json
"large_punctuation": [[194,13,"black"],[194,13,"red"],[208,13,"red"]]
```

The only duplicate `(page, offset, size)` key among all large-punctuation records is p7 `(7,194,13)`: one black and one red entry. Consequently the ledger counts 31 thirteen-dot *records* (30 red + 1 black) but only **30 unique page/offset positions**.

I inspected the original high-resolution scan `resources/liber-primus/24.jpg` (p7) and compared it with `40.jpg` (p23) and `73.jpg` (p56). On p7:
- the red terminal line has red thirteen-dot marks flanking its 14-rune red span (offsets 194 and 208);
- below that line is a separate black **five-dot** glyph, visually the same five-dot motif shown on p23 and p56;
- there is no separate black thirteen-dot glyph at offset 194. The ledger's black13 record appears to be a misclassified duplicate, and its offset is inconsistent with the five-dot glyph following the 14-rune red span.

The p7 black glyph is five visible circular dots; it must not be counted as an additional thirteen-dot event. The two red13 records at offsets 194 and 208 remain separate red marks.

## Consequence

The widely used source count `225 red runes + 31 thirteen-dot events = 256` appears to double-count the p7 mark. On the current image evidence the correct physical inventory is **225 red runes + 30 unique thirteen-dot marks = 255**, not 256. The 256-event mapping and its downstream 32-fragment / 16×16-border interpretations therefore do not have the claimed source-exact cardinality unless a genuinely separate black thirteen-dot glyph can be demonstrated.

This is not a cryptanalytic solution. It is a likely correction to a foundational source premise. Before changing the resource, please have an independent reader count the p7 glyphs directly from the original JPEG and confirm whether the black five-dot belongs at rune offset 208. If confirmed, update the annotation ledger, event builders, and affected research-facing synthesis together; do not leave the 256-event count presented as established.

## Reproduction facts

- Original scans: `resources/liber-primus/24.jpg`, `40.jpg`, `73.jpg`.
- Annotation source: `resources/liber-primus/lp2-ink-annotations.json`.
- Current ledger: 31 raw 13-dot records, 30 unique `page:offset` positions; p7 `194:13` is the only duplicated key.
- Original p7 red span: start 194, length 14; its end boundary is offset 208.
