# 2016 signed tree: exact p32-prime-width image tiling and direct pixel-value gate

**Evidence class:** Independent reproduction and limited extension of a preexisting p32 source-image hypothesis. The 563×569 prime-axis checksums were established in [the original p32 analysis](lp2-tree121-signed2016-source-gate.md); the **identical unequal 11×11 image tiling had already been constructed and tested** in [Agent14's tiling gate](tree121-image-tiling-source-gate.md) and the wider [tree-prime partition analysis](tree-prime-canvas-partition.md). The original brightness/GP correlation was therefore already a reported negative. The incremental results here are a separately reproduced 100,000-control three-feature discriminator, a fixed center-pixel readout, literal JPEG DQT/container checks, and the prime-ordinal NN address observation, now retired as source-unselected after a historical indexing audit. **No unknown LP2 plaintext, historical key, directed walk or destination is recovered.**

## Human-visible route and finite geometrical definition

The historically signed 2016 Cicada message instructs that the words of Liber Primus are a map, their meaning the road and their numbers the direction. Its attached original tree JPEG, archived as [4gq25.jpg](https://github.com/scream314/cicada3301/blob/master/assets/2016/4gq25.jpg), measures **563 pixels wide by 569 high** and matches the tree motif on physical LP2 p32. Original p32 contains exactly **121** GP runes. The established natural 11×11 row-major mapping, with each rune converted to its standard GP *prime* weight, satisfies these source checksums without altering ciphertext:

- The top-row prime weights are **[73,5,101,19,101,3,43,107,13,19,79]**, summing to 563.
- The left-column prime weights are **[73,23,5,23,79,59,53,79,59,109,7]**, summing to 569.

A possible next human operation is to interpret the *eleven individual top-row prime weights* as successive horizontal pixel widths, and *eleven first-column prime weights* as successive vertical heights. This determines **121 unequal rectangular image tiles** with **zero free shifts, scales, wrapping, orientation parameters or missing cells**. The exact cumulative boundaries, in pixels from image upper-left, are:

| Horizontal x | Vertical y |
| --- | --- |
| 0, 73, 78, 179, 198, 299, 302, 345, 452, 465, 484, 563 | 0, 73, 96, 101, 124, 203, 262, 315, 394, 453, 562, 569 |

**Important selector gap:** a source-prescribed use of these tiles is missing. The signed text says *numbers are direction*, which could instead favor a route through runes or a compass. There is no authenticated instruction to partition an image according to each prime weight, choose a pixel color statistic or map brightness back to rune values. This construction remains a candidate geometry, not a recovered intended instruction.

## Frozen direct-pixel discriminator on authentic images

We reused the repository's existing original JPEG [resources/historical/cicada2016-4gq25.jpg](../resources/historical/cicada2016-4gq25.jpg) (Git blob **22027296dcd7df53c5127e6aadbabeaf3223f72d**, exactly **26,342 bytes**). The original source's 563×569 dimensions and RGB pixel data are read with a pinned [jpeg-js decoder](../sims/vendor/jpeg-js-decoder.cjs) and its [license](../sims/vendor/jpeg-js-LICENSE).

A direct and limited check asks whether the 100 p32 *interior rune prime values* encode the appearances of their corresponding image tiles. Freeze the edge weights, which define all tile positions and sizes. For each interior tile use exactly three elementary pixel summaries of decoded RGB:

1. Mean RGB level (average of red/green/blue at each pixel).
2. Fraction of pixels with mean RGB **≥160**.
3. Fraction with **16≤mean RGB<160**.

Pearson and Spearman associations compare those image summaries to the original interior GP prime values with no decryption key or fitted pixel transform. Shuffle **only the 100 interior original prime weights**, preserving their multiset and all 21 edge runes that define geometry. Use 100,000 fixed-seed xorshift32 shuffle trials, seed 0x20163301. Report each individual two-sided Pearson permutation probability as well as the chance that any one of the three predeclared features matches or exceeds its observed absolute association.

| Feature | Observed Pearson r | Observed Spearman rho | Two-sided Pearson shuffle p |
| --- | ---: | ---: | ---: |
| Mean RGB | -0.08047718 | +0.01753043 | 0.431996 |
| RGB ≥160 fraction | -0.08838911 | -0.04343931 | 0.389796 |
| 16≤RGB<160 fraction | -0.01225613 | -0.01091975 | 0.904291 |

Under the same 100,000 shuffles, the three-feature **any-Pearson** probability is **0.912421**, and the three-feature **any-Spearman** probability is **0.976500** (add-one denominators). These are *conditional randomization diagnostics* for the stated source-derived geometry and three fixed visual features. They are not global probabilities that Cicada intended or did not intend a pixel method. The actual JPEG has bright written text over a mostly dark canvas; pixel intensity can reflect the typography rather than the tree shape.

A second, strictly frozen image readout uses **only the pixel at the center of each of the 121 tiles**, labeling it white when its three-channel mean RGB is ≥128. This image-derived mask, with row-major `#` for selected and `.` for excluded, is:

```text
...........
...........
.#######...
...........
......#....
...........
...........
...........
...........
...........
...........
```

The eight rune labels at selected positions transliterate as **HBIARTTHFW**, without a recognizable instruction. This tests one elementary visual reading rule beyond the previously documented boundary-gutter and whole-tile brightness tests; it is an exploratory negative rather than an exhaustive search over tree-mask semantics. The image JPEG's original marker structure is ordinary: JFIF APP0, quantization, baseline frame, Huffman and scan segments, and EOI at byte offset **26,340**, with **no COM, EXIF/XMP, application metadata beyond APP0 or trailing bytes**. These literal container checks find no metadata-level textual key. **DCT-domain steganography is positively known here**: the historical 2016 image is the project's authentic 1,136-byte OutGuess payload positive control (see [the established extraction and checksums](outguess-lp2-keyed-source-headers.md)), so the absence of APP/COM/trailing data cannot be treated as absence of concealed content. No *new* key or plaintext results from the tile-center check.

**Separate byte-source check, no table transfer.** The JPEG contains exactly two 8×8 quantization matrices (64 values each). Both match the **standard JPEG quality-75 luminance and chrominance tables exactly (64/64 entries each)** after the standard zigzag ordering, so they are ordinary compressor parameters rather than an image-specific 128-byte key. In the source p50 printed 32×8 grid, the four consecutive 64-byte blocks match the first JPEG matrix at only **[1,1,0,0]** positions and the second at **[0,0,0,0]** positions. Unmodified table-byte transfer is therefore absent. This narrows the literal 2016-image-to-p50 idea without claiming anything about unrelated DCT coefficient steganography.

**Decision:** the unique natural tiling defined by the known sums is a reproducible candidate visual operation. **Direct monotone tile-brightness → interior GP-prime-value identification is unsupported** and should not be optimized through arbitrary thresholds, color corrections, rotations, or language scorers. Recovering a source-indicated direction/route or a hidden layer remains necessary before testing any decryption. The independent 563/569 axis checksums still meaningfully identify p32 and its row-major orientation, as established before this study.

## Prime-ordinal source-word reading: one-based EN and the unselected page pointer

The authenticated 2016 tree JPEG measures **563×569**, the **103rd and 104th primes**. The original physical p32 page has an independently supported 11×11 row-major rune matrix. Those facts do not by themselves prescribe treating the prime ranks as addresses into that matrix.

The signed 2016 OutGuess payload says that Liber Primus's words are the map, their meaning the road, and their numbers the direction ([archived signed payload](../resources/historical/cicada2016-4gq25-outguess.asc)). It does **not** specify prime-ordinal rune indexing, a zero-based offset, an origin, a traversal direction, or a stopping rule.

### Historical indexing precedents

The best documented human-facing Cicada coordinate systems use **one-based ordinal positions**:

- The 2013 PGP-signed book code begins with **I:1:6**. The archived solve identifies this as the sixth character of the first line in the first chapter of *Liber AL vel Legis* ([signed-message archive](https://github.com/neuroretransmit/cicada/blob/main/2013/001-232.jpg/README.md); [historical explanation](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_(2013))).
- The 2014 PGP-signed opening code begins with **1:2:3:1**. Its documented interpretation is first paragraph, second sentence, third word, first letter ([original OutGuess payload](https://github.com/micheloosterhof/cicada-2014/blob/master/stage01/zN4h51m.jpg.outguess); [historical explanation](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_(2014))).
- The later 2014 Gödel–Escher–Bach book code uses **chapter:line:word:letter**, with examples such as **3PI:6:1:3**; its word and letter fields are likewise human ordinal positions beginning at 1 ([2014 walkthrough](https://embeddedsw.net/doc/Openpuff_for_experts_Cicada_3301_recruitment_puzzle_2014.pdf)).
- The 2012 book-code route also uses line/character coordinates, consistent with this convention ([2012 historical account](https://uncovering-cicada.fandom.com/wiki/What_Happened_(2012))).

These are precedents, not proof that p32 must use a book cipher. They do, however, provide no support for silently converting prime ranks into zero-based array offsets. When Cicada wanted signed movement through a text, the surviving 2013 book-code variant explicitly stated how positive and negative values move; the 2016 signed tree message contains no analogous offset instruction.

### Original printed-word gate and an exact self-address

The **103rd and 104th ordinary primes are 563 and 569**, exactly the authenticated signed 2016 image dimensions and the source-selected GP-prime sums of the first row and column of physical p32's 11×11 rune square. The historical one-based coordinate convention reads p32 positions **103–104** (zero-based 102–103) as **`ᛖᚾ` = EN**. Original physical JPEG `49.jpg` and the preserved source transcription both place a **real printed word boundary** immediately after EN: `...ᛠᚱᛟ-ᛖᚾ-ᚾᚹᚷᚢᛚᚪᚩᚣ...`. The following word begins NW. Together they expose the four-cardinal-letter sequence **EN | NW**, with its two halves differently delimited by the source. Reading ranks as zero-based offsets instead produces **NN** across this visible word delimiter. The earlier N/N northward instruction remains retired.

**Source-arithmetic cross-check:** The GP-prime weights of the complete EN word are **E=67** and **N=29**, summing to **96**. Euler's **φ(96)=32**, equal to the *physical page number* of the original tree image. The 96th ordinary prime is **503**, one of the two prime dimensions of the separately authenticated 2012 image (503×509, prime ranks 96 and 97). This 2012 link is a retrospective selection of the 503 endpoint, and does not independently establish a 2016 rule.

**Frozen original-page controls:** Using exactly one-based positions 103–104 in every physical unsolved page with enough runes, **52** pages are eligible; only **four** have a complete two-rune printed word occupying both positions. The complete source census is **p24 XR** (prime sum58, φ28), **p32 EN** (96, φ32), **p34 NA** (126, φ36), and **p37 AEX** (148, φ72). Only p32 self-addresses under **φ(GP-prime-sum)=physical page**. Across all **2,896** canonical unknown words, just **16** complete words on ten physical pages self-address under this formula. These are finite original-corpus counts under a *post-selected composite rule*, not discovery-level p-values. The earlier 2012 image's prime ordinals 96/97 select **D,S** in p32 by the same one-based coordinate convention, providing a wrong-source check.

### Two-step EN walk and source-word return address (new conditional route)

Once the source-dimension prime ranks have selected the **complete EN word**, one possible completely specified local move is to begin at its first rune's 11×11 coordinate and follow the **two cardinal glyphs, east then north**, stopping at the end of that printed word. The original row-major p32 cells give:

- Source rune ordinal **103** / offset **102**: **E** at zero-based grid (row9,col3).
- Move **east** to ordinal **104** / offset **103**: **N** at (row9,col4), the very next source-rune letter.
- Move **north** to ordinal **93** / offset **92**: **M** at (row8,col4), the **first rune of the printed five-rune word MBUDS**.

A fixed wrong-index reading starts at offset103 with the delimiter-crossing **NN**, moves to offset92 (**M**, a word beginning), and then to offset81 (**NG**, internal to another printed word). Only EN ends its full two-letter walk on a word beginning. That terminal association is an exact source observation, but the start-at-first-letter rule itself is an interpretation.

An independent prior p15→p32 spiral/318° analysis also singled out the **BUDS suffix of MBUDS**, p32 offsets93–96, via the separately inferred p15 index89/four-rune-suffix selector ([controlled earlier candidate](p15-p32-318-direction-sft.md)). The new EN walk finds MBUDS without the p15 bearing or Fibonacci construction. **BUDS** has GP-prime sum **61+3+89+53=206=2×103**, where 103 is the signed 2016 image width's ordinary prime rank. Euler's **φ(206)=102**, exactly the **zero-based start of EN**. This forms the explicit candidate address loop **image width563 → prime ordinal103 → EN at offset102 → east/north → MBUDS → BUDS suffix → φ(206)=102 → EN**. It is a *source-consistent circular checksum*, not an authenticated cipher: moving from the source word's own first cell and trimming the initial M before totient are unprescribed choices, and returning to the origin produces no plaintext.

For context, only **two** of p32's 118 consecutive four-rune windows have totient(prime-sum)102: BUDS at offsets93–96 and UDSB at 94–97 (equal sums because the first and last letters of BUDSB are both B). This visible neighborhood dependence prevents describing the four-rune arithmetic as an independent low-probability discovery. The prior p15 BUDS address also has inferred selectors; convergence is informative for prioritization, with no independent key proof.

**Crucial undecided operation:** None of the signed 2016 text, 2013/2014 book-code precedents, original tree pixels, or printed p32 layout explicitly instructs readers to convert image dimensions to *prime ranks*, apply those ranks as rune positions, compute a word's prime-weight sum, apply φ, or use the result as a page address. Each individual arithmetic step is historically intelligible; their composition was recognized retrospectively. EN offers a more source-respecting potential **word-level selector** than NN, but no subsequent origin, compass-step count, terminal condition, cipher state, reversible decryption, or authentic plaintext follows yet. Director Issue [#178](https://github.com/FlareZ123/liber-primus/issues/178) owns that missing next-step decision. Do not fit a further direction/path/offset to the target after reading it.

The executable [one-based printed-word / totient SFT](../sims/p32_en_source_ordinal_gate.cjs) re-reads the original rune corpus and transcription, asserts the four exact positive/negative controls, and preserves the manuscript-wide count. It does not score decrypted language or claim a cipher key.

## Exact reproduction

Run [the standalone CommonJS SFT](../sims/p32_prime_weight_image_tiles_sft.cjs) under Node.js 22 from the repository. It reads only the canonical [original LP2 source corpus](../resources/liber-primus/lp2-corpus.json), the existing original binary JPEG and the vendored JPEG decoder. It validates 121 original runes and source image dimensions, asserts the 11 width/height values, reconstructs all 121 tiles, then prints the tile means, correlations, control counts and p-values. There are no random seeds or thresholds selected after seeing the original correlations.

The 2016 image SHA above identifies the original *Git blob* already retained in the repository, not an unverified screenshot. The decoder was pinned from the open-source [jpeg-js](https://github.com/jpeg-js/jpeg-js) implementation (Git blob **a237d4037735de5446e63528ffdec1937ceac09d**) with its source license. The first-party p32 rune corpus references the historical rtkd/iddqd transcription lineage; the p32 11×11 grid has separate independent image documentation in the linked report.
