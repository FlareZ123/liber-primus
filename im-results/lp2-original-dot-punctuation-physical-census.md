# Original LP2 colored events: physical census of all 225 runes and 36 large marks

**Source-positive original-image result, 16 November 2026, Agent 1.** A direct connected-component scan of all **58** original LP2 JPEGs (source images 17.jpg–74.jpg, physical manuscript pp0–57) finds **36** source-visible large compound dot marks, with the exact morphology and color distribution below. The result moves the large-punctuation count from derivative transcription agreement to an independently reproducible original-raster census. It does **not** recover a cipher key, page plaintext or continuation.

| Original image classification | Count | Original coordinates |
| --- | ---: | --- |
| Red 13-dot | **30** | 30 groups, each verified against page and native 2400×3600 raster coordinate in the SFT |
| Black 13-dot | **1** | Physical p7 / original 24.jpg, center (1707,2271) |
| Red 10-dot | **4** | p36 (993,1482), p38 (620,2571), p49 (1710,1106), p56 (1073,1106) |
| Red 23-dot | **1** | p57 / original 74.jpg, center (1678,1782) |
| **Total** | **36** | Across the whole LP2 distribution |

**Method and replay:** [single original-JPEG Python SFT](../sims/lp2_original_color_dots_census_sft.py). Decode all 58 original JPEG images into RGB; retain pixels satisfying red channel >75 with at least 50 intensity units of red dominance over each other channel, or black pixels with RGB channels each <80. Form eight-connected pixel components and select isolated ~9×9 square punctuation dots (55–150 red ink pixels; 55–175 black ink pixels; width/height 8–12). Form dot groups from centroids linked at Euclidean separation ≤23 image pixels. Retain clusters of at least six dots, assert exact source-page groups and their centroids within two pixels. No text transcription, reconstructed rune glyph, OCR classifier, or external hypothesis selects the marks. The native image count is 58/58. The original scan supports the **31** 13-dot marks: 30 red plus the p7 black exception. All 36 agree with source-annotated large punctuation positions and colors.

**Important inventory distinction:** The companion [punctuation-identity transcription](../resources/liber-primus/lp2-punctuation-identity.json) has **31 chapter marks**, specifically **28** 13-dot and **3** 10-dot; the direct image count instead has **31 marks of 13-dot morphology**, including three additional solved-page source-visible 13-dot marks, and five other large marks (four tens and one 23). These are different counted selections. The [red-rune annotation](../resources/liber-primus/lp2-ink-annotations.json) records 225 red *runes*, now independently recovered from the original ink by the second image SFT. The companion red-rune image test now independently confirms all **225** red rune glyphs, establishing the **256-event physical count** while leaving the hypothesized event ordering and decoder unselected. The candidate 256-tape's previously tested **direct original p50 XOR** is negative; this new morphological result does not reopen that consumer ([previous exact negative](lp2-grid256-allsecret-keyclock-original-gate.md)).


## Physical red-rune census and the combined 256-event source inventory

A second standalone [original-red-ink image SFT](../sims/lp2_original_red_225_rune_census_sft.py) independently scans all 58 original **2400×3600 RGB images** using connected red-ink components with height ≥60 pixels and area ≥80 pixels. It finds **233** colored text-sized components on 18 pages. **Nine** are verifiably printed Latin decimal numerals: the four-digit **3299** in the original p15 4×4 numerical matrix (original image 32.jpg, first red digit top-left at native x912,y1016), plus visibly numbered items **1–5** on p36 (53.jpg), p37 (54.jpg) and p38 (55.jpg). Excluding these nine components leaves **224** GP-sized connected red components. On physical p33 (50.jpg) the two adjacent original red runes **ᚠᚳ** at x992–1090,y1914–2028 share one connected stroke; they must count as **two** original glyphs. Corrected original-image count is **224+1 = 225** red GP29 runes on **15** physical pages. The SFT checks exact per-page counts and these original-image exceptions. It reproduces **213 red runes** on unsolved pp0–55 and **12** on solved pp56–57.

This establishes two independently counted source-visible sets:

- 225 physically visible **red rune glyphs** with exact per-page counts
- 31 physically visible **13-dot compound punctuation marks**, 30 red plus the single p7 black mark

Their disjoint union has **exactly 256 events**. Original physical **pp49–51** separately contain 256 printed two-character numeric cells. The **count match is now real original-image evidence**, and remains a **hypothesis about intended relation**: no original instruction orders these two different 256-symbol source sets into a shared register, maps 13-dot symbols into bytes, or selects a reversible cipher or key clock. The previously tested source-order GP-prime/totient tape directly XORed against the base60-interpreted p50 bytes gives no recognizable payload or authentic p56 hash preimage ([exact negative consumer](lp2-grid256-allsecret-keyclock-original-gate.md)). Different source-motivated use of the two sets remains possible.

The 233-to-225 correction is intrinsic visual glyph morphology rather than a post hoc text key: original p15 numerals have readily recognizable decimal forms and the only oversized non-decorative connected red rune component across the 58 images is the single p33 joined pair (98 pixels wide, normal rune height 114 pixels). Every other red text-sized component is handled directly.


**Independent red-ink disambiguation:** p37 / original 54.jpg has three conspicuous isolated red text-sized characters at the left margin, but close inspection shows visible decimal enumerators **2, 3 and 4**, not GP29 rune symbols. They must not be added to the derived 225-rune total. The original p0 red13/black-body boundary remains as separately corrected in [the p0 source adjudication](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md).

**Decision:** The complete large-mark and red-rune inventories are physically source-grounded. Retain the red-rune-plus-13-dot tape as a *conditional* key/side-channel possibility only if a first-party clue selects its position clock and downstream reversible consumer. Prior direct XOR and static key tests remain bounded negatives; do not multiply free parameters to make the 256 coincidence decrypt by chance.
