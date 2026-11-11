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

The 138 four-dot clusters fit the same diamond geometry (normalized shape error 0.000063–0.001257). The five three-dot marks share the same alternating vertical zigzag morphology: four are transcribed as commas, while one (event 127, p38 line 2, offset 28) is transcribed as a stop. The original inventory retains its derivative symbol; the separate clause-length test below uses the pixel-audited three-dot morphology to classify event 127 as a comma for that test only.

Thus **144 of the 145 audited small events have a visible source mark**. The 145 rows resolve to 138 diamonds, five three-dot forms and one ambiguous singleton, with one stop event absent. Together with the separately established 31/31 large `⁜` image-annotation matches, the source contains 175 visible mark instances (31 large + 138 diamonds + 5 three-dot forms + 1 ambiguous singleton). The original 180 transcription events decompose into those 175 visible marks plus five nonphysical events: four p15 editorial row terminators and one absent stop. The 31 large marks comprise 28 thirteen-dot and three ten-dot records; only the thirteen-dot subset is used as a unit boundary in the clause-length experiment, with same-offset duplicates collapsed.

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


## Historical clause-length crib gate (Issue #349; bounded negative)

The target is frozen from the original-pixel inventory, not from the derivative event count. It uses 138 four-dot stops, five three-dot comma-form marks (the four original ⁚ records plus event 127, whose physical three-dot morphology is comma-form), and 28 thirteen-dot records at 26 unique rune offsets. The four editorial p15 events, absent p37 stop, ambiguous p27 singleton and three ten-dot marks are excluded. Deduplicating same-offset thirteen-dot marks yields **169 intervals over exactly 12,956 runes**. The interpretation of a thirteen-dot mark as a unit boundary is a test mapping, not an established semantic claim.

The finite source corpus is the same 13 historical/source texts already indexed for the prior word-length work; no #333 candidate locations were used. The normalizer counts ASCII alphabetic words by the existing GP-length rule (QU→CW, V→U, K→C, Z→S; greedy TH/EO/OE/AE/IA/EA/NG and ING contractions, per word). In prose, period/exclamation/question mark is S, comma is C, and a blank paragraph is U; single newlines are ignored, as are semicolons and colons. Leading verse-number N. labels are removed from the three Book of the Law files. The 2013 0-wisdom first prose paragraph is counted directly in GP runes, with ⁘ as S and ⁜ as U. PGP headers/signatures and onion-address labels are removed from signed-message files; the 2012 Blake excerpt delimiters and Marriage of Heaven and Hell line-end hyphenation are handled as in the source corpus loader. Source SHA-256 values are emitted by the reproducer.

| Source | GP words | Source intervals | Longest exact run |
|---|---:|---:|---:|
| LP1 plaintext reference | 780 | 63 | ≤1 |
| 2012 Blake chorus | 56 | 10 | ≤1 |
| 2012 Marriage of Heaven and Hell excerpt | 120 | 15 | ≤1 |
| 2012 countdown message | 19 | 4 | ≤1 |
| 2012 MIDI 49-word list | 49 | 1 | ≤1 |
| 2013 forest clue | 15 | 2 | ≤1 |
| Book of the Law I | 1,897 | 270 | 2 |
| Book of the Law II | 1,968 | 285 | 2 |
| Book of the Law III | 2,002 | 234 | 2 |
| 2013 0-wisdom prose | 16 | 4 | ≤1 |
| 2014 Stage11 message | 14 | 4 | ≤1 |
| 2016 4gq25 OutGuess message | 45 | 10 | ≤1 |
| 2017 yEiTHhvF message | 10 | 2 | ≤1 |
| **Total** | **6,991** | **904** | **2** |

The only boundary-type-exact two-interval match is in Book of the Law I, source events 43–44 (zero-based after normalization): lengths **54, 36**, stop→stop, matching LP2 intervals 114–115 at global rune offsets **8423–8477** and **8477–8513** (physical pages 34–35). The source text is I:20–21: “The key of the rituals is in the secret word which I have given unto him” followed by “With the God & the Adorer I am nothing: they do not see me.” This is only a two-length coincidence, not a recovered plaintext. The second clause's 36 count depends on counting & as zero alphabetic letters and ignoring its colon; expanding & to AND gives 39, while treating the colon as a boundary splits it into 23 and 13. These source-format choices make the apparent fit fragile.

The next two source intervals were withheld from selection. They are **25, 23** with comma→comma boundaries, predicting LP2 boundaries **8538, 8561**. The untouched LP2 intervals are **431, 189**, stop→stop, ending at **8944, 9133**. The two-event continuation fails in both lengths and types. Book of the Law II has a length-only 14,16 pair but its source comma→stop types do not match LP2 unit→unit; Book III has a length-only 21,21 pair but its comma→comma types do not match LP2 stop→stop. An unrelated Gibran control also reaches a two-interval length-only match.

Controls validate the GP length mapping at word level: LP1 page 1 **45/45**, solved p56 **25/25**, solved p57 **20/20**. The independent 2013 0-wisdom prose control gives raw runic segment lengths **10,17,24,23** against expected GP lengths **10,17,25,23** (3/4 exact); the one-rune discrepancy is retained, not tuned away.

The observed maximum is **two intervals** (both length-only and type-aware). Two deterministic 2,000-trial nulls preserve the finite source corpus: (1) shuffle GP-word lengths within each source while holding punctuation positions fixed; (2) hold word order fixed and relocate the same number/types of punctuation boundaries to random word gaps. For both nulls the length-only add-one upper-tail probability is **1.0**; type-aware probabilities are **0.9260** (word-order) and **0.9075** (punctuation-position). The six-interval seed count is zero. Thus the finite corpus supplies no statistically distinctive or independently extended plaintext crib. This rejects only the tested preserved-clause-length route, not every possible use of punctuation or external source material.

Reproducer: node sims/lp2_punctuation_clause_length_crib_sft.cjs. It emits the full source manifest with SHA-256, per-source maxima, strongest two-event holdout, control comparisons and seeded null histograms.

## Cryptanalytic consequence

The 30×6 table interior, the 180 standard primes p21–p200 and the 85+95 solved-page tail still equal 180 at the **transcription-inventory** level. They do not establish a physical 180-mark stream or select a key clock: four row terminators are editorial, one stop has no source mark, and the small forms are heterogeneous. Direct ternary grouping, prime/grid arithmetic and punctuation-delimited Caesar/totient tests remain non-decryptions. The new finite historical clause-length screen reaches only two intervals; its sole type-exact Book of the Law I:20–21 pair fails the immediate two-event holdout, depends on fragile source punctuation treatment, and is unexceptional under 2,000-trial within-source nulls. Retire only this preserved-clause-length crib route. Any future cipher use of these marks must specify independently why the editorial and absent events are included and what operation the distinct morphologies select. No plaintext, key or intended continuation is recovered here.
