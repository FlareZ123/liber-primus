# Base-60 high/low digit secret-lookup gate on the terminal 180 known runes

**Status (13 November 2026, Agent 29): exact source-input exclusion of one broad, unselected cipher architecture. No unknown plaintext, key or destination recovered.**

## Why this is a concrete original-inverse question

Original physical LP2 pp49–51 print a **32×8 grid of 256 two-character base-60 numerals**. The last three original pages contain **76 unknown p55 runes**, **85 solved p56 runes** and **95 clear p57 runes**, giving the same 256 slots. The ordinary first concentric ring has 76 sites; the remaining rings have 68, 60 and 52, giving exactly **180 known slots**. The p57 text tells readers to *shed circumferences*, motivating (without authenticating) a concentric layout.

The printed two-digit notation suggests a particularly simple digit-structured decoder that can be tested **without choosing a secret key**:

`P[r,c] = f(floor(B[r,c]/60)) + g(B[r,c] mod 60) mod 29`

Here `B` is the original printed byte value, `P` is the GP29 plaintext assigned to the interior, and **every value** of the two hidden digit tables `f` and `g` is arbitrary. The high digit has five possible values (0–4); the low digit has 60 possible values (59 seen in this actual table), for **65 unrestricted GP29 unknowns**. Secret global output shifts and nonzero rescalings are absorbed by the unrestricted tables. No literary plaintext score is needed.

## Original inputs and completed test

The [single-file Node 22 SFT](../sims/lp2_terminal256_base60_digit_lookup_sft.cjs) reads the unmodified `resources/liber-primus/base60-grid.json` and `resources/liber-primus/lp2-corpus.json`; it asserts all **85** p56 known plaintext symbols through the authentic prime-totient inverse (with the **one literal F at p56 offset56** holding the clock), then appends all **95** p57 clear symbols.

Each inner ring independently permits four corner starts in either direction. Thus the all-secret test includes **8³ = 512** possible p56–57 placements while leaving all 76 unknown p55 runes untouched. For any placement, each observed printed digit pair generates `f[high]+g[low]=known GP rune (mod29)`. Weighted union-find tests these equations exactly: setting `F[high]=f[high]` and `G[low]=-g[low]`, every equation becomes the difference of two unknown vertex potentials on a bipartite graph. A cycle with inconsistent modular total **proves no hidden tables can fit**, without guessing their 65 symbols.

**Result:** all 512 original known-interior assignments are inconsistent. The earliest contradiction under the best route occurs at known-rune offset **24**; its pivot-order witness has **106 inconsistent dependent equations among 180 observations** (with **60 independent constraints**, ring route **[7,5,2]**), while the worst has 119. This mismatch count is a *deterministic union-find witness*, **not** a globally minimized number of substitutions needed to fit the data. The exact histogram across routes is in SFT output.

A separate planted 180-rune GP29 source-shaped positive control uses two independently chosen nonconstant tables on genuine numeral pairs and is accepted with **zero contradictions and 180/180 values**.

## Decision and scope

The source-visible two-character numeral grammar cannot yield the 180 solved symbols under **any** stationary additive independent high-/low-base60-digit GP29 decoder in the 512 tested source-ring orientations, even when every lookup entry is free. A p55 decoder of this form would have to explain that original known interior; this necessary condition fails.

The 76+180 alignment is retrospective, and the first p55 rune continues a word from p54. The test cannot exclude stateful maps, nonlinear combinations, page transforms, different radix or placement, or other keys; it does **not** reject the manuscript's actual cipher. This belongs with experimental source constraints and does not change the [authoritative synthesis](../results/README.md). Do not expand the branch through fitted phases without a new independent source selector.
