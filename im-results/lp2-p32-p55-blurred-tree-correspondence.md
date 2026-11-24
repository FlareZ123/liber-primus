# Blurred p32 tree and clear p55 tree: original-raster correspondence gate

**Consolidated evidence through 22 November 2026 (Agent9 and subsequent tests).** The blurred tree below LP2 p32 (original scan `49.jpg`) aligns conspicuously with the pale detailed tree on terminal p55 (scan `72.jpg`) under an **upright** morphological blur/scale registration. The correspondence is unique among 75 manuscript scans under a source-conditioned whole-page search, with upper-crown holdout success. **A new all-secret original-rune obstruction rules out even arbitrary many-to-one static substitution** from the peeled p32 inner 9×9 runes to either 76-rune p55 or its 75-rune intact-body alternative, with any five/six deletions and reordering. The first register has 28 rune types and three count≥5 types; p55 has 25 types and seven count≥5 types, where no deterministic symbol map can exceed six at that distinct-type count. See [complete proof and tight genuine-original positive](lp2-p32-p55-peeled81-allsecret-noninjective-capacity.md). The tree resemblance remains an independently testable pictorial association, **not an established identical-source plate, a source-authored reading path, an encryption key, or decrypted plaintext.** The 2013 signed FOREST/TREES phrase has now also been checked in its original first-onion server context: it supplies no registered image transformation, glyph order, or p55 cipher instruction (see below).

## Contemporaneous 2013 FOREST/TREES clue: an image-to-key selection gate

The original January 2013 first-onion server exposed an interactive TCP command grammar `help, number, count, hello`, plus `clue`. Its `clue` command returned hexadecimal binary whose XOR with the already recovered 2013 CicadaOS `_560.00` file yielded the signed message **“You can't see the forest when you're looking at the trees.”** The original first-onion `hello` response separately gave the next onion `xsxnaksict6egxkq.onion`. These were operational alternatives in the 2013 socket protocol, several months before Liber Primus LP2 was delivered in May 2014. The first-onion HTML/TCP greeting displayed ASCII cicada art, rather than any matching p32/p55 botanical drawing. [Signed original clue](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2013/004-first-onion/clue.txt.asc) · [contemporaneous TCP command and XOR reconstruction](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2013/004-first-onion/README.md).

Read as a prospective *2013* instruction, the signed sentence identifies neither a future manuscript page nor a graphics operation. Re-reading it after the LP2 imagery became available suggests comparing the forest/trees at physical p32 (original scan49) and terminal p55 (scan72), but the source's nouns do **not** prescribe registered pixel subtraction, affine scaling, blur, threshold, negative-space selection, orientation, branch ordering, a numeric alphabet, or a whole-76-rune inverse. The two original pages have quite different framing: p32 presents one blurred dark tree alone beneath a six-line ciphertext block; p55 presents one pale detailed tree among separately drawn bilateral vines and a lower moth. Their unique specific outline/fill/crown correspondence is already independently preserved in the main image study below. The source sentence does not choose **which** picture components are its “forest” or define any reproducible glyph string or traversal. Calling the known p32→p55 visual match an instruction would therefore insert an unselected decoder at exactly the step where original ciphertext still needs one.

An independent source-shaped negative control is embedded in the historical problem itself: following the original 2013 socket server's `hello` output advances to the next onion **without** processing a tree image. Thus its actual documented continuation did not require this alleged 2014 visual opcode. This does not prove no artist hid a branch code, nor reject the real p32/p55 image relationship. It rejects this *specific cross-year signed forest sentence* as an already-authenticated 76-rune decoding rule. More cropping/threshold searches on p55 could only select parameters after seeing output and would add no author-origin key.

**Decision:** retire the FOREST/TREES→p32/p55 visual-decoder attribution until a dateable first-party source provides an actual pixel/branch-reading convention and a complete, repeatable 76-symbol consumer. The correct next test would need an unambiguous source-derived opcode and an untouched full-word p55 prediction; no new p55 plaintext or image-derived key is recovered here.

## Original images and source-locked experiment

- Source files: original 2400×3600 JPEG `49.jpg` SHA-256 `c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72` and `72.jpg` SHA-256 `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`.
- Independently cropped visually obvious tree fields: p32 original coordinates rows 2070–3229, columns 650–1809; p55 rows 1430–2509, columns 625–1734. Resize each crop to 360×360 pixels and invert intensity to positive ink.
- For the detailed p55 image, fit a tiny bounded source-image degradation grid: scale 0.84/0.88/0.92; elliptical dilation radius 4/6/9 pixels to compensate for p32's thick dark silhouette; Gaussian smoothing σ=6/9/12/15; and free 2D translation within the p32 crop. Optimize normalized cross-correlation only; use no ciphertext, rune/transliteration scores or page-specific keys.
- Optimize the same 36 transformations for an independent mirrored-tree orientation as an internal wrong-orientation control. This is a **descriptive, postselected image fit** rather than a population-calibrated significance test.

| P55 source orientation | Best image correlation | Best scale / dilation / Gaussian | Best translation in 360px crop |
| --- | ---: | --- | --- |
| Upright, unchanged | **0.790046** | 0.88 / radius6 / σ9 | (+10,+24) |
| Horizontal mirror | **0.628365** | 0.84 / radius6 / σ15 | (+0,+51) |

The upright alignment is **0.161681** higher after permitting the mirror its own optimal parameters. Using the single upright best fit, cross-correlation over the full target crop (including white background) is ~0.81. Many large branches and the trunk appear in corresponding coarse locations after blur, but p32 is a dark thick silhouette while p55 is a pale outline; no direct shared-pixel proof can survive the different rendering. Similar upright botanical silhouettes can correlate, and these results by themselves do not provide a probability of shared origin.

## Complete original-scan atlas discrimination

A second controlled test fixes a p55 tree degradation after the p32 fit, then uses it as a single 246×246 template against **all 75 original 2400×3600 JPEG scans**, scanned in full after a fixed 600×900 downsample. The p55 template uses thresholded ink (above 0.14), elliptical closing radius10 at atlas scale and Gaussian blur σ7. It scans *every location* in every page; normalized-correlation windows with near-zero source variance are excluded to prevent blank-page false scores. No rune values, words, page assignments or unknown plaintext are examined during this visual atlas comparison.

| Original combined-archive scan | LP2 relation | Best normalized coefficient |
| --- | --- | ---: |
| **49.jpg** | **blurred p32 tree** | **0.833989** |
| 72.jpg | sharp p55 source drawing itself | 0.493223 |
| 39.jpg | unrelated LP2 p22 graphics | 0.472907 |
| 31.jpg | other LP2 page | 0.365327 |
| 70.jpg | LP2 p53 artwork | 0.313328 |

**Robustness without shape fitting:** If the 246×246 p55 tree is merely Gaussian-blurred (σ7), with **no pixel threshold, dilation, or closing**, and searched over the identical full 75-image atlas, p32 remains the strongest match at **0.705856**, ahead of the p55 source page at **0.566388** and all 73 other pages (next unrelated score 0.480762). The target is localized at (176,543). This less elaborate, unfitted morphology corroborates the source-image relationship, while retaining the previously selected crop and scale.

**Result:** the intended target p32 image is the highest of all 75, with a **0.340766** coefficient gap from the runner-up, and is found at downsampled raster location (175,545), exactly its visibly printed tree region. This strengthens the claim of a specific visual relation beyond a generic upright-tree resemblance. Because the degradation/filter parameters were chosen after examining p32, the atlas ranking is *conditional* evidence, not a discovery-wide false-positive rate, and does not prove exact shared drawing provenance. The sharp p55 art has additional linework and a thin hollow trunk absent in p32's heavily blurred black silhouette.

## Source-outline-fill model and independent crown holdout (Agent8, 16 November 2026)

A distinct physical explanation of the two renderings is **filling enclosed contours in the thin-line p55 tree, then scaling and defocusing that silhouette**. Instead of selecting the transformation by matching the entire tree, a new test fits **only the lower trunk** in the original p32 crop and predicts the spatially disjoint upper branches. Crops are fixed original-image rectangles: p32 (650,2070,1810,3230) on image 49; p55 (625,1430,1735,2510) on image 72, each downsampled to 360×360. The trunk rows are 175–339 and the untouched crown rows are 40–174.

Each input undergoes the same 225 candidate descriptions: ink thresholds 15/25/35/45/55; raw outline, elliptical dilation radius 6, or binary **enclosed-hole fill**; Gaussian sigma 5/9/13; isotropic scale 0.80/0.85/0.90/0.95/1.0. Search translation ±45 pixels, maximizing Pearson/template correlation **only on the trunk rows**. Read out crown correlation at the trunk-selected translation and parameters without a second fit. Apply the *identical search* to horizontally mirrored p55, the independent p57 central plant and the earlier p8 margin sapling.

| Original model fitted to p32 trunk | Trunk correlation, trained | Upper-branch correlation, untouched holdout | Full-crop correlation under trunk fit |
| --- | ---: | ---: | ---: |
| **p55 upright outline, filled** | **0.914336** | **0.898599** | **0.893481** |
| p55 horizontally mirrored | 0.729074 | 0.733040 | 0.701847 |
| p57 independent sapling | 0.939195 | 0.583621 | 0.773941 |
| p8 marginal sapling | 0.490337 | 0.275500 | 0.281431 |

The upright p55 fit chooses (threshold15, binary hole-fill, sigma9, scale0.9, translation(-12,+1)). Notably, **p57 matches the trunk even better** after its own optimization but predicts a substantially worse upper crown, controlling for generic upright tree silhouettes. The 0.899 p55 held-region correlation is an independent spatial branch-shape correspondence *conditional on choosing this tree-pair family*. Filling enclosed outlines is physically interpretable and improves the earlier pure-dilation whole-image score (approximately 0.79–0.81). Residual inspection still shows broad mismatched branch details; this is neither an exact shared-art-source proof nor an authenticated author instruction, key or plaintext.

**Research fork:** treat p32/p55 as a substantially strengthened **specific candidate art-plate relationship**. The fixed-alphabet same-text channel is independently excluded above. Further cryptanalytic advancement requires an original-source instruction that **consumes the relationship** to select a rune order, key or operation, plus an untouched ciphertext prediction. Image correlation alone is insufficient; additional registration parameter searches are low value.

[Single-file, original SHA-gated trunk/crown reproducer](../sims/lp2_p32_p55_outline_fill_trunk_holdout_sft.py). Tested on the four unmodified original JPEGs on 16 November 2026.

## Direct Gaussian-blur rune transfer: deletion cannot recover p55 (Agent13, 18 November 2026)

The strong original-raster p32/p55 tree correspondence nominates a concrete visual operator. Regard the source's **121** p32 GP29 runes as an 11×11 matrix, convolve with the standard 3×3 separable Gaussian **[1,2,1; 2,4,2; 1,2,1]/16** in GF29, and retain the valid 9×9 interior: **81** rune values. The five-dot botanical motif could suggest deleting five cells to match all **76** original p55 runes, or deleting six cells to match the **75** after excluding its authentic one-rune carry from p54. Neither the grid, Gaussian operation nor specific deletions are written creator instructions; this is a bounded image-motivated receiver.

The unchanged source's **81 Gaussian outputs have only 91 identical-symbol unordered pairs**. Original p55 has **108** pairs, or **107** after the real carry. Deleting any five or six cells cannot increase the number of equal-symbol pairs. Arbitrary traversal and independent **secret stationary GP29 alphabet permutations** preserve this necessary condition. The complete sorted frequency spectra likewise contradict a deletion: the Gaussian output has only two classes used at least five times, whereas p55 has **seven** (including one class repeated six times). Thus *all* source-cell deletion sites and all such secret bijections are excluded, without guessing plaintext.

For direct unchanged GP symbols, the maximum longest-common-subsequence score across eight square orientations, both output directions and both p55 registers is only **23**, versus **76/75** needed; the unfiltered p32 centered 9×9 inset scores **24/76**. Two independently planted 81-rune Gaussian sequences with five/six deletions plus an invertible nonidentity affine GP29 relabeling pass the same frequency test and recover every original planted rune. [Original-input CommonJS SFT](../sims/lp2_p32_p55_gaussian_valid_sft.cjs) (**Windows Node.js 22 PASS**, [Actions run 44275150647](https://github.com/FlareZ123/liber-primus/actions/runs/44275150647)) checks the entire finite calculation.

**Decision:** the related drawings remain a concrete potential clue, but direct Gaussian transfer of the p32 *rune matrix* cannot explain p55 under deletion and any static secret alphabets. A stateful, nonlocal or independently keyed cipher requires its own source-selected operator. This does not establish either page's plaintext.

## Text identity under any stationary alphabet: exact key-independent exclusion (Agent15, 16 November)

The image relationship suggests an inexpensive, falsifiable explanation for the paired pages: their rune content might be **the same passage encoded under two distinct global GP29 substitutions**. A fixed arbitrary substitution on each side, no matter which of the 29! possible alphabets is used, necessarily induces **one fixed p32-rune → p55-rune map** at matching positions. Test its weakest, most permissive form, allowing *any* function rather than even requiring a bijection.

The original p32 has 121 GP runes and p55 has 76. For each of the **46** contiguous 76-rune p32 windows, both p32 reading directions and both p55 reading directions give **184** alignments. Count the number of times each pair of GP symbols co-occurs at matching positions. The exact maximum possible agreement under any arbitrary fixed map is the sum, for each source rune, of its most frequent target rune; other target labels at that source rune must disagree under every stationary map. Across all 184 alignments, the **best achievable is only 35/76 exact positions**. Even an arbitrary non-injective map therefore requires **at least 41 changed symbols**. Allowing every p32 cyclic starting point and all four directions produces **484** additional alignments; the best score is **39/76**, requiring **at least 37 changes**. There are zero exact maps, and a stricter global 29-symbol permutation cannot improve on those ceilings.

The [original-GP source SFT](../sims/lp2_p32_p55_tree_sameplaintext_function_sft.cjs) reads the unchanged p32/p55 indices, tests all 668 cases and validates the bound with a 76-rune genuine-source **invertible** positive plant `b=(7a+13) mod29`, recovered all 76/76 under both the exact function bound and independent inverse. The all-key exclusion depends on **a contiguous or cyclic shared plaintext interval and a stationary symbol replacement**, neither of which the artwork itself instructs. A position-varying pad, nonlinear state cipher, noncontiguous 11×11 mask, or entirely different illustrated prose is untouched.

**Decision:** strong shared-tree imagery does **not** license the cheap “same text, different fixed alphabet” route. This negative is distinct from the earlier additive shared-pad exclusion. Require an independent source-selected alignment or reversible operator before using the image association to construct a plaintext key.

## Repeated plaintext with independent period-13 keys (#2615, Agent5, 24 November 2026)

A source-motivated alternative to stationary substitutions is that the two trees mark the same underlying passage, enciphered with independent additive GP29 period-13 keys and the authentic latent plaintext-F convention. Freeze p55's complete 76 physical runes, including the incoming carry, and all 46 forward contiguous placements in the 121 physical p32 runes. Unknown independent initial phases are absorbed into key rotations. No requirement for word boundary matching is imposed.

For a consuming position, ciphertext pair (a,b) fixes the phase-relative difference d=(a−b) mod29 and forbids the corresponding first key symbol a (since consuming plaintext must be nonzero). At a double-zero pair both a consuming step and a transparent held F are permitted. Any conflicting difference or phase with all 29 key symbols forbidden kills the branch. This is the exact necessary/sufficient local constraint from the [cross-chapter difference-key study](lp2-period13-repeated-phrase-difference-key-gate.md), now with a fixed full-page receiver.

**Original:** 46 placements, 646 recursive states, no full paths. Maximum compatible physical/active prefix is only 14/76 at p32 zero-based offset 23; no held F on that path. Because every complete same-text encoding must supply a full path, the original does not admit any pair of keys under this law. The short maximum is not candidate plaintext.

**Controls:** six 76-rune excerpts from native WELCOME, each with 3 true transparent Fs, independently encrypted using two randomized q13 keys/phases, inserted at offsets 5,12,19,26,33,40 of 121-rune native tapes. Force one simultaneous generated ciphertext zero on a non-F. All six locate only their true offsets and recover all 13 true relative shifts along an admissible branch (two complete hold/consume paths each, 73 active and three holds on the true path). A separate independently encrypted genuine 42-rune first-KOAN repeated passage (offsets 62/419) also recovers its true placement. These are native-source synthetic key controls, not historical p32/p55 keys.

[Exact original-input CommonJS SFT](../sims/lp2_p32_p55_q13_sameplaintext_sft.cjs), connected JS execution; no CI run claimed. Retire this precise literal repeated-message receiver. The source-image association, other nonlinear or position-dependent mechanisms, different text spans, and other periods are outside this result. No source-authenticated key or unknown plaintext recovered.

## Original p32 11×11 inset → p55 76-rune all-deletion obstruction (Agent20, 16 November)

**Source-rooted premise:** The two pages have strongly related tree art (blurred p32, detailed p55). The following solved p57 text says “shed our own circumferences”. Original p32 has **121 runes = 11×11** and p55 has **76 runes**. If p32 runes are hypothetically placed row-major into an 11×11 square, shedding its *outer 40 cells* leaves a 9×9 **81-rune inset**. Removing **any five** inset cells would give exactly p55's 76 runes. The five-dot margin ornaments visible at p55 offer a weak numerical motivation for five more deletions, but they are a repeated decorative frame across p40–55 and **do not identify specific cells or prescribe this transformation**. The 11×11 square is a numeric hypothesis: the source prints the p32 text in six lines, not in such a square.

This yields an unusually sharp **key-independent necessary condition** for the hypothesis that both related trees mark **the same underlying 76-rune message** after deletion, arbitrary transposition, and wholly secret, *different stationary bijective GP29 substitutions* on the two pages. All these operations preserve the multiset of symbol frequencies, except that deleting cells can only **lower** existing frequency counts.

On the exact unchanged GP29 source:

| Original register | Rune count | Equal-symbol unordered position pairs | Distinct symbols each used ≥5 times |
| --- | ---: | ---: | ---: |
| Hypothetical p32 9×9 inset | **81** | **107** | **3** (W, B, IA; each six times) |
| Full p55, including carried first rune | **76** | **108** | **7** (S six times; C, I, EO, B, E, M five times each) |
| p55 after excluding its authentic one-rune p54 carry | **75** | **107** | **7** (same seven symbol labels) |

**First exact contradiction:** No choice of five deletions from the p32 inset can *increase* its 107 identical-symbol pairs to the **108** in full p55. Arbitrary reordering, unknown GP29 alphabet relabeling and choice of deleted positions cannot fix this.

**Stronger carried-rune control:** If the p55 first rune, known to be carried from p54, is excluded, an 81→75 transformation requires **six arbitrary deletions**. Pair counts 107/107 alone are inconclusive, but p32 inset contains only **three** distinct symbols with multiplicity at least five, whereas p55's remaining 75 contain **seven** such symbols. Deletion and bijective relabeling cannot create four new high-multiplicity classes. The exact sorted frequency-spectrum test therefore rules out **every choice of the six omitted cells**, every traversal order, and every pair of arbitrary stationary one-to-one page alphabets. It does not depend on assuming the removed five/six symbols are central or source-labelled. The same ≥5-class argument also excludes full p55.

The [single-file Node.js 22 original-source reproducer](../sims/lp2_p32_p55_inset_fiveshed_invariant_sft.cjs) asserts the 121/81/76/75 source lengths, both identical-pair totals, the high-frequency counts, and exact full ranked-histogram impossibility. It also plants **two synthetic 81-rune insets** containing independent, genuinely clear p57 original-source 76-/75-rune passages transformed under a nonidentity invertible GP29 affine alphabet, plus five/six filler runes. Both plants pass the same all-secret histogram feasibility check. Those positive plants establish the gate does not reject genuine matching plaintext generated by the stipulated architecture.

**Interpretation:** The shared-tree image relation is genuine and may still indicate a key path, page dependency, transformation of *different* messages, a state-dependent alphabet or arbitrary extra cipher layers. But the elegant 121→81→76 numerical reduction **cannot reveal the same text under any one-symbol-to-one-symbol stationary bijective cipher**, even with unconstrained extra-cell locations or a completely permuted text order. This is a decisive, bounded no-go theorem that makes additional five-dot deletion-pattern tuning pointless in this family. It recovers no authentic unknown plaintext.


## Naive 29-tip alphabet test on the original p55 tree (Agent33, 17 November 2026)

**Decision:** The clear terminal tree alone does not define a robust 29-symbol key by simply counting the tips of its raster skeleton. This is a narrow original-image geometry constraint, not an exclusion of hand-specified leaf paths or other tree-dependent codes. A graphic that is deliberately drawn with 29 branches can be a plausible human puzzle hint, but an image-threshold-selected count needs to survive its own unprescribed rendering parameter.

The [new read-only source-SHA-gated experiment](../sims/lp2_p55_tree_29tip_source_gate.py) uses unchanged p55 scan `72.jpg`, crops the previously independently registered tree rectangle (x625–1735, y1430–2510), downsizes to 370×360, fills holes after a fixed radius-two binary closing, keeps the largest connected component, and skeletonizes it. Nine natural grayscale thresholds from 205 to 245 return **39–74 raw skeleton endpoints** (thresholds 205/210/215/220/225/230/235/240/245 yield 74/71/65/61/55/60/58/53/39). Even after twelve uniform endpoint-pruning iterations, the counts are **29/26/35/32/30/33/31/32/21**, with no common fixed 29. An independent planted comb tree containing exactly 29 leaf branches and one root returns a stable **30 endpoints** under the same morphology, demonstrating that this instrumentation can represent an actual prescribed leaf count.

This tests a concrete direct alphabet-consumer suggestion without searching character keys or fitting English. It does **not** recover an authentic original rune order, address, decoder, or plaintext. The paired tree art still provides a genuine source-level candidate relation documented above, but the graphic needs a separately specified segmentation and branch traversal before its numerical leaves could be used as cipher operands; tuning a raster threshold until 29 appears would make the key post-selected.


## Branch-junction topology check (Agent5, 17 November 2026)

The prior report's proposed next experiment—compare branch-junction topology after the fixed trunk/crown registration—has now been run on the exact repository originals. The uploaded ZIP images are byte-identical to the repository blobs: p32 `49.jpg` Git blob `1a8fa8978bad0efc088e5ae247ceba69b2f29c27` (SHA-256 `c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72`); p55 `72.jpg` Git blob `ee00cd34013fe3a5c6808650abb6d3206b6f1b13` (SHA-256 `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`).

The source-fixed p55 model remains threshold 15, enclosed-hole fill, Gaussian sigma 9, scale 0.90, registered only against p32 trunk rows 175–339. It independently reproduces translation `(-12,+1)`, training correlation **0.914336**, upper-crown holdout correlation **0.898599**, and full-crop correlation **0.893481**.

For topology, p32 ink was thresholded at 20/255 and the aligned p55 model at 0.20; both were skeletonized with 8-neighbour connectivity. Results:

| Measure | p32 target | transformed p55 |
|---|---:|---:|
| Skeleton pixels | 1,011 | 865 |
| Endpoint clusters | 11 | 9 |
| Junction clusters | 11 | 7 |
| Junction pixels | 31 | 19 |
| Endpoint/junction clusters after 20-pixel endpoint-spur pruning | 8 / 10 | 7 / 6 |

The p32 graph is threshold-sensitive: over target thresholds 10, 15, 20, 25, 30, 35, 40, endpoint/junction counts are respectively **12/10, 14/14, 11/11, 12/14, 12/14, 15/17, 15/15**. The fixed transformed-p55 threshold remains **9/7**. Thus the graph is not identical or stable under the original rendering; matching the counts would require threshold selection after seeing the target.

The major skeleton lines nevertheless align coarsely: mean bidirectional skeleton coverage is **0.8333 within 8 px** and **0.8980 within 10 px**. This is consistent with the earlier silhouette-level similarity, but not with a one-to-one branch graph or a reproducible branch-derived rune order. No stable 29- or 43-feature key emerges.

Reproducer: [`sims/lp2_p32_p55_tree_topology_sft.py`](../sims/lp2_p32_p55_tree_topology_sft.py). It records the fixed crops, source model, trunk-only registration, skeleton thresholds, graph counts, pruning and tolerance metrics. Tested with Python 3.12, NumPy 2.3.5, OpenCV 4.13.0, SciPy 1.17.0 and scikit-image 0.26.0.

## Independent mixed-period shared-text recovery and all-phase-alphabet relaxation (Agent14, 24 November 2026)

The two authentic keyword periods are 8 (WELCOME) and 13 (second KOAN). The earlier same-period q13 additive inverse does not address the possibility that the related trees mark the same passage under different historical periods. Freeze the full original 76-rune p55 tape (including its incoming carry), each of 46 forward contiguous placements within p32's 121 runes, the two mixed period orders, and the shared native transparent plaintext-F clock. Printed cuts are deliberately ignored as in #2615. No source identifies these periods for these pages; this is a concrete repeated-content hypothesis, not an authenticated clue.

For consuming position t, a=P+K[t mod qA] and b=P+J[t mod qB] modulo29. Thus a−b fixes a weighted bipartite phase edge K−J. Graph propagation gives relative offsets: a nonzero cycle sum is a contradiction; in a connected phase component only a common additive gauge remains, and each consuming observation forbids the gauge making P=F. Enumerate every common double-zero hold mask, including consuming double zeros. A surviving connected graph yields at most 29 candidate plaintext tapes, each replayable under its inferred keys.

The all-secret bijection relaxation uses equality closure: equal ciphertext labels under the same side/phase force equal plaintext, and different labels under that side/phase force different plaintext. Union-find gives equality classes; a conflict is an exact impossibility. Otherwise a 28-color witness on the inequality graph constructs non-F plaintext and injective partial phase maps extendable to full 29-symbol bijections. Greedy coloring failure is reported unresolved, never as impossibility. The same-period q8/q13 relaxation includes the earlier additive cases; their additive search is not repeated.

| qA/qB | Receiver | Alignment/mask pairs | Full compatible masks | Distinct placements | Longest compatible prefix |
|---|---|---:|---:|---:|---:|
| 8/8 | permutation | 53 | 0 | 0 | 29 |
| 8/13 | additive | 53 | 0 | 0 | 22 |
| 8/13 | permutation | 53 | 45 | 39 | 76 |
| 13/8 | additive | 53 | 0 | 0 | 22 |
| 13/8 | permutation | 53 | 41 | 36 | 76 |
| 13/13 | permutation | 53 | 0 | 0 | 28 |

**Every mixed-period additive key fails**, with max compatible prefix22 in either direction, and arbitrary independent same-period permutations also fail. No complete additive candidate exists to score. Conversely mixed-period arbitrary phase maps are genuinely satisfiable: both give constructive 76-rune witnesses at offset0 with no true F holds, using 10 and 9 nonzero plaintext colors respectively. Globally relabeling those colors alone gives at least 47621141568000 and 2506375872000 distinct feasible tapes, before other colorings, key completions or placements. These are arbitrary graph assignments, not recovered language. Mixed-period arbitrary permutations have no identifying value without a source constraint selecting the phase alphabets or a new plaintext relation.

Controls: four distinct solved native sections (WELCOME, WISDOM, KOAN1, LOSS OF DIVINITY), 121-rune excerpts, embedded 76-rune repeats, independent hidden keys/phases and forced consuming double zeros. All eight mixed additive plants locate only the true placement and retain exact native plaintext among 7–13 gauge candidates. All sixteen phase-permutation plants retain the true placement, mask and native plaintext; the eight same-period plants locate uniquely, whereas mixed-period plants retain 25–46 placements. No original coloring branch is unresolved. The controls are synthetic encipherments of genuine native text, not historical keys. Source blobs: 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, 1b064ef6d85819b7d96adaff31a82d1ec551598f. Connected JS execution; no CI claim.

[Read-only SFT](../sims/lp2_p32_p55_mixed_period_sameplaintext_sft.cjs) · [executed summary, all surviving mask coordinates and first witnesses](../im-results/lp2-p32-p55-mixed-period-sameplaintext-output.json). No unknown LP2 plaintext, key or destination. Retire the fixed mixed additive and same-period phase-bijection repeated-message routes; do not tune arbitrary mixed phase maps to manufacture prose.

## Cryptanalytic decision

The paired p32/p55 trees remain a **genuine silhouette-level visual correspondence**, but the source-locked branch-junction test does not preserve an identical or stable graph. The simplest claim that the p55 image is a topology-preserving copy of p32 is therefore unsupported; the relation may be a shared motif, a heavily transformed rendering, or a filtered/degraded variant with lost fine branches. Neither interpretation selects a rune order, key, page reset or reversible cipher operation.

The earlier 121→81→76 stationary-bijective same-message family remains excluded, and the naive 29-tip count remains threshold-unstable. Independent mixed period-8/13 additive repeated-text keys and same-period arbitrary phase bijections are excluded for all 46 forward placements with all common latent-F masks. Mixed-period arbitrary phase alphabets admit numerous non-language witnesses, so their feasibility supplies no identifying evidence or authenticated key. No authentic unknown plaintext, key, or destination follows from this visual relation.

**Disposition:** retain the visual correspondence as provisional context, but close branch-count and branch-junction mining. Reopen only if an author-era vector/source plate, caption, or independently authenticated clue specifies a unique branch traversal or tells the solver how the image consumes original rune material. Do not tune image thresholds, count branches until 29/43 appears, or attempt another ciphertext inverse without that selector.

Overall established research remains in [results/README.md](../results/README.md); this image association remains provisional and belongs only here.
