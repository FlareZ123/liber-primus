# Floral five-dot ink mask as a conditional p50 grid-row selector

**Agent 7, 18 November 2026. Classification: original-image morphology and a narrow negative cipher inversion.** The original p40–55 floral stencil contains two pale outlined dots on the left and eight completely inked dots across both margins. A top-clockwise binary interpretation of each five-position cluster gives `01101` (13) on the left and `11111` (31) on the right. The original p49–51 table has **32 rows of eight cells**. This makes two literal row addresses available, although **the source never instructs binary reading, row selection or an additive cipher**. Testing both rows as eight-rune GP29 pads recovers no unknown text.

## Direct original-image observation

In original `67.jpg` (physical LP2 p50), the five left-branch dots form a roughly pentagonal cluster. At original 2400×3600 pixel resolution, use the five sites in physical **top → upper right → lower right → lower left → upper left** order:

| Cluster | Original-pixel centers in that geometric order | Source ink | As bits | Base-2 value |
| --- | --- | --- | --- | ---: |
| Left | (398,1475), (425,1500), (421,1534), (380,1542), (367,1500) | outlined, filled, filled, outlined, filled | `01101` | **13** |
| Right | (2003,1475), (2034,1495), (2021,1536), (1980,1534), (1975,1497) | filled, filled, filled, filled, filled | `11111` | **31** |

The two left open sites have bright central 11×11 pixel patches (zero pixels below grayscale128). Their faint circular outlines remain visible at a radius of about ten pixels; the other eight filled sites have at least 100 dark pixels out of 121 in their same-sized center patches. These are actual faint **ring outlines**, rather than completely absent dot locations. An independent full-pixel comparison already established that the floral margins are identical on **every one of the sixteen original p40–55 pages**: [shared stencil](lp2-reused-ornament-source-raster-identity.md) and [exact border](lp2-floral16-identical-margins-source-gate.md). The new observation concerns the *within-stencil dot fill state*, not a page-specific watermark. The source-image reproducer asserts all ten observed dot states on all sixteen pages.

**Human-path hypothesis:** the symmetric clusters have five positions each, the page's 32-row numeric table requires five bits for an address, and a normal top-clockwise reading needs no freely chosen dot ordering. It is therefore cheap to test the two directly printed five-bit values as row indices. This is still **post-observation source interpretation**: the right all-filled pentagon might be purely decorative, and no signed message commands binary conversion. The two marks occur identically on all p40–55 pages, so they cannot alone distinguish page-specific keys.

## Exact source-to-cipher candidate

The working table transcription is `resources/liber-primus/base60-grid.json`. Its physical 32×8 structure is directly visible in `66.jpg`–`68.jpg`; the base60-to-byte interpretation is an existing, independently qualified convention. The two original printed rows are:

| Zero-based row | Eight published tokens | Eight existing base60 byte values | Byte residues mod29 |
| --- | --- | --- | --- |
| 13 | `22 13 0V 3c 0E 34 0W 1t` | 122, 63, 31, 218, 14, 184, 32, 115 | 6, 5, 2, 15, 14, 10, 3, 28 |
| 31 | final physical row | 113, 158, 172, 230, 180, 36, 189, 80 | 26, 13, 27, 27, 6, 7, 15, 22 |

The **narrow, invertible consumer** is `P[i] = (C[i] ± byte_rows[r][i mod 8]) mod 29`, with `i=0` at the first original p55 rune and either source-addressed row `r∈{13,31}`. Applying the same direct eight-symbol cycle to all floral-chapter ciphertext p40–55 from p40 local zero is a second, independently fixed output check, not a fitted phase. All original rune symbols, including F, consume a key step. No rescue shifts, arbitrary byte order, p56 carry, reverse-column read or second cipher are introduced.

| Fixed GP29 inverse | Original p55 76-rune IoC | Entire p40–55 3,316-rune IoC |
| --- | ---: | ---: |
| Unmodified ciphertext | 0.037894737 | 0.034462827 |
| Row13, subtract | **0.037543860** | **0.034492847** |
| Row13, add | **0.040350877** | **0.034434262** |
| Row31, subtract | **0.042456140** | **0.034557982** |
| Row31, add | **0.032982456** | **0.034500852** |

All four complete-chapter values remain near the uniform 29-rune IoC of 1/29 = 0.034482759. The strongest 76-rune value, 0.042456, is still below the minimum 0.045614 seen in the project's independently corrected native-GP LP1 76-rune control windows, an illustrative finite comparator rather than a universal linguistic threshold. The row31 subtract candidate begins `A-EO-NG-EO-U-H-TH-NG-OE-TH-X-H-B-A-I-W-U-J-M-W-A-F-E-A-TH-T-T-EO-P-D`, not a coherent GP-language continuation. The other three first30 original readouts are preserved by the reproducer. None recovers unknown plaintext.

**Controls and reproducibility:** the [single-file Python/Pillow test](../sims/lp2_floral_dot_rows_original_sft.py) asserts the ink mask on all sixteen original JPEGs, checks the exact two source rows, verifies all 76 original p55 and 3,316 original floral ciphertext indices, and prints every candidate output. The exact [Windows Python 3.12 / Pillow 11.3.0 source run](https://github.com/FlareZ123/liber-primus/actions/runs/44239483664) **passed** with all sixteen original JPEGs and the actual corpus. For each row/sign convention it uses the first 76 authentic clear p57 GP runes as a positive encryption/decryption plant and reconstructs the complete original p55 source on re-encryption. The read-only test requires only the repository's already archived images, table, corpus and Pillow.

## Research decision

The left **three solid/two pale outlined** motif is a reproducible source detail that was not called out in the existing pixel-identity reports. **Do not treat row13 or row31 as an authenticated key address yet.** The only source-shaped direct repeated-row GP29 inverses are negative on both the terminal p55 and the entire floral chapter. Any new row-based consumer needs independent evidence selecting a binary readout *and* a value-changing operation, with a withheld plaintext consequence. The fixed ornament is a possible static cue, not a per-page signal, and supplies no solved unknown page on its own.
