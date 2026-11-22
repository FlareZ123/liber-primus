# LP2 p50 inner180 as a 30-byte five-of-six Shamir candidate

**Original-input decision (12 November 2026): zero successful predictions, no recovered key or unknown plaintext.** This is a bounded test of a potentially key-producing interpretation.

## Independent source premise

The published 32×8 numerical grid spans physical LP2 pp49–51 and contains exactly 256 conditional base60 byte values. The original p57 PARABLE tells pilgrims to “shed our own circumferences”; physically removing one cell from each outside edge leaves a **30×6 table of 180 original values**. The verified 2013 Cicada continuation contained a **five-of-ten secret sharing stage**. A new possible connection is to interpret the six inner columns as six of those shares, each 30 bytes long. This is a conjectural cross-stage consumer, since no authored instruction assigns the six columns to share IDs or determines the byte field.

If correct in its simplest form, share identities `x=1..6`, with a five-share threshold over GF(256), make the first five printed values on **every one of 30 inner rows** predict the sixth exactly. This is a genuine held-out prediction, unlike an arbitrary polynomial fit through all six points.

## Original test

Test two ordinary GF256 field polynomials `0x11b` and `0x11d`, printed six-column order forward and reversed, and both degree-four and monic-degree-five five-parameter interpolation (the latter follows a separately proposed historical SSSS convention). All eight interpretations use the first five shares to reconstruct each independent row and predict share six; no labels, row order or byte values were fitted to the holdout.

| Field | Fifth-degree term | Forward matches | Reverse matches |
|---|---|---:|---:|
| GF256 / 0x11b | Absent (degree ≤4) | 0/30 | 0/30 |
| GF256 / 0x11b | Fixed monic x⁵ | 0/30 | 0/30 |
| GF256 / 0x11d | Absent (degree ≤4) | 0/30 | 0/30 |
| GF256 / 0x11d | Fixed monic x⁵ | 0/30 | 0/30 |

All eight 30-row planted share arrays pass **30/30** checks each under the identical interpolator, recovering the source-pinned independent sixth share exactly. These checks verify the implementation. With uniform random bytes, 0/30 per candidate is unsurprising and gives no positive evidence about the table's generator. The result rejects these exact share-consumer definitions, leaving other x labels, fields and alternate representations entirely open.

## Implication for decipherment

The visually compelling 76+180 split yields no independently reconstructed 30-byte key in this direct GF256 reading. Other page-level applications of a 30-byte secret cannot be tested without authentic key material. Additional brute-force share-ID assignments would manufacture keys without a source selector; commission them only if original source material fixes x values.

**Reproducer:** [30×6 inner-grid GF256 SFT](../sims/p50_inner180_sixshare_sft.cjs), using the existing [interpolation library](../sims/grid_shamir_rs_inverse.cjs). Source bytes `resources/liber-primus/base60-grid.json`; historic five-of-ten precedent documented in [source partition report](lp2-p50-76-perimeter-180-interior-source-partition.md) and [2013 five-of-ten original p49 test](../sims/lp2_p49_2013_ssss_5of10_original_gate_sft.cjs).
