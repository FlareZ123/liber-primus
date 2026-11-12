# Original chapter 729 / 1729, Onion7 133 / 331 and circumference extraction

**Classification:** exact cross-artifact arithmetic, motivated but unselected cipher hypotheses, and original-cipher negative tests with a reproducible plaintext-positive control. **No unknown LP2 plaintext, authentic key or author-selected inverse has been recovered.**

## Source relationship and intended-path question

The [original-image chapter atlas](lp2-global-original-visual-section-map.md) selects source-visible LP2 chapters pp0–2, pp3–7 and pp8–14, with respectively **729**, **1,145** and **1,729** Gematria Primus runes. The first and third exhibit the exact arithmetic:

- **729 = 9³ = 27²**, the basis for the separate provisional pp0–2 27×27 interpretation.
- **1,729 = 9³ + 10³ = 1³ + 12³** (the Hardy–Ramanujan taxicab number).
- **1,729 = 13 × 133 = 7 × 13 × 19**.

The preserved original May-2014 LP2 Onion7 delivery HTML, [`resources/cicada2014-onion7-index.html`](../resources/cicada2014-onion7-index.html), contains **`<title>133</title>`** and **`<div id="331">`**. These source numbers now have two separate conditional links to original book material: **13 × 133 = 1,729** uses the p8–14 chapter's entire rune length; the p0 red 13-rune heading's GP-prime sum, already independently established as **662**, is **2 × 331**.

This is a potentially useful cross-chapter address/key-source hypothesis: an original solver could inspect the browser title and page source, observe the repeated 13-dot punctuation, and try a 13×133 reading of a 1,729-rune unit. The 2014 HTML archive is **unsigned** and its numerical elements do **not** explicitly tell the solver which unit to choose, whether to transpose it, how to use 331, or how to decrypt it. The relations were connected after observing both source artifacts; their numerical exactness alone does not establish Cicada intent.

The separate factorization 7×13×19 also recalls the seven physical chapter scans, the 13-dot form and the independently known 19-word p57 PARABLE body, but there is no source instruction selecting that combined interpretation. Actual pp8–14 per-image rune counts are **[255, 268, 263, 273, 261, 272, 137]**. In particular, these do **not** provide seven physical 247-rune layers. A cube or cuboid packing crosses printed page boundaries. The 13×133 rectangle also remains a proposed packing because the source provides no printed 13-column or 133-column grid.

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

## More constrained source instruction: shedding circumferences

The authentic solved physical p57 PARABLE says we must **shed our own circumferences** and **find the divinity within**. Applying that literal operation to the **13×133 rectangle suggested by the independently archived title `133` and source-visible 13-dot marks** yields an exact, non-overlapping source-cipher partition. Strip nested clockwise perimeter rings, from outside inward:

| Shell depth | Remaining rectangle | Number of rune positions |
|---|---|---:|
| 0 | 13×133 | 288 |
| 1 | 11×131 | 280 |
| 2 | 9×129 | 272 |
| 3 | 7×127 | 264 |
| 4 | **5×125** | **256** |
| 5 | 3×123 | 248 |
| Center | **1×121** | **121** |

The shell lengths form the exact arithmetic progression **288, 280, 272, 264, 256, 248**, decreasing by **8** per peel, independently echoing the source's eight printed table columns. The **fifth circumference has exactly 256 runes**, the same number of cells as the original printed 32×8 numeric table on physical pp49–51. The **innermost row has exactly 121 runes**, equal to the independently printed GP29 rune count of the illustrated tree page **p32**. All seven disjoint spans partition the **original 1,729 runes exactly**, without duplicate cells or unused positions. This creates two concrete, source-length-matched prospective consumers:

1. Pair the 121-symbol innermost extracted row with the source's actual 121-symbol p32 text, permitting the eight ordinary 11×11 orientations of the latter.
2. Pair the 256-rune fifth ring in clockwise perimeter order with the **256 original p49–51 decoded table bytes**, keeping the published row-major byte order.

These original-source coincidences are more directly connected to a solved manuscript instruction than the taxicab numerology. They nevertheless remain **conditional on choosing the 13×133 rectangular packing**, which no original source explicitly requires. The 121 and 256 matches follow arithmetically from the original rectangular dimensions once that packing is chosen; they are not three statistically independent confirmations.

The new [perimeter extraction and independent-key source SFT](../sims/lp2_onion7_133_perimeter_p32_grid_sft.cjs) ([passed original-input CI run 43147107754](https://github.com/FlareZ123/liber-primus/actions/runs/43147107754)) constructs all shell addresses from the original chapter bytes and asserts a perfect **1,729/1,729 unique-address partition**. It then tests two bounded direct GP29 reversible consumers and source-native positive plants:

| Consumer | Original inverse family | Raw source score | Best GP trigram score | GP-native heldout control |
|---|---|---:|---:|---:|
| Inner 121 + p32's 121 runes | 32 direct ±Vigenère, eight 11×11 orientations and center reversal | −6.115142 | **−5.158904** | −2.319106 |
| Fifth shell 256 + original table bytes | 24 ±byte/GP prime-residue key operations, forward/reverse input and key | −5.953164 | **−5.422267** | −2.243389 |

A full-length heldout GP-English **121-rune source-native plant** decrypts exactly under original p32 GP29 key subtraction. A **256-rune heldout plant** decrypts exactly under the original table bytes reduced modulo 29. All 56 tests on the unmodified original manuscript remain far below native-GP English. These bounded negatives retire **direct additive consumption** with those exact sources; they do **not** reject the clue-constrained **perimeter extraction** itself or a separate, independently directed operation using its 121/256 outputs.

The decisive next research question is now **whether an original image, signed message, p32 tree shape or p49–51 table annotation selects how to consume a stripped shell, with a fixed direction and one prediction on untouched text**. In particular, do not expand to arbitrary fitted permutations of the 121- or 256-element source blocks without a physical/source route selector.

## Research decision

Retain the exact source links **(729, 1729, 133, 331, 662)** as a conditional address/key-source lead, and elevate the **precisely defined 13×133 circumference extraction** as an executable, original-rune-preserving *hypothesis* specifically motivated by solved p57. The arithmetic produces two usable length-matched inputs, **121 source runes and a 256-rune ring**, whose source consumers exist elsewhere in the original manuscript. No authenticated plaintext, key or source-selected consumption of those inputs has been recovered. The 616 direct geometric/Vigenère reads and 56 additive source consumers are original-negative; they should not be retested without a new source operation or genuine independent discriminator. The two shell lengths follow from the hypothesized rectangle and do not authenticate it.

**Reproduction:** `node sims/lp2_taxicab_chapter_cube_sft.cjs` for the 616 cube/rectangle/331/red-key hypotheses ([passed GitHub Actions CI](https://github.com/FlareZ123/liber-primus/actions/runs/43146016562)); `node sims/lp2_onion7_133_perimeter_p32_grid_sft.cjs` for the exact shell partition, original 121/256 comparisons and direct positive plants. Both are Node.js 22 CommonJS from repository root and perform no writes. The latter also [passed its complete 121/256-shell original-input and native-positive test in GitHub Actions](https://github.com/FlareZ123/liber-primus/actions/runs/43147107754).