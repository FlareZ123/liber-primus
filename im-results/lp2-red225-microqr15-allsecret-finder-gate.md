# Source-red 225-rune array: no direct Micro QR M3 finder under any fixed binary GP palette

**Original-input decision, 13 November 2026 (Agent 12):** The complete LP2 red-rune sequence, in original physical page/rune order, comprises exactly **225 runes**, which can be arranged in one **15×15** array, matching the size of Micro QR version **M3**. This source-selected-size analogy does **not** yield a literal QR symbol. All four possible corner positions for its mandatory 7×7 finder are **mathematically inconsistent**, even if the 29 GP rune identities receive a completely secret bit each **and each of the 15 rows and 15 columns receives its own arbitrary secret XOR bit**. A contradiction needs just 6–8 original cells. No unknown LP2 plaintext, key, author-specified binary readout or continuation was recovered.

## Source and why this finite question is worth asking

The annotated original-source inventory [`lp2-ink-annotations.json`](../resources/liber-primus/lp2-ink-annotations.json) records **18 source-visible red ink spans**, containing **225 GP runes** across the full LP2 pages p0–57 (including red headings on already solved pp56/57). Each span matches the physical-page/runic index array in [`lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json), checked symbol for symbol by the reproducer. The 15×15 geometry was noticed retrospectively; **the manuscript does not tell a player to concatenate all red runes, rasterize them in source order, or use QR**.

This specific geometry, unlike 16×16 or 11×11 page arrangements studied elsewhere, corresponds to a real **Micro QR M3** symbol. DENSO WAVE, the QR code developer, lists M3 as exactly **15×15** and explains that Micro QR has one finder pattern, rather than the three of ordinary QR: [official specification overview](https://www.qrcode.com/en/codes/microqr.html). The historically available [ISO/IEC 18004:2006 specification](https://www.iteh.us/catalog/standards/iso/d059f11e-6d68-42de-817a-477cc7117736/iso-iec-18004-2006) fixes its **7×7** finder as a dark border, light inner border and dark 3×3 center, located at the upper-left corner in a properly oriented symbol. Rotations or reflections of an unknown raster correspond to the four physical corner positions; the symmetric finder does not require separate mirrored bit patterns. Only this **mandatory 49-module finder** is needed for exclusion. No format, timing, ECC or application-content assumptions enter.

## Exact original-cipher impossibility certificate

Index the concatenated original 225 red runes in printed page order, lay them **row-major** into 15 rows of 15, and let `g[r,c]` be the canonical GP rune index at each cell. Give a would-be QR decoder arbitrary secret bits `F[0..28]`, plus arbitrary row bits `R[0..14]` and column bits `C[0..14]`. The candidate visible QR bit is:

`B[r,c] = F[g[r,c]] XOR R[r] XOR C[c]`.

The simple rune-to-bit decoder is the special case with all `R,C = 0`. For **every** choice of these secrets, the following eight original cells form an impossible upper-left finder witness:

| Zero-based row,col | Original GP rune | Required finder bit |
| --- | --- | ---: |
| (1,4) | TH | 0 |
| (1,6) | AE | 1 |
| (2,4) | X | 1 |
| (2,6) | M | 1 |
| (3,2) | TH | 1 |
| (3,3) | AE | 1 |
| (4,2) | X | 1 |
| (4,3) | M | 1 |

Each rune appears **exactly twice**. Each used row and each used column also appears **exactly twice**. XORing the eight generated bits must therefore give **0**, whatever the chosen 29 rune, 15 row and 15 column secrets. Yet the mandatory QR finder target bits have XOR **1**. The eight equations are jointly impossible. That contradiction survives global black/white inversion, because eight constant polarity bits XOR to zero.

A much smaller plain-palette contradiction is already visible: source original cells **(0,1)** and **(1,1)** are both GP rune **H**, while the required finder bits are **1** and **0**.

The standalone CommonJS [original-input SFT](../sims/lp2_red225_microqr_allsecret_finder_sft.cjs) performs exact GF(2) elimination and produces a checkable XOR witness for every corner, with zero fitted secret values:

| Finder's top,left corner in original 15×15 | Minimum contradictory core located by the fixed elimination and shrinking algorithm, rune-only | Rune + arbitrary row + arbitrary column XOR bits |
| --- | ---: | ---: |
| (0,0) | 2 cells | **8 cells** |
| (0,8) | 2 cells | **8 cells** |
| (8,0) | 2 cells | **8 cells** |
| (8,8) | 2 cells | **6 cells** |

The core sizes are the reproducer's inclusion-minimal conflict sets, not an independently proved global minimum. The solver validates each core by XORing variable coefficients to **zero** and required target bits to **one**. It asserts the complete red-rune inventory and all four unsatisfiable corner placements under both decoder families. As positive controls, four synthetic full-size arrays with real 7×7 finder geometry are accepted under each of the two alphabets (**eight satisfiable positive cases**). No research-wide inference is drawn from the initial size match.

## Decision and next useful work

**Exclude only** a literal row-major **15×15 Micro QR M3** encoded by the complete 225 original red runes under either a secret stationary GP rune-to-bit palette or that palette plus separable secret row/column XOR bits, including any rigid 90° rotation or reflection. The source could still carry a different encoding, or a QR after an independently selected nonlocal permutation or stateful word/page codec. The original pages do not supply such a second operation, and adding it solely to rescue the rejected QR would be overfitting.

This exact exclusion concerns a new all-red source geometry. It is separate from the already closed [p32 121-rune M1 finder test](lp2-p32-microqr-finder-allsecret-gate.md) and [p50 8×32 Data Matrix border test](lp2-grid8x32-datamatrix-finder-original-gate.md). The wider Liber Primus plaintext and its key material remain unsolved; further effort should seek an original key/state or an independently instruction-bearing visual handoff rather than another unselected palette.