# Blurred p32 tree and clear p55 tree: original-raster correspondence gate

**Agent9, 16 November 2026.** The previously uninterpreted blurred tree below LP2 p32 (original scan `49.jpg`) aligns conspicuously with the pale detailed tree on terminal p55 (scan `72.jpg`) under an **upright** morphological blur/scale registration. The correspondence is unique among 75 manuscript scans under a source-conditioned whole-page search. This is an independently testable pictorial association, **not an established identical-source plate**, a source-authored reading path, an encryption key, or decrypted plaintext.

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

## Text identity under any stationary alphabet: exact key-independent exclusion (Agent15, 16 November)

The image relationship suggests an inexpensive, falsifiable explanation for the paired pages: their rune content might be **the same passage encoded under two distinct global GP29 substitutions**. A fixed arbitrary substitution on each side, no matter which of the 29! possible alphabets is used, necessarily induces **one fixed p32-rune → p55-rune map** at matching positions. Test its weakest, most permissive form, allowing *any* function rather than even requiring a bijection.

The original p32 has 121 GP runes and p55 has 76. For each of the **46** contiguous 76-rune p32 windows, both p32 reading directions and both p55 reading directions give **184** alignments. Count the number of times each pair of GP symbols co-occurs at matching positions. The exact maximum possible agreement under any arbitrary fixed map is the sum, for each source rune, of its most frequent target rune; other target labels at that source rune must disagree under every stationary map. Across all 184 alignments, the **best achievable is only 35/76 exact positions**. Even an arbitrary non-injective map therefore requires **at least 41 changed symbols**. Allowing every p32 cyclic starting point and all four directions produces **484** additional alignments; the best score is **39/76**, requiring **at least 37 changes**. There are zero exact maps, and a stricter global 29-symbol permutation cannot improve on those ceilings.

The [original-GP source SFT](../sims/lp2_p32_p55_tree_sameplaintext_function_sft.cjs) reads the unchanged p32/p55 indices, tests all 668 cases and validates the bound with a 76-rune genuine-source **invertible** positive plant `b=(7a+13) mod29`, recovered all 76/76 under both the exact function bound and independent inverse. The all-key exclusion depends on **a contiguous or cyclic shared plaintext interval and a stationary symbol replacement**, neither of which the artwork itself instructs. A position-varying pad, nonlinear state cipher, noncontiguous 11×11 mask, or entirely different illustrated prose is untouched.

**Decision:** strong shared-tree imagery does **not** license the cheap “same text, different fixed alphabet” route. This negative is distinct from the earlier additive shared-pad exclusion. Require an independent source-selected alignment or reversible operator before using the image association to construct a plaintext key.

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

## Cryptanalytic decision

The exact original 9×9 inset frequency obstruction above now rules out the entire visually suggested five/six-cell-deletion same-message family under any stationary bijective GP29 alphabet and arbitrary text order. The orientation-specific full-artifact match otherwise supplies a concrete candidate human visual route: an observably blurred, earlier manuscript tree points toward a later sharper tree in an art-rich terminal sequence. **Its strongest unsupported premise** is that Cicada intended image identity/clarification to select a text transformation, rather than repeating a general tree motif; no artist-provided matching plate/branch index, unique original-p32-to-p55 rune correspondence, alphabet change, word order, key or decoding operation has been located. This does not revive the already failed p32 11×11 center-to-word modulo19 route (#1237), nor the p55 independent decoder gate (#41).

Useful next action: independently establish whether the drawings share *branch-junction topology* using features surviving p32 blur, or find an exact source artwork/caption showing one is a filtered copy. **Only if** the source gives a uniquely selected order or key should a blinded ciphertext inverse be attempted. Avoid fitting paths through p32 or p55 based on linguistic fragments.

[Original-image, SHA-gated, read-only reproducer](../sims/lp2_p32_p55_tree_blur_registration_sft.py). Related original p32 tree negative (different from the signed 2016 oak) and failed five-peel interpreter: [closed #1237](https://github.com/FlareZ123/liber-primus/issues/1237). Overall established research remains in [results/README.md](../results/README.md); this image association remains provisional and belongs only here.
