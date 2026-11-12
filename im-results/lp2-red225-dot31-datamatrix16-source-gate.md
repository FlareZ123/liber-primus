# The 225 original red runes and 31 thirteen-dot marks as a 16×16 ECC200 symbol

**Original-source structural candidate, exact static-binary negative.** The ink annotations register **225 red runes**, and **31 occurrences of the same 13-dot punctuation mark** (30 red and one black). Their counts are precisely `15²` and `2×16−1`. A **16×16 Data Matrix ECC200** has 31 cells in its solid L-shaped left/bottom finder and 225 other cells, including **29 alternating timing modules** along its top/right border. That final count also equals the size of the Gematria Primus rune alphabet. This furnishes a period-compatible, whole-artifact *candidate* operation requiring no dropped red characters. However, the original page does not instruct one to collect red ink from all 58 LP2 pages or to place it in a barcode. The source-count correspondence alone is not authorial proof.

## The exact proposed consumer

Read every red rune in published LP2 physical page order, including headings on already-solved pages, and preserve their source identities and 29 GP indices. Record each of the 31 original 13-dot glyphs as an individual separate event; the black and red marks on p7 at the same offset are distinct, as printed. Place these 31 identical marker events on the 16×16 solid bottom and left finder positions. Place all **225 runes** in the remaining **15×15** cells, with original source ordering. The 16×16 format is a standard ECC200 square symbol with one **14×14** data region (12 data codewords and 12 error-correction codewords). Its mandatory timing modules are the **15 top cells except the left corner** and **14 right cells except the two corners**.

For each candidate placement, ask whether an arbitrary single unknown function `b:GP29→{0,1}` could make all **29 fixed alternating timing modules** correct. This is an *all-secret* exact necessary-condition test: for each rune type, count required dark and light sites and choose whichever bit minimizes its errors. The sum of minority counts is a global lower bound on finder repairs under all `2^29` fixed binary rune alphabets. No language or statistical fitting is involved.

The canonical placements are row-major, row-serpentine, column-major and column-serpentine, each with either manuscript rune order or complete reversal. A fifth is the center-start clockwise square spiral (right, down, left, up) drawn on original p15, included as an independent source-visible traversal but **not an authenticated instruction to apply it to this red channel**. The physical ECC200 finder is kept in the standard orientation. Swapping column- and row-major with reversed source already covers mirrored arrangements of the 15×15 rune square.

| Rune placement | Source order: exact min timing mismatches | Reversed rune order: exact min timing mismatches |
| --- | ---: | ---: |
| Row-major | 5 | 6 |
| Row-serpentine | 4 | 6 |
| Column-major | 6 | 5 |
| Column-serpentine | 6 | 4 |
| Center-start p15-style clockwise spiral | 7 | **3** |

**Every placement is impossible under any *static* unknown GP29-to-bit map.** This is stronger than testing GP index parity: parity produces at least **16** wrong mandatory timing modules across these source placements. The lowest three-error case occurs only with **reversed** chronological runes on the p15-inspired spiral; conflicting GP indices **3, 5, and 11** each need to be simultaneously dark and light. No choice of the 29 secret lookup bits repairs those contradictory demands. Each lower bound comes from just 29 of the 225 red-bearing cells; Reed–Solomon parity and interior content are left unrestricted.

The source-exact [standalone Node.js SFT](../sims/lp2_red225_13dot31_datamatrix16_sft.cjs) validates every red glyph against the full canonical LP2 rune positions and asserts the annotated counts of 225/31; constructs all ten placements and their timing; computes the all-secret minimum conflict count; and uses a 225-cell native-shaped synthetic positive with correct timing (**zero errors**) plus a deliberate incorrect-source negative (**one error**). This is a *finder necessary-condition plant*, not an attempt to simulate the whole ECC200 message payload.

## Decision and scope

The numerical **225+31=256** source match deserves preservation as a potential human-visible 16×16 coding hint. It has a stronger artifact-specific mathematical interpretation than its earlier bare equality to the 256-cell numeric table: the 31 marks become a conventional complete solid-L finder, and the 225 remaining rune symbols are the full other-cell set. But it does **not** yield a direct bitstream, decoded address, original LP2 plaintext, key or proven authorial layout. Retire direct static single-GP-rune bit assignments in the ten source-visible orders. A cipher layer, position-dependent palette or genuinely source-selected permutation would be a different mechanism and requires its own independent clue. Do not expand this into unconstrained barcode-order or bit-alphabet searches.

Earlier [80×80 ECC200 exclusion](lp2-datamatrix-80x80-secret-bit-gate.md) concerns a different 6,395-rune terminal matrix. The separate [32×8→8×32 direct numerical-grid test](lp2-grid8x32-datamatrix-finder-original-gate.md) concerns the *other* 256-cell object and independently excludes static byte-based finder coding.
