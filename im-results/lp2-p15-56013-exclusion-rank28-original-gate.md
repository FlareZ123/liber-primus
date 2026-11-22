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


## Binary-envelope continuation of the exact source-pad inverse

**Agent31, 12 November 2026, completed original-file run 43265160528.** The original 2013 CicadaOS workflow used actual binary pad files. A failed GP28 prose score alone therefore leaves a distinct, source-motivated possibility: the same predecessor-exclusion inverse might carry an ordinary *binary* file serialized as one big-endian base-28 integer, rather than natural-language GP runes. No new source offset, rank alphabet or decryption key is introduced.

The [read-only complete test](../sims/lp2_p15_56013_rank28_binary_envelope_sft.cjs) keeps the identical original 1,894-rune p15:9–p22:end register, original 8,952,964-byte DATA/560.13 offset, two sorted/cyclic predecessor rank conventions, two fixed pad-byte projections (byte modulo28 and floor(28×byte/256)), and two original additive signs: **eight unchanged decoders**. Treat the first rune as the transmitted GP29 register state and the next 1,893 positions as a 28-ary integer. At the ten source-visible adjacent-doublet positions, a rank decoder cannot know the underlying 28-ary digit. Instead of guessing them, compute the *exact minimum and maximum possible binary integers* by replacing each unknown digit with 0 and 27. Their shared leading bytes are guaranteed independent of all ten missing digits. No fitted erasures, bit offsets, phase changes or other binary packing variants enter this finite test.

All eight original inverses produce **1,138-byte** unsigned big-endian representations and share **143–144 guaranteed leading bytes** between their erasure extremes. That is much more than required to identify a conventional file header. The original **first eight header bytes** for the frozen candidate order are:

| Rank / pad projection | Decode − key | Decode + key |
| --- | --- | --- |
| Sorted / mod28 | 0e461795bd3d9775 | 08351de5bd229bac |
| Sorted / scaled28 | 094251b7e6cf6780 | 0d3f30f138c9b908 |
| Cyclic / mod28 | 13f8eca5faa82bc4 | 0de7f2f5fa52f19d |
| Cyclic / scaled28 | 0ef5628776329b98 | 12ebb8d3d71ff488 |

**Zero of eight** has the pinned byte-zero signature of PDF, PNG, ZIP, gzip, JPEG, bzip2, xz, Zstandard, SQLite, armored OpenPGP, or a valid zlib wrapper. This is an exact file-header negative at the source-fixed binary framing. It does not exclude undocumented magic-less data, a different binary codec, or encrypted/compressed content without the named headers.

As an independently constructed, source-shaped positive control, encode a full **1,136-byte** buffer beginning with the PDF-1.7 signature into the exact 1,893-position GP28 base-integer representation, encrypt using each of the eight *actual DATA-derived* keys and predecessor-excluding successor rules, and overwrite precisely the **ten original adjacent-doublet locations** with equal predecessor glyphs. All eight decoders recover every unmasked true rank and provably retain **141 shared leading file bytes**, including the exact PDF-1.7 header, without any supplied erasure values. The test also verifies the 118,818,811-byte original source SHA-256 and decodes the genuine 2013 onion-message XOR control before LP2 evaluation. These controls establish detection power for a conventional file header despite the ten repeated-rune erasures.

Successful [manual-only Windows Actions run 43265160528](https://github.com/FlareZ123/liber-primus/actions/runs/43265160528) stores both the earlier GP28 prose and new original binary-envelope results in [artifact 13964788908](https://github.com/FlareZ123/liber-primus/actions/runs/43265160528/artifacts/13964788908).

**Updated bounded decision:** at the p15 heading's exact 2013 source-file offset, the two standard rank28 inverses fail both direct GP28 prose recovery and this one literal BASE28-as-binary-file serialization. The candidate historical file/offset remains authentic source material plus a proposed, unproven LP2 link. A further consumer should be selected from a fresh original instruction, rather than another speculative binary framing or fitted pad phase.

## Research decision

**Retire the historical 2013 `DATA/560.13` source-pad at page15's exact source-derived offset as a literal mod28/scaled28 key for the two standard 28-way preceding-ciphertext exclusion-rank ciphers.** The entire fixed family fails on 1,883 original ciphertext symbols while its true-key native-English plants succeed. This is not a rejection of all possible 28-way encoders, all possible source file consumers, an unknown source selected bit packing, or a second cryptographic layer.

Do not search nearby byte offsets or additional bespoke rank mappings on the strength of this negative. A genuinely new primary-source instruction would need to determine another reversible, original-input cipher or authenticate a separate plaintext source before spending the historical-file budget again.
