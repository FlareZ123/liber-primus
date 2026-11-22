# LP2 pp40–55: one bilaterally mirrored, page-static floral border

**Current decision, 14 November 2026, Agents 34, 16, 14 and 39.** The source border is one fixed original-artifact template whose sides are almost exact horizontal reflections. Four individually dated 2012–2013 clip-art leads have now been retrieved as actual PNG bytes and tested against its exact original p42 ink geometry; **all four are quantitatively incompatible with a near-exact source plate under the frozen reflection registration**. The image supplies a recognizable reflection geometry, with no authenticated illustrator, associated key text, reversible instruction or unknown plaintext. The common border dots cannot encode page-changing state.

## Original immutable observations

LP2 physical pp40–55 are archive images **57.jpg–72.jpg**. All 16 source JPEGs are different complete files of exactly 2400×3600 RGB. [Existing 16-image original-crop SFT](../sims/lp2_floral_border_template_sft.py) verifies:

| Native original crop | Bounding box (x0,y0,x1,y1) | Distinct decoded RGB crops across 16 pages | SHA-256 of crop bytes |
|---|---|---:|---|
| Entire left margin | (0,0,500,3600) | **1** | `52fe77caca9d6a8841acec9bb2dfa7a19fdfe2df727386fcfff3c81b365aa490` |
| Entire right margin | (1900,0,2400,3600) | **1** | `090a4a52e3188abc694b7a619c372eb14acca5c16df077153f6741ea9b599728` |
| Central control | (500,0,1900,3600) | **16** | Per-page hashes in the SFT |

Both complete side margins, including the five-dot ink groups, are exactly reused from page to page. In particular, different leaf tips, stem orientations, page-specific dot masks and hidden per-page states do not occur in these coordinates.

### The p55 13/31 circle motif is shared by all sixteen borders

The five-ring clusters described on physical p55 are at original coordinates left **x367–424/y1477–1540** and right **x1975–2032/y1477–1541**. Both lie entirely inside the byte-identical side strips above and therefore **occur unchanged on all p40–55**, including rune-free p50. Independent exact original-RGB crop hashes for the left `(355,1460,440,1560)` and right `(1950,1460,2050,1560)` each have **one distinct value across all sixteen** source JPEGs. Reading their shared hollow/filled centers in ordinary row order yields the candidate `01101₂=13` and `11111₂=31` on every page. The two pale rings are real image features, but **cannot independently point to p55, set a page-specific key, or favor the final tree page**. The distinct central p55 artwork and any separately argued p55 address remain potentially relevant. [Ten-center SFT](../sims/p55_binary_ornaments.py) checks all sixteen source margins; [interpretation and limits](red-microdot-motif-inventory.md).

## A new, independent geometric property: the right is a mirror of the left

The left and right decoded RGB bytes are different, but this does not mean that their underlying artwork differs. Read the original archive **59.jpg** (physical p42) without cropping beyond the fixed 500-pixel side strips. Convert each to grayscale and make an ink mask using a predetermined threshold **pixel intensity less than 180**. Compare the left mask to the right under only the source-visible bilateral reflection and three exact geometric controls, with no rotation/scaling/registration/threshold fitting.

| Right-margin orientation against original left | Ink-pixel intersection/union | IoU | F1 |
|---|---:|---:|---:|
| Unchanged | 17,299 / 235,090 | 0.07358458 | 0.13708204 |
| **Horizontal mirror** | **125,046 / 127,343** | **0.98196210** | **0.99089897** |
| Vertical mirror | 18,348 / 234,041 | 0.07839652 | 0.14539461 |
| Both reflections (180°) | 17,418 / 234,971 | 0.07412830 | 0.13802503 |

There are 125,798 left and 126,591 right dark pixels in the two native 500×3600 strips. The horizontal pairing recovers **125,046 matching dark pixels**, over 99% of the smaller ink mask. Since these original strips remain byte-for-byte unchanged on all sixteen pages, the mirror property generalizes to every page in this block. The tiny difference is compatible with independently JPEG-compressed edge pixels and dots, without establishing the original drawing/vector pipeline. No spatial scaling, crop tweaking or selection over other pages was performed.

**Reproducer:** [fixed original-JPEG 16-page plus exact four-control SFT](../sims/lp2_floral_border_mirror_source_sft.py). The measurement also ran on the original supplied JPEGs in the local runtime, and [the manual original-source CI regression passed](https://github.com/FlareZ123/liber-primus/actions/runs/43125999759) under Python 3.12 with Pillow.

This is a human-visible **reflective** design choice, consistent with putting a flipped copy of one decorative stem on opposite sides of a text column. It does not uniquely specify Atbash, reversed page order, book-page folding, alternating sign, byte reflection or any particular hidden transform. No cipher or plaintext is inferred from this geometry alone.

## Finite pre-May-2014 illustrated-source comparisons (#434 and #851)

The original fixed left-side motif has a broad **open spiral near its top**, sparse tree-like stems, an open middle coil, a prominent hanging pointed leaf and roots at its base, with neither a grape cluster nor a large flower blossom. Its actual branch and spiral junctions, not the broad decorative-vine category, define a near-identical source-plate match. The 16 repeated LP2 images do not contribute independent source witnesses.

The earlier [#434](https://github.com/FlareZ123/liber-primus/issues/434) comparison examined three identifiable illustrated editions predating the 2014 manuscript:

| Search candidate | Dated source | Distinctive failure against original |
| --- | --- | --- |
| Franz Sales Meyer, *Handbook of Ornament*, Roman ["Scroll Ornament Vine"](https://etc.usf.edu/clipart/59300/59345/59345_scroll_vine.htm) | 1904 edition, ClipArt ETC reproduction | Repeated continuous relief vine rather than a single rooted stem with open coils |
| William Morris, [two border designs](https://victorianweb.org/painting/morris/drawings/2.html) | 1894, V&A design reproduced by Victorian Web | Grapes and dense intertwined foliage with different branch junctions |
| Brothers Dalziel, *Good Words* 1872 [vine-leaf title border](https://www.fromoldbooks.org/Dalziel-RecordOfWork/pages/000-front-cover-good-words-1872/) | Image recorded in *A Record of Fifty Years' Work* (1901) | Continuous grape/fruit foliage, not the sparse rooted printed motif |

A second independently dated discovery screen (#851, 14 November 2026) sought more recent *pre-May-2014* stock illustrations with root/spiral/leaf geometry, rather than repeating these three book plates. Searches targeted the historically published categories "swirl tree", "branch vine swirl", "leaf flourish", "fiddlehead botanical vine", period book-plate vine ornaments and Art Nouveau borders. The public [Clker Swirl Tree by mswildcrd, dated **16 January 2013**](https://www.clker.com/clipart--swirl-tree.html) and [Swirl Tree by missyven, dated **6 June 2013**](https://www.clker.com/clipart-swirl-tree.html) are **period-plausible original-site metadata witnesses**; each has published title, credited uploader, date and a linked high-resolution raster endpoint. The first page offers "branch vine swirl" as a derivative and the second "branch vine swirl tree". Additional [2012 Leaf Flourish](https://www.clker.com/clipart-leaf-flourish.html) and [2013 Swirl Black Filigree](https://www.clker.com/clipart-swirl-black-filigree.html) likewise have matching broad categories, but **none of these pages provides a stated source book, exact LP2 image attribution, relevant caption, key, or authored transform**. The four original PNG endpoints were inaccessible to the initial local source screen and therefore remained **unadjudicated** at #851; all four were subsequently retrieved in the exact original-input test below.

A contemporaneous illustration-image screen also inspected **2006–2009 dated commercial swirl-tree and vine thumbnail examples** found under generic stock titles (including "Black Vine", "Swirly Tree with Leaves" and "Swirl Tree"). The visibly displayed examples have thicker balanced trunks, different branch topology or multiple decoration clusters where the original has an isolated vertical rooted stem, so none was promoted as a near-identical *visible* plate. The original artifact remains the comparison anchor; the third-party thumbnails and stock-date labels are weaker than independently retrieved original source bytes. No matching plate geometry or associated caption was established.

**Exact four-plate source comparison (#853, 14 November 2026).** Agent39 recovered the complete bytes of all four named original Clker PNG endpoints through the unmodified public source URLs using Windows Schannel `curl.exe` with TLS certificate verification. Python 3.12's default CA bundle rejected the Clker chain on this Windows runner, so the reproducer uses the OS trust store rather than disabling certificate checks. The image-byte digests below authenticate **the files served in 2026 by those original URLs**; the 2012–2013 upload dates are website metadata, not independently preserved 2013 file hashes. A contemporary 2014 bit-identical edition is consequently unproved.

The test is tightly frozen to the original 2014 physical p42 `59.jpg` (2400×3600), source left margin (0,0,500,3600), threshold <180 and source ink bbox `[28,798,500,2836]`. The original right margin horizontally mirrored is a source-positive IoU **0.98196210**, and vertically mirrored negative control **0.07839652**. Each candidate PNG's exact dark-alpha ink bbox is cropped and nearest-neighbor normalized to the fixed source ink bbox, then compared without translation/rotation or alternative crop selection. The two permitted orientations are unmirrored and one horizontal reflection. **Every best IoU is below 0.11**, versus the preregistered near-exact threshold 0.90.

| Dated original-site candidate | Recovered PNG pixels | SHA-256 of retrieved PNG | Original IoU | Horizontal mirror IoU |
|---|---|---|---:|---:|
| mswildcrd, `Swirl Tree`, 2013-01-16 | 600×533 | `29c0bf17f2f33b6036d3d3f0e271b024dedb8475a11fce9a744749a133530783` | 0.09518397 | **0.10692590** |
| missyven, `Swirl Tree`, 2013-06-06 | 600×560 | `87e10a2ff17af5d00ad13fc9d5b1a19dae2a6350aee1b19524ca4ef159c25893` | 0.09508949 | **0.10641345** |
| De'Awn Bunch, `Leaf Flourish`, 2012-07-12 | 600×243 | `85ddf381bb896b1d11def5629eab19c15040fec398404f41f4684e59875799ac` | 0.05962637 | **0.06188401** |
| Chris, `Swirl Black Filigree`, 2013-10-21 | 600×164 | `bdfb5357a91ddfd6089be891e91d2b7e06cb4a60543cfe917a9af67d68adcfb2` | **0.07153151** | 0.06734959 |

[Source-exact SFT](../sims/lp2_clker_dated_plates_source_sft.py) was executed on a Windows Python 3.12/Pillow 11.3 runner, [successful CI run **43577445623**](https://github.com/FlareZ123/liber-primus/actions/runs/43577445623), with all four PNGs returned and compared. The previous [run 43577278017](https://github.com/FlareZ123/liber-primus/actions/runs/43577278017) passed the original-image positive control but retrieved zero candidates because the Python certificate bundle rejected the chain; it is superseded by the Schannel-verified retrieval.

**Disposition.** All four specifically named dated Clker leads fail the original frozen complete-motif near-exact image comparison. This is a quantitative, limited plate exclusion under one physically motivated registration, not a universal feature-matching search or proof of unique illustration authorship. No candidate possesses an associated source-selected text, key or cipher operation. Retire these four candidate plates and avoid further generic swirl-image searches. Reopen only with a new independently identified first-party or pre-2014 image source bearing matching distinctive junctions **and** a player-actionable associated instruction.

## Conditional key-reuse test on the entire framed section

The same source-original copied border motivated one complete **all-secret shared additive-pad** test across the fifteen rune-bearing p40–55 pages, excluding runeless p50. A shared page-local GP29 pad plus any page-specific Caesar offsets must preserve each page pair's optimal aligned difference histogram. Original best-offset equality is **1,232/19,079 = 0.06457361**, lower than all **6,000** matched GP-English source controls (minimum **0.06834740**). Thus this complete shared-frame key-reuse reading lacks the necessary native-GP plaintext fingerprint. This does not test independently changing keys, hidden position changes, feedback or different plaintext alphabets. [Evidence, positive plant and independently reproducible invariant](lp2-floral-section-sharedpad-invariant.md) · [Node SFT](../sims/lp2_floral_sharedpad_invariant_sft.cjs).

## Decision and next action

The exact template reuse, complete bilateral mirror and the mismatch to the three historical plates **and all four tested 2012–2013 Clker candidates** support the economical interpretation of a **single reusable mirrored decorative frame**. The established positive property is its horizontal reflection; the hypothesis that an external source once supplied a reading instruction remains unproved.

Retire page-specific floral-dot keys or hidden margin variations. Do not open a new Atbash/rotation sweep solely because the border is mirrored: any source-selected reversal would still need a key or an independently held-out plaintext prediction. Reopen this branch only if a specific pre-2014 illustration is recognized by distinctive junctions **and** its title/caption/associated text provides a player-actionable operation for the adjacent p40–55 text.
