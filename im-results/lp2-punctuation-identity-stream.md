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

### Complete red-ornament original-pixel shape gate (13 November 2026, Agent 2)

A read-only source-pixel audit of **all 58 original LP2 JPEGs**, using connected red-square components rather than the derived rune/mark transcription, independently recovers **35 red large ornaments: 30 thirteen-dot, four ten-dot, one terminal twenty-three-dot**. Together with the separately annotated **one black thirteen-dot** ornament, these are the same **36** large colored/black shapes in the 58-page source inventory. Restricting to unknown p0–55 leaves **28 thirteen-dot + three ten-dot** source boundary records, as already counted above. The solved p56/p57 pages supply two more thirteen-dot marks plus one ten-dot and one thirteen-dot/twenty-three-dot pair. The original index counts remain unchanged.

Each color mask requires red-channel intensity >75 and red >2× both green and blue. The OpenCV connected-component gate freezes dot area 45–135px and dimensions 6–13px; dots are grouped by Euclidean centroid separation ≤57px, keeping clusters of ≥6 points. **Every one of the 30 red thirteen-dot ornaments contains exactly 13 small squares, and every red ten-dot ornament exactly ten.** After translation normalization, each thirteen-dot and ten-dot motif has nearest-neighbor centroid RMS **below 0.71 pixels** relative to its first same-class exemplar. The sole terminal 23-dot motif is distinct. The source annotation and image-derived **per-page, per-class counts agree exactly**. A synthetic translated 13-square plant preserves shape, while removing one square changes its identified count.

**Decision:** there is no per-instance *missing-square or displaced-square* bit pattern in these red stencil glyphs under the source-exact geometric test. This rules out one simple hidden payload channel in glyph shape, while leaving punctuation **position, class (10/13/23), black-versus-red ink, and nongeometric pixel steganography** untested. The test supplies no decoding instruction or unknown LP2 plaintext. [Single-file reproducible original-JPEG census](../sims/lp2_large_red_stencil_pixel_sft.py).

## Large-mark boundaries and 32-fragment reset-clock limit (#484, 12 November 2026)

A distinct original-rune state-clock objection follows from the source-matched `large_mark_alignment` inventory (without reconstructing the already-audited glyphs). The **31** large marks occupy **29 distinct** zero-based rune offsets because two consecutive marks coincide in transcription/runic space: at **1860** (p7 local194, black13 followed by red13) and **3603** (p15 local0, adjacent 13-dot terminal/opening marks). The final 13-dot mark is at **12956**, exactly after the last unknown LP2 rune. Therefore treating all 31 markers as ordered cuts of the original 12,956-rune stream yields a nominal **32** intervals containing **three empty rune intervals**, including the two same-offset interior intervals and the zero-length terminal interval. It gives **29 nonempty rune intervals**, not 32 independently cipher-bearing rune fragments. Any claimed one-to-one 32-fragment ↔ 32-row correspondence to the printed pp49–51 table must explicitly explain the empty states; deleting them silently changes the original event sequence.

The separately recovered nine visual chapter boundaries require **both** an ending mark and the next page's printed red heading; marks alone would create intrapage false chapters ([original page atlas](lp2-global-original-visual-section-map.md)). Earlier solved p56 totient calibration requires uninterrupted key state across its native inner punctuation; a reset at its ten-dot mark recovers only 48/85 known plaintext runes instead of 85/85 with pass-through (Issue #456 historical-notation gate, below). Neither the 31/32 coincidence nor Unicode runic punctuation classes supplies a complete, original-source cipher reset rule, IV, clock or handling of the red10 and black13 varieties.

**Decision for #484:** keep these mark positions as punctuation and reading-structure data; the exact **32-nonempty-segment** handoff is false, while a private cipher using three zero-symbol control events is mathematically possible but **not independently selected by a historical instruction**. No original-state inverse, key or unknown-page plaintext is established. Further tests require a source-authenticated rule prescribing the empty-fragment semantics before any ciphertext decoding.

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


## Pre-2014 historical notation gate (Issue #456)

**Bounded source comparison; no common cipher notation identified.** Three independent, period-available sources were examined against the **175 original-visible LP2 instances**, with the source's exact shapes, placements and classes frozen by the preceding audit and [cross-release stencil report](lp1-lp2-red-stencil-cross-release.md). These sources are a finite historical comparison panel, not an exhaustive census of world manuscripts or private Cicada tooling.

| Source-original LP2 form | Period-documented candidate | Exact-match and operational test |
|---|---|---|
| **138 four-dot diamond stops**, one red and 137 black | 11 June 2009 Unicode line-breaking annex: U+2058 FOUR DOT PUNCTUATION, U+16ED RUNIC CROSS PUNCTUATION, and U+2E2C SQUARED FOUR DOT PUNCTUATION | A legitimate *four-dot or cross-like separator class* existed by 2009. The annex lists them as historical word-separator characters, not a rule fixing LP2's choice of sentence/phrase boundary, reset, permutation, or rune mapping. All 138 source diamonds have the same geometry, so the type cannot supply distinct per-occurrence states. |
| **Five three-dot vertical zigzags**, including one derivative stop mislabeled as four-dot | 2004 Menota punctuation catalogue contains upward-pointing *triangular* dots U+2234; the 2009 Unicode annex contains U+2056 THREE DOT PUNCTUATION and U+2E2A / U+2E2B two-over-one / one-over-two | The LP2 three-square **alternating vertical zigzag** differs from the Menota triangular dots and these Unicode exemplar geometries. The source does not identify which analogue, if any, was intentionally selected; U+205A (used in derivative notation) is **TWO** DOT PUNCTUATION in Unicode. No independent stop/comma grammar results. |
| **28 thirteen-dot, 3-column × 9 alternating-row stencils** | None of those pre-2014 source catalogues documents the LP2 exact 13-square stencil | The stencil repeats identically on multiple pages, including an inline heading separator. A 13=ASCII CR proposal would predict a required line reset, which the same-line original examples contradict. There is no source-specified 13-state cipher transition. |
| **Three ten-dot, 3-column × 7 alternating-row stencils** (plus one on solved p56) | No corresponding ten-square notation in the finite Menota/Unicode panel | The source-original 10-dot class appears at major structural boundaries, including the numerical table and solved p56's hash. It is visibly distinct from the 13-dot class; its value cannot be assumed to be the ASCII LF control or a prime-consuming ciphertext symbol. |
| **One detached-square ambiguous mark** on p27 | Single-dot runic punctuation U+16EB is a generic possible visual analogue | This local mark's exact separator/offset assignment remains ambiguous in the original; a generic dot cannot disambiguate it. |

**Source panel and temporal controls:**

1. [Menota Handbook ch. 5.6, version 1.1, 5 May 2004](https://menota.org/HB1-1_ch5_characters.xhtml#Punctuation_marks): medieval Nordic punctuation types, including a triangular three-dot mark, and expressly variable historical practice.
2. [Unicode 5.2 proposed UAX #14, revision 23, 11 June 2009, §5.7](https://www.unicode.org/reports/tr14/tr14-23.html): runic single/multiple/cross punctuation and multiple three-/four-/five-dot historical separators. Its defined modern processing action is a **possible line-break position**, not a mandatory physical new line or any cryptographic symbol/state operation. The document was a draft at this revision; the relevant historical examples are period-attested.
3. [Unicode historical character inventory, 2009](https://www.unicode.org/L2/L2009/09058-historic.html): U+2056/U+2058/U+2059/U+205A/U+205B/U+205C/U+205D/U+205E names, including the distinction between two- and three-dot signs. Neither this finite inventory nor the two sources above supplies LP2's 3×7 or 3×9 alternating stencils.

**Independent original-cipher control already available, without a new search:** on authentically solved physical p56, known prime-totient decryption must **pass through** the internal 13-dot mark at rune offset 5 and ten-dot mark at offset 45 without resetting or consuming an extra prime, yielding **85/85** original known plaintext runes. A ten-dot reset instead yields **48/85**. The digest is also outside the rune clock. This is established by [the nine-combination source-clock control](lp2-punctuation-solved-clock.md). It rules out a universal mandatory key-reset/consume interpretation for those classes in this known cipher; it does not establish the same cipher on unsolved pages.

**Held-out decision:** Since none of the three period sources matches **all four certain punctuation classes and supplies a specific boundary or transform**, there is *no frozen source-selected operation* with which to predict a new withheld original LP2 word cut or rune. Treating the already printed stops as predicted would be circular. The alternative wrong-source/wrong-class controls are the 2004 **triangular** three-dot mark versus the original **zigzag**, and the 2009 **four-dot** form versus the identically printed **ten-/thirteen-dot** stencil: substitution between their classes fails exact geometry before any ciphertext test. The 2009 generic optional line-breaking convention makes no distinguishing prediction about an LP2 cipher clock. Thus #456 is a **bounded negative for the unified historical-notation hypothesis**, with a legitimate general runic/medieval-punctuation family resemblance. Retain the physical class inventory and reopen only with a dated source exhibiting the *exact* LP2 multi-class design and an executable operation that predicts an uninspected position.

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
