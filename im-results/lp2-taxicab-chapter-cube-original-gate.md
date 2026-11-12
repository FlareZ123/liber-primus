# Original chapter 729 / 1729, Onion7 133 / 331 and bounded reversible readouts

**Classification:** exact cross-artifact arithmetic, motivated but unselected cipher hypotheses, and original-cipher negative tests with a reproducible plaintext-positive control. **No unknown LP2 plaintext, authentic key or author-selected inverse has been recovered.**

## Source relationship and intended-path question

The [original-image chapter atlas](lp2-global-original-visual-section-map.md) selects source-visible LP2 chapters pp0–2, pp3–7 and pp8–14, with respectively **729**, **1,145** and **1,729** Gematria Primus runes. The first and third exhibit the exact arithmetic:

- **729 = 9³ = 27²**, the basis for the separate provisional pp0–2 27×27 interpretation.
- **1,729 = 9³ + 10³ = 1³ + 12³** (the Hardy–Ramanujan taxicab number).
- **1,729 = 13 × 133 = 7 × 13 × 19**.

The preserved original May-2014 LP2 Onion7 delivery HTML, [`resources/cicada2014-onion7-index.html`](../resources/cicada2014-onion7-index.html), contains **`<title>133</title>`** and **`<div id="331">`**. These source numbers now have two separate conditional links to original book material: **13 × 133 = 1,729** uses the p8–14 chapter's entire rune length; the p0 red 13-rune heading's GP-prime sum, already independently established as **662**, is **2 × 331**.

This is a potentially useful cross-chapter address/key-source hypothesis: an original solver could inspect the browser title and page source, observe the repeated 13-dot punctuation, and try a 13×133 reading of a 1,729-rune unit. The 2014 HTML archive is **unsigned** and its numerical elements do **not** explicitly tell the solver which unit to choose, whether to transpose it, how to use 331, or how to decrypt it. The relations were connected after observing both source artifacts; their numerical exactness alone does not establish Cicada intent.

The separate factorization 7×13×19 also recalls the seven physical chapter scans, the 13-dot form and the independently known 19-word p57 PARABLE body, but there is no source instruction selecting that combined interpretation. Actual pp8–14 per-image rune counts are **[255, 268, 263, 273, 261, 272, 137]**. In particular, these do **not** provide seven physical 247-rune layers. A cube or cuboid packing crosses printed page boundaries.

## Original ciphertext and finite inverse tests

The [CommonJS one-file reproducer](../sims/lp2_taxicab_chapter_cube_sft.cjs) reads the **original 29-symbol page corpus**, constructs source-fixed candidate layouts, and learns a conditional GP29 trigram language model solely from the first **75%** of the checked-in Shakespeare reference. All scores below are mean natural-log conditional probabilities per GP rune (higher is more language-like). The final 25% supplies **45 untouched native-English windows** of 1,729 runes, scoring from **−2.572122 to −2.222880**. A native 729-rune positive plant is transposed under a nontrivial 3D key and recovered **exactly** by the inverse.

### Eight cube/cuboid framings

For each framing, exhaust **48 exact reversible 3D axis reads**, comprising the six axis orders and eight independent axis reversals.

| Source-fixed input and geometry | Rune count | Raw GP score | Best of 48 GP scores |
|---|---:|---:|---:|
| Entire pp0–2 as 9×9×9 | 729 | −5.912137 | −5.873146 |
| First 729 pp8–14 as 9×9×9 | 729 | −5.918111 | **−5.693697** |
| Last 1,000 pp8–14 as 10×10×10 | 1,000 | −5.939389 | −5.793325 |
| First 1,000 pp8–14 as 10×10×10 | 1,000 | −5.929605 | −5.814128 |
| Last 729 pp8–14 as 9×9×9 | 729 | −5.935464 | −5.749902 |
| Drop first pp8–14 rune, then 12×12×12 | 1,728 | −5.931061 | −5.804418 |
| Drop last pp8–14 rune, then 12×12×12 | 1,728 | −5.929227 | −5.800895 |
| Entire pp8–14 as 7×13×19 | 1,729 | −5.931833 | −5.786757 |

### The original HTML 133 / 331 consumer

With **1,729 = 13×133** fixed, a second finite test evaluates the most literal historical-number readings:

| Source-nominated operation | Exhausted finite family | Best original GP trigram score |
|---|---|---:|
| 13×133 / 133×13 row-column reading | 32 axis, direction and alternating-row orientations | **−5.721056** |
| 331-step circular walk modulo 1,729 | Both step signs, starts 0 / 13 / 133 / 331; all steps are reversible | **−5.819662** |
| Vigenère using **p0's 13 red GP rune indices** | 192 arrangements: row / column / repeated 13-position key, key reversed or forward, both arithmetic signs, both rectangular packings and axis reversals | **−5.682384** |

All original outputs remain far below the independently measured GP-native English register. The visibly available 13-rune p0 key and literal HTML addresses do not produce usable plaintext under these direct operations. The exact positive inverse controls mean this is a negative result on **these original-source consumers**, not a broken implementation.

The frozen experiments are sufficiently narrow to prevent regenerating the same dozens of direct geometry and red-key choices. They do **not** exclude cipher-dependent position walks, authenticated source instructions that select a different mapping, a genuinely independent secret, multi-layer transformations, different languages or binary intermediates.

## Research decision

Retain the exact source links **(729, 1729, 133, 331, 662)** as a **conditional address/key-source lead**, with its limitations explicit. **Do not promote them to an established cipher architecture or plaintext**. The specific 616 direct invertible candidates above are original-negative. The missing ingredient is a **source-selected operation**: an original instruction fixing both a traverse/order and the treatment of rune values, preferably one that predicts plaintext outside the opening numerical coincidences. Until such evidence appears, expanding arbitrary 13×133 keys and walks will probably repeat the same post-selection failure.

**Reproduction:** `node sims/lp2_taxicab_chapter_cube_sft.cjs`, Node.js 22 from the repository root, with no external packages or file writes.