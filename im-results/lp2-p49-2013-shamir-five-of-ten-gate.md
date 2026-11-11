# 2013 five-of-ten SSSS → LP2 numeric table sharing gates

**Result, 11 November 2026:** one source-plausible secret-sharing bridge has an **exact original-input contradiction**. The manuscript's first ten 8-byte rows from the p49–51 numerical grid cannot be ten ordered eight-byte shares of a threshold-five Shamir secret over either standard GF(256) representation. All forty independent holdout predictions fail, in both natural vertical directions. A positive 5-of-10 planted matrix passes all 40 predictions. A second, *historically faithful GF(2^176)* necessary-condition test also rejects the natural contiguous 22-byte packing of the full 256-byte table into ten shares, under both source-end alignments and both directions. Neither source-constrained model provides a key. This is an intermediate exclusion of the *specified* historical-transfer model; no unknown LP2 plaintext or key is recovered.

## Causal solve-path hypothesis

The independently documented [2013 pklmx recruitment-stage reconstruction](pklmx-2013-onion-continuation-gate.md) confirms a **five-of-ten** SSSS secret-sharing step. **That historical implementation actually shares a 22-byte secret in GF(2^176), with a specified irreducible polynomial and a diffusion step; it is not an eight-column GF256 implementation.** The eight-column model tested below is deliberately a simplified structural analogue motivated by the visible p49 eight-byte width. It must not be called an exact replay of the original ssss 0.5 code. The author expected solvers to assemble at least five distinct numbered shares from posters and source-selected audio/ISO byte offsets. [Agent50's corrected 2013 report](../communications/broadcast/20261111T223400Z_agent50_ssss-decimal-correction.md) establishes that the seven surviving share IDs **02,03,05,07,08,09,10 are decimal**, with every five-share subset reconstructing the same 2013 onion address. The share number convention is therefore not invented for LP2.

The first physical portion of the original 32×8 LP2 radix-60 numerical table is **exactly ten rows of eight cells**, printed on LP2 p49 / combined scan66.jpg. Later portions print 13 rows (p50) and nine rows (p51). The exact ten-row source boundary is visible without decrypting any unknown text. The final solved p57 *PARABLE* echoes 2013's *Instar Emergence* language, and source-visible terminal dots have prompted a separate tentative five-of-ten association; both are motivations, not independent proof of encoded shares.

A solver could therefore try interpreting the ten source rows as public decimal-numbered shares `x=1..10`, one per row, with each of the eight columns an independently shared byte. Five rows fix the degree-at-most-four polynomial in each column. The next five rows provide a stringent **40-byte check before interpreting or decrypting anything**. The choice of row order is the only natural orientation ambiguity.

## Exact experiment

Read only `resources/liber-primus/base60-grid.json`, which preserves the source-ordered canonical p49 ten rows, and use the existing verified finite-field interpolation implementation `sims/grid_shamir_rs_inverse.cjs`. Freeze decimal share coordinates 1–10, threshold5, eight source columns and the first five original rows as reconstruction input. Predict all five remaining original rows. The test evaluates **GF(256)/0x11b** (AES basis) and **GF(256)/0x11d** (common RS basis), top-to-bottom and bottom-to-top. Column reversal cannot change match counts, since columns are independent and all eight are evaluated.

| Field | Ten-row direction | Original exact holdouts | Independent planted positive control |
| --- | --- | ---: | ---: |
| GF256 / 0x11b | Top to bottom | **0 / 40** | 40 / 40 |
| GF256 / 0x11b | Bottom to top | **0 / 40** | 40 / 40 |
| GF256 / 0x11d | Top to bottom | **0 / 40** | 40 / 40 |
| GF256 / 0x11d | Bottom to top | **0 / 40** | 40 / 40 |

For example, in the printed forward ordering, source row six (zero-based row5) is `[80,84,28,73,230,107,199,76]`. The polynomial fixed by rows1–5 predicts `[146,121,19,218,194,156,95,96]` under 0x11b, failing in **every byte column**. Under 0x11d it predicts `[146,127,21,220,194,154,89,96]`, again entirely different. These discrepancies do not require an English scorer or a key fit.

Reproducer: [`sims/lp2_p49_2013_ssss_5of10_original_gate_sft.cjs`](../sims/lp2_p49_2013_ssss_5of10_original_gate_sft.cjs), Node22 CommonJS, including exact regression assertions and a planted quartic-share generator. Its fixed source matches are independent of any unknown-page language reading.

## Exact 2013 GF(2^176) packed-share extension

The actual 2013 `ssss` 0.5 shares contain **22 bytes** each, evaluated on a monic degree-five polynomial over **GF(2^176)**, with the irreducible polynomial `x^176 + x^11 + x^3 + x^2 + 1` and an additional invertible XTEA-based secret diffusion. The physical numeric table instead supplies **256 bytes**. A direct source-ordered packing into ten historical-format 22-byte shares consumes 220 bytes and leaves 36 unaccounted bytes. Although there is **no independent instruction to discard 36 bytes**, the two endpoint-aligned packings are natural finite candidates to reject before searching for hidden share arrangements.

The [original-field SFT](../sims/lp2_p50_2013_ssss_gf176_sharepack_sft.py) reuses the exact GF(2^176) multiplication, exponentiation, polynomial evaluation and inversion implemented in the project's independently verified [2013 SSSS reconstruction](../sims/2013_pklmx_reproduce.py). For share IDs1..10, the original five `y(1)..y(5)` uniquely determine the adjusted quartic `y(x) XOR x^5` and hence predict all five remaining 22-byte share values. Because the XTEA diffusion applies to the reconstructed secret rather than the public share-polynomial constraints, it cannot repair a failed share prediction.

| Full-table 220-byte packing | Direction | Exact predicted share matches | Matching bits / 880 |
| --- | --- | ---: | ---: |
| First 220 bytes | Forward | **0 / 5** | 418 |
| First 220 bytes | Reverse | **0 / 5** | 438 |
| Last 220 bytes | Forward | **0 / 5** | 455 |
| Last 220 bytes | Reverse | **0 / 5** | 425 |
| Synthetic degree-five monic control | Correct decimal order | **5 / 5** | 880 |

The source table's 256-byte SHA256 is frozen as `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. This extension is more faithful to the *historical* 2013 implementation than the separate eight-column GF256 structural analogue, but requires an **additional hypothetical 220-of-256 packing**. It excludes only these natural endpoint packings. Other packing schemes should require independent instructions before further compute.

## Decision boundary

The p49 rows do not form ten shares with common fixed decimal row labels 1–10, eight byte-aligned columns and threshold5 under the two tested GF256 polynomials. **This result does not test the actual historical GF(2^176)/XTEA-diffused ssss 0.5 wire format**; p49's eight-byte row width does not even match that historical 22-byte share width without an independent source-specified packing scheme. This rejects one *direct* 2013-SSSS-to-LP2 decoding path before expensive secret interpretation. It does not exclude hidden sharing elsewhere in the book, unknown x-label assignments, non-byte/rune mappings, a separate secret encoded in the grid, or Shamir applied to ciphertext after another independently selected operation.

The historical GF(2^176) model likewise fails for the specified first/last 220-byte original-table spans, without assuming a plaintext, guessing keys, or fitting the last five shares. This is a direct original-input negative, not a universal Shamir impossibility proof.

**Do not generalize from a 5-of-10 historical motif to an arbitrary Shamir key hunt.** Any successor should first identify an LP2 source selecting ten actual share payloads or x/y coordinates, then freeze an original-cipher prediction. The exact ten-row interpretation tested here requires no further work.
