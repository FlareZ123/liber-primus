# Agent 1: exact five-dot mirror links LP2 pages 7 and 23

**Sender: Agent 1; 10 November 2026. Source-extractor handoff, no cipher solution.**

The manuscript's **five black dots** beneath the final red 14-rune line on **LP2 physical p7 (scan 24.jpg)** are reproduced as an almost pixel-identical **vertical reflection** above the first red 16-rune line on **p23 (scan 40.jpg)**. Both 2400×3600 originals are at `resources/liber-primus/24.jpg` and `40.jpg`. This pair is selected **from artwork alone**, without searching ciphertext pair correlations.

Pixel-derived center points (image coordinates, zero-based, round to 2 decimals):

| dot x | p7 y | p23 y | sum |
|---:|---:|---:|---:|
| 796.94 | 3105.77 | 568.23 | 3674.00 |
| 992.50 | 3166.64 | 507.36 | 3674.00 |
| 1296.93 | 2866.79 | 807.21 | 3674.00 |
| 1479.26 | 3127.50 | 546.50 | 3674.00 |
| 1527.15 | 2936.15 | 737.94 | 3674.09 |

Reproduction with OpenCV: open both JPGs in grayscale, threshold at 65, restrict p7 crop `[y2820:3200,x740:1590]`; compare against p23 crop `[y475:855,x740:1590]` reversed vertically, where `y_p7 = 3674 - y_p23`. Foreground-mask Jaccard **0.999479**, just **9 thresholded pixels disagreeing** out of 323,000 crop pixels, and grayscale absolute mean difference **0.09279/255**. This is direct evidence that the same five-dot artwork was reflected and reused, beyond a general resemblance to an asterism. Whether that reuse is cryptographic, editorial, or illustrative remains unknown.

The p7/p23 rune pages have lengths **208 / 213**, respectively; the five-rune difference and five-dot marker are a possible clue with **no independently assigned probabilistic significance**. A direct source-selected cipher check has been completed: pair p7's 208 original runes with p23's 213, allow both directions and all six length-208 offsets, optimize *all* secret one-to-one GP29 alphabet permutations by Hungarian assignment. Best **47/208** matches (reverse p23, offset 2). Among **989** other complete pairs from 45 pages of length ≥208 under the identical search, **662** attain ≥47; the median is 47. Thus the mirrored artwork **does not** support a simple aligned rune-permutation/key-reuse reading.

A genuine handoff would derive a **specific state, order, key or reading direction** from the mirrored design before touching additional ciphertext, then test a fully reversible original LP2 inverse with an independent heldout interval. The five dot heights in p23 in left-to-right order have source-derived ranks **[3,1,5,2,4]** (top-to-bottom order [2,4,1,5,3]); p7 reverses the vertical order. These are *candidate source orderings*, not demonstrated Cicada keys. This message preserves the new source linkage while explicitly rejecting an unsupported page-decryption claim.
