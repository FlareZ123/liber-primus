# Stage10 magic-square matrices on exact five- and seven-page LP2 chapters

**Decision (23 November 2026, Agent39):** A source-visible geometric candidate has a complete, mechanically reversible original-cipher receiver, but its direct GP29 matrix inversion fails to produce plausible natural-language plaintext. It supplies no authentic key or next-step instruction and should not be expanded into arbitrary phase/permutation scans.

## Independently observable inputs

The source-canonical p0–p55 nine chapter rune totals are 729, 1145, 1729, 1903, 1021, 1433, 1680, 3008 and 308. The first four happen to divide exactly by 3, 5, 7 and 11 respectively: 3×243, **5×229**, **7×247**, 11×173. The p3–p7 scroll physically spans five pages and has 1,145 runes; the p8–p14 illustrated-tree chapter spans seven pages and has 1,729 runes. The contemporaneous 2014 Stage10 OpenPuff artifact contains an actual **5×5 square with sum 3301** and an actual **7×7 square with sum 1033**. These are historically recognizable operations a 2014 participant could know, and the dimensions allow a full reversible GP29 block operation with zero padding.

The prime divisibility was observed retrospectively. Divisibility does not by itself prove intentional layout, and original page art does not print an instruction to multiply GP29 rune vectors by the historical matrices. These are **hypotheses about an intended operation**, not established solver directions.

Sources: `resources/liber-primus/lp2-corpus.json`, original scans `resources/liber-primus/20.jpg`–`31.jpg` (LP2 p3–p14), `resources/cicada2014-openpuff-magic-squares.txt`.

## Complete original-cipher experiment

Read both source matrices over GF(29), invert using Gaussian elimination, and apply each of `M`, `M⁻¹`, `Mᵀ` and `(M⁻¹)ᵀ`. Two geometric receivers are frozen: consecutive five/seven-rune packets, and row-wise strips formed by slicing the entire chapter into five strips of 229 or seven strips of 247 runes, then transforming corresponding column positions. Both retain **every one of the original ciphertext runes**, in its exact chapter position. Each of the **16 complete decoders** exactly re-encrypts the original ciphertext; each also correctly recovers an independently planted 1,145- or 1,729-rune native GP29 sequence drawn from genuinely solved p57 (with plaintext much longer than the source, repeated only as a synthetic positive).

| Original receiver | Decoder direction | GP29 IoC |
|---|---|---:|
| p3–p7, packets | M / M⁻¹ / Mᵀ / (M⁻¹)ᵀ | 0.03447 / 0.03424 / 0.03474 / 0.03471 |
| p3–p7, strips | M / M⁻¹ / Mᵀ / (M⁻¹)ᵀ | 0.034238 / 0.034434 / 0.034443 / 0.034362 |
| p8–p14, packets | M / M⁻¹ / Mᵀ / (M⁻¹)ᵀ | 0.03450 / 0.03446 / 0.03441 / 0.03454 |
| p8–p14, strips | M / M⁻¹ / Mᵀ / (M⁻¹)ᵀ | 0.035161 / 0.034558 / 0.034357 / 0.034511 |

The best IoC is **0.035161**; all outputs remain ciphertext-like with no coherent English. The genuinely solved p57 source-native plaintext IoC is approximately 0.06271, so neither chapter has an evident long direct-language recovery.

**Reproducer:** `sims/lp2_primechapter_stage10_magic_original_sft.cjs`. Read-only CommonJS Node22 source-native SFT, with exactly 16 full original roundtrips, 16 long synthetic native positive controls, and all 16 measured IoCs.

## Scope and next decision

This retires only **direct** GF29 2014 historical 5×5 / 7×7 full-chapter matrix multiplication under the two natural source geometries and four matrix orientations. A word-state machine, a cipher whose word boundaries change, an unknown authored key or a nonnative plaintext register remains compatible with this negative. The 2014 squares have no authenticated operator telling a solver to consume p3–p14 ciphertext, so arbitrary block rotations, column shifts, extra arithmetic wraps or hidden 29! alphabets would be new unfounded choices. Concentrate on an independently readable **operator or key** before retesting these chapter lengths. Prior #2302 tested distinct polynomial-of-square operators on p8–p14; #2263 tested distinct nonlinear five-lane shears on p3–p7; this document supplies the direct historical-matrix receivers rather than repeating those models.
