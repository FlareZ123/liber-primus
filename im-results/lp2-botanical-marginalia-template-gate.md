# LP2 p8–14 marginal trees and p24–26 wing ornaments: source-template gate

**Original-image evidence, Agent 17, 11 November 2026, Director Issue #187; historical source gate, Agent 3, 11 November 2026, Director Issue #325.** The p8–14 tree artwork remains a bounded visual-source investigation, not a decryption. No unknown LP2 plaintext, key, or destination was recovered.

## Source and the human-solvable route

LP2 original scans (physical page = JPEG number minus 17) show upright sparse **tree/roots drawings** in the outside margins of **p8–14, JPEG25–31**, alternating left/right with page side. Original **p24–26, JPEG41–43**, show an entirely **different visual family**, two-ended dragonfly-like wing figures on *both* sides of the text. The page-14 central flying insect is separate from its marginal tree. These are two kinds of source artwork rather than a sequence of distinct tree branch states.

The signed 2016 oak image carries the authenticated message that Liber Primus words are the map, their meaning is the road and their numbers the direction. The earlier documented image lineage joins the oak to the blurred p32 tree and outlined p55 tree in [tree-outline-blur-crosspage.md](tree-outline-blur-crosspage.md). No source instruction identifies or enumerates the sparse p8–14 trees as numeric coordinates. A human could notice the seven-page run, roots and page placement, but a unique page/word/rune address needs distinguishable states or a rule selecting an exact branch.

## Historical Fibonacci-tree candidate (Director Issue #325)

A genuinely pre-2014 source supplies a plausible model, but not an exact image-source identification. The [OEIS A000045 Fibonacci-tree page](https://oeis.org/A000045/a000045.html) credits Henry Bottomley's diagram to 27 July 2000. Its second representation says that each mature branch sprouts a new branch annually, new branches take a year to mature, **mature branches are heavy lines**, and the nth year has F_n branches. A later [Uncovering Cicada community page](https://uncovering-cicada.fandom.com/wiki/Liber_Primus_Ideas_and_Suggestions) explicitly proposes that the LP2 p8–14 saplings are a Fibonacci tree, counts 13 branches, and lists highlighted positions **[2,3,5,6,8,10,11,13]**. This is a plausible human-solver lead: 13=F_7, with 8 mature and 5 new branches. The community page is conjecture, not a Cicada-signed source; the LP2 image is not an exact copy of the OEIS diagram, and the branch segmentation/numbering is not printed on the LP2 page.

The candidate 13-position mask has two tempting arithmetic coincidences. Its listed positions sum to **58**, the LP2 page count; applying the same positions to the already documented p0 red-span GP-prime weights `[53,23,67,7,17,71,107,2,53,103,67,79,13]` selects `[23,67,17,71,2,103,67,13]`, whose **decimal** sum is **363**. The p56 SHA-512 target begins with the hexadecimal characters `363`, but this is not a numeric checksum: decimal 363 is `0x16B`, whereas hexadecimal `0x363` is 867. The literal three-character match is therefore only a string coincidence. The sum-of-branch-indices 58 is likewise not a rule stated by OEIS. Moreover, 5 of the 1,287 possible 8-of-13 subsets of the p0 weights sum to 363, so the arithmetic does not uniquely validate this mask.

The source does define a mature/new distinction, but it does not prescribe how to number LP2 branches, which side to start from, which ciphertext span to address, or how to transform runes. The LP2 trees also repeat as static templates (p10/p12/p14 left crops are byte-identical; p9/p11/p13 right crops are byte-identical; p8 is a near-template), so there is no page-by-page branch progression. The old community mask is worth preserving as a hypothesis, but it does not yield a source-fixed traversal or a blind original-cipher prediction.

## Original-image reproducible test

The [standalone source-image SFT](../sims/lp2_botanical_template_source_sft.py) uses Python, NumPy, SciPy and OpenCV and reads the original 2400×3600 JPEGs under resources/liber-primus. Reproduce via: python sims/lp2_botanical_template_source_sft.py. No ciphertext score, guessed key, OCR or edited derivative image enters the measurements.

Crop bands: for p8–14, x=0:600 on left pages, x=1800:2400 on right, y=580:3080; p24–26 use the same x-bands and y=900:2500. The central rune block is excluded. Compare original RGB crop bytes, threshold grayscale for registration (trees less than 125, wings less than 155), and use FFT cross-correlation to register fixed-shape ink masks. The SFT emits crop SHA-256 and the exact registration results.

**Exact RGB-pixel copies in different ciphertext-bearing pages:**

| Figure | Independent original source regions | Exact result |
|---|---|---|
| Left sparse trees | p10 = p12 = p14 | Identical entire 600×2500 RGB crops |
| Right sparse trees | p9 = p11 = p13 | Identical entire 600×2500 RGB crops |
| Two-ended wing figures | p24 = p26, each side separately | Identical entire 600×1600 RGB crops |

These are pixel-array equality tests, stronger than resemblance. Original printed runes differ between the pages. Thus no **page-varying secret branch label** can be read from those exact repeated template areas, although a constant universal drawing could symbolize a separate operation.

**Registration against the p10 source tree crop:**

| Source | Best image-only translation (dx,dy) | Thresholded ink IoU | Horizontal-reflection control IoU |
|---|---:|---:|---:|
| p10/p12/p14 | (0,0) | 1.0000000 | 0.1018986 |
| p9/p11/p13 | (-16,0) | 0.9699053 | 0.1007897 |
| p8 | (0,0) | 0.7761889 | 0.1015811 |

The trees on alternating sides preserve **the same chirality**, with the right-group image positioned 16 pixels differently in its own margin. Reading left/right page alternation as an independently chosen orientation or bit adds no source information. The p8 threshold divergence is caused by fine raster/stroke shading differences without a visually identifiable missing or moved branch: maximum nearest-ink distances to p10 are 4.0 and 2.236068 pixels in opposite directions. The large red initial on p8 is a separate text marker outside the tested tree crop.

The p24/p26 wing ornaments reproduce exactly on both sides. The p25 left and right ornaments register to p24 at (-1,-1) with IoU 0.8794326 and 0.9470374, respectively; this is the same visible stencil with a slight raster placement difference, rather than a reproducible three-page sequence of new branch labels.

## Cipher gate and falsifiable limits

An already executed [p10/p11 sevenfold to p55 gate](tree-facing-pages-sevenfold-p55.md) grants an **arbitrary secret stationary output codebook** and obtains a maximum original p55 fit of only **34/76** runes. Its four-rune trim and target assignment were never authenticated by the illustrations. Independently, the genuine solved-2014 [seven-position operation on p8–14](2014-outguess-period7-lp2-p8to14-inverse-gate.md) did not recover LP2 plaintext. These exact tests should not be repeated merely because the imagery occupies seven pages.

The 2016 oak clue does not prescribe a sparse-tree branch order, page/word/line clock, or reversible original-runic inverse. The OEIS Fibonacci-tree model supplies a candidate heavy/light maturity distinction, but no LP2 branch numbering or target span; the community's 13/8/5 interpretation remains conjectural. Repeating fixed art **excludes differential per-page branch-state extraction** from these crop regions, although a constant mnemonic remains possible. The p0 red-span/363 and branch-index/58 correspondences are retrospective and do not constitute a withheld ciphertext prediction. A new authenticated instruction or exact source image fixing the branch traversal and cipher operation would be required.

## Director decision

**Retire the p8–14 tree as a cipher selector for now, while preserving the Fibonacci-tree analogy as a provisional visual hypothesis.** The pre-2014 OEIS model and the later community 13/8/5 interpretation make the human route plausible, but exact branch topology, segmentation, numbering, target text, and operation are not source-selected. The 363 decimal sum is not numerically equal to the p56 hexadecimal prefix; the 58 index sum is not an OEIS instruction. The original images show repeated static templates, not a page-varying progression. No unique original-cipher prediction follows. Close Issue #325 without a successor; reopen only if a primary artifact or exact source image fixes the branch readout and predicts an untouched ciphertext interval. Keep p24–26 wing art as a separate family.
