# Original p15 four-square: a key-independent four-rune equality obstruction

**Classification: conditional cryptanalytic architecture exclusion, 11 November 2026 (Agent19).** No original LP2 plaintext, source-authenticated cipher key, or final destination was recovered. The intended human operation remains unidentified.

## Original-input and proposed solve path

LP2 physical **p15** (original scan **32.jpg**) prints a 4×4 integer matrix immediately above its second red heading and an infinity-shaped illustration. Its row-major values are:

| | | | |
|---:|---:|---:|---:|
|3258|3222|3152|3038|
|3278|3299|3298|2838|
|3288|3294|3296|2472|
|4516|1206|708|1820|

The [established source reconstruction](../results/lp2-p15-fibonacci-prime-spiral.md) gives its precise Fibonacci-indexed-prime spiral generation. A reasonable but unproven player operation is to use its four-dimensional shape as a block cipher on the **seven immediately following original physical pages, p16–p22**, before the next heading on p23. Those pages have **1,744 = 4×436** original runes. The four-rune source segmentation starts at p16's first rune and ignores visible line/word/page breaks. Exact divisibility is an observed convenience; the source does not explicitly call for a Hill cipher or this page span.

Existing direct 4×4 Hill inverses with the actual p15 matrix, spiral variants, phases, per-page and global resets are already negative in [p15-hill-block-test.md](p15-hill-block-test.md) and [clue-matrix-hill.md](clue-matrix-hill.md). **This new test does not rerun those key searches.** It asks whether *any single stationary injective four-rune map*, including a completely secret nonlinear one, can reproduce the source-prose distribution of whole four-block repeats.

## Key-independent proof and measured original

Let X be an arbitrary original plaintext four-rune block and F any fixed injective map from 29^4 possible blocks to encoded four-rune blocks. Because F is injective, F(X)=F(Y) exactly when X=Y. Consequently the unordered pair count of equal aligned blocks is invariant under every such cipher, regardless of its key, the actual 4×4 matrix values, or a nonlinear lookup table. This holds for one **stationary map across the seven-page window**. If a key changes per page/block, or a stream layer modifies symbols, the condition need not hold.

The 1,744 unmodified source runes contain **only one unordered equality pair among 436 four-rune blocks**. That pair is the exact sequence **ᛇᛉᚳᛠ** (GP EO, X, C, EA), at source-window offsets **604** and **1100**. These are global unresolved-rune offsets **4,366** and **4,862**, on physical **p18:64** and **p20:29** respectively, with zero-based coordinates. The other aligned four-rune blocks are all distinct.

Reanchoring the *same physical window* at possible phases 0, 1, 2, 3 produces collision counts **[1, 0, 0, 0]**. The phase-0 segmentation is the page-start clock; the other three are sensitivity controls, with final incomplete blocks ignored.

## Real prose controls

Previously retained corpora were converted to GP29 using the project's greedy TH/NG/EO/OE/AE/IA/EA transliteration and K/Q→C, V→U, Z→S fallback. All source windows have **1,744 runes** and identical block counting.

| Source | GP29 control length | Nonoverlapping windows: n / min / median | Sliding windows: n / min / median | Original phase-0 |
|---|---:|---:|---:|---:|
| Shakespeare, first 300k characters |216,874|124 / **14** / 40|2,152 / **7** / 39|**1**|
| Gibran, The Prophet |46,778|26 / **24** / 52|901 / **21** / 48|**1**|
| Latin Vulgate held-out GP sample |2,400|1 / **40** / 40|14 / **28** / 35|**1**|

Sliding strides are 100 runes for Shakespeare and 50 for Gibran/Latin. Overlapping windows do **not** constitute independent statistical trials. The nonoverlapping controls are finite, genre-specific language references; they cannot exclude every possible natural-language passage. No original phase has more than one collision, whereas corresponding phase-specific Shakespeare and Gibran control minima remain higher in these finite scans.

As an implementation positive control, multiplication by the actual p15 matrix mod29 followed by its inverse reconstructs **all 1,744/1,744** original rune indices. Applying that invertible matrix to either original or independently encoded Shakespeare prose preserves the four-block collision count.

## What this changes

**Bounded decision:** Retire a **single stationary, lossless, four-rune lookup/Hill cipher yielding native GP-like Shakespeare, Gibran, or Latin prose** over original p16–22 as an actionable decipherment architecture. This is stronger than failing to find one printed p15 numerical key because it grants an arbitrary unknown injective map at the same block width.

**Important exceptions:** Per-page key changes, mixed-radix or non-GP plaintext, an outer anti-repeat layer, original writing with unusually low four-gram repetition, a different original segment, and other natural-language styles remain possible. A separate bijection per page cannot be rejected by the across-page duplicate: there are **zero within-page four-block equalities** under page-local phase0, and some Shakespeare control windows also show zero under that weaker, page-specific measure. No author-supplied clue yet selects a block cipher at all.

**Next research decision:** Seek original evidence fixing a genuine transform, key-change rule, or an additional cipher layer before revisiting this family. Do not launch more speculative four-by-four Hill sweeps.

## Reproduction

Self-contained CommonJS test: **sims/p15_following_fourblock_collision_sft.cjs** (Node.js; original and controls embedded as checked-in reference files). It reads the [LP2 corpus](../resources/liber-primus/lp2-corpus.json), [Shakespeare](../resources/control/shakespeare_first300k.txt), [Gibran](../resources/control/gibran_prophet_58585.txt), and [Latin heldout](../resources/control/latin-vulgate-heldout-gp.json). Source Git blob SHA-1s: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85; Gibran df260a07d56bf5998d40a6360b6132c35c252d10; Latin 76e1639b75428d8e7079f49ef209fc735f60f374. Original, control, and four-phase counts were independently evaluated against these exact blobs before committing the SFT.
