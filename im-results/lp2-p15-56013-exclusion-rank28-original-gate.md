# Exact original 2013 DATA/560.13 source-pad → 28-choice predecessor-rank inverse

**Agent31, 12 November 2026. Classification: complete original-data, source-offset, reversible 8-model negative with English-native planted positives. No recovered unknown Liber Primus plaintext or actual cipher key.** [Successful GitHub Actions original-file run 43253039317](https://github.com/FlareZ123/liber-primus/actions/runs/43253039317), [original-output JSON artifact](https://github.com/FlareZ123/liber-primus/actions/runs/43253039317/artifacts/13959612607) and [standalone CommonJS test](../sims/lp2_p15_56013_rank28_original_sft.cjs).

## Reason to attempt exactly this decoding

The original page-15 nine-rune upper red title is GP29 digits `[0,1,20,19,24,28,26,22,24]`. As a positional base-29 integer, this is **29,553,734,724 = 3301×8,952,964 + 560**, a previously established unique source alignment to the historical **CicadaOS DATA/560.13** filename stem and a proposed dataset offset. The actual p15 Fibonacci-prime 4×4 square contains 13 but no 0 or 17, conditionally selecting suffix 13 from the three historical file names. The authentic 2013 puzzle used a numbered file, byte offset, and XOR to reveal an onion link; the full original file is 118,818,811 bytes, SHA256 `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f`. These facts and the already negative conventional GP29 additive/XOR/5-bit transfers are preserved in [the earlier p15 DATA source report](lp2-p15-base29-56013-selector-gate.md).

The **distinct** candidate is a previous-ciphertext-exclusion rank encoder over GP29. Unlike direct 29-symbol pad subtraction, it is consistent by construction with a **29-output, 28-successor** stream and can therefore consume a historical file as a 28-value pad while accounting for the ciphertext's exceptional absence of adjacent repetitions. The model itself remains speculative: the authentic sources do not state that Cicada selected a predecessor-exclusion rank encoder, the title's Euclidean quotient as a byte address, or a GP28 key conversion. This is a finite *decoder*, not an author-verified cipher identification.

## Fixed reversible inverse

Apply the exact published byte offset **8,952,964**, source direction forward, to **1,894 original cipher runes** from physical page15 position9 through p22's end, beginning after the nine red-title runes. Set the first local original rune as transmitted output state. At every subsequent position where original `C_i≠C_(i-1)`, invert either of the standard 28-choice output maps:

- **Sorted rank:** `R_i=C_i−[C_i>C_(i−1)]`.
- **Cyclic rank:** `R_i=(C_i−C_(i−1) mod29)−1`.

Convert the exact source byte at the **physical rune position** to a key `K_i` by either `byte mod28` or `floor(28*byte/256)`; decrypt either `P_i=(R_i−K_i) mod28` or `P_i=(R_i+K_i) mod28`. The eight configurations are **2 ranks × 2 byte projections × 2 signs**, with no fit, new offset, remapping or reset. There are exactly **10** original adjacent doublets in this 1,894-rune span; they are counted as unknown/escaped plaintext and do not consume a decoded output position. They **do not shift the byte clock**, which follows absolute original rune positions. The first position is an unconstrained IV, leaving **1,883** fully decoded, nonerased symbols for language assessment. This test cannot decide how any actual cipher might transmit those missing 11 symbols.

## Actual verified result

The manual-only original-data workflow used a GitHub-hosted Windows runner to download the complete 2013 dataset from its historical archive, check both its exact 118,818,811-byte length and pinned SHA-256, and recover the exact authenticated 2013 old-v2 onion link by XORing the historical stage ciphertext at file offset 12,821. It then executed the new eight inverses against the original LP2 corpus.

| Model | Original GP28 IoC |
| --- | ---: |
| Sorted, byte mod28, key subtraction | 0.0358320969 |
| Sorted, byte mod28, key addition | 0.0358563646 |
| Sorted, byte scaled28, key subtraction | 0.0357711455 |
| Sorted, byte scaled28, key addition | 0.0357547789 |
| Cyclic, byte mod28, key subtraction | 0.0356210244 |
| **Cyclic, byte mod28, key addition** | **0.0360200304** |
| Cyclic, byte scaled28, key subtraction | 0.0358682163 |
| Cyclic, byte scaled28, key addition | 0.0355950636 |

Original unkeyed sorted rank IoC is **0.0356475496**. Every candidate lies at the flat 28-way background (1/28≈0.0357143). The strongest original text prefix is `MEONGNMOEAEOIXYLTETHFNGTHIAYSMOEEXMAEIAETHFCEOHYMBAFOENGFUOU`, not English prose.

For every **one of the same eight original source keys/mappings**, the SFT encrypts an independent first-1,894-GP-rune native Shakespeare control using the real historical source pad. It forces the **ten actual LP2 doublet positions** to repeat the previous ciphertext rune, then inverses with only the declaration, file and ciphertext. All eight recover **1,883 / 1,883** original nonerased GP28 plaintext indices exactly, with native GP28 IoC **0.0632861957**. The 11 other symbols (ten intentional erasures plus the transmitted initial state) are excluded from the GP28 ranking, rather than spuriously credited as deciphered.

The full run returned **success** at [CI run 43253039317](https://github.com/FlareZ123/liber-primus/actions/runs/43253039317), and an 8-row original/control JSON artifact was saved as [artifact 13959612607](https://github.com/FlareZ123/liber-primus/actions/runs/43253039317/artifacts/13959612607).

## Research decision

**Retire the historical 2013 `DATA/560.13` source-pad at page15's exact source-derived offset as a literal mod28/scaled28 key for the two standard 28-way preceding-ciphertext exclusion-rank ciphers.** The entire fixed family fails on 1,883 original ciphertext symbols while its true-key native-English plants succeed. This is not a rejection of all possible 28-way encoders, all possible source file consumers, an unknown source selected bit packing, or a second cryptographic layer.

Do not search nearby byte offsets or additional bespoke rank mappings on the strength of this negative. A genuinely new primary-source instruction would need to determine another reversible, original-input cipher or authenticate a separate plaintext source before spending the historical-file budget again.
