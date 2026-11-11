# LP2 punctuation identity stream: source-audited inventory, not a decryptor

## Decision

The 180-event derivative transcription is **not** a homogeneous 180-mark original-ink stream. The four p15 numeric-row terminators (event indices 57–60, page-local offset 9 / global rune offset 3,612) remain transcription-only editorial markers, as established by the prior p15 image audit. The remaining 141 `⁘` stops and four `⁚` commas were checked against the original JPEGs.

| Derivative class | Source morphology | Count | Source disposition |
|---|---|---:|---|
| `⁘` | Four-dot diamond | 138 | 137 black, 1 red; all geometrically consistent |
| `⁘` | Three-dot comma-form | 1 | Physical, but morphology matches the comma class |
| `⁘` | Single detached square | 1 | Physical dot visible; stop-vs-separator and rune alignment ambiguous |
| `⁘` | No corresponding mark | 1 | Absent on original p37 line 4 |
| `⁚` | Three-dot zigzag | 4 | All four physically present |

The 138 four-dot clusters fit the same diamond geometry (normalized shape error 0.000063–0.001257). The five three-dot marks share the same alternating vertical zigzag morphology: four are transcribed as commas, while one (event 127, p38 line 2, offset 28) is transcribed as a stop. Do not silently recode that event; preserve its derivative symbol and flag the source-form mismatch.

Thus **144 of the 145 audited small events have a visible source mark**. The 145 rows resolve to 138 diamonds, five three-dot forms and one ambiguous singleton, with one stop event absent. Together with the separately established 31/31 large `⁜` image-annotation matches, the source contains 175 visible mark instances (31 large + 138 diamonds + 5 three-dot forms + 1 ambiguous singleton). The original 180 transcription events decompose into those 175 visible marks plus five nonphysical events: four p15 editorial row terminators and one absent stop.

## Exceptional placements and controls

| Event | LP2 page / transcription line | Local rune offset | Physical placement | Finding |
|---:|---|---:|---|---|
| 35 | p10 / line 8 | 174 | JPEG 27, line 9, x≈621 | Four-dot stop printed at the next line's left edge |
| 64 | p16 / line 11 | 245 | JPEG 33, line 12, x≈621 | Four-dot stop printed at the next line's left edge |
| 72 | p19 / line 2 | 47 | JPEG 36, line 3, x≈621 | Four-dot stop printed at the next line's left edge |
| 75 | p20 / line 6 | 134 | JPEG 37, line 7, x≈610 | Three-dot comma printed at the next line's left edge |
| 91 | p27 / line 7 | 144 | JPEG 44, line 7, x≈1781 | One square only; source-to-rune-offset association is ambiguous |
| 125 | p37 / line 4 | 91 | JPEG 54, line 4 | No stop after the final rune or at the following line's left edge |
| 127 | p38 / line 2 | 28 | JPEG 55, line 2, x≈891 | Three-dot comma-form, despite derivative `⁘` label |

The red four-dot diamond is event 26 (p7 line 10, offset 200; JPEG 24, bbox [1061,2494,1101,2537]). It is embedded in the red text line and is separate from the flanking 13-dot red stencils. Black-diamond control: event 1 (p0 line 8, offset 154; JPEG 17, bbox [809,2026,849,2069]). Comma control: event 17 (p5 line 5, offset 110; JPEG 22, bbox [1759,1461,1785,1504]). The p38 three-dot stop-form, p27 singleton, p37 absence, all four line-wrap placements, and the red mark were visually adjudicated; the other event rows were checked by the same component pipeline. No event indices were collapsed.

The CSV preserves every event index, LP2 page, transcription line, physical line, page-local rune offset, pixel centroid/bounding box, component centers, color, morphology, status and uncertainty: [source audit CSV](lp2-punctuation-source-audit.csv.gz). The source inventory JSON retains its original `events` array and now carries a provenance/summary `source_audit` field: [punctuation identity inventory](../resources/liber-primus/lp2-punctuation-identity.json).

## Reproduction

From the repository root, install `numpy`, `scipy` and `opencv-python-headless`, then run:

```bash
python3 sims/lp2_punctuation_source_audit.py
gzip -dc im-results/lp2-punctuation-source-audit.csv.gz | head
```

The script reads `resources/lp2-transcription.txt`, `resources/liber-primus/lp2-punctuation-identity.json` and original JPEGs 17–72. It uses grayscale threshold 130; candidate components are 6–14 px square, 35–180 ink pixels, fill ratio at least 0.55 and aspect ratio 0.65–1.5; components within 25 px are grouped. The seven explicit line-centre overrides are documented in the script because short lines and marginal illustrations defeat a uniform projection threshold. Four known line-wrap placements are kept as separate event rows with both transcription and physical line numbers. The p27 singleton and p37 absence are explicit manual exceptions, not silently forced into a diamond count.

The existing `sims/lp2_punctuation_identity_stream.cjs` still reproduces the derivative event inventory and the separate 31 large-mark cross-match; it does not establish the physicality of the small marks.

## Cryptanalytic consequence

The 30×6 table interior, the 180 standard primes p21–p200 and the 85+95 solved-page tail still equal 180 at the **transcription-inventory** level. They do not establish a physical 180-mark stream or select a key clock: four row terminators are editorial, one stop has no source mark, and the small forms are heterogeneous. Direct ternary grouping, prime/grid arithmetic and punctuation-delimited Caesar/totient tests remain non-decryptions. Any future cipher use of these marks must specify independently why the editorial and absent events are included and what operation the distinct morphologies select. No plaintext, key or intended continuation is recovered here.
