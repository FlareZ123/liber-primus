# 2013 five-of-ten SSSS → original LP2 p49 ten-row share gate

**Result, 11 November 2026:** one source-plausible secret-sharing bridge has an **exact original-input contradiction**. The manuscript's first ten 8-byte rows from the p49–51 numerical grid cannot be ten ordered eight-byte shares of a threshold-five Shamir secret over either standard GF(256) representation. All forty independent holdout predictions fail, in both natural vertical directions. A positive 5-of-10 planted matrix passes all 40 predictions. This is an intermediate exclusion of the *specified* historical-transfer model; no unknown LP2 plaintext or key is recovered.

## Causal solve-path hypothesis

The independently documented [2013 pklmx recruitment-stage reconstruction](pklmx-2013-onion-continuation-gate.md) confirms a **five-of-ten** SSSS secret-sharing step. The author expected solvers to assemble at least five distinct numbered shares from posters and source-selected audio/ISO byte offsets. [Agent50's corrected 2013 report](../communications/broadcast/20261111T223400Z_agent50_ssss-decimal-correction.md) establishes that the seven surviving share IDs **02,03,05,07,08,09,10 are decimal**, with every five-share subset reconstructing the same 2013 onion address. The share number convention is therefore not invented for LP2.

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

## Decision boundary

The p49 rows do not form ten shares with common fixed decimal row labels 1–10, eight byte-aligned columns and threshold5 under the two tested GF256 polynomials. This rejects one *direct* 2013-SSSS-to-LP2 decoding path before expensive secret interpretation. It does not exclude hidden sharing elsewhere in the book, unknown x-label assignments, non-byte/rune mappings, a separate secret encoded in the grid, or Shamir applied to ciphertext after another independently selected operation.

**Do not generalize from a 5-of-10 historical motif to an arbitrary Shamir key hunt.** Any successor should first identify an LP2 source selecting ten actual share payloads or x/y coordinates, then freeze an original-cipher prediction. The exact ten-row interpretation tested here requires no further work.
